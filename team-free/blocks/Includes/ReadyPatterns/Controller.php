<?php
/**
 * Ready Patterns REST controller.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\ReadyPatterns
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\ReadyPatterns;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

defined( 'ABSPATH' ) || exit;

/**
 * Registers /sptp/v1/patterns* REST routes.
 *
 * Port of Smart Team Pro's Ready Patterns Controller — same routes, so a
 * site moving between Free and Pro keeps one REST surface (the two never run
 * together: Free's block layer stands down while Pro is active). The one Free
 * delta is `get_pattern()`: a Pro-tier pattern is browsable and previewable in
 * the library, but its markup is never served here.
 */
class Controller {

	/**
	 * Pattern repository.
	 *
	 * @var PatternRepository
	 */
	private $repository;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->repository = new PatternRepository();
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST routes.
	 */
	public function register_routes(): void {
		register_rest_route(
			'sptp/v1',
			'/patterns',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_patterns' ),
				'permission_callback' => array( $this, 'can_edit_posts' ),
				'args'                => array(
					'force' => array(
						'default'           => false,
						'sanitize_callback' => static function ( $value ) {
							return rest_sanitize_boolean( $value );
						},
					),
				),
			)
		);

		register_rest_route(
			'sptp/v1',
			'/patterns/(?P<id>[\\w-]+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_pattern' ),
				'permission_callback' => array( $this, 'can_edit_posts' ),
				'args'                => array(
					'id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Own path — "/patterns/(?P<id>)" above would swallow "/patterns/favorites".
		register_rest_route(
			'sptp/v1',
			'/pattern-favorites',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_favorites' ),
					'permission_callback' => array( $this, 'can_edit_posts' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_favorites' ),
					'permission_callback' => array( $this, 'can_edit_posts' ),
					'args'                => array(
						'id'     => array(
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'slug'   => array(
							'default'           => '',
							'sanitize_callback' => 'sanitize_title',
						),
						'action' => array(
							'default'           => 'add',
							'validate_callback' => static function ( $value ) {
								return in_array( $value, array( 'add', 'remove' ), true );
							},
						),
					),
				),
			)
		);
	}

	/**
	 * Permission check for editor users.
	 *
	 * The dashboard module governs the editor header shortcut alone, so the
	 * routes keep answering while it is off. Only `sptp_ready_patterns_enabled`
	 * takes the feature off this site, and then nothing is served whatever the
	 * caller's capabilities.
	 *
	 * The return type is left off because a permission callback may return
	 * either a bool or a WP_Error, and union types need PHP 8.
	 *
	 * @return bool|\WP_Error True when allowed, WP_Error otherwise.
	 */
	public function can_edit_posts() {
		if ( ! PatternRepository::is_enabled() ) {
			return new \WP_Error(
				'sptp_ready_patterns_disabled',
				__( 'Ready Patterns is disabled on this site.', 'team-free' ),
				array( 'status' => 403 )
			);
		}

		return current_user_can( 'edit_posts' );
	}

	/**
	 * Return the pattern manifest.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_patterns( \WP_REST_Request $request ) {
		$force = (bool) $request->get_param( 'force' );
		$items = $this->repository->get_manifest( $force );

		// A 200 with [] reads as "No patterns match your filters." — a failed download
		// has to arrive as an error so the library shows its retry state instead.
		if ( $this->repository->manifest_unreachable() ) {
			return new \WP_Error(
				'sptp_patterns_unreachable',
				__( 'The pattern library could not be reached.', 'team-free' ),
				array( 'status' => 502 )
			);
		}

		return rest_ensure_response( $items );
	}

	/**
	 * Return a single pattern payload.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_pattern( \WP_REST_Request $request ) {
		$pattern_id = PatternRepository::normalize_id( $request->get_param( 'id' ) );
		$item       = $this->repository->find_cached_item( $pattern_id );

		if ( null === $item ) {
			return new \WP_Error(
				'sptp_pattern_not_found',
				__( 'Pattern not found.', 'team-free' ),
				array( 'status' => 404 )
			);
		}

		// Pro patterns are preview-only in Free — the editor shows an Upgrade
		// link in place of Insert, and this refuses the markup to anything else.
		if ( ! Pro_Gate::is_free_pattern( $item ) ) {
			return new \WP_Error(
				'sptp_pattern_pro_only',
				__( 'This pattern needs Smart Team Pro. Upgrade to insert it.', 'team-free' ),
				array( 'status' => 403 )
			);
		}

		$content = $this->repository->get_pattern_content( $pattern_id );

		if ( null === $content || '' === $content || ! self::is_valid_pattern_markup( $content ) ) {
			return new \WP_Error(
				'sptp_pattern_not_found',
				__( 'Pattern not found.', 'team-free' ),
				array( 'status' => 404 )
			);
		}

		// A free-tier pattern that nests a Pro-only block (a filter or search
		// addon inside a Grid) would insert as locked notices — refuse it too.
		if ( ! Pro_Gate::are_free_blocks( self::block_names_in( $content ) ) ) {
			return new \WP_Error(
				'sptp_pattern_pro_only',
				__( 'This pattern needs Smart Team Pro. Upgrade to insert it.', 'team-free' ),
				array( 'status' => 403 )
			);
		}

		return rest_ensure_response(
			array(
				'content' => $content,
			)
		);
	}

	/**
	 * Return the favorited pattern IDs.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_favorites(): \WP_REST_Response {
		return rest_ensure_response(
			array(
				'favorites' => PatternFavorites::get_all(),
			)
		);
	}

	/**
	 * Add or remove a pattern from the current user's favorites.
	 *
	 * The durable slug is the stored key; the ID is passed so a pre-slug entry for
	 * the same pattern is rewritten instead of lingering as a duplicate.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function update_favorites( \WP_REST_Request $request ): \WP_REST_Response {
		$pattern_id = $request->get_param( 'id' );
		$slug       = (string) $request->get_param( 'slug' );
		$action     = $request->get_param( 'action' );
		$key        = '' !== $slug ? $slug : $pattern_id;
		$legacy_id  = '' !== $slug ? $pattern_id : null;

		$favorites = 'remove' === $action
			? PatternFavorites::remove( $key, $legacy_id )
			: PatternFavorites::add( $key, $legacy_id );

		return rest_ensure_response(
			array(
				'favorites' => $favorites,
			)
		);
	}

	/**
	 * The `sptp/*` block names opened anywhere in serialized markup.
	 *
	 * @param string $content Serialized block markup.
	 * @return string[]
	 */
	private static function block_names_in( string $content ): array {
		preg_match_all( '/<!--\s+wp:(sptp\/[\w-]+)/i', $content, $matches );

		return array_unique( array_map( 'strtolower', $matches[1] ) );
	}

	/**
	 * Whether serialized markup contains at least one Smart Team block anywhere.
	 *
	 * A cheap gate that keeps foreign payloads from reaching the client; composite
	 * section patterns start with a wrapper, so position is not checked. The
	 * authoritative allow-list is client-side, where the registered block types and
	 * this site's `allowed_block_types` are actually known.
	 *
	 * @param string $content Serialized block markup.
	 * @return bool
	 */
	private static function is_valid_pattern_markup( string $content ): bool {
		if ( strlen( $content ) > PatternRepository::MAX_PAYLOAD_BYTES ) {
			return false;
		}

		return 1 === preg_match( '/<!--\s+wp:sptp\/[\w-]+/i', $content );
	}
}
