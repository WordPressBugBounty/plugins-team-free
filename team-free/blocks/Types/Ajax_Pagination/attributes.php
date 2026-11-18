<?php
/**
 * Block-specific attributes for the Ajax Pagination block.
 *
 * Merged with CommonAttributes::get() inside AbstractBlock::load_attributes().
 * Attribute names mirror testimonial-pro's ajax-pagination block; shapes use
 * this plugin's Att_Utils factories (responsive device keys are capitalized).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	// --- Settings tab ---------------------------------------------------------
	// Members fetched per ajax page (page 1 stays the grid's Query Builder limit).
	// Figma: "Show Member Per Page", default 12.
	'itemPerPage'              => Att_Utils::range_control( 12, '' ),
	'paginationType'           => Att_Utils::string( 'normal' ),
	// The Display Style dropdown writes this PAIR: 'load-more' (button that
	// appends) or 'number' (numbered pages that replace) + the number variant
	// (number | number-arrow | number-prev-next-arrow | prev-next).
	'paginationButtonType'     => Att_Utils::button_group( 'load-more' ),
	'paginationNumberType'     => Att_Utils::select_field( 'number' ),
	// Empty by default — the input shows "Load More" as a placeholder (Figma)
	// and the renderer falls back to the translated default.
	'loadMoreLabel'            => Att_Utils::string( '' ),
	'endingMessage'            => Att_Utils::string( 'No more members' ),
	'paginationPrevLabel'      => Att_Utils::string( 'Prev' ),
	'paginationNextLabel'      => Att_Utils::string( 'Next' ),
	'paginationShorten'        => Att_Utils::boolean( false ),
	// Number of page links shown on each side of the current page — beyond it
	// the runtime collapses to "…" with first/last always visible (WP
	// paginate_links mid_size, like the Twenty Twenty-Five theme pagination).
	'paginationNumberOfLinks'  => Att_Utils::range_control( 2, '' ),
	// Next/Previous buttons: 'label' | 'icon' | 'label-icon' (Figma default icon).
	'paginationNextPrevStyle'  => Att_Utils::select_field( 'icon' ),
	// Load More only: auto-load the next page when the button scrolls into view.
	'infiniteScroll'           => Att_Utils::boolean( false ),
	// Gap between the number/prev/next buttons — responsive (Figma device icon).
	'paginationNumberGap'      => Att_Utils::single_responsive( 4, '', '', 'px' ),
	// Responsive (Figma: device icon on the Alignment control); left default.
	// Tablet/Mobile inherit Desktop until set (dynamic CSS emits per device).
	'paginationAlignment'      => Att_Utils::single_responsive( 'center', '', '', '' ),

	// --- Style tab (item chips; hover shares the numbered `.is-current`) ------
	// Mirrors the Read More Style tab shape (Figma): typography, Normal/Hover
	// color + Background Type (color/gradient), border, box shadow, radius,
	// padding, margin. Background colors are empty by default so the SCSS
	// defaults (brand #2B5F47 hover/active fill) show through until customized.
	'paginationTypography'     => Att_Utils::typography(),
	'paginationFontSize'       => Att_Utils::single_responsive( 14, '', '', 'px' ),
	'paginationLineHeight'     => Att_Utils::single_responsive( '', '', '', '' ),
	'paginationLetterSpacing'  => Att_Utils::range_control( '', 'px' ),
	'paginationWordSpacing'    => Att_Utils::range_control( '', 'px' ),
	'paginationGlobalTypo'     => Att_Utils::object(),
	'paginationColor'          => Att_Utils::string( '' ),
	'paginationColorHover'     => Att_Utils::string( '#ffffff' ),
	'paginationBg'             => Att_Utils::background( 'bgColor', '' ),
	'paginationBorder'         => Att_Utils::border( 'solid', '#3D3D3D', '#2B5F47' ),
	'paginationBorderWidth'    => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'paginationBoxShadow'      => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'paginationBoxShadowHover' => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	// Empty (not values) so the static SCSS defaults apply (item 4px radius +
	// 10px 20px padding, wrapper margin-top 32px) — dynamic CSS emits only
	// when customized.
	'paginationBorderRadius'   => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'paginationPadding'        => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	'paginationMargin'         => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Misc -------------------------------------------------------------------
	'isPreview'                => Att_Utils::boolean( false ),
	'align'                    => Att_Utils::string( '' ),
);
