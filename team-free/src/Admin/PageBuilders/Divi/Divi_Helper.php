<?php
/**
 * Divi builder helper.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Divi;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Base_Page_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Saved-template plumbing for the Divi 4 module.
 *
 * The module itself has to extend `ET_Builder_Module`, so the shared trait is
 * composed into this collaborator instead.
 */
class Divi_Helper {
	use Base_Page_Builder;
}
