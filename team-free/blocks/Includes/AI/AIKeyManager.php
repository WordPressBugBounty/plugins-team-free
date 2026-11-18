<?php
/**
 * AI Key Manager
 *
 * Handles secure encryption, decryption, and storage of AI provider settings and API keys.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

use ShapedPlugin\WPTeam\Blocks\Includes\AI\Gateway\RemoteHttpGateway;

defined( 'ABSPATH' ) || exit;

/**
 * AIKeyManager class.
 *
 * Stores one encrypted API key per provider (`api_keys[provider]`), not one
 * shared key for whichever provider happens to be selected. Switching the
 * provider dropdown without re-entering a key used to silently pair the new
 * provider with the previous provider's key — a guaranteed auth failure with
 * no indication of the real cause. Per-provider storage also means switching
 * back to a provider configured earlier (e.g. a free-tier key for testing
 * alongside a paid production key) doesn't force re-entering it.
 */
class AIKeyManager {

	/**
	 * Option key for AI settings.
	 */
	const OPTION_KEY = 'sptp_ai_settings';

	/**
	 * Recognized provider slugs, in the order the settings UI offers them.
	 *
	 * @var string[]
	 */
	const PROVIDERS = array( 'openai', 'anthropic', 'gemini', 'groq' );

	/**
	 * Recognized model ids per provider. The settings screen offers no model
	 * choice, so the first id in each list is the model that provider runs on.
	 *
	 * @var array<string, string[]>
	 */
	const PROVIDER_MODELS = array(
		'openai'    => array( 'gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.6-luna' ),
		'anthropic' => array( 'claude-haiku-4-5-20251001', 'claude-sonnet-5' ),
		'gemini'    => array( 'gemini-3.6-flash', 'gemini-pro-latest' ),
		'groq'      => array( 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b' ),
	);

	/**
	 * Default provider when none is stored.
	 */
	const DEFAULT_PROVIDER = 'gemini';

	/**
	 * Default model when none is stored.
	 */
	const DEFAULT_MODEL = 'gemini-3.6-flash';

	/**
	 * How long a verification verdict is trusted before the key is re-checked.
	 *
	 * Long enough that opening the settings screen is not a stream of provider
	 * requests, short enough that a key revoked upstream stops being advertised
	 * as working within the day. A verdict is also discarded the moment the key
	 * it described changes, regardless of age.
	 */
	const STATUS_TTL = 12 * HOUR_IN_SECONDS;

	/**
	 * Hidden-run marker inside a masked key, as echoed to the settings screen.
	 */
	const MASK = '••••';

	/**
	 * Load the stored option, migrating the legacy single-key shape
	 * (`api_key`, one key for whichever provider was last selected) into the
	 * per-provider shape (`api_keys[provider]`) the first time it's read after
	 * upgrading. Runs once: after migration `api_key` no longer exists, so
	 * this is a no-op on every later call.
	 *
	 * @return array{provider: string, model: string, api_keys: array<string, string>, key_status: array<string, array>}
	 */
	private static function get_raw_settings(): array {
		$opts = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $opts ) ) {
			$opts = array();
		}

		if ( array_key_exists( 'api_key', $opts ) ) {
			$provider = isset( $opts['provider'] ) ? sanitize_key( $opts['provider'] ) : self::DEFAULT_PROVIDER;
			$api_keys = isset( $opts['api_keys'] ) && is_array( $opts['api_keys'] ) ? $opts['api_keys'] : array();

			if ( ! empty( $opts['api_key'] ) && empty( $api_keys[ $provider ] ) ) {
				$api_keys[ $provider ] = $opts['api_key'];
			}

			unset( $opts['api_key'] );
			$opts['api_keys'] = $api_keys;
			update_option( self::OPTION_KEY, $opts, false );
		}

		if ( ! isset( $opts['api_keys'] ) || ! is_array( $opts['api_keys'] ) ) {
			$opts['api_keys'] = array();
		}

