<?php
/**
 * Block-specific attributes for the Carousel block.
 *
 * The card/feature schema is the shared member-card set
 * (blocks/Attributes/member-card-attributes.php); this file adds only the
 * carousel-layout attributes (port of testimonial-pro's layouts + nav +
 * pagination groups, adapted to the Figma panel). Merged with
 * CommonAttributes::get() inside AbstractBlock::load_attributes().
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array_merge(
	require dirname( __DIR__, 2 ) . '/Attributes/member-card-attributes.php',
	array(
		// --- Display Settings → Settings tab ------------------------------------
		// Select Carousel Style: default | center | coverflow.
		'carouselStyle'              => Att_Utils::select_field( 'default' ),
		// Slide Effect: none | slide | fade | spring | flip | cube | ken-burns |
		// coverflow (default style only; center locks slide, coverflow locks
		// coverflow — resolved by SwiperConfig).
		'slidingEffect'              => Att_Utils::select_field( 'slide' ),
		// Display Direction: horizontal | vertical.
		'carouselDisplayStyle'       => Att_Utils::button_group( 'horizontal' ),
		// Partial Slide View — fractional peek of the next slide (default
		// horizontal style only).
		'partialSlideView'           => Att_Utils::boolean( false ),
		'partialViewSide'            => Att_Utils::button_group( 'right' ),
		'partialViewOffset'          => Att_Utils::single_responsive( 0.3, '', '', '' ),
		// Gap Between Items → Swiper spaceBetween (responsive).
		'columnGap'                  => Att_Utils::single_responsive( 24, 16, 12, 'px' ),
		// Slide to Scroll → slidesPerGroup (responsive).
		'slideToScroll'              => Att_Utils::single_responsive( 1, 1, 1, '' ),
		// Number of Rows → Swiper grid.rows (multi-row style only). Grid can't
		// coexist with loop/effects/vertical, so the multi-row style forces those
		// off (resolved in SwiperConfig / useSwiperConfig).
		'carouselRows'               => Att_Utils::number( 2 ),

		// --- Display Settings → Carousel tab ------------------------------------
		'sliderAutoPlay'             => Att_Utils::boolean( false ),
		'carouselAutoplayDelay'      => Att_Utils::range_control( 3000, 'ms' ),
		'carouselSpeed'              => Att_Utils::range_control( 600, 'ms' ),
		// Pro-only — registered so a Pro-saved block re-saved in Free keeps the value (unregistered attrs are dropped).
		'tickerSpeed'                => Att_Utils::range_control( '', 'ms' ),
		// Carousel Direction (autoplay only) — the way the cards move: rtl | ltr.
		'carouselDirection'          => Att_Utils::button_group( 'rtl' ),
		'pauseOnHover'               => Att_Utils::boolean( true ),
		'infiniteLoop'               => Att_Utils::boolean( true ),
		'adaptiveHeight'             => Att_Utils::boolean( false ),
		'tabAndKeyNavigation'        => Att_Utils::boolean( true ),
		'mouseWheelControl'          => Att_Utils::boolean( false ),
		'freeScrollMode'             => Att_Utils::boolean( false ),

		// --- Navigation Arrow ----------------------------------------------------
		'enableNavigationArrow'      => Att_Utils::boolean( true ),
		'navIconName'                => Att_Utils::select_field( 'chevron-outline' ),
		// vertical_center | top_left | top_right | top_center | bottom_left |
		// bottom_right | bottom_center.
		'navIconPosition'            => Att_Utils::select_field( 'vertical_center' ),
		'navIconVisibleOnHover'      => Att_Utils::boolean( false ),
		'navIconSize'                => Att_Utils::single_responsive( 16, 16, 16, 'px' ),
		'navIconGap'                 => Att_Utils::single_responsive( 10, 10, 10, 'px' ),
		// Horizontal/vertical offsets of the arrow row (vertical_center splits
		// the offset across both edges).
		'navOffsetX'                 => Att_Utils::single_responsive( -22, '', '', 'px' ),
		'navOffsetY'                 => Att_Utils::single_responsive( 50, '', '', '%' ),
		// Arrow colors — a white button with a dark glyph at rest, inverting to a
		// white glyph on the brand primary (#2B5F47) fill on hover, like every
		// ShapedPlugin block plugin (the twin of testimonial-pro's
		// `navIconColors` / `navIconBackground` defaults). They are REAL attribute
		// defaults, not a SCSS look: these are stateful controls, so a value the
		// control cannot show would both contradict what is painted and be
		// impossible to override with "none" (see the Member Resume note in
		// CLAUDE.md). style.scss therefore carries no nav background/color.
		'navIconColor'               => Att_Utils::string( '#1E1E1E' ),
		'navIconColorHover'          => Att_Utils::string( '#FFFFFF' ),
		'navIconBgColor'             => Att_Utils::string( '#FFFFFF' ),
		'navIconBgColorHover'        => Att_Utils::string( '#2B5F47' ),
		'navIconBorder'              => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
		'navIconBorderWidth'         => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
		// Pro-only — registered so a Pro-saved block re-saved in Free keeps the value (unregistered attrs are dropped).
		'navIconBorderHover'         => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
		'navIconBorderWidthHover'    => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
		'navIconBorderRadius'        => Att_Utils::spacing( 50, 50, 50, 50, '%', true ),
		// The arrow ships WITH a shadow — the white button needs it to read as a
		// button over a photo. Preset 2 of the Shadow Type picker (`light-2dp`,
		// 0 2px 4px rgba(0,0,0,.14)); `selectDefault` holds the CSS variable, which
		// both CSS twins return verbatim and the control check-marks. Hover has no
		// shadow of its own — the normal one keeps painting (nothing in the hover
		// rule overrides it) unless the user enables one here.
		'navIconBoxShadow'           => Att_Utils::box_shadow( true, 0, 0, 0, 0, '#4E4F521A', 'Outset', 'var(--sp-smart-team-shadow-light-2dp)' ),
		'navIconBoxShadowHover'      => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
		'navIconPadding'             => Att_Utils::responsive_spacing( 12, 12, 12, 12, 'px', true ),

		// --- Pagination Dots ------------------------------------------------------
		'enablePaginationDots'       => Att_Utils::boolean( true ),
		// dots | dynamic | strokes | number | fraction | scrollbar.
		'paginationStyle'            => Att_Utils::select_field( 'dots' ),
		'paginationDotsWidth'        => Att_Utils::single_responsive( 12, 12, 12, 'px' ),
		'paginationDotsHeight'       => Att_Utils::single_responsive( 12, 12, 12, 'px' ),
		// Strokes style: the active bullet stretches to this width.
		'activePaginationDotsWidth'  => Att_Utils::single_responsive( 50, 50, 50, 'px' ),
		// Scrollbar style: the track (and its drag) thickness.
		'paginationScrollbarHeight'  => Att_Utils::single_responsive( 6, 6, 6, 'px' ),
		'paginationDotsSpaceBetween' => Att_Utils::single_responsive( 8, 8, 8, 'px' ),
		'paginationDotsColor'        => Att_Utils::string( '#D9EAE0' ),
		'paginationDotsActiveColor'  => Att_Utils::string( '#2B5F47' ),
		'paginationDotsMargin'       => Att_Utils::responsive_spacing( 24, 0, 0, 0, 'px', false ),
		// left | center | right (justify-content of the pagination row).
		'paginationDotsPosition'     => Att_Utils::button_group( 'center' ),
		// Number/fraction styles typography.
		'paginationTypography'       => Att_Utils::typography(),
		'paginationFontSize'         => Att_Utils::single_responsive( '', '', '', 'px' ),
		'paginationLineHeight'       => Att_Utils::single_responsive( '', '', '', '' ),
		'paginationLetterSpacing'    => Att_Utils::range_control( '', 'px' ),
		'paginationWordSpacing'      => Att_Utils::range_control( '', 'px' ),
		'paginationGlobalTypo'       => Att_Utils::object(),

		// --- Motion Effects (Pro) ----------------------------------------------
		// Registered so a block Pro saved keeps its value byte for byte; Free
		// has no control or render code for it (Rule 8) — the inspector shows
		// a Pro Features teaser in the Motion Effects panel instead.
		'entranceAnimation'          => array(
			'type'    => 'object',
			'default' => array(
				'type'        => 'none',
				'trigger'     => 'entrance',
				'duration'    => 700,
				'delay'       => 0,
				'scrollStart' => 0,
				'scrollEnd'   => 50,
			),
		),
		'motionDevices'              => array(
			'type'    => 'array',
			'default' => array( 'Desktop', 'Tablet', 'Mobile' ),
		),
	)
);
