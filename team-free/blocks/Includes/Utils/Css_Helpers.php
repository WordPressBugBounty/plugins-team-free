<?php
/**
 * CSS helpers used by block style classes to emit responsive CSS.
 *
 * Mirrors the Styble Pro Css_Helpers shape so style classes can produce the
 * same `{ desktop_css, tablet_css, mobile_css }` rule arrays and have them
 * flattened into a CSS string with media queries.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Class Css_Helpers
 */
class Css_Helpers {

	/**
	 * Convert an array of { selector, styles } entries into a CSS string.
	 *
	 * @param array $dynamic_css Rule list.
	 * @return string
	 */
	public static function object_to_css_string( $dynamic_css ) {
		$css = '';
		if ( ! empty( $dynamic_css ) && is_array( $dynamic_css ) ) {
			foreach ( $dynamic_css as $item ) {
				if ( isset( $item['styles'] ) && is_array( $item['styles'] ) ) {
					$styles = '';
					foreach ( $item['styles'] as $property => $value ) {
						$value = self::css_value( $value );
						if ( '' !== $value ) {
							$styles .= "{$property}: {$value};";
						}
					}
					if ( $styles ) {
						$css .= "{$item['selector']} {{$styles}}";
					}
				}
			}
		}
		return $css;
	}

	/**
	 * One declaration value, unable to leave its declaration.
	 *
	 * Values come from block attributes (colors, units, font families,
	 * gradients) that an Author can set to any string. None legitimately holds
	 * `{ } ;` or `< >`, so dropping them keeps a value from closing the rule,
	 * adding declarations, or ending the inline <style> element.
	 *
	 * @param mixed $value Raw value.
	 * @return string Empty for null/false/'' and for non-scalars.
	 */
	public static function css_value( $value ) {
		if ( null === $value || false === $value || ! is_scalar( $value ) ) {
			return '';
		}

		return trim( str_replace( array( '{', '}', ';', '<', '>' ), '', (string) $value ) );
	}

	/**
	 * A block's uniqueId as a safe `#id` selector fragment.
	 *
	 * Generated ids are `sp-smart-team-{block}-{alnum}`; anything else is
	 * reduced to the same character set so it cannot extend the selector.
	 *
	 * @param mixed $unique_id Raw `uniqueId` attribute.
	 * @return string
	 */
	public static function unique_id( $unique_id ) {
		if ( ! is_scalar( $unique_id ) ) {
			return '';
		}

		return (string) preg_replace( '/[^A-Za-z0-9_-]/', '', (string) $unique_id );
	}

	/**
	 * Merge duplicate-selector entries by combining their style arrays.
	 *
	 * @param array $css_array Rule list.
	 * @return array
	 */
	public static function filter_duplicate_selector( $css_array ) {
		if ( empty( $css_array ) || ! is_array( $css_array ) ) {
			return array();
		}

		$selector_map = array();

		foreach ( $css_array as $css ) {
			if ( empty( $css ) || ! isset( $css['selector'], $css['styles'] ) || ! is_array( $css['styles'] ) ) {
				continue;
			}

			$selector = $css['selector'];
			$styles   = $css['styles'];

			if ( empty( $styles ) ) {
				continue;
			}

			if ( isset( $selector_map[ $selector ] ) ) {
				$selector_map[ $selector ]['styles'] = array_merge(
					$selector_map[ $selector ]['styles'],
					$styles
				);
			} else {
				$selector_map[ $selector ] = array(
					'selector' => $selector,
					'styles'   => $styles,
				);
			}
		}

		return array_values( $selector_map );
	}

	/**
	 * Flatten a { desktop_css, tablet_css, mobile_css } object into a single
	 * responsive CSS string with media queries.
	 *
	 * @param array $css_obj Css object.
	 * @return string
	 */
	public static function filter_responsive_dynamic_css( $css_obj ) {
		if ( empty( $css_obj ) || ! is_array( $css_obj ) ) {
			return '';
		}

		$desktop_css = isset( $css_obj['desktop_css'] ) ? $css_obj['desktop_css'] : array();
		$tablet_css  = isset( $css_obj['tablet_css'] ) ? $css_obj['tablet_css'] : array();
		$mobile_css  = isset( $css_obj['mobile_css'] ) ? $css_obj['mobile_css'] : array();

		$filtered_desktop_css = self::filter_duplicate_selector( $desktop_css );
		$filtered_tablet_css  = self::filter_duplicate_selector( $tablet_css );
		$filtered_mobile_css  = self::filter_duplicate_selector( $mobile_css );

		$css  = self::object_to_css_string( $filtered_desktop_css );
		$css .= ' @media only screen and (min-width: 600px) and (max-width: 1023px) { ';
		$css .= self::object_to_css_string( $filtered_tablet_css );
		$css .= ' } @media only screen and (max-width: 599px) {';
		$css .= self::object_to_css_string( $filtered_mobile_css );
		$css .= ' }';

		return trim( $css );
	}

