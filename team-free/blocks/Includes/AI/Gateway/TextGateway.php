<?php
/**
 * Text Gateway contract
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI\Gateway
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI\Gateway;

defined( 'ABSPATH' ) || exit;

/**
 * One way of getting a JSON completion out of a model.
 *
 * Implementations differ only in how the request is transported and how the
 * credential is obtained; callers see the same string-or-error result either
 * way, so AIController never has to know which one it is holding.
 */
interface TextGateway {

	/**
	 * Temperature every team-layout request runs at.
	 *
	 * Low: the task is filling a fixed attribute schema, not writing prose.
	 */
	const TEMPERATURE = 0.2;

	/**
	 * Output cap for one completion.
	 *
	 * A full-coverage response against AICatalogBuilder's catalog — layoutOptions
	 * + sliderOptions + imageOptions + contentOptions + contentAreaOptions, plus
	 * navigationOptions/paginationDotsOptions on the 5 blocks that have them —
	 * can run past 1024 tokens and get truncated mid-JSON, which then fails
	 * json_decode() for a token-budget reason invisible to the user.
	 */
	const MAX_TOKENS = 4096;

	/**
	 * Request one JSON completion.
	 *
	 * @param string $system System prompt.
	 * @param string $user   User message.
	 * @return string|\WP_Error Raw response text, or WP_Error on failure.
	 */
	public function generate_json( string $system, string $user );

	/**
	 * Provider slug this gateway is configured for.
	 *
	 * @return string Provider slug.
	 */
	public function get_provider(): string;
}
