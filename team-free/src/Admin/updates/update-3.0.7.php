<?php
/**
 * Get database updated to 3.0.7
 *
 * @package team-free
 * @subpackage team-free/src/Admin/update
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Update version.
 */
update_option( 'sp_wp_team_version', '3.0.7' );
update_option( 'sp_wp_team_db_version', '3.0.7' );


// Delete transient to load new data of remommended plugins.
if ( get_transient( 'spwpteam_plugins' ) ) {
	delete_transient( 'spwpteam_plugins' );
}
