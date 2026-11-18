<?php
/**
 * Saved Templates — block-editor team layouts reusable as a shortcode.
 *
 * Port of Smart Team Pro's `Admin\Dashboard\SavedTemplates`: a hidden CPT whose
 * post content is a normal block layout (built with the Smart Team blocks in the
 * block editor) plus a shortcode that renders it anywhere — page builders,
 * widgets, classic content. The React dashboard's "Saved Templates" tab is the
 * management UI (list / search / bulk actions / duplicate / delete).
 *
 * Registered on BOTH admin and frontend (Team::define_admin_hooks() is not
 * `is_admin()`-gated) — the shortcode has to work on the front end.
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Block_Dynamic_Style;

defined( 'ABSPATH' ) || exit;

/**
 * Class SavedTemplates
 */
class SavedTemplates {

	/**
	 * Saved template post type (19 chars — WordPress allows 20).
	 *
	 * @var string
	 */
	const POST_TYPE = 'sptp_saved_template';

	/**
	 * Shortcode tag rendering a saved template.
	 *
	 * @var string
	 */
	const SHORTCODE = 'sptp_saved_template';

	/**
	 * The legacy shortcode-generator CPT — the "classic" rows of the same list.
	 *
	 * @var string
	 */
	const CLASSIC_POST_TYPE = 'sptp_generator';

