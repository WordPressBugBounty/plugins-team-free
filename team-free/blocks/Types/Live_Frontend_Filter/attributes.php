<?php
/**
 * Block-specific attributes for the Live Frontend Filter container block.
 *
 * Merged with CommonAttributes::get() inside AbstractBlock::load_attributes().
 * The container lays out its filter children as a flex row (Figma: Multiple
 * Filter Relation + the flexbox controls); each child block carries its own
 * filter/display settings. The Style tab reuses the CommonAttributes
 * section* box attributes (emitted by CommonDynamicCss on `#uniqueId`).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	// How multiple active filters combine in the query: and = a member must
	// match every filter, or = any filter. Carried to the frontend on
	// data-relation; the ajax handler maps it to the tax_query relation.
	'multiFilterRelation' => Att_Utils::button_group( 'and' ),

	// Flexbox layout of the __items row (all responsive; empty device values
	// inherit the larger breakpoint).
	'flexDirection'       => Att_Utils::single_responsive( 'row', '', '', '' ),
	'justifyContent'      => Att_Utils::single_responsive( 'center', '', '', '' ),
	'alignItems'          => Att_Utils::single_responsive( 'flex-start', '', '', '' ),
	'flexWrap'            => Att_Utils::single_responsive( 'wrap', '', '', '' ),
	'horizontalGap'       => Att_Utils::single_responsive( 10, '', '', 'px' ),
	'verticalGap'         => Att_Utils::single_responsive( 10, '', '', 'px' ),

	// Container width (responsive).
	'filterWidth'         => Att_Utils::single_responsive( 100, '', '', '%' ),

	// --- Misc ---------------------------------------------------------------
	'isPreview'           => Att_Utils::boolean( false ),
);
