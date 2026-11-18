<?php
/**
 * Connector Bridge
 *
 * Reads WordPress 7.0+ Connectors (Settings > Connectors) so a provider the
 * site owner already configured there is reused instead of asking for the same
 * API key a second time.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

defined( 'ABSPATH' ) || exit;

/**
 * ConnectorBridge class.
 *
 * Everything here degrades to "no connector" on WordPress versions without the
 * Connectors API, so the plugin's own key storage stays the working path there.
 *
 * Two levels of detection, deliberately kept apart:
 *
 * - `has_credential()` is free — it only asks whether a credential exists in an
 *   environment variable, a constant, or the option core registered for the
 *   connector. Safe to call on any request.
 * - `is_connected()` is authoritative but costs an HTTP round trip, because
 *   core answers it by listing the provider's models. It is cached in a
 *   transient and never runs at all unless `has_credential()` already passed.
 */
class ConnectorBridge {

	/**
	 * Maps this plugin's provider slugs onto core connector IDs.
	 *
	 * Only the Gemini slug differs: core names Google's connector after the
	 * company ('google'), this plugin after the model family ('gemini'). An
	 * empty value means core ships no connector for that provider, so it stays
	 * on the plugin's own key storage.
	 *
	 * @var array<string, string>
	 */
	const PROVIDER_CONNECTORS = array(
		'openai'    => 'openai',
		'anthropic' => 'anthropic',
		'gemini'    => 'google',
		'groq'      => '',
	);

	/**
	 * This WordPress has no Connectors API, or the site disabled AI entirely.
	 */
	const STATUS_UNSUPPORTED = 'unsupported';

	/**
	 * Connectors exist, but none is registered for this provider.
	 */
	const STATUS_UNAVAILABLE = 'unavailable';

	/**
	 * A connector is registered for this provider, but holds no usable credential.
	 */
	const STATUS_DISCONNECTED = 'disconnected';

	/**
	 * The provider is configured through Connectors and ready to use.
	 */
	const STATUS_CONNECTED = 'connected';

	/**
	 * Transient prefix for the cached connection probe.
	 */
	const STATUS_TRANSIENT_PREFIX = 'sptp_ai_connector_status_';

	/**
	 * Transient prefix for the cached model list.
	 */
	const MODELS_TRANSIENT_PREFIX = 'sptp_ai_connector_models_';

	/**
	 * How long a connection probe is trusted. Short enough that revoking a key
	 * in Connectors shows up quickly, long enough that opening the block editor
	 * repeatedly does not re-probe every time.
	 */
	const STATUS_TTL = 15 * MINUTE_IN_SECONDS;

	/**
	 * How long a provider's model list is trusted. Model catalogs change on the
	 * order of weeks, so this is cached far longer than the connection probe.
	 */
	const MODELS_TTL = 12 * HOUR_IN_SECONDS;

	/**
	 * How long an *empty* model list is trusted.
	 *
	 * An empty result is as likely to be a transient registry failure as a real
	 * answer, and a cached empty list is what decides a model id is no longer
	 * saveable. Caching that for MODELS_TTL would let one failed lookup reject
	 * the user's chosen model for half a day, so failure is only ever cached
	 * long enough to avoid hammering.
	 */
	const MODELS_EMPTY_TTL = 5 * MINUTE_IN_SECONDS;

	/**
	 * Option name prefix core uses for AI connector API keys by default.
	 *
	 * Only a fallback: a connector may register any `setting_name` it likes, so
	 * cache invalidation matches registered setting names first and falls back
	 * to this prefix when the registry is not up yet.
	 */
	const OPTION_PREFIX = 'connectors_ai_';

	/**
	 * Register the hooks that keep the cached connector state honest.
	 *
	 * Without these, connecting a provider in Settings > Connectors would take
	 * up to STATUS_TTL to show up here, and deactivating the provider plugin
	 * would leave this plugin offering a provider it can no longer reach.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'added_option', array( __CLASS__, 'maybe_flush_for_option' ) );
		add_action( 'updated_option', array( __CLASS__, 'maybe_flush_for_option' ) );
		add_action( 'deleted_option', array( __CLASS__, 'maybe_flush_for_option' ) );
		add_action( 'activated_plugin', array( __CLASS__, 'flush_all' ) );
		add_action( 'deactivated_plugin', array( __CLASS__, 'flush_all' ) );
	}

	/**
	 * Clear cached state when a connector credential option changes.
	 *
	 * A connector declares its own `setting_name`, which core only defaults to
	 * the `connectors_ai_*` shape. Matching the registered names is what keeps
	 * a rotated key on a custom-named connector from leaving a stale verdict
	 * cached here; the prefix is the fallback for an option written before the
	 * registry is up.
	 *
	 * @param string $option Option name that changed.
	 * @return void
	 */
	public static function maybe_flush_for_option( $option ): void {
		if ( ! is_string( $option ) || '' === $option ) {
			return;
		}

		if ( in_array( $option, self::credential_option_names(), true ) || 0 === strpos( $option, self::OPTION_PREFIX ) ) {
			self::flush_cache();
		}
	}

