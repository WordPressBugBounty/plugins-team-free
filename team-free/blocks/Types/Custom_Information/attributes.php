<?php
/**
 * Block-specific attributes for the Custom Information block.
 *
 * The SAME `meta*` schema as the Additional Information block (whose markup
 * classes, dynamic-CSS engine and Style tab this block reuses), minus the two
 * attributes that cannot apply here:
 *   • `metaFields`    — the rows are the member's own Member Custom Information
 *                       repeater, so there is no fixed catalogue to pick from;
 *   • `metaIconStyle` — each custom field carries its OWN icon class, chosen per
 *                       field in the member meta, so the plugin's three glyph
 *                       sets (fill/bold-line/thin-line) have nothing to switch.
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
	// NO `displayMetaLabel`, unlike the Additional Information block: the only
	// label-ish data this repeater stores is the field TYPE
	// (Text/Fax/Number/Email/Link/Date), a schema detail rather than something to
	// print next to the value, so the control and the `__label` span are gone from
	// both renderers. `metaFields` / `metaIconStyle` are absent for their own
	// reasons (see the block docs).
	'displayMetaIcon'          => Att_Utils::boolean( true ),
	// NO `metaIconDisplayStyle` (the old Normal / Stacked / Framed picker): the
	// Style tab's Icon Background / Border / Radius / Padding shape the chip
	// directly and now apply unconditionally, so the preset only decided whether
	// they were allowed to. The two preset SCSS looks went with it.
	'metaIconSize'             => Att_Utils::single_responsive( 16, 16, 16, 'px' ),
	// Icon → text gap (the row's flex gap).
	'metaIconGap'              => Att_Utils::single_responsive( 10, 10, 10, 'px' ),
	// Row → row gap.
	'metaItemGap'              => Att_Utils::single_responsive( 12, 12, 12, 'px' ),
	// Responsive Alignment → `justify-content` on each row (__item). Same shape
	// and default as the Additional Information block — one dynamic-CSS twin
	// pair serves both.
	'metaAlignment'            => Att_Utils::single_responsive( 'left', '', '', '' ),

	// --- Style tab: row text (Normal/Hover) ----------------------------------
	// ONE typography + color set styles the whole row — the label and the value
	// always look the same, so they are emitted on __item and both inherit.
	'metaTextColor'            => Att_Utils::string( '' ),
	'metaTextColorHover'       => Att_Utils::string( '' ),
	'metaTypography'           => Att_Utils::typography(),
	// 16px on Desktop as a REAL default (it used to sit only in the control's
	// `fontSizeDefault` / the SCSS base, so the block rendered one size while the
	// slider read another); Tablet/Mobile stay empty and inherit through the cascade.
	'metaFontSize'             => Att_Utils::single_responsive( 16, '', '', 'px' ),
	'metaLineHeight'           => Att_Utils::single_responsive( '', '', '', '' ),
	'metaLetterSpacing'        => Att_Utils::range_control( '', 'px' ),
	'metaWordSpacing'          => Att_Utils::range_control( '', 'px' ),
	'metaGlobalTypo'           => Att_Utils::object(),

	// --- Style tab: icon (Normal/Hover) --------------------------------------
	'metaIconColor'            => Att_Utils::string( '' ),
	'metaIconColorHover'       => Att_Utils::string( '' ),
	// The shape behind/around the glyph — emitted only for the stacked/framed
	// display styles, and empty by default so the SCSS look holds.
	'metaIconBg'               => Att_Utils::background( 'bgColor', '' ),
	'metaIconBgHover'          => Att_Utils::background( 'bgColor', '' ),
	'metaIconBorder'           => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'metaIconBorderHover'      => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'metaIconBorderWidth'      => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'metaIconBorderWidthHover' => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	// 50% keeps the round shape the Figma shows; padding sizes it.
	'metaIconBorderRadius'     => Att_Utils::spacing( 50, 50, 50, 50, '%', true ),
	'metaIconPadding'          => Att_Utils::responsive_spacing( 10, 10, 10, 10, 'px', true ),

	// --- Misc -----------------------------------------------------------------
	'isPreview'                => Att_Utils::boolean( false ),
	'align'                    => Att_Utils::string( '' ),
);
