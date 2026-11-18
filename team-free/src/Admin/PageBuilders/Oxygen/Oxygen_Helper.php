<?php
/**
 * Oxygen builder helper.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Oxygen;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Base_Page_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Saved-template plumbing for the Oxygen element.
 *
 * The element itself has to extend `OxyEl`, so the shared trait is composed
 * into this collaborator instead — same shape as `Divi\Divi_Helper`.
 */
class Oxygen_Helper {
	use Base_Page_Builder;
}
