<?php
/**
 * Carousel dynamic CSS renderer (frontend).
 *
 * PHP twin of apps/blocks/carousel/dynamicCss.js. The shared card rules live
 * in the CardCss base; this class contributes only the carousel-layout rules:
 * slide alignment, the grouped-effect (fade/cube/flip) multi-column grid, the
 * navigation arrows and the pagination dots.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Styles;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Css_Helpers;
use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Carousel
 */
class Carousel extends CardCss {

	/**
	 * Normalize Pro-only carousel attributes before CardCss stores them, so
	 * the dynamic CSS this class generates always matches the markup
	 * Carousel::render_block() produced from the same normalization.
	 *
	 * @param array $attributes Block attributes.
	 */
	public function __construct( $attributes ) {
		$attributes['carouselStyle']        = Pro_Gate::carousel_style( $attributes['carouselStyle'] ?? 'default' );
		$attributes['carouselDisplayStyle'] = Pro_Gate::display_style( $attributes['carouselDisplayStyle'] ?? 'horizontal' );
		$attributes['slidingEffect']        = Pro_Gate::slide_effect( $attributes['slidingEffect'] ?? 'slide' );
		$attributes['partialSlideView']     = Pro_Gate::partial_view( $attributes['partialSlideView'] ?? false );
		parent::__construct( $attributes );
	}

	/**
	 * Carousel-layout rules for a single device (twin of
	 * carouselResponsiveCss in dynamicCss.js).
	 *
	 * @param string $device Device key (Desktop|Tablet|Mobile).
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	protected function layout_responsive_css( $device ) {
		$base  = '#' . $this->unique_id;
		$rules = array();

		// Ticker style — a CSS-only marquee. Item width comes from the columns
		// via container-query vars; the loop duration and flow direction ride
		// on the track. Nav/pagination/swiper rules don't apply.
		if ( 'ticker' === ( $this->attributes['carouselStyle'] ?? 'default' ) ) {
			$columns = $this->attributes['columns']['device'][ $device ] ?? '';
			$gap     = $this->attributes['columnGap']['device'][ $device ] ?? '';
			$vars    = array();
			if ( '' !== $columns ) {
				$vars['--sptp-marquee-cols'] = (string) absint( $columns );
			}
			if ( '' !== $gap ) {
				$vars['--sptp-marquee-col-gap'] = $gap . ( $this->attributes['columnGap']['unit'][ $device ] ?? 'px' );
			}
			if ( ! empty( $vars ) ) {
				$rules[] = array(
					'selector' => $base,
					'styles'   => $vars,
				);
			}

			if ( 'Desktop' === $device ) {
				// Loop duration: Carousel Speed when it's a plausible marquee
				// duration (>= 3000ms); transition-scale values fall back to a
				// calm 25s loop. Direction: 'rtl' (default) flows the cards
				// LEFT; 'ltr' reverses it.
				$speed    = (int) ( $this->attributes['carouselSpeed']['value'] ?? 0 );
				$duration = $speed >= 3000 ? $speed : 25000;
				$reverse  = 'ltr' === ( $this->attributes['carouselDirection'] ?? 'rtl' );
				$rules[]  = array(
					'selector' => $base . ' .sp-smart-team-marquee-track',
					'styles'   => array(
						'animation-duration'  => $duration . 'ms',
						'animation-direction' => $reverse ? 'reverse' : 'normal',
					),
				);

				$align = $this->attributes['alignItems'] ?? '';
				if ( '' !== $align ) {
					$rules[] = array(
						'selector' => $base . ' .sp-smart-team-marquee-group',
						'styles'   => array( 'align-items' => 'start' === $align ? 'flex-start' : ( 'end' === $align ? 'flex-end' : $align ) ),
					);
				}
			}

			return $rules;
		}

		// Grouped effects (fade/cube/flip) show ONE slide at a time —
		// multi-column layouts are emulated by wrapping N cards into each
		// slide (groupEffectSlides in script.js / the editor hook), laid out
		// with this per-device CSS grid.
		$effect  = $this->attributes['slidingEffect'] ?? 'slide';
		$style   = $this->attributes['carouselStyle'] ?? 'default';
		$grouped = 'default' === $style && in_array( $effect, array( 'fade', 'cube', 'flip' ), true );
		if ( $grouped ) {
			$columns = $this->attributes['columns']['device'][ $device ] ?? '';
			$gap     = $this->attributes['columnGap']['device'][ $device ] ?? '';
			$gap_val = '' !== $gap ? $gap . ( $this->attributes['columnGap']['unit'][ $device ] ?? 'px' ) : '';
			$styles  = array();
			if ( '' !== $columns ) {
				$styles['grid-template-columns'] = 'repeat(' . absint( $columns ) . ', minmax(0, 1fr))';
			}
			if ( '' !== $gap_val ) {
				$styles['gap'] = $gap_val;
			}
			if ( ! empty( $styles ) ) {
				$rules[] = array(
					'selector' => $base . ' .sp-smart-team-swiper:is(.swiper-fade, .swiper-cube, .swiper-flip) .sp-smart-team-swiper-effect-group',
					'styles'   => $styles,
				);
			}
		}

		// Align Items — vertical alignment of unequal-height slides on the
		// swiper track (non-responsive, Desktop pass).
		if ( 'Desktop' === $device ) {
			$align = $this->attributes['alignItems'] ?? '';
			if ( '' !== $align ) {
				$rules[] = array(
					'selector' => $base . ' .sp-smart-team-swiper-wrapper',
					'styles'   => array( 'align-items' => 'start' === $align ? 'flex-start' : ( 'end' === $align ? 'flex-end' : $align ) ),
				);
			}
		}

		// Navigation arrows — offsets/gap/padding/icon size are responsive;
		// colors/border/shadow emit once on the Desktop pass.
		if ( ! empty( $this->attributes['enableNavigationArrow'] ) ) {
			$rules = array_merge( $rules, $this->nav_arrow_css( $base, $device ) );
		}

		// Pagination — sizes/margins are responsive; colors + typography per
		// style emit like the arrows.
		if ( ! empty( $this->attributes['enablePaginationDots'] ) ) {
			$rules = array_merge( $rules, $this->pagination_css( $base, $device ) );
		}

		return $rules;
	}

	/**
	 * Navigation-arrow rules for one device — delegated to the shared chrome
	 * builder so the Member Photo Gallery block emits identical rules.
	 *
	 * @param string $base   `#uniqueId` selector base.
	 * @param string $device Device key.
	 * @return array
	 */
	private function nav_arrow_css( $base, $device ) {
		return Carousel_Chrome::nav_arrow_css( $this->attributes, $base, $device );
	}

	/**
	 * Pagination rules for one device — delegated to the shared chrome builder.
	 *
	 * @param string $base   `#uniqueId` selector base.
	 * @param string $device Device key.
	 * @return array
	 */
	private function pagination_css( $base, $device ) {
		return Carousel_Chrome::pagination_css( $this->attributes, $base, $device );
	}
}
