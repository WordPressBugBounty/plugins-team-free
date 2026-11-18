<?php
/**
 * Block-specific attributes for the Member Name block.
 *
 * Merged with CommonAttributes::get() inside AbstractBlock::load_attributes().
 * Responsive device keys are capitalized (Desktop/Tablet/Mobile).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	// --- Settings tab ---------------------------------------------------------
	// Which member to render. 0 = auto: the current member (resolved from the
	// queried post or a Single Member wrapper's context at render time).
	'memberId'          => Att_Utils::number( 0 ),
	// HTML tag for the name element.
	'nameTag'           => Att_Utils::select_field( 'h2' ),
	// Responsive text alignment → emitted as text-align by the dynamic CSS.
	'nameAlignment'     => Att_Utils::single_responsive( 'left', '', '', '' ),

	// --- Style tab ------------------------------------------------------------
	'nameColor'         => Att_Utils::string( '' ),
	// Typography bundle (twin of the other blocks' <prefix>Typography set).
	'nameTypography'    => Att_Utils::typography(),
	// 32px on Desktop as a REAL default (the block is the member's page heading, so
	// the theme's h2 size is rarely what it wants); Tablet/Mobile stay empty and
	// inherit it through the cascade. `fontSizeDefault` in inspect.js matches.
	'nameFontSize'      => Att_Utils::single_responsive( 32, '', '', 'px' ),
	'nameLineHeight'    => Att_Utils::single_responsive( '', '', '', '' ),
	'nameLetterSpacing' => Att_Utils::range_control( '', 'px' ),
	'nameWordSpacing'   => Att_Utils::range_control( '', 'px' ),
	'nameGlobalTypo'    => Att_Utils::object(),
	// No margin attribute: the block's spacing is Advanced Settings → General
	// (`sectionMargin`), so the Style tab's own Margin control was removed.

	// --- Misc -----------------------------------------------------------------
	'isPreview'         => Att_Utils::boolean( false ),
	'align'             => Att_Utils::string( '' ),
);
