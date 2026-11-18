<?php
/**
 * Bricks builder helper.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Bricks;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Base_Page_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Saved-template plumbing for the Bricks element.
 *
 * The element itself has to extend `\Bricks\Element`, so the shared trait is
 * composed into this collaborator instead — same shape as `Divi\Divi_Helper`
 * and `Oxygen\Oxygen_Helper`.
 */
class Bricks_Helper {
	use Base_Page_Builder;
}
