<?php
/**
 * AI Value Validator
 *
 * Leaf-level type/range/enum gate for AI-generated block attributes.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

defined( 'ABSPATH' ) || exit;

/**
 * AIValueValidator class.
 *
 * Filtering a model response by top-level key alone lets an out-of-range
 * `columns`, an invented enum value or a string where an object belongs reach
 * the saved attributes, where the renderer silently ignores it — which reads
 * to the user as "the AI ignored me". Two gates run here, against the block's
 * registered schema and the same allow-lists the inspector controls use:
 *
 * 1. **Shape** — a first-level key under an object attribute must exist on
 *    that attribute's default, and a scalar never replaces an object.
 * 2. **Value** — a leaf with a rule is coerced, clamped when it is a range,
 *    and dropped when it is an enum, color or type the value cannot satisfy.
 *
 * A dropped leaf leaves the merge untouched, so the block keeps its default
 * (or, on a refine, the value it already had).
 */
class AIValueValidator {

	/**
	 * CSS units accepted on a spacing/size `unit`.
	 *
	 * @var string[]
	 */
	const SIZE_UNITS = array( 'px', '%', 'em', 'rem' );

	/**
	 * Attributes a model response never gets to set, whatever it sends.
	 *
	 * `uniqueId` scopes every per-instance CSS selector; `cardElements` is
	 * rebuilt from the `elements` map by AISchemaValidator so a malformed list
	 * can never replace the sortable rows.
	 *
	 * @var string[]
	 */
	const REJECTED_KEYS = array( 'uniqueId', 'blockName', 'cardElements', 'customCss', 'additionalId', 'additionalCssClass', 'isPreview' );

	/**
	 * Rules keyed by dotted attribute path. A `*` segment matches any single key.
	 *
	 * Kinds: `int`/`number` (`array( min, max )`, clamped), `bool`, `enum`
	 * (values, or a `@name` resolved from Pro_Gate's free lists), `color`,
	 * `gradient`, `shadow_preset`, `reject`. Only free values are listed: a
	 * Pro value is dropped, so the block keeps its default (or current) value.
	 *
	 * @var array<string, array{0: string, 1?: mixed}>
	 */
	const RULES = array(
		'cardDesign'                  => array( 'enum', '@designs' ),
		'columns.device.*'            => array( 'columns' ),
		'columns.unit.*'              => array( 'enum', array( '' ) ),
		'contentAlignment'            => array( 'enum', array( 'left', 'center', 'right' ) ),
		'limit'                       => array( 'int', array( 1, 50 ) ),
		'orderBy'                     => array( 'enum', array( 'date', 'title', 'modified', 'menu_order' ) ),
		'order'                       => array( 'enum', array( 'asc', 'desc' ) ),
		'enableRandomOrder'           => array( 'bool' ),

		'imageAspectRatio'            => array( 'enum', array( 'original', '1-1', '4-3', '3-4', '3-2', '16-9', '9-16' ) ),
		'imageHoverEffect'            => array( 'enum', '@image_hover_effects' ),
		'imageMasking'                => array( 'bool' ),
		'imageMaskShape'              => array( 'enum', '@mask_shapes' ),
		'imageResolution'             => array( 'enum', array( 'full', 'thumbnail', 'medium', 'medium_large', 'large' ) ),
		'imageSize.device.*.width'    => array( 'number', array( 0, 2000 ) ),
		'imageSize.device.*.height'   => array( 'number', array( 0, 2000 ) ),
		'imageSize.unit.*.width'      => array( 'enum', self::SIZE_UNITS ),
		'imageSize.unit.*.height'     => array( 'enum', self::SIZE_UNITS ),
		'imagePosition'               => array( 'enum', array( 'left', 'right' ) ),

		'nameHtmlTag'                 => array( 'enum', array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ) ),
		'bioSource'                   => array( 'enum', '@bio_sources' ),
		'bioLineHeight.device.*'      => array( 'number', array( 0.8, 3 ) ),
		'bioLineHeight.unit.*'        => array( 'enum', array( '' ) ),
		'socialIconStyle'             => array( 'enum', array( 'style-1', 'style-2', 'style-3', 'style-4' ) ),
		'showMemberDetails'           => array( 'bool' ),

		'ajaxPagination'              => array( 'bool' ),

