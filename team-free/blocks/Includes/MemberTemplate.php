<?php
/**
 * Starter block template for the member single page.
 *
 * Port of Pro's Blocks\Includes\MemberTemplate. Registers a "Single Item:
 * Member" block template built from the plugin's own single-page field blocks
 * (all of them free), so the Member Details panel's "Configure Single Page
 * Template" link lands on a working layout instead of a blank page. The moment
 * a user edits it in Appearance → Editor, WordPress saves their version as a
 * `wp_template` post, which takes precedence over this one automatically.
 *
 * The same composition is also registered as a block PATTERN, so it can be
 * re-inserted after the template is cleared — and so the starting layout is
 * still reachable on cores older than the 6.7 template API.
 *
 * Which one renders is the Dashboard → Single Page → Template Type setting
 * (`_sptp_settings → single_page_template_source`, Pro's key and values):
 * `plugin` (Classic, the default) keeps the legacy `sptp-single.php`, `block`
 * hands the page to this template. A template the THEME ships outranks both —
 * see use_block_template().
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

defined( 'ABSPATH' ) || exit;

/**
 * Class MemberTemplate
 */
class MemberTemplate {

	/**
	 * Template + pattern slug (unprefixed).
	 */
	const SLUG = 'single-sptp_member';

	/**
	 * `_sptp_settings` key holding the Template Type — shared with Pro.
	 */
	const SOURCE_KEY = 'single_page_template_source';

	/**
	 * Allowed Template Type values: Classic (the plugin's PHP template), Block.
	 *
	 * @var string[]
	 */
	const SOURCES = array( 'plugin', 'block' );

	/**
	 * The stored Template Type, `plugin` when unset or unrecognized.
	 *
	 * @return string
	 */
	public static function template_source() {
		$settings = get_option( '_sptp_settings' );
		$source   = is_array( $settings ) && isset( $settings[ self::SOURCE_KEY ] ) ? $settings[ self::SOURCE_KEY ] : '';

		return in_array( $source, self::SOURCES, true ) ? $source : self::SOURCES[0];
	}

	/**
	 * Wire the registrations.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ), 20 );
		add_filter( 'rest_request_after_callbacks', array( __CLASS__, 'filter_template_author' ), 10, 3 );
		add_filter( 'sptp_use_plugin_single_template', array( __CLASS__, 'filter_use_plugin_single_template' ), 10, 2 );
	}

	/**
	 * `sptp_use_plugin_single_template` callback — the legacy
	 * Frontend::get_custom_post_type_template() asks this before swapping in
	 * `sptp-single.php`.
	 *
	 * @param bool     $use_plugin Whether to use the plugin template.
	 * @param \WP_Post $post       The member being rendered.
	 * @return bool
	 */
	public static function filter_use_plugin_single_template( $use_plugin, $post ) {
		if ( ! $use_plugin ) {
			return $use_plugin;
		}

		return ! self::use_block_template( $post );
	}

	/**
	 * Whether WordPress's own template resolution should render this member
	 * instead of the plugin's `sptp-single.php`.
	 *
	 * The Template Type setting decides, exactly as in Pro: Block hands the page
	 * to the Site Editor template, Classic keeps the plugin template even when a
	 * Site Editor template for members has been saved — switching the setting
	 * is how the user reaches that one. The only thing that outranks the
	 * setting is a member template the active THEME ships, which the plugin has
	 * no business overriding.
	 *
	 * @param \WP_Post $post The member being rendered.
	 * @return bool
	 */
	public static function use_block_template( $post ) {
		if ( ! $post instanceof \WP_Post || 'sptp_member' !== $post->post_type ) {
			return false;
		}

		return 'block' === self::template_source() || self::theme_provides_template( $post );
	}

