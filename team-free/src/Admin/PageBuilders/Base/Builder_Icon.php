<?php
/**
 * Shared addon icon for page builder integrations.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single source of the Smart Team addon icon shown in page builders.
 *
 * Every builder wants the same brand mark but accepts a different form of it:
 * Divi reads inline SVG markup, Oxygen renders a URL as an `<img>`, and
 * Elementor/Bricks/WPBakery only accept a CSS class. This class hands each one
 * the form its API expects so no integration re-implements the lookup.
 */
class Builder_Icon {

	/**
	 * Class name used by builders that only accept a CSS class.
	 *
	 * @var string
	 */
	const CSS_CLASS = 'sptp-builder-icon';

	/**
	 * Icon location relative to SPT_PLUGIN_PATH / SPT_PLUGIN_ROOT.
	 *
	 * @var string
	 */
	const RELATIVE = 'src/Admin/PageBuilders/assets/icon.svg';

	/**
	 * Cached inline SVG markup.
	 *
	 * @var string|null
	 */
	private static $svg = null;

	/**
	 * Icon URL, for builders that render the icon as an image.
	 *
	 * @return string
	 */
	public static function url() {
		return SPT_PLUGIN_ROOT . self::RELATIVE;
	}

	/**
	 * Icon filesystem path, for builders that read the file from disk.
	 *
	 * @return string
	 */
	public static function path() {
		return SPT_PLUGIN_PATH . self::RELATIVE;
	}

	/**
	 * Inline SVG markup, for builders that embed the icon directly.
	 *
	 * @return string Empty string when the file cannot be read.
	 */
	public static function svg() {
		if ( null !== self::$svg ) {
			return self::$svg;
		}

		global $wp_filesystem;

		if ( ! $wp_filesystem ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			WP_Filesystem();
		}

		$path      = self::path();
		self::$svg = ( $wp_filesystem && $wp_filesystem->exists( $path ) )
			? trim( (string) $wp_filesystem->get_contents( $path ) )
			: '';

		return self::$svg;
	}

	/**
	 * CSS painting the icon on builders that only accept a class name.
	 *
	 * Two flavours, because the builders hand the class to different kinds of
	 * element:
	 *
	 * - `$sized` true — a font-icon slot, `<i class="…">`, which is
	 *   `display:inline` and therefore has no box for a background to paint on.
	 *   The image goes on a sized `::before` and the host is made
	 *   `inline-block`. Elementor and Bricks both use this shape.
	 * - `$sized` false — an element that already is a sized box with a
	 *   background, so the image goes straight on it. WPBakery's
	 *   `.vc_element-icon` works this way.
	 *
	 * @param string|null $selector Selector to paint. Defaults to the shared class.
	 * @param bool        $sized    Whether the icon lands in a font-icon slot.
	 * @return string
	 */
	public static function css( $selector = null, $sized = true ) {
		if ( empty( $selector ) ) {
			$selector = '.' . self::CSS_CLASS;
		}

		$paint = sprintf(
			'background-image:url("%s");background-repeat:no-repeat;background-position:center;background-size:contain;',
			esc_url( self::url() )
		);

		if ( ! $sized ) {
			return $selector . '{' . $paint . '}';
		}

		return sprintf(
			'%1$s{display:inline-block;width:1em;height:1em;line-height:1;}%1$s::before{content:"";display:block;width:100%%;height:100%%;%2$s}',
			$selector,
			$paint
		);
	}

	/**
	 * `et_builder_module_icons` callback shared by the Divi 4 and Divi 5 modules.
	 *
	 * Divi resolves an `icon_path` entry by reading the file itself; handing it a
	 * ready `icon_svg` instead keeps both Divi versions on one code path. A
	 * module registering this must not also set `$icon_path`, or the file
	 * contents would overwrite the value below.
	 *
	 * @param array        $icons Registered module icons.
	 * @param string|array $slugs Module slug(s) to paint.
	 * @return array
	 */
	public static function divi_module_icons( $icons, $slugs ) {
		if ( ! is_array( $icons ) ) {
			return $icons;
		}

		$svg = self::svg();
		if ( '' === $svg ) {
			return $icons;
		}

		foreach ( (array) $slugs as $slug ) {
			$icons[ $slug ] = array( 'icon_svg' => $svg );
		}

		return $icons;
	}

	/**
	 * Register, fill and enqueue a src-less stylesheet carrying the icon CSS.
	 *
	 * Builders print their element list from their own editor bootstrap, so the
	 * rule has to ride on a handle of our own instead of an inline style added
	 * to a shared handle after `wp_head`.
	 *
	 * @param string      $handle   Stylesheet handle.
	 * @param string|null $selector Selector to paint. Defaults to the shared class.
	 * @param bool        $sized    Whether to emit the `::before` sizing box.
	 * @return void
	 */
	public static function enqueue_css( $handle, $selector = null, $sized = true ) {
		if ( ! wp_style_is( $handle, 'registered' ) ) {
			wp_register_style( $handle, false, array(), SPT_PLUGIN_VERSION );
			wp_add_inline_style( $handle, self::css( $selector, $sized ) );
		}

		wp_enqueue_style( $handle );
	}
}