		'slidingEffect'               => array( 'enum', '@slide_effects' ),
		'slideToScroll.device.*'      => array( 'int', array( 1, 6 ) ),
		'slideToScroll.unit.*'        => array( 'enum', array( '' ) ),
		'sliderAutoPlay'              => array( 'bool' ),
		'carouselAutoplayDelay.value' => array( 'int', array( 500, 10000 ) ),
		'carouselAutoplayDelay.unit'  => array( 'enum', array( 'ms' ) ),
		'carouselSpeed.value'         => array( 'int', array( 100, 5000 ) ),
		'carouselSpeed.unit'          => array( 'enum', array( 'ms' ) ),
		'pauseOnHover'                => array( 'bool' ),
		'infiniteLoop'                => array( 'bool' ),
		'carouselDirection'           => array( 'enum', array( 'ltr', 'rtl' ) ),
		'enableNavigationArrow'       => array( 'bool' ),
		'navIconName'                 => array( 'enum', '@nav_arrow_styles' ),
		'navIconPosition'             => array( 'enum', array( 'vertical_center', 'top_left', 'top_center', 'top_right', 'bottom_left', 'bottom_center', 'bottom_right' ) ),
		'enablePaginationDots'        => array( 'bool' ),
		'paginationStyle'             => array( 'enum', '@pagination_styles' ),

