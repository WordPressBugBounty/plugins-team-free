<?php
/**
 * Block-specific attributes for the Filter by Gender block.
 *
 * The full schema is shared with the Filter by Department block (generic
 * `showTerms*` names across every filter child block) — only the label
 * default differs.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

$attributes              = require dirname( __DIR__ ) . '/Filter_By_Department/attributes.php';
$attributes['labelText'] = Att_Utils::string( 'Filter by Gender' );

return $attributes;
