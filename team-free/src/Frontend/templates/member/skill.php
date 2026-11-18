<?php
/**
 * Member Phone
 *
 * This template can be overridden by copying it to yourtheme/team-free/templates/member/skill.php
 *
 * @package team-free\templates\member
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>

<div class="sptp-member-skill-progress">
	<?php do_action( 'sp_team_pro_before_member_skill' ); ?>
		<?php
		foreach ( $member_info['sptp_skills'] as $key => $skill ) :
			if ( isset( $skill['sptp_skill_name'] ) && ! empty( $skill['sptp_skill_name'] ) && ( $skill['sptp_skill_percentage'] > 0 ) ) {
				$skill_percent = $skill['sptp_skill_percentage'] . '%';
				?>
				<span class="sptp-progress-text color-palette-<?php echo esc_attr( $key ); ?>"><?php echo esc_attr( $skill['sptp_skill_name'] ); ?></span>
				<div class="sptp-progress-container color-palette-<?php echo esc_attr( $key ); ?>" data-title="<?php echo esc_attr( $skill_percent ); ?>">
					<div class="sptp-progress-bar sptp-tooltip">
						<div class="sptp-top">
							<?php echo esc_html( $skill_percent ); ?>
						</div>
					</div>
				</div>
				<?php
			}
		endforeach;
		?>
	<?php do_action( 'sp_team_pro_after_member_skill' ); ?>
</div>
