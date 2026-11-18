<?php
/**
 * Member Modal Content — per-block dynamic CSS.
 *
 * Twin of apps/blocks/member-modal-content/dynamicCss.js. Keep in lock-step:
 * same selectors, same breakpoints, same property order.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\Styles
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Styles;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Css_Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Member_Modal_Content
 */
class Member_Modal_Content {

	/**
	 * Block attributes.
	 *
	 * @var array
	 */
	public $attributes = array();

	/**
	 * Block unique id.
	 *
	 * @var string
	 */
	public $unique_id = '';

	/**
	 * Constructor.
	 *
	 * @param array $attributes Block attributes.
	 */
	public function __construct( $attributes ) {
		$this->attributes = $attributes;
		$this->unique_id  = isset( $attributes['uniqueId'] ) ? $attributes['uniqueId'] : '';
	}

	/**
	 * Responsive rules for one device.
	 *
	 * @param string $device Desktop|Tablet|Mobile.
	 * @return array<int, array>
	 */
	private function modal_responsive_css( $device ) {
		$attributes = $this->attributes;
		$base       = '#' . $this->unique_id;
		$dialog     = $base . ' .sp-smart-team-member-modal__dialog';
		$content    = $base . ' .sp-smart-team-member-modal__content';
		$close      = $base . ' .sp-smart-team-member-modal__close';
		$rules      = array();

		// The dialog box: size per device.
		$dialog_styles = array(
			'width'      => Css_Helpers::single_responsive_value( $attributes['modalWidth'] ?? array(), $device ),
			'max-height' => Css_Helpers::single_responsive_value( $attributes['modalMaxHeight'] ?? array(), $device ),
		);

		// Padding goes on the SCROLL CONTAINER, not the dialog — see style.scss:
		// on the dialog it would inset the scrollbar away from the modal's edge.
		$rules[] = array(
			'selector' => $content,
			'styles'   => array(
				'padding' => Css_Helpers::responsive_spacing_value( $attributes['modalPadding'] ?? array(), $device ),
			),
		);

		// Close icon: the glyph is a 1em box, so font-size IS the icon size.
		// Padding is responsive, so it rides every pass (unlike the paint below).
		$close_styles = array(
			'font-size' => Css_Helpers::single_responsive_value( $attributes['closeIconSize'] ?? array(), $device ),
			'padding'   => Css_Helpers::responsive_spacing_value( $attributes['closeIconPadding'] ?? array(), $device ),
		);

		// The offset rides a custom property on the root and style.scss decides
		// which edges each `--icon-{position}` modifier applies it to — so
		// neither twin has to branch on the position.
		$rules[] = array(
			'selector' => $base,
			'styles'   => array(
				'--sptp-modal-close-offset' => Css_Helpers::single_responsive_value( $attributes['closeIconOffset'] ?? array(), $device ),
			),
		);

		// Navigation — the arrow row's placement (Offset → the edges the chosen
		// position uses) and the glyph size. The SVGs carry fixed width/height
		// attributes, so the size has to hit the svg, not the button's font-size.
		if ( ! empty( $attributes['showNavigation'] ) ) {
			$offset    = Css_Helpers::single_responsive_value( $attributes['navigationOffset'] ?? array(), $device );
			$position  = isset( $attributes['navigationPosition'] ) ? $attributes['navigationPosition'] : 'vertical_center';
			$is_bottom = in_array( $position, array( 'bottom_left', 'bottom_center', 'bottom_right' ), true );
			$nav_size  = Css_Helpers::single_responsive_value( $attributes['navigationIconSize'] ?? array(), $device );

			// One Offset, unlike the carousel's X/Y pair: it insets the row from
			// the edges its placement uses. `vertical_center` keeps its 50%
			// anchor (the translate in style.scss re-centers it) and spends the
			// offset on the left/right inset only — an offset there would push
			// it off-centre.
			$placement = array(
				'left'  => $offset,
				'right' => $offset,
			);
			if ( 'vertical_center' === $position ) {
				// A constant, not a responsive value — emit it once and let it
				// cascade, instead of repeating it in every media query.
				if ( 'Desktop' === $device ) {
					$placement['top'] = '50%';
				}
			} elseif ( $is_bottom ) {
				$placement['bottom'] = $offset;
			} else {
				$placement['top'] = $offset;
			}

			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-member-modal__nav-arrows',
				'styles'   => $placement,
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-member-modal__nav svg',
				'styles'   => array(
					'width'  => $nav_size,
					'height' => $nav_size,
				),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-member-modal__nav',
				'styles'   => array(
					'padding' => Css_Helpers::responsive_spacing_value( $attributes['navigationIconPadding'] ?? array(), $device ),
				),
			);
		}

