<?php
/**
 * WPBakery Page Builder integration.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\WPBakery;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Assets;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Icon;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Template_List;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the Smart Team element with WPBakery.
 *
 * @return void
 */
function register_element() {
	if ( ! defined( 'WPB_VC_VERSION' ) ) {
		return;
	}

	vc_map(
		array(
			'name'        => esc_html__( 'Smart Team', 'team-free' ),
			'base'        => 'vc_smart_team',
			'description' => esc_html__( 'Display a Smart Team saved template.', 'team-free' ),
			'category'    => esc_html__( 'Smart Team', 'team-free' ),
			'icon'        => Builder_Icon::CSS_CLASS,
			'params'      => array(
				array(
					'type'        => 'dropdown',
					'heading'     => esc_html__( 'Saved Template', 'team-free' ),
					'param_name'  => 'template_id',
					'value'       => get_template_list(),
					'std'         => 'none',
					'description' => esc_html__( 'Select a saved team template to display.', 'team-free' ),
					'save_always' => true,
				),
			),
		)
	);
}

add_action( 'vc_before_init', __NAMESPACE__ . '\register_element' );

/**
 * Templates for WPBakery's label => id dropdown.
 *
 * @return array
 */
function get_template_list() {
	return Template_List::flipped_options( 'none' );
}

/**
 * Shortcode handler for `[vc_smart_team]`.
 *
 * @param array $atts Shortcode attributes.
 * @return string
 */
function render_element( $atts ) {
	$atts = shortcode_atts(
		array(
			'template_id' => '',
		),
		$atts,
		'vc_smart_team'
	);

	$template_id = absint( $atts['template_id'] );

	return sprintf(
		'<div class="%1$s" data-builder-template-id="%2$s">%3$s</div>',
		esc_attr( WPBakery_Builder::WRAPPER_CLASS ),
		esc_attr( $template_id ),
		// Markup is assembled by the shared trait, which escapes its own error
		// notices and hands the rest to do_shortcode().
		( new WPBakery_Helper() )->render_template( $template_id ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	);
}

add_shortcode( 'vc_smart_team', __NAMESPACE__ . '\render_element' );

/**
 * Whether the current request is a WPBakery builder editor context.
 *
 * @return bool
 */
function is_builder_editor() {
	// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Read-only context probe; no state is changed.
	if ( isset( $_GET['vc_editable'] ) || isset( $_GET['vc_preview'] ) ) {
		return true;
	}
	// phpcs:enable WordPress.Security.NonceVerification.Recommended

	return function_exists( 'vc_is_inline' ) && vc_is_inline();
}

/**
 * Load the block frontend bundle for the WPBakery frontend (inline) editor.
 *
 * @return void
 */
function enqueue_builder_assets() {
	if ( ! is_builder_editor() ) {
		return;
	}

	Builder_Assets::enqueue();
	Builder_Assets::reinit_script(
		WPBakery_Builder::WRAPPER_CLASS,
		array( 'vc_js_reload', 'vc_frontend_default_editor_loaded', 'vc_frontend_render' )
	);
}

add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\enqueue_builder_assets' );

/**
 * Register the block frontend bundle for the WPBakery backend editor.
 *
 * `enqueue_block_assets` never fires here — `wp_common_block_scripts_and_styles()`
 * bails in admin — so the handles have to be registered by hand.
 *
 * @return void
 */
function admin_enqueue_builder_assets() {
	if ( ! defined( 'WPB_VC_VERSION' ) ) {
		return;
	}

	$screen = get_current_screen();
	if ( ! $screen || 'post' !== $screen->base ) {
		return;
	}

	Builder_Assets::enqueue();
	enqueue_element_icon();
}

add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\admin_enqueue_builder_assets' );

/**
 * Paint the shared plugin icon on the element in the WPBakery element list.
 *
 * WPBakery only accepts a class name for `icon`, and it already sizes the
 * `.vc_element-icon` box itself, so no `::before` sizing box is emitted.
 *
 * @return void
 */
function enqueue_element_icon() {
	// Compound selector so the rule outranks WPBakery's own `.vc_element-icon` background.
	$selector = sprintf( '.vc_element-icon.%1$s,.%1$s', Builder_Icon::CSS_CLASS );

	Builder_Icon::enqueue_css( 'sptp-wpbakery-element-icon', $selector, false );
}

// The frontend editor builds its element list outside admin_enqueue_scripts.
add_action( 'vc_frontend_editor_enqueue_js_css', __NAMESPACE__ . '\enqueue_element_icon' );

/**
 * WPBakery integration entry point.
 *
 * Every hook above is registered as a side effect of loading this file, so
 * `init()` only has to exist for `Manager::load_wpbakery()` to call — by the
 * time PHP resolves `WPBakery_Builder::init` the autoloader has already
 * required this whole file and the hooks are in place.
 */
class WPBakery_Builder {

	/**
	 * Wrapper class the shortcode renders around a saved template.
	 *
	 * @var string
	 */
	const WRAPPER_CLASS = 'sptp-wpbakery-team-wrapper';

	/**
	 * No-op — present so `Manager::load_wpbakery()` has a symmetrical call
	 * with `Divi_Builder::init()` / `Oxygen_Builder::register()`.
	 *
	 * @return void
	 */
	public static function init() {}
}
