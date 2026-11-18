<?php
/**
 * Page builder integration manager.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Divi\Divi_Builder;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Divi5\Divi5_Builder;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Elementor\Elementor_Builder;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Oxygen\Oxygen_Builder;
use ShapedPlugin\WPTeam\Admin\PageBuilders\WPBakery\WPBakery_Builder;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Bricks\Bricks_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads a page builder integration when its builder is active and its
 * Settings > Integrations toggle is on.
 *
 * A port of Smart Team Pro's manager: the same widget/module names and the
 * same `template_id` field, so a page built with either plugin keeps rendering
 * after a switch to the other. Every module renders a Saved Template.
 *
 * The legacy Elementor shortcode widgets stay wired in `Team.php`, outside the
 * toggle, so existing Elementor pages built on them are never emptied by it.
 */
class Manager {

	/**
	 * Builder key => is-active probe.
	 *
	 * @param string $builder Builder key.
	 * @return bool
	 */
	private static function is_builder_active( $builder ) {
		switch ( $builder ) {
			case 'divi':
				return defined( 'ET_BUILDER_VERSION' ) || class_exists( 'ET_Builder_Module' );
			case 'elementor':
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
				return is_plugin_active( 'elementor/elementor.php' ) || is_plugin_active_for_network( 'elementor/elementor.php' );
			case 'wpbakery':
				return defined( 'WPB_VC_VERSION' );
			case 'beaver':
				return class_exists( 'FLBuilder' );
			case 'bricks':
				return defined( 'BRICKS_VERSION' );
			case 'oxygen':
				return defined( 'CT_VERSION' ) || class_exists( 'OxyEl' );
			default:
				return false;
		}
	}

	/**
	 * Whether an integration is enabled in Settings > Integrations.
	 *
	 * @param string $builder Builder key.
	 * @return bool Defaults to enabled when it was never saved.
	 */
	public static function is_integration_enabled( $builder ) {
		return DashboardHelper::is_integration_enabled( $builder );
	}

	/**
	 * Whether Divi 5 (as opposed to Divi 4) is the running builder.
	 *
	 * @return bool
	 */
	public static function is_divi_5() {
		if ( function_exists( 'et_builder_d5_enabled' ) && et_builder_d5_enabled() ) {
			return true;
		}

		if ( defined( 'ET_BUILDER_VERSION' ) ) {
			return version_compare( ET_BUILDER_VERSION, '5.0', '>=' );
		}

		return false;
	}

	/**
	 * Whether the Divi theme or the Divi Builder plugin is installed and running.
	 *
	 * `ET_BUILDER_VERSION` is defined late, so the theme lookup is what makes
	 * this usable from early `init` — where the Divi 5 module has to register.
	 *
	 * @return bool
	 */
	private static function is_divi_present() {
		if ( defined( 'ET_BUILDER_VERSION' ) ) {
			return true;
		}

		$theme = wp_get_theme();

		return in_array( $theme->get( 'Name' ), array( 'Divi', 'Extra' ), true )
			|| in_array( $theme->get_template(), array( 'Divi', 'Extra' ), true );
	}

	/**
	 * Wire up the integrations.
	 *
	 * @return void
	 */
	public static function init() {
		// Divi 5 resolves its module dependency tree on `init`, so the server
		// module has to be in place before that — earlier than the version
		// checks below can run, hence the separate early hook.
		add_action( 'init', array( __CLASS__, 'load_divi5_server_module' ), 5 );

		// Registered separately from the server module so the visual builder's
		// template picker still works if module registration ever fails.
		add_action( 'rest_api_init', array( __CLASS__, 'load_divi5_rest_api' ) );

		// Divi itself boots on `init`, so its own version is only knowable here.
		add_action( 'init', array( __CLASS__, 'load_divi' ), 20 );

		// Oxygen's element base class exists as soon as the plugin loads, so
		// this only needs one tick past the default priority.
		add_action( 'init', array( __CLASS__, 'load_oxygen' ), 11 );

		// WPBakery and Beaver are only knowable to be active once their own
		// plugin has loaded, which is after this runs — so both wait for `init`.
		add_action( 'init', array( __CLASS__, 'load_wpbakery' ) );
		add_action( 'init', array( __CLASS__, 'load_beaver' ) );

		// Priority 11 so Bricks itself has already finished loading.
		add_action( 'init', array( __CLASS__, 'load_bricks' ), 11 );

		// Elementor fires `elementor/init` on `init` priority 0, so the widget
		// registration hook must already be attached before `init` runs at all.
		self::load_elementor();
	}

