<?php
/**
 * Shared member-card attributes — every layout block (grid, carousel, future
 * list/table/…) merges this schema before its own layout-specific attributes
 * (which may also override defaults here, e.g. a different `columns` default).
 * Merged with CommonAttributes::get() inside AbstractBlock::load_attributes().
 * Responsive device keys are capitalized (Desktop/Tablet/Mobile).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Attributes
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;


return array(
	'align'                    => Att_Utils::string( 'wide' ),
	'cardDesign'               => Att_Utils::select_field( '' ),
	'imagePosition'            => Att_Utils::button_group( 'left' ),
	'imageContentGap'          => Att_Utils::range_control( 24, 'px' ),
	'imageAreaPosition'        => Att_Utils::button_group( 'left' ),
	'imageAreaGap'             => Att_Utils::range_control( 24, 'px' ),
	'contentBoxWidth'          => Att_Utils::single_responsive( 85, '', '', '%' ),
	'contentBoxOffset'         => Att_Utils::single_responsive( 40, '', '', 'px' ),
	'contentBoxAlignment'      => Att_Utils::button_group( 'center' ),
	'columns'                  => Att_Utils::single_responsive( 3, 2, 1, '' ),
	'horizontalGap'            => Att_Utils::range_control( 24, 'px' ),
	'verticalGap'              => Att_Utils::range_control( 24, 'px' ),
	'alignItems'               => Att_Utils::select_field( 'stretch' ),

	// --- Query Builder ------------------------------------------------------
	'filterBy'                 => Att_Utils::select_field( 'latest' ),
	'selectedGroups'           => Att_Utils::array_field(),
	'includesItems'            => Att_Utils::array_field(),
	'excludesItems'            => Att_Utils::array_field(),
	'limit'                    => Att_Utils::number( 6 ),
	'orderBy'                  => Att_Utils::select_field( 'date' ),
	'order'                    => Att_Utils::select_field( 'desc' ),
	'enableRandomOrder'        => Att_Utils::boolean( false ),

	// --- Card Elements (sortable display list) ------------------------------
	'cardElements'             => Att_Utils::sortable_list(
		array(
			array( 'image', 'Photo/Image', true ),
			array( 'name', 'Member Name', true ),
			array( 'role', 'Position/Job Title', true ),
			array( 'bio', 'Short Bio', true ),
			array( 'social', 'Social Profiles', true ),
			array( 'email', 'Email Address', false ),
			array( 'mobile', 'Mobile', false ),
			array( 'phone', 'Phone', false ),
			array( 'location', 'Location', false ),
			array( 'website', 'Website', false ),
			array( 'experience', 'Year of Exp.', false ),
			array( 'language', 'Language', false ),
			array( 'gender', 'Gender', false ),
			array( 'skills', 'Skills', false ),
			array( 'custom', 'Custom Info', false ),
		)
	),

	// --- Card behavior (below the elements list) ----------------------------
	'readMoreButton'           => Att_Utils::boolean( false ),
	'hoverContent'             => Att_Utils::array_field(),
	'contentAlignment'         => Att_Utils::button_group( 'center' ),
	// Pro-only — registered so a Pro-saved block re-saved in Free keeps the value (unregistered attrs are dropped).
	'contentPosition'          => Att_Utils::button_group( '' ),
	'hoverEffect'              => Att_Utils::select_field( 'none' ),

	// --- Card box style (Card Elements → Style tab, Normal/Hover) -----------
	'cardBg'                   => Att_Utils::background( 'bgColor', '' ),
	'cardBgImage'              => Att_Utils::object(),
	'cardBgVideo'              => Att_Utils::object(),
	'cardBorder'               => Att_Utils::border( 'none', '#CCCCCC', '#CCCCCC' ),
	'cardBorderHover'          => Att_Utils::border( 'none', '#CCCCCC', '#CCCCCC' ),
	'cardBorderWidth'          => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'cardBorderWidthHover'     => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'cardBorderRadius'         => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'cardBoxShadow'            => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'cardBoxShadowHover'       => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'cardPadding'              => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	// Pro-only — registered so a Pro-saved block re-saved in Free keeps the value (unregistered attrs are dropped).
	'cardContentMargin'        => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Member Image: Settings tab ----------------------------------------
	'imageResolution'          => Att_Utils::select_field( 'full' ),
	'imageAspectRatio'         => Att_Utils::select_field( '1-1' ),
	'imageSize'                => Att_Utils::width_height( 100, '', '%', 'px' ),
	'imageMasking'             => Att_Utils::boolean( false ),
	'imageMaskShape'           => Att_Utils::string( 'mask2' ),
	'imageFlip'                => Att_Utils::boolean( false ),
	'imageLazyLoad'            => Att_Utils::boolean( false ),
	'imageRetina'              => Att_Utils::boolean( false ),
	'imageSpecialTag'          => Att_Utils::boolean( false ),
	'imageSpecialTagStyle'     => Att_Utils::select_field( 'style-1' ),
	'imageSpecialTagPosition'  => Att_Utils::select_field( 'top-right' ),

	// --- Member Image: Style tab (filters are flat per-state) --------------
	'imageHoverEffect'         => Att_Utils::select_field( 'none' ),
	'imageBlur'                => Att_Utils::range_control( 0, 'px' ),
	'imageBrightness'          => Att_Utils::range_control( 100, '%' ),
	'imageContrast'            => Att_Utils::range_control( 100, '%' ),
	'imageSaturate'            => Att_Utils::range_control( 100, '%' ),
	'imageHue'                 => Att_Utils::range_control( 0, 'deg' ),
	'imageBlurHover'           => Att_Utils::range_control( 0, 'px' ),
	'imageBrightnessHover'     => Att_Utils::range_control( 100, '%' ),
	'imageContrastHover'       => Att_Utils::range_control( 100, '%' ),
	'imageSaturateHover'       => Att_Utils::range_control( 100, '%' ),
	'imageHueHover'            => Att_Utils::range_control( 0, 'deg' ),
	'imageBorderRadius'        => Att_Utils::spacing( 4, 4, 4, 4, 'px', true ),
	'imageMargin'              => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	// Special Tag chip (Member Image → Style: Tag Typography + the Tag Style
	// popover) — empty defaults so the SCSS chip look holds (#2b5f47 / #fff).
	'imageTagColor'            => Att_Utils::string( '' ),
	'imageTagBg'               => Att_Utils::background( 'bgColor', '' ),
	'imageTagTypography'       => Att_Utils::typography(),
	'imageTagFontSize'         => Att_Utils::single_responsive( '', '', '', 'px' ),
	'imageTagLineHeight'       => Att_Utils::single_responsive( '', '', '', '' ),
	'imageTagLetterSpacing'    => Att_Utils::range_control( '', 'px' ),
	'imageTagWordSpacing'      => Att_Utils::range_control( '', 'px' ),
	'imageTagGlobalTypo'       => Att_Utils::object(),

	// --- Basic Information: Settings tab -----------------------------------
	'nameHtmlTag'              => Att_Utils::button_group( 'h3' ),
	'bioSource'                => Att_Utils::select_field( 'short' ),
	'bioDisplayStyle'          => Att_Utils::button_group( 'limited' ),
	// Auto Fallback + the Limited display style (Length/Ellipsis) are Pro —
	// kept registered so Pro's saved values survive; Free never reads them.
	'bioLength'                => Att_Utils::single_responsive( 150, 100, 100, 'char' ),
	'bioEllipsis'              => Att_Utils::string( '...' ),
	'bioEllipsisClickable'     => Att_Utils::boolean( false ),

	// --- Basic Information: Style tab (per-element typography) -------------
	'nameColor'                => Att_Utils::string( '#1e1e1e' ),
	'nameColorHover'           => Att_Utils::string( '' ),
	'nameBgColor'              => Att_Utils::string( '' ),
	'nameBgColorHover'         => Att_Utils::string( '' ),
	'namePadding'              => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	'nameTypography'           => Att_Utils::typography(),
	'nameFontSize'             => Att_Utils::single_responsive( '', '', '', 'px' ),
	'nameLineHeight'           => Att_Utils::single_responsive( '', '', '', '' ),
	'nameLetterSpacing'        => Att_Utils::range_control( '', 'px' ),
	'nameWordSpacing'          => Att_Utils::range_control( '', 'px' ),
	'nameGlobalTypo'           => Att_Utils::object(),
	'nameMargin'               => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	'roleColor'                => Att_Utils::string( '#757575' ),
	'roleBgColor'              => Att_Utils::string( '' ),
	'rolePadding'              => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	'roleTypography'           => Att_Utils::typography(),
	'roleFontSize'             => Att_Utils::single_responsive( '', '', '', 'px' ),
	'roleLineHeight'           => Att_Utils::single_responsive( '', '', '', '' ),
	'roleLetterSpacing'        => Att_Utils::range_control( '', 'px' ),
	'roleWordSpacing'          => Att_Utils::range_control( '', 'px' ),
	'roleGlobalTypo'           => Att_Utils::object(),
	'roleMargin'               => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	'bioColor'                 => Att_Utils::string( '#757575' ),
	'bioTypography'            => Att_Utils::typography(),
	'bioFontSize'              => Att_Utils::single_responsive( '', '', '', 'px' ),
	'bioLineHeight'            => Att_Utils::single_responsive( '', '', '', '' ),
	'bioLetterSpacing'         => Att_Utils::range_control( '', 'px' ),
	'bioWordSpacing'           => Att_Utils::range_control( '', 'px' ),
	'bioGlobalTypo'            => Att_Utils::object(),
	'bioMargin'                => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Additional Information: Settings tab ------------------------------
	'displayMetaIcon'          => Att_Utils::boolean( true ),
	// Icon glyph style: style-1 solid, style-2 outline, style-3 light.
	'metaIconStyle'            => Att_Utils::select_field( 'style-1' ),
	'metaIconSize'             => Att_Utils::single_responsive( 16, 16, 16, 'px' ),
	'metaIconGap'              => Att_Utils::single_responsive( 10, 10, 10, 'px' ),
	'metaItemGap'              => Att_Utils::single_responsive( 12, 12, 12, 'px' ),

	// --- Additional Information: Style tab (meta text + icon, Normal/Hover) -
	'metaTextColor'            => Att_Utils::string( '' ),
	'metaTextColorHover'       => Att_Utils::string( '' ),
	'metaIconColor'            => Att_Utils::string( '' ),
	'metaIconColorHover'       => Att_Utils::string( '' ),
	'metaTypography'           => Att_Utils::typography(),
	'metaFontSize'             => Att_Utils::single_responsive( '', '', '', 'px' ),
	'metaLineHeight'           => Att_Utils::single_responsive( '', '', '', '' ),
	'metaLetterSpacing'        => Att_Utils::range_control( '', 'px' ),
	'metaWordSpacing'          => Att_Utils::range_control( '', 'px' ),
	'metaGlobalTypo'           => Att_Utils::object(),

	// --- Skills: Settings tab ----------------------------------------------
	'skillsDisplayStyle'       => Att_Utils::button_group( 'progress' ),
	'skillsProgressBarStyle'   => Att_Utils::select_field( 'style-2' ),
	'skillsBarHeight'          => Att_Utils::single_responsive( 8, 8, 8, 'px' ),
	'skillsPercentVisibility'  => Att_Utils::select_field( 'always' ),
	'skillsItemGap'            => Att_Utils::single_responsive( 16, 16, 16, 'px' ),

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
	'skillLabelFontSize'       => Att_Utils::single_responsive( '', '', '', 'px' ),
	'skillLabelLineHeight'     => Att_Utils::single_responsive( '', '', '', '' ),
	'skillLabelLetterSpacing'  => Att_Utils::range_control( '', 'px' ),
	'skillLabelWordSpacing'    => Att_Utils::range_control( '', 'px' ),
	'skillLabelGlobalTypo'     => Att_Utils::object(),
	'skillPercentColor'        => Att_Utils::string( '#1e1e1e' ),
	'skillTooltipBgColor'      => Att_Utils::string( '#2B5F47' ),
	'skillBarRadius'           => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'skillMargin'              => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Skills: Style tab (Button/chip display) ---------------------------
	'skillButtonTypography'    => Att_Utils::typography(),
	'skillButtonFontSize'      => Att_Utils::single_responsive( '', '', '', 'px' ),
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
	'skillButtonMargin'        => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Social Profiles: Settings tab -------------------------------------
	'socialIconStyle'          => Att_Utils::select_field( 'style-3' ),
	'socialIconPosition'       => Att_Utils::select_field( 'bottom-right' ),
	'socialIconOffset'         => Att_Utils::single_responsive( 20, 20, 20, 'px' ),
	'socialIconSize'           => Att_Utils::single_responsive( 13, 13, 13, 'px' ),
	'socialIconAreaSize'       => Att_Utils::single_responsive( 30, 30, 30, 'px' ),
	'socialItemGap'            => Att_Utils::single_responsive( 6, 6, 6, 'px' ),
	'socialCustomStyling'      => Att_Utils::boolean( true ),
	'socialIconColorHover'     => Att_Utils::string( '' ),
	'socialBgColor'            => Att_Utils::string( '' ),
	'socialBgColorHover'       => Att_Utils::string( '' ),
	'socialBorder'             => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'socialBorderHover'        => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'socialBorderWidth'        => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'socialBorderWidthHover'   => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'socialBoxShadow'          => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'socialBoxShadowHover'     => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'socialBorderRadius'       => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'socialMargin'             => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Style (Figma defaults) --------------------------------------------
	'imageRadius'              => Att_Utils::range_control( 4, 'px' ),
	'socialIconColor'          => Att_Utils::string( '' ),
	'socialBorderColor'        => Att_Utils::string( '' ),

	// --- Read More: Settings tab -------------------------------------------
	'readMoreLabel'            => Att_Utils::string( 'Read More' ),

	// --- Read More: Style tab (Normal/Hover button styling + spacing) ------
	'readMoreColor'            => Att_Utils::string( '' ),
	'readMoreColorHover'       => Att_Utils::string( '' ),
	'readMoreBg'               => Att_Utils::background( 'bgColor', '' ),
	// Border is per-state: the Normal/Hover toggle swaps the whole border object
	// (style + width + color), mirroring how box-shadow uses two objects.
	'readMoreBorder'           => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'readMoreBorderHover'      => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'readMoreBorderWidth'      => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'readMoreBorderWidthHover' => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'readMoreBoxShadow'        => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'readMoreBoxShadowHover'   => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
	'readMoreTypography'       => Att_Utils::typography(),
	'readMoreFontSize'         => Att_Utils::single_responsive( '', '', '', 'px' ),
	'readMoreLineHeight'       => Att_Utils::single_responsive( '', '', '', '' ),
	'readMoreLetterSpacing'    => Att_Utils::range_control( '', 'px' ),
	'readMoreWordSpacing'      => Att_Utils::range_control( '', 'px' ),
	'readMoreGlobalTypo'       => Att_Utils::object(),
	'readMoreRadius'           => Att_Utils::spacing( '', '', '', '', 'px', true ),
	'readMorePadding'          => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
	'readMoreMargin'           => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),

	// --- Member Details (single member open behavior) ----------------------
	'showMemberDetails'        => Att_Utils::boolean( true ),
	// modal | single (Single Page).
	'detailsOpenAs'            => Att_Utils::button_group( 'modal' ),
	// The details template the modal renders. `default` = the Default template,
	// stored as that literal string (not its post id) so a block exported to
	// another site keeps working.
	'detailsTemplate'          => Att_Utils::select_field( 'default' ),
	// image | name | image-name | full (Full Card).
	'makeClickable'            => Att_Utils::select_field( 'image' ),
	'detailsOpenInNewTab'      => Att_Utils::boolean( false ),

	// --- Misc ---------------------------------------------------------------
	'isPreview'                => Att_Utils::boolean( false ),
);
