<?php
/**
 * Swiper config builder for the Carousel block.
 *
 * Resolves conflicts between carouselStyle, slidingEffect,
 * carouselDisplayStyle, partialSlideView, columns and carouselDirection
 * (port of testimonial-pro's SwiperConfig). Mirrors the editor
 * useSwiperConfig hook — keep both in lock-step so editor preview and
 * frontend behave identically. The result is JSON-encoded into the
 * data-swiper-settings attribute consumed by initCarousel() in
 * blocks/assets/js/script.js.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

defined( 'ABSPATH' ) || exit;

/**
 * Class SwiperConfig
 */
class SwiperConfig {

	/**
	 * Block attributes.
	 *
	 * @var array
	 */
	protected $attributes;

	/**
	 * Resolved sliding effect, coerced against carouselStyle.
	 *
	 * @var string
	 */
	protected $effect;

	/**
	 * Constructor.
	 *
	 * @param array $attributes Block attributes.
	 */
	public function __construct( array $attributes ) {
		// Normalize Pro-only values to their free fallback here, once, so
		// every read below (and in build()) sees only free-safe values —
		// idempotent and safe to call again on values a caller already
		// normalized itself.
		$attributes['carouselStyle']        = Pro_Gate::carousel_style( $attributes['carouselStyle'] ?? 'default' );
		$attributes['carouselDisplayStyle'] = Pro_Gate::display_style( $attributes['carouselDisplayStyle'] ?? 'horizontal' );
		$attributes['slidingEffect']        = Pro_Gate::slide_effect( $attributes['slidingEffect'] ?? 'slide' );
		$attributes['partialSlideView']     = Pro_Gate::partial_view( $attributes['partialSlideView'] ?? false );

		$this->attributes = $attributes;
		$carousel_style   = $attributes['carouselStyle'] ?? 'default';
		$display_style    = $attributes['carouselDisplayStyle'] ?? 'horizontal';
		// Partial-left context for the spring lock (same derivation as build()).
		$partial_left = ! empty( $attributes['partialSlideView'] )
			&& 'default' === $carousel_style
			&& 'horizontal' === $display_style
			&& 'left' === ( $attributes['partialViewSide'] ?? 'right' );
		$this->effect = self::resolve_effect(
			$carousel_style,
			$attributes['slidingEffect'] ?? 'slide',
			$partial_left
		);
	}

	/**
	 * Static factory — build and return the swiper config array in one call.
	 *
	 * @param array $attributes Block attributes.
	 * @return array
	 */
	public static function make( array $attributes ) {
		return ( new self( $attributes ) )->build();
	}

	/**
	 * Coerce sliding effect by carousel style. The center style locks the
	 * slide effect (the ticker style never reaches Swiper at all); default
	 * style allows any supported effect. "none" and "ken-burns" ride on a
	 * plain slide transition ("none" additionally zeroes the speed in
	 * build()); legacy "coverflow" values still resolve.
	 *
	 * @param string $carousel_style Carousel style.
	 * @param string $sliding_effect Stored sliding effect.
	 * @param bool   $partial_left   Whether the partial view peeks on the left (dir=rtl).
	 * @return string
	 */
	public static function resolve_effect( $carousel_style, $sliding_effect, $partial_left = false ) {
		// Legacy saves — the coverflow style was removed.
		if ( 'coverflow' === $carousel_style ) {
			return 'coverflow';
		}
		// Center + ticker lock the slide effect; multi-row uses Swiper's grid
		// module, which is incompatible with fade/cube/flip/creative — lock it too.
		if ( in_array( $carousel_style, array( 'center', 'ticker', 'multi-row' ), true ) ) {
			return 'slide';
		}
		// Ken Burns is a CSS zoom on top of a plain slide transition; None is
		// a slide transition with zero speed (instant jump).
		if ( in_array( $sliding_effect, array( 'ken-burns', 'none' ), true ) ) {
			return 'slide';
		}
		// The Figma "Spring" effect is Swiper's creative effect. Swiper's
		// creative effect has no RTL support (the vendored v8 and the editor's
		// v12 both place slides with LTR math), so the partial-left dir=rtl
		// flip would scatter the slides — lock spring to the plain slide
		// transition there, like the center style does.
		if ( 'spring' === $sliding_effect ) {
			return $partial_left ? 'slide' : 'creative';
		}
		return $sliding_effect ? $sliding_effect : 'slide';
	}