	/**
	 * Load the Divi integration matching the running Divi major version.
	 *
	 * @return void
	 */
	public static function load_divi() {
		if ( ! self::is_builder_active( 'divi' ) || ! self::is_integration_enabled( 'divi' ) ) {
			return;
		}

		if ( self::is_divi_5() ) {
			Divi5_Builder::init();
			return;
		}

		Divi_Builder::init();
	}

	/**
	 * Load the Divi 5 server-side module.
	 *
	 * @return void
	 */
	public static function load_divi5_server_module() {
		if ( ! self::is_divi_present() || ! self::is_divi_5() || ! self::is_integration_enabled( 'divi' ) ) {
			return;
		}

		// The module class implements this interface; without it the file
		// would fatal at parse time.
		if ( ! interface_exists( '\ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface' ) ) {
			return;
		}

		require_once __DIR__ . '/Divi5/server/index.php';
	}

	/**
	 * Register the Divi 5 REST routes.
	 *
	 * @return void
	 */
	public static function load_divi5_rest_api() {
		if ( ! self::is_divi_present() || ! self::is_integration_enabled( 'divi' ) ) {
			return;
		}

		require_once __DIR__ . '/Divi5/server/rest-api.php';

		Divi5\register_rest_routes();
	}

	/**
	 * Load the Oxygen Builder integration.
	 *
	 * @return void
	 */
	public static function load_oxygen() {
		if ( ! self::is_builder_active( 'oxygen' ) || ! self::is_integration_enabled( 'oxygen' ) ) {
			return;
		}

		Oxygen_Builder::register();
	}

	/**
	 * Load the WPBakery integration.
	 *
	 * `WPBakery_Builder.php` registers its own hooks as a side effect of being
	 * loaded, so requiring it is the whole job.
	 *
	 * @return void
	 */
	public static function load_wpbakery() {
		if ( ! self::is_builder_active( 'wpbakery' ) || ! self::is_integration_enabled( 'wpbakery' ) ) {
			return;
		}

		require_once __DIR__ . '/WPBakery/WPBakery_Helper.php';
		require_once __DIR__ . '/WPBakery/WPBakery_Builder.php';

		WPBakery_Builder::init();
	}

	/**
	 * Load the Beaver Builder integration.
	 *
	 * @return void
	 */
	public static function load_beaver() {
		if ( ! self::is_builder_active( 'beaver' ) || ! self::is_integration_enabled( 'beaver' ) ) {
			return;
		}

		require_once __DIR__ . '/Beaver/Beaver_Builder.php';
	}

	/**
	 * Load the Bricks Builder integration.
	 *
	 * @return void
	 */
	public static function load_bricks() {
		if ( ! self::is_builder_active( 'bricks' ) || ! self::is_integration_enabled( 'bricks' ) ) {
			return;
		}

		require_once __DIR__ . '/Bricks/Bricks_Helper.php';
		require_once __DIR__ . '/Bricks/Bricks_Builder.php';
		require_once __DIR__ . '/Bricks/init.php';

		Bricks_Builder::register();
	}

	/**
	 * Load the Elementor Saved Template widget.
	 *
	 * @return void
	 */
	public static function load_elementor() {
		if ( ! self::is_builder_active( 'elementor' ) || ! self::is_integration_enabled( 'elementor' ) ) {
			return;
		}

		Elementor_Builder::init();
	}
}
