<?php
/**
 * Shared carousel-chrome dynamic CSS — navigation arrows + pagination dots.
 *
 * Extracted from Styles\Carousel so any block that renders the same chrome can
 * reuse the rules instead of duplicating them: the Carousel block (and the
 * Overlay block through it) delegates here, and the Member Photo Gallery block
 * calls the same builders for its own smaller carousel.
 *
 * PHP twin of the exported `navArrowCss` / `paginationCss` builders in
 * apps/blocks/carousel/dynamicCss.js — keep the pairs in lock-step.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Styles;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;
use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Css_Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Carousel_Chrome
 */
class Carousel_Chrome {

	/**
	 * Navigation-arrow rules for one device.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $base       `#uniqueId` selector base.
	 * @param string $device     Device key (Desktop|Tablet|Mobile).
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	public static function nav_arrow_css( $attributes, $base, $device ) {
		$rules = array();

		// Placement (top/bottom + left/right) is static in carousel/style.scss:
		// Offset X / Offset Y are Pro, so Free never reads navOffsetX/Y.
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-swiper-nav-arrows',
			'styles'   => array( 'gap' => Css_Helpers::single_responsive_value( $attributes['navIconGap'] ?? array(), $device ) ),
		);
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-swiper-navigation',
			'styles'   => array( 'padding' => Css_Helpers::responsive_spacing_value( $attributes['navIconPadding'] ?? array(), $device ) ),
		);
		$icon_size = Css_Helpers::single_responsive_value( $attributes['navIconSize'] ?? array(), $device );
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-swiper-navigation svg',
			'styles'   => array(
				'width'  => $icon_size,
				'height' => $icon_size,
			),
		);

		if ( 'Desktop' === $device ) {
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-swiper-navigation',
				'styles'   => array_merge(
					array(
						'color'            => $attributes['navIconColor'] ?? '',
						'background-color' => $attributes['navIconBgColor'] ?? '',
						'border-radius'    => Css_Helpers::spacing_shorthand_value( $attributes['navIconBorderRadius'] ?? array() ),
						'box-shadow'       => Css_Helpers::box_shadow_css( $attributes['navIconBoxShadow'] ?? array() ),
					),
					Css_Helpers::border_styles( $attributes['navIconBorder'] ?? array(), $attributes['navIconBorderWidth'] ?? array() )
				),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-swiper-navigation:hover',
				'styles'   => array(
					'color'            => $attributes['navIconColorHover'] ?? '',
					'background-color' => $attributes['navIconBgColorHover'] ?? '',
					'box-shadow'       => Css_Helpers::box_shadow_css( $attributes['navIconBoxShadowHover'] ?? array() ),
					'border-color'     => $attributes['navIconBorder']['hoverColor'] ?? '',
				),
			);
		}

		return $rules;
	}

	/**
	 * Pagination rules for one device.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $base       `#uniqueId` selector base.
	 * @param string $device     Device key (Desktop|Tablet|Mobile).
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	public static function pagination_css( $attributes, $base, $device ) {
		$rules = array();
		$stored  = $attributes['paginationStyle'] ?? 'dots';
		$style   = Pro_Gate::pagination_style( $stored );

		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-swiper-pagination',
			'styles'   => array(
				'margin' => Css_Helpers::responsive_spacing_value( $attributes['paginationDotsMargin'] ?? array(), $device ),
				'gap'    => Css_Helpers::single_responsive_value( $attributes['paginationDotsSpaceBetween'] ?? array(), $device ),
			),
		);

		// Bullet size. A Pro style falls back to plain dots, and the size Pro
		// seeded for it (e.g. Fraction 60×25) would draw ovals — keep the base
		// 12×12 round dots instead.
		if ( $stored === $style ) {
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-swiper-pagination .swiper-pagination-bullet',
				'styles'   => array(
					'width'  => Css_Helpers::single_responsive_value( $attributes['paginationDotsWidth'] ?? array(), $device ),
					'height' => Css_Helpers::single_responsive_value( $attributes['paginationDotsHeight'] ?? array(), $device ),
				),
			);
		}

		// The Numbers style carries text — typography is responsive.
		if ( 'number' === $style ) {
			// Number bullets set their own size/line-height, so the text rules must land on them too.
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-swiper-pagination, ' . $base . ' .sp-smart-team-swiper-pagination .swiper-pagination-bullet',
				'styles'   => Css_Helpers::typography_styles( self::typo_bundle( $attributes, 'pagination' ), $device ),
			);
		}

		if ( 'Desktop' === $device ) {
			$position = $attributes['paginationDotsPosition'] ?? 'center';
			$flex_map = array(
				'left'   => 'flex-start',
				'center' => 'center',
				'right'  => 'flex-end',
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-swiper-pagination.swiper-pagination',
				'styles'   => array( 'justify-content' => $flex_map[ $position ] ?? 'center' ),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-swiper-pagination .swiper-pagination-bullet',
				'styles'   => array( 'background-color' => $attributes['paginationDotsColor'] ?? '' ),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-swiper-pagination .swiper-pagination-bullet-active',
				'styles'   => array( 'background-color' => $attributes['paginationDotsActiveColor'] ?? '' ),
			);
		}

		return $rules;
	}

	/**
	 * Typography control bundle for an attribute prefix (twin of the per-class
	 * typo_bundle() helpers).
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $prefix     Attribute prefix.
	 * @return array
	 */
	private static function typo_bundle( $attributes, $prefix ) {
		return array(
			'family'        => $attributes[ $prefix . 'Typography' ] ?? array(),
			'fontSize'      => $attributes[ $prefix . 'FontSize' ] ?? array(),
			'lineHeight'    => $attributes[ $prefix . 'LineHeight' ] ?? array(),
			'letterSpacing' => $attributes[ $prefix . 'LetterSpacing' ] ?? array(),
			'wordSpacing'   => $attributes[ $prefix . 'WordSpacing' ] ?? array(),
		);
	}
}
