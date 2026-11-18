<?php
/**
 * Block-specific attributes for the Social Profile block.
 *
 * Reuses the shared member-card **social** schema (identical keys to
 * blocks/Attributes/member-card-attributes.php) so the shared `SocialProfiles`
 * inspector panel and the social dynamic-CSS rules work unchanged. Merged with
 * CommonAttributes::get() inside AbstractBlock::load_attributes().
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	// Which member to render. 0 = auto: the current member (resolved from the
	// queried post or a Single Member wrapper's context at render time).
	'memberId'               => Att_Utils::number( 0 ),

	// --- Settings tab ------------------------------------------------------
	'socialIconStyle'        => Att_Utils::select_field( 'style-3' ),
	// Position/Offset only surface for the card-6/card-8 flyout in the shared
	// panel — kept here so that panel's controls never reference an undefined
	// attribute.
	'socialIconPosition'     => Att_Utils::select_field( 'bottom-right' ),
	'socialIconOffset'       => Att_Utils::single_responsive( 20, 20, 20, 'px' ),
	'socialIconSize'         => Att_Utils::single_responsive( 24, 24, 24, 'px' ),
	'socialIconAreaSize'     => Att_Utils::single_responsive( 38, 38, 38, 'px' ),
	'socialItemGap'          => Att_Utils::single_responsive( 8, 8, 8, 'px' ),
	// Responsive Alignment → `justify-content` on the icon list. Standalone-block
	// only: inside a card the row follows the card's Content Alignment instead,
	// so the shared panel hides this control unless showAlignment is passed.
	// `center` matches the block SCSS default, so the control opens in sync.
	'socialAlignment'        => Att_Utils::single_responsive( 'center', '', '', '' ),

	// --- Style tab (Custom Styling is Pro: kept registered, never rendered) -
	'socialCustomStyling'    => Att_Utils::boolean( true ),
	'socialIconColor'        => Att_Utils::string( '' ),
	'socialIconColorHover'   => Att_Utils::string( '' ),
	'socialBgColor'          => Att_Utils::string( '' ),
	'socialBgColorHover'     => Att_Utils::string( '' ),
	'socialBorder'           => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'socialBorderHover'      => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'socialBorderWidth'      => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'socialBorderWidthHover' => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'socialBoxShadow'        => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'socialBoxShadowHover'   => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'socialBorderRadius'     => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'socialMargin'           => Att_Utils::responsive_spacing( 0, 0, 0, 0, 'px', true ),

	// --- Misc --------------------------------------------------------------
	'isPreview'              => Att_Utils::boolean( false ),
	'align'                  => Att_Utils::string( '' ),
);
