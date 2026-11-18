<?php
/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      2.0.0
 * @package   Smart_Team
 * @subpackage Smart_Team/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Smart Team Deactivator class
 */
class WP_Team_Deactivator {

	/**
	 * Clear the opt-in diagnostics cron (Admin\Dashboard\Diagnostics::CRON_HOOK).
	 *
	 * The hook name is repeated rather than referenced: deactivation runs outside
	 * the guarded boot, so the Diagnostics class may not be loaded.
	 *
	 * @since    2.0.0
	 */
	public static function deactivate() {
		wp_clear_scheduled_hook( 'spt_diagnostics_weekly' );
	}
}
