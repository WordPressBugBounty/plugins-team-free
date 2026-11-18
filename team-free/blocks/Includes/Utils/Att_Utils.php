<?php
/**
 * Utility helpers for block attributes.
 *
 * Reusable factories that produce Gutenberg attribute definitions in the shape
 * the editor expects. Ported from the Styble Pro architecture so block authors
 * can write `Att_Utils::string('foo')` instead of hand-rolling the array.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Att_Utils
 *
 * Provides reusable helper methods for generating
 * Gutenberg block attribute definitions.
 */
class Att_Utils {

	/**
	 * A Google Fonts family name (letters, digits, spaces, hyphens). Twin of
	 * FONT_FAMILY_PATTERN in apps/utils/googleFonts.js.
	 */
	const FONT_FAMILY_PATTERN = '/^[A-Za-z0-9 -]+$/';

	/**
	 * A font weight token: `400`, `700italic`, `italic`.
	 */
	const FONT_WEIGHT_PATTERN = '/^[A-Za-z0-9]+$/';

	/**
	 * Extract Google Font family tokens from block attributes.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @return array<int, string>
	 */
	public static function extract_font_families_from_attributes( $attributes ) {
		$fonts = array();

		if ( ! is_array( $attributes ) ) {
			return $fonts;
		}

		foreach ( $attributes as $value ) {
			if ( ! is_array( $value ) || empty( $value['typography']['family'] ) ) {
				continue;
			}

			$family = trim( (string) $value['typography']['family'] );
			$weight = isset( $value['typography']['fontWeight'] ) && '' !== trim( (string) $value['typography']['fontWeight'] )
				? trim( (string) $value['typography']['fontWeight'] )
				: '400';

			if ( '' === $family || 'default' === strtolower( $family ) ) {
				continue;
			}

			if ( 'regular' === strtolower( $weight ) || 'normal' === strtolower( $weight ) ) {
				$weight = '400';
			}

			// Both go into the fonts.googleapis.com query: a value with `&`, `?`,
			// `#`, a quote or a bracket would add parameters to it. Google family
			// names are letters, digits, spaces and hyphens; weights `700italic`.
			if ( ! preg_match( self::FONT_FAMILY_PATTERN, $family ) || ! preg_match( self::FONT_WEIGHT_PATTERN, $weight ) ) {
				continue;
			}

			$fonts[] = $family . ':' . $weight;
		}

		return array_values( array_unique( $fonts ) );
	}

	/**
	 * Generate typography attribute configuration.
	 *
	 * @param string $family      Font family.
	 * @param string $font_weight Font weight.
	 * @param string $style       Font style.
	 * @param string $transform   Text transform.
	 * @param string $decoration  Text decoration.
	 * @param array  $variants    Google font variants.
	 *
	 * @return array
	 */
	public static function typography(
		$family = '',
		$font_weight = '',
		$style = '',
		$transform = '',
		$decoration = '',
		$variants = array( '300', '400', '500', '600', '700', '800' )
	) {
		return array(
			'type'    => 'object',
			'default' => array(
				'googleFont' => array(
					'family'   => 'Default',
					'variants' => $variants,
				),
				'typography' => array(
					'family'     => $family,
					'fontWeight' => $font_weight,
					'style'      => $style,
					'transform'  => $transform,
					'decoration' => $decoration,
				),
			),
		);
	}

	/**
	 * Generate a single responsive value attribute definition.
	 *
	 * @param string $desktop Desktop value.
	 * @param string $tablet  Tablet value.
	 * @param string $mobile  Mobile value.
	 * @param string $unit    CSS unit.
	 *
	 * @return array Responsive attribute configuration.
	 */
	public static function single_responsive( $desktop = '', $tablet = '', $mobile = '', $unit = 'px' ) {
		return array(
			'type'    => 'object',
			'default' => array(
				'device' => array(
					'Desktop' => $desktop,
					'Tablet'  => $tablet,
					'Mobile'  => $mobile,
				),
				'unit'   => array(
					'Desktop' => $unit,
					'Tablet'  => $unit,
					'Mobile'  => $unit,
				),
			),
		);
	}

	/**
	 * Generate a spacing attribute definition.
	 *
	 * @param string $top        Top spacing.
	 * @param string $right      Right spacing.
	 * @param string $bottom     Bottom spacing.
	 * @param string $left       Left spacing.
	 * @param string $unit       CSS unit.
	 * @param bool   $all_change Whether all sides change together.
	 *
	 * @return array Spacing attribute configuration.
	 */
	public static function spacing( $top = '', $right = '', $bottom = '', $left = '', $unit = 'px', $all_change = false ) {
		return array(
			'type'    => 'object',
			'default' => array(
				'value'     => array(
					'top'    => $top,
					'right'  => $right,
					'bottom' => $bottom,
					'left'   => $left,
				),
				'unit'      => $unit,
				'allChange' => $all_change,
			),
		);
	}

