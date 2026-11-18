<?php
/**
 * Block-specific attributes for the Member Skills block.
 *
 * Reuses the shared member-card **skill** schema (identical keys to
 * blocks/Attributes/member-card-attributes.php) so the shared `Skills`
 * inspector panel and the skill dynamic-CSS rules work unchanged. Merged with
 * CommonAttributes::get() inside AbstractBlock::load_attributes().
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	// Which member to render. 0 = auto: the current member (resolved from the
	// queried post or a Single Member wrapper's context at render time).
	'memberId'                 => Att_Utils::number( 0 ),

	// --- Skills: Settings tab ----------------------------------------------
	'skillsDisplayStyle'       => Att_Utils::button_group( 'progress' ),
	'skillsProgressBarStyle'   => Att_Utils::select_field( 'style-2' ),
	'skillsBarHeight'          => Att_Utils::single_responsive( 8, 8, 8, 'px' ),
	'skillsPercentVisibility'  => Att_Utils::select_field( 'always' ),
	'skillsItemGap'            => Att_Utils::single_responsive( 16, 16, 16, 'px' ),
	// Responsive Alignment → `justify-content` on `__skills--button`, so the class
	// itself gates it to the chip row (the progress bars are a column flex, where
	// justify-content would shift the bars vertically). Standalone-block only:
	// inside a card the row follows the card's Content Alignment. `left` = the
	// flexbox initial value, so the default emits nothing new.
	'skillsAlignment'          => Att_Utils::single_responsive( 'left', '', '', '' ),

	// --- Skills: Style tab -------------------------------------------------
	'skillMultiColor'          => Att_Utils::boolean( false ),
	'skillBarFillColor'        => Att_Utils::string( '#2B5F47' ),
	'skillBarTrackColor'       => Att_Utils::string( '#D9EAE0' ),
	'skillBarColors'           => Att_Utils::array_field(
		array(
			array(
				'fill'  => '',
				'track' => '',
			),
			array(
				'fill'  => '',
				'track' => '',
			),
		)
	),
	'skillLabelColor'          => Att_Utils::string( '#1e1e1e' ),
	'skillLabelTypography'     => Att_Utils::typography(),
	// 16px on Desktop as a REAL default (it used to sit only in the control's
	// `fontSizeDefault` / the SCSS base, so the block rendered one size while the
	// slider read another); Tablet/Mobile stay empty and inherit through the cascade.
	'skillLabelFontSize'       => Att_Utils::single_responsive( 16, '', '', 'px' ),
	'skillLabelLineHeight'     => Att_Utils::single_responsive( '', '', '', '' ),
	'skillLabelLetterSpacing'  => Att_Utils::range_control( '', 'px' ),
	'skillLabelWordSpacing'    => Att_Utils::range_control( '', 'px' ),
	'skillLabelGlobalTypo'     => Att_Utils::object(),
	'skillPercentColor'        => Att_Utils::string( '#1e1e1e' ),
	'skillTooltipBgColor'      => Att_Utils::string( '#2B5F47' ),
	'skillBarRadius'           => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'skillMargin'              => Att_Utils::responsive_spacing( 0, 0, 0, 0, 'px', true ),

	// --- Skills: Style tab (Button/chip display) ---------------------------
	'skillButtonTypography'    => Att_Utils::typography(),
	// 16px, like the progress-bar label above.
	'skillButtonFontSize'      => Att_Utils::single_responsive( 16, '', '', 'px' ),
	'skillButtonLineHeight'    => Att_Utils::single_responsive( '', '', '', '' ),
	'skillButtonLetterSpacing' => Att_Utils::range_control( '', 'px' ),
	'skillButtonWordSpacing'   => Att_Utils::range_control( '', 'px' ),
	'skillButtonGlobalTypo'    => Att_Utils::object(),
	'skillButtonColor'         => Att_Utils::string( '#1e1e1e' ),
	'skillButtonBg'            => Att_Utils::string( '' ),
	'skillButtonBorder'        => Att_Utils::border( 'solid', '#dcdcdc', '#dcdcdc' ),
	'skillButtonBorderWidth'   => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'skillButtonRadius'        => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'skillButtonPadding'       => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	'skillButtonMargin'        => Att_Utils::responsive_spacing( 0, 0, 0, 0, 'px', true ),

	// --- Misc --------------------------------------------------------------
	'isPreview'                => Att_Utils::boolean( false ),
	'align'                    => Att_Utils::string( '' ),
);