	/**
	 * Template ids being rendered right now, so a template that embeds itself
	 * (directly or through another template) stops instead of recursing forever.
	 *
	 * @var array<int, bool>
	 */
	private static $rendering = array();

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	public function register() {
		// Early enough for REST requests — the block editor saves over REST.
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'admin_init', array( $this, 'redirect_list_table' ) );
		add_filter( 'use_block_editor_for_post_type', array( $this, 'force_block_editor' ), 100, 2 );
		add_filter( 'user_has_cap', array( $this, 'grant_capabilities' ) );
		add_shortcode( self::SHORTCODE, array( $this, 'render_shortcode' ) );
	}

	/**
	 * The post type's own capabilities, each under a dedicated name.
	 *
	 * Never map `edit_post` / `read_post` / `delete_post` onto a core capability
	 * such as `manage_options`: WordPress then treats that capability's name as a
	 * post meta-capability and resolves it to `do_not_allow` for the whole site.
	 * The core `wp/v2/sptp_saved_template` route ignores `show_ui`, so these names
	 * (granted only by grant_capabilities()) are what keeps it administrator-only
	 * — `capability_type => 'page'` would hand it to editors.
	 *
	 * @return array<string, string> Capability key => capability name.
	 */
	private static function capabilities() {
		return array(
			'edit_post'              => 'edit_sptp_saved_template',
			'read_post'              => 'read_sptp_saved_template',
			'delete_post'            => 'delete_sptp_saved_template',
			'edit_posts'             => 'edit_sptp_saved_templates',
			'edit_others_posts'      => 'edit_others_sptp_saved_templates',
			'delete_posts'           => 'delete_sptp_saved_templates',
			'publish_posts'          => 'publish_sptp_saved_templates',
			'read_private_posts'     => 'read_private_sptp_saved_templates',
			'delete_private_posts'   => 'delete_private_sptp_saved_templates',
			'delete_published_posts' => 'delete_published_sptp_saved_templates',
			'delete_others_posts'    => 'delete_others_sptp_saved_templates',
			'edit_private_posts'     => 'edit_private_sptp_saved_templates',
			'edit_published_posts'   => 'edit_published_sptp_saved_templates',
			'create_posts'           => 'create_sptp_saved_templates',
		);
	}

	/**
	 * Give every saved-template capability to users who hold the dashboard
	 * permission (`manage_options` unless `sp_wp_team_ui_permission` says otherwise).
	 *
	 * Reads the already-resolved `$allcaps` — no current_user_can() here, which
	 * would re-enter this filter.
	 *
	 * @param array $allcaps Capabilities the user holds.
	 * @return array
	 */
	public function grant_capabilities( $allcaps ) {
		$required = apply_filters( 'sp_wp_team_ui_permission', 'manage_options' );

		if ( empty( $allcaps[ $required ] ) ) {
			return $allcaps;
		}

		foreach ( self::capabilities() as $name ) {
			$allcaps[ $name ] = true;
		}

		return $allcaps;
	}

	/**
	 * Register the saved template post type.
	 *
	 * `show_ui` keeps post.php working for the block editor while
	 * `show_in_menu => false` keeps it out of the admin menu — the React
	 * dashboard tab is the only entry point.
	 *
	 * @return void
	 */
	public function register_post_type() {
		if ( post_type_exists( self::POST_TYPE ) ) {
			return;
		}

		$labels = array(
			'name'                     => __( 'Saved Templates', 'team-free' ),
			'singular_name'            => __( 'Saved Template', 'team-free' ),
			'menu_name'                => __( 'Saved Templates', 'team-free' ),
			'all_items'                => __( 'Saved Templates', 'team-free' ),
			'add_new'                  => __( 'Add New Template', 'team-free' ),
			'add_new_item'             => __( 'Add New Template', 'team-free' ),
			'edit'                     => __( 'Edit', 'team-free' ),
			'edit_item'                => __( 'Edit Template', 'team-free' ),
			'view_item'                => __( 'View Template', 'team-free' ),
			'new_item'                 => __( 'New Template', 'team-free' ),
			'search_items'             => __( 'Search Template', 'team-free' ),
			'not_found'                => __( 'No Template found', 'team-free' ),
			'not_found_in_trash'       => __( 'No Template found in Trash', 'team-free' ),
			'item_published'           => __( 'Template Published', 'team-free' ),
			'item_published_privately' => __( 'Template published privately.', 'team-free' ),
			'item_reverted_to_draft'   => __( 'Template reverted to draft.', 'team-free' ),
			'item_scheduled'           => __( 'Template scheduled.', 'team-free' ),
			'item_updated'             => __( 'Template updated.', 'team-free' ),
		);

		$capability = apply_filters( 'sp_wp_team_ui_permission', 'manage_options' );

		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => $labels,
				'public'              => false,
				'supports'            => array( 'title', 'editor', 'revisions' ),
				'show_in_rest'        => true,
				'hierarchical'        => false,
				'rewrite'             => false,
				'show_ui'             => current_user_can( $capability ),
				'show_in_menu'        => false,
				'show_in_nav_menus'   => false,
				'exclude_from_search' => true,
				'capability_type'     => 'page',
				'map_meta_cap'        => true,
				'capabilities'        => self::capabilities(),
			)
		);
	}

	/**
	 * Send the default list table to the dashboard's Saved Templates tab.
	 *
	 * post.php (edit an existing template) and post-new.php (create one) are the
	 * two screens that must keep working — only `edit.php?post_type=…` is
	 * redirected, since the React table replaces it.
	 *
	 * @return void
	 */
	public function redirect_list_table() {
		global $pagenow;

		if ( 'edit.php' !== $pagenow ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only screen check.
		$post_type = isset( $_GET['post_type'] ) ? sanitize_key( wp_unslash( $_GET['post_type'] ) ) : '';

		if ( self::POST_TYPE !== $post_type ) {
			return;
		}

		wp_safe_redirect( self::dashboard_url() );
		exit;
	}

	/**
	 * Saved templates are always block-editor posts.
	 *
	 * @param bool   $use_block_editor Whether the block editor is enabled.
	 * @param string $post_type        Post type slug.
	 * @return bool
	 */
	public function force_block_editor( $use_block_editor, $post_type ) {
		if ( self::POST_TYPE === $post_type ) {
			return true;
		}
		return $use_block_editor;
	}

	/**
	 * `[sptp_saved_template id="12"]` — render a saved template's blocks.
	 *
	 * @param array $attributes Shortcode attributes.
	 * @return string
	 */
	public function render_shortcode( $attributes ) {
		$attributes = shortcode_atts( array( 'id' => '' ), $attributes, self::SHORTCODE );
		$id         = is_numeric( $attributes['id'] ) ? absint( $attributes['id'] ) : 0;

		if ( ! $id ) {
			return '';
		}

		$template_post = get_post( $id );
		if ( ! $template_post || self::POST_TYPE !== $template_post->post_type || 'publish' !== $template_post->post_status ) {
			return '';
		}

		if ( '' === trim( (string) $template_post->post_content ) ) {
			return '';
		}

		if ( isset( self::$rendering[ $id ] ) ) {
			return '';
		}
		self::$rendering[ $id ] = true;

		// The template's blocks render here, so their per-block CSS + Google
		// fonts have to ship with this page. Block_Dynamic_Style already covers
		// a shortcode sitting in the post content; this catches the rest
		// (widgets, page builders, template-level shortcodes) and no-ops when
		// the id was handled at `wp_enqueue_scripts` time.
		if ( class_exists( Block_Dynamic_Style::class ) ) {
			Block_Dynamic_Style::instance()->ensure_saved_template_css( $id );
		}

		// Page builders (e.g. Elementor) call this shortcode outside `the_content`,
		// so the global post stays the builder's page — swap it to the template
		// post so `get_the_ID()` in the block render (e.g. the grid's data-post-id)
		// resolves to the post that actually holds these blocks, not the page.
		// `setup_postdata()` alone is not enough: it never touches `$post`.
		global $post;
		$original_post = $post;
		$post          = $template_post; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		setup_postdata( $post );

		$content = do_blocks( $template_post->post_content );
		$content = do_shortcode( $content );

		unset( self::$rendering[ $id ] );

		$post = $original_post; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		if ( $original_post instanceof \WP_Post ) {
			setup_postdata( $original_post );
		} else {
			wp_reset_postdata();
		}

		$content = str_replace( ']]>', ']]&gt;', $content );
		$content = preg_replace( '%<p>&nbsp;\s*</p>%', '', $content );
		$content = preg_replace( '/^(?:<br\s*\/?>\s*)+/', '', $content );

		return trim( $content );
	}

	/**
	 * The `[sptp_saved_template id="N"]` string for a template id.
	 *
	 * @param int $id Template post id.
	 * @return string
	 */
	public static function shortcode_for( $id ) {
		return sprintf( '[%1$s id="%2$d"]', self::SHORTCODE, (int) $id );
	}

	/**
	 * The legacy generator's `[wpteam id="N"]` string.
	 *
	 * @param int $id Generator post id.
	 * @return string
	 */
	public static function classic_shortcode_for( $id ) {
		return sprintf( '[wpteam id="%d"]', (int) $id );
	}

	/**
	 * The dashboard tab that manages saved templates.
	 *
	 * @return string
	 */
	public static function dashboard_url() {
		return admin_url( 'edit.php?post_type=sptp_member&page=sptp_dashboard#saved_templates' );
	}

	/**
	 * Saved template ids referenced by `[sptp_saved_template]` in a string.
	 *
	 * Used by the dynamic-CSS walk: the template's blocks live in another post,
	 * so they are invisible to a `parse_blocks()` of the page.
	 *
	 * @param string $content Content to scan (post content, block innerHTML, …).
	 * @return array<int, int> Unique template ids.
	 */
	public static function template_ids_in_content( $content ) {
		if ( empty( $content ) || false === strpos( $content, '[' . self::SHORTCODE ) ) {
			return array();
		}

		$pattern = get_shortcode_regex( array( self::SHORTCODE ) );
		if ( ! preg_match_all( '/' . $pattern . '/', $content, $matches, PREG_SET_ORDER ) ) {
			return array();
		}

		$ids = array();
		foreach ( $matches as $match ) {
			// Index 3 holds the attribute string of the matched shortcode.
			$atts = shortcode_parse_atts( isset( $match[3] ) ? $match[3] : '' );
			$id   = isset( $atts['id'] ) && is_numeric( $atts['id'] ) ? absint( $atts['id'] ) : 0;
			if ( $id ) {
				$ids[] = $id;
			}
		}

		return array_values( array_unique( $ids ) );
	}
}
