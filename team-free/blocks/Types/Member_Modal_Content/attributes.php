<?php
/**
 * Block-specific attributes for the Member Modal Content block.
 *
 * The modal SHELL's own settings — how the popup presents itself (display
 * style, animation, size), how it closes, and how it looks. The member's data
 * comes from the field blocks placed INSIDE it, each carrying its own schema.
 *
 * Merged with CommonAttributes::get() inside AbstractBlock::load_attributes().
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	'isPreview'                      => Att_Utils::boolean( false ),

	// -- Settings --------------------------------------------------------
	// popup = centered sheet · slide-in = panel sliding in from a side.
	'displayStyle'                   => Att_Utils::button_group( 'popup' ),
	// Popup only — the slide-in style animates by sliding.
	'popupAnimation'                 => Att_Utils::select_field( 'zoom-out' ),
	// Slide-in only — which edge the panel enters from.
	'slideInPosition'                => Att_Utils::select_field( 'right' ),
	'modalWidth'                     => Att_Utils::single_responsive( 900, '', '', 'px' ),
	'modalMaxHeight'                 => Att_Utils::single_responsive( '', '', '', 'px' ),
	'closeOnClickOutside'            => Att_Utils::boolean( true ),
	'showCloseIcon'                  => Att_Utils::boolean( true ),
	'closeIconSize'                  => Att_Utils::single_responsive( 24, '', '', 'px' ),
	// inside-left | inside-right | outside-left | outside-right.
	'closeIconPosition'              => Att_Utils::select_field( 'inside-right' ),
	'closeIconOffset'                => Att_Utils::single_responsive( 18, '', '', 'px' ),
	// Prev/next arrows stepping through the members of the block that opened it.
	// The arrow glyph + the 7 placements are the Carousel block's set, reused
	// wholesale (Carousel::nav_arrow_svg() ↔ NAV_ARROW_ICONS) so there is one
	// source of arrow geometry. Unlike the carousel this has ONE Offset, applied
	// to whichever edges the placement uses.
	'showNavigation'                 => Att_Utils::boolean( false ),
	'navigationStyle'                => Att_Utils::select_field( 'chevron-outline' ),
	'navigationIconSize'             => Att_Utils::single_responsive( 24, '', '', 'px' ),
	// vertical_center | top_left | top_center | top_right
	// | bottom_left | bottom_center | bottom_right.
	'navigationPosition'             => Att_Utils::select_field( 'vertical_center' ),
	'navigationOffset'               => Att_Utils::single_responsive( 24, '', '', 'px' ),

	// -- Style: the dialog box, its backdrop and the close icon. Empty defaults
	// everywhere except the white sheet — style.scss carries the stateless
	// look (radius, padding, backdrop tint) until customized. -------------
	'modalBg'                        => Att_Utils::background( 'bgColor', '#FFFFFF' ),
	'modalBorder'                    => Att_Utils::border( 'none' ),
	'modalBorderWidth'               => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'modalRadius'                    => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'modalBoxShadow'                 => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'modalPadding'                   => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// The scrim. The element always renders (it is the click-outside target);
	// the toggle only decides whether it is PAINTED, so Close when Click Outside
	// keeps working with the overlay off.
	'showBackgroundOverlay'          => Att_Utils::boolean( true ),
	'overlayColor'                   => Att_Utils::string( '' ),

	// Close Button Style popover.
	'closeIconColor'                 => Att_Utils::string( '' ),
	'closeIconColorHover'            => Att_Utils::string( '' ),
	'closeIconBg'                    => Att_Utils::background( 'transparent', '', 'linear-gradient(135deg,rgba(179,50,95,0.44) 0%,rgba(227,86,43,0.45) 100%)', '' ),
	'closeIconBorder'                => Att_Utils::border( 'none' ),
	'closeIconBorderWidth'           => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'closeIconBorderHover'           => Att_Utils::border( 'none' ),
	'closeIconBorderWidthHover'      => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'closeIconRadius'                => Att_Utils::spacing( '', '', '', '', 'px', true ),
	// Empty: style.scss keeps the ✕ a bare glyph (padding 0) until customized.
	'closeIconPadding'               => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// Navigation Button Style popover. Empty defaults so style.scss's white
	// circle / brand-green hover holds until customized.
	'navigationIconColor'            => Att_Utils::string( '' ),
	'navigationIconColorHover'       => Att_Utils::string( '' ),
	'navigationIconBg'               => Att_Utils::background( 'transparent', '', 'linear-gradient(135deg,rgba(179,50,95,0.44) 0%,rgba(227,86,43,0.45) 100%)', '' ),
	'navigationIconBorder'           => Att_Utils::border( 'none' ),
	'navigationIconBorderWidth'      => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'navigationIconBorderHover'      => Att_Utils::border( 'none' ),
	'navigationIconBorderWidthHover' => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'navigationIconRadius'           => Att_Utils::spacing( '', '', '', '', 'px', true ),
	// Empty: style.scss's 8px padding + 40px minimum holds until customized —
	// and because the button is sized by min-width/min-height (not a fixed
	// width), a larger padding actually grows it.
	'navigationIconPadding'          => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
);