		// A font family is the theme's, and a Google Font would need loading.
		'*.googleFont'                => array( 'reject' ),
		'*.typography.family'         => array( 'reject' ),
		'*.typography.style'          => array( 'enum', array( '', 'normal', 'italic' ) ),
		'*.typography.decoration'     => array( 'enum', array( '', 'none', 'underline', 'line-through' ) ),
		'*.typography.fontWeight'     => array( 'enum', array( '', '300', '400', '500', '600', '700', '800' ) ),
		'*.typography.transform'      => array( 'enum', array( '', 'none', 'uppercase', 'capitalize', 'lowercase' ) ),
	);

	/**
	 * Rules keyed by a path regex, applied to scalars with no exact rule.
	 *
	 * The shared shapes (responsive, spacing, background, border, shadow)
	 * repeat the same leaves under dozens of attributes; matching on the tail
	 * covers all of them without an entry per attribute.
	 *
	 * @var array<string, array{0: string, 1?: mixed}>
	 */
	const SUFFIX_RULES = array(
		'/(Letter|Word)Spacing\.value$/'                               => array( 'number', array( -10, 50 ) ),
		'/(Letter|Word)Spacing\.unit$/'                                => array( 'enum', array( 'px', 'em' ) ),
		'/LineHeight\.device\.(Desktop|Tablet|Mobile)$/'               => array( 'number', array( 0, 200 ) ),
		'/LineHeight\.unit\.(Desktop|Tablet|Mobile)$/'                 => array( 'enum', array( '', 'px', 'em' ) ),
		'/^[a-z][a-zA-Z]*Color(Hover)?$/'                               => array( 'color' ),
		'/\.device\.(Desktop|Tablet|Mobile)\.(top|right|bottom|left)$/' => array( 'int', array( -500, 500 ) ),
		'/\.device\.(Desktop|Tablet|Mobile)$/'                          => array( 'number', array( 0, 3000 ) ),
		'/\.unit\.(Desktop|Tablet|Mobile)$/'                            => array( 'enum', self::SIZE_UNITS ),
		'/\.value\.(top|right|bottom|left)$/'                           => array( 'int', array( -500, 500 ) ),
		'/BoxShadow(Hover)?\.unit$/'                                     => array( 'enum', array( 'Outset', 'Inset' ) ),
		'/^[a-zA-Z]+\.value$/'                                          => array( 'number', array( 0, 3000 ) ),
		'/^[a-zA-Z]+\.unit$/'                                           => array( 'enum', self::SIZE_UNITS ),
		'/\.allChange$/'                                                => array( 'bool' ),
		'/\.(color|hover)\.style$/'                                     => array( 'enum', array( 'bgColor', 'gradient', 'transparent' ) ),
		'/\.solidColor$/'                                               => array( 'color' ),
		'/\.gradient$/'                                                 => array( 'gradient' ),
		'/\.transparent$/'                                              => array( 'reject' ),
		'/Border(Hover)?\.style$/'                                      => array( 'enum', array( 'none', 'solid', 'dashed', 'dotted', 'double' ) ),
		'/Border(Hover)?\.(color|hoverColor|activeColor)$/'             => array( 'color' ),
		'/BoxShadow(Hover)?\.isActive$/'                                => array( 'bool' ),
		'/BoxShadow(Hover)?\.selectDefault$/'                           => array( 'shadow_preset' ),
		'/BoxShadow(Hover)?\.color$/'                                   => array( 'color' ),
	);

	/**
	 * Drop or coerce every AI-supplied value the target block cannot use.
	 *
	 * @param array  $ai_attributes Raw parsed JSON attributes from the model.
	 * @param string $block_name    Target block name, with or without the `sptp/` prefix.
	 * @param array  $dropped       Out-param: dotted paths that were rejected.
	 * @return array Attributes safe to merge.
	 */
	public static function validate( array $ai_attributes, string $block_name, array &$dropped = array() ): array {
		$dropped  = array();
		$slug     = AICatalogBuilder::slug( $block_name );
		$defaults = self::schema_defaults( $slug );
		$context  = array( 'slug' => $slug );

		// Only what the model was offered: a registered but uncatalogued key
		// (`hideOnDesktop`, `filterBy`, …) can hide the block or empty its query.
		$allowed = array_flip( AICatalogBuilder::catalog_relevant_keys_for_block( $slug ) );

		$clean = array();
		foreach ( $ai_attributes as $key => $value ) {
			if ( ! isset( $allowed[ $key ] ) || ! array_key_exists( $key, $defaults ) || in_array( $key, self::REJECTED_KEYS, true ) ) {
				$dropped[] = (string) $key;
				continue;
			}

			$filtered = self::filter_node( (string) $key, $value, $defaults[ $key ], $context, $dropped, 1 );
			if ( null !== $filtered ) {
				$clean[ $key ] = $filtered;
			}
		}

		return $clean;
	}

	/**
	 * Validate one node, recursing into containers.
	 *
	 * @param string $path    Dotted attribute path.
	 * @param mixed  $value   AI-supplied value.
	 * @param mixed  $default Schema default at this path, or null when unknown.
	 * @param array  $context Block slug.
	 * @param array  $dropped Out-param: rejected paths.
	 * @param int    $depth   1 for a top-level attribute.
	 * @return mixed Cleaned value, or null when the node is rejected.
	 */
	private static function filter_node( string $path, $value, $default, array $context, array &$dropped, int $depth ) {
		if ( null === $value ) {
			$dropped[] = $path;
			return null;
		}

		// Merged over an object default, a scalar would erase the whole object.
		if ( ! is_array( $value ) && is_array( $default ) && ! empty( $default ) ) {
			$dropped[] = $path;
			return null;
		}

		// Suffix rules describe scalar leaves only; an exact rule speaks for the
		// path itself, containers included.
		$rule = self::exact_rule( $path );
		if ( null === $rule && ! is_array( $value ) ) {
			$rule = self::suffix_rule( $path );
		}

		if ( null !== $rule ) {
			$applied = self::apply_rule( $rule, $value, $context );
			if ( null === $applied ) {
				$dropped[] = $path;
			}
			return $applied;
		}

		if ( ! is_array( $value ) ) {
			return self::scalar_passthrough( $value, $default );
		}

		if ( null !== $default && ! is_array( $default ) ) {
			$dropped[] = $path;
			return null;
		}

		// Deeper structure legitimately carries keys a default never enumerates
		// (per-device entries), so only first-level keys are checked.
		$check_keys = 1 === $depth && is_array( $default ) && ! empty( $default ) && self::is_assoc( $default );

		$filtered = array();
		foreach ( $value as $child_key => $child_value ) {
			$child_path = $path . '.' . $child_key;
			// A shadow default only carries `selectDefault` when a preset was
			// baked in, yet the control writes it on every shadow.
			$is_shadow_preset = 'selectDefault' === $child_key && 1 === preg_match( '/BoxShadow(Hover)?$/', $path );
			if ( $check_keys && ! $is_shadow_preset && ! array_key_exists( $child_key, $default ) ) {
				$dropped[] = $child_path;
				continue;
			}

			$child_default = is_array( $default ) && array_key_exists( $child_key, $default ) ? $default[ $child_key ] : null;
			$child_clean   = self::filter_node( $child_path, $child_value, $child_default, $context, $dropped, $depth + 1 );
			if ( null !== $child_clean ) {
				$filtered[ $child_key ] = $child_clean;
			}
		}

		return empty( $filtered ) ? null : $filtered;
	}

	/**
	 * A scalar with no rule of its own: keep it only when it matches the
	 * default's type, so an unruled string can never carry markup into CSS.
	 *
	 * @param mixed $value   Raw value.
	 * @param mixed $default Schema default.
	 * @return mixed|null
	 */
	private static function scalar_passthrough( $value, $default ) {
		if ( is_bool( $default ) ) {
			return self::to_bool( $value );
		}
		if ( is_int( $default ) || is_float( $default ) ) {
			return is_numeric( $value ) ? $value + 0 : null;
		}

		return is_string( $value ) ? sanitize_text_field( $value ) : null;
	}

	/**
	 * Resolve the rule declared for this exact path (`*` segments match any key).
	 *
	 * @param string $path Dotted attribute path.
	 * @return array|null
	 */
	private static function exact_rule( string $path ) {
		if ( isset( self::RULES[ $path ] ) ) {
			return self::RULES[ $path ];
		}

		foreach ( self::RULES as $pattern => $rule ) {
			if ( false !== strpos( $pattern, '*' ) && self::wildcard_matches( $pattern, $path ) ) {
				return $rule;
			}
		}

		return null;
	}

	/**
	 * Resolve the rule for a scalar leaf by its path tail.
	 *
	 * @param string $path Dotted attribute path.
	 * @return array|null
	 */
	private static function suffix_rule( string $path ) {
		foreach ( self::SUFFIX_RULES as $pattern => $rule ) {
			if ( 1 === preg_match( $pattern, $path ) ) {
				return $rule;
			}
		}

		return null;
	}

	/**
	 * Match a dotted path against a pattern whose `*` segments match any one key.
	 *
	 * @param string $pattern Rule key.
	 * @param string $path    Dotted attribute path.
	 * @return bool
	 */
	private static function wildcard_matches( string $pattern, string $path ): bool {
		$pattern_segments = explode( '.', $pattern );
		$path_segments    = explode( '.', $path );
		if ( count( $pattern_segments ) !== count( $path_segments ) ) {
			return false;
		}

		foreach ( $pattern_segments as $index => $segment ) {
			if ( '*' !== $segment && $segment !== $path_segments[ $index ] ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Apply one rule to one value.
	 *
	 * @param array $rule    Rule tuple.
	 * @param mixed $value   AI-supplied value.
	 * @param array $context Block slug.
	 * @return mixed Cleaned value, or null when rejected.
	 */
	private static function apply_rule( array $rule, $value, array $context ) {
		$kind = $rule[0];
		$arg  = $rule[1] ?? null;

		switch ( $kind ) {
			case 'bool':
				return self::to_bool( $value );
			case 'int':
				return self::to_clamped_number( $value, $arg[0], $arg[1], true );
			case 'number':
				return self::to_clamped_number( $value, $arg[0], $arg[1], false );
			case 'enum':
				return self::to_enum( $value, is_string( $arg ) ? self::dynamic_enum( $arg, $context ) : $arg );
			case 'color':
				return is_string( $value ) ? self::sanitize_color( $value ) : null;
			case 'gradient':
				return is_string( $value ) && 1 === preg_match( '/^(linear|radial)-gradient\([#%.,()\sa-zA-Z0-9-]+\)$/', trim( $value ) ) ? trim( $value ) : null;
			case 'shadow_preset':
				return is_string( $value ) && 1 === preg_match( '/^var\(--sp-smart-team-shadow-[a-z]+-\d+dp\)$/', trim( $value ) ) ? trim( $value ) : null;
			case 'columns':
				return self::to_clamped_number( $value, 1, 'carousel' === $context['slug'] ? 8 : 6, true );
		}

		return null;
	}

	/**
	 * Resolve a `@name` enum to its free value list.
	 *
	 * @param string $name    Dynamic enum name.
	 * @param array  $context Block slug (unused: both free blocks share the lists).
	 * @return string[]
	 */
	private static function dynamic_enum( string $name, array $context ): array {
		unset( $context );

		$lists = array(
			'@designs'             => AICatalogBuilder::card_designs(),
			'@image_hover_effects' => Pro_Gate::FREE_IMAGE_HOVER_EFFECTS,
			'@mask_shapes'         => Pro_Gate::FREE_MASK_SHAPES,
			'@bio_sources'         => Pro_Gate::FREE_BIO_SOURCES,
			'@slide_effects'       => AICatalogBuilder::slide_effects(),
			'@nav_arrow_styles'    => Pro_Gate::FREE_NAV_ARROW_STYLES,
			'@pagination_styles'   => Pro_Gate::FREE_PAGINATION_STYLES,
		);

		return $lists[ $name ] ?? array();
	}

	/**
	 * Validate a CSS color: hex, rgb(a)/hsl(a), `transparent`, or empty (unset).
	 *
	 * @param string $value Raw value.
	 * @return string|null
	 */
	public static function sanitize_color( string $value ) {
		$value = trim( $value );

		if ( '' === $value || 'transparent' === strtolower( $value ) ) {
			return strtolower( $value );
		}

		if ( 1 === preg_match( '/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $value ) ) {
			return $value;
		}

		if ( 1 === preg_match( '/^(?:rgb|hsl)a?\(\s*[\d.]+%?\s*[, ]\s*[\d.]+%?\s*[, ]\s*[\d.]+%?\s*(?:[,\/]\s*[\d.]+%?\s*)?\)$/i', $value ) ) {
			return $value;
		}

		return null;
	}

	/**
	 * Coerce a boolean, accepting the string/int forms a model tends to emit.
	 *
	 * @param mixed $value Raw value.
	 * @return bool|null
	 */
	private static function to_bool( $value ) {
		if ( is_bool( $value ) ) {
			return $value;
		}
		if ( is_int( $value ) && ( 0 === $value || 1 === $value ) ) {
			return 1 === $value;
		}
		if ( ! is_string( $value ) ) {
			return null;
		}

		$normalized = strtolower( trim( $value ) );
		if ( in_array( $normalized, array( 'true', 'yes', '1' ), true ) ) {
			return true;
		}
		if ( in_array( $normalized, array( 'false', 'no', '0' ), true ) ) {
			return false;
		}

		return null;
	}

	/**
	 * Coerce and clamp a number. An empty string passes through — the schema
	 * uses it for "unset" on responsive values.
	 *
	 * @param mixed $value  Raw value.
	 * @param float $min    Lower bound.
	 * @param float $max    Upper bound.
	 * @param bool  $is_int Whether to return an int.
	 * @return int|float|string|null
	 */
	private static function to_clamped_number( $value, $min, $max, bool $is_int ) {
		if ( '' === $value ) {
			return '';
		}
		if ( is_bool( $value ) || ! is_numeric( $value ) ) {
			return null;
		}

		$number = min( (float) $max, max( (float) $min, (float) $value ) );
		if ( $is_int ) {
			return (int) round( $number );
		}

		return floor( $number ) === $number ? (int) $number : $number;
	}

	/**
	 * Match a value against an allow-list, tolerating case and surrounding space.
	 *
	 * @param mixed    $value   Raw value.
	 * @param string[] $allowed Allowed values.
	 * @return string|null Canonical allowed value, or null.
	 */
	private static function to_enum( $value, array $allowed ) {
		if ( is_int( $value ) || is_float( $value ) ) {
			$value = (string) $value;
		}
		if ( ! is_string( $value ) || empty( $allowed ) ) {
			return null;
		}

		$normalized = strtolower( trim( $value ) );
		foreach ( $allowed as $candidate ) {
			if ( strtolower( (string) $candidate ) === $normalized ) {
				return $candidate;
			}
		}

		return null;
	}

	/**
	 * Raw default value per attribute for one block, from its registration.
	 *
	 * @param string $block_name Block name, with or without the `sptp/` prefix.
	 * @return array<string, mixed>
	 */
	public static function schema_defaults( string $block_name ): array {
		$type = \WP_Block_Type_Registry::get_instance()->get_registered( 'sptp/' . AICatalogBuilder::slug( $block_name ) );
		if ( ! $type || ! is_array( $type->attributes ) ) {
			return array();
		}

		$defaults = array();
		foreach ( $type->attributes as $key => $definition ) {
			if ( is_array( $definition ) && array_key_exists( 'default', $definition ) ) {
				$defaults[ $key ] = $definition['default'];
			}
		}

		return $defaults;
	}

	/**
	 * True when the array is empty or keyed by strings.
	 *
	 * @param array $candidate Array to test.
	 * @return bool
	 */
	private static function is_assoc( array $candidate ): bool {
		if ( empty( $candidate ) ) {
			return true;
		}

		return array_keys( $candidate ) !== range( 0, count( $candidate ) - 1 );
	}
}
