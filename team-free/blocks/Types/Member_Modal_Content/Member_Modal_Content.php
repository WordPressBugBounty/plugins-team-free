<?php
/**
 * Member Modal Content block — the Member Details modal shell.
 *
 * The modal itself IS a block: an InnerBlocks container holding the member
 * field blocks (Member Image, Member Name, Additional Information, …) that make
 * up the popup, plus the shell's own settings — display style, animation,
 * width, close icon, navigation. It lives at the root of a details template
 * (`sptp_member_template`, see Includes\DetailsTemplates) and is rendered for
 * one member by the `sptp_member_details` ajax action, and Pro's frontend
 * runtime injects the markup below and drives open/close/navigation from
 * `data-modal-settings`. Open as Modal is Pro: Free ships neither the ajax
 * action nor the runtime, so this block is only met in Pro-saved content.
 *
 * Dynamic rather than static so the shell markup and its settings JSON stay
 * server-owned — changing either never invalidates a saved template.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Member_Modal_Content;

use ShapedPlugin\WPTeam\Blocks\Includes\AbstractBlock;
use ShapedPlugin\WPTeam\Blocks\Types\Carousel\Carousel;

defined( 'ABSPATH' ) || exit;

/**
 * Class Member_Modal_Content
 */
class Member_Modal_Content extends AbstractBlock {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name     = 'member-modal-content';
		$this->editor_scripts = array( 'sptp-blocks-editor' );
		$this->editor_styles  = array( 'sptp-blocks-editor' );
		$this->styles         = array( 'sptp-blocks-style' );
		$this->is_dynamic     = true;
	}

	/**
	 * Close-icon placements.
	 *
	 * @var array<int, string>
	 */
	private static $icon_positions = array( 'inside-left', 'inside-right', 'outside-left', 'outside-right' );

	/**
	 * Navigation placements — the Carousel block's 7-position set.
	 *
	 * @var array<int, string>
	 */
	private static $nav_positions = array(
		'vertical_center',
		'top_left',
		'top_center',
		'top_right',
		'bottom_left',
		'bottom_center',
		'bottom_right',
	);

	/**
	 * Render the modal shell around the inner field blocks.
	 *
	 * @param array          $attributes Block attributes.
	 * @param string         $content    Rendered inner blocks.
	 * @param \WP_Block|null $block     Block instance.
	 * @return string
	 */
	public function render_block( $attributes, $content = '', $block = null ) {
		$unique_id   = isset( $attributes['uniqueId'] ) ? $attributes['uniqueId'] : '';
		$extra_class = isset( $attributes['additionalCssClass'] ) ? $attributes['additionalCssClass'] : '';
		// WP does not add the align class to a dynamic block's frontend output,
		// so — like every other block here — the renderer emits it itself.
		$align = isset( $attributes['align'] ) ? $attributes['align'] : '';

		$display_style = ( isset( $attributes['displayStyle'] ) && 'slide-in' === $attributes['displayStyle'] ) ? 'slide-in' : 'popup';
		$icon_position = isset( $attributes['closeIconPosition'] ) && in_array( $attributes['closeIconPosition'], self::$icon_positions, true )
			? $attributes['closeIconPosition']
			: 'inside-right';
		$slide_side    = ( isset( $attributes['slideInPosition'] ) && 'left' === $attributes['slideInPosition'] ) ? 'left' : 'right';
		$animation     = isset( $attributes['popupAnimation'] ) ? sanitize_html_class( $attributes['popupAnimation'] ) : 'zoom-out';
		$show_close    = ! isset( $attributes['showCloseIcon'] ) || ! empty( $attributes['showCloseIcon'] );
		$show_nav      = ! empty( $attributes['showNavigation'] );
		$nav_position  = isset( $attributes['navigationPosition'] ) && in_array( $attributes['navigationPosition'], self::$nav_positions, true )
			? $attributes['navigationPosition']
			: 'vertical_center';

		$classes = array_filter(
			array(
				'sp-smart-team-member-modal',
				'sp-smart-team-member-modal--' . $display_style,
				'popup' === $display_style
					? 'sp-smart-team-member-modal--anim-' . $animation
					: 'sp-smart-team-member-modal--side-' . $slide_side,
				'sp-smart-team-member-modal--icon-' . $icon_position,
				$show_nav ? 'sp-smart-team-member-modal--has-nav' : '',
				// Background Overlay off — the scrim element stays (it is the
				// click-outside target) but goes unpainted.
				empty( $attributes['showBackgroundOverlay'] ) && isset( $attributes['showBackgroundOverlay'] )
					? 'sp-smart-team-member-modal--no-overlay'
					: '',
				'' !== $align ? 'align' . $align : '',
				$extra_class,
			)
		);

		// Everything the runtime needs; the rest is CSS the classes above carry.
		$settings = array(
			'displayStyle'        => $display_style,
			'closeOnClickOutside' => ! isset( $attributes['closeOnClickOutside'] ) || ! empty( $attributes['closeOnClickOutside'] ),
			'showNavigation'      => $show_nav,
		);

		ob_start();
		?>
		<div
			<?php if ( $unique_id ) : ?>
				id="<?php echo esc_attr( $unique_id ); ?>"
			<?php endif; ?>
			class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
			data-modal-settings="<?php echo esc_attr( $this->json_attr( $settings ) ); ?>"
			role="dialog"
			aria-modal="true"
		>
			<div class="sp-smart-team-member-modal__overlay"></div>
			<div class="sp-smart-team-member-modal__dialog" role="document">
				<?php if ( $show_close ) : ?>
					<button type="button" class="sp-smart-team-member-modal__close" aria-label="<?php esc_attr_e( 'Close', 'team-free' ); ?>">
						<?php echo self::close_icon_svg(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static inline SVG. ?>
					</button>
				<?php endif; ?>

				<?php if ( $show_nav ) : ?>
					<?php
					// Both arrows are the SAME glyph; style.scss rotates the prev
					// one 180° so even the asymmetric styles flip consistently
					// (the Carousel block's model).
					$nav_icon = Carousel::nav_arrow_svg( isset( $attributes['navigationStyle'] ) ? $attributes['navigationStyle'] : 'chevron-outline' );
					?>
					<div class="sp-smart-team-member-modal__nav-arrows sp-smart-team-member-modal__nav-arrows--<?php echo esc_attr( $nav_position ); ?>">
						<button type="button" class="sp-smart-team-member-modal__nav sp-smart-team-member-modal__nav--prev" aria-label="<?php esc_attr_e( 'Previous member', 'team-free' ); ?>">
							<?php echo $nav_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static inline SVG from nav_arrow_svg(). ?>
						</button>
						<button type="button" class="sp-smart-team-member-modal__nav sp-smart-team-member-modal__nav--next" aria-label="<?php esc_attr_e( 'Next member', 'team-free' ); ?>">
							<?php echo $nav_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static inline SVG from nav_arrow_svg(). ?>
						</button>
					</div>
				<?php endif; ?>

				<div class="sp-smart-team-member-modal__content">
					<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inner blocks, escaped by their own renderers. ?>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Close (✕) glyph — twin of CLOSE_ICON in apps/blocks/member-modal-content/icons.js.
	 *
	 * `currentColor` + a 1em box so the Icon Size / Color controls drive it.
	 *
	 * @return string
	 */
	public static function close_icon_svg() {
		return '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true" focusable="false">'
			. '<path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
			. '</svg>';
	}
}
