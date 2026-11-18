<?php
/**
 * Enforces the dashboard's per-block and per-module on/off switches on output.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Class Block_Visibility
 */
class Block_Visibility {

	/**
	 * `pre_render_block` filter — short-circuits a switched-off block to ''.
	 *
	 * Runs before the block's own render callback, so a disabled block costs
	 * nothing: no member query, no script or style enqueue. Registration is
	 * untouched, so saved instances stay editable and switching the block back
	 * on takes effect immediately. The `sptp/` check is a cheap first gate —
	 * this runs for every block on the page.
	 *
	 * @param string|null $pre_render   Short-circuit value; non-null skips rendering.
	 * @param array       $parsed_block Parsed block, incl. 'blockName'.
	 * @return string|null
	 */
	public static function filter_pre_render_block( $pre_render, $parsed_block ) {
		$name = isset( $parsed_block['blockName'] ) ? $parsed_block['blockName'] : '';

		if ( ! $name || ( 0 !== strpos( $name, 'sptp/' ) && ! in_array( $name, DashboardHelper::CLASSIC_BLOCKS, true ) ) ) {
			return $pre_render;
		}

		if ( ! DashboardHelper::is_block_enabled( $name ) ) {
			return '';
		}

		// A field block also disappears when the Modules page turned its
		// feature off — same short-circuit, so it costs nothing either.
		$module = DashboardHelper::module_for_block( $name );
		if ( $module && ! DashboardHelper::is_module_enabled( $module ) ) {
			return '';
		}

		return $pre_render;
	}
}