		// Non-responsive paint — Desktop pass only, exactly like every other twin.
		if ( 'Desktop' === $device ) {
			$dialog_styles = array_merge(
				$dialog_styles,
				array(
					'border-radius' => Css_Helpers::spacing_shorthand_value( $attributes['modalRadius'] ?? array() ),
					'box-shadow'    => Css_Helpers::box_shadow_css( $attributes['modalBoxShadow'] ?? array() ),
				),
				Css_Helpers::background_styles( $attributes['modalBg'] ?? array() ),
				Css_Helpers::border_styles( $attributes['modalBorder'] ?? array(), $attributes['modalBorderWidth'] ?? array() )
			);

			$close_styles = array_merge( $close_styles, $this->button_styles( 'closeIcon' ) );

			// Painted only while Background Overlay is on; with it off the
			// `--no-overlay` class in style.scss zeroes the scrim instead.
			if ( ! empty( $attributes['showBackgroundOverlay'] ) ) {
				$rules[] = array(
					'selector' => $base . ' .sp-smart-team-member-modal__overlay',
					'styles'   => array( 'background-color' => isset( $attributes['overlayColor'] ) ? $attributes['overlayColor'] : '' ),
				);
			}
		}

		$rules[] = array(
			'selector' => $dialog,
			'styles'   => $dialog_styles,
		);
		$rules[] = array(
			'selector' => $close,
			'styles'   => $close_styles,
		);

		if ( 'Desktop' === $device ) {
			$rules[] = array(
				'selector' => $close . ':hover',
				'styles'   => $this->button_hover_styles( 'closeIcon' ),
			);

			if ( ! empty( $attributes['showNavigation'] ) ) {
				$rules[] = array(
					'selector' => $base . ' .sp-smart-team-member-modal__nav',
					'styles'   => $this->button_styles( 'navigationIcon' ),
				);
				$rules[] = array(
					'selector' => $base . ' .sp-smart-team-member-modal__nav:hover',
					'styles'   => $this->button_hover_styles( 'navigationIcon' ),
				);
			}
		}

		return $rules;
	}

	/**
	 * Normal-state paint for one of the two chrome buttons (close /
	 * navigation) — the same shape for both, only the attribute prefix differs.
	 * Twin of buttonStyles() in dynamicCss.js.
	 *
	 * @param string $prefix Attribute prefix (`closeIcon` | `navigationIcon`).
	 * @return array<string, string>
	 */
	private function button_styles( $prefix ) {
		return array_merge(
			array(
				'color'         => isset( $this->attributes[ $prefix . 'Color' ] ) ? $this->attributes[ $prefix . 'Color' ] : '',
				'border-radius' => Css_Helpers::spacing_shorthand_value( $this->attributes[ $prefix . 'Radius' ] ?? array() ),
			),
			Css_Helpers::background_styles( $this->attributes[ $prefix . 'Bg' ] ?? array() ),
			Css_Helpers::border_styles(
				$this->attributes[ $prefix . 'Border' ] ?? array(),
				$this->attributes[ $prefix . 'BorderWidth' ] ?? array()
			)
		);
	}

	/**
	 * Hover paint. A hover state that emits NOTHING cannot switch anything off —
	 * the normal rule keeps painting on hover — so a Border of None must CANCEL
	 * the normal one, and via a transparent color rather than
	 * `border-style: none` so the button keeps its size (the documented rule for
	 * every per-state pair here). Twin of buttonHoverStyles() in dynamicCss.js.
	 *
	 * @param string $prefix Attribute prefix (`closeIcon` | `navigationIcon`).
	 * @return array<string, string>
	 */
	private function button_hover_styles( $prefix ) {
		$normal_border = Css_Helpers::border_styles(
			$this->attributes[ $prefix . 'Border' ] ?? array(),
			$this->attributes[ $prefix . 'BorderWidth' ] ?? array()
		);
		$hover_border  = Css_Helpers::border_styles(
			$this->attributes[ $prefix . 'BorderHover' ] ?? array(),
			$this->attributes[ $prefix . 'BorderWidthHover' ] ?? array()
		);

		if ( empty( $hover_border ) && ! empty( $normal_border ) ) {
			$hover_border = array( 'border-color' => 'transparent' );
		}

		// The hover state lives on the SAME background object, under `hover`.
		$bg = $this->attributes[ $prefix . 'Bg' ] ?? array();

		return array_merge(
			array( 'color' => isset( $this->attributes[ $prefix . 'ColorHover' ] ) ? $this->attributes[ $prefix . 'ColorHover' ] : '' ),
			Css_Helpers::background_styles( array( 'color' => $bg['hover'] ?? array() ) ),
			$hover_border
		);
	}

	/**
	 * Build the block's CSS.
	 *
	 * @return string
	 */
	public function generate() {
		if ( '' === $this->unique_id ) {
			return '';
		}

		$desktop = Css_Helpers::object_to_css_string( $this->modal_responsive_css( 'Desktop' ) );
		$tablet  = Css_Helpers::wrap_in_media_query(
			Css_Helpers::object_to_css_string( $this->modal_responsive_css( 'Tablet' ) ),
			'only screen and (max-width: 1023px)'
		);
		$mobile  = Css_Helpers::wrap_in_media_query(
			Css_Helpers::object_to_css_string( $this->modal_responsive_css( 'Mobile' ) ),
			'only screen and (max-width: 599px)'
		);

		return $desktop . ' ' . $tablet . ' ' . $mobile . ' ' . CommonDynamicCss::generate( $this->attributes );
	}
}
