<?php
/**
 * Template Name: Social Fields
 *
 * @package team-free
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use ShapedPlugin\WPTeam\Frontend\Helper;
?>

<div class="sptp-member-social-fields">
	<?php
	$sptp_member_social = isset( $member_info['sptp_member_social'] ) ? $member_info['sptp_member_social'] : '';

	if ( $social_switch && $social_section_title && ! empty( $sptp_member_social ) ) {
		?>
		<strong class="sptp-member-social-section-title"><?php esc_html_e( 'Follow Me', 'team-free' ); ?></strong>
		<?php
	}

	if ( $social_switch ) {
		$social_icon_shape = 'rounded';
		include Helper::sptp_locate_template( 'member/social.php' );
	}
	?>
</div>
