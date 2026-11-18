<?php
/**
 * Get database updated to 3.0.9
 *
 * Copies the Member Detail switches into the `member_fields` groups the single
 * page reads. Only `_sptp_settings` is touched, and only by adding keys: the
 * legacy `detail_page_fields` stays where it is so a downgrade, or Smart Team
 * Pro, still reads it. Layout names (`right_content` / `bottom_content`) need
 * no write: `SinglePageSettings::resolve_view()` maps them on read.
 *
 * Pro's 3.0.9 updater also moves the Position/Job Title and Location meta into
 * taxonomy terms and unsets the meta. Free leaves that to `update-4.0.0.php`,
 * which copies the designation and keeps the meta.
 *
 * @package team-free
 * @subpackage team-free/src/Admin/update
 * @since 3.0.9
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Update version.
 */
update_option( 'sp_wp_team_version', '3.0.9' );
update_option( 'sp_wp_team_db_version', '3.0.9' );

\ShapedPlugin\WPTeam\Admin\Dashboard\SinglePageSettings::migrate_legacy_fields();
