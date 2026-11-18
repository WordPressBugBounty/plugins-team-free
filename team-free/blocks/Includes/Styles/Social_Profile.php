<?php
/**
 * Social Profile dynamic CSS renderer (frontend).
 *
 * PHP twin of apps/blocks/social-profile/dynamicCss.js. A scoped copy of the
 * social block in Styles\CardCss, anchored to this block's #uniqueId. The base
 * look (the four icon styles) comes from the globally-bundled shared card SCSS;
 * this paints the customizable values (sizing, gap, colors, border, shadow).
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Styles;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Css_Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Social_Profile
 */
class Social_Profile {

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
	 * Social rules for one device. Area size / icon size / gap / margin are
	 * per device; radius is non-responsive (Desktop pass). Custom Styling is
	 * Pro — no CSS here. Mirrors the social block of
	 * Styles\CardCss::card_responsive_css.
	 *
	 * @param string $device Device key (Desktop|Tablet|Mobile).
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	private function archive_responsive_css( $device ) {
		$base  = '#' . $this->unique_id;
		$rules = array();

		// Responsive: gap + alignment on the list; icon area (box) size / glyph size
		// / margin on the chips.
		$social_area = Css_Helpers::single_responsive_value( $this->attributes['socialIconAreaSize'] ?? array(), $device );

		// Alignment value → flexbox keyword (twin of FLEX_ALIGN in dynamicCss.js).
		// Tablet/Mobile inherit Desktop until set (empty → no rule, so the SCSS
		// `justify-content: center` holds).
		$flex_align = array(
			'left'   => 'flex-start',
			'center' => 'center',
			'right'  => 'flex-end',
		);
		$alignment  = $this->attributes['socialAlignment']['device'][ $device ] ?? '';

		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__social',
			'styles'   => array(
				'gap'             => Css_Helpers::single_responsive_value( $this->attributes['socialItemGap'] ?? array(), $device ),
				'justify-content' => $flex_align[ $alignment ] ?? '',
			),
		);
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__social a',
			'styles'   => array(
				'width'     => $social_area,
				'height'    => $social_area,
				'font-size' => Css_Helpers::single_responsive_value( $this->attributes['socialIconSize'] ?? array(), $device ),
				'margin'    => Css_Helpers::responsive_spacing_value( $this->attributes['socialMargin'] ?? array(), $device ),
			),
		);

		if ( 'Desktop' === $device ) {
			// Border radius only. Custom Styling (per-state color / background /
			// border / box-shadow) is Pro — Free emits no CSS for it (the stored
			// socialCustomStyling / socialIconColor… are left untouched).
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__social a',
				'styles'   => array(
					'border-radius' => Css_Helpers::spacing_shorthand_value( $this->attributes['socialBorderRadius'] ?? array() ),
				),
			);
		}

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
}