	/**
	 * Clamp a raw partial-view fraction to the open interval (0, 1); null otherwise.
	 *
	 * @param mixed $value Raw stored value.
	 * @return float|null
	 */
	protected static function clamp_offset( $value ) {
		if ( ! is_numeric( $value ) ) {
			return null;
		}
		$value = (float) $value;
		return ( $value > 0 && $value < 1 ) ? $value : null;
	}

	/**
	 * Per-device slidesPerView, honoring the partial-view peek.
	 *
	 * Adds a single fractional peek when partial view is active, resolved per
	 * device with a Tablet→Desktop, Mobile→Tablet→Desktop fallback cascade
	 * (default 0.3). "both" surfaces the peek symmetrically via
	 * centeredSlides; "left"/"right" via the flipped/natural swiper direction.
	 * Mirrors useSwiperConfig.js.
	 *
	 * @param string $device              Device key (Mobile|Tablet|Desktop).
	 * @param array  $columns             Responsive columns attribute.
	 * @param bool   $partial             Whether partial view is active.
	 * @param array  $partial_view_offset Responsive partialViewOffset attribute.
	 * @return int|float
	 */
	protected static function slides_per_view( $device, $columns, $partial, $partial_view_offset ) {
		$value = $columns['device'][ $device ] ?? 1;
		$count = is_numeric( $value ) ? (float) $value : 1;
		if ( $partial ) {
			$by_device = $partial_view_offset['device'] ?? array();
			$desktop   = self::clamp_offset( $by_device['Desktop'] ?? null );
			$desktop   = ( null === $desktop ) ? 0.3 : $desktop;
			$tablet    = self::clamp_offset( $by_device['Tablet'] ?? null );
			$tablet    = ( null === $tablet ) ? $desktop : $tablet;
			$offset    = $desktop;
			if ( 'Tablet' === $device ) {
				$offset = $tablet;
			} elseif ( 'Mobile' === $device ) {
				$mobile = self::clamp_offset( $by_device['Mobile'] ?? null );
				$offset = ( null === $mobile ) ? $tablet : $mobile;
			}
			$count += $offset;
		}
		return ( floor( $count ) === $count ) ? (int) $count : $count;
	}

	/**
	 * Per-device slidesPerGroup.
	 *
	 * @param string $device          Device key.
	 * @param array  $slide_to_scroll Responsive slideToScroll attribute.
	 * @return int
	 */
	protected static function slides_per_group( $device, $slide_to_scroll ) {
		$value = $slide_to_scroll['device'][ $device ] ?? 1;
		return is_numeric( $value ) ? max( 1, (int) $value ) : 1;
	}

	/**
	 * Smallest member count the carousel still loops with.
	 *
	 * Only more slides than are visible are needed for there to be anything to
	 * loop; between this and loop_minimum_slides() the frontend runtime repeats
	 * whole member sets until Swiper 12's slide-moving loop has enough to rebalance.
	 *
	 * @param float|int $slides_per_view slidesPerView (may be fractional).
	 * @return int
	 */
	public static function cloned_loop_minimum_slides( $slides_per_view ) {
		return max( 1, (int) floor( (float) $slides_per_view ) ) + 1;
	}

