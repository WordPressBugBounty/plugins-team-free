<?php
/**
 * Member Template One.
 *
 * @package WP_Team_Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use ShapedPlugin\WPTeam\Frontend\Helper;

?>

<div class="sptp-member-template-<?php echo esc_attr( $single_page_view ); ?> text-left">
	<div class="sptp-member-template-row-one">
		<div class="sptp-member-template-row-one-left">
			<?php
				require Helper::sptp_locate_template( 'member/template-modules/image-fields.php' );
			?>
		</div>
		<div class="sptp-member-template-row-one-right">
			<?php
				require Helper::sptp_locate_template( 'member/template-modules/basic-fields.php' );
				require Helper::sptp_locate_template( 'member/template-modules/skill-fields.php' );
				require Helper::sptp_locate_template( 'member/template-modules/social-fields.php' );
			?>
		</div>
	</div>
	<div class="sptp-member-template-row-two-full">
		<?php
			require Helper::sptp_locate_template( 'member/template-modules/biography-fields.php' );
		?>
	</div>
</div>