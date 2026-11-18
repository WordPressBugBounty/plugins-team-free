<?php
/**
 * AI Controller
 *
 * Orchestrates team-layout generation: Ready Pattern matching first, attribute
 * generation second. Transport lives behind a TextGateway, so this class never
 * knows whether the request goes out through WordPress Connectors or through
 * this plugin's own stored key.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

use ShapedPlugin\WPTeam\Blocks\Includes\AI\Gateway\GatewayResolver;
use ShapedPlugin\WPTeam\Blocks\Includes\AI\Gateway\RemoteHttpGateway;
use ShapedPlugin\WPTeam\Blocks\Includes\AI\Gateway\TextGateway;

defined( 'ABSPATH' ) || exit;

/**
 * AIController class.
 */
class AIController {

	/**
	 * Longest prompt sent to a provider. Anything past this is layout prose, not intent.
	 */
	const MAX_PROMPT_LENGTH = 1000;

	/**
	 * Build a team layout block from a natural language prompt.
	 *
	 * Ready Patterns come first: a prompt a published pattern already answers is
	 * served by inserting that pattern, so nothing has to be assembled attribute by
	 * attribute. Attribute generation runs only when no pattern fits the request,
	 * and then on the block the prompt itself names (`AIBlockRouter`) — the
	 * returned `blockName` is what the editor should build, not necessarily what
	 * it asked for.
	 *
	 * @param string $prompt User prompt string.
	 * @param string $block_name Target block slug, a default the prompt may override.
	 * @param array  $existing_attributes Existing attributes map if updating.
	 * @param bool   $allow_patterns Whether a Ready Pattern may answer this prompt.
	 * @param string $provider Provider the builder picked, or empty for the Primary. Only it is asked — the modal offers the next one on failure.
	 * @param string $model Model the builder picked for that provider, or empty.
	 * @return array|\WP_Error Mode-tagged result array, or WP_Error whose data carries provider, label and reason.
	 */
	public static function generate_block_config( string $prompt, string $block_name = 'sptp/grid', array $existing_attributes = array(), bool $allow_patterns = true, string $provider = '', string $model = '' ) {
		$gateway = GatewayResolver::resolve( $provider, $model );
		if ( is_wp_error( $gateway ) ) {
			// A missing key is this provider's problem; AI being off is everyone's.
			return 'sptp_ai_missing_key' === $gateway->get_error_code()
				? self::tag_failure( $gateway, $gateway, '' !== $provider ? $provider : AIKeyManager::get_settings()['provider'] )
				: $gateway;
		}

		$prompt     = self::trim_prompt( $prompt );
		$block_name = 'sptp/' . AICatalogBuilder::slug( $block_name );

		// Set only when a pattern was actually attempted and the model explicitly
		// declined every candidate (e.g. "no candidate includes X, Y, and Z
		// together") — not for allow_patterns=false, an empty shortlist, or an
		// upstream HTTP/parse failure, none of which are a real "no fit" verdict
		// worth telling the user about.
		$pattern_decline_reason = '';

		if ( $allow_patterns && AIPatternMatcher::allows_pattern_insert( $existing_attributes ) ) {
			$pattern_result = self::match_ready_pattern( $gateway, $prompt, $block_name );
			if ( is_array( $pattern_result['match'] ) ) {
				return array(
					'mode'       => 'pattern',
					'pattern'    => $pattern_result['match']['pattern'],
					'confidence' => $pattern_result['match']['confidence'],
					'reason'     => $pattern_result['match']['reason'],
				);
			}
			$pattern_decline_reason = $pattern_result['declineReason'];
		}

		// No pattern answered the prompt, so this block is built from its own
		// settings — and every layer below reads them per block. A request that
		// names a block of its own has to reach it here, or it is answered with
		// another block's catalog and its own settings are dropped as unknown.
		// Only a fresh build is routed: existing attributes mean an author is
		// configuring a block that already exists, and that block is the answer.
		if ( empty( $existing_attributes ) ) {
			$block_name = AIBlockRouter::resolve( $prompt, $block_name );
		}

		$raw_json = $gateway->generate_json(
			AIPromptBuilder::get_system_prompt( $block_name ),
			AIPromptBuilder::build_user_message( $prompt, $block_name, $existing_attributes )
		);

		if ( is_wp_error( $raw_json ) ) {
			self::note_rejected_key( $gateway, $raw_json );
			return self::tag_failure( $raw_json, AIErrorMessages::humanize( $raw_json, $gateway->get_provider() ), $gateway->get_provider() );
		}

		$parsed = self::decode_json_response( $raw_json );
		if ( ! is_array( $parsed ) ) {
			$invalid = new \WP_Error(
				'sptp_ai_invalid_json',
				__( 'The AI sent back a response that could not be used. Please try again — rephrasing your description can help.', 'team-free' ),
				array( 'status' => 500 )
			);
			return self::tag_failure( $invalid, $invalid, $gateway->get_provider() );
		}

		$result = AISchemaValidator::sanitize_and_merge( $parsed, $block_name, $existing_attributes );

		return array(
			'mode'                 => 'attributes',
			'blockName'            => $block_name,
			'attributes'           => $result['attributes'],
			'changed'              => $result['changed'],
			'patternDeclineReason' => $pattern_decline_reason,
		);
	}

