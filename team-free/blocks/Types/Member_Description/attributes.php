<?php
/**
 * Block-specific attributes for the Member Description block.
 *
 * Same control set as the Member Designation block (Alignment + typography /
 * color / margin). The prefix is `description*` — NOT the member-card schema's
 * `bio*` — because the card's single bio element covers both sources here: the
 * Short Bio field gets its own block and keeps `bio*` free.
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
	// Responsive text alignment → emitted as text-align by the dynamic CSS.
	'descriptionAlignment'     => Att_Utils::single_responsive( 'left', '', '', '' ),

	// --- Style tab ------------------------------------------------------------
	'descriptionColor'         => Att_Utils::string( '' ),
	// Typography bundle (twin of the other blocks' <prefix>Typography set).
	'descriptionTypography'    => Att_Utils::typography(),
	// 16px on Desktop as a REAL default (it used to sit only in the control's
	// `fontSizeDefault`, so the block rendered at the theme's paragraph size while
	// the slider read 16); Tablet/Mobile stay empty and inherit through the cascade.
	'descriptionFontSize'      => Att_Utils::single_responsive( 16, '', '', 'px' ),
	'descriptionLineHeight'    => Att_Utils::single_responsive( '', '', '', '' ),
	'descriptionLetterSpacing' => Att_Utils::range_control( '', 'px' ),
	'descriptionWordSpacing'   => Att_Utils::range_control( '', 'px' ),
	'descriptionGlobalTypo'    => Att_Utils::object(),
	// Empty default so the SCSS reset holds until customized.
	// No margin attribute: the block's spacing is Advanced Settings → General
	// (`sectionMargin`), so the Style tab's own Margin control was removed.

	// --- Misc -----------------------------------------------------------------
	'isPreview'                => Att_Utils::boolean( false ),
	'align'                    => Att_Utils::string( '' ),
);
