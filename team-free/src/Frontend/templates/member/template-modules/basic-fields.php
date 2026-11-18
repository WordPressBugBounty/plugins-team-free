<?php
/**
 * Template Name: Basic Fields
 *
 * @package wp-team-pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use ShapedPlugin\WPTeam\Admin\Taxonomies\Taxonomies;
use ShapedPlugin\WPTeam\Frontend\Helper;

?>

<div class="sptp-member-basic-fields">
	<?php
	if ( $name_switch ) {
		// The single page keeps its own name-tag filter, separate from the team page's sptp_member_name_tag.
		$sptp_single_name_tag = apply_filters( 'sptp_member_name_tag_for_single_member_page', 'h2' );
		require Helper::sptp_locate_template( 'member/name.php' );
	}

	$member_job_title = Taxonomies::designation( $member->ID, isset( $member_info['sptp_job_title'] ) ? $member_info['sptp_job_title'] : '' );

	if ( $job_position_switch && '' !== $member_job_title ) {
		require Helper::sptp_locate_template( 'member/job_title.php' );
	}
	?>
</div>

