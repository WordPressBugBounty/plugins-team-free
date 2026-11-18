<?php
/**
 * Block-specific attributes for the Member Image block.
 *
 * Keys mirror the shared member-card **image** schema
 * (blocks/Attributes/member-card-attributes.php) so the card's image CSS
 * shapes work unchanged — this block just scopes them to its own #uniqueId.
 * The image-filter keys (imageBlur…) are Pro in Free: registered and stored
 * untouched, with no control or CSS. Merged with CommonAttributes::get()
 * inside AbstractBlock::load_attributes(). Responsive device keys are
 * capitalized (Desktop/Tablet/Mobile).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	// Which member to render. 0 = auto: the current member (resolved from the
	// queried post or a Single Member wrapper's context at render time).
	'memberId'              => Att_Utils::number( 0 ),

	// --- Settings tab ---------------------------------------------------------
	'imageResolution'       => Att_Utils::select_field( 'full' ),
	// original | 1-1 | 4-3 | 3-4 | 3-2 | 2-3 | 16-9 | 9-16 | custom.
	// `original` keeps the photo's natural height, `custom` drops the ratio so
	// the Width/Height control alone sizes the box.
	'imageAspectRatio'      => Att_Utils::select_field( '1-1' ),
	'imageSize'             => Att_Utils::width_height( 100, '', '%', 'px' ),
	'imageLazyLoad'         => Att_Utils::boolean( false ),
	'imageRetina'           => Att_Utils::boolean( false ),

	// --- Style tab (filters are flat per-state, like the card) ----------------
	'imageHoverEffect'      => Att_Utils::select_field( 'none' ),
	'imageBlur'             => Att_Utils::range_control( 0, 'px' ),
	'imageBrightness'       => Att_Utils::range_control( 100, '%' ),
	'imageContrast'         => Att_Utils::range_control( 100, '%' ),
	'imageSaturate'         => Att_Utils::range_control( 100, '%' ),
	'imageHue'              => Att_Utils::range_control( 0, 'deg' ),
	'imageBlurHover'        => Att_Utils::range_control( 0, 'px' ),
	'imageBrightnessHover'  => Att_Utils::range_control( 100, '%' ),
	'imageContrastHover'    => Att_Utils::range_control( 100, '%' ),
	'imageSaturateHover'    => Att_Utils::range_control( 100, '%' ),
	'imageHueHover'         => Att_Utils::range_control( 0, 'deg' ),
	// Photo box border — per state, like the card's social/Read More borders.
	// Style `none` by default, so nothing is emitted until the user picks one.
	'imageBorder'           => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'imageBorderHover'      => Att_Utils::border( 'none', '#dddddd', '#dddddd' ),
	'imageBorderWidth'      => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	'imageBorderWidthHover' => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
	// Empty defaults so the shared SCSS look (4px avatar radius, no margin)
	// holds until the user customizes.
	'imageBorderRadius'     => Att_Utils::spacing( '', '', '', '', 'px', true ),
	// No margin attribute: the block's spacing is Advanced Settings → General
	// (`sectionMargin`), so the Style tab's own Margin control was removed.

	// --- Misc -----------------------------------------------------------------
	'isPreview'             => Att_Utils::boolean( false ),
	'align'                 => Att_Utils::string( '' ),
);
