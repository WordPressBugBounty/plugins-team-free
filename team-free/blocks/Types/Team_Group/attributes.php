<?php
/**
 * Block-specific attributes for the Team Group container block.
 *
 * CommonAttributes are skipped ($skip_common_attributes) — the container only
 * carries its own id and alignment; everything else belongs to the blocks
 * inside it. Must stay in sync with the JS registerBlockType attributes.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

return array(
	'uniqueId' => Att_Utils::string( '' ),
	'align'    => Att_Utils::string( '' ),
);
