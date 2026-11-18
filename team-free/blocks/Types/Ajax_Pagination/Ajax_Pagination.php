<?php
/**
 * Ajax Pagination block — server-rendered.
 *
 * Port of Real Testimonials Pro's ajax-pagination block: renders pagination
 * controls (a Load More button or numbered pages, with optional prev/next
 * arrows) for a Smart Team grid on the same page. The block only emits the
 * static shell — the frontend runtime (blocks/assets/js/script.js) associates
 * it with the nearest preceding sptp/grid, builds the numbered buttons, and
 * pages the grid via the public `sptp_query_members` admin-ajax action
 * (blocks/Includes/Member_Ajax.php). The markup mirrors Pagination.jsx in
 * apps/blocks/ajax-pagination so the dynamic CSS resolves in both views.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Ajax_Pagination;

use ShapedPlugin\WPTeam\Blocks\Includes\AbstractBlock;

defined( 'ABSPATH' ) || exit;

/**
 * Class Ajax_Pagination
 */
class Ajax_Pagination extends AbstractBlock {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name     = 'ajax-pagination';
		$this->editor_scripts = array( 'sptp-blocks-editor' );
		$this->editor_styles  = array( 'sptp-blocks-editor' );
		// Declared as `style` so WP enqueues it in BOTH editor and frontend.
		$this->styles     = array( 'sptp-blocks-style' );
		$this->is_dynamic = true;
	}

	/**
	 * Render the Ajax Pagination block on the frontend (twin of testimonial-pro's
	 * AjaxPagination::render_callback). Settings the runtime needs ride in the
	 * data-pagination JSON on the wrapper.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Inner block content.
	 * @param mixed  $block      Block instance.
	 * @return string Rendered HTML output.
	 */
	public function render_block( $attributes, $content = '', $block = null ) {
		$unique_id   = $attributes['uniqueId'] ?? '';
		$extra_class = $attributes['additionalCssClass'] ?? '';
		$align       = $attributes['align'] ?? '';

		$pagination_type = $attributes['paginationType'] ?? 'normal';
		$button_type     = isset( $attributes['paginationButtonType'] ) && 'number' === $attributes['paginationButtonType'] ? 'number' : 'load-more';
		$number_type     = $attributes['paginationNumberType'] ?? 'number';
		$number_type     = in_array( $number_type, array( 'number', 'number-arrow', 'number-prev-next-arrow', 'prev-next' ), true ) ? $number_type : 'number';

		$load_more_label = isset( $attributes['loadMoreLabel'] ) && '' !== $attributes['loadMoreLabel'] ? $attributes['loadMoreLabel'] : __( 'Load More', 'team-free' );
		$ending_message  = isset( $attributes['endingMessage'] ) && '' !== $attributes['endingMessage'] ? $attributes['endingMessage'] : __( 'No more members', 'team-free' );
		$prev_label      = isset( $attributes['paginationPrevLabel'] ) && '' !== $attributes['paginationPrevLabel'] ? $attributes['paginationPrevLabel'] : __( 'Prev', 'team-free' );
		$next_label      = isset( $attributes['paginationNextLabel'] ) && '' !== $attributes['paginationNextLabel'] ? $attributes['paginationNextLabel'] : __( 'Next', 'team-free' );

		$items_per_page = isset( $attributes['itemPerPage']['value'] ) ? max( 1, (int) $attributes['itemPerPage']['value'] ) : 12;
		$number_links   = isset( $attributes['paginationNumberOfLinks']['value'] ) ? max( 1, (int) $attributes['paginationNumberOfLinks']['value'] ) : 2;

		$has_arrows = in_array( $number_type, array( 'number-arrow', 'number-prev-next-arrow', 'prev-next' ), true );

		// Next/Previous Button Style: 'label' | 'icon' | 'label-icon'.
		$next_prev_style = $attributes['paginationNextPrevStyle'] ?? 'icon';
		$next_prev_style = in_array( $next_prev_style, array( 'label', 'icon', 'label-icon' ), true ) ? $next_prev_style : 'icon';
		$show_np_icon    = 'label' !== $next_prev_style;
		$show_np_label   = 'icon' !== $next_prev_style;

		// Alignment is responsive → emitted as justify-content by the dynamic
		// CSS (Styles/Ajax_Pagination.php), not a modifier class.
		$pagination_settings = array(
			'itemsPerPage'         => $items_per_page,
			'paginationType'       => $pagination_type,
			'paginationButtonType' => $button_type,
			'paginationNumberType' => $number_type,
			// Page links shown on each side of the current page before the
			// runtime collapses to "…" (WP paginate_links mid_size).
			'numberOfLinks'        => $number_links,
			// Load More only: auto-load the next page when the button scrolls
			// into view.
			'infiniteScroll'       => ! empty( $attributes['infiniteScroll'] ),
		);

		// The paging runtime — registered by AssetManager, loaded only when this
		// block is on the page.
		wp_enqueue_script( 'sptp-blocks-frontend' );

		$classes = array_filter(
			array(
				'sp-smart-team-ajax-pagination',
				'' !== $align ? 'align' . $align : '',
				$extra_class,
			)
		);
		// Always the uniqueId — dynamic CSS anchors to it; the Advanced Custom
		// CSS ID is added as an outer wrapper by render_block_callback().
		$html_id = $unique_id;

		$chevron = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3.5 1.5 7 5 3.5 8.5"/></svg>';

		ob_start();
		?>
		<div
			<?php
			if ( $html_id ) :
				?>
				id="<?php echo esc_attr( $html_id ); ?>"<?php endif; ?>
			class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
		>
			<div
				class="sp-smart-team-ajax-pagination__wrapper"
				data-pagination="<?php echo esc_attr( $this->json_attr( $pagination_settings ) ); ?>"
			>
				<?php if ( 'load-more' === $button_type ) : ?>
					<div class="sp-smart-team-ajax-pagination__load-more">
						<?php if ( ! empty( $attributes['infiniteScroll'] ) ) : ?>
							<?php // Infinite Scroll (WP Carousel Pro's model): a sentinel replaces the button. ?>
							<span class="sp-smart-team-ajax-pagination__sentinel" aria-hidden="true"></span>
							<span class="sp-smart-team-ajax-pagination__spinner" role="status" aria-label="<?php esc_attr_e( 'Loading more members', 'team-free' ); ?>"></span>
						<?php else : ?>
							<a href="#" class="sp-smart-team-ajax-pagination__item" data-page="1">
								<?php echo esc_html( $load_more_label ); ?>
							</a>
						<?php endif; ?>
						<span class="sp-smart-team-ajax-pagination__ending" hidden>
							<?php echo esc_html( $ending_message ); ?>
						</span>
					</div>
				<?php endif; ?>
				<?php if ( 'number' === $button_type ) : ?>
					<div class="sp-smart-team-ajax-pagination__buttons" data-page="1">
						<?php if ( $has_arrows ) : ?>
							<!-- prev button -->
							<a href="#" class="sp-smart-team-ajax-pagination__item sp-smart-team-ajax-pagination__item--prev is-disabled">
								<?php if ( $show_np_icon ) : ?>
									<span class="sp-smart-team-ajax-pagination__prev-icon"><?php echo $chevron; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG. ?></span>
								<?php endif; ?>
								<?php
								if ( $show_np_label ) {
									echo esc_html( $prev_label );
								}
								?>
							</a>
							<!-- next button -->
							<a href="#" class="sp-smart-team-ajax-pagination__item sp-smart-team-ajax-pagination__item--next">
								<?php
								if ( $show_np_label ) {
									echo esc_html( $next_label );
								}
								?>
								<?php if ( $show_np_icon ) : ?>
									<span class="sp-smart-team-ajax-pagination__next-icon"><?php echo $chevron; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG. ?></span>
								<?php endif; ?>
							</a>
						<?php endif; ?>
					</div>
				<?php endif; ?>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}
}
