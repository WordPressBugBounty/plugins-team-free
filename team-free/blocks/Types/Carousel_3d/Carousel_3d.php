<?php
/**
 * 3D Carousel block — Pro-only, fallback shim.
 *
 * The 3D / panorama carousel and its overlay cards are a Pro feature (CLAUDE.md Rule 8: no
 * Pro feature logic ships in Free). The block stays registered with its real
 * `attributes.php` (Rule 2) so a page built in Pro never shows an invalid-block
 * warning once Pro is removed, but its renderer simply falls back to Carousel's (a plain Swiper carousel of
 * free cards — the overlay-N design normalizes to card-1 in Pro_Gate) —
 * see docs/pro-free-separation.md §4 fallback matrix ("renders through its
 * free stand-in") and Pro_Gate::BLOCK_FALLBACK.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Carousel_3d;

use ShapedPlugin\WPTeam\Blocks\Includes\AbstractBlock;
use ShapedPlugin\WPTeam\Blocks\Includes\Blocks_Register;

defined( 'ABSPATH' ) || exit;

/**
 * Class Carousel_3d
 */
class Carousel_3d extends AbstractBlock {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name     = 'carousel-3d';
		$this->editor_scripts = array( 'sptp-blocks-editor' );
		$this->editor_styles  = array( 'sptp-blocks-editor' );
		$this->styles         = array( 'sptp-blocks-style', 'sp_team_fontawesome', 'sp_team_fontello' );
		$this->is_dynamic     = true;
	}

	/**
	 * Render through the Carousel block's renderer (Pro_Gate::BLOCK_FALLBACK).
	 *
	 * @param array          $attributes Block attributes.
	 * @param string         $content    Inner block content.
	 * @param \WP_Block|null $block      Block instance.
	 * @return string
	 */
	public function render_block( $attributes, $content = '', $block = null ) {
		// Pro's editor always assigns a uniqueId. A 3D Carousel without one was
		// inserted in Free (listed last in the Smart Team inserter section, crown-marked), where
		// the canvas shows only the upsell notice — so it renders nothing, the
		// same as the notice promises, instead of a Carousel nobody designed.
		if ( empty( $attributes['uniqueId'] ) ) {
			return '';
		}

		$carousel = Blocks_Register::instance()->get_block( 'carousel' );
		if ( ! $carousel ) {
			return '';
		}
		return $carousel->render_block( $attributes, $content, $block );
	}
}