	/**
	 * Minimum rendered slide count Swiper needs before it can loop.
	 *
	 * Mirrors the capacity check in Swiper's loopFix() — twin of
	 * getSwiperLoopMinimumSlides() in apps/utils/swiperLoop.js. Below this count
	 * an infinite loop renders a broken partial loop (gaps / no wrap), so the
	 * frontend runtime disables the loop when the real slide count is under it.
	 *
	 * @param float|int $slides_per_view  slidesPerView (may be fractional).
	 * @param int       $slides_per_group slidesPerGroup.
	 * @param bool      $both_directions  Centered / partial-left layouts.
	 * @return int
	 */
	public static function loop_minimum_slides( $slides_per_view, $slides_per_group, $both_directions = false ) {
		$per_view = max( 1, (int) ceil( (float) $slides_per_view ) );
		$group    = max( 1, (int) ceil( (float) $slides_per_group ) );

		if ( $both_directions && 0 === $per_view % 2 ) {
			++$per_view;
		}

		$looped = $both_directions ? max( $group, (int) ceil( $per_view / 2 ) ) : $group;
		if ( 0 !== $looped % $group ) {
			$looped += $group - ( $looped % $group );
		}

		return $per_view + $looped;
	}

	/**
	 * Per-device spaceBetween.
	 *
	 * @param string $device     Device key.
	 * @param array  $column_gap Responsive columnGap attribute.
	 * @return int
	 */
	protected static function space_between( $device, $column_gap ) {
		$value = $column_gap['device'][ $device ] ?? 0;
		return is_numeric( $value ) ? (int) $value : 0;
	}

	/**
	 * Build the conflict-resolved swiper config suitable for JSON encoding
	 * into the data-swiper-settings attribute.
	 *
	 * @return array
	 */
	public function build() {
		$attributes          = $this->attributes;
		$effect              = $this->effect;
		$carousel_style      = $attributes['carouselStyle'] ?? 'default';
		$display_style       = $attributes['carouselDisplayStyle'] ?? 'horizontal';
		$carousel_direction  = $attributes['carouselDirection'] ?? 'rtl';
		$adaptive_height     = ! empty( $attributes['adaptiveHeight'] );
		$carousel_speed      = $attributes['carouselSpeed']['value'] ?? 600;
		$infinite_loop       = ! empty( $attributes['infiniteLoop'] );
		$slider_autoplay     = ! empty( $attributes['sliderAutoPlay'] );
		$carousel_delay      = $attributes['carouselAutoplayDelay']['value'] ?? 3000;
		$pause_on_hover      = ! empty( $attributes['pauseOnHover'] );
		$tab_key_navigation  = ! empty( $attributes['tabAndKeyNavigation'] );
		$mouse_wheel_control = ! empty( $attributes['mouseWheelControl'] );
		$free_scroll_mode    = ! empty( $attributes['freeScrollMode'] );
		$enable_navigation   = ! empty( $attributes['enableNavigationArrow'] );
		$enable_pagination   = ! empty( $attributes['enablePaginationDots'] );
		$pagination_style    = Pro_Gate::pagination_style( $attributes['paginationStyle'] ?? 'dots' );

		// Multi-row (Swiper grid module): rows of slides. The grid module cannot
		// coexist with loop (it warns and mis-lays the rows) and is horizontal
		// only, so force loop off and ignore the vertical direction. Twin:
		// isMultiRow handling in useSwiperConfig.js.
		$is_multi_row = 'multi-row' === $carousel_style;
		$rows         = max( 1, (int) ( $attributes['carouselRows'] ?? 2 ) );
		if ( $is_multi_row ) {
			$infinite_loop = false;
		}

		// "None" sliding effect = a slide transition with zero duration.
		if ( 'none' === ( $attributes['slidingEffect'] ?? '' ) && 'default' === $carousel_style ) {
			$carousel_speed = 0;
		}

		$grouped_effect = in_array( $effect, array( 'fade', 'cube', 'flip' ), true );
		// Multi-row grid is horizontal only.
		$is_vertical = 'vertical' === $display_style && ! $is_multi_row;

		// Partial peek applies only to the default horizontal carousel.
		$partial             = ! empty( $attributes['partialSlideView'] ) && 'default' === $carousel_style && 'horizontal' === $display_style;
		$raw_side            = $attributes['partialViewSide'] ?? 'right';
		$side                = in_array( $raw_side, array( 'left', 'right', 'both' ), true ) ? $raw_side : 'right';
		$columns             = $attributes['columns'] ?? array();
		$slide_to_scroll     = $attributes['slideToScroll'] ?? array();
		$column_gap          = $attributes['columnGap'] ?? array();
		$partial_view_offset = $attributes['partialViewOffset'] ?? array();
		// carouselDirection names the way the cards MOVE (as in WP Carousel Pro's
		// label): 'rtl' = right → left (Swiper's natural LTR flow, the default),
		// 'ltr' = left → right, laid out as a mirrored RTL Swiper. Partial-left
		// forces the RTL layout; spring/creative has no RTL support, so it stays
		// LTR and reverseDirection supplies the motion instead — as does vertical,
		// where Swiper ignores `rtl` ('ltr' = top → bottom there).
		if ( $partial ) {
			$swiper_dir = 'left' === $side ? 'rtl' : 'ltr';
		} elseif ( 'ltr' === $carousel_direction && 'creative' !== $effect && ! $is_vertical ) {
			$swiper_dir = 'rtl';
		} else {
			$swiper_dir = 'ltr';
		}
		// centeredSlides: center/coverflow styles center their slides; partial
		// view with side "both" reuses centering so the fractional peek splits
		// evenly across both edges.
		$wants_centered = 'center' === $carousel_style || 'coverflow' === $carousel_style || 'coverflow' === $effect || ( $partial && 'both' === $side );
		$centered       = ! $grouped_effect && $wants_centered;

		// Loop capacity — the minimum slide count Swiper needs before an infinite
		// loop works; the frontend runtime disables `loop` when the real rendered
		// slide count is below it (twin of useSwiperConfig.js / WP Carousel Pro).
		// Grouped effects render one slide per group, so their capacity is the
		// single-slide minimum; every other style takes the MAX across all three
		// breakpoints so the loop works on every device.
		$loop_both = $centered || ( $partial && 'left' === $side );
		// From this member count up, the runtime repeats whole member sets to reach
		// loopMinimum instead of dropping the loop (twin of padForLoop).
		$loop_pad_minimum = 0;
		if ( $grouped_effect ) {
			$loop_minimum = self::loop_minimum_slides( 1, 1, $loop_both );
		} else {
			$loop_minimum = 0;
			foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
				$loop_pad_minimum = max(
					$loop_pad_minimum,
					self::cloned_loop_minimum_slides( self::slides_per_view( $device, $columns, $partial, $partial_view_offset ) )
				);
				$loop_minimum = max(
					$loop_minimum,
					self::loop_minimum_slides(
						self::slides_per_view( $device, $columns, $partial, $partial_view_offset ),
						self::slides_per_group( $device, $slide_to_scroll ),
						$loop_both
					)
				);
			}
		}

