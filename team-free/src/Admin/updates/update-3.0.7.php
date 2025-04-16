<?php
/**
 * Update version.
 */
update_option( 'sp_wp_team_version', '3.0.7' );
update_option( 'sp_wp_team_db_version', '3.0.7' );


// Delete transient to load new data of remommended plugins.
if ( get_transient( 'spwpteam_plugins' ) ) {
	delete_transient( 'spwpteam_plugins' );
}
