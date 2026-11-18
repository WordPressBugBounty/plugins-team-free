<?php
/**
 * AI Key Validator
 *
 * Answers one question about an API key: does the provider accept it. The
 * settings screen used to answer a different one — is the field non-empty —
 * and reported "Configured" for anything typed into it, including `abcd`.
 * A key that fails here is never stored, so no screen can claim a credential
 * the provider would reject.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

defined( 'ABSPATH' ) || exit;

/**
 * AIKeyValidator class.
 *
 * Verification is a GET against the provider's model-list endpoint, not a
 * completion: it authenticates exactly like a real request, costs no tokens,
 * and cannot be charged to the site owner for pressing Save.
 */
class AIKeyValidator {

	/**
	 * The provider accepted the key.
	 */
	const STATE_VALID = 'valid';

	/**
	 * The provider rejected the key, or it cannot be one.
	 */
	const STATE_INVALID = 'invalid';

	/**
	 * The provider could not be reached, so the key is neither proven nor disproven.
	 */
	const STATE_UNVERIFIED = 'unverified';

	/**
	 * Nothing was submitted (blank or whitespace-only field).
	 */
	const STATE_EMPTY = 'empty';

	/**
	 * A key is stored but has never been checked, or the check went stale.
	 */
	const STATE_UNKNOWN = 'unknown';

	/**
	 * No key is stored for this provider.
	 */
	const STATE_NONE = 'none';

	/**
	 * How long to wait on a provider before giving up on verifying.
	 *
	 * Shorter than a generation request (RemoteHttpGateway::TIMEOUT): this runs
	 * while an admin waits on a Save button, and a slow provider must degrade to
	 * "could not verify" rather than hold the screen for half a minute.
	 */
	const TIMEOUT = 12;

	/**
	 * Shortest string any provider's key can be.
	 *
	 * Every provider in this plugin issues keys far longer than this; the floor
	 * only exists to answer obvious junk (`abcd`) without a network round trip.
	 * Anything above it is decided by the provider, never by a guessed format —
	 * key formats change, and a local regex that outlives one would reject a
	 * working key with no way for the user to override it.
	 */
	const MIN_KEY_LENGTH = 8;

	/**
	 * Provider display names, for messages the user reads.
	 *
	 * @var array<string, string>
	 */
	const PROVIDER_LABELS = array(
		'openai'    => 'OpenAI',
		'anthropic' => 'Anthropic',
		'gemini'    => 'Google Gemini',
		'groq'      => 'Groq',
	);

	/**
	 * Verify an API key with its provider.
	 *
	 * @param string $provider Provider slug.
	 * @param string $api_key  Plaintext key as submitted.
	 * @return array{state: string, message: string} Verdict.
	 */
	public static function validate( string $provider, string $api_key ): array {
		$api_key = trim( $api_key );

		$shape_verdict = self::check_shape( $provider, $api_key );
		if ( null !== $shape_verdict ) {
			return $shape_verdict;
		}

		$request = self::probe_request( $provider, $api_key );
		if ( empty( $request ) ) {
			return self::verdict( self::STATE_UNVERIFIED, __( 'This AI provider is not recognized, so its API key could not be verified.', 'team-free' ) );
		}

		$response = wp_remote_get(
			$request['url'],
			array(
				'timeout' => self::TIMEOUT,
				'headers' => $request['headers'],
			)
		);

		if ( is_wp_error( $response ) ) {
			return self::verdict(
				self::STATE_UNVERIFIED,
				sprintf(
					/* translators: 1: AI provider name, 2: connection error returned by WordPress. */
					__( 'Could not reach %1$s to verify this API key (%2$s).', 'team-free' ),
					self::provider_label( $provider ),
					$response->get_error_message()
				)
			);
		}

		return self::interpret(
			$provider,
			(int) wp_remote_retrieve_response_code( $response ),
			json_decode( wp_remote_retrieve_body( $response ), true )
		);
	}

	/**
	 * Human-readable provider name.
	 *
	 * @param string $provider Provider slug.
	 * @return string Display name, falling back to the slug.
	 */
	public static function provider_label( string $provider ): string {
		return self::PROVIDER_LABELS[ $provider ] ?? $provider;
	}

	/**
	 * Explain a provider refusing a key, and say what to do about it.
	 *
	 * Shared with AIKeyManager, which records the same refusal when it arrives
	 * during a real generation request rather than during a save — the user
	 * reads it in the same place either way, so it should read the same way.
	 *
	 * @param string $provider         Provider slug.
	 * @param string $provider_message The provider's own explanation, when it gave one.
	 * @return string Message.
	 */
	public static function rejection_message( string $provider, string $provider_message = '' ): string {
		$label = self::provider_label( $provider );

		if ( '' !== $provider_message ) {
			return sprintf(
				/* translators: 1: AI provider name, 2: the provider's own error message. */
				__( '%1$s rejected this API key: %2$s Paste a valid key to replace it.', 'team-free' ),
				$label,
				$provider_message
			);
		}

		return sprintf(
			/* translators: %s: AI provider name, e.g. "OpenAI". */
			__( '%s rejected this API key. Paste a valid key to replace it.', 'team-free' ),
			$label
		);
	}

