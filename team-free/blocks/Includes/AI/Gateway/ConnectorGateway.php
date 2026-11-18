<?php
/**
 * Connector Gateway
 *
 * Runs completions through the WordPress AI Client, using the credential the
 * site owner already configured under Settings > Connectors.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI\Gateway
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI\Gateway;

use ShapedPlugin\WPTeam\Blocks\Includes\AI\ConnectorBridge;

defined( 'ABSPATH' ) || exit;

/**
 * ConnectorGateway class.
 *
 * No API key passes through here. Core injects stored connector keys into the
 * AI client registry on `init`, so naming the provider is enough, and a key
 * rotated in Connectors takes effect without this plugin storing anything.
 */
class ConnectorGateway implements TextGateway {

	/**
	 * Plugin provider slug.
	 *
	 * @var string
	 */
	private $provider;

	/**
	 * Core connector ID for that provider.
	 *
	 * @var string
	 */
	private $connector_id;

	/**
	 * Preferred model ID, possibly empty.
	 *
	 * @var string
	 */
	private $model;

	/**
	 * Constructor.
	 *
	 * @param string $provider Plugin provider slug.
	 * @param string $model    Preferred model ID, or empty to let the client choose.
	 */
	public function __construct( string $provider, string $model = '' ) {
		$this->provider     = $provider;
		$this->connector_id = ConnectorBridge::connector_id( $provider );
		$this->model        = $model;
	}

	/**
	 * Provider slug this gateway is configured for.
	 *
	 * @return string Provider slug.
	 */
	public function get_provider(): string {
		return $this->provider;
	}

	/**
	 * Request one JSON completion through the WordPress AI Client.
	 *
	 * The model is expressed as a preference rather than a hard selection: the
	 * client drops a preference the provider no longer offers and falls back to
	 * another model that meets the same requirements, so a saved setting naming
	 * a retired model degrades instead of failing.
	 *
	 * @param string $system System prompt.
	 * @param string $user   User message.
	 * @return string|\WP_Error Raw response text, or WP_Error on failure.
	 */
	public function generate_json( string $system, string $user ) {
		if ( ! function_exists( 'wp_ai_client_prompt' ) ) {
			return new \WP_Error(
				'sptp_ai_connector_unavailable',
				__( 'WordPress AI is not available on this site. Update WordPress, or add an API key in Smart Team → Settings → AI Configuration.', 'team-free' ),
				array( 'status' => 500 )
			);
		}

		$builder = wp_ai_client_prompt( $user )
			->using_provider( $this->connector_id )
			->using_system_instruction( $system )
			->using_temperature( self::TEMPERATURE )
			->using_max_tokens( self::MAX_TOKENS )
			->as_json_response();

		if ( '' !== $this->model ) {
			$builder->using_model_preference( $this->model );
		}

		// The builder collects failures internally and hands them back as a
		// WP_Error from the generating call, so there is nothing to catch here.
		$text = $builder->generate_text();

		if ( is_wp_error( $text ) ) {
			return $text;
		}

		return is_string( $text ) ? $text : '';
	}
}