	/**
	 * Generate a responsive spacing attribute definition.
	 *
	 * @param string $top        Top spacing value.
	 * @param string $right      Right spacing value.
	 * @param string $bottom     Bottom spacing value.
	 * @param string $left       Left spacing value.
	 * @param string $unit       CSS unit.
	 * @param bool   $all_change Whether all sides change together.
	 *
	 * @return array Responsive spacing attribute configuration.
	 */
	public static function responsive_spacing( $top = '', $right = '', $bottom = '', $left = '', $unit = 'px', $all_change = false ) {
		return array(
			'type'    => 'object',
			'default' => array(
				'device'    => array(
					'Desktop' => array(
						'top'    => $top,
						'right'  => $right,
						'bottom' => $bottom,
						'left'   => $left,
					),
					'Tablet'  => array(
						'top'    => '',
						'right'  => '',
						'bottom' => '',
						'left'   => '',
					),
					'Mobile'  => array(
						'top'    => '',
						'right'  => '',
						'bottom' => '',
						'left'   => '',
					),
				),
				'unit'      => array(
					'Desktop' => $unit,
					'Tablet'  => $unit,
					'Mobile'  => $unit,
				),
				'allChange' => $all_change,
			),
		);
	}

	/**
	 * Box-shadow attribute definition.
	 *
	 * @param bool   $is_active Whether the shadow is active.
	 * @param string $top       Top offset.
	 * @param string $right     Right offset.
	 * @param string $bottom    Bottom offset.
	 * @param string $left      Left offset.
	 * @param string $color     Shadow color.
	 * @param string $unit      Shadow style (Outset / Inset).
	 * @param string $select_default Preset shadow to start on — the full CSS
	 *                               variable of a shadowPresets.js slug, e.g.
	 *                               'var(--sp-smart-team-shadow-light-2dp)'. Both
	 *                               CSS twins return it verbatim and the BoxShadow
	 *                               control check-marks the matching tile. Omit for
	 *                               the custom-value shape (the key is then left
	 *                               out entirely, so every existing default is
	 *                               unchanged).
	 *
	 * @return array
	 */
	public static function box_shadow( $is_active = false, $top = '', $right = '', $bottom = '', $left = '', $color = '', $unit = 'Outset', $select_default = '' ) {
		$default = array(
			'value'    => array(
				'top'    => $top,
				'right'  => $right,
				'bottom' => $bottom,
				'left'   => $left,
			),
			'unit'     => $unit,
			'color'    => $color,
			'isActive' => $is_active,
		);

		if ( '' !== $select_default ) {
			$default['selectDefault'] = $select_default;
		}

		return array(
			'type'    => 'object',
			'default' => $default,
		);
	}

	/**
	 * Boolean attribute definition.
	 *
	 * @param bool $value Default value.
	 *
	 * @return array
	 */
	public static function boolean( $value = false ) {
		return array(
			'type'    => 'boolean',
			'default' => $value,
		);
	}

	/**
	 * Open object attribute definition (no default).
	 *
	 * @return array
	 */
	public static function object() {
		return array(
			'type' => 'object',
		);
	}

	/**
	 * Array attribute definition (e.g. a multi-select value list). Use this — not
	 * object() — for list values so Gutenberg does not coerce the array into an
	 * object on reload (which breaks Array.isArray() checks in the controls).
	 *
	 * @param array $value Default array value.
	 *
	 * @return array
	 */
	public static function array_field( array $value = array() ) {
		return array(
			'type'    => 'array',
			'default' => $value,
		);
	}

	/**
	 * String attribute definition.
	 *
	 * @param mixed $value Default value.
	 *
	 * @return array
	 */
	public static function string( $value = '' ) {
		return array(
			'type'    => 'string',
			'default' => $value,
		);
	}

	/**
	 * Select-field attribute definition (string-typed).
	 *
	 * @param mixed $value Default value.
	 *
	 * @return array
	 */
	public static function select_field( $value = '' ) {
		return array(
			'type'    => 'string',
			'default' => $value,
		);
	}

	/**
	 * Button-group attribute definition (string-typed).
	 *
	 * @param mixed $value Default value.
	 *
	 * @return array
	 */
	public static function button_group( $value = '' ) {
		return array(
			'type'    => 'string',
			'default' => $value,
		);
	}