		// Swiper grid config for the multi-row style — merged into the top-level
		// options and every breakpoint (Swiper resets grid per breakpoint).
		$grid = $is_multi_row ? array(
			'rows' => $rows,
			'fill' => 'row',
		) : null;

		$breakpoints = array(
			0    => array(
				'slidesPerView'  => self::slides_per_view( 'Mobile', $columns, $partial, $partial_view_offset ),
				'slidesPerGroup' => self::slides_per_group( 'Mobile', $slide_to_scroll ),
				'spaceBetween'   => self::space_between( 'Mobile', $column_gap ),
			),
			768  => array(
				'slidesPerView'  => self::slides_per_view( 'Tablet', $columns, $partial, $partial_view_offset ),
				'slidesPerGroup' => self::slides_per_group( 'Tablet', $slide_to_scroll ),
				'spaceBetween'   => self::space_between( 'Tablet', $column_gap ),
			),
			1024 => array(
				'slidesPerView'  => self::slides_per_view( 'Desktop', $columns, $partial, $partial_view_offset ),
				'slidesPerGroup' => self::slides_per_group( 'Desktop', $slide_to_scroll ),
				'spaceBetween'   => self::space_between( 'Desktop', $column_gap ),
			),
		);
		if ( null !== $grid ) {
			foreach ( array_keys( $breakpoints ) as $bp ) {
				$breakpoints[ $bp ]['grid'] = $grid;
			}
		}

