<?php
/**
 * Member Bio dynamic CSS renderer (frontend).
 *
 * PHP twin of apps/blocks/member-bio/dynamicCss.js. Builds the block-specific
 * rules per device in archive_responsive_css(), joins them with media queries,
 * then appends the shared section/box styles via CommonDynamicCss — producing a
 * CSS string identical to the editor output.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Styles;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Css_Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Member_Bio
 */
class Member_Bio {

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
	 * Constructor.
	 *
	 * @param array $attributes Block attributes.
	 */
	public function __construct( $attributes ) {
		$this->attributes = $attributes;
		$this->unique_id  = $attributes['uniqueId'] ?? '';
	}

	/**
	 * Block-specific rules for a single device. Alignment / typography metrics /
	 * margin are emitted per device; color is non-responsive (Desktop pass).
	 * Mirrors archiveResponsiveCss in dynamicCss.js.
	 *
	 * @param string $device Device key (Desktop|Tablet|Mobile).
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	private function archive_responsive_css( $device ) {
		$base  = '#' . $this->unique_id;
		$text  = $base . ' .sp-smart-team-member-bio__text';
		$rules = array();

		// Text: alignment + typography (per device) (+ color on Desktop). No margin
		// — the block's spacing is Advanced Settings → General.
		$text_styles = array_merge(
			array( 'text-align' => Css_Helpers::single_responsive_value( $this->attributes['bioAlignment'] ?? array(), $device ) ),
			Css_Helpers::typography_styles( $this->typo_bundle( 'bio' ), $device )
		);

		if ( 'Desktop' === $device ) {
			$text_styles['color'] = $this->attributes['bioColor'] ?? '';
		}

		$rules[] = array(
			'selector' => $text,
			'styles'   => $text_styles,
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