	/**
	 * Reject a submission no provider could accept, without spending a request.
	 *
	 * @param string $provider Provider slug.
	 * @param string $api_key  Trimmed key.
	 * @return array{state: string, message: string}|null Verdict, or null to go on and ask the provider.
	 */
	private static function check_shape( string $provider, string $api_key ): ?array {
		if ( '' === $api_key ) {
			return self::verdict( self::STATE_EMPTY, __( 'Enter an API key — the field is empty.', 'team-free' ) );
		}

		$label = self::provider_label( $provider );

		// A key is sent in an HTTP header or query string, so whitespace and
		// control characters cannot appear in one. They are, however, exactly
		// what a paste of surrounding text or a wrapped line looks like.
		if ( preg_match( '/[\s\x00-\x1f\x7f]/', $api_key ) ) {
			return self::verdict(
				self::STATE_INVALID,
				sprintf(
					/* translators: %s: AI provider name, e.g. "OpenAI". */
					__( 'This does not look like a %s API key — it contains spaces or line breaks. Paste the key on its own.', 'team-free' ),
					$label
				)
			);
		}

		if ( strlen( $api_key ) < self::MIN_KEY_LENGTH ) {
			return self::verdict(
				self::STATE_INVALID,
				sprintf(
					/* translators: %s: AI provider name, e.g. "OpenAI". */
					__( 'This is too short to be a %s API key. Paste the full key.', 'team-free' ),
					$label
				)
			);
		}

		return null;
	}

	/**
	 * The cheapest authenticated request each provider serves.
	 *
	 * Every one of these lists models: it exercises the same credential a
	 * completion would, returns in milliseconds, and is not billed.
	 *
	 * @param string $provider Provider slug.
	 * @param string $api_key  Plaintext key.
	 * @return array{url: string, headers: array<string, string>} Request parts, or an empty array for an unknown provider.
	 */
	private static function probe_request( string $provider, string $api_key ): array {
		if ( 'gemini' === $provider ) {
			return array(
				'url'     => 'https://generativelanguage.googleapis.com/v1beta/models',
				'headers' => array( 'x-goog-api-key' => $api_key ),
			);
		}

		if ( 'anthropic' === $provider ) {
			return array(
				'url'     => 'https://api.anthropic.com/v1/models?limit=1',
				'headers' => array(
					'x-api-key'         => $api_key,
					'anthropic-version' => '2023-06-01',
				),
			);
		}

		if ( 'openai' === $provider ) {
			return array(
				'url'     => 'https://api.openai.com/v1/models',
				'headers' => array( 'Authorization' => 'Bearer ' . $api_key ),
			);
		}

		if ( 'groq' === $provider ) {
			return array(
				'url'     => 'https://api.groq.com/openai/v1/models',
				'headers' => array( 'Authorization' => 'Bearer ' . $api_key ),
			);
		}

		return array();
	}

	/**
	 * Turn a provider's answer into a verdict.
	 *
	 * Only an authentication refusal proves a key wrong. A provider outage, a
	 * moved endpoint or a rate limit says nothing about the credential, and
	 * recording those as "invalid" would throw away a key that works.
	 *
	 * @param string     $provider Provider slug.
	 * @param int        $status   HTTP status code.
	 * @param array|null $data     Decoded response body.
	 * @return array{state: string, message: string}
	 */
	private static function interpret( string $provider, int $status, $data ): array {
		$provider_message = is_array( $data ) && isset( $data['error']['message'] ) && is_scalar( $data['error']['message'] )
			? sanitize_text_field( (string) $data['error']['message'] )
			: '';

		if ( 200 === $status ) {
			return self::verdict( self::STATE_VALID, '' );
		}

		// 429 means the key was accepted and then throttled — an authenticated
		// answer, so the credential itself is proven good.
		if ( 429 === $status ) {
			return self::verdict( self::STATE_VALID, '' );
		}

		// Gemini answers a bad key with 400 API_KEY_INVALID rather than 401.
		$is_gemini_key_error = 400 === $status && 'gemini' === $provider;

		if ( 401 === $status || $is_gemini_key_error ) {
			return self::verdict( self::STATE_INVALID, self::rejection_message( $provider, $provider_message ) );
		}

		// 403 is deliberately not a refusal of the key. Providers also use it
		// for an unsupported region, a project-scoped key, and a model the
		// organization may not call — all of which happen with a perfectly good
		// credential, and none of which should switch the feature off.
		if ( '' !== $provider_message ) {
			return self::verdict(
				self::STATE_UNVERIFIED,
				sprintf(
					/* translators: 1: AI provider name, 2: the provider's own error message. */
					__( 'Could not verify this API key — %1$s answered: %2$s', 'team-free' ),
					self::provider_label( $provider ),
					$provider_message
				)
			);
		}

		return self::verdict(
			self::STATE_UNVERIFIED,
			sprintf(
				/* translators: 1: AI provider name, 2: HTTP status code returned by the provider. */
				__( 'Could not verify this API key — %1$s answered with HTTP %2$d.', 'team-free' ),
				self::provider_label( $provider ),
				$status
			)
		);
	}

	/**
	 * Shape one verdict.
	 *
	 * @param string $state   One of the STATE_* constants.
	 * @param string $message User-facing explanation, empty when there is nothing to explain.
	 * @return array{state: string, message: string}
	 */
	private static function verdict( string $state, string $message ): array {
		return array(
			'state'   => $state,
			'message' => $message,
		);
	}
}
