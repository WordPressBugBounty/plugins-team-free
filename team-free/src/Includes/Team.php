<?php
/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      2.0.0
 * @package   WP_Team
 * @subpackage WP_Team/Includes
 * @author     ShapedPlugin <support@shapedplugin.com>
 */

namespace ShapedPlugin\WPTeam\Includes;

use ShapedPlugin\WPTeam\Admin\Admin;
use ShapedPlugin\WPTeam\Admin\Post_Type_Caps;
use ShapedPlugin\WPTeam\Frontend\Frontend;
use ShapedPlugin\WPTeam\Includes\Loader;
use ShapedPlugin\WPTeam\Includes\WP_Team_i18n;
use ShapedPlugin\WPTeam\Admin\Team_Import_Export;
use ShapedPlugin\WPTeam\Admin\Taxonomies\Taxonomies;
use ShapedPlugin\WPTeam\Admin\WP_Team_Gutenberg_Block;
use ShapedPlugin\WPTeam\Admin\HelpPage\Help;
use ShapedPlugin\WPTeam\Admin\Dashboard\Dashboard;
use ShapedPlugin\WPTeam\Admin\Dashboard\Diagnostics;
use ShapedPlugin\WPTeam\Admin\Dashboard\ManageAPI;
use ShapedPlugin\WPTeam\Admin\Dashboard\Placements;
use ShapedPlugin\WPTeam\Admin\Dashboard\SavedTemplates;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Manager as PageBuilderManager;
use ShapedPlugin\WPTeam\Admin\Helper\Admin_Notices;
use ShapedPlugin\WPTeam\Admin\Team_Element_Shortcode_Block;
use ShapedPlugin\WPTeam\Admin\Team_Element_Shortcode_Block_Deprecated;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The Main file class of the plugin.
 */
class Team {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    2.0.0
	 * @access   protected
	 * @var      Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    2.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    2.0.0
	 * @access   protected
	 * @var      string    $version    The current version of the plugin.
	 */
	protected $version;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    2.0.0
	 */
	public function __construct() {
		$this->load_dependencies();
		$this->define_admin_hooks();
		$this->define_public_hooks();
		$active_plugins = get_option( 'active_plugins' );
		foreach ( $active_plugins as $active_plugin ) {
			$_temp = strpos( $active_plugin, 'team-free.php' );
			if ( false != $_temp ) {
				add_filter( 'plugin_action_links_' . $active_plugin, array( $this, 'add_generator_links' ) );
			}
		}
		add_filter( 'plugin_row_meta', array( $this, 'plugin_row_meta' ), 10, 2 );
		add_theme_support( 'post-thumbnails' );
	}

	/**
	 * Create team link at plugins bottom.
	 *
	 * @since 2.0.0
	 * @param string $links links probived by WordPress.
	 */
	public function add_generator_links( $links ) {
		$create_url = $this->block_editor_is_available()
			? admin_url( 'post-new.php?post_type=page&sptpblock_inserter=true' )
			: admin_url( 'post-new.php?post_type=sptp_generator' );

		$mylinks = array(
			'<a href="' . esc_url( $create_url ) . '">' . esc_html__( 'Create Team', 'team-free' ) . '</a>',
		);

		$links['go_pro'] = '<a target="_blank" rel="noopener noreferrer" href="https://getwpteam.com/pricing/" style="color: #35b747; font-weight: 700;">' . esc_html__( 'Go Pro!', 'team-free' ) . '</a>';
		return array_merge( $mylinks, $links );
	}

	/**
	 * Whether a new page would open in the block editor with the Smart Team blocks registered.
	 *
	 * @since 4.0.0
	 * @return bool
	 */
	private function block_editor_is_available() {
		if ( ! file_exists( SPT_PLUGIN_PATH . 'dist/editor/index.asset.php' ) ) {
			return false;
		}

		if ( ! function_exists( 'use_block_editor_for_post_type' ) ) {
			require_once ABSPATH . 'wp-admin/includes/post.php';
		}

		return use_block_editor_for_post_type( 'page' );
	}