	/**
	 * Wrap a CSS string in a media query block. Twin of helpFn.js wrapInMediaQuery().
	 *
	 * @param string $css_string  Flattened CSS from object_to_css_string().
	 * @param string $media_query e.g. 'only screen and (max-width: 1023px)'.
	 * @return string
	 */
	public static function wrap_in_media_query( $css_string, $media_query ) {
		if ( '' === $css_string ) {
			return '';
		}
		return "@media {$media_query} { {$css_string} }";
	}

	/**
	 * Format a scalar or array value with a unit suffix.
	 *
	 * @param mixed  $value Value or array of values.
	 * @param string $unit  Unit suffix.
	 * @return string
	 */
	public static function css_data_check( $value, $unit = '' ) {
		if ( ! isset( $value ) ) {
			return '';
		}

		if ( is_array( $value ) ) {
			$filtered = array();
			foreach ( $value as $val ) {
				if ( null !== $val && '' !== trim( (string) $val ) ) {
					$filtered[] = $val . $unit;
				}
			}
			if ( empty( $filtered ) ) {
				return '';
			}
			return implode( ' ', $filtered );
		}

		if ( trim( (string) $value ) !== '' ) {
			return $value . $unit;
		}

		return '';
	}

	/**
	 * Resolve the unit for a given device from a `{ Desktop, Tablet, Mobile }` map.
	 *
	 * @param array  $attributes  Attribute payload containing the `unit` field.
	 * @param string $device_type Device key.
	 * @return string
	 */
	public static function get_unit( $attributes, $device_type = 'Desktop' ) {
		$unit = $attributes['unit'] ?? 'px';
		if ( is_array( $unit ) ) {
			return $unit[ $device_type ] ?? 'px';
		}
		return $unit;
	}

	/**
	 * Resolve a single-responsive scalar attribute (Att_Utils::single_responsive)
	 * to a CSS value for one device. Twin of singleResponsiveValue() in helpFn.js.
	 *
	 * @param array  $attr   single_responsive payload.
	 * @param string $device Device key.
	 * @return string
	 */
	public static function single_responsive_value( $attr, $device = 'Desktop' ) {
		if ( empty( $attr ) || ! is_array( $attr ) ) {
			return '';
		}
		$value = $attr['device'][ $device ] ?? '';
		if ( '' === trim( (string) $value ) ) {
			return '';
		}
		$unit = $attr['unit'];
		if ( is_array( $unit ) ) {
			$unit = $unit[ $device ] ?? '';
		}
		return $value . $unit;
	}

	/**
	 * Build typography CSS props from the Typography control bundle. Responsive
	 * metrics are emitted for the given device; the non-responsive font face is
	 * emitted only on the Desktop pass. Twin of typographyStyles() in helpFn.js.
	 *
	 * @param array  $typo   `{ family, fontSize, lineHeight, letterSpacing, wordSpacing }`.
	 * @param string $device Device key.
	 * @return array<string,string> CSS property map.
	 */
	public static function typography_styles( $typo, $device = 'Desktop' ) {
		$styles = array();
		if ( ! is_array( $typo ) ) {
			return $styles;
		}

		$styles['font-size']   = self::single_responsive_value( $typo['fontSize'] ?? array(), $device );
		$styles['line-height'] = self::single_responsive_value( $typo['lineHeight'] ?? array(), $device );

		if ( 'Desktop' === $device ) {
			// Letter/word spacing are non-responsive ({ value, unit }) — emit once.
			$ls                       = $typo['letterSpacing'] ?? array();
			$ws                       = $typo['wordSpacing'] ?? array();
			$styles['letter-spacing'] = ( isset( $ls['value'] ) && '' !== (string) $ls['value'] ) ? $ls['value'] . ( $ls['unit'] ?? 'px' ) : '';
			$styles['word-spacing']   = ( isset( $ws['value'] ) && '' !== (string) $ws['value'] ) ? $ws['value'] . ( $ws['unit'] ?? 'px' ) : '';

			$face = $typo['family']['typography'] ?? array();
			if ( ! empty( $face['family'] ) && 'Default' !== $face['family'] ) {
				$styles['font-family'] = $face['family'];
			}
			if ( ! empty( $face['fontWeight'] ) ) {
				$styles['font-weight'] = $face['fontWeight'];
			}
			if ( ! empty( $face['style'] ) ) {
				$styles['font-style'] = $face['style'];
			}
			if ( ! empty( $face['transform'] ) ) {
				$styles['text-transform'] = $face['transform'];
			}
			if ( ! empty( $face['decoration'] ) ) {
				$styles['text-decoration'] = $face['decoration'];
			}
		}

		return $styles;
	}

