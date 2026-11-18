<?php
/**
 * Block-specific attributes for the Member Video block.
 *
 * Merged with CommonAttributes::get() inside AbstractBlock::load_attributes().
 * Responsive device keys are capitalized (Desktop/Tablet/Mobile).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	// Which member to render. 0 = auto: the current member (resolved from the
	// queried post or a Single Member wrapper's context at render time).
	'memberId'                 => Att_Utils::number( 0 ),

	// --- Settings tab ---------------------------------------------------------
	// default = poster + play button; button = the play button on its own.
	'videoDisplayStyle'        => Att_Utils::button_group( 'default' ),
	// One of the built-in glyphs in Member_Video::play_icon_svg().
	'playIconName'             => Att_Utils::select_field( 'play-solid' ),
	'playIconSize'             => Att_Utils::single_responsive( 24, 24, 24, 'px' ),
	// top-left … bottom-right | center — where the button sits over the poster
	// (default style). Per style on purpose: the absolute button keeps its own
	// placement below, so switching Display Style can't carry one over to the
	// other (a middle-right absolute button used to re-place the poster button).
	'playButtonPosition'       => Att_Utils::select_field( 'center' ),
	// Default style: one offset from the chosen edge(s).
	'playButtonOffset'         => Att_Utils::single_responsive( 12, 12, 12, 'px' ),

	// Default style only — how the video opens.
	'videoPlayMode'            => Att_Utils::button_group( 'popup' ),
	'videoAutoplay'            => Att_Utils::boolean( false ),
	'videoLoop'                => Att_Utils::boolean( false ),
	'videoMuted'               => Att_Utils::boolean( false ),

	// Button style only — default (in the flow) or absolute (pinned).
	'buttonDisplayPosition'    => Att_Utils::button_group( 'default' ),
	// Where an absolutely placed button sits over the preceding content — the
	// button style's own copy of playButtonPosition (same 9 slugs).
	'buttonAbsolutePosition'   => Att_Utils::select_field( 'center' ),
	// ONE offset from the placement's edge(s), like the default style's
	// playButtonOffset above — per style so switching Display Style can't carry
	// one over. It replaced a separate Offset X / Offset Y pair.
	'buttonOffset'             => Att_Utils::single_responsive( 0, 0, 0, 'px' ),

	// --- Style tab (the play button, per Normal/Hover state) ------------------
	'playIconColor'            => Att_Utils::string( '#ffffff' ),
	'playIconColorHover'       => Att_Utils::string( '' ),
	'playIconBg'               => Att_Utils::background( 'bgColor', '#2B5F47' ),
	'playIconBgHover'          => Att_Utils::background( 'bgColor', '' ),
	'playIconBorder'           => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'playIconBorderHover'      => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'playIconBorderWidth'      => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'playIconBorderWidthHover' => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'playIconBoxShadow'        => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'playIconBoxShadowHover'   => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	// 50% keeps the round button the Figma shows; padding sizes the hit area.
	'playIconBorderRadius'     => Att_Utils::spacing( 50, 50, 50, 50, '%', true ),
	'playIconPadding'          => Att_Utils::responsive_spacing( 16, 16, 16, 16, 'px', true ),

	// Poster scrim (default style), per Normal/Hover state.
	'thumbOverlay'             => Att_Utils::background( 'bgColor', '' ),
	'thumbOverlayHover'        => Att_Utils::background( 'bgColor', '' ),

	// --- Misc -----------------------------------------------------------------
	'isPreview'                => Att_Utils::boolean( false ),
	'align'                    => Att_Utils::string( '' ),
);
