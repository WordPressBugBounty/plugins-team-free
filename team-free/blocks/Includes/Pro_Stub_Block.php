<?php
/**
 * Shared renderer for the Pro-only ajax/filter addon blocks.
 *
 * None of these blocks carry content of their own — they exist only to drive
 * ajax pagination/search/filtering, which is Pro-only. Each stays registered
 * with its real `attributes.php` (Rule 2) so saved Pro content never shows an
 * invalid-block warning, but renders nothing (CLAUDE.md Rule 8; fallback
 * matrix: "Pro addon / field block → registered, renders ''").
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

defined( 'ABSPATH' ) || exit;

/**
 * Class Pro_Stub_Block.
 */
abstract class Pro_Stub_Block extends AbstractBlock {

	/**
	 * Always renders nothing — see the class docblock for why.
	 *
	 * @param array          $attributes Block attributes.
	 * @param string         $content    Inner content.
	 * @param \WP_Block|null $block      Block instance.
	 *
	 * @return string Always an empty string.
	 */
	public function render_block( $attributes, $content = '', $block = null ) {
		return '';
	}
}
