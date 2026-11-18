<?php
/**
 * Template Name: Skill Fields
 *
 * @package team-free
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use ShapedPlugin\WPTeam\Frontend\Helper;
?>

<div class="sptp-member-skill-bar-fields">
	<?php
	$member_skill = isset( $member_info['sptp_skills'] ) ? $member_info['sptp_skills'] : '';

	if ( $skill_bar_switch && ! empty( $member_skill ) ) {
		if ( $skill_section_title ) {
			?>
			<strong class="sptp-member-skill-section-title"><?php esc_html_e( 'Skills', 'team-free' ); ?></strong>
			<?php
		}

		include Helper::sptp_locate_template( 'member/skill.php' );
	}
	?>
</div>
