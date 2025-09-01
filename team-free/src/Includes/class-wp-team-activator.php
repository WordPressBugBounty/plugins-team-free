<?php
/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      2.0.0
 * @package   Smart_Team
 * @subpackage Smart_Team/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


/**
 * SmartTeam Activator class
 */
class WP_Team_Activator {
	/**
	 * When plugin activate a extra column `order` add to term_taxonomy table
	 *
	 * @since      2.0.0
	 */
	public static function activate() {
	}
}
