<?php
/**
 * Block-specific attributes for the 3D Carousel block.
 *
 * Reuses the Carousel block's schema (the shared member-card set + all carousel
 * attrs, so SwiperConfig works), then adds the 3D controls and the overlay card
 * defaults. Merged with CommonAttributes::get() inside
 * AbstractBlock::load_attributes().
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array_merge(
	require dirname( __DIR__ ) . '/Carousel/attributes.php',
	array(
		// --- 3D Carousel ---------------------------------------------------------
		// Select 3D Carousel Style: 3d (big center, shrunken sides) | panorama
		// (WP Carousel Pro's concave tunnel). The 3D Controls popup tunes both;
		// defaults are the 3d preset — switching style swaps still-default values
		// to the other preset (applyCarousel3dStyle, SwiperConfig::CAROUSEL_3D_PRESETS).
		'carousel3dStyle'       => Att_Utils::button_group( '3d' ),
		// Side Items — cards on each side of the fixed center card (0-3); replaces
		// Columns (SwiperConfig::carousel_3d_side_items).
		'sideItems'             => Att_Utils::single_responsive( 2, 1, 0, '' ),
		'slidesScale'           => Att_Utils::single_responsive( 0.95, '', '', '' ),
		'slidesDepth'           => Att_Utils::single_responsive( 0, '', '', '' ),
		'slidesRotation'        => Att_Utils::single_responsive( 5, '', '', '' ),
		'slidesBlur'            => Att_Utils::number( 0 ),
		'showReflection'        => Att_Utils::boolean( false ),
		'reflectionDistance'    => Att_Utils::single_responsive( 0, '', '', 'px' ),
		'reflectionHeight'      => Att_Utils::single_responsive( 120, '', '', 'px' ),

		// --- Overlay card default overrides --------------------------------------
		// The name / role / bio sit on a dark scrim, so default their colors to
		// white (users can still recolor them in Basic Information). Safe with the
		// shared applyCardDesign swap logic — it only swaps a control when the
		// value still equals the OLD design's default, which white never matches.
		// Content matches the design's hover overlay: white 24px name,
		// #e0e0e0 16px role, white 15px bio.
		'nameColor'             => Att_Utils::string( '#ffffff' ),
		'roleColor'             => Att_Utils::string( '#e0e0e0' ),
		'bioColor'              => Att_Utils::string( '#ffffff' ),
		'nameFontSize'          => Att_Utils::single_responsive( 24, 24, 24, 'px' ),
		'roleFontSize'          => Att_Utils::single_responsive( 16, 16, 16, 'px' ),
		'bioFontSize'           => Att_Utils::single_responsive( 15, 15, 15, 'px' ),

		// Rounded card corners + 38px ring-style social icons.
		'cardBorderRadius'      => Att_Utils::spacing( 8, 8, 8, 8, 'px', true ),
		'socialIconAreaSize'    => Att_Utils::single_responsive( 38, 38, 38, 'px' ),
		'socialIconSize'        => Att_Utils::single_responsive( 15, 15, 15, 'px' ),

		// The card is sized by the photo (see style.scss), so the Aspect Ratio
		// control drives the whole card — default to 3:4 (portrait) for the
		// overlay look; the shared default is 1:1 (square).
		'imageAspectRatio'      => Att_Utils::select_field( '3-4' ),

		// Card Content → Hover Content. The overlay presets' CSS reveal is GATED
		// on this being non-empty (the `--hover-reveal` card modifier), so an
		// empty control shows the whole card at rest like every other layout.
		// overlay-1 — the stock preset — reveals its whole content layer, so its
		// four content elements are the block's default reveal set (the twin of
		// OVERLAY_BASE_DEFAULTS in apps/blocks/carousel-3d/cardDesign.js, which
		// re-seeds it per preset when a design is picked).
		'hoverContent'          => Att_Utils::array_field( array( 'name', 'role', 'bio', 'social' ) ),
	)
);
