<?php
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://shapedplugin.com
 * @package           Smart_Team
 *
 * Plugin Name:       Smart Team
 * Plugin URI:        https://getwpteam.com/
 * Description:       Smart Team (formerly WP Team) is a WordPress plugin to display team members in Carousel, Grid, or List layouts. Customizable with multiple options.
 * Version:           4.0.0
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Author:            ShapedPlugin LLC
 * Author URI:        https://shapedplugin.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       team-free
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once __DIR__ . '/vendor/autoload.php';

/**
 * Currently plugin version.
 */
define( 'SPT_PLUGIN_NAME', 'SmartTeam' );
define( 'SPT_PLUGIN_SLUG', 'team-free' );
define( 'SPT_PLUGIN_FILE', __FILE__ );
define( 'SPT_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'SPT_PLUGIN_VERSION', '4.0.0' );
define( 'SPT_PLUGIN_ROOT', plugin_dir_url( __FILE__ ) );
define( 'SPT_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
// Opt-in diagnostic data reporting — see Admin\Dashboard\Diagnostics.
// Same collector host as Real Testimonials Free (api.shapedplugin.com).
define( 'SPT_SDR_ENDPOINT', 'https://api.shapedplugin.com/wp-json/spda/v1/wp-team-free-collect' );
define( 'SPT_SDR_KEY', '5bc4e4b423e0a26fa6cdd5c79f92a0cf78f3ca' );

if ( ! function_exists( 'activate_wp_team' ) ) {
	/**
	 * The code that runs during plugin activation.
	 * This action is documented in includes/class-wp-team-activator.php
	 */
	function activate_wp_team() {
		require_once plugin_dir_path( __FILE__ ) . 'src/Includes/class-wp-team-activator.php';
		WP_Team_Activator::activate();
	}
}

if ( ! function_exists( 'deactivate_wp_team' ) ) {
	/**
	 * The code that runs during plugin deactivation.
	 * This action is documented in includes/class-wp-team-deactivator.php
	 */
	function deactivate_wp_team() {
		require_once plugin_dir_path( __FILE__ ) . 'src/Includes/class-wp-team-deactivator.php';
		WP_Team_Deactivator::deactivate();
	}
}

register_activation_hook( __FILE__, 'activate_wp_team' );
register_deactivation_hook( __FILE__, 'deactivate_wp_team' );

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    2.0.0
 */
function run_wp_team() {
	$plugin = new ShapedPlugin\WPTeam\Includes\Team();
	$plugin->run();

	if ( is_admin() ) {
		/**
		 * Shared ShapedPlugin BFCM notice. Only one notice renders even when
		 * several ShapedPlugin free plugins are active.
		 */
		require_once SPT_PLUGIN_PATH . 'src/Admin/Helper/shapedplugin-bfcm-notice.php';

		ShapedPlugin_BFCM_Notice_2026::register(
			array(
				'slug'       => 'team-free',
				'name'       => 'Smart Team Pro',
				'image'      => SPT_PLUGIN_ROOT . 'src/Admin/img/offer-banner/bfcm-notice-2026.webp',
				'link'       => 'https://getwpteam.com/pricing/?utm_source=dashboard&utm_medium=wpst_dealbutton&utm_campaign=bfcm26',
				'post_types' => array( 'sptp_member', 'sptp_generator' ),
			)
		);
	}
}

// Don't run if the Premium version is active.
require_once ABSPATH . 'wp-admin/includes/plugin.php';
if ( ! ( is_plugin_active( 'wp-team-pro/wp-team-pro.php' ) || is_plugin_active_for_network( 'wp-team-pro/wp-team-pro.php' ) ) ) {
	run_wp_team();
}

/**
 * Whether Smart Team Pro is active — the block layer's own guard.
 *
 * A second, self-contained check (docs/pro-free-separation.md §2). The block
 * layer lives under this plugin's own existing identity — `ShapedPlugin\
 * WPTeam\Blocks\` and the `SPT_*` constants already defined above — not a
 * separate one invented for it, and not Pro's (`ShapedPlugin\TeamPro\Blocks\`,
 * `SPTP_*`). Free does not share Pro's blocks namespace, so the two plugins'
 * PSR-4 autoloaders can never resolve the same class name to different
 * physical files. The guard below still stands regardless: it is what keeps
 * Free's block system from running content Pro already owns, matching this
 * plugin's block *names* (`sptp/*`) and data layer to Pro's so saved content
 * stays portable either way. This function, its caller below, and every
 * SPT_BLOCKS_* define() and Blocks\Block_Init boot all live inside this one
 * guarded path (CLAUDE.md Rule 4).
 *
 * @return bool
 */
function spt_blocks_is_pro_active() {
	return is_plugin_active( 'wp-team-pro/wp-team-pro.php' )
		|| is_plugin_active_for_network( 'wp-team-pro/wp-team-pro.php' );
}

/**
 * Boots the block layer only — the legacy shortcode/widget/dashboard code
 * above keeps running exactly as before regardless of this function; this
 * only adds two new constants (`SPT_BLOCKS_PATH`, `SPT_BLOCKS_URL`) the
 * legacy bootstrap never needed, reusing every `SPT_PLUGIN_*` constant
 * already defined at the top of this file.
 *
 * @return void
 */
function spt_run_blocks_layer() {
	if ( ! defined( 'SPT_BLOCKS_PATH' ) ) {
		define( 'SPT_BLOCKS_PATH', __DIR__ . '/blocks/' );
		define( 'SPT_BLOCKS_URL', plugins_url( 'blocks', __FILE__ ) . '/' );
	}

	ShapedPlugin\WPTeam\Blocks\Block_Init::instance();
}

if ( ! spt_blocks_is_pro_active() ) {
	add_action( 'plugins_loaded', 'spt_run_blocks_layer' );
}