	/**
	 * Adds the Live Demo and Docs & Video Tutorials links to the plugin row meta.
	 *
	 * @since 4.0.0
	 * @param array  $plugin_meta The plugin's row meta links.
	 * @param string $plugin_file Plugin file path relative to the plugins directory.
	 * @return array
	 */
	public function plugin_row_meta( $plugin_meta, $plugin_file ) {
		if ( SPT_PLUGIN_BASENAME !== $plugin_file ) {
			return $plugin_meta;
		}

		$plugin_meta['live_demo'] = '<a href="https://getwpteam.com/patterns/" target="_blank" rel="noopener noreferrer">' . esc_html__( 'Live Demo', 'team-free' ) . '</a>';
		$plugin_meta['docs']      = '<a href="https://docs.getwpteam.com/guide/introduction" target="_blank" rel="noopener noreferrer">' . esc_html__( 'Docs & Video Tutorials', 'team-free' ) . '</a>';

		return $plugin_meta;
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Team_Pro_Loader. Orchestrates the hooks of the plugin.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    2.0
	 * @access   private
	 */
	private function load_dependencies() {
		$this->loader = new Loader();
	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    2.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {

		$plugin_admin = new Admin( SPT_PLUGIN_SLUG, SPT_PLUGIN_VERSION );
		$taxonomies   = new Taxonomies();
		// Help Page.
		Help::instance();
		// React dashboard (Getting Started).
		( new Dashboard() )->register();
		// Opt-in diagnostic data: nothing is sent until an admin accepts.
		( new Diagnostics() )->register();
		( new ManageAPI() )->register();
		// Dashboard placements table: dates widget saves (widgets carry no date of their own).
		Placements::register_hooks();
		// Saved Templates: hidden CPT + shortcode. Not is_admin()-gated — the shortcode runs on the front end.
		( new SavedTemplates() )->register();
		// Page builder integrations (Settings → Integrations): each renders a Saved Template.
		PageBuilderManager::init();
		$admin_notices = new Admin_Notices( SPT_PLUGIN_SLUG, SPT_PLUGIN_VERSION );

		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_print_scripts', $plugin_admin, 'enqueue_scripts' );

		// Members and generators answer to their own capabilities, granted here.
		( new Post_Type_Caps() )->register();
		$this->loader->add_action( 'init', $plugin_admin, 'sptp_member_post_type' );
		// A fresh install has no rule for /team/<name>/ until the rules are flushed.
		$this->loader->add_action( 'wp_loaded', $plugin_admin, 'maybe_flush_member_rewrite_rules' );
		$this->loader->add_filter( 'use_block_editor_for_post_type', $plugin_admin, 'use_block_editor_for_member', 10, 2 );
		$this->loader->add_action( 'init', $plugin_admin, 'sptp_generator_post_type' );
		// Department and Designation, as in Pro.
		$this->loader->add_action( 'init', $taxonomies, 'register_taxonomies' );
		// Their terms answer to their own capabilities too, granted here.
		$this->loader->add_filter( 'user_has_cap', $taxonomies, 'grant_term_capabilities' );
		$this->loader->add_action( 'admin_menu', $taxonomies, 'relabel_menu', 1000 );
		$this->loader->add_action( 'admin_menu', $taxonomies, 'place_taxonomies_before_manage_team', 1000 );
		$this->loader->add_action( 'admin_menu', $taxonomies, 'highlight_department_submenu' );
		// Location / Language / Gender are Pro's: locked placeholder screens.
		$this->loader->add_action( 'init', $taxonomies, 'register_placeholders' );
		$this->loader->add_action( 'load-edit-tags.php', $taxonomies, 'lock_placeholder_screen' );
		$this->loader->add_action( 'add_meta_boxes_sptp_member', $taxonomies, 'label_placeholder_boxes', 99 );
		$this->loader->add_action( 'admin_head-post.php', $plugin_admin, 'hide_publishing_actions' );
		$this->loader->add_action( 'admin_head-post-new.php', $plugin_admin, 'hide_publishing_actions' );
		$this->loader->add_action( 'manage_sptp_member_posts_custom_column', $plugin_admin, 'get_member_columns', 10, 2 );
		$this->loader->add_action( 'manage_sptp_generator_posts_custom_column', $plugin_admin, 'get_generator_columns', 10, 2 );

		$this->loader->add_action( 'widgets_init', $plugin_admin, 'register_wpteam_widget' );
		$this->loader->add_action( 'activated_plugin', $plugin_admin, 'redirect_to_help', 10, 2 );

		$this->loader->add_filter( 'manage_sptp_member_posts_columns', $plugin_admin, 'set_member_columns' );
		$this->loader->add_filter( 'manage_sptp_generator_posts_columns', $plugin_admin, 'set_generator_columns' );
		$this->loader->add_filter( 'enter_title_here', $plugin_admin, 'member_name' );
		$this->loader->add_filter( 'admin_footer_text', $plugin_admin, 'sptp_review_text', 10, 2 );
		$this->loader->add_filter( 'update_footer', $plugin_admin, 'sptp_version_text', 11 );
		$this->loader->add_action( 'admin_head', $plugin_admin, 'sptp_footer_css' );
		$this->loader->add_filter( 'post_updated_messages', $plugin_admin, 'sptp_update', 10, 1 );

		// Export import.
		$import_export = new Team_Import_Export( SPT_PLUGIN_NAME, SPT_PLUGIN_VERSION );

		$this->loader->add_action( 'wp_ajax_SPT_export_shortcodes', $import_export, 'export_shortcodes' );
		$this->loader->add_action( 'wp_ajax_SPT_import_shortcodes', $import_export, 'import_shortcodes' );

		// Taxonomies admin menu.
		$this->loader->add_action( 'admin_notices', $admin_notices, 'taxonomies_admin_menu' );

		// Review notice for the plugin.
		$this->loader->add_action( 'admin_notices', $admin_notices, 'display_admin_review_notice' );
		$this->loader->add_action( 'wp_ajax_sp-wpt-never-show-review-notice', $admin_notices, 'dismiss_review_notice' );

		// Gutenberg block.
		if ( version_compare( $GLOBALS['wp_version'], '5.3', '>=' ) ) {
			new WP_Team_Gutenberg_Block();
		}

		// Elementor shortcode block.
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		if ( ( is_plugin_active( 'elementor/elementor.php' ) || is_plugin_active_for_network( 'elementor/elementor.php' ) ) ) {
			new Team_Element_Shortcode_Block();
			new Team_Element_Shortcode_Block_Deprecated();
		}
	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    2.0.0
	 * @access   private
	 */
	private function define_public_hooks() {

		$plugin_public = new Frontend( $this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles', 120 );
		$this->loader->add_action( 'wp_loaded', $plugin_public, 'register_all_scripts' );
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    2.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     2.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     2.0.0
	 * @return    Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     2.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}
}
