<?php
/**
 * Capabilities of the member and shortcode-generator post types.
 *
 * Both used to be registered with `capability_type => 'post'`, so anyone who
 * could write a blog post could write a member or a team: `show_ui` only hides
 * the wp-admin screens, and XML-RPC (`wp.newPost`, `wp.editPost`,
 * `wp.getPosts`…) and the REST API never look at it. A Contributor could
 * create drafts of both, an Author could publish a member on the public
 * `/team/…` URL.
 *
 * Each post type now has its own capability names, which no role holds. This
 * class hands them out on the fly, and only to users who hold the plugin's UI
 * permission (`manage_options` unless `sp_wp_team_ui_permission` says
 * otherwise) — the same people who see the screens. A user gets a plugin
 * capability only when they also hold the core one it replaced, so the change
 * narrows access and never widens it. Nothing is written to the roles in the
 * database: deactivating the plugin leaves no trace, and Pro is unaffected.
 *
 * @package ShapedPlugin\WPTeam\Admin
 */

namespace ShapedPlugin\WPTeam\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Member / generator post type capabilities.
 */
class Post_Type_Caps {

	/**
	 * Post type => its capability base, singular and plural.
	 *
	 * Core builds every capability name from the pair (`edit_sptp_members`,
	 * `publish_sptp_members`…) when it is passed as `capability_type`.
	 */
	const TYPES = array(
		'sptp_member'    => array( 'sptp_member', 'sptp_members' ),
		'sptp_generator' => array( 'sptp_generator', 'sptp_generators' ),
	);

	/**
	 * The core capabilities a post type's primitive capabilities are named
	 * after. `posts` becomes the plural base: `edit_others_sptp_members`.
	 *
	 * The three meta capabilities (`edit_post`, `read_post`, `delete_post`) are
	 * left out on purpose: core maps them per post onto the ones below, and
	 * granting them by name would bypass that mapping.
	 */
	const PRIMITIVES = array(
		'edit_posts',
		'edit_others_posts',
		'edit_published_posts',
		'edit_private_posts',
		'publish_posts',
		'read_private_posts',
		'delete_posts',
		'delete_others_posts',
		'delete_published_posts',
		'delete_private_posts',
	);

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_filter( 'user_has_cap', array( $this, 'grant' ) );
	}

	/**
	 * The `capability_type` to register a post type with.
	 *
	 * Must be registered together with `map_meta_cap => true`, which core only
	 * defaults to for the `post` and `page` types.
	 *
	 * @param string $post_type Post type name.
	 * @return string[] Singular and plural capability base.
	 */
	public static function capability_type( $post_type ) {
		return self::TYPES[ $post_type ];
	}

	/**
	 * Give the plugin's post type capabilities to users who hold the UI
	 * permission, each one only where they hold its core equivalent.
	 *
	 * Reads the already-resolved `$allcaps` — no current_user_can() here, which
	 * would re-enter this filter.
	 *
	 * @param array $allcaps Capabilities the user holds.
	 * @return array
	 */
	public function grant( $allcaps ) {
		$required = apply_filters( 'sp_wp_team_ui_permission', 'manage_options' );

		if ( empty( $allcaps[ $required ] ) ) {
			return $allcaps;
		}

		foreach ( self::TYPES as $bases ) {
			foreach ( self::PRIMITIVES as $core ) {
				if ( ! empty( $allcaps[ $core ] ) ) {
					$allcaps[ str_replace( 'posts', $bases[1], $core ) ] = true;
				}
			}
		}

		return $allcaps;
	}
}
