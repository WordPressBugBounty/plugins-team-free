<?php
/**
 * WPBakery builder helper.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\WPBakery;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Base_Page_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Saved-template plumbing for the WPBakery element.
 *
 * WPBakery elements are plain functions rather than a class instance, so the
 * shared trait is composed into this collaborator instead — same shape as
 * `Divi\Divi_Helper` and `Oxygen\Oxygen_Helper`.
 */
class WPBakery_Helper {
	use Base_Page_Builder;
}