	/**
	 * Option names the providers this plugin maps store their credentials in.
	 *
	 * @return string[] Registered setting names.
	 */
	private static function credential_option_names(): array {
		$names = array();

		foreach ( array_keys( self::PROVIDER_CONNECTORS ) as $provider ) {
			$connector = self::get_connector( $provider );
			if ( null === $connector ) {
				continue;
			}

			$setting_name = (string) ( $connector['authentication']['setting_name'] ?? '' );
			if ( '' !== $setting_name ) {
				$names[] = $setting_name;
			}
		}

		return $names;
	}

	/**
	 * Clear cached state for every provider, ignoring any hook arguments.
	 *
	 * @return void
	 */
	public static function flush_all(): void {
		self::flush_cache();
	}

	/**
	 * Whether the site allows AI features at all.
	 *
	 * Site owners can switch AI off with the `WP_AI_SUPPORT` constant or the
	 * `wp_supports_ai` filter; that answer covers this plugin's own HTTP path
	 * too, not just the core client. Older WordPress has no such switch, so
	 * everything is allowed there.
	 *
	 * @return bool True when AI features may run.
	 */
	public static function site_allows_ai(): bool {
		if ( ! function_exists( 'wp_supports_ai' ) ) {
			return true;
		}

		return wp_supports_ai();
	}

	/**
	 * Whether this WordPress can serve provider credentials through Connectors.
	 *
	 * @return bool True when both the Connectors API and the AI client are present and AI is allowed.
	 */
	public static function is_supported(): bool {
		return function_exists( 'wp_get_connector' )
			&& function_exists( 'wp_ai_client_prompt' )
			&& self::site_allows_ai();
	}

	/**
	 * Get the core connector ID for one of this plugin's provider slugs.
	 *
	 * @param string $provider Plugin provider slug.
	 * @return string Core connector ID, or empty string when core has none.
	 */
	public static function connector_id( string $provider ): string {
		return self::PROVIDER_CONNECTORS[ $provider ] ?? '';
	}

	/**
	 * Get the registered connector definition for a provider.
	 *
	 * @param string $provider Plugin provider slug.
	 * @return array|null Connector data as returned by `wp_get_connector()`, or null.
	 */
	public static function get_connector( string $provider ): ?array {
		if ( ! self::is_supported() ) {
			return null;
		}

		$connector_id = self::connector_id( $provider );
		if ( '' === $connector_id ) {
			return null;
		}

		$connector = wp_get_connector( $connector_id );
		if ( ! is_array( $connector ) || 'ai_provider' !== ( $connector['type'] ?? '' ) ) {
			return null;
		}

		return $connector;
	}

	/**
	 * Whether a connector is registered for this provider.
	 *
	 * @param string $provider Plugin provider slug.
	 * @return bool True when core knows this provider.
	 */
	public static function is_registered( string $provider ): bool {
		return null !== self::get_connector( $provider );
	}

	/**
	 * Whether a credential exists for this provider's connector, without asking
	 * the provider whether it works.
	 *
	 * Mirrors core's own resolution order — environment variable, then PHP
	 * constant, then the registered option — reading only the public connector
	 * definition, never core's private resolver.
	 *
	 * @param string $provider Plugin provider slug.
	 * @return bool True when some credential is present.
	 */
	public static function has_credential( string $provider ): bool {
		$connector = self::get_connector( $provider );
		if ( null === $connector ) {
			return false;
		}

		$auth = $connector['authentication'] ?? array();
		if ( 'api_key' !== ( $auth['method'] ?? '' ) ) {
			return false;
		}

		$env_var_name = (string) ( $auth['env_var_name'] ?? '' );
		if ( '' !== $env_var_name ) {
			$env_value = getenv( $env_var_name );
			if ( false !== $env_value && '' !== $env_value ) {
				return true;
			}
		}

		$constant_name = (string) ( $auth['constant_name'] ?? '' );
		if ( '' !== $constant_name && defined( $constant_name ) ) {
			$constant_value = constant( $constant_name );
			if ( is_string( $constant_value ) && '' !== $constant_value ) {
				return true;
			}
		}

		$setting_name = (string) ( $auth['setting_name'] ?? '' );

		return '' !== $setting_name && '' !== (string) get_option( $setting_name, '' );
	}

