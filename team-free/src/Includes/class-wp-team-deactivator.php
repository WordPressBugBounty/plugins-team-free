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
 * SmartTeam Deactivator class
 */
class WP_Team_Deactivator {

	/**
	 * When plugin activate drop `order` column from term_taxonomy table.
	 *
	 * @since    2.0.0
	 */
	public static function deactivate() {
	}
}
