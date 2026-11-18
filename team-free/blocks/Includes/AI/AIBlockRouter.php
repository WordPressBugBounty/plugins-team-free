<?php
/**
 * AI Block Router
 *
 * Picks the block an attribute-generation request is built on when the caller
 * only supplied a default.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;

defined( 'ABSPATH' ) || exit;

/**
 * AIBlockRouter class.
 *
 * A prompt typed into the editor-header builder always arrives with the grid
 * default, but the catalog, validator and merge are all per block — so "an
 * autoplay team slider" answered on the grid would drop every carousel value
 * the model produced. This resolves the block from the prompt itself, on the
 * vocabulary `AIPatternMatcher` maintains, only when the words are decisive.
 */
class AIBlockRouter {

	/**
	 * Resolve the block a prompt is asking for.
	 *
	 * @param string $prompt          Natural language prompt.
	 * @param string $requested_block Block the request arrived with.
	 * @return string Fully-qualified block name.
	 */
	public static function resolve( string $prompt, string $requested_block ): string {
		$candidates = self::candidates();
		$terms      = AIPatternMatcher::prompt_terms( $prompt );
		$floor      = AIPatternMatcher::generic_term_weight();

		$best       = '';
		$best_score = 0.0;
		$tied       = false;

		foreach ( $candidates as $slug ) {
			$score = isset( $terms[ $slug ] ) ? (float) $terms[ $slug ] : 0.0;
			if ( $score <= $floor ) {
				continue;
			}

			if ( $score > $best_score ) {
				$best       = $slug;
				$best_score = $score;
				$tied       = false;
			} elseif ( $score === $best_score ) {
				$tied = true;
			}
		}

		return ( '' === $best || $tied ) ? $requested_block : 'sptp/' . $best;
	}

	/**
	 * Free layout blocks this site will actually insert (Overlay is Pro).
	 *
	 * @return string[] Block slugs.
	 */
	public static function candidates(): array {
		return array_values(
			array_filter(
				AICatalogBuilder::BLOCKS,
				static function ( $slug ) {
					return DashboardHelper::is_block_enabled( 'sptp/' . $slug );
				}
			)
		);
	}
}
