<?php
/**
 * Public admin-ajax endpoint for the Ajax Pagination block.
 *
 * The free subset of Pro's ManageAPI::sptp_query_members(): pages a grid's
 * members for sptp/ajax-pagination. Pro's keyword search (Ajax Member Search)
 * and taxonomy narrowing (Live Frontend Filter) params are Pro-only and not
 * read here, nor is Pro's Saved Templates lookup or the Member Details modal
 * action (see docs/pro-free-separation.md).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;
use ShapedPlugin\WPTeam\Admin\Dashboard\SavedTemplates;

defined( 'ABSPATH' ) || exit;

/**
 * Class Member_Ajax.
 */
class Member_Ajax {

	/**
	 * Layout blocks whose saved attributes a page request may resolve.
	 *
	 * @var array<int, string>
	 */
	const LAYOUT_BLOCKS = array( 'sptp/grid' );

	/**
	 * Shape of a layout block's generated uniqueId (useUniqueId: prefix + the
	 * last clientId segment). Anything else can never match a saved block.
	 */
	const UNIQUE_ID_PATTERN = '/^sp-smart-team-grid-[A-Za-z0-9]{6,32}$/';

	/**
	 * Class instance.
	 *
	 * @var Member_Ajax|null
	 */
	private static $instance = null;