		if ( ! isset( $opts['key_status'] ) || ! is_array( $opts['key_status'] ) ) {
			$opts['key_status'] = array();
		}

		return $opts;
	}

	/**
	 * Save AI settings: provider, model, and the API key for that one provider.
	 *
	 * The other providers' stored keys are always left untouched — this only
	 * ever writes to `api_keys[$settings['provider']]`, never wipes a sibling.
	 *
	 * @param array $settings Input settings: provider, model, api_key (for `provider`).
	 * @return bool True on success, false on failure.
	 */
	public static function save_settings( array $settings ): bool {
		return self::save( $settings )['saved'];
	}

	/**
	 * Save AI settings and report what happened to the submitted API key.
	 *
	 * A key is verified with its provider before it is stored, and a key the
	 * provider rejects is not stored at all: the previously saved key stays
	 * exactly as it was. Overwriting a working credential with a typo, and then
	 * reporting it as "Configured", is the failure this guards against — it
	 * surfaces as a generation error much later, nowhere near the screen that
	 * caused it.
	 *
	 * The Primary is saved either way. It is a separate choice, and refusing to
	 * record it because the key field has a problem would lose an edit the user
	 * did make correctly.
	 *
	 * @param array $settings Input settings: provider (whose key is edited), primary, api_key, remove_key, dismiss_connector_notice.
	 * @return array{saved: bool, provider: string, key: array{state: string, message: string, stored: bool}} Outcome.
	 */
	public static function save( array $settings ): array {
		$existing = self::get_raw_settings();
		$stored   = self::get_settings();

		$provider = isset( $settings['provider'] ) ? sanitize_key( $settings['provider'] ) : $stored['provider'];
		if ( ! in_array( $provider, self::PROVIDERS, true ) ) {
			$provider = self::DEFAULT_PROVIDER;
		}

		// The key form edits one provider while another stays Primary, so a
		// backup key must never move the Primary along with it.
		$primary = isset( $settings['primary'] ) ? sanitize_key( $settings['primary'] ) : $stored['provider'];
		if ( ! in_array( $primary, self::PROVIDERS, true ) ) {
			$primary = $stored['provider'];
		}

		$api_keys   = $existing['api_keys'];
		$key_status = $existing['key_status'];

		$outcome = array(
			'state'   => 'unchanged',
			'message' => '',
			'stored'  => false,
		);

		// A masked placeholder (the UI echoes back "<first 4> •••• … <last 4>" for a key
		// it never lets JS see in full) means "leave this provider's stored key
		// alone" — but only when it matches the stored key's mask exactly; an
		// edited mask is refused rather than silently reported as saved.
		//
		// Removal is its own flag (the form's "Remove key" action), so an empty
		// field only ever means "nothing typed", never "delete this key".
		$submitted = isset( $settings['api_key'] ) && is_string( $settings['api_key'] ) ? $settings['api_key'] : '';

		if ( ! empty( $settings['remove_key'] ) ) {
			unset( $api_keys[ $provider ], $key_status[ $provider ] );
			$outcome['state'] = 'removed';
		} elseif ( '' !== $submitted && $submitted === self::mask( self::get_decrypted_key( $provider ) ) ) {
			$outcome['state'] = 'unchanged';
		} elseif ( false !== strpos( $submitted, self::MASK ) ) {
			// Typing into the pre-filled field keeps the mask, so the value is neither the stored key nor a real one.
			$outcome = array(
				'state'   => AIKeyValidator::STATE_INVALID,
				'message' => __( 'This is not a valid API key. Clear the field completely, then paste your new key.', 'team-free' ),
				'stored'  => false,
			);
		} elseif ( '' !== $submitted ) {
			$outcome = self::store_submitted_key( $provider, $submitted, $api_keys, $key_status );
		}

		if ( 'removed' === $outcome['state'] && $provider === $primary ) {
			$primary = self::next_connected_provider( $primary, $api_keys );
		} elseif ( $outcome['stored'] && empty( $api_keys[ $primary ] ) && ! ConnectorBridge::is_connected( $primary, false ) ) {
			// The first provider to connect becomes Primary; a Primary nothing can serve is no Primary.
			$primary = $provider;
		}

		$notice_dismissed = ! empty( $existing['connector_notice_dismissed'] ) || ! empty( $settings['dismiss_connector_notice'] );

		$saved = update_option(
			self::OPTION_KEY,
			array(
				'provider'                   => $primary,
				'model'                      => self::model_for( $primary, $primary === $stored['provider'] ? $stored['model'] : '' ),
				'api_keys'                   => $api_keys,
				'key_status'                 => $key_status,
				'connector_notice_dismissed' => $notice_dismissed,
			),
			false
		);

		return array(
			'saved'    => $saved,
			'provider' => $provider,
			'key'      => $outcome,
		);
	}

	/**
	 * The model a provider runs on: a stored choice it still serves, else its
	 * recommended model.
	 *
	 * @param string $provider Provider slug.
	 * @param string $stored   Previously stored model for this provider, or empty.
	 * @return string Model id.
	 */
	private static function model_for( string $provider, string $stored ): string {
		$allowed = self::allowed_models( $provider );
		if ( '' === $stored ) {
			return $allowed[0] ?? '';
		}

		$remap  = RemoteHttpGateway::DEPRECATED_MODEL_MAP[ $provider ] ?? array();
		$stored = $remap[ $stored ] ?? $stored;

		return in_array( $stored, $allowed, true ) ? $stored : ( $allowed[0] ?? '' );
	}

	/**
	 * The provider that takes over when the Primary's key is removed.
	 *
	 * @param string $primary  Primary whose key was removed.
	 * @param array  $api_keys Keys as they will be stored.
	 * @return string Next connected provider, or the old Primary when none is.
	 */
	private static function next_connected_provider( string $primary, array $api_keys ): string {
		foreach ( self::PROVIDERS as $slug ) {
			if ( ! empty( $api_keys[ $slug ] ) || ConnectorBridge::is_connected( $slug, false ) ) {
				return $slug;
			}
		}

		return $primary;
	}

	/**
	 * Providers a request may use, in the order it tries them: the Primary,
	 * then the rest. A provider counts when WordPress Connectors serves it or a
	 * stored key is not known to be refused.
	 *
	 * @param bool $allow_probe Whether a connector check may cost an HTTP request.
	 * @return string[] Provider slugs.
	 */
	public static function connected_providers_in_order( bool $allow_probe = true ): array {
		$opts    = self::get_raw_settings();
		$primary = self::get_settings()['provider'];
		$order   = array_values( array_unique( array_merge( array( $primary ), self::PROVIDERS ) ) );

		$connected = array();
		foreach ( $order as $slug ) {
			if ( ! in_array( $slug, self::PROVIDERS, true ) ) {
				continue;
			}

			$usable_key = ! empty( $opts['api_keys'][ $slug ] )
				&& AIKeyValidator::STATE_INVALID !== self::read_status( $slug, $opts )['state'];

			if ( $usable_key || ConnectorBridge::is_connected( $slug, $allow_probe ) ) {
				$connected[] = $slug;
			}
		}

		return $connected;
	}

	/**
	 * The providers the Build with AI modal offers, Primary first, each with
	 * the model it runs on: the stored one for the Primary, else the default.
	 *
	 * @return array<int, array{slug: string, label: string, model: string}>
	 */
	public static function builder_providers(): array {
		$settings = self::get_settings();
		$rows     = array();
		foreach ( self::connected_providers_in_order( false ) as $slug ) {
			$rows[] = array(
				'slug'  => $slug,
				'label' => AIErrorMessages::provider_label( $slug ),
				'model' => self::model_for( $slug, $slug === $settings['provider'] ? $settings['model'] : '' ),
			);
		}

		return $rows;
	}

	/**
	 * Verify a freshly typed key and, if the provider accepts it, store it.
	 *
	 * A provider that cannot be reached leaves the key stored but unverified
	 * rather than refused: a site behind an outage or a firewall must still be
	 * able to configure a credential, and "not verified" is an honest label for
	 * one nobody has confirmed yet.
	 *
	 * @param string $provider   Provider slug.
	 * @param string $submitted  Raw key exactly as submitted.
	 * @param array  $api_keys   Encrypted keys, modified in place.
	 * @param array  $key_status Verdicts, modified in place.
	 * @return array{state: string, message: string, stored: bool} Outcome for this key.
	 */
	private static function store_submitted_key( string $provider, string $submitted, array &$api_keys, array &$key_status ): array {
		$api_key = sanitize_text_field( $submitted );

		// sanitize_text_field() trims, so a field holding only spaces arrives
		// here empty. That is not "leave the key alone" — the user typed
		// something, and it cannot become a credential.
		if ( '' === $api_key ) {
			return array(
				'state'   => AIKeyValidator::STATE_EMPTY,
				'message' => __( 'Enter an API key — the field contains only spaces.', 'team-free' ),
				'stored'  => false,
			);
		}

		$verdict = AIKeyValidator::validate( $provider, $api_key );

		if ( AIKeyValidator::STATE_INVALID === $verdict['state'] || AIKeyValidator::STATE_EMPTY === $verdict['state'] ) {
			return array(
				'state'   => $verdict['state'],
				'message' => $verdict['message'],
				'stored'  => false,
			);
		}

		$encrypted = self::encrypt( $api_key );
		if ( '' === $encrypted ) {
			return array(
				'state'   => 'failed',
				'message' => __( 'The API key could not be encrypted for storage. Please try saving again.', 'team-free' ),
				'stored'  => false,
			);
		}

		$api_keys[ $provider ]   = $encrypted;
		$key_status[ $provider ] = self::status_record( $api_key, $verdict );

		return array(
			'state'   => $verdict['state'],
			'message' => $verdict['message'],
			'stored'  => true,
		);
	}

	/**
	 * Shape one stored verdict.
	 *
	 * The fingerprint ties a verdict to the exact key it describes, so a verdict
	 * can never outlive its key — a key replaced through any path (import, WP-CLI,
	 * a direct option write) leaves a fingerprint that no longer matches and the
	 * stale verdict is discarded instead of being reported for the new key.
	 *
	 * @param string $api_key Plaintext key the verdict is about.
	 * @param array  $verdict Verdict from AIKeyValidator.
	 * @return array{state: string, message: string, checked_at: int, fingerprint: string}
	 */
	private static function status_record( string $api_key, array $verdict ): array {
		return array(
			'state'       => $verdict['state'],
			'message'     => $verdict['message'],
			'checked_at'  => time(),
			'fingerprint' => self::fingerprint( $api_key ),
		);
	}

	/**
	 * Salted, non-reversible identifier for a key.
	 *
	 * @param string $api_key Plaintext key.
	 * @return string Fingerprint.
	 */
	private static function fingerprint( string $api_key ): string {
		return substr( wp_hash( $api_key ), 0, 16 );
	}

	/**
	 * Model ids a provider may be saved with.
	 *
	 * A provider reached through Connectors is not limited to this plugin's
	 * hardcoded catalog — the AI client registry reports what that provider
	 * actually serves, which is both wider and more current. The static catalog
	 * stays allowed alongside it, so disconnecting a connector never
	 * invalidates a model the user picked earlier.
	 *
	 * The connector half is read from cache only. Validating a submitted value
	 * against a live probe would mean a provider that fails to answer between
	 * rendering the form and submitting it silently rewrites the user's model.
	 *
	 * @param string $provider Provider slug.
	 * @return string[] Allowed model ids, this plugin's recommended one first.
	 */
	public static function allowed_models( string $provider ): array {
		$catalog = self::PROVIDER_MODELS[ $provider ] ?? array();

		return array_values( array_unique( array_merge( $catalog, ConnectorBridge::get_cached_model_ids( $provider ) ) ) );
	}

	/**
	 * Get the decrypted API key for a provider.
	 *
	 * @param string $provider Provider slug, or empty for the currently configured provider.
	 * @return string Decrypted API key or empty string.
	 */
	public static function get_decrypted_key( string $provider = '' ): string {
		$opts     = self::get_raw_settings();
		$provider = '' !== $provider ? sanitize_key( $provider ) : (string) ( $opts['provider'] ?? self::DEFAULT_PROVIDER );

		if ( empty( $opts['api_keys'][ $provider ] ) ) {
			return '';
		}

		return self::decrypt( (string) $opts['api_keys'][ $provider ] );
	}

	/**
	 * Current verdict on a provider's stored key, without contacting anyone.
	 *
	 * @param string $provider Provider slug.
	 * @return array{state: string, message: string, checked_at: int} Verdict; `none` when no key is stored, `unknown` when it has never been checked or the check went stale.
	 */
	public static function get_key_status( string $provider ): array {
		$opts = self::get_raw_settings();

		return self::read_status( $provider, $opts );
	}

	/**
	 * Verify a provider's stored key and remember the answer.
	 *
	 * Re-uses a fresh verdict by default so opening the settings screen does not
	 * become a round of provider requests; `$force` is for the user explicitly
	 * asking for a re-check.
	 *
	 * @param string $provider Provider slug.
	 * @param bool   $force    Ignore a cached verdict and ask the provider again.
	 * @return array{state: string, message: string, checked_at: int} Verdict.
	 */
	public static function verify_stored_key( string $provider, bool $force = false ): array {
		$provider = sanitize_key( $provider );
		$opts     = self::get_raw_settings();
		$current  = self::read_status( $provider, $opts );

		if ( AIKeyValidator::STATE_NONE === $current['state'] ) {
			return $current;
		}

		if ( ! $force && AIKeyValidator::STATE_UNKNOWN !== $current['state'] ) {
			return $current;
		}

		$api_key = self::get_decrypted_key( $provider );

		// Something is stored but no longer decrypts: this site's salts changed
		// since it was saved (a moved database, rotated wp-config.php keys).
		// That key can never be read again, so it gets a verdict of its own
		// rather than staying "unknown" — an unknown that no re-check can
		// resolve is a screen that asks forever.
		$verdict = '' === $api_key
			? array(
				'state'   => AIKeyValidator::STATE_INVALID,
				'message' => __( 'The stored API key can no longer be read — this site\'s security keys changed since it was saved. Paste the key again.', 'team-free' ),
			)
			: AIKeyValidator::validate( $provider, $api_key );
		$record  = self::status_record( $api_key, $verdict );

		$opts['key_status'][ $provider ] = $record;
		update_option( self::OPTION_KEY, $opts, false );

		return self::public_status( $record );
	}

	/**
	 * Record that a provider refused the stored key during a real request.
	 *
	 * A key can be revoked, rotated or hit an expired billing account long after
	 * it was verified. The screen that reports it must not keep claiming the key
	 * works simply because it did when it was saved.
	 *
	 * @param string $provider Provider slug.
	 * @param string $message  Provider's own explanation.
	 * @return void
	 */
	public static function mark_key_invalid( string $provider, string $message ): void {
		$provider = sanitize_key( $provider );
		$api_key  = self::get_decrypted_key( $provider );

		if ( '' === $api_key ) {
			return;
		}

		$opts                            = self::get_raw_settings();
		$opts['key_status'][ $provider ] = self::status_record(
			$api_key,
			array(
				'state'   => AIKeyValidator::STATE_INVALID,
				'message' => AIKeyValidator::rejection_message( $provider, sanitize_text_field( $message ) ),
			)
		);

		update_option( self::OPTION_KEY, $opts, false );
	}

	/**
	 * Read a provider's stored verdict out of an already-loaded option.
	 *
	 * @param string $provider Provider slug.
	 * @param array  $opts     Raw settings.
	 * @return array{state: string, message: string, checked_at: int}
	 */
	private static function read_status( string $provider, array $opts ): array {
		$empty = array(
			'state'      => AIKeyValidator::STATE_NONE,
			'message'    => '',
			'checked_at' => 0,
		);

		if ( empty( $opts['api_keys'][ $provider ] ) ) {
			return $empty;
		}

		$unknown = array(
			'state'      => AIKeyValidator::STATE_UNKNOWN,
			'message'    => '',
			'checked_at' => 0,
		);

		$record = $opts['key_status'][ $provider ] ?? null;
		if ( ! is_array( $record ) || empty( $record['state'] ) ) {
			return $unknown;
		}

		// A verdict older than the TTL, or one describing a different key than
		// the one now stored, says nothing about what is stored today.
		$checked_at = isset( $record['checked_at'] ) ? (int) $record['checked_at'] : 0;
		if ( $checked_at < ( time() - self::STATUS_TTL ) ) {
			return $unknown;
		}

		$fingerprint = isset( $record['fingerprint'] ) ? (string) $record['fingerprint'] : '';
		if ( '' === $fingerprint || $fingerprint !== self::fingerprint( self::decrypt( (string) $opts['api_keys'][ $provider ] ) ) ) {
			return $unknown;
		}

		return self::public_status( $record );
	}

	/**
	 * Reduce a stored verdict to the fields other layers may see.
	 *
	 * @param array $record Stored verdict.
	 * @return array{state: string, message: string, checked_at: int}
	 */
	private static function public_status( array $record ): array {
		return array(
			'state'      => (string) $record['state'],
			'message'    => isset( $record['message'] ) ? (string) $record['message'] : '',
			'checked_at' => isset( $record['checked_at'] ) ? (int) $record['checked_at'] : 0,
		);
	}

	/**
	 * Get stored AI settings (provider + model only — keys never leave this class unmasked).
	 *
	 * @return array Saved settings.
	 */
	public static function get_settings(): array {
		$opts = self::get_raw_settings();

		return array(
			'provider' => isset( $opts['provider'] ) ? (string) $opts['provider'] : self::DEFAULT_PROVIDER,
			'model'    => isset( $opts['model'] ) ? (string) $opts['model'] : self::DEFAULT_MODEL,
		);
	}

	/**
	 * Get public-safe AI settings for JS localization.
	 *
	 * `has_key` answers the one question the block editor's AI builder asks: can
	 * a request be made right now. That is true for a provider configured in
	 * WordPress Connectors even though this plugin stores no key for it, so the
	 * builder does not demand a key the site already has — and false for a key
	 * the provider is known to reject, which is not a usable credential however
	 * much of it is stored.
	 *
	 * `keys` reports this plugin's own storage per provider, so the settings
	 * screen can show the right masked value the instant the provider dropdown
	 * changes, with no round trip. Each entry carries the verification verdict
	 * alongside it, so no screen has to infer validity from "a value exists".
	 * `connectors` reports the same providers' state in WordPress Connectors,
	 * which is what decides whether the key field is shown at all.
	 *
	 * Only the settings screen needs an authoritative connector answer, and
	 * only it needs the model list. The block editor's payload is built on
	 * requests that can be REST requests, so it settles for the free answer
	 * rather than letting a page load reach out to a provider.
	 *
	 * @param bool $probe_connectors Whether to verify connector state and read model lists, at the cost of an HTTP request on a cold cache.
	 * @return array Public settings.
	 */
	public static function get_public_settings( bool $probe_connectors = false ): array {
		$provider = self::get_settings()['provider'];

		// No key is verified here. This runs while an admin page renders, and a
		// provider that hangs would hold the whole screen for the validator's
		// timeout. A key with no fresh verdict is reported as `unknown`, which
		// the settings screen resolves through POST sptp/v1/ai/verify-key without
		// blocking anything — and which no screen renders as "Configured".
		$opts = self::get_raw_settings();
		$keys = array();
		foreach ( self::PROVIDERS as $slug ) {
			$decrypted     = self::get_decrypted_key( $slug );
			$status        = self::read_status( $slug, $opts );
			$keys[ $slug ] = array(
				'has_key'    => '' !== $decrypted,
				'masked_key' => self::mask( $decrypted ),
				'status'     => $status['state'],
				'message'    => $status['message'],
				'checked_at' => $status['checked_at'],
			);
		}

		$current = $keys[ $provider ] ?? array(
			'has_key'    => false,
			'masked_key' => '',
			'status'     => AIKeyValidator::STATE_NONE,
		);

		$connectors = ConnectorBridge::get_public_statuses( self::PROVIDERS, $probe_connectors );

		// Only connected providers report models: a disconnected one has nothing
		// to say, and the settings screen falls back to its static catalog.
		$connector_models = array();
		if ( $probe_connectors ) {
			foreach ( self::PROVIDERS as $slug ) {
				$models = ConnectorBridge::get_models( $slug );
				if ( ! empty( $models ) ) {
					$connector_models[ $slug ] = $models;
				}
			}
		}

		return array(
			'provider'                   => $provider,
			'model'                      => isset( $opts['model'] ) ? (string) $opts['model'] : self::DEFAULT_MODEL,
			// The builder can switch to any connected provider, not only the Primary.
			'has_key'                    => ! empty( self::connected_providers_in_order( $probe_connectors ) ),
			'provider_order'             => self::PROVIDERS,
			'connector_notice_dismissed' => ! empty( $opts['connector_notice_dismissed'] ),
			'key_status'                 => $current['status'],
			'key_message'                => isset( $current['message'] ) ? $current['message'] : '',
			'masked_key'                 => $current['masked_key'],
			'keys'                       => $keys,
			'connectors'                 => $connectors,
			'connector_models'           => $connector_models,
			'connectors_url'             => ConnectorBridge::settings_url(),
			'ai_enabled'                 => AIFeature::is_available(),
		);
	}

	/**
	 * Mask a decrypted key to its first and last 4 characters (admin screen only).
	 *
	 * @param string $decrypted Decrypted API key, or empty.
	 * @return string Masked key, or empty string when there is nothing to mask.
	 */
	private static function mask( string $decrypted ): string {
		if ( '' === $decrypted ) {
			return '';
		}

		// Too short to hide anything once both ends show: mask it entirely.
		if ( strlen( $decrypted ) <= 8 ) {
			return self::MASK . ' ' . self::MASK;
		}

		return substr( $decrypted, 0, 4 ) . ' •••• •••• •••• •••• ' . substr( $decrypted, -4 );
	}

	/**
	 * Encrypt string using OpenSSL with auth salt.
	 *
	 * @param string $value Plaintext value.
	 * @return string Base64 encoded IV + encrypted data.
	 */
	private static function encrypt( string $value ): string {
		if ( empty( $value ) ) {
			return '';
		}

		$key = wp_salt( 'auth' );
		$iv  = openssl_random_pseudo_bytes( 16 );
		$enc = openssl_encrypt( $value, 'aes-256-cbc', $key, 0, $iv );

		if ( false === $enc ) {
			return '';
		}

		return base64_encode( $iv . $enc );
	}

	/**
	 * Decrypt string using OpenSSL with auth salt.
	 *
	 * @param string $raw Base64 payload.
	 * @return string Decrypted plaintext value.
	 */
	private static function decrypt( string $raw ): string {
		if ( empty( $raw ) ) {
			return '';
		}

		$data = base64_decode( $raw, true );
		if ( false === $data || strlen( $data ) < 17 ) {
			return '';
		}

		$iv  = substr( $data, 0, 16 );
		$enc = substr( $data, 16 );
		$key = wp_salt( 'auth' );
		$dec = openssl_decrypt( $enc, 'aes-256-cbc', $key, 0, $iv );

		return false !== $dec ? $dec : '';
	}
}
