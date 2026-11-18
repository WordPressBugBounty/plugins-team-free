<?php
/**
 * Saved template dropdown source for page builder integrations.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Base;

use ShapedPlugin\WPTeam\Admin\Dashboard\SavedTemplates;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single source of the published saved templates every builder's picker offers.
 *
 * Each builder wants a slightly different shape — its own "nothing selected"
 * key and label, and some want label => id rather than id => label — so the
 * query lives here once and the shape is applied on the way out.
 */
class Template_List {

	/**
	 * Published templates, id => title, newest first. Queried once per request.
	 *
	 * @var array<int, string>|null
	 */
	private static $templates = null;

	/**
	 * Published saved templates, newest first.
	 *
	 * @return array<int, string> Id => title.
	 */
	public static function all() {
		if ( null !== self::$templates ) {
			return self::$templates;
		}

		$templates = array();

		$query = new \WP_Query(
			array(
				'post_type'              => SavedTemplates::POST_TYPE,
				'post_status'            => 'publish',
				'posts_per_page'         => 500,
				'orderby'                => 'ID',
				'order'                  => 'DESC',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		foreach ( $query->posts as $post ) {
			$templates[ $post->ID ] = '' !== $post->post_title ? $post->post_title : '#' . $post->ID;
		}

		self::$templates = $templates;

		return self::$templates;
	}

	/**
	 * Templates with a leading placeholder entry, for a builder select control.
	 *
	 * @param string|int $placeholder_key   Value the control uses for "nothing selected".
	 * @param string     $placeholder_label Label for that entry.
	 * @return array Key => label.
	 */
	public static function options( $placeholder_key = '0', $placeholder_label = '' ) {
		if ( '' === $placeholder_label ) {
			$placeholder_label = __( '- Select Template -', 'team-free' );
		}

		return array( $placeholder_key => $placeholder_label ) + self::all();
	}

	/**
	 * Templates keyed by label, the shape WPBakery's dropdown expects.
	 *
	 * @param string|int $placeholder_key   Value the control uses for "nothing selected".
	 * @param string     $placeholder_label Label for that entry.
	 * @return array Label => key.
	 */
	public static function flipped_options( $placeholder_key = 'none', $placeholder_label = '' ) {
		$flipped = array();

		foreach ( self::options( $placeholder_key, $placeholder_label ) as $key => $label ) {
			$flipped[ $label ] = $key;
		}

		return $flipped;
	}
}
