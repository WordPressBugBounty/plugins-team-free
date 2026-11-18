<?php
/**
 * Shared section/box dynamic CSS (frontend).
 *
 * PHP twin of src/blocks/shared/commonDynamicCss.js. Emits the wrapper-level
 * styles (padding, margin, background, border, radius, box-shadow) shared by
 * every block via CommonAttributes, scoped to `#uniqueId`. Each block's style
 * class appends its own rules and calls this for the common box, producing a
 * CSS string identical to the editor's commonDynamicCss().
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Styles;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Css_Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class CommonDynamicCss
 */
class CommonDynamicCss {

	/**
	 * Build the responsive section/box CSS string for a block instance.
	 *
	 * @param array $attributes Block attributes (saved + defaults).
	 * @return string
	 */
	public static function generate( $attributes ) {
		$unique_id = $attributes['uniqueId'] ?? '';
		if ( '' === $unique_id ) {
			return '';
		}

		// Dynamic CSS ALWAYS anchors to #uniqueId — the Advanced → Custom CSS
		// ID lives on a separate outer wrapper and never replaces it.
		$base = '#' . $unique_id;

		$build_responsive_css = static function ( $device ) use ( $attributes, $base ) {
			$styles = array(
				'padding' => Css_Helpers::responsive_spacing_value( $attributes['sectionPadding'] ?? array(), $device ),
				'margin'  => Css_Helpers::responsive_spacing_value( $attributes['sectionMargin'] ?? array(), $device ),
			);

			// Non-responsive box styles only emit once, on the Desktop pass.
			if ( 'Desktop' === $device ) {
				$styles = array_merge(
					$styles,
					Css_Helpers::background_styles( $attributes['sectionBg'] ?? array() ),
					Css_Helpers::border_styles(
						$attributes['sectionBorder'] ?? array(),
						$attributes['sectionBorderWidth'] ?? array()
					),
					array(
						'border-radius' => Css_Helpers::spacing_shorthand_value( $attributes['sectionBorderRadius'] ?? array() ),
						'box-shadow'    => Css_Helpers::box_shadow_css( $attributes['sectionBoxShadow'] ?? array() ),
					)
				);
			}

			return array(
				array(
					'selector' => $base,
					'styles'   => $styles,
				),
			);
		};

		$desktop_css = $build_responsive_css( 'Desktop' );
		$tablet_css  = $build_responsive_css( 'Tablet' );
		$mobile_css  = $build_responsive_css( 'Mobile' );

		$tablet_media_query_css = Css_Helpers::wrap_in_media_query(
			Css_Helpers::object_to_css_string( $tablet_css ),
			'only screen and (max-width: 1023px)'
		);
		$mobile_media_query_css = Css_Helpers::wrap_in_media_query(
			Css_Helpers::object_to_css_string( $mobile_css ),
			'only screen and (max-width: 599px)'
		);

		// Visibility (Advanced → Visibility) — hide the block per device. Twin of
		// the editor commonDynamicCss(), which dims instead of hiding.
		$hide_rule = Css_Helpers::object_to_css_string(
			array(
				array(
					'selector' => $base,
					'styles'   => array( 'display' => 'none' ),
				),
			)
		);
		$hide_css  = '';
		if ( ! empty( $attributes['hideOnDesktop'] ) ) {
			$hide_css .= Css_Helpers::wrap_in_media_query( $hide_rule, 'only screen and (min-width: 1024px)' );
		}
		if ( ! empty( $attributes['hideOnTablet'] ) ) {
			$hide_css .= Css_Helpers::wrap_in_media_query( $hide_rule, 'only screen and (min-width: 600px) and (max-width: 1023px)' );
		}
		if ( ! empty( $attributes['hideOnMobile'] ) ) {
			$hide_css .= Css_Helpers::wrap_in_media_query( $hide_rule, 'only screen and (max-width: 599px)' );
		}

		// Custom CSS (Advanced → Advanced) — user-authored rules, with the literal
		// `selector` token rewritten to this block's `#uniqueId` wrapper. Tags are
		// stripped so the value cannot close the inline <style> element.
		$custom_css = trim( wp_strip_all_tags( $attributes['customCss'] ?? '' ) );
		if ( '' !== $custom_css ) {
			$custom_css = preg_replace( '/\bselector\b/', $base, $custom_css );
		}

		return Css_Helpers::object_to_css_string( $desktop_css ) . ' ' . $tablet_media_query_css . ' ' . $mobile_media_query_css . ' ' . $hide_css . ' ' . $custom_css;
	}
}
