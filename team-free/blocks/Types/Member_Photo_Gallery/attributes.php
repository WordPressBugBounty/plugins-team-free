<?php
/**
 * Block-specific attributes for the Member Photo Gallery block.
 *
 * The carousel keys (`columns`, `columnGap`, `carouselSpeed`,
 * `carouselDirection`, `sliderAutoPlay`, `infiniteLoop`,
 * `enableNavigationArrow`, `enablePaginationDots`) keep the Carousel block's
 * names so `Includes\SwiperConfig` / `useSwiperConfig` read them unchanged;
 * everything SwiperConfig needs beyond this small set is pinned in
 * Member_Photo_Gallery::swiper_attributes(). Merged with CommonAttributes::get()
 * inside AbstractBlock::load_attributes(). Responsive device keys are
 * capitalized (Desktop/Tablet/Mobile).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	// Which member to render. 0 = auto: the current member (resolved from the
	// queried post or a Single Member wrapper's context at render time).
	'memberId'                   => Att_Utils::number( 0 ),

	// --- Settings tab ---------------------------------------------------------
	// grid | carousel — picks the layout and gates the carousel-only controls.
	'displayStyle'               => Att_Utils::button_group( 'grid' ),
	// Grid track count AND the carousel's slidesPerView, per device.
	'columns'                    => Att_Utils::single_responsive( 3, 2, 1, '' ),
	'imageResolution'            => Att_Utils::select_field( 'full' ),
	// original | 1-1 | 4-3 | 3-4 | 3-2 | 2-3 | 16-9 | 9-16.
	'imageAspectRatio'           => Att_Utils::select_field( 'original' ),
	// object-fit cover (on) vs contain (off). ON by default so photos of mixed
	// orientations fill their uniform boxes and all render the same height;
	// turning it off letterboxes them instead (nothing cropped, but a wide photo
	// then shows shorter than a tall one).
	'cropImagesToFit'            => Att_Utils::boolean( true ),
	// Lead the gallery with the member's featured photo.
	'showMemberImage'            => Att_Utils::boolean( false ),
	'imageLazyLoad'              => Att_Utils::boolean( false ),
	'imageRetina'                => Att_Utils::boolean( false ),
	// Grid gap AND the carousel's spaceBetween, per device.
	'columnGap'                  => Att_Utils::single_responsive( 20, 20, 20, 'px' ),
	// Carousel-only; the controls are disabled while Display Style is Grid.
	// Turning either on reveals its own inspector panel below.
	'enableNavigationArrow'      => Att_Utils::boolean( false ),
	'enablePaginationDots'       => Att_Utils::boolean( false ),

	// --- Navigation Arrow panel -----------------------------------------------
	// Same keys as the Carousel block, so its NavigationArrowPanel and the
	// shared Styles\Carousel_Chrome rules work here unchanged.
	'navIconName'                => Att_Utils::select_field( 'chevron-outline' ),
	// vertical_center | top_left | top_right | top_center | bottom_left |
	// bottom_right | bottom_center.
	'navIconPosition'            => Att_Utils::select_field( 'vertical_center' ),
	'navIconVisibleOnHover'      => Att_Utils::boolean( false ),
	'navIconSize'                => Att_Utils::single_responsive( 16, 16, 16, 'px' ),
	'navIconGap'                 => Att_Utils::single_responsive( 10, 10, 10, 'px' ),
	// -22px straddles the carousel edge: half the 40px button hangs outside.
	'navOffsetX'                 => Att_Utils::single_responsive( -22, '', '', 'px' ),
	'navOffsetY'                 => Att_Utils::single_responsive( 50, '', '', '%' ),
	// Same arrow colors as the Carousel block (see the note there): white button +
	// dark glyph at rest, white glyph on the brand #2B5F47 fill on hover. This
	// block shares the carousel's chrome CSS, so the two must not drift.
	'navIconColor'               => Att_Utils::string( '#1E1E1E' ),
	'navIconColorHover'          => Att_Utils::string( '#FFFFFF' ),
	'navIconBgColor'             => Att_Utils::string( '#FFFFFF' ),
	'navIconBgColorHover'        => Att_Utils::string( '#2B5F47' ),
	'navIconBorder'              => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'navIconBorderWidth'         => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'navIconBorderRadius'        => Att_Utils::spacing( 50, 50, 50, 50, '%', true ),
	// Shadow on by default, preset 2 (`light-2dp`) — same as the Carousel block's
	// arrows, whose chrome CSS this block shares (see the note there).
	'navIconBoxShadow'           => Att_Utils::box_shadow( true, 0, 0, 0, 0, '#4E4F521A', 'Outset', 'var(--sp-smart-team-shadow-light-2dp)' ),
	'navIconBoxShadowHover'      => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'navIconPadding'             => Att_Utils::responsive_spacing( 12, 12, 12, 12, 'px', true ),

	// --- Pagination Dots panel ------------------------------------------------
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
	// 12px (not the Carousel block's 24px) — a bare photo strip wants the dots
	// closer than a card carousel does. Tunable in the panel.
	'paginationDotsMargin'       => Att_Utils::responsive_spacing( 12, 0, 0, 0, 'px', false ),
	// left | center | right (justify-content of the pagination row).
	'paginationDotsPosition'     => Att_Utils::button_group( 'center' ),
	// Number/fraction styles typography.
	'paginationTypography'       => Att_Utils::typography(),
	'paginationFontSize'         => Att_Utils::single_responsive( '', '', '', 'px' ),
	'paginationLineHeight'       => Att_Utils::single_responsive( '', '', '', '' ),
	'paginationLetterSpacing'    => Att_Utils::range_control( '', 'px' ),
	'paginationWordSpacing'      => Att_Utils::range_control( '', 'px' ),
	'paginationGlobalTypo'       => Att_Utils::object(),

	// --- Style tab (each gallery item — the photo box) ------------------------
	// Empty defaults so the bare-photo look holds until customized.
	'itemBg'                     => Att_Utils::background( 'bgColor', '' ),
	'itemBorder'                 => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'itemBorderWidth'            => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'itemBorderRadius'           => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'itemBoxShadow'              => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'itemPadding'                => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	'itemMargin'                 => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Carousel Settings panel (carousel display style only) ----------------
	'carouselSpeed'              => Att_Utils::range_control( 600, 'ms' ),
	// Responsive slidesPerGroup, same shape and control as the Carousel block.
	'slideToScroll'              => Att_Utils::single_responsive( 1, 1, 1, '' ),
	'carouselDirection'          => Att_Utils::button_group( 'rtl' ),
	'sliderAutoPlay'             => Att_Utils::boolean( false ),
	'infiniteLoop'               => Att_Utils::boolean( false ),

	// --- Misc -----------------------------------------------------------------
	'isPreview'                  => Att_Utils::boolean( false ),
	'align'                      => Att_Utils::string( '' ),
);
