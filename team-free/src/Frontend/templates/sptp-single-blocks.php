<?php
/**
 * Member single page — the Block template source on a classic theme.
 *
 * Core resolves block templates only on block themes, so here the member blocks
 * (the latest Site Editor design, else the starter blocks) render inside the
 * theme's own header and footer.
 * This template can be overridden by copying it to yourtheme/team-free/templates/sptp-single-blocks.php
 *
 * @package team-free
 */

defined( 'ABSPATH' ) || exit;

use ShapedPlugin\WPTeam\Blocks\Includes\MemberTemplate;

// A classic theme's single.php owns the content container; this template has to bring its own. The photo is capped
// because a classic theme has no Site Editor to resize it, and at 100% of the column it dwarfs the page.
wp_add_inline_style(
	'sptp-blocks-style',
	'.sptp-single-blocks{box-sizing:border-box;max-width:760px;margin:48px auto;padding:0 20px}.sptp-single-blocks>*+*{margin-top:24px}.sptp-single-blocks--default>.sp-smart-team-member-image{max-width:400px}'
);

get_header();
?>
<div class="sptp-single-blocks<?php echo MemberTemplate::has_saved_design() ? '' : ' sptp-single-blocks--default'; ?>">
	<?php
	while ( have_posts() ) {
		the_post();
		foreach ( MemberTemplate::member_blocks() as $sptp_block ) {
			echo render_block( $sptp_block ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- block render output.
		}
	}
	?>
</div>
<?php
get_footer();
