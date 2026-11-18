<?php
/**
 * Elementor Builder integration.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Elementor;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Assets;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Icon;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the Smart Team Saved Template widget with Elementor.
 *
 * Called from `Manager::load_elementor()`, which has already confirmed
 * Elementor is active and the integration is enabled.
 */
class Elementor_Builder {

	/**
	 * Wrapper class the widget renders around a saved template.
	 *
	 * @var string
	 */
	const WRAPPER_CLASS = 'sptp-elementor-team-wrapper';

	/**
	 * Wire up the integration.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'elementor/widgets/register', array( __CLASS__, 'register_widget' ) );

		add_action( 'elementor/preview/enqueue_styles', array( __CLASS__, 'enqueue_preview_styles' ) );
		add_action( 'elementor/preview/enqueue_scripts', array( __CLASS__, 'enqueue_preview_scripts' ) );

		add_action( 'elementor/editor/before_enqueue_scripts', array( __CLASS__, 'enqueue_admin_icon' ) );
	}

	/**
	 * Register the widget with Elementor.
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Elementor widgets manager.
	 * @return void
	 */
	public static function register_widget( $widgets_manager ) {
		$widgets_manager->register( new Elementor_Widget() );
	}

	/**
	 * Register the block asset set inside the Elementor preview.
	 *
	 * Elementor consults `Elementor_Widget::get_style_depends()` during its
	 * own early `wp_enqueue_scripts`-time parse of the page, then calls
	 * `wp_enqueue_style( $handle )` on each — which is a no-op unless the
	 * handle is already registered. This is what makes that resolve, the same
	 * way `enqueue_block_assets` would if it were not short-circuited in
	 * admin. The preview iframe is a normal front-end request (never
	 * `is_admin()`), so this is safe to call unconditionally here.
	 *
	 * @return void
	 */
	public static function enqueue_preview_styles() {
		Builder_Assets::enqueue();
	}

	/**
	 * Register the block asset set and the re-init bootstrap in the preview.
	 *
	 * @return void
	 */
	public static function enqueue_preview_scripts() {
		Builder_Assets::enqueue();

		// Re-initialise the block frontend after Elementor re-renders the
		// widget. Elementor has no document-level DOM event for this — its
		// lifecycle hooks (`frontend/element_ready/…`) run through an
		// internal Backbone Radio channel, not `document`/`jQuery(document)`,
		// which is all `reinit_script()`'s bootstrap can bind to — so this
		// passes no event names and relies solely on its MutationObserver
		// fallback.
		Builder_Assets::reinit_script( self::WRAPPER_CLASS );
	}

	/**
	 * Enqueue the widget's admin icon.
	 *
	 * @return void
	 */
	public static function enqueue_admin_icon() {
		Builder_Icon::enqueue_css( 'sptp-elementor-widget-icon' );
	}
}
