<?php
/**
 * Block-specific attributes for the Grid block.
 *
 * The card/feature schema is the shared member-card set
 * (blocks/Attributes/member-card-attributes.php); this file adds only the
 * grid-layout attributes. Merged with CommonAttributes::get() inside
 * AbstractBlock::load_attributes().
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array_merge(
	require dirname( __DIR__, 2 ) . '/Attributes/member-card-attributes.php',
	array(
		// --- Grid layout addons (team-group child block toggles) ---------------
		'ajaxPagination'     => Att_Utils::boolean( false ),
		'liveFrontendFilter' => Att_Utils::boolean( false ),
		'ajaxSearch'         => Att_Utils::boolean( false ),
		// --- Grid Style (Pro) — registered so a Pro-saved value survives an edit;
		// Free never reads them, so every style renders as the normal grid. ---
		'gridStyle'          => Att_Utils::select_field( 'normal' ),
		'staggerOffset'      => Att_Utils::single_responsive( 60, 60, 60, 'px' ),
	)
);
