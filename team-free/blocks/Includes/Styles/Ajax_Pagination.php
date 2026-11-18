<?php
/**
 * Ajax Pagination dynamic CSS renderer (frontend).
 *
 * PHP twin of apps/blocks/ajax-pagination/dynamicCss.js. Builds the
 * block-specific rules per device in archive_responsive_css(), joins them with
 * media queries, then appends the shared section/box styles via
 * CommonDynamicCss — producing a CSS string identical to the editor output.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Styles;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Css_Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Ajax_Pagination
 */
class Ajax_Pagination {

	/**
	 * Block attributes (saved + defaults merged).
	 *
	 * @var array
	 */
	public $attributes = array();

	/**
	 * Stable unique id for the block instance.
	 *
	 * @var string
	 */
	public $unique_id = '';

	/**
	 * Stores the block's attributes and derives its unique id.
	 *
	 * @param array $attributes Block attributes.
	 */
	public function __construct( $attributes ) {
		$this->attributes = $attributes;
		$this->unique_id  = $attributes['uniqueId'] ?? '';
	}

	/**
	 * Block-specific rules for a single device. Color/background/border/radius
	 * and the numbered-buttons gap are non-responsive (Desktop pass);
	 * typography, padding and the wrapper margin are emitted per device.
	 * Mirrors archiveResponsiveCss in dynamicCss.js.
	 *
	 * @param string $device Device key (Desktop|Tablet|Mobile).
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	private function archive_responsive_css( $device ) {
		$base  = '#' . $this->unique_id;
		$rules = array();

		$item_styles = array_merge(
			array(
				'padding' => Css_Helpers::responsive_spacing_value( $this->attributes['paginationPadding'] ?? array(), $device ),
			),
			Css_Helpers::typography_styles( $this->typo_bundle( 'pagination' ), $device )
		);

		if ( 'Desktop' === $device ) {
			$item_styles = array_merge(
				$item_styles,
				array(
					'color'         => $this->attributes['paginationColor'] ?? '',
					'border-radius' => Css_Helpers::spacing_shorthand_value( $this->attributes['paginationBorderRadius'] ?? array() ),
					'box-shadow'    => Css_Helpers::box_shadow_css( $this->attributes['paginationBoxShadow'] ?? array() ),
				),
				Css_Helpers::background_styles( $this->attributes['paginationBg'] ?? array() ),
				Css_Helpers::border_styles( $this->attributes['paginationBorder'] ?? array(), $this->attributes['paginationBorderWidth'] ?? array() )
			);

			// Hover and the runtime's active page (`.is-current`) share one
			// state, like testimonial-pro's Hover & Active. :is() (not :where())
			// so the hover rule outranks the normal-state rule emitted later at
			// the same base specificity.
			$hover_bg = array( 'color' => $this->attributes['paginationBg']['hover'] ?? array() );
			$rules[]  = array(
				'selector' => $base . ' .sp-smart-team-ajax-pagination__item:is(:hover, .is-current)',
				'styles'   => array_merge(
					array(
						'color'        => $this->attributes['paginationColorHover'] ?? '',
						'box-shadow'   => Css_Helpers::box_shadow_css( $this->attributes['paginationBoxShadowHover'] ?? array() ),
						'border-color' => $this->attributes['paginationBorder']['hoverColor'] ?? '',
					),
					Css_Helpers::background_styles( $hover_bg )
				),
			);
		}

		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-ajax-pagination__item',
			'styles'   => $item_styles,
		);
		// Gap Between Items — responsive (Figma device icon).
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-ajax-pagination__buttons',
			'styles'   => array( 'gap' => Css_Helpers::single_responsive_value( $this->attributes['paginationNumberGap'] ?? array(), $device ) ),
		);
		// Map the responsive Alignment control value to a flexbox keyword.
		// Tablet/Mobile inherit Desktop until set (empty → no rule).
		$flex_align = array(
			'left'   => 'flex-start',
			'center' => 'center',
			'right'  => 'flex-end',
		);
		$alignment  = $this->attributes['paginationAlignment']['device'][ $device ] ?? '';

		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-ajax-pagination__wrapper',
			'styles'   => array(
				'margin'          => Css_Helpers::responsive_spacing_value( $this->attributes['paginationMargin'] ?? array(), $device ),
				'justify-content' => $flex_align[ $alignment ] ?? '',
			),
		);

		return $rules;
	}

	/**
	 * Build the full responsive CSS string for the block instance.
	 *
	 * @return string
	 */
	public function generate() {
		if ( '' === $this->unique_id ) {
			return '';
		}

		$desktop_css = $this->archive_responsive_css( 'Desktop' );

		$tablet_media_query_css = Css_Helpers::wrap_in_media_query(
			Css_Helpers::object_to_css_string( $this->archive_responsive_css( 'Tablet' ) ),
			'only screen and (max-width: 1023px)'
		);
		$mobile_media_query_css = Css_Helpers::wrap_in_media_query(
			Css_Helpers::object_to_css_string( $this->archive_responsive_css( 'Mobile' ) ),
			'only screen and (max-width: 599px)'
		);

		return Css_Helpers::object_to_css_string( $desktop_css )
			. ' ' . $tablet_media_query_css
			. ' ' . $mobile_media_query_css
			. ' ' . CommonDynamicCss::generate( $this->attributes );
	}

	/**
	 * Assemble a Typography control bundle for an attribute prefix to feed
	 * Css_Helpers::typography_styles(). Twin of typoBundle() in dynamicCss.js.
	 *
	 * @param string $prefix Attribute prefix.
	 * @return array
	 */
	private function typo_bundle( $prefix ) {
		return array(
			'family'        => $this->attributes[ $prefix . 'Typography' ] ?? array(),
			'fontSize'      => $this->attributes[ $prefix . 'FontSize' ] ?? array(),
			'lineHeight'    => $this->attributes[ $prefix . 'LineHeight' ] ?? array(),
			'letterSpacing' => $this->attributes[ $prefix . 'LetterSpacing' ] ?? array(),
			'wordSpacing'   => $this->attributes[ $prefix . 'WordSpacing' ] ?? array(),
		);
	}
}