	/**
	 * Number attribute definition.
	 *
	 * @param mixed $value Default value.
	 *
	 * @return array
	 */
	public static function number( $value = '' ) {
		return array(
			'type'    => 'number',
			'default' => $value,
		);
	}

	/**
	 * Border attribute definition (style + colors).
	 *
	 * @param string      $default_style Default border style.
	 * @param string      $normal_color  Default normal color.
	 * @param string|null $hover_color   Default hover color (omit to skip).
	 * @param string|null $active_color  Default active color (omit to skip).
	 *
	 * @return array
	 */
	public static function border( $default_style = 'none', $normal_color = '', $hover_color = null, $active_color = null ) {
		$default = array(
			'style' => $default_style,
			'color' => $normal_color,
		);

		if ( null !== $hover_color ) {
			$default['hoverColor'] = $hover_color;
		}
		if ( null !== $active_color ) {
			$default['activeColor'] = $active_color;
		}

		return array(
			'type'    => 'object',
			'default' => $default,
		);
	}

	/**
	 * Range-control attribute definition (value + unit).
	 *
	 * @param mixed  $default_value Default value.
	 * @param string $unit          Default unit.
	 *
	 * @return array
	 */
	public static function range_control( $default_value, $unit = 'px' ) {
		return array(
			'type'    => 'object',
			'default' => array(
				'value' => $default_value,
				'unit'  => $unit,
			),
		);
	}

	/**
	 * Independent width/height control with per-dimension units (responsive).
	 *
	 * Mirrors the `WidthHeight` JS control: each dimension keeps its own value
	 * and unit per device; an empty height means "Auto". The same defaults apply
	 * to all three devices.
	 *
	 * @param int|string $width       Width value (all devices).
	 * @param int|string $height      Height value; '' = Auto.
	 * @param string     $width_unit  Width unit.
	 * @param string     $height_unit Height unit.
	 *
	 * @return array
	 */
	public static function width_height( $width = 100, $height = '', $width_unit = '%', $height_unit = 'px' ) {
		$dimensions = array(
			'width'  => $width,
			'height' => $height,
		);
		$dim_units  = array(
			'width'  => $width_unit,
			'height' => $height_unit,
		);

		return array(
			'type'    => 'object',
			'default' => array(
				'device' => array(
					'Desktop' => $dimensions,
					'Tablet'  => $dimensions,
					'Mobile'  => $dimensions,
				),
				'unit'   => array(
					'Desktop' => $dim_units,
					'Tablet'  => $dim_units,
					'Mobile'  => $dim_units,
				),
			),
		);
	}

	/**
	 * Sortable toggle-list attribute (e.g. Card Elements → Member Information).
	 *
	 * Expands a compact `[ value, label, show ]` list into the full item shape
	 * the `DragAndDropDnd` control consumes: `{ id, value, label, show }`
	 * (id defaults to value).
	 *
	 * @param array $items List of `array( string $value, string $label, bool $show )`.
	 *
	 * @return array
	 */
	public static function sortable_list( array $items = array() ) {
		$default = array();
		foreach ( $items as $item ) {
			$value     = isset( $item[0] ) ? $item[0] : '';
			$default[] = array(
				'id'    => $value,
				'value' => $value,
				'label' => isset( $item[1] ) ? $item[1] : '',
				'show'  => ! empty( $item[2] ),
			);
		}

		return array(
			'type'    => 'array',
			'default' => $default,
		);
	}

	/**
	 * Background attribute definition (color + gradient + hover).
	 *
	 * @param string $style         Background style.
	 * @param string $default_color Default solid color.
	 * @param string $gradient      Gradient value.
	 * @param string $hover_color   Default hover solid color. Empty (the default)
	 *                              emits no hover rule, so a static SCSS hover look
	 *                              holds — but only until the caller's NORMAL state
	 *                              emits, since that rule then outranks the SCSS
	 *                              `:hover` at ID specificity. Set it whenever the
	 *                              design has a hover fill of its own.
	 *
	 * @return array
	 */
	public static function background(
		$style = 'transparent',
		$default_color = '#E9F4FFF2',
		$gradient = 'linear-gradient(135deg,rgba(179,50,95,0.44) 0%,rgba(227,86,43,0.45) 100%)',
		$hover_color = ''
	) {
		return array(
			'type'    => 'object',
			'default' => array(
				'color' => array(
					'style'       => $style,
					'transparent' => '',
					'solidColor'  => $default_color,
					'gradient'    => $gradient,
				),
				'hover' => array(
					'style'       => 'bgColor',
					'transparent' => '',
					'solidColor'  => $hover_color,
					'gradient'    => $gradient,
				),
			),
		);
	}
}
