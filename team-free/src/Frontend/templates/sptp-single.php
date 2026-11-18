<?php
/**
 * Single view template for member.
 *
 * @package team-free
 * @subpackage team-free\Frontend\templates
 * @since 2.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use ShapedPlugin\WPTeam\Admin\Dashboard\SinglePageSettings;
use ShapedPlugin\WPTeam\Frontend\Helper;

if ( function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() ) {
	// A block theme has no header.php to print the document skeleton; without the doctype the page renders in quirks mode.
	// The parts render before wp_head(), as core's template-canvas.php does, so their script modules (Navigation) reach the import map.
	ob_start();
	block_header_area();
	$sptp_block_header = ob_get_clean();
	ob_start();
	block_footer_area();
	$sptp_block_footer = ob_get_clean();
	?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
	<?php wp_body_open(); ?>
<div class="wp-site-blocks">
	<header class="wp-block-template-part site-header">
		<?php echo $sptp_block_header; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-rendered template part. ?>
	</header>
	<?php
} else {
	get_header();
}

$sptp_settings    = get_option( '_sptp_settings' );
$sptp_link_mailto = isset( $sptp_settings['link_mailto'] ) ? $sptp_settings['link_mailto'] : '';
$sptp_no_follow   = isset( $sptp_settings['no_follow'] ) ? $sptp_settings['no_follow'] : '';
// Templates Three to Six are Pro-only: they render as Template One and the stored value is left as is.
$single_page_view = SinglePageSettings::resolve_view( isset( $sptp_settings['single_page_view'] ) ? $sptp_settings['single_page_view'] : '' );

/**
 * Member Fields.
 */
$member_fields = isset( $sptp_settings['member_fields'] ) ? $sptp_settings['member_fields'] : array();

// Member Image Fields.
$member_image_fields = isset( $member_fields['member_image_fields'] ) ? $member_fields['member_image_fields'] : array();
$image_switch        = isset( $member_image_fields['image_switch'] ) ? $member_image_fields['image_switch'] : true;

// Member Basic Fields.
$member_basic_fields = isset( $member_fields['member_basic_fields'] ) ? $member_fields['member_basic_fields'] : array();
$name_switch         = isset( $member_basic_fields['name_switch'] ) ? $member_basic_fields['name_switch'] : true;
$job_position_switch = isset( $member_basic_fields['job_position_switch'] ) ? $member_basic_fields['job_position_switch'] : true;

// Member Skill Bar Fields.
$member_skill_bar_fields = isset( $member_fields['member_skill_bar_fields'] ) ? $member_fields['member_skill_bar_fields'] : array();
$skill_section_title     = isset( $member_skill_bar_fields['section_title'] ) ? $member_skill_bar_fields['section_title'] : true;
$skill_bar_switch        = isset( $member_skill_bar_fields['skill_bar_switch'] ) ? $member_skill_bar_fields['skill_bar_switch'] : true;

// Member Social Fields.
$member_social_profile_fields = isset( $member_fields['member_social_profile_fields'] ) ? $member_fields['member_social_profile_fields'] : array();
$social_section_title         = isset( $member_social_profile_fields['section_title'] ) ? $member_social_profile_fields['section_title'] : true;
$social_switch                = isset( $member_social_profile_fields['social_switch'] ) ? $member_social_profile_fields['social_switch'] : true;

// Member Biography Fields.
$member_biography_fields = isset( $member_fields['member_biography_fields'] ) ? $member_fields['member_biography_fields'] : array();
$biography_section_title = isset( $member_biography_fields['section_title'] ) ? $member_biography_fields['section_title'] : true;
$biography_switch        = isset( $member_biography_fields['biography_switch'] ) ? $member_biography_fields['biography_switch'] : true;

// Social links get rel="nofollow" only when the No Follow setting is on (as in Pro).
$no_follow_text = $sptp_no_follow ? ' rel="nofollow"' : '';


// Start the loop.
while ( have_posts() ) :
	the_post();
	$member_info = get_post_meta( get_the_ID(), '_sptp_add_member', true );

	$member = $post;
	?>

	<div id="post-sptp-<?php the_ID(); ?>" <?php post_class( 'sptp-single-post ' . $single_page_view ); ?>>
		<div class="sptp-info">

			<?php
			// Single Page Template.
			switch ( $single_page_view ) {
				case 'two':
					include Helper::sptp_locate_template( 'member/member-templates/template-two.php' );
					break;

				case 'one':
				default:
					include Helper::sptp_locate_template( 'member/member-templates/template-one.php' );
			}
			?>
		</div>
	</div>

	<?php
	endwhile;
	wp_reset_postdata();

if ( function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() ) {
	?>
	<footer class="wp-block-template-part site-footer">
		<?php echo $sptp_block_footer; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-rendered template part. ?>
	</footer>
</div>
	<?php
	wp_footer();
	?>
</body>
</html>
	<?php
} else {
	get_footer();
}
