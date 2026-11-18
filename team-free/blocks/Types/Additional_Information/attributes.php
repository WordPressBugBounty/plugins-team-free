<?php
/**
 * Block-specific attributes for the Additional Information block.
 *
 * The member-card schema's `meta*` keys are reused verbatim (displayMetaIcon,
 * metaIconStyle/Size/Gap, metaItemGap, metaTextColor(Hover), metaIconColor(Hover)
 * and the meta typography bundle) so the shared control shapes and CSS formatters
 * port 1:1; only the row list, the label and the icon-shape controls are new.
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
	// Display Information — the rows to render, in order. This is the SELECTED
	// list (the MultiSelectDndKit control adds/removes/reorders it); the full
	// catalogue of eight fields lives in the inspector's META_FIELD_ITEMS.
	// Each row is `{ id, value, label, show }` — `label` is what renders when
	// Display Label is on, so a future rename control needs no schema change.
	'metaFields'               => Att_Utils::sortable_list(
		array(
			array( 'email', 'Email', true ),
			array( 'phone', 'Phone', true ),
			array( 'location', 'Location', true ),
			array( 'website', 'Website', true ),
		)
	),
	'displayMetaLabel'         => Att_Utils::boolean( false ),
	'displayMetaIcon'          => Att_Utils::boolean( true ),
	// Icon glyph style: style-1 fill, style-2 bold-line, style-3 thin-line.
	'metaIconStyle'            => Att_Utils::select_field( 'style-1' ),
	// NO `metaIconDisplayStyle` (the old Normal / Stacked / Framed picker): the
	// Style tab's Icon Background / Border / Radius / Padding shape the chip
	// directly and now apply unconditionally, so the preset only decided whether
	// they were allowed to. The two preset SCSS looks went with it.
	'metaIconSize'             => Att_Utils::single_responsive( 16, 16, 16, 'px' ),
	// Icon → text gap (the row's flex gap).
	'metaIconGap'              => Att_Utils::single_responsive( 10, 10, 10, 'px' ),
	// Row → row gap.
	'metaItemGap'              => Att_Utils::single_responsive( 12, 12, 12, 'px' ),
	// Responsive Alignment → `justify-content` on each row (__item), so the
	// icon + label + value block aligns while the row keeps its full width (and
	// with it the row's hover area). `left` = the flexbox initial value, so the
	// default emits nothing new.
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
	// The list's own margin (row-to-row spacing is Gap Between Items). Empty by
	// default so the SCSS/theme flow holds until customized.
	'metaMargin'               => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

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
	'metaIconPadding'          => Att_Utils::responsive_spacing( 0, 0, 0, 0, 'px', true ),

	// --- Misc -----------------------------------------------------------------
	'isPreview'                => Att_Utils::boolean( false ),
	'align'                    => Att_Utils::string( '' ),
);
