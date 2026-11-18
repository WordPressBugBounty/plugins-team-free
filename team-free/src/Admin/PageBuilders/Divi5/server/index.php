<?php
/**
 * Divi 5 module — server-side registration and render.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Divi5;

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\Module\Module;
use ET\Builder\Packages\Module\Layout\Components\ModuleElements\ModuleElements;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Base_Page_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Smart Team saved template module, Divi 5 server side.
 */
class D5_Smart_Team_Module implements DependencyInterface {
	use Base_Page_Builder;

	/**
	 * Register the module with Divi's module library.
	 *
	 * Called by Divi 5's dependency tree, so registration happens here rather
	 * than on a hook of our own.
	 *
	 * @return void
	 */
	public function load() {
		$module_path = SPT_PLUGIN_PATH . 'dist/divi5/';

		// The source tree is the fallback for a dev checkout where the Divi 5
		// bundle has not been built. `dist/divi5/` is committed and ships, so
		// this branch never applies to a released plugin.
		if ( ! file_exists( $module_path . 'module.json' ) ) {
			$module_path = SPT_PLUGIN_PATH . 'apps/divi-5/src/';
		}

		ModuleRegistration::register_module(
			$module_path,
			array(
				'render_callback' => array( __CLASS__, 'render_callback' ),
			)
		);
	}

	/**
	 * Render the module.
	 *
	 * @param array          $attrs    Module attributes.
	 * @param string         $content  Module content.
	 * @param \WP_Block      $block    Block instance.
	 * @param ModuleElements $elements Module elements instance.
	 * @return string
	 */
	public static function render_callback( $attrs, $content, $block, $elements ) {
		$template_id = absint( $attrs['templateId']['innerContent']['desktop']['value'] ?? 0 );

		Divi5_Builder::enqueue_frontend_assets();

		$inner = sprintf(
			'<div class="et_pb_module_inner %1$s" data-builder-template-id="%2$s">%3$s</div>',
			esc_attr( Divi5_Builder::WRAPPER_CLASS ),
			esc_attr( $template_id ),
			// Markup is assembled by the shared trait, which escapes its own
			// error notices and hands the rest to do_shortcode().
			( new self() )->render_template( $template_id )
		);

		return Module::render(
			array(
				// Frontend-only params.
				'orderIndex'         => $block->parsed_block['orderIndex'] ?? 0,
				'storeInstance'      => $block->parsed_block['storeInstance'] ?? '',

				// Visual builder params.
				'attrs'              => $attrs,
				'elements'           => $elements,
				'id'                 => $block->parsed_block['id'] ?? '',
				'name'               => $block->block_type->name ?? Divi5_Builder::MODULE_NAME,
				'moduleCategory'     => $block->block_type->category ?? 'module',
				'moduleClassName'    => Divi5_Builder::MODULE_CLASS,
				'classnamesFunction' => array( __CLASS__, 'module_classnames' ),
				'children'           => $inner,
			)
		);
	}

	/**
	 * Add the module's own class to Divi's classname set.
	 *
	 * @param array $args Callback arguments.
	 * @return void
	 */
	public static function module_classnames( $args ) {
		$instance = $args['classnamesInstance'] ?? null;

		if ( $instance && method_exists( $instance, 'add' ) ) {
			$instance->add( Divi5_Builder::MODULE_CLASS );
		}
	}
}

( new D5_Smart_Team_Module() )->load();