	/**
	 * Whether the active THEME ships a member single-page template.
	 *
	 * Deliberately narrow on the slug: only `single-sptp_member` (optionally
	 * suffixed with the member slug). A block theme's generic
	 * `single`/`singular`/`index` must NOT count, or every existing
	 * block-theme site would silently lose its member single page. And on the
	 * origin: a template the user built in the Site Editor, or the starter this
	 * class registers, is the Block setting's business, not the theme's — only
	 * `source = theme`, or a customized theme template (`origin = theme`),
	 * counts. Same rule as Pro's Frontend::theme_provides_member_template().
	 *
	 * @param \WP_Post $post The member being rendered.
	 * @return bool
	 */
	private static function theme_provides_template( $post ) {
		static $cache = array();

		if ( isset( $cache[ $post->ID ] ) ) {
			return $cache[ $post->ID ];
		}

		$slugs = array( self::SLUG . '-' . $post->post_name, self::SLUG );

		// Classic theme (or a block theme's PHP fallback): a real template file.
		$found = (bool) locate_template(
			array_map(
				function ( $slug ) {
					return $slug . '.php';
				},
				$slugs
			)
		);

		// Block theme: a template the theme ships, customized or not.
		if ( ! $found && function_exists( 'get_block_templates' ) && wp_is_block_theme() ) {
			foreach ( get_block_templates( array( 'slug__in' => $slugs ), 'wp_template' ) as $template ) {
				if ( 'theme' === $template->source || 'theme' === ( $template->origin ?? '' ) ) {
					$found = true;
					break;
				}
			}
		}

		$cache[ $post->ID ] = $found;

		return $found;
	}

	/**
	 * Where the member SINGLE PAGE layout is edited — the Site Editor screen
	 * for the "Single Item: Member" block template.
	 *
	 * Empty on classic themes: there is no Site Editor there, and the plugin
	 * renders that page from a PHP template which no editor can open. The
	 * inspector hides the link when this is empty rather than offering a dead
	 * one.
	 *
	 * @return string
	 */
	public static function single_page_edit_url() {
		if ( ! function_exists( 'wp_is_block_theme' ) || ! wp_is_block_theme() ) {
			return '';
		}

		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return '';
		}

		$template = self::resolve_single_template();
		if ( ! $template ) {
			return '';
		}

		// Once the template has been customized (or the theme authored it) it
		// is a real `wp_template` POST — let core build the URL from it, so the
		// Site Editor's route format stays right across WordPress versions.
		if ( ! empty( $template->wp_id ) ) {
			$link = get_edit_post_link( $template->wp_id, 'raw' );
			if ( $link ) {
				return $link;
			}
		}

		// A plugin-registered template that nobody has customized has no post
		// to link to, so build the route by hand. WP 6.8+ addresses the Site
		// Editor with `p=/wp_template/{id}`; older cores used postType + postId.
		$route = version_compare( $GLOBALS['wp_version'], '6.8', '>=' )
			? array(
				'p'      => '/wp_template/' . $template->id,
				'canvas' => 'edit',
			)
			: array(
				'postType' => 'wp_template',
				'postId'   => $template->id,
				'canvas'   => 'edit',
			);

