<?php
/**
 * Block-facing REST API for Smart Team (free).
 *
 * The read-only subset of Pro's ManageAPI that every free layout block's
 * editor preview needs: member data for the canvas, and the option lists for
 * the Query Builder's Groups select, plus the member single page's Site
 * Editor link. Everything else ManageAPI carries —
 * Saved Templates, Member Details ajax, the dashboard's Parent/Child Blocks
 * toggle — is Pro-only and stays out of Free (see docs/pro-free-separation.md).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

defined( 'ABSPATH' ) || exit;

/**
 * Class Member_REST.
 */
class Member_REST {

	const NAMESPACE = 'sptp/v1';

	/**
	 * Class instance.
	 *
	 * @var Member_REST|null
	 */
	private static $instance = null;

	/**
	 * Get class instance.
	 *
	 * @return Member_REST
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
			self::$instance->init();
		}
		return self::$instance;
	}

	/**
	 * Hook the REST routes.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register block REST routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			self::NAMESPACE,
			'/members',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_members' ),
				'permission_callback' => array( $this, 'permission' ),
				'args'                => array(
					'per_page' => array( 'sanitize_callback' => 'absint' ),
					'page'     => array( 'sanitize_callback' => 'absint' ),
					'orderby'  => array( 'sanitize_callback' => 'sanitize_text_field' ),
					'order'    => array( 'sanitize_callback' => 'sanitize_text_field' ),
					'groups'   => array( 'sanitize_callback' => 'sanitize_text_field' ),
					'include'  => array( 'sanitize_callback' => 'sanitize_text_field' ),
					'exclude'  => array( 'sanitize_callback' => 'sanitize_text_field' ),
					'random'   => array( 'sanitize_callback' => 'sanitize_text_field' ),
				),
			)
		);

		// Lightweight option list for the Query Builder's Groups select.
		register_rest_route(
			self::NAMESPACE,
			'/member-options',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_member_options' ),
				'permission_callback' => array( $this, 'permission' ),
				'args'                => array(
					'groups' => array( 'sanitize_callback' => 'sanitize_text_field' ),
				),
			)
		);

		// Member Details → Open as → Single Page → "Configure Single Page
		// Template". Same route as Pro's ManageAPI, minus the modal
		// `templates` list (the modal is Pro-only).
		register_rest_route(
			self::NAMESPACE,
			'/details-templates',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_details_templates' ),
				'permission_callback' => array( $this, 'permission' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/groups',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_groups' ),
				'permission_callback' => array( $this, 'permission' ),
				'args'                => array(
					'taxonomy' => array( 'sanitize_callback' => 'sanitize_key' ),
				),
			)
		);
	}

	/**
	 * Editor-only data — gate on edit capability.
	 *
	 * @return bool
	 */
	public function permission() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * GET /sptp/v1/details-templates — where the member single page is edited.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_details_templates() {
		return rest_ensure_response(
			array(
				// '' on classic themes, where the inspector hides the link.
				'singlePageEditUrl' => MemberTemplate::single_page_edit_url(),
			)
		);
	}

	/**
	 * GET /sptp/v1/members — return normalized member data.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_members( $request ) {
		$args  = MemberQuery::build_args_from_request( $request );
		$query = MemberQuery::query( $args );

		$data = array();
		foreach ( $query->posts as $post ) {
			$member = MemberQuery::get_member_data( $post );
			if ( ! empty( $member ) ) {
				$data[] = $member;
			}
		}

		return rest_ensure_response(
			array(
				'data'  => $data,
				'total' => (int) $query->found_posts,
			)
		);
	}

	/**
	 * GET /sptp/v1/member-options — { value, label } list for member selects.
	 *
	 * Accepts an optional `groups` param (comma-separated `sptp_group` term ids)
	 * to limit the list to members in those taxonomies.
	 *
	 * @param \WP_REST_Request|null $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_member_options( $request = null ) {
		$args = array(
			'post_type'              => MemberQuery::POST_TYPE,
			'post_status'            => 'publish',
			'posts_per_page'         => -1,
			'orderby'                => 'title',
			'order'                  => 'asc',
			// Only ID + title are read — skip priming the meta/term caches.
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
		);

		$groups = $request ? $request->get_param( 'groups' ) : '';
		if ( ! empty( $groups ) ) {
			$group_ids = array_filter( array_map( 'absint', explode( ',', $groups ) ) );
			if ( ! empty( $group_ids ) ) {
				$args['tax_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
					array(
						'taxonomy' => MemberQuery::TAXONOMY,
						'field'    => 'term_id',
						'terms'    => $group_ids,
					),
				);
			}
		}

		$members = get_posts( $args );

		$options = array();
		foreach ( $members as $member ) {
			$options[] = array(
				'value' => $member->ID,
				'label' => get_the_title( $member ),
			);
		}

		return rest_ensure_response( $options );
	}

	/**
	 * GET /sptp/v1/groups — { value, label } term list for a filterable member
	 * taxonomy. Optional `taxonomy` param, whitelisted to the four taxonomies
	 * the free blocks cover; default (and any other value) = sptp_group.
	 *
	 * @param \WP_REST_Request|null $request Request (optional `taxonomy`).
	 * @return \WP_REST_Response
	 */
	public function get_groups( $request = null ) {
		$allowed  = array( MemberQuery::TAXONOMY, 'sptp_designation', 'sptp_location', 'sptp_gender' );
		$taxonomy = $request ? (string) $request->get_param( 'taxonomy' ) : '';
		if ( ! in_array( $taxonomy, $allowed, true ) ) {
			$taxonomy = MemberQuery::TAXONOMY;
		}

		$terms = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
			)
		);

		$options = array();
		if ( ! is_wp_error( $terms ) ) {
			foreach ( $terms as $term ) {
				$options[] = array(
					'value' => $term->term_id,
					'label' => $term->name,
				);
			}
		}

		return rest_ensure_response( $options );
	}
}