		$config = array(
			'effect'              => $effect,
			'direction'           => $is_vertical ? 'vertical' : 'horizontal',
			'rtl'                 => ( 'rtl' === $swiper_dir ),
			'swiperDir'           => $swiper_dir,
			// Deliberate twin divergence: the editor's Swiper 12 loops by
			// shifting real slides and misrenders (gaps) when there are too few,
			// so useSwiperConfig.js duplicates the member list up to Swiper 12's
			// loop requirement (and caps the pagination bullets back to the real
			// count). The frontend's vendored Swiper 8 loops by duplicating
			// slides itself and handles low counts fine, so nothing here.
			'loop'                => $infinite_loop,
			'grabCursor'          => true,
			// Spring (creative effect): slides snap on release instead of tracking the finger.
			'followFinger'        => 'creative' !== $effect,
			'autoHeight'          => $adaptive_height && ! $is_vertical,
			'watchOverflow'       => true,
			// Whole-pixel slide widths/offsets. Fractional ones (e.g. 430.667px slides
			// under translate3d(-909.333px)) leave a faint 1px edge line beside white
			// cards on the frontend.
			'roundLengths'        => true,
			'a11y'                => array( 'scrollOnFocus' => false ),
			'centeredSlides'      => $centered,
			'watchSlidesProgress' => 'slide' !== $effect,
			'allowTouchMove'      => true,
			'simulateTouch'       => true,
			'resistance'          => true,
			'resistanceRatio'     => 0.85,
			'speed'               => (int) $carousel_speed,
			// No stopOnLastSlide (Swiper default false, like WP Carousel Pro): with
			// the loop OFF autoplay rewinds to the first slide at the end (play
			// 1→last→jump back→repeat); with the loop ON it scrolls seamlessly and
			// never jumps back. stopOnLastSlide:true would instead freeze autoplay
			// on the last slide when the loop is off.
			'autoplay'            => $slider_autoplay ? array(
				'delay'                => (int) $carousel_delay,
				'pauseOnMouseEnter'    => $pause_on_hover,
				'disableOnInteraction' => false,
				// Only an LTR layout needs reversing to move left → right; partial-left's
				// forced RTL layout keeps its long-standing left → right flow.
				'reverseDirection'     => ( 'ltr' === $carousel_direction && 'rtl' !== $swiper_dir ),
			) : false,
			'keyboard'            => $tab_key_navigation ? array(
				'enabled'        => true,
				'onlyInViewport' => true,
			) : false,
			'mousewheel'          => $mouse_wheel_control ? array(
				// forceToAxis:false so a normal vertical wheel (deltaY) drives a
				// horizontal carousel too.
				'forceToAxis'    => false,
				'sensitivity'    => 1,
				'releaseOnEdges' => false,
			) : false,
			// Fade/flip/cube show one slide at a time, so there is no free position to
			// rest at — and free mode would leave `animating` stuck (no wrapper
			// transition under virtualTranslate). The wheel and swipe step slide by slide.
			'freeMode'            => ( $free_scroll_mode && ! $grouped_effect ) ? array(
				'enabled'        => true,
				'sticky'         => false,
				'momentum'       => true,
				'momentumBounce' => true,
			) : false,
			'slidesPerView'       => self::slides_per_view( 'Desktop', $columns, $partial, $partial_view_offset ),
			'slidesPerGroup'      => self::slides_per_group( 'Desktop', $slide_to_scroll ),
			'spaceBetween'        => self::space_between( 'Desktop', $column_gap ),
			'breakpoints'         => $breakpoints,
			'navigation'          => $enable_navigation,
			'pagination'          => $enable_pagination,
			'paginationStyle'     => $pagination_style,
			// Frontend runtime gates `loop` off when the real rendered slide count
			// is below this (initCarousel in script.js).
			'loopMinimum'         => $loop_minimum,
			'loopPadMinimum'      => $loop_pad_minimum,
		);

		if ( null !== $grid ) {
			$config['grid'] = $grid;
		}

		return $config;
	}
}
