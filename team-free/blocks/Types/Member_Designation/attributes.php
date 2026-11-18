<?php
/**
 * Block-specific attributes for the Member Designation block.
 *
 * The designation is the member-card schema's **role** field, so the attribute
 * keys keep the card's `role*` prefix (roleColor / roleTypography / …) even
 * though the block, its CSS class and its inspector labels say "designation".
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
	'memberId'          => Att_Utils::number( 0 ),

	// --- Settings tab ---------------------------------------------------------
	// Responsive text alignment → emitted as text-align by the dynamic CSS.
	'roleAlignment'     => Att_Utils::single_responsive( 'left', '', '', '' ),

	// --- Style tab ------------------------------------------------------------
	'roleColor'         => Att_Utils::string( '' ),
	// Typography bundle (twin of the other blocks' <prefix>Typography set).
	'roleTypography'    => Att_Utils::typography(),
	// 16px on Desktop as a REAL default (it used to live only in the control's
	// `fontSizeDefault`, so the block rendered at the theme's paragraph size while
	// the slider read 16); Tablet/Mobile stay empty and inherit through the cascade.
	'roleFontSize'      => Att_Utils::single_responsive( 16, '', '', 'px' ),
	'roleLineHeight'    => Att_Utils::single_responsive( '', '', '', '' ),
	'roleLetterSpacing' => Att_Utils::range_control( '', 'px' ),
	'roleWordSpacing'   => Att_Utils::range_control( '', 'px' ),
	'roleGlobalTypo'    => Att_Utils::object(),
	// No margin attribute: the block's spacing is Advanced Settings → General
	// (`sectionMargin`), so the Style tab's own Margin control was removed.

	// --- Misc -----------------------------------------------------------------
	'isPreview'         => Att_Utils::boolean( false ),
	'align'             => Att_Utils::string( '' ),
);