	/**
	 * Build a CSS `box-shadow` string from a box-shadow attribute payload.
	 *
	 * @param array $shadow Shadow attribute.
	 * @return string
	 */
	public static function box_shadow_css( $shadow ) {
		if ( empty( $shadow ) || ! is_array( $shadow ) ) {
			return '';
		}

		$is_active = isset( $shadow['isActive'] ) ? (bool) $shadow['isActive'] : false;
		if ( ! $is_active ) {
			return '';
		}

		// Preset shadow selected from the BoxShadow control: selectDefault holds the
		// full CSS variable (e.g. var(--sp-smart-team-shadow-medium-4dp)), mirroring
		// boxShadowValue() in helpFn.js. The custom value fields are unused here.
		$select_default = $shadow['selectDefault'] ?? '';
		if ( '' !== $select_default && 'custom' !== $select_default ) {
			return $select_default;
		}

		$unit   = $shadow['unit'] ?? '';
		$values = $shadow['value'] ?? array();
		$color  = $shadow['color'] ?? '';

		$top    = $values['top'] ?? 0;
		$right  = $values['right'] ?? 0;
		$bottom = $values['bottom'] ?? 0;
		$left   = $values['left'] ?? 0;
		$inset  = ( 'inset' === strtolower( (string) $unit ) ) ? 'inset ' : '';

		return sprintf( '%s%dpx %dpx %dpx %dpx %s', $inset, $top, $right, $bottom, $left, $color );
	}

	/**
	 * Build a CSS shorthand (`top right bottom left`) from a non-responsive
	 * spacing attribute (Att_Utils::spacing) — used for border-width / radius.
	 *
	 * @param array $spacing Spacing attribute `{ value:{top,right,bottom,left}, unit }`.
	 * @return string
	 */
	public static function spacing_shorthand_value( $spacing ) {
		if ( empty( $spacing ) || ! is_array( $spacing ) ) {
			return '';
		}

		$value = $spacing['value'] ?? array();
		$unit  = is_array( $spacing['unit'] ?? '' ) ? 'px' : ( $spacing['unit'] ?? 'px' );

		$top    = $value['top'] ?? '';
		$right  = $value['right'] ?? '';
		$bottom = $value['bottom'] ?? '';
		$left   = $value['left'] ?? '';

		if ( '' === trim( (string) "$top$right$bottom$left" ) ) {
			return '';
		}

		$side = function ( $v ) use ( $unit ) {
			return ( '' === trim( (string) $v ) ? 0 : $v ) . $unit;
		};

		return sprintf( '%s %s %s %s', $side( $top ), $side( $right ), $side( $bottom ), $side( $left ) );
	}

	/**
	 * Build border CSS properties from a border + border-width attribute pair.
	 *
	 * @param array $border Border attribute `{ style, color }`.
	 * @param array $width  Spacing attribute for border width.
	 * @return array<string,string>
	 */
	public static function border_styles( $border, $width ) {
		$styles = array();
		$style  = $border['style'] ?? '';

		if ( '' === $style || 'none' === $style ) {
			return $styles;
		}

		$styles['border-style'] = $style;
		if ( ! empty( $border['color'] ) ) {
			$styles['border-color'] = $border['color'];
		}

		$border_width = self::spacing_shorthand_value( $width );
		if ( '' !== $border_width ) {
			$styles['border-width'] = $border_width;
		}

		return $styles;
	}

	/**
	 * Build background CSS properties from a background attribute.
	 *
	 * @param array $bg Background attribute `{ color:{ style, solidColor, gradient } }`.
	 * @return array<string,string>
	 */
	public static function background_styles( $bg ) {
		$styles = array();
		$color  = $bg['color'] ?? array();
		$style  = $color['style'] ?? '';

		// Each state resets the opposite property so a state fully replaces another —
		// e.g. a solid hover color must clear a normal-state gradient (background-image)
		// or the gradient keeps painting over the hover color.
		if ( 'bgColor' === $style && ! empty( $color['solidColor'] ) ) {
			$styles['background-color'] = $color['solidColor'];
			$styles['background-image'] = 'none';
		} elseif ( 'gradient' === $style && ! empty( $color['gradient'] ) ) {
			$styles['background-image'] = $color['gradient'];
			$styles['background-color'] = 'transparent';
		} elseif ( 'transparent' === $style ) {
			$styles['background-color'] = 'transparent';
			$styles['background-image'] = 'none';
		}

		return $styles;
	}

	/**
	 * Build a responsive `padding`/`margin` value from a responsive_spacing attribute.
	 *
	 * @param array  $spacing      Responsive spacing attribute.
	 * @param string $device_type  Desktop|Tablet|Mobile.
	 * @return string
	 */
	public static function responsive_spacing_value( $spacing, $device_type = 'Desktop' ) {
		if ( empty( $spacing ) || ! is_array( $spacing ) ) {
			return '';
		}

		$device_values = $spacing['device'][ $device_type ] ?? array();
		if ( empty( $device_values ) ) {
			return '';
		}

		$unit = self::get_unit( $spacing, $device_type );

		$top    = $device_values['top'] ?? '';
		$right  = $device_values['right'] ?? '';
		$bottom = $device_values['bottom'] ?? '';
		$left   = $device_values['left'] ?? '';

		if ( '' === trim( (string) "$top$right$bottom$left" ) ) {
			return '';
		}

		return sprintf( '%s%s %s%s %s%s %s%s', $top, $unit, $right, $unit, $bottom, $unit, $left, $unit );
	}
}
