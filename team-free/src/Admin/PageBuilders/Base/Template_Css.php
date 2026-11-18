<?php
/**
 * Saved template CSS emitter for page builders.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Base;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Block_Dynamic_Style;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds the saved template CSS markup for page builder modules.
 *
 * A builder page keeps the template id inside builder-specific data (module
 * meta or a builder shortcode), so the `wp_enqueue_scripts` walk in
 * `Block_Dynamic_Style` never sees it, and a style enqueued while the body
 * renders prints after the markup it styles — or is dropped entirely inside a
 * builder editor. Every builder therefore prints the template CSS right next to
 * its markup, on the frontend as well as in the editor.
 */
class Template_Css {

	/**
	 * Template ids already printed in the current request.
	 *
	 * @var array<int, bool>
	 */
	private static $printed = array();

	/**
	 * Whether the CSS of a template was already printed in this request.
	 *
	 * @param int $template_id Template post id.
	 * @return bool
	 */
	public static function is_printed( $template_id ) {
		return isset( self::$printed[ absint( $template_id ) ] );
	}

	/**
	 * The `<style>` + Google fonts `<link>` markup of a saved template, as
	 * printed by `WP_Styles`.
	 *
	 * Returns an empty string when the template CSS was already printed in the
	 * current request, or when `Block_Dynamic_Style` already put it in the head.
	 *
	 * @param int $template_id Template post id.
	 * @return string
	 */
	public static function get( $template_id ) {
		$template_id = absint( $template_id );
		if ( ! $template_id || self::is_printed( $template_id ) ) {
			return '';
		}

		self::$printed[ $template_id ] = true;

		list( $css, $fonts ) = Block_Dynamic_Style::instance()->saved_template_css( $template_id );

		$handles = array();

		// Settings → Performance → Google Fonts off means no request to Google.
		if ( ! empty( $fonts ) && Block_Dynamic_Style::google_fonts_enabled() ) {
			$font_handle = 'sptp-google-fonts-' . $template_id;
			wp_register_style( $font_handle, 'https://fonts.googleapis.com/css?family=' . implode( '|', $fonts ) . '&display=swap', array(), SPT_PLUGIN_VERSION );
			$handles[] = $font_handle;
		}

		if ( '' !== $css ) {
			// Src-less handle: WordPress prints the inline CSS as a `<style>` tag.
			// The CSS is machine-generated from block attributes; stripping tags
			// keeps it from closing the tag it rides in.
			$css_handle = 'sptp-css-' . $template_id;
			wp_register_style( $css_handle, false, array(), SPT_PLUGIN_VERSION );
			wp_add_inline_style( $css_handle, wp_strip_all_tags( $css ) );
			$handles[] = $css_handle;
		}

		if ( empty( $handles ) ) {
			return '';
		}

		// Printed through the style API but captured, so the tags land next to
		// the module markup — builders render past `wp_head` and over ajax/REST.
		ob_start();
		wp_styles()->do_items( $handles );

		return (string) ob_get_clean();
	}
}
