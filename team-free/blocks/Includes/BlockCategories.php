<?php
/**
 * Registers the Smart Team block category in Gutenberg editor.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

defined( 'ABSPATH' ) || exit;

/**
 * Block categories class.
 */
class BlockCategories {

	/**
	 * The Smart Team category slug — must match Pro's.
	 *
	 * @var string
	 */
	const SLUG = 'sptp';

	/**
	 * Initialize block category hooks.
	 *
	 * @return void
	 */
	public static function init() {
		add_filter( 'block_categories_all', array( __CLASS__, 'register_categories' ), 10, 2 );
		// Late, so a plugin that prepends its own category at a higher priority
		// cannot push Smart Team below the fold in the inserter.
		add_filter( 'block_categories_all', array( __CLASS__, 'promote_category' ), 99, 2 );
	}

	/**
	 * Register Smart Team block category.
	 *
	 * Adds a custom category to the Gutenberg block inserter.
	 *
	 * @param array $categories Existing block categories.
	 * @param mixed $context    Block editor context.
	 * @return array
	 */
	public static function register_categories( $categories, $context ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- required by the block_categories_all filter signature.
		return array_merge( self::categories(), $categories );
	}

	/**
	 * Move the Smart Team category back to the top of the list.
	 *
	 * Every other category stays — core, theme and third-party blocks are all
	 * still insertable, they just come after ours. This is the whole ordering
	 * lever the inserter gives us; there is no per-block ranking.
	 *
	 * @param array $categories Existing block categories.
	 * @param mixed $context    Block editor context.
	 * @return array
	 */
	public static function promote_category( $categories, $context ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- required by the block_categories_all filter signature.
		if ( ! is_array( $categories ) ) {
			return $categories;
		}

		$rest = array();
		$ours = array();

		foreach ( $categories as $category ) {
			if ( isset( $category['slug'] ) && self::SLUG === $category['slug'] ) {
				$ours[ $category['slug'] ] = $category;
				continue;
			}
			$rest[] = $category;
		}

		$promoted = array();
		foreach ( self::categories() as $default ) {
			$promoted[] = isset( $ours[ $default['slug'] ] ) ? $ours[ $default['slug'] ] : $default;
		}

		return array_merge( $promoted, $rest );
	}

	/**
	 * The Smart Team category definition. As in WP Carousel Free there is one
	 * section: the Pro-only blocks Pro_Gate::PRO_INSERTER_BLOCKS lists sit in
	 * it, last, marked by a crown chip on their inserter tile.
	 *
	 * @return array
	 */
	private static function categories() {
		return array(
			array(
				'slug'  => self::SLUG,
				'title' => __( 'Smart Team', 'team-free' ),
				'icon'  => 'null',
			),
		);
	}
}
