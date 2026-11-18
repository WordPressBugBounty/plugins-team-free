<?php
/**
 * Block-specific attributes for the Ajax Member Search block.
 *
 * Merged with CommonAttributes::get() inside AbstractBlock::load_attributes().
 * Attribute names mirror testimonial-pro's ajax-testimonial-search block;
 * shapes use this plugin's Att_Utils factories (responsive device keys are
 * capitalized) and follow the ajax-pagination Style-tab conventions
 * (color/colorHover strings, empty box defaults so the SCSS look holds).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	// --- Search (Settings tab) ----------------------------------------------
	// Where the button sits: inside the input box | outside it | hidden (no
	// button — typing searches live with a debounce).
	'searchBtnDisplayStyle'   => Att_Utils::select_field( 'inside' ),
	'searchPlaceholder'       => Att_Utils::string( 'Search...' ),
	// Input row width — responsive (Figma: 600px; the SCSS max-width: 100%
	// keeps it inside the viewport on small screens).
	'searchInputWidth'        => Att_Utils::single_responsive( 600, '', '', 'px' ),
	// Input-to-button gap, applies to the outside display style only.
	'searchGapWithButton'     => Att_Utils::single_responsive( 8, '', '', 'px' ),
	// Responsive → justify-content via dynamic CSS (like paginationAlignment);
	// Figma default left.
	'searchAlignment'         => Att_Utils::single_responsive( 'center', '', '', '' ),
	// Shown inside the grid when a search matches no members (rides on the
	// data-no-results attribute; the runtime injects it on empty results).
	'noResultsMessage'        => Att_Utils::string( 'No Member Found' ),

	// --- Search (Style tab — the input, or the whole box when inside) --------
	'searchTypography'        => Att_Utils::typography(),
	'searchFontSize'          => Att_Utils::single_responsive( 14, '', '', 'px' ),
	'searchLineHeight'        => Att_Utils::single_responsive( '', '', '', '' ),
	'searchLetterSpacing'     => Att_Utils::range_control( '', 'px' ),
	'searchWordSpacing'       => Att_Utils::range_control( '', 'px' ),
	'searchGlobalTypo'        => Att_Utils::object(),
	'searchColor'             => Att_Utils::string( '' ),
	'searchColorHover'        => Att_Utils::string( '' ),
	'searchBg'                => Att_Utils::background( 'bgColor', '' ),
	'searchBorder'            => Att_Utils::border( 'solid', '#DDDDDD', '#2B5F47' ),
	'searchBorderWidth'       => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'searchBoxShadow'         => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'searchBoxShadowHover'    => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	// Empty (not values) so the static SCSS defaults apply (4px radius; inside
	// box 4px padding + 16px text inset, outside input 10px 16px; wrapper
	// margin-bottom 24px) — dynamic CSS emits only when customized.
	'searchBorderRadius'      => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'searchPadding'           => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	'searchMargin'            => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Search Button (Settings tab) -----------------------------------------
	// Empty label + icon on = an icon-only button (testimonial-pro behavior).
	'searchBtnText'           => Att_Utils::string( 'Search' ),
	'searchBtnPosition'       => Att_Utils::button_group( 'right' ),
	'showSearchBtnIcon'       => Att_Utils::boolean( true ),
	// Font Awesome class from SPIconPicker (sp_team_fontawesome ships with the
	// grid, so the glyph resolves in editor + frontend).
	'searchBtnIcon'           => Att_Utils::string( 'fa fa-search' ),
	'searchBtnIconSize'       => Att_Utils::single_responsive( 16, '', '', 'px' ),
	'searchBtnIconPosition'   => Att_Utils::select_field( 'right' ),
	// Figma: Icon to Label Gap default 10.
	'iconToLabelGap'          => Att_Utils::single_responsive( 10, '', '', 'px' ),

	// --- Search Button (Style tab) ---------------------------------------------
	// Empty color/background defaults so the SCSS brand look (#2B5F47 fill,
	// white text) shows through until customized.
	'searchBtnTypography'     => Att_Utils::typography(),
	'searchBtnFontSize'       => Att_Utils::single_responsive( 14, '', '', 'px' ),
	'searchBtnLineHeight'     => Att_Utils::single_responsive( '', '', '', '' ),
	'searchBtnLetterSpacing'  => Att_Utils::range_control( '', 'px' ),
	'searchBtnWordSpacing'    => Att_Utils::range_control( '', 'px' ),
	'searchBtnGlobalTypo'     => Att_Utils::object(),
	'searchBtnColor'          => Att_Utils::string( '' ),
	'searchBtnColorHover'     => Att_Utils::string( '' ),
	'searchBtnBg'             => Att_Utils::background( 'bgColor', '' ),
	'searchBtnBorder'         => Att_Utils::border( 'none', '', '' ),
	'searchBtnBorderWidth'    => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'searchBtnBoxShadow'      => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'searchBtnBoxShadowHover' => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	// Empty — the static SCSS button look (4px radius, 10px 20px padding) holds.
	'searchBtnBorderRadius'   => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'searchBtnPadding'        => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Misc -------------------------------------------------------------------
	'isPreview'               => Att_Utils::boolean( false ),
	'align'                   => Att_Utils::string( '' ),
);
