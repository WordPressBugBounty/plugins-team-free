<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * When populating this file, consider the following flow
 * of control:
 *
 * - This method should be static
 * - Check if the $_REQUEST content actually is the plugin name
 * - Run an admin referrer check to make sure it goes through authentication
 * - Verify the output of $_GET makes sense
 * - Repeat with other user roles. Best directly by using the links/query string parameters.
 * - Repeat things for multisite. Once for a single site in the network, once sitewide.
 *
 * This file may be updated more in future version of the Boilerplate; however, this is the
 * general skeleton and outline for how the file should work.
 *
 * For more information, see the following discussion:
 * https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate/pull/123#issuecomment-28541913
 *
 * @link       https://shapedplugin.com
 * @since      2.0.0
 *
 * @package    Smart_Team
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Delete the data only Free uses: version stamps, notices, its uploads folder.
 *
 * @return void
 */
function sptp_free_delete_own_data() {
	foreach ( array(
		'sp_wp_team_version',
		'sp_wp_team_db_version',
		'sp_wp_team_first_version',
		'sp_wp_team_activation_date',
		'sp_wpt_review_notice_dismiss',
		'shapedplugin_offer_banner_dismissed_black_friday_2025',
		'shapedplugin_offer_banner_dismissed_new_year_2026',
		'shapedplugin_bfcm_2026_dismissed',
	) as $sptp_option ) {
		delete_option( $sptp_option );
		delete_site_option( $sptp_option );
	}

	foreach ( array( 'spwpteam_plugins', 'sptp_our_plugins_list', 'sptp_changelogs', 'spt_ready_patterns_manifest' ) as $sptp_transient ) {
		delete_transient( $sptp_transient );
	}

	// The Ready Patterns cache.
	$sptp_upload = wp_upload_dir( null, false );
	sptp_free_delete_dir( trailingslashit( $sptp_upload['basedir'] ) . 'team-free' );
}

/**
 * Delete the data Free shares with Smart Team Pro — only when Pro is gone too.
 * Keep in sync with sptp_pro_delete_shared_data() in Pro's uninstall.php.
 *
 * @return void
 */
function sptp_free_delete_shared_data() {
	global $wpdb;

	foreach ( array(
		'_sptp_settings',
		'sptp_dashboard_options',
		'sptp_ai_settings',
		'sptp_diagnostics',
		'sptp_placements_report',
		'sptp_placements_widgets_modified',
		'sptp_rp_payload_generation',
	) as $sptp_option ) {
		delete_option( $sptp_option );
		delete_site_option( $sptp_option );
	}

	delete_transient( 'sptp_ready_patterns_manifest' );
	foreach ( array( 'openai', 'anthropic', 'google' ) as $sptp_connector ) {
		delete_transient( 'sptp_ai_connector_status_' . $sptp_connector );
		delete_transient( 'sptp_ai_connector_models_' . $sptp_connector );
	}

	$sptp_posts = get_posts(
		array(
			'numberposts' => -1,
			'post_type'   => array( 'sptp_member', 'sptp_generator', 'sptp_saved_template', 'sptp_member_template' ),
			'post_status' => array_keys( get_post_stati() ), // 'any' skips trash and auto-draft.
			'fields'      => 'ids',
		)
	);
	foreach ( $sptp_posts as $sptp_post_id ) {
		wp_delete_post( $sptp_post_id, true );
	}

	delete_post_meta_by_key( '_sptp_add_member' );
	delete_post_meta_by_key( '_sptp_generator' );
	delete_post_meta_by_key( '_sptp_generator_layout' );
	delete_metadata( 'user', 0, 'sptp_ready_patterns_favorites', '', true );

	// The taxonomies aren't registered during uninstall, so get_terms()/wp_delete_term() can't reach them.
	$sptp_taxonomies = array( 'sptp_group', 'sptp_designation', 'sptp_location', 'sptp_language', 'sptp_gender' );
	$sptp_in         = implode( ',', array_fill( 0, count( $sptp_taxonomies ), '%s' ) );
	// phpcs:disable WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	$sptp_terms = $wpdb->get_results( $wpdb->prepare( "SELECT term_id, term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE taxonomy IN ($sptp_in)", $sptp_taxonomies ) );
	foreach ( $sptp_terms as $sptp_term ) {
		$wpdb->delete( $wpdb->term_relationships, array( 'term_taxonomy_id' => $sptp_term->term_taxonomy_id ) );
		$wpdb->delete( $wpdb->term_taxonomy, array( 'term_taxonomy_id' => $sptp_term->term_taxonomy_id ) );
		if ( ! $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->term_taxonomy} WHERE term_id = %d", $sptp_term->term_id ) ) ) {
			$wpdb->delete( $wpdb->termmeta, array( 'term_id' => $sptp_term->term_id ) );
			$wpdb->delete( $wpdb->terms, array( 'term_id' => $sptp_term->term_id ) );
		}
	}
	// phpcs:enable
	foreach ( $sptp_taxonomies as $sptp_taxonomy ) {
		delete_option( $sptp_taxonomy . '_children' );
	}
}

/**
 * Recursively delete a directory.
 *
 * @param string $dir Absolute path.
 * @return void
 */
function sptp_free_delete_dir( $dir ) {
	if ( ! is_dir( $dir ) ) {
		return;
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	if ( WP_Filesystem() ) {
		global $wp_filesystem;
		$wp_filesystem->delete( $dir, true );
	}
}

/**
 * Whether Smart Team Pro is still installed — its data is then not ours to delete.
 *
 * @return bool
 */
function sptp_free_pro_installed() {
	if ( file_exists( WP_PLUGIN_DIR . '/wp-team-pro/wp-team-pro.php' ) ) {
		return true;
	}
	// A re-uploaded zip can land Pro in a renamed folder (`wp-team-pro-1/`).
	if ( ! function_exists( 'get_plugins' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}
	foreach ( get_plugins() as $sptp_plugin_file => $sptp_plugin_data ) {
		$sptp_is_pro = 'wp-team-pro.php' === basename( $sptp_plugin_file ) || ( isset( $sptp_plugin_data['TextDomain'] ) && 'wp-team-pro' === $sptp_plugin_data['TextDomain'] );
		// get_plugins() is cached per request — a bulk delete may already have removed Pro's files.
		if ( $sptp_is_pro && file_exists( WP_PLUGIN_DIR . '/' . $sptp_plugin_file ) ) {
			return true;
		}
	}
	return false;
}

// The opt-in diagnostics cron goes whatever the clean-up setting says.
wp_clear_scheduled_hook( 'spt_diagnostics_weekly' );

$sptp_plugin_settings = get_option( '_sptp_settings' );
$sptp_data_delete     = is_array( $sptp_plugin_settings ) && ! empty( $sptp_plugin_settings['delete_on_remove'] );

if ( $sptp_data_delete ) {
	sptp_free_delete_own_data();
	if ( ! sptp_free_pro_installed() ) {
		sptp_free_delete_shared_data();
	}
}
