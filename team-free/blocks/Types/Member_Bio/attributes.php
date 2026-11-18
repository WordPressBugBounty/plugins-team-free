<?php
/**
 * Block-specific attributes for the Member Bio block.
 *
 * Same control set as the Member Designation / Member Description blocks
 * (Alignment + typography / color / margin). The prefix is the member-card
 * schema's `bio*`, which this block's Short Bio field matches.
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
	'memberId'         => Att_Utils::number( 0 ),

	// --- Settings tab ---------------------------------------------------------
	// Responsive text alignment → emitted as text-align by the dynamic CSS.
	'bioAlignment'     => Att_Utils::single_responsive( 'left', '', '', '' ),

	// --- Style tab ------------------------------------------------------------
	'bioColor'         => Att_Utils::string( '' ),
	// Typography bundle (twin of the other blocks' <prefix>Typography set).
	'bioTypography'    => Att_Utils::typography(),
	// 16px on Desktop as a REAL default (it used to sit only in the control's
	// `fontSizeDefault`, so the block rendered at the theme's paragraph size while
	// the slider read 16); Tablet/Mobile stay empty and inherit through the cascade.
	'bioFontSize'      => Att_Utils::single_responsive( 16, '', '', 'px' ),
	'bioLineHeight'    => Att_Utils::single_responsive( '', '', '', '' ),
	'bioLetterSpacing' => Att_Utils::range_control( '', 'px' ),
	'bioWordSpacing'   => Att_Utils::range_control( '', 'px' ),
	'bioGlobalTypo'    => Att_Utils::object(),
	// No margin attribute: the block's spacing is Advanced Settings → General
	// (`sectionMargin`), so the Style tab's own Margin control was removed.

	// --- Misc -----------------------------------------------------------------
	'isPreview'        => Att_Utils::boolean( false ),
	'align'            => Att_Utils::string( '' ),
);
