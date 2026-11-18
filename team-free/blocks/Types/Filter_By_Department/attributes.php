<?php
/**
 * Block-specific attributes for the Filter by Department block.
 *
 * Merged with CommonAttributes::get() inside AbstractBlock::load_attributes().
 * Attribute names mirror testimonial-pro's filter-by-group child attributes
 * (generic `showTerms*` names so the future Location / Designation / Gender
 * filter blocks share the exact same schema); shapes use this plugin's
 * Att_Utils factories and follow the ajax-member-search Style-tab conventions
 * (color/colorHover strings, empty box defaults so the SCSS look holds).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	// --- Settings tab ---------------------------------------------------------
	// Dropdown (select) or button-group display.
	'displayStyle'        => Att_Utils::select_field( 'select' ),
	// Pro-only — registered so a Pro-saved block re-saved in Free keeps the value (unregistered attrs are dropped).
	'dropdownBreakpoint'  => Att_Utils::select_field( 'mobile' ),
	// Which terms show: all | include (Specific) | exclude, with the showTerms
	// selection.
	'showTermsType'       => Att_Utils::select_field( 'all' ),
	// react-select multi value: [{ value: term_id, label }] — include/exclude set.
	'showTerms'           => Att_Utils::array_field(),
	// Empty default (Figma) — placeholder + render fallback "All Department".
	'allButtonLabel'      => Att_Utils::string( '' ),
	// Dropdown display only — the chevron icon size (15px default).
	'dropdownIconSize'    => Att_Utils::single_responsive( 15, '', '', 'px' ),
	// Button display only — row or stacked buttons + the gap between them.
	'buttonOrientation'   => Att_Utils::button_group( 'horizontal' ),
	// Button width behavior (Figma): fit content | grow to fill the row | fixed.
	'buttonWidthType'     => Att_Utils::button_group( 'fit' ),
	'buttonFixedWidth'    => Att_Utils::single_responsive( 100, '', '', 'px' ),
	'buttonsGap'          => Att_Utils::single_responsive( 8, '', '', 'px' ),
	// Leading label (Figma: off by default).
	'showLabel'           => Att_Utils::boolean( false ),
	'labelText'           => Att_Utils::string( 'Filter by Department' ),
	'labelGap'            => Att_Utils::single_responsive( 12, '', '', 'px' ),
	// Filter width — empty = auto (the dropdown stretches to fill when set).
	'filterWidth'         => Att_Utils::single_responsive( '', '', '', 'px' ),

	// --- Style tab — label ------------------------------------------------------
	'labelTypography'     => Att_Utils::typography(),
	'labelFontSize'       => Att_Utils::single_responsive( 14, '', '', 'px' ),
	'labelLineHeight'     => Att_Utils::single_responsive( '', '', '', '' ),
	'labelLetterSpacing'  => Att_Utils::range_control( '', 'px' ),
	'labelWordSpacing'    => Att_Utils::range_control( '', 'px' ),
	'labelGlobalTypo'     => Att_Utils::object(),
	'labelColor'          => Att_Utils::string( '' ),

	// --- Style tab — the filter control (dropdown / buttons) --------------------
	'filterTypography'    => Att_Utils::typography(),
	'filterFontSize'      => Att_Utils::single_responsive( 14, '', '', 'px' ),
	'filterLineHeight'    => Att_Utils::single_responsive( '', '', '', '' ),
	'filterLetterSpacing' => Att_Utils::range_control( '', 'px' ),
	'filterWordSpacing'   => Att_Utils::range_control( '', 'px' ),
	'filterGlobalTypo'    => Att_Utils::object(),
	// Empty color/background defaults so the SCSS look (white field, brand
	// active button) shows through until customized. Hover shares the active
	// (aria-pressed) button state via :is() in the dynamic CSS.
	'filterColor'         => Att_Utils::string( '' ),
	'filterColorHover'    => Att_Utils::string( '' ),
	'filterBg'            => Att_Utils::background( 'bgColor', '' ),
	'filterBorder'        => Att_Utils::border( 'solid', '#DDDDDD', '#2B5F47' ),
	'filterBorderWidth'   => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'filterBoxShadow'     => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	// Empty (not values) so the static SCSS defaults apply (4px radius, 10px
	// 12px select / 8px 20px button padding) — dynamic CSS emits only when
	// customized.
	'filterBorderRadius'  => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'filterPadding'       => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Misc -------------------------------------------------------------------
	'isPreview'           => Att_Utils::boolean( false ),
);