	/**
	 * Get class instance.
	 *
	 * @return Member_Ajax
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
			self::$instance->init();
		}
		return self::$instance;
	}

	/**
	 * Hook the frontend AJAX action (public — visitors page the grid).
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'wp_ajax_sptp_query_members', array( $this, 'sptp_query_members' ) );
		add_action( 'wp_ajax_nopriv_sptp_query_members', array( $this, 'sptp_query_members' ) );
	}

	/**
	 * AJAX handler for the grid's Ajax Pagination (admin-ajax, public).
	 *
	 * Accepted POST params (all sanitized):
	 *  - nonce         sptp_block_nonce
	 *  - unique_id     str  the grid wrapper id (uniqueId attribute)
	 *  - post_id       int  post/page containing the block
	 *  - current_page  int  page to fetch (default 1)
	 *
	 * The saved block attributes are recovered from the post content (falling
	 * back to Site Editor templates) so paged requests run against the same
	 * query pool and card settings as the initial server-side render. Only a
	 * grid with Ajax Pagination on, inside a team-group next to a saved
	 * sptp/ajax-pagination, can be paged. The page size is that sibling's
	 * saved Items Per Page — never the request's — so a visitor can't widen a
	 * page (the same value MemberLayoutBlock::inject_ajax_per_page() sizes the
	 * first page with). Show Member (`limit`) caps the result set and the page
	 * size slices it: page N is offset (N-1)·per_page. Random order breaks
	 * paging consistency, so it is forced off.
	 *
	 * Returns JSON: { html, total, pages }.
	 *
	 * @return void
	 */
	public function sptp_query_members() {
		$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'sptp_block_nonce' ) ) {
			wp_send_json_error( array( 'message' => 'Security check failed.' ), 403 );
			return;
		}

		$current_page = isset( $_POST['current_page'] ) ? max( 1, intval( $_POST['current_page'] ) ) : 1;
		$unique_id    = isset( $_POST['unique_id'] ) ? sanitize_text_field( wp_unslash( $_POST['unique_id'] ) ) : '';
		$post_id      = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;

		// Reject anything that isn't a generated id before scanning post
		// content or templates.
		if ( ! preg_match( self::UNIQUE_ID_PATTERN, $unique_id ) ) {
			wp_send_json_error( array( 'message' => 'Block not found.' ), 404 );
			return;
		}

		// Dashboard → Blocks: a switched-off Ajax Pagination answers nothing, and
		// is refused before the (costlier) block lookup below.
		if ( ! DashboardHelper::is_block_enabled( 'sptp/ajax-pagination' ) ) {
			wp_send_json_error( array( 'message' => 'Block not found.' ), 404 );
			return;
		}

		$found = $this->find_block_attributes_by_id( $post_id, $unique_id );
		// No saved pagination sibling, or the grid's toggle is off: this grid
		// was never meant to be paged, so don't page it.
		if ( empty( $found ) || $found['per_page'] < 1 || empty( $found['attributes']['ajaxPagination'] ) ) {
			wp_send_json_error( array( 'message' => 'Block not found.' ), 404 );
			return;
		}

		// …and neither does the layout block it pages when that one is switched off.
		if ( ! empty( $found['blockName'] ) && ! DashboardHelper::is_block_enabled( $found['blockName'] ) ) {
			wp_send_json_error( array( 'message' => 'Block not found.' ), 404 );
			return;
		}
		$block_attributes = $found['attributes'];
		$per_page         = min( 100, $found['per_page'] );

		$grid = Blocks_Register::instance()->get_block( 'grid' );
		if ( ! $grid ) {
			wp_send_json_error( array( 'message' => 'Renderer unavailable.' ), 500 );
			return;
		}

		// Seed from the block's saved query so pages continue the same pool.
		$args = MemberQuery::build_args_from_attributes( $block_attributes );
		$cap  = MemberQuery::result_cap( $args );

		// A page past the cap renders nothing — answer it without querying (and
		// before a huge page number can overflow the offset arithmetic).
		$pages = (int) ceil( $cap / $per_page );
		if ( $current_page > $pages ) {
			wp_send_json_success(
				array(
					'html'  => '',
					'total' => $cap,
					'pages' => $pages,
				)
			);
			return;
		}

		$args                  = MemberQuery::page_args( $args, $current_page, $per_page );
		$past_cap              = $args['per_page'] < 1;
		$args['per_page']      = max( 1, $args['per_page'] );
		$args['enable_random'] = false;
		$args['count_total']   = true;

		$query = MemberQuery::query( $args );
		$total = MemberQuery::capped_total( $query, $cap );
		$html  = ( ! $past_cap && $query->have_posts() )
			? $grid->render_members_html( $block_attributes, $query )
			: '';

		wp_send_json_success(
			array(
				'html'  => $html,
				'total' => $total,
				'pages' => (int) ceil( $total / $per_page ),
			)
		);
	}

	/**
	 * Recover a layout block's saved attributes (merged with registered
	 * defaults) by its uniqueId — from the containing post's content, falling
	 * back to Site Editor templates — plus its sibling Ajax Pagination's saved
	 * page size.
	 *
	 * @param int    $post_id   Post/page containing the block.
	 * @param string $unique_id The block's uniqueId attribute.
	 * @return array{attributes: array, per_page: int}|null Null when the block can't be found.
	 */
	private function find_block_attributes_by_id( $post_id, $unique_id ) {
		if ( '' === $unique_id ) {
			return null;
		}

		// The exact serialized attribute, not the bare id: a bare substring
		// would also hit every longer id sharing the prefix, and the template
		// sweep below would then parse each of those templates.
		$needle = '"uniqueId":"' . $unique_id . '"';

		$find_block = null;
		// Only content a visitor could already see — never a draft/private or
		// password-protected post.
		if ( $post_id && is_post_publicly_viewable( $post_id ) && ! post_password_required( $post_id ) ) {
			$post_content = (string) get_post_field( 'post_content', $post_id );
			// Cheap containment check before the expensive parse_blocks().
			if ( false !== strpos( $post_content, $needle ) ) {
				$find_block = $this->search_blocks_recursive( parse_blocks( $post_content ), $unique_id );
			}
		}

		// Not in the post/page — the grid may live in a published saved template
		// (`[sptp_saved_template]` swaps the global post, so the request reports
		// the template's id, which is never publicly viewable).
		if ( ! $find_block ) {
			$find_block = $this->search_published_posts( array( SavedTemplates::POST_TYPE ), $unique_id, $needle );
		}

		// Still nothing — check Site Editor templates.
		if ( ! $find_block ) {
			$find_block = $this->search_published_posts( array( 'wp_template', 'wp_template_part' ), $unique_id, $needle );
		}

		if ( ! $find_block ) {
			return null;
		}

		// Merge saved attributes over the registered defaults so the renderer
		// sees the same resolved values as the initial server-side render.
		$per_page    = $find_block['per_page'];
		$find_block  = $find_block['block'];
		$saved_attrs = isset( $find_block['attrs'] ) ? $find_block['attrs'] : array();
		$block_type  = \WP_Block_Type_Registry::get_instance()->get_registered( $find_block['blockName'] );

		$default_attrs = array();
		if ( $block_type ) {
			foreach ( $block_type->get_attributes() as $attr_key => $attr_schema ) {
				if ( isset( $attr_schema['default'] ) ) {
					$default_attrs[ $attr_key ] = $attr_schema['default'];
				}
			}
		}

		return array(
			'blockName'  => $find_block['blockName'],
			'attributes' => wp_parse_args( $saved_attrs, $default_attrs ),
			'per_page'   => $per_page,
		);
	}

	/**
	 * Find the block in a published saved template or Site Editor template.
	 *
	 * A LIKE over `post_content` rather than a full sweep: the exact serialized
	 * uniqueId hits at most a handful of rows, and the parse only runs on those.
	 * The action is public, so a sweep that loaded every template would let any
	 * visitor make each request read them all. Same gate as the shortcode —
	 * published and not password-protected — so unpublished blocks are never
	 * served.
	 *
	 * @param string[] $post_types Post types to search.
	 * @param string   $unique_id  The block's uniqueId attribute.
	 * @param string   $needle     The exact serialized `"uniqueId":"…"` attribute.
	 * @return array|null Match from search_blocks_recursive(), or null.
	 */
	private function search_published_posts( $post_types, $unique_id, $needle ) {
		global $wpdb;

		$placeholders = implode( ', ', array_fill( 0, count( $post_types ), '%s' ) );

		$ids = $wpdb->get_col( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"SELECT ID FROM {$wpdb->posts} WHERE post_type IN ({$placeholders}) AND post_status = 'publish' AND post_content LIKE %s LIMIT 5", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				array_merge( $post_types, array( '%' . $wpdb->esc_like( $needle ) . '%' ) )
			)
		);

		foreach ( $ids as $id ) {
			if ( post_password_required( (int) $id ) ) {
				continue;
			}
			$find_block = $this->search_blocks_recursive( parse_blocks( (string) get_post_field( 'post_content', (int) $id ) ), $unique_id );
			if ( $find_block ) {
				return $find_block;
			}
		}

		return null;
	}

	/**
	 * Recursively search parsed blocks for a layout block with the uniqueId.
	 * A match directly inside sptp/team-group also reports its sibling Ajax
	 * Pagination's saved Items Per Page (0 when there is none).
	 *
	 * @param array  $blocks    Parsed blocks (from parse_blocks()).
	 * @param string $unique_id Block uniqueId to match.
	 * @param bool   $in_group  Whether $blocks are a team-group's children.
	 * @return array{block: array, per_page: int}|null The match, or null.
	 */
	private function search_blocks_recursive( $blocks, $unique_id, $in_group = false ) {
		foreach ( $blocks as $block ) {
			if (
				in_array( $block['blockName'] ?? '', self::LAYOUT_BLOCKS, true )
				&& isset( $block['attrs']['uniqueId'] )
				&& $block['attrs']['uniqueId'] === $unique_id
			) {
				return array(
					'block'    => $block,
					'per_page' => $in_group ? $this->sibling_per_page( $blocks ) : 0,
				);
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$is_group = isset( $block['blockName'] ) && 'sptp/team-group' === $block['blockName'];
				$result   = $this->search_blocks_recursive( $block['innerBlocks'], $unique_id, $is_group );
				if ( $result ) {
					return $result;
				}
			}
		}
		return null;
	}

	/**
	 * Saved Items Per Page of the sptp/ajax-pagination among a team-group's
	 * children — the same read as MemberLayoutBlock::inject_ajax_per_page().
	 *
	 * @param array $siblings Parsed team-group children.
	 * @return int Page size, or 0 when there is no pagination block.
	 */
	private function sibling_per_page( $siblings ) {
		foreach ( $siblings as $sibling ) {
			if ( 'sptp/ajax-pagination' === ( $sibling['blockName'] ?? '' ) ) {
				return max( 1, (int) ( $sibling['attrs']['itemPerPage']['value'] ?? 12 ) );
			}
		}
		return 0;
	}
}
