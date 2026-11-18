<?php
/**
 * Shared block asset loader for page builder integrations.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Base;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Block_Dynamic_Style;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single source of the block assets a saved template needs inside a builder.
 *
 * A saved template is block content, so it needs the block frontend bundle.
 * Builders cannot rely on `AssetManager::register_frontend_assets()` for it:
 * that bails on `is_admin()`, which is exactly where Divi's Backend Builder
 * renders. Every integration therefore registers the set itself, through this
 * class so the handle/source map lives in one place. Sources are identical to
 * AssetManager's, so a duplicate registration is a harmless no-op.
 */
class Builder_Assets {

	/**
	 * Whether the frontend script was localized in this request.
	 *
	 * @var bool
	 */
	private static $localized = false;

	/**
	 * Whether the dashboard Additional CSS & JS was attached in this request.
	 *
	 * @var bool
	 */
	private static $custom_attached = false;

	/**
	 * Scripts a saved template needs, in dependency order.
	 *
	 * The frontend script depends on Swiper here even though AssetManager
	 * registers the two independently — outside a builder `Carousel::render_block()`
	 * enqueues Swiper before the runtime looks for it, but a builder re-render
	 * has no such ordering.
	 *
	 * @return array<string, array{0:string,1:array<int,string>}> Handle => array( src, deps ).
	 */
	private static function scripts() {
		return array(
			'sptp-swiper'          => array( SPT_PLUGIN_ROOT . 'src/Frontend/js/swiper.min.js', array() ),
			'sptp-blocks-frontend' => array( SPT_BLOCKS_URL . 'assets/js/script.min.js', array( 'sptp-swiper' ) ),
		);
	}

	/**
	 * Styles a saved template needs, in enqueue order.
	 *
	 * This must cover every handle the layout blocks declare in their `$styles`
	 * — outside a builder WP core enqueues those when the block renders, but in
	 * an admin-side builder `wp_common_block_scripts_and_styles()` short-circuits
	 * `enqueue_block_assets`, and in a visual builder the module re-renders over
	 * ajax where an enqueue is dropped outright. Miss one and the template
	 * renders unstyled: leaving out the two icon fonts, for instance, shows every
	 * social and contact glyph as tofu.
	 *
	 * The icon fonts are also registered by `AssetManager::register_block_editor_assets()`,
	 * whose sources these mirror; a duplicate registration is a harmless no-op.
	 *
	 * @return array<string, string> Handle => src.
	 */
	private static function styles() {
		return array(
			'sptp-swiper'         => SPT_PLUGIN_ROOT . 'src/Frontend/css/swiper.min.css',
			'sptp-blocks-style'   => SPT_PLUGIN_ROOT . 'dist/editor/style-index.css',
			'sp_team_fontawesome' => SPT_PLUGIN_ROOT . 'src/Frontend/css/font-awesome.min.css',
			'sp_team_fontello'    => SPT_PLUGIN_ROOT . 'src/Admin/css/fontello.min.css',
		);
	}

	/**
	 * The handle/source map, for assertions.
	 *
	 * @return array With `scripts` and `styles` keys.
	 */
	public static function manifest() {
		return array(
			'scripts' => self::scripts(),
			'styles'  => self::styles(),
		);
	}

	/**
	 * Register every handle that is not registered yet.
	 *
	 * Safe to call from any enqueue hook and any number of times.
	 *
	 * @return void
	 */
	public static function register() {
		foreach ( self::scripts() as $handle => $script ) {
			if ( ! wp_script_is( $handle, 'registered' ) ) {
				wp_register_script( $handle, $script[0], $script[1], SPT_PLUGIN_VERSION, true );
			}
		}

		foreach ( self::styles() as $handle => $src ) {
			if ( ! wp_style_is( $handle, 'registered' ) ) {
				wp_register_style( $handle, $src, array(), SPT_PLUGIN_VERSION, 'all' );
				continue;
			}

			// Block_Dynamic_Style registers `sptp-blocks-style` src-less when it
			// only needs somewhere to hang inline CSS, so an existing handle is
			// not proof the stylesheet itself will load. Point it at the real
			// file, keeping any inline CSS already attached to it.
			$registered = wp_styles()->query( $handle, 'registered' );
			if ( $registered && ! $registered->src ) {
				$registered->src = $src;
				$registered->ver = SPT_PLUGIN_VERSION;
			}
		}

		self::localize();
		self::custom_assets();
	}

