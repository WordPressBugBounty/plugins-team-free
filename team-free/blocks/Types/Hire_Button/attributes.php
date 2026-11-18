<?php
/**
 * Block-specific attributes for the Hire Button block.
 *
 * The Member Resume schema under a `hire*` prefix — the same split those two
 * blocks' inspectors share. As on Member Resume the button's design lives in
 * REAL defaults (not a static SCSS look) so the Style tab's Normal/Hover
 * controls always agree with what is painted; here the legacy hire button's
 * FILLED look (templates/member/hire.php + the generator's hire_button_* colors)
 * is what those defaults encode, against Member Resume's outlined one.
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
	'memberId'             => Att_Utils::number( 0 ),

	// --- Settings tab ---------------------------------------------------------
	// Empty by default: the control shows a "Hire Me" placeholder and the
	// renderers fall back to the same string.
	'hireLabel'            => Att_Utils::string( '' ),
	'hireOpenInNewTab'     => Att_Utils::boolean( false ),
	// Responsive alignment → emitted as text-align on the wrapper, which places
	// the inline-flex button. Empty Tablet/Mobile inherit Desktop.
	'hireAlignment'        => Att_Utils::single_responsive( 'left', '', '', '' ),

	// --- Style tab (the button, per Normal/Hover state) -----------------------
	// Filled brand button that darkens on hover. Typography / radius / padding
	// keep EMPTY defaults — they are stateless, so the SCSS fallback cannot
	// contradict the control (and 0 still emits).
	'hireColor'            => Att_Utils::string( '#FFFFFF' ),
	'hireColorHover'       => Att_Utils::string( '#FFFFFF' ),
	'hireBg'               => Att_Utils::background(
		'bgColor',
		'#2B5F47',
		'linear-gradient(135deg,rgba(179,50,95,0.44) 0%,rgba(227,86,43,0.45) 100%)',
		'#1E5138'
	),
	'hireBorder'           => Att_Utils::border( 'solid', '#2B5F47', '#1E5138' ),
	'hireBorderHover'      => Att_Utils::border( 'solid', '#1E5138', '#1E5138' ),
	'hireBorderWidth'      => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'hireBorderWidthHover' => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'hireBoxShadow'        => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'hireBoxShadowHover'   => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'hireTypography'       => Att_Utils::typography(),
	// 16px on Desktop as a REAL default (it used to sit only in the control's
	// `fontSizeDefault` / the SCSS base, so the block rendered one size while the
	// slider read another); Tablet/Mobile stay empty and inherit through the cascade.
	'hireFontSize'         => Att_Utils::single_responsive( 16, '', '', 'px' ),
	'hireLineHeight'       => Att_Utils::single_responsive( '', '', '', '' ),
	'hireLetterSpacing'    => Att_Utils::range_control( '', 'px' ),
	'hireWordSpacing'      => Att_Utils::range_control( '', 'px' ),
	'hireGlobalTypo'       => Att_Utils::object(),
	'hireRadius'           => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'hirePadding'          => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	// No margin attribute: the block's spacing is Advanced Settings → General
	// (`sectionMargin`), like every other single-page field block.

	// --- Misc -----------------------------------------------------------------
	'isPreview'            => Att_Utils::boolean( false ),
	'align'                => Att_Utils::string( '' ),
);
