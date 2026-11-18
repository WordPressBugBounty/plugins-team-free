<?php
/**
 * Member Phone
 *
 * This template can be overridden by copying it to yourtheme/team-free/templates/member/social.php
 *
 * @package team-free\templates\member
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! isset( $member_info['sptp_member_social'] ) || ! is_array( $member_info['sptp_member_social'] ) || empty( $member_info['sptp_member_social'] ) ) {
	return;
}

?>

<div class="sptp-member-social <?php echo esc_attr( $social_icon_shape ); ?>">
	<?php do_action( 'sp_team_before_member_social' ); ?>
	<ul>
		<?php
		if ( is_array( $member_info['sptp_member_social'] ) && ! empty( $member_info['sptp_member_social'] ) ) {
			foreach ( $member_info['sptp_member_social'] as $social ) {
				if ( isset( $social['social_group'] ) && '' !== $social['social_group'] ) {
					$social_link = $social['social_link'];
					if ( preg_match( '#^https?://#i', $social_link ) ) {
						$social_link = $social_link;
					} elseif ( preg_match( '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $social_link ) ) {
						$social_link = 'mailto:' . $social_link;
					} else {
						$social_link = 'http://' . $social_link;
					}
					?>
					<li>
						<a class="<?php echo 'sptp-' . esc_attr( $social['social_group'] ); ?>" href="<?php echo esc_url( $social_link ); ?>" target="_blank"<?php echo ! empty( $no_follow_text ) ? ' rel="nofollow"' : ''; ?>>
							<?php if ( preg_match( '/icon/', $social['social_group'] ) ) { ?>
								<i class="spteam-icon <?php echo esc_attr( $social['social_group'] ); ?>"></i>
							<?php } else { ?>
								<i class="<?php echo 'fa fa-' . esc_attr( $social['social_group'] ); ?>"></i>
							<?php } ?>
						</a>
					</li>
					<?php
				}
			}
		}
		?>
	</ul>
	<?php do_action( 'sp_team_after_member_social' ); ?>
</div>
