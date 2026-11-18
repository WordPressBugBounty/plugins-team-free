<?php
/**
 * Grid block — server-rendered.
 *
 * Displays `sptp_member` members in a responsive grid, fetched through
 * MemberQuery. The whole card render pipeline lives in the shared
 * MemberLayoutBlock base (card designs card-1 … card-11 are described in
 * CLAUDE.md); this class contributes only the grid wrapper: the `__items`
 * grid track, the `__cell` per-card wrapper and the ajax data attributes.
 * The wrapper markup is the twin of apps/blocks/grid/edit.jsx.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Grid;

use ShapedPlugin\WPTeam\Blocks\Includes\MemberLayoutBlock;

defined( 'ABSPATH' ) || exit;

/**
 * Class Grid
 */
class Grid extends MemberLayoutBlock {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name      = 'grid';
		$this->editor_scripts  = array( 'sptp-blocks-editor' );
		$this->editor_styles   = array( 'sptp-blocks-editor' );
		$this->styles          = array( 'sptp-blocks-style', 'sp_team_fontawesome', 'sp_team_fontello' );
		$this->is_dynamic      = true;
		$this->card_cell_class = 'sp-smart-team-grid__cell';
	}

	/**
	 * Render the grid on the frontend (markup twin of edit.jsx).
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Inner block content.
	 * @param mixed  $block      Block instance.
	 * @return string Rendered HTML output.
	 */
	public function render_block( $attributes, $content = '', $block = null ) {
		$unique_id   = isset( $attributes['uniqueId'] ) ? $attributes['uniqueId'] : '';
		$extra_class = isset( $attributes['additionalCssClass'] ) ? $attributes['additionalCssClass'] : '';
		$align       = isset( $attributes['align'] ) ? $attributes['align'] : '';

		$settings    = $this->prepare_render_settings( $attributes );
		$card_design = $settings['card_design'];

		list( $query, $total_members, $post_limit ) = $this->query_first_page( $attributes );

		$image_position      = isset( $attributes['imagePosition'] ) ? $attributes['imagePosition'] : 'left';
		$image_area_position = isset( $attributes['imageAreaPosition'] ) ? $attributes['imageAreaPosition'] : 'left';

		$classes = array_filter(
			array(
				'sp-smart-team-grid',
				'sp-smart-team-grid--' . $card_design,
				'card-2' === $card_design && 'left' === $image_position ? 'sp-smart-team-grid--image-left' : '',
				'card-5' === $card_design && 'right' === $image_position ? 'sp-smart-team-grid--image-right' : '',
				'card-9' === $card_design && 'right' === $image_area_position ? 'sp-smart-team-grid--image-right' : '',
				'' !== $align ? 'align' . $align : '',
				$extra_class,
			)
		);

		// Always the uniqueId — dynamic CSS anchors to it; the Advanced Custom
		// CSS ID is added as an outer wrapper by render_block_callback().
		$html_id = $unique_id;

		ob_start();
		?>
		<div
			<?php
			if ( $html_id ) :
				?>
				id="<?php echo esc_attr( $html_id ); ?>"<?php endif; ?>
			class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
			data-post-id="<?php echo esc_attr( get_the_ID() ); ?>"
			<?php // The ajax lookup recovers the block's saved attributes by this uniqueId. ?>
			data-unique-id="<?php echo esc_attr( $unique_id ); ?>"
			data-total-members="<?php echo esc_attr( $total_members ); ?>"
			data-limit="<?php echo esc_attr( $post_limit ); ?>"
			<?php echo $this->details_root_attrs( $settings ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in details_root_attrs(). ?>
		>
			<?php if ( ! $query->have_posts() ) : ?>
				<p class="sp-smart-team-grid__empty"><?php echo esc_html__( 'No team members found.', 'team-free' ); ?></p>
			<?php else : ?>
				<div class="sp-smart-team-grid__items">
					<?php echo $this->render_cards_html( $settings, $query ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in render_card(). ?>
				</div>
			<?php endif; ?>
		</div>
		<?php
		return ob_get_clean();
	}
}
