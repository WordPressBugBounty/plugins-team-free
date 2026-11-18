<?php
/**
 * Member name
 *
 * This template can be overridden by copying it to yourtheme/team-free/templates/member/name.php
 *
 * @package team-free\templates\member
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// The single member page passes its own tag (sptp_member_name_tag_for_single_member_page); team layouts use sptp_member_name_tag.
$title_tag = isset( $sptp_single_name_tag ) ? $sptp_single_name_tag : apply_filters( 'sptp_member_name_tag', 'h2' );
?>

<div class="sptp-member-name">
	<?php do_action( 'sp_team_before_member_name' ); ?>
	<<?php echo esc_html( $title_tag ); ?> class='sptp-member-name-title'><?php echo wp_kses_post( $member->post_title ); ?></<?php echo esc_html( $title_tag ); ?>>
	<?php do_action( 'sp_team_after_member_name' ); ?>
</div>
