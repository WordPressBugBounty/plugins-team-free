<?php
/**
 * Get database updated to 4.0.0
 *
 * Copies each member's Position/Job Title (the `sptp_job_title` key of the
 * `_sptp_add_member` meta) into the `sptp_designation` taxonomy, the way Smart
 * Team Pro stores it. Unlike Pro's 3.2.6 updater the meta is left in place, so
 * the classic field and downgrades keep working.
 *
 * Also switches the White Label Branding module on for sites that renamed their
 * labels in the classic Settings → Custom Menu section. The module ships off
 * and, while off, renders the default labels — without this those sites would
 * silently lose their custom Member / Teams names on update.
 *
 * @package team-free
 * @subpackage team-free/src/Admin/update
 */

use ShapedPlugin\WPTeam\Admin\Taxonomies\Taxonomies;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Update version.
 */
update_option( 'sp_wp_team_version', '4.0.0' );
update_option( 'sp_wp_team_db_version', '4.0.0' );

$sptp_classic = get_option( '_sptp_settings', array() );
$sptp_classic = is_array( $sptp_classic ) ? $sptp_classic : array();

$sptp_dashboard = get_option( 'sptp_dashboard_options', array() );
$sptp_dashboard = is_array( $sptp_dashboard ) ? $sptp_dashboard : array();

// The values the classic section saved as its defaults — 'Team' is the pre-3.0.0 one.
$sptp_label_defaults = array(
	'rename_member_singular' => array( 'Member' ),
	'rename_member_plural'   => array( 'Members' ),
	'rename_team'            => array( 'Teams', 'Team' ),
	'rename_group_singular'  => array( 'Department' ),
	'rename_group_plural'    => array( 'Departments' ),
);

$sptp_has_custom_labels = false;
foreach ( $sptp_label_defaults as $sptp_key => $sptp_defaults ) {
	if ( ! empty( $sptp_classic[ $sptp_key ] ) && ! in_array( trim( (string) $sptp_classic[ $sptp_key ] ), $sptp_defaults, true ) ) {
		$sptp_has_custom_labels = true;
		break;
	}
}

// Never override a choice the admin already made on the Modules page.
$sptp_modules = isset( $sptp_dashboard['modules'] ) && is_array( $sptp_dashboard['modules'] ) ? $sptp_dashboard['modules'] : array();

if ( $sptp_has_custom_labels && ! isset( $sptp_modules['white_label'] ) ) {
	$sptp_modules['white_label'] = true;
	$sptp_dashboard['modules']   = $sptp_modules;
	update_option( 'sptp_dashboard_options', $sptp_dashboard );
}

/**
 * Every live 3.0.x site is already past the 3.0.9 updater, so its Member Detail
 * switches (`detail_page_fields`) are copied here as well. Add-only.
 */
\ShapedPlugin\WPTeam\Admin\Dashboard\SinglePageSettings::migrate_legacy_fields();

/**
 * Taxonomies are registered on `init`, so the copy waits for it (after the
 * registration at the default priority).
 */
add_action(
	'init',
	function () {
		$member_ids = get_posts(
			array(
				'post_type'      => 'sptp_member',
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'no_found_rows'  => true,
			)
		);

		foreach ( $member_ids as $member_id ) {
			// Already has a designation (e.g. set by Pro): leave it alone.
			if ( has_term( '', Taxonomies::DESIGNATION, $member_id ) ) {
				continue;
			}

			$member_data = get_post_meta( $member_id, '_sptp_add_member', true );

			if ( ! is_array( $member_data ) || empty( $member_data['sptp_job_title'] ) ) {
				continue;
			}

			Taxonomies::set_term( $member_id, sanitize_text_field( $member_data['sptp_job_title'] ) );
		}
	},
	999
);