	/**
	 * Ask the model to pick a Ready Pattern for the prompt.
	 *
	 * No candidates means no request: a prompt nothing in the catalog resembles is
	 * not worth a round-trip. A failed or unusable selection resolves to a null
	 * match so the caller falls through to attribute generation — but unlike a
	 * bare null, this always reports why, when the model itself said why.
	 *
	 * @param TextGateway $gateway    Resolved transport.
	 * @param string      $prompt     Sanitized user prompt.
	 * @param string      $block_name Target block slug.
	 * @return array{match: array{pattern: array, confidence: float, reason: string}|null, declineReason: string}
	 */
	private static function match_ready_pattern( TextGateway $gateway, string $prompt, string $block_name ): array {
		$no_match = array(
			'match'         => null,
			'declineReason' => '',
		);

		$candidates = AIPatternMatcher::shortlist( $prompt, $block_name );
		if ( empty( $candidates ) ) {
			return $no_match;
		}

		$raw_json = $gateway->generate_json(
			AIPromptBuilder::get_pattern_selection_prompt(),
			AIPromptBuilder::build_pattern_selection_message(
				$prompt,
				$block_name,
				AIPatternMatcher::to_prompt_payload( $candidates )
			)
		);

		if ( is_wp_error( $raw_json ) ) {
			return $no_match;
		}

		$selection = self::decode_json_response( $raw_json );
		if ( ! is_array( $selection ) ) {
			return $no_match;
		}

		$match = AIPatternMatcher::resolve_selection( $selection, $candidates );

		return array(
			'match'         => $match,
			'declineReason' => null === $match && isset( $selection['reason'] ) && is_scalar( $selection['reason'] )
				? sanitize_text_field( (string) $selection['reason'] )
				: '',
		);
	}

	/**
	 * Attach which provider failed and why, so the builder can offer the next
	 * connected provider instead of a dead end.
	 *
	 * @param \WP_Error $raw      Failure as the provider reported it.
	 * @param \WP_Error $shown    Failure as the editor will see it.
	 * @param string    $provider Provider slug.
	 * @return \WP_Error The shown error, tagged.
	 */
	private static function tag_failure( \WP_Error $raw, \WP_Error $shown, string $provider ): \WP_Error {
		$data = $shown->get_error_data();
		$shown->add_data(
			array_merge(
				is_array( $data ) ? $data : array(),
				array(
					'provider' => $provider,
					'label'    => AIErrorMessages::provider_label( $provider ),
					'reason'   => AIErrorMessages::failure_reason( $raw ),
				)
			)
		);

		return $shown;
	}

	/**
	 * Record a provider refusing the key this plugin stores for it.
	 *
	 * Keys are revoked, rotated, and attached to accounts that stop paying long
	 * after they were verified. Without this, the settings screen keeps showing
	 * a key that worked once as current, and the only symptom is every
	 * generation failing.
	 *
	 * Only this plugin's own stored keys are marked: a credential held by
	 * WordPress Connectors is not ours to judge, and the key stored here as a
	 * fallback may be perfectly good.
	 *
	 * @param TextGateway $gateway Gateway that made the request.
	 * @param \WP_Error   $error   Error it returned.
	 * @return void
	 */
	private static function note_rejected_key( TextGateway $gateway, \WP_Error $error ): void {
		if ( ! $gateway instanceof RemoteHttpGateway ) {
			return;
		}

		$data    = $error->get_error_data();
		$status  = is_array( $data ) && isset( $data['status'] ) ? (int) $data['status'] : 0;
		$message = $error->get_error_message();

		// Gemini answers a bad key with 400 and says so in the message, where
		// every other provider here uses 401. 403 is left out on purpose: it is
		// also how providers report an unsupported region, a project-scoped key
		// or a model the organization cannot call, and switching AI off over one
		// of those would disable the feature for a working credential.
		$is_gemini_key_error = 400 === $status
			&& 'gemini' === $gateway->get_provider()
			&& false !== stripos( $message, 'api key' );

		if ( 401 !== $status && ! $is_gemini_key_error ) {
			return;
		}

		AIKeyManager::mark_key_invalid( $gateway->get_provider(), $message );
	}

	/**
	 * Decode a model response, tolerating markdown code fences.
	 *
	 * @param string $raw_json Raw response text.
	 * @return array|null Decoded array or null when unparseable.
	 */
	private static function decode_json_response( string $raw_json ): ?array {
		$clean_json = trim( $raw_json );
		$clean_json = preg_replace( '/^```(?:json)?\s*/i', '', $clean_json );
		$clean_json = preg_replace( '/\s*```$/', '', (string) $clean_json );

		$parsed = json_decode( (string) $clean_json, true );

		return is_array( $parsed ) ? $parsed : null;
	}

	/**
	 * Constrain a prompt to the length a provider is asked to read.
	 *
	 * @param string $prompt Raw prompt.
	 * @return string
	 */
	private static function trim_prompt( string $prompt ): string {
		$prompt = trim( $prompt );

		return mb_strlen( $prompt ) > self::MAX_PROMPT_LENGTH
			? mb_substr( $prompt, 0, self::MAX_PROMPT_LENGTH )
			: $prompt;
	}
}
