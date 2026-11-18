<?php
/**
 * AI Team Builder REST controller.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;


defined( 'ABSPATH' ) || exit;

/**
 * Registers POST /sptp/v1/ai-generate and POST /sptp/v1/ai/verify-key.
 */
class Controller {

	/**
	 * Generations one user may request per window. Each can make two paid
	 * provider calls, and `edit_posts` includes Contributors.
	 */
	const RATE_LIMIT = 20;

	/**
	 * Throttle window, in seconds.
	 */
	const RATE_WINDOW = 10 * MINUTE_IN_SECONDS;

	/**
	 * Largest `existingAttributes` payload accepted, in bytes of JSON. A real
	 * layout block's attributes are a few KB; anything far past that only
	 * inflates the paid prompt.
	 */
	const MAX_ATTRIBUTES_BYTES = 65536;

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			'sptp/v1',
			'/ai-generate',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'generate' ),
				'permission_callback' => array( $this, 'can_generate' ),
				'args'                => array(
					'prompt'             => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_textarea_field',
					),
					'blockName'          => array(
						'default'           => 'sptp/grid',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'existingAttributes' => array(
						'default'           => array(),
						'validate_callback' => static function ( $value ) {
							return is_array( $value );
						},
					),
					// The builder retries with this off when a matched pattern turns
					// out to be unusable in the caller's editor session.
					'allowPatterns'      => array(
						'default'           => true,
						'sanitize_callback' => 'rest_sanitize_boolean',
					),
					// The modal's provider picker; empty asks the Primary.
					'provider'           => array(
						'default'           => '',
						'sanitize_callback' => 'sanitize_key',
						'validate_callback' => static function ( $value ) {
							return '' === $value || in_array( $value, AIKeyManager::PROVIDERS, true );
						},
					),
					'model'              => array(
						'default'           => '',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			'sptp/v1',
			'/ai/verify-key',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'verify_key' ),
				'permission_callback' => array( $this, 'can_manage' ),
				'args'                => array(
					'provider' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
						'validate_callback' => static function ( $value ) {
							return in_array( $value, AIKeyManager::PROVIDERS, true );
						},
					),
					'force'    => array(
						'default'           => false,
						'sanitize_callback' => 'rest_sanitize_boolean',
					),
				),
			)
		);
	}

	/**
	 * The module being off, or the site switching AI off, stops the route
	 * answering whatever the caller's capabilities — hiding the editor entry
	 * points while the route kept generating would make the module state
	 * bypassable. The reason is returned rather than `false` so an editor with
	 * a stale payload is not told it has a login problem.
	 *
	 * @return bool|\WP_Error
	 */
	public function can_generate() {
		if ( ! AIFeature::is_available() ) {
			return AIFeature::unavailable_error();
		}

		return current_user_can( 'edit_posts' );
	}

	/**
	 * Key checks are a settings-screen action.
	 *
	 * @return bool|\WP_Error
	 */
	public function can_manage() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		// is_available(), not only the module: a site that turned AI off
		// (wp_supports_ai) must not send key checks either.
		return AIFeature::is_available() ? true : AIFeature::unavailable_error();
	}

	/**
	 * Answer a prompt with a Ready Pattern or generated attributes.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function generate( $request ) {
		$prompt = trim( (string) $request->get_param( 'prompt' ) );

		if ( '' === $prompt ) {
			return new \WP_Error( 'sptp_ai_empty_prompt', __( 'Please describe the team layout you want to create.', 'team-free' ), array( 'status' => 400 ) );
		}

		$existing = $request->get_param( 'existingAttributes' );
		$existing = is_array( $existing ) ? $existing : array();

		if ( strlen( (string) wp_json_encode( $existing ) ) > self::MAX_ATTRIBUTES_BYTES ) {
			return new \WP_Error( 'sptp_ai_payload_too_large', __( 'This block has too many settings to refine with AI. Try creating a new team layout instead.', 'team-free' ), array( 'status' => 413 ) );
		}

		$throttled = $this->throttle();
		if ( is_wp_error( $throttled ) ) {
			return $throttled;
		}

		$result = AIController::generate_block_config(
			$prompt,
			(string) $request->get_param( 'blockName' ),
			$existing,
			(bool) $request->get_param( 'allowPatterns' ),
			(string) $request->get_param( 'provider' ),
			(string) $request->get_param( 'model' )
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( 'pattern' === $result['mode'] ) {
			return rest_ensure_response(
				array(
					'success'    => true,
					'mode'       => 'pattern',
					'blockName'  => $result['pattern']['blockName'],
					'pattern'    => $result['pattern'],
					'confidence' => $result['confidence'],
					'reason'     => $result['reason'],
				)
			);
		}

		return rest_ensure_response(
			array(
				'success'              => true,
				'mode'                 => 'attributes',
				'blockName'            => $result['blockName'],
				'attributes'           => $result['attributes'],
				'changed'              => $result['changed'],
				'patternDeclineReason' => $result['patternDeclineReason'] ?? '',
			)
		);
	}

	/**
	 * Count this request against the current user's window.
	 *
	 * @return true|\WP_Error
	 */
	private function throttle() {
		/**
		 * Filter how many AI generations a user may request per window.
		 * Return 0 to disable throttling.
		 *
		 * @param int $limit   Requests per window.
		 * @param int $user_id Current user id.
		 */
		$limit = (int) apply_filters( 'sptp_ai_generate_rate_limit', self::RATE_LIMIT, get_current_user_id() );
		if ( $limit <= 0 ) {
			return true;
		}

		$key    = 'sptp_ai_rate_' . get_current_user_id();
		$window = get_transient( $key );
		if ( ! is_array( $window ) || ( $window['start'] ?? 0 ) < time() - self::RATE_WINDOW ) {
			$window = array(
				'start' => time(),
				'count' => 0,
			);
		}

		if ( $window['count'] >= $limit ) {
			return new \WP_Error( 'sptp_ai_rate_limited', __( 'You have sent a lot of AI requests in a short time. Please wait a few minutes and try again.', 'team-free' ), array( 'status' => 429 ) );
		}

		++$window['count'];
		set_transient( $key, $window, self::RATE_WINDOW );

		return true;
	}

	/**
	 * Verify one provider's stored key, reusing a fresh verdict unless forced.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function verify_key( $request ) {
		$provider = (string) $request->get_param( 'provider' );

		return rest_ensure_response(
			array(
				'provider' => $provider,
				'status'   => AIKeyManager::verify_stored_key( $provider, (bool) $request->get_param( 'force' ) ),
			)
		);
	}
}