	/**
	 * Whether the provider is registered, credentialed, and actually reachable.
	 *
	 * A registered connector holding a key is still unusable when the provider
	 * plugin that implements it is missing or inactive — core's connector entries
	 * for Anthropic, Google, and OpenAI are metadata that point at separate
	 * provider plugins, not implementations. Only the AI client registry knows
	 * the difference, so that is what is asked, behind a transient.
	 *
	 * `$allow_probe` false answers from the credential alone when the cache is
	 * cold, so a request that only needs a rough answer — building the editor's
	 * localized payload, which can run during a REST request — never makes an
	 * outbound call. Being wrong that way costs a clear error at generation
	 * time; probing on a public REST request would cost every visitor.
	 *
	 * @param string $provider    Plugin provider slug.
	 * @param bool   $allow_probe Whether a cold cache may cost an HTTP request.
	 * @return bool True when the provider can serve a request right now.
	 */
	public static function is_connected( string $provider, bool $allow_probe = true ): bool {
		if ( ! self::has_credential( $provider ) ) {
			return false;
		}

		$connector_id = self::connector_id( $provider );
		$cache_key    = self::STATUS_TRANSIENT_PREFIX . $connector_id;
		$cached       = get_transient( $cache_key );
		if ( false !== $cached ) {
			return 'yes' === $cached;
		}

		if ( ! $allow_probe ) {
			return true;
		}

		$connected = self::probe_provider( $connector_id );
		set_transient( $cache_key, $connected ? 'yes' : 'no', self::STATUS_TTL );

		return $connected;
	}

	/**
	 * Ask the AI client registry whether a provider is ready.
	 *
	 * @param string $connector_id Core connector ID.
	 * @return bool True when the registry reports the provider configured.
	 */
	private static function probe_provider( string $connector_id ): bool {
		if ( ! class_exists( '\WordPress\AiClient\AiClient' ) ) {
			return false;
		}

		try {
			$registry = \WordPress\AiClient\AiClient::defaultRegistry();

			return $registry->hasProvider( $connector_id ) && $registry->isProviderConfigured( $connector_id );
		} catch ( \Exception $e ) {
			return false;
		}
	}

	/**
	 * Resolve a provider's connector state.
	 *
	 * @param string $provider    Plugin provider slug.
	 * @param bool   $allow_probe Whether a cold cache may cost an HTTP request.
	 * @return string One of the STATUS_* constants.
	 */
	public static function get_status( string $provider, bool $allow_probe = true ): string {
		if ( ! self::is_supported() ) {
			return self::STATUS_UNSUPPORTED;
		}

		if ( ! self::is_registered( $provider ) ) {
			return self::STATUS_UNAVAILABLE;
		}

		return self::is_connected( $provider, $allow_probe ) ? self::STATUS_CONNECTED : self::STATUS_DISCONNECTED;
	}

	/**
	 * List the text-generation models a connected provider actually offers.
	 *
	 * This replaces a hardcoded catalog for connected providers: the registry
	 * cannot offer a model the provider has retired, so a saved setting pointing
	 * at a dead model simply stops being offered instead of failing at request
	 * time.
	 *
	 * @param string $provider Plugin provider slug.
	 * @return array<int, array{value: string, label: string}> Model options, empty when not connected.
	 */
	public static function get_models( string $provider ): array {
		if ( ! self::is_connected( $provider ) ) {
			return array();
		}

		$connector_id = self::connector_id( $provider );
		$cache_key    = self::MODELS_TRANSIENT_PREFIX . $connector_id;
		$cached       = get_transient( $cache_key );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$models = self::fetch_models( $connector_id );
		set_transient( $cache_key, $models, empty( $models ) ? self::MODELS_EMPTY_TTL : self::MODELS_TTL );

		return $models;
	}

	/**
	 * Model IDs already known for a provider, without contacting anything.
	 *
	 * Saving a setting must not depend on whether a provider answers right now:
	 * a probe that happens to fail between rendering the settings form and
	 * submitting it would otherwise shrink the set of valid models and silently
	 * rewrite the user's choice. Validation reads this cache; only the UI pays
	 * for the authoritative list.
	 *
	 * @param string $provider Plugin provider slug.
	 * @return string[] Model IDs, empty when nothing is cached.
	 */
	public static function get_cached_model_ids( string $provider ): array {
		$connector_id = self::connector_id( $provider );
		if ( '' === $connector_id ) {
			return array();
		}

		$cached = get_transient( self::MODELS_TRANSIENT_PREFIX . $connector_id );

		return is_array( $cached ) ? wp_list_pluck( $cached, 'value' ) : array();
	}

