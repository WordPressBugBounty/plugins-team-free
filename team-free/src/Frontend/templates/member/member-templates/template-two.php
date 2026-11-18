<?php
/**
 * Member Template Two.
 *
 * @package WP_Team_Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use ShapedPlugin\WPTeam\Frontend\Helper;

?>

<div class="sptp-member-template-<?php echo esc_attr( $single_page_view ); ?> text-center">
	<div class="sptp-member-template-row-two-full">
		<?php
			require Helper::sptp_locate_template( 'member/template-modules/image-fields.php' );
			require Helper::sptp_locate_template( 'member/template-modules/basic-fields.php' );
			require Helper::sptp_locate_template( 'member/template-modules/skill-fields.php' );
			require Helper::sptp_locate_template( 'member/template-modules/social-fields.php' );
			require Helper::sptp_locate_template( 'member/template-modules/biography-fields.php' );
		?>
	</div>
</div>