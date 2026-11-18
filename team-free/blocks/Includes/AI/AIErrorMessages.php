<?php
/**
 * AI Error Messages
 *
 * Rewrites transport and provider failures into plain-language messages for
 * the Create Team with AI popup. Providers answer with developer text
 * ("Incorrect API key provided: sk-…", "cURL error 28: Operation timed out")
 * that tells an editor nothing about what to do next.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

defined( 'ABSPATH' ) || exit;

/**
 * AIErrorMessages class.
 */
class AIErrorMessages {

	/**
	 * Error codes whose message this plugin already wrote for an editor.
	 */
	const OWN_CODES = array(
		'sptp_ai_empty_prompt',
		'sptp_ai_payload_too_large',
		'sptp_ai_rate_limited',
		'sptp_ai_module_disabled',
		'sptp_ai_disabled',
		'sptp_ai_missing_key',
		'sptp_ai_connector_unavailable',
		'sptp_ai_invalid_json',
	);

	/**
	 * Provider display names.
	 */
	const PROVIDER_LABELS = array(
		'openai'    => 'OpenAI',
		'anthropic' => 'Anthropic',
		'gemini'    => 'Google Gemini',
		'groq'      => 'Groq',
	);

	/**
	 * Replace an error's message with one an editor can act on.
	 *
	 * @param \WP_Error $error    Original error.
	 * @param string    $provider Provider slug the request went to.
	 * @return \WP_Error
	 */
	public static function humanize( \WP_Error $error, string $provider = '' ): \WP_Error {
		$code = (string) $error->get_error_code();

		if ( in_array( $code, self::OWN_CODES, true ) ) {
			return $error;
		}

		$data   = $error->get_error_data();
		$status = is_array( $data ) && isset( $data['status'] ) ? (int) $data['status'] : 0;

		return new \WP_Error(
			// The popup only trusts sptp_ai_* messages; the original code stays an input to message_for().
			'sptp_ai_provider_error',
			self::message_for( $code, $status, strtolower( $error->get_error_message() ), self::provider_label( $provider ) ),
			// The browser only needs a status; the provider's own text can echo key fragments.
			array( 'status' => $status >= 400 ? $status : 502 )
		);
	}

	/**
	 * Pick the message for a failure.
	 *
	 * @param string $code     Original error code.
	 * @param int    $status   Provider HTTP status, 0 for a transport failure.
	 * @param string $raw      Lower-cased original message.
	 * @param string $provider Provider display name.
	 * @return string
	 */
	private static function message_for( string $code, int $status, string $raw, string $provider ): string {
		if ( self::contains( $raw, array( 'timed out', 'timeout', 'curl error 28' ) ) ) {
			return __( 'The AI service took too long to respond. Please try again in a moment.', 'team-free' );
		}

		if ( self::contains( $raw, array( 'quota', 'billing', 'credit', 'insufficient_funds', 'payment' ) ) ) {
			/* translators: %s: AI provider name */
			return sprintf( __( 'Your account with %s has run out of credits or reached its usage limit. Check your plan and billing with the provider, then try again.', 'team-free' ), $provider );
		}

		if ( 401 === $status || self::contains( $raw, array( 'api key', 'api_key', 'unauthorized', 'authentication' ) ) ) {
			/* translators: %s: AI provider name */
			return sprintf( __( 'Your API key was not accepted by %s. Please check the key in Smart Team → Settings → AI Configuration.', 'team-free' ), $provider );
		}

		if ( 429 === $status || self::contains( $raw, array( 'rate limit', 'too many requests' ) ) ) {
			/* translators: %s: AI provider name */
			return sprintf( __( 'Too many requests are being sent to %s right now. Please wait a minute and try again.', 'team-free' ), $provider );
		}

		if ( 404 === $status || self::contains( $raw, array( 'model not found', 'does not exist', 'not supported' ) ) ) {
			return __( 'The selected AI model is not available. Please choose a different model in Smart Team → Settings → AI Configuration.', 'team-free' );
		}

		if ( 403 === $status ) {
			/* translators: %s: AI provider name */
			return sprintf( __( 'Your account with %s does not have access to this model, or the service is not available in your region. Try another model or check your provider account.', 'team-free' ), $provider );
		}

		if ( $status >= 500 ) {
			return __( 'The AI service is temporarily unavailable. Please try again in a few minutes.', 'team-free' );
		}

		if ( 400 === $status || 413 === $status ) {
			return __( 'The AI service could not process this request. Try a shorter or simpler description.', 'team-free' );
		}

		if ( 'http_request_failed' === $code ) {
			return __( 'Could not connect to the AI service. Please check your site’s internet connection and try again.', 'team-free' );
		}

		return __( 'Something went wrong while talking to the AI service. Please try again.', 'team-free' );
	}

	/**
	 * Whether any needle appears in the haystack.
	 *
	 * @param string   $haystack Text to search.
	 * @param string[] $needles  Phrases to look for.
	 * @return bool
	 */
	private static function contains( string $haystack, array $needles ): bool {
		foreach ( $needles as $needle ) {
			if ( false !== strpos( $haystack, $needle ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Display name for a provider slug.
	 *
	 * @param string $provider Provider slug.
	 * @return string
	 */
	public static function provider_label( string $provider ): string {
		return self::PROVIDER_LABELS[ $provider ] ?? __( 'the AI provider', 'team-free' );
	}

	/**
	 * Why a provider request failed, as one key the builder can phrase:
	 * `limit` (quota, rate limit, credits, overload), `incomplete` (no usable
	 * JSON), `timeout`, `auth` (key or permission refused) or `error`. Port of
	 * testimonial-pro's AI::failure_reason(); providers share no error code, so
	 * the raw message is matched.
	 *
	 * @param \WP_Error $error Raw failure, before humanize().
	 * @return string Reason key.
	 */
	public static function failure_reason( \WP_Error $error ): string {
		$code    = (string) $error->get_error_code();
		$message = $error->get_error_message();
		$data    = $error->get_error_data();
		$status  = is_array( $data ) && isset( $data['status'] ) ? (int) $data['status'] : 0;

		if ( 429 === $status || preg_match( '/quota|rate[ _-]?limit|exhausted|too many requests|overloaded|credit|billing|exceeded/i', $message ) ) {
			return 'limit';
		}

		if ( 'sptp_ai_invalid_json' === $code ) {
			return 'incomplete';
		}

		if ( preg_match( '/timed? ?out|cURL error 28/i', $message ) ) {
			return 'timeout';
		}

		if ( in_array( $status, array( 401, 403 ), true ) || 'sptp_ai_missing_key' === $code || preg_match( '/api[ _-]?key|unauthori[sz]ed|authenticat|permission/i', $message ) ) {
			return 'auth';
		}

		return 'error';
	}
}
