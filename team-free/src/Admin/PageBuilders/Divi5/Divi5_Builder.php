<?php
/**
 * Divi 5 builder integration.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Divi5;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Assets;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Icon;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Divi\Divi_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Divi 5 integration entry point.
 *
 * The module itself registers server-side through `server/index.php`, which
 * `Manager` loads on early `init` so it is in place before Divi resolves its
 * module dependency tree. This class only wires the assets around it.
 */
class Divi5_Builder {

	/**
	 * Divi 5 module name, matching module.json's `name`.
	 *
	 * Class constants rather than namespace ones so a reference from the server
	 * module autoloads this file instead of hitting an undefined constant.
	 *
	 * @var string
	 */
	const MODULE_NAME = 'sptp/divi5-team';

	/**
	 * Module CSS class Divi builds its selectors from.
	 *
	 * @var string
	 */
	const MODULE_CLASS = 'sptp_divi5_team';

	/**
	 * Wrapper class the module renders around a saved template.
	 *
	 * @var string
	 */
	const WRAPPER_CLASS = 'sptp-divi5-team-wrapper';

	/**
	 * Hook the integration up.
	 *
	 * @return void
	 */
	public static function init() {
		add_filter( 'et_builder_module_icons', array( __CLASS__, 'register_module_icon' ) );
		add_action( 'divi_visual_builder_assets_before_enqueue_scripts', array( __CLASS__, 'enqueue_visual_builder_assets' ) );
	}

	/**
	 * Register the plugin icon on Divi's legacy icon array.
	 *
	 * **This does not paint the Divi 5 module list.** `et_builder_module_icons`
	 * is read by `ET_Builder_Element::get_module_icons()`, a Divi 4 API keyed by
	 * `ET_Builder_Element` subclass slugs; a module registered through
	 * `ModuleRegistration::register_module()` never creates one, and the D5
	 * module library is a React store that never reads that array. The D5 icon
	 * travels module.json's `moduleIcon` name → the `divi.iconLibrary.icon.map`
	 * JS registry instead, both shipped in the bundle.
	 *
	 * Kept because Divi 4 rendering surfaces can still resolve the `d4Shortcode`
	 * slug on a Divi 5 site, and painting a slug that is never looked up costs
	 * nothing.
	 *
	 * @param array $icons Registered module icons.
	 * @return array
	 */
	public static function register_module_icon( $icons ) {
		return Builder_Icon::divi_module_icons(
			$icons,
			array( self::MODULE_NAME, Divi_Builder::MODULE_SLUG )
		);
	}

	/**
	 * Load the React module build and the block frontend bundle in the builder.
	 *
	 * @return void
	 */
	public static function enqueue_visual_builder_assets() {
		if ( ! function_exists( 'et_core_is_fb_enabled' ) || ! et_core_is_fb_enabled() ) {
			return;
		}

		if ( class_exists( '\ET\Builder\VisualBuilder\Assets\PackageBuildManager' ) ) {
			\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
				array(
					'name'    => 'sptp-divi5-team-visual-builder',
					'version' => SPT_PLUGIN_VERSION,
					'script'  => array(
						'src'                => SPT_PLUGIN_ROOT . 'dist/divi5/sptp-divi5-team.js',
						'deps'               => array( 'react', 'jquery', 'divi-module-library', 'wp-hooks', 'divi-rest' ),
						'enqueue_app_window' => true,
					),
				)
			);
		}

		Builder_Assets::enqueue();
		Builder_Assets::reinit_script(
			self::WRAPPER_CLASS,
			array( 'divi:module:updated', 'divi:ajax:render:success', 'divi:builder:save' )
		);
	}

	/**
	 * Load the block frontend bundle where a module renders on a published page.
	 *
	 * Called from the module's render callback rather than on
	 * `wp_enqueue_scripts`, so a Divi 5 page without the module loads nothing.
	 * The builder path enqueues its own, so this only covers the front end.
	 *
	 * @return void
	 */
	public static function enqueue_frontend_assets() {
		if ( function_exists( 'et_core_is_fb_enabled' ) && et_core_is_fb_enabled() ) {
			return;
		}

		Builder_Assets::enqueue();
	}
}
