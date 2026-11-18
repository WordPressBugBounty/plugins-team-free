<?php
/**
 * Member Image dynamic CSS renderer (frontend).
 *
 * PHP twin of apps/blocks/member-image/dynamicCss.js. A scoped copy of the
 * image rules in Styles\CardCss, anchored to this block's #uniqueId. Builds the
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
 * Class Member_Image
 */
class Member_Image {

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
	 * Block-specific rules for a single device. Size + margin are per device;
	 * border radius and border are non-responsive (Desktop pass).
	 * Mirrors archiveResponsiveCss in dynamicCss.js.
	 *
	 * @param string $device Device key (Desktop|Tablet|Mobile).
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	private function archive_responsive_css( $device ) {
		$base   = '#' . $this->unique_id;
		$avatar = $base . ' .sp-smart-team-card__avatar';
		$rules  = array();

		// Photo box — Width / Height (an empty Height means Auto). No margin: the
		// block's spacing is Advanced Settings → General.
		$avatar_styles = array(
			'width'  => $this->size_dim_value( $this->attributes['imageSize'] ?? array(), 'width', $device ),
			'height' => $this->size_dim_value( $this->attributes['imageSize'] ?? array(), 'height', $device ),
		);

		if ( 'Desktop' === $device ) {
			$avatar_styles['border-radius'] = Css_Helpers::spacing_shorthand_value( $this->attributes['imageBorderRadius'] ?? array() );
			// Border is per state — `none` (the default) emits nothing.
			$avatar_styles = array_merge(
				$avatar_styles,
				Css_Helpers::border_styles( $this->attributes['imageBorder'] ?? array(), $this->attributes['imageBorderWidth'] ?? array() )
			);
		}

		$rules[] = array(
			'selector' => $avatar,
			'styles'   => $avatar_styles,
		);

		if ( 'Desktop' === $device ) {
			$rules[] = array(
				'selector' => $avatar . ':hover',
				'styles'   => Css_Helpers::border_styles( $this->attributes['imageBorderHover'] ?? array(), $this->attributes['imageBorderWidthHover'] ?? array() ),
			);

			// Image Filter is Pro — Free emits no filter CSS (the stored
			// imageBlur/… attributes are left untouched).
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

	/**
	 * Extract a width/height dimension (value+unit) from a width_height
	 * attribute for one device. Twin of sizeDimValue() in dynamicCss.js.
	 *
	 * @param array  $size   width_height attribute.
	 * @param string $dim    'width' | 'height'.
	 * @param string $device Device key.
	 * @return string
	 */
	private function size_dim_value( $size, $dim, $device ) {
		$value = $size['device'][ $device ][ $dim ] ?? '';
		if ( '' === $value || null === $value ) {
			return '';
		}
		$unit = $size['unit'][ $device ][ $dim ] ?? 'px';

		return $value . $unit;
	}
}
