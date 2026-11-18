<?php
/**
 * Beaver Builder integration — the Smart Team module.
 *
 * @package ShapedPlugin\WPTeam
 */

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Base_Page_Builder;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Assets;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Icon;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Template_List;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Saved-template plumbing for the Beaver module.
 *
 * The module itself has to extend `\FLBuilderModule`, so the shared trait is
 * composed into this collaborator instead — same shape as `Divi\Divi_Helper`.
 */
class SPT_Beaver_Helper {
	use Base_Page_Builder;
}

/**
 * Smart Team saved template module.
 *
 * Beaver's own `FLBuilder::register_module()` expects a global class name, so
 * — same as the rest of this plugin's Beaver integration — this class is
 * declared without a namespace.
 */
class SPT_Beaver_Team_Module extends FLBuilderModule {

	/**
	 * Wrapper class the frontend template renders around a saved template.
	 *
	 * @var string
	 */
	const WRAPPER_CLASS = 'sptp-beaver-team-wrapper';

	/**
	 * Saved-template plumbing.
	 *
	 * @var SPT_Beaver_Helper
	 */
	public $helper;

	/**
	 * Define module properties.
	 */
	public function __construct() {
		parent::__construct(
			array(
				'slug'            => 'sptp-beaver-team',
				'name'            => __( 'Smart Team', 'team-free' ),
				'description'     => __( 'Display a Smart Team saved template.', 'team-free' ),
				'category'        => __( 'SP Plugins', 'team-free' ),
				'dir'             => plugin_dir_path( __FILE__ ),
				'url'             => plugin_dir_url( __FILE__ ),
				'icon'            => $this->get_module_icon(),
				'editor_export'   => true,
				'enabled'         => true,
				'partial_refresh' => true,
			)
		);

		$this->helper = new SPT_Beaver_Helper();

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_builder_assets' ) );
	}

	/**
	 * Module icon SVG — Beaver accepts raw markup, so the shared plugin icon
	 * is inlined straight from disk.
	 *
	 * @return string
	 */
	private function get_module_icon() {
		$icon_svg = Builder_Icon::svg();

		return '' !== $icon_svg ? $icon_svg : 'ti-user';
	}

	/**
	 * Load the block frontend bundle inside the Beaver builder editor.
	 *
	 * @return void
	 */
	public function enqueue_builder_assets() {
		if ( ! FLBuilderModel::is_builder_active() ) {
			return;
		}

		Builder_Assets::enqueue();
		Builder_Assets::reinit_script(
			self::WRAPPER_CLASS,
			array( 'fl-builder-preview-render', 'fl-builder-layout-rendered' )
		);
	}
}

/**
 * Beaver Builder integration entry point.
 */
class SPT_Beaver_Builder {

	/**
	 * Register the module with Beaver Builder.
	 *
	 * Hooked below; all registration happens here so `FLBuilder` is
	 * guaranteed to be available.
	 *
	 * @return void
	 */
	public static function register_module() {
		FLBuilder::register_module(
			'SPT_Beaver_Team_Module',
			array(
				'general' => array(
					'title'    => __( 'General', 'team-free' ),
					'sections' => array(
						'content' => array(
							'title'  => __( 'Smart Team', 'team-free' ),
							'fields' => array(
								'template_id' => array(
									'type'    => 'select',
									'label'   => __( 'Saved Template', 'team-free' ),
									'default' => '',
									'options' => Template_List::options( '' ),
									'help'    => __( 'Select a saved team template to display.', 'team-free' ),
								),
							),
						),
					),
				),
			)
		);
	}
}

// Beaver Builder loads modules on its own `init` hook. This file is itself
// required from `Manager::load_beaver()`, an `init`-priority-10 callback, so
// registering here at that same default priority is unreliable — WP_Hook does
// not guarantee a callback appended to the priority bucket it is currently
// iterating will run in that pass. A later priority guarantees WordPress
// still reaches it before `init` finishes firing.
add_action( 'init', array( 'SPT_Beaver_Builder', 'register_module' ), 20 );