		return add_query_arg( array_map( 'rawurlencode', $route ), admin_url( 'site-editor.php' ) );
	}

	/**
	 * The member single-page template the Site Editor would actually open.
	 *
	 * The THEME-scoped id comes first: that is what a customized template (and
	 * a theme-authored one) uses — e.g. `twentytwentyfive//single-sptp_member`
	 * — and what the Site Editor and the frontend resolve to. This plugin's
	 * own registration (template_id()) is the fallback for a site where nobody
	 * has touched it yet.
	 *
	 * @return \WP_Block_Template|null
	 */
	private static function resolve_single_template() {
		if ( ! function_exists( 'get_block_template' ) ) {
			return null;
		}

		$ids = array(
			get_stylesheet() . '//' . self::SLUG,
			self::template_id(),
		);

		foreach ( $ids as $id ) {
			$template = get_block_template( $id, 'wp_template' );
			if ( $template ) {
				return $template;
			}
		}

		return null;
	}

	/**
	 * The name shown as the template's Author in the Site Editor.
	 *
	 * Matches the "Smart Team" block category / inserter label rather than the
	 * `Plugin Name` header core would otherwise print.
	 *
	 * @return string
	 */
	public static function author_label() {
		return apply_filters( 'sptp_block_template_author', __( 'Smart Team', 'team-free' ) );
	}

	/**
	 * Replace the Author label core derives for OUR registered block template.
	 *
	 * Core builds it in a private static that applies no `rest_prepare_*`
	 * filter, so the response itself is the only seam. It MUST be
	 * `rest_request_after_callbacks` (applied in `respond_to_request()`) and
	 * NOT `rest_post_dispatch`, which misses the Site Editor's PRELOADED
	 * templates. Rows are matched on the response's own `plugin` field (our
	 * folder slug), so this cannot touch another plugin's or the theme's
	 * templates.
	 *
	 * @param \WP_REST_Response|\WP_Error $response Result to send.
	 * @param array                       $handler  Route handler used for the request.
	 * @param \WP_REST_Request            $request  Request used to generate the response.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function filter_template_author( $response, $handler, $request ) {
		unset( $handler );

		if ( ! $response instanceof \WP_REST_Response ) {
			return $response;
		}

		if ( 0 !== strpos( (string) $request->get_route(), '/wp/v2/templates' ) ) {
			return $response;
		}

		$data = $response->get_data();
		if ( ! is_array( $data ) ) {
			return $response;
		}

		// A single template comes back as one object, a list as an array of them.
		if ( isset( $data['slug'] ) ) {
			$response->set_data( self::relabel_template( $data ) );
			return $response;
		}

		$response->set_data( array_map( array( __CLASS__, 'relabel_template' ), $data ) );

		return $response;
	}

	/**
	 * Swap `author_text` on one prepared template row when it is ours.
	 *
	 * @param mixed $row Prepared template data.
	 * @return mixed
	 */
	private static function relabel_template( $row ) {
		if ( ! is_array( $row ) || ! isset( $row['author_text'], $row['plugin'] ) ) {
			return $row;
		}

		list( $namespace ) = explode( '//', self::template_id(), 2 );

		if ( $namespace === $row['plugin'] ) {
			$row['author_text'] = self::author_label();
		}

		return $row;
	}

	/**
	 * Register the block template and the matching pattern.
	 *
	 * Runs late on `init` so the member blocks are registered first.
	 *
	 * @return void
	 */
	public static function register() {
		if ( function_exists( 'register_block_pattern' ) ) {
			// The `sptp` BLOCK category (BlockCategories) is a separate registry
			// from pattern categories — an unregistered one would leave the
			// pattern uncategorised in the inserter.
			if ( function_exists( 'register_block_pattern_category' ) ) {
				register_block_pattern_category(
					'sptp',
					array( 'label' => __( 'Smart Team', 'team-free' ) )
				);
			}

			register_block_pattern(
				'sptp/' . self::SLUG,
				array(
					'title'         => __( 'Member Details Page', 'team-free' ),
					'description'   => __( "A member's photo, name, designation, bio, contact rows, skills, social icons and action buttons.", 'team-free' ),
					'categories'    => array( 'sptp' ),
					'templateTypes' => array( self::SLUG, 'single' ),
					'content'       => self::content(),
				)
			);
		}

		// WP 6.7+. Older cores keep the plugin template (or the pattern above
		// as a manual starting point) — nothing to register, and nothing breaks.
		if ( ! function_exists( 'register_block_template' ) ) {
			return;
		}

		register_block_template(
			self::template_id(),
			array(
				'title'       => __( 'Single Item: Member', 'team-free' ),
				'description' => __( 'Displays a single team member, built from the Smart Team member blocks.', 'team-free' ),
				'content'     => self::wrapped_content(),
				'post_types'  => array( 'sptp_member' ),
			)
		);
	}

	/**
	 * The registered block-template id — `{plugin-folder}//single-sptp_member`.
	 *
	 * The namespace prefix MUST be the plugin's FOLDER slug: the Site Editor's
	 * Author column resolves it by matching the prefix against every active
	 * plugin's folder name. Derived from the real path rather than
	 * SPT_PLUGIN_SLUG so a renamed plugin folder still matches; lowercased
	 * because `register_block_template()` rejects uppercase characters.
	 *
	 * @return string
	 */
	public static function template_id() {
		$folder = dirname( plugin_basename( SPT_PLUGIN_FILE ) );

		// A single-file plugin at the plugins root has no folder — fall back.
		if ( empty( $folder ) || '.' === $folder ) {
			$folder = SPT_PLUGIN_SLUG;
		}

		return strtolower( $folder ) . '//' . self::SLUG;
	}

	/**
	 * The member field blocks, in reading order.
	 *
	 * Every block resolves the CURRENT queried member on its own, so no Query
	 * Loop or post context is needed. Every block ships a `uniqueId`: all
	 * dynamic CSS anchors to `#uniqueId`, and a template nobody has saved in the
	 * Site Editor yet would otherwise render unstyled. The editor keeps an
	 * existing id and re-mints only duplicates.
	 *
	 * @return string Block markup.
	 */
	private static function content() {
		$markup = implode(
			"\n\n",
			array(
				'<!-- wp:sptp/member-image /-->',
				'<!-- wp:sptp/member-name {"nameTag":"h1"} /-->',
				'<!-- wp:sptp/member-designation /-->',
				'<!-- wp:sptp/member-bio /-->',
				'<!-- wp:sptp/member-description /-->',
				'<!-- wp:sptp/member-skills /-->',
				'<!-- wp:sptp/social-profile /-->',
			)
		);

		return serialize_blocks( self::fill_unique_ids( parse_blocks( $markup ), md5( $markup ) ) );
	}

	/**
	 * Assign a deterministic `uniqueId` to every `sptp/*` block missing one.
	 *
	 * Derived from the content and block position, so the page's CSS walk and
	 * the render agree.
	 *
	 * @param array  $blocks Parsed blocks.
	 * @param string $path   Position seed of the parent.
	 * @return array<int, array>
	 */
	private static function fill_unique_ids( $blocks, $path ) {
		foreach ( $blocks as $index => $block ) {
			$name       = $block['blockName'] ?? '';
			$block_path = $path . '/' . $index;

			if ( 0 === strpos( $name, 'sptp/' ) && empty( $block['attrs']['uniqueId'] ) ) {
				$blocks[ $index ]['attrs']['uniqueId'] = 'sp-smart-team-' . substr( $name, 5 ) . '-' . substr( md5( $block_path ), 0, 12 );
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$blocks[ $index ]['innerBlocks'] = self::fill_unique_ids( $block['innerBlocks'], $block_path );
			}
		}

		return $blocks;
	}

	/**
	 * Whether the Block template source must be rendered by the plugin.
	 *
	 * Core resolves block templates only on block themes; on a classic theme
	 * "block" would otherwise fall to the theme's generic single.php, so the
	 * plugin renders the member blocks inside the theme's header/footer
	 * (`sptp-single-blocks.php`).
	 *
	 * @param \WP_Post|int|null $post Member; defaults to the current post.
	 * @return bool
	 */
	public static function use_block_layout_on_classic_theme( $post = null ) {
		$post = $post ? get_post( $post ) : ( $GLOBALS['post'] ?? null );

		if ( ! $post instanceof \WP_Post || 'sptp_member' !== $post->post_type ) {
			return false;
		}

		if ( wp_is_block_theme() || 'block' !== self::template_source() ) {
			return false;
		}

		return ! self::theme_provides_template( $post );
	}

	/**
	 * The member blocks, parsed — what a classic theme renders for the Block
	 * template source and what its CSS walk scans.
	 *
	 * The user's Site Editor design when one was saved (under any block theme —
	 * a classic theme has no Site Editor of its own), else the starter blocks.
	 * The classic theme prints its own header, footer and <main>, so template
	 * parts are dropped and a root `main` group is unwrapped.
	 *
	 * @return array<int, array>
	 */
	public static function member_blocks() {
		$content = self::saved_design();

		if ( '' === $content ) {
			return parse_blocks( self::content() );
		}

		return self::fill_unique_ids( self::strip_theme_frame( parse_blocks( $content ) ), md5( $content ) );
	}

	/**
	 * Whether member_blocks() comes from a saved Site Editor design.
	 *
	 * @return bool
	 */
	public static function has_saved_design() {
		return '' !== self::saved_design();
	}

	/**
	 * The most recently saved Site Editor member template, whichever theme it
	 * was designed under.
	 *
	 * @return string Block markup, '' when none was saved.
	 */
	private static function saved_design() {
		static $content = null;

		if ( null === $content ) {
			$posts   = get_posts(
				array(
					'post_type'              => 'wp_template',
					'name'                   => self::SLUG,
					'post_status'            => 'publish',
					'orderby'                => 'modified',
					'order'                  => 'DESC',
					'posts_per_page'         => 1,
					'no_found_rows'          => true,
					'update_post_term_cache' => false,
				)
			);
			$content = $posts ? (string) $posts[0]->post_content : '';
		}

		return $content;
	}

	/**
	 * Drop template parts and unwrap root `main` groups.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return array<int, array>
	 */
	private static function strip_theme_frame( $blocks ) {
		$out = array();

		foreach ( $blocks as $block ) {
			$name = $block['blockName'] ?? '';

			if ( 'core/template-part' === $name ) {
				continue;
			}

			if ( 'core/group' === $name && 'main' === ( $block['attrs']['tagName'] ?? '' ) ) {
				$out = array_merge( $out, self::strip_theme_frame( $block['innerBlocks'] ) );
				continue;
			}

			$out[] = $block;
		}

		return $out;
	}

	/**
	 * The full template: theme header/footer parts around the member blocks.
	 *
	 * @return string Block markup.
	 */
	private static function wrapped_content() {
		return implode(
			"\n\n",
			array(
				'<!-- wp:template-part {"slug":"header","tagName":"header"} /-->',
				'<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} --><main class="wp-block-group">',
				self::content(),
				'</main><!-- /wp:group -->',
				'<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->',
			)
		);
	}
}
