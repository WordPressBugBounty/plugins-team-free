<?php
/**
 * AI Team Builder availability.
 *
 * One gate for the whole feature: the "Create Team with AI" dashboard module,
 * plus whatever WordPress itself says about AI support. Every AI surface — the
 * editor header launcher, the block toolbar's Refine entry, the AI settings
 * tab, the generation endpoint, and the transport behind it — asks this class,
 * so switching the module off cannot leave one screen still offering a feature
 * the server no longer serves.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;

defined( 'ABSPATH' ) || exit;

/**
 * AIFeature class.
 */
final class AIFeature {

	/**
	 * Dashboard module key that owns the AI Team Builder.
	 */
	const MODULE = 'ai_team_builder';

	/**
	 * Whether the dashboard module is switched on.
	 *
	 * @return bool
	 */
	public static function is_module_enabled(): bool {
		/**
		 * Filter whether the AI Team Builder module is enabled.
		 *
		 * Runs before the stored module state so a site can switch the feature
		 * off in code without touching the dashboard option.
		 *
		 * @param bool $enabled Default enabled state.
		 */
		if ( ! apply_filters( 'sptp_ai_builder_enabled', true ) ) {
			return false;
		}

		return DashboardHelper::is_module_enabled( self::MODULE );
	}

	/**
	 * Whether AI may be offered and served at all.
	 *
	 * @return bool True when the module is on and the site allows AI.
	 */
	public static function is_available(): bool {
		return self::is_module_enabled() && ConnectorBridge::site_allows_ai();
	}

	/**
	 * Error describing why AI is unavailable. Only meaningful after
	 * `is_available()` has returned false.
	 *
	 * @return \WP_Error
	 */
	public static function unavailable_error(): \WP_Error {
		if ( ! self::is_module_enabled() ) {
			return new \WP_Error(
				'sptp_ai_module_disabled',
				__( 'Create Team with AI is turned off. Turn it on in the Modules tab of the Smart Team dashboard.', 'team-free' ),
				array( 'status' => 403 )
			);
		}

		return new \WP_Error(
			'sptp_ai_disabled',
			__( 'AI features have been turned off on this site. Ask your site administrator to enable them.', 'team-free' ),
			array( 'status' => 503 )
		);
	}
}
