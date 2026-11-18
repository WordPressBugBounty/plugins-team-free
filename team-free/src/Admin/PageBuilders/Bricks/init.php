<?php
/**
 * Bricks Builder — registration.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Bricks;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Icon;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Bricks Builder integration entry point.
 */
class Bricks_Builder {

	/**
	 * Register the element with Bricks.
	 *
	 * Called from `Manager::load_bricks()`, which has already confirmed
	 * Bricks is active and the integration is enabled.
	 *
	 * @return void
	 */
	public static function register() {
		// Bricks requires the element file by path and resolves the class from
		// it directly, rather than autoloading — `Bricks_Builder.php` therefore
		// has to be loadable standalone, which is why it declares the element
		// class at file scope instead of inside a function guarded by
		// `class_exists( '\Bricks\Element' )` the way Divi/Oxygen do.
		\Bricks\Elements::register_element(
			__DIR__ . '/Bricks_Builder.php',
			'sptp-bricks-team',
			__NAMESPACE__ . '\SPT_Bricks_Team_Element'
		);

		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_element_icon' ) );
	}

	/**
	 * Paint the shared plugin icon on the element in the Bricks builder panel.
	 *
	 * Bricks only accepts a class name for `$icon`, so the icon itself is
	 * delivered as CSS loaded in the builder window.
	 *
	 * @return void
	 */
	public static function enqueue_element_icon() {
		if ( ! function_exists( 'bricks_is_builder_main' ) || ! bricks_is_builder_main() ) {
			return;
		}

		Builder_Icon::enqueue_css( 'sptp-bricks-element-icon' );
	}
}