	/**
	 * Read a provider's text-generation models out of the AI client registry.
	 *
	 * @param string $connector_id Core connector ID.
	 * @return array<int, array{value: string, label: string}> Model options.
	 */
	private static function fetch_models( string $connector_id ): array {
		if ( ! class_exists( '\WordPress\AiClient\AiClient' ) ) {
			return array();
		}

		try {
			$requirements = new \WordPress\AiClient\Providers\Models\DTO\ModelRequirements(
				array( \WordPress\AiClient\Providers\Models\Enums\CapabilityEnum::textGeneration() ),
				array()
			);

			$metadata = \WordPress\AiClient\AiClient::defaultRegistry()
				->findProviderModelsMetadataForSupport( $connector_id, $requirements );
		} catch ( \Exception $e ) {
			return array();
		}

		$models = array();
		foreach ( $metadata as $model ) {
			$id = $model->getId();
			if ( '' === $id ) {
				continue;
			}

			$name     = $model->getName();
			$models[] = array(
				'value' => $id,
				'label' => '' !== $name ? $name : $id,
			);
		}

		return $models;
	}

	/**
	 * Model IDs offered by a connected provider.
	 *
	 * @param string $provider Plugin provider slug.
	 * @return string[] Model IDs.
	 */
	public static function get_model_ids( string $provider ): array {
		return wp_list_pluck( self::get_models( $provider ), 'value' );
	}

	/**
	 * Connector state for every provider, in a shape the settings screen and the
	 * block editor can read directly.
	 *
	 * `connected` means "usable as far as this request can tell". `verified`
	 * says whether a probe actually confirmed it: false means the answer came
	 * from a credential existing, which is enough to enable the AI builder but
	 * is not proof the provider will answer. Anything that shows the user a
	 * definite "already configured" claim reads `verified`, not `connected`.
	 *
	 * @param string[] $providers   Provider slugs to describe.
	 * @param bool     $allow_probe Whether a cold cache may cost an HTTP request.
	 * @return array<string, array{status: string, name: string, registered: bool, connected: bool, verified: bool, credentialsUrl: string}>
	 */
	public static function get_public_statuses( array $providers, bool $allow_probe = true ): array {
		$statuses = array();

		foreach ( $providers as $provider ) {
			$connector = self::get_connector( $provider );
			$status    = self::get_status( $provider, $allow_probe );
			$connected = self::STATUS_CONNECTED === $status;

			$statuses[ $provider ] = array(
				'status'         => $status,
				'name'           => null !== $connector ? (string) $connector['name'] : '',
				'registered'     => null !== $connector,
				'connected'      => $connected,
				'verified'       => $connected && self::has_probe_result( $provider ),
				'credentialsUrl' => null !== $connector ? (string) ( $connector['authentication']['credentials_url'] ?? '' ) : '',
			);
		}

		return $statuses;
	}

	/**
	 * Whether a connection probe has actually run for this provider.
	 *
	 * @param string $provider Plugin provider slug.
	 * @return bool True when a cached probe result exists.
	 */
	private static function has_probe_result( string $provider ): bool {
		$connector_id = self::connector_id( $provider );

		return '' !== $connector_id && false !== get_transient( self::STATUS_TRANSIENT_PREFIX . $connector_id );
	}

	/**
	 * URL of the core Connectors screen.
	 *
	 * @return string Admin URL, or empty string when the screen does not exist.
	 */
	public static function settings_url(): string {
		if ( ! function_exists( 'wp_get_connector' ) ) {
			return '';
		}

		return admin_url( 'options-connectors.php' );
	}

	/**
	 * Drop cached probe and model data.
	 *
	 * @param string $provider Provider slug, or empty to clear every provider.
	 * @return void
	 */
	public static function flush_cache( string $provider = '' ): void {
		$providers = '' !== $provider ? array( $provider ) : array_keys( self::PROVIDER_CONNECTORS );

		foreach ( $providers as $slug ) {
			$connector_id = self::connector_id( $slug );
			if ( '' === $connector_id ) {
				continue;
			}

			delete_transient( self::STATUS_TRANSIENT_PREFIX . $connector_id );
			delete_transient( self::MODELS_TRANSIENT_PREFIX . $connector_id );
		}
	}
}
