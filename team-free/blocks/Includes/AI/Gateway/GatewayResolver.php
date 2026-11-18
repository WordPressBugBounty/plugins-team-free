<?php
/**
 * Gateway Resolver
 *
 * Decides how a completion request reaches its provider: through WordPress
 * Connectors when the site owner already configured one there, otherwise
 * through this plugin's own stored key.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI\Gateway
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI\Gateway;

use ShapedPlugin\WPTeam\Blocks\Includes\AI\AIFeature;
use ShapedPlugin\WPTeam\Blocks\Includes\AI\AIKeyManager;
use ShapedPlugin\WPTeam\Blocks\Includes\AI\ConnectorBridge;

defined( 'ABSPATH' ) || exit;

/**
 * GatewayResolver class.
 */
class GatewayResolver {

	/**
	 * Pick the gateway for a provider.
	 *
	 * Connectors win whenever they can actually serve the request. A key stored
	 * by this plugin is never deleted or migrated because of that — it stays as
	 * the fallback for the day the provider plugin is deactivated, the connector
	 * key is revoked, or the site moves to a WordPress without Connectors.
	 *
	 * @param string $provider Provider slug, or empty for the Primary.
	 * @param string $model    Model the builder picked for that provider, or empty.
	 * @return TextGateway|\WP_Error Gateway, or WP_Error when nothing can serve the request.
	 */
	public static function resolve( string $provider = '', string $model = '' ) {
		// Last line of defence: no completion leaves the site while the module is
		// off, however the caller got here.
		if ( ! AIFeature::is_available() ) {
			return AIFeature::unavailable_error();
		}

		$settings = AIKeyManager::get_settings();
		$provider = '' !== $provider ? $provider : $settings['provider'];

		// A picked model must be one this provider serves; otherwise the stored
		// model applies, and it belongs to the stored provider only.
		if ( ! in_array( $model, AIKeyManager::allowed_models( $provider ), true ) ) {
			$model = $provider === $settings['provider'] ? $settings['model'] : '';
		}

		if ( ConnectorBridge::is_connected( $provider ) ) {
			return new ConnectorGateway( $provider, $model );
		}

		$api_key = AIKeyManager::get_decrypted_key( $provider );
		if ( '' === $api_key ) {
			return new \WP_Error( 'sptp_ai_missing_key', self::missing_key_message( $provider ), array( 'status' => 400 ) );
		}

		return new RemoteHttpGateway( $provider, $model, $api_key );
	}

	/**
	 * Explain a missing credential in terms of where the user can supply one.
	 *
	 * Pointing at this plugin's settings when WordPress already offers a
	 * connector for the provider sends the user to the wrong screen, and sets
	 * up exactly the duplicate key entry the connector integration exists to
	 * avoid.
	 *
	 * @param string $provider Provider slug.
	 * @return string Message.
	 */
	private static function missing_key_message( string $provider ): string {
		if ( ConnectorBridge::is_registered( $provider ) ) {
			return __( 'No API key has been added for this AI provider yet. Connect it under Settings → Connectors, or add a key in Smart Team → Settings → AI Configuration.', 'team-free' );
		}

		return __( 'No AI API key has been added yet. Add one in Smart Team → Settings → AI Configuration to start building teams with AI.', 'team-free' );
	}
}
