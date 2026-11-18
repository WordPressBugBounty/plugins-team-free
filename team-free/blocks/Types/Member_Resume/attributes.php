<?php
/**
 * Block-specific attributes for the Member Resume block.
 *
 * The button carries the member-card Read More schema re-prefixed `resume*`
 * (typography / per-state color, background, border, shadow / radius / padding),
 * so the shared control shapes and CSS formatters port 1:1. There is no Margin
 * attribute — the block's spacing is Advanced Settings → General.
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
	'memberId'               => Att_Utils::number( 0 ),

	// --- Settings tab ---------------------------------------------------------
	// Empty by default: the control shows a "View Resume" placeholder and the
	// renderers fall back to the same string.
	'resumeLabel'            => Att_Utils::string( '' ),
	'resumeOpenInNewTab'     => Att_Utils::boolean( false ),
	// Responsive alignment → emitted as text-align on the wrapper, which places
	// the inline-flex button. Empty Tablet/Mobile inherit Desktop.
	'resumeAlignment'        => Att_Utils::single_responsive( 'left', '', '', '' ),

	// --- Style tab (the button, per Normal/Hover state) -----------------------
	// The outlined-brand-button design is expressed as REAL defaults (like the
	// Member Video play button), NOT as a static SCSS look the Style tab can't
	// see. Both halves of that matter:
	// • the Border control would otherwise read "None" while a hard-coded SCSS
	// border was visible — and picking None could not remove it, since the
	// `none` style emits nothing for the SCSS rule to override;
	// • an SCSS `:hover` fill (specificity 0,3,0) is outranked the moment ANY
	// normal-state rule emits at `#uniqueId` (1,1,0), so the hover look has
	// to come from the hover attributes to survive a normal-state edit.
	// Typography / radius / padding keep EMPTY defaults — they are stateless, so
	// the SCSS fallback can't contradict the control (and 0 still emits).
	'resumeColor'            => Att_Utils::string( '#2B5F47' ),
	'resumeColorHover'       => Att_Utils::string( '#FFFFFF' ),
	// Transparent fill that turns brand green on hover.
	'resumeBg'               => Att_Utils::background(
		'transparent',
		'',
		'linear-gradient(135deg,rgba(179,50,95,0.44) 0%,rgba(227,86,43,0.45) 100%)',
		'#2B5F47'
	),
	'resumeBorder'           => Att_Utils::border( 'solid', '#2B5F47', '#2B5F47' ),
	'resumeBorderHover'      => Att_Utils::border( 'solid', '#2B5F47', '#2B5F47' ),
	'resumeBorderWidth'      => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'resumeBorderWidthHover' => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'resumeBoxShadow'        => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'resumeBoxShadowHover'   => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'resumeTypography'       => Att_Utils::typography(),
	// 16px on Desktop as a REAL default (it used to sit only in the control's
	// `fontSizeDefault` / the SCSS base, so the block rendered one size while the
	// slider read another); Tablet/Mobile stay empty and inherit through the cascade.
	'resumeFontSize'         => Att_Utils::single_responsive( 16, '', '', 'px' ),
	'resumeLineHeight'       => Att_Utils::single_responsive( '', '', '', '' ),
	'resumeLetterSpacing'    => Att_Utils::range_control( '', 'px' ),
	'resumeWordSpacing'      => Att_Utils::range_control( '', 'px' ),
	'resumeGlobalTypo'       => Att_Utils::object(),
	'resumeRadius'           => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'resumePadding'          => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	// No margin attribute: the block's spacing is Advanced Settings → General
	// (`sectionMargin`), like every other single-page field block.

	// --- Misc -----------------------------------------------------------------
	'isPreview'              => Att_Utils::boolean( false ),
	'align'                  => Att_Utils::string( '' ),
);