	/**
	 * Register and enqueue the whole set.
	 *
	 * @return void
	 */
	public static function enqueue() {
		self::register();

		foreach ( array_keys( self::scripts() ) as $handle ) {
			wp_enqueue_script( $handle );
		}

		foreach ( array_keys( self::styles() ) as $handle ) {
			wp_enqueue_style( $handle );
		}
	}

	/**
	 * Give the frontend script the ajax url and nonce it needs.
	 *
	 * Without this Ajax Pagination is dead inside a builder, because registering
	 * `sptp-blocks-frontend` here pre-empts AssetManager's localization.
	 *
	 * @return void
	 */
	private static function localize() {
		if ( self::$localized ) {
			return;
		}

		self::$localized = true;

		wp_localize_script(
			'sptp-blocks-frontend',
			'sptp_localize_data',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'sptp_block_nonce' ),
			)
		);
	}

	/**
	 * Attach the dashboard's Additional CSS & JS.
	 *
	 * `Block_Dynamic_Style` does this on `wp_enqueue_scripts`, which never fires
	 * in an admin-side builder editor.
	 *
	 * @return void
	 */
	private static function custom_assets() {
		if ( self::$custom_attached || ! is_admin() ) {
			return;
		}

		self::$custom_attached = true;

		Block_Dynamic_Style::instance()->enqueue_global_custom_code();
	}

	/**
	 * Inline bootstrap that re-runs the block frontend init after a re-render.
	 *
	 * Builders swap module markup in over ajax with no page load, so swiper and
	 * Ajax Pagination have to be re-initialised. Each builder
	 * passes its own wrapper class and event names; the MutationObserver is the
	 * fallback for builders that fire nothing useful. Written without jQuery
	 * because `sptp-blocks-frontend` does not depend on it and a builder editor
	 * is not guaranteed to load it.
	 *
	 * @param string             $wrapper_class Wrapper class the builder renders around the template.
	 * @param array<int, string> $events        Document events that signal a re-render.
	 * @return void
	 */
	public static function reinit_script( $wrapper_class, array $events = array() ) {
		self::register();

		$script = sprintf(
			'(function(){
	var target = %1$s;
	var events = %2$s;
	function reinit(){
		if ( typeof window.sptpTeamInit === "function" ) {
			window.sptpTeamInit();
		}
	}
	events.forEach( function( name ){ document.addEventListener( name, reinit ); } );
	if ( window.jQuery ) {
		events.forEach( function( name ){ window.jQuery( document ).on( name, reinit ); } );
	}
	function matches( node ){
		if ( node.nodeType !== 1 ) { return false; }
		return node.classList.contains( target ) || !! node.querySelector( "." + target );
	}
	var observer = new MutationObserver( function( mutations ){
		for ( var m = 0; m < mutations.length; m++ ) {
			var nodes = mutations[ m ].addedNodes;
			for ( var i = 0; i < nodes.length; i++ ) {
				if ( matches( nodes[ i ] ) ) {
					reinit();
					return;
				}
			}
		}
	} );
	function observe(){
		if ( document.body ) {
			observer.observe( document.body, { childList: true, subtree: true } );
		}
	}
	if ( "loading" === document.readyState ) {
		document.addEventListener( "DOMContentLoaded", observe );
	} else {
		observe();
	}
})();',
			wp_json_encode( $wrapper_class ),
			wp_json_encode( array_values( $events ) )
		);

		wp_add_inline_script( 'sptp-blocks-frontend', $script );
	}
}
