<?php
/**
 * AI Prompt Builder
 *
 * Constructs system and user prompts for translating natural language into
 * Smart Team layout-block attributes (the free Grid and Carousel blocks).
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

defined( 'ABSPATH' ) || exit;

/**
 * AIPromptBuilder class.
 */
class AIPromptBuilder {

	/**
	 * System prompt instructing the model to generate attribute JSON.
	 *
	 * @param string $block_name Target block name.
	 * @return string System prompt.
	 */
	public static function get_system_prompt( string $block_name = 'sptp/grid' ): string {
		$slug     = AICatalogBuilder::slug( $block_name );
		$catalog  = AICatalogBuilder::get_catalog( $slug );
		$rules    = self::design_rules( $slug );
		$examples = self::worked_examples( $slug );

		return "You are a senior web designer configuring the Smart Team plugin inside the WordPress block editor.
Your job is to translate a user's natural language prompt into a finished, presentable team-member showcase for the \"sptp/{$slug}\" block — not the smallest set of settings that technically answers the words.

The members themselves (names, photos, job titles, bios) come from the site's Team Members and are never part of your output. You configure how they are laid out, which of their details are shown, and how the cards look.

Output Requirements:
1. Output ONLY a valid raw JSON object containing only block attributes. Do NOT wrap it in markdown or backticks.
2. Attributes available for this block:
{$catalog}
3. Return only attributes from the catalog above. Do not invent keys, and never use a value the catalog does not list — an unlisted value is discarded and the setting silently stays at its default.

Design Rules:
{$rules}

Worked Examples (these show the expected shape and level of finish — adapt the values to the actual request, never copy them):
{$examples}";
	}

	/**
	 * The design rules a generated configuration is judged against.
	 *
	 * Attribute generation runs only when no Ready Pattern fits, so its output
	 * is the whole answer. Left to the catalog alone a model sets the two or
	 * three things the prompt literally names and stops.
	 *
	 * @param string $slug Block slug.
	 * @return string Numbered rule list.
	 */
	private static function design_rules( string $slug ): string {
		$design_rule = '2. Always choose "cardDesign" for a new block, matching the request: card-1 (photo on top, centred text) suits most teams and staff directories; card-2 (photo beside the text) suits a roomy leadership or board page; card-3 (text panel overlapping the photo) suits a modern, photo-led look.';

		return '1. Answer the whole request, then finish the design. Every setting the prompt names is mandatory; beyond those, set the few more that make the result look deliberate (a card design, spacing, a card treatment, type colors) and leave everything else alone.
' . $design_rule . '
3. Set the responsive trio together. Whenever you set "columns", give Desktop, Tablet and Mobile (a sensible ladder is 4/2/1, 3/2/1 or 2/1/1).
4. Give text room. When the card gets a background, border or shadow, also set "cardPadding" (about 20-24px) or the text sits flush against the card edge.
5. Show what the request asks for. "Social links" means "social"; "skills" means "skills"; a "minimal" card hides "bio". Contact details and custom fields are not available on this site — when asked for them, configure everything else and leave them out. Hide what a minimal request would not show.
6. Respect what a value implies. Autoplay is only comfortable with "pauseOnHover": true.
7. Keep text readable. Set colors as a pair — a near-black name on a light card, near-white on a dark card or photo. On a dark "sectionBg" or "cardBg", recolor "nameColor", "roleColor" and "bioColor" to light values.
8. Prefer restraint. One accent color, one shadow depth, one radius across the block. Do not set an option the request neither asks for nor needs.';
	}

	/**
	 * Complete example responses, one per common request shape.
	 *
	 * Deliberately different from each other (light grid vs. dark carousel vs.
	 * a one-key refine) so they read as a range, not a template.
	 *
	 * @param string $slug Block slug.
	 * @return string Prompt/response pairs.
	 */
	private static function worked_examples( string $slug ): string {
		$radius = array(
			'value'     => array(
				'top'    => 12,
				'right'  => 12,
				'bottom' => 12,
				'left'   => 12,
			),
			'unit'      => 'px',
			'allChange' => true,
		);

		$card_example = array(
			'cardDesign'       => 'card-3',
			'columns'          => array(
				'device' => array(
					'Desktop' => 3,
					'Tablet'  => 2,
					'Mobile'  => 1,
				),
			),
			'contentAlignment' => 'center',
			'elements'         => array(
				'bio'    => true,
				'social' => true,
			),
			'cardBg'           => array(
				'color' => array(
					'style'      => 'bgColor',
					'solidColor' => '#ffffff',
				),
			),
			'cardBorderRadius' => $radius,
			'cardPadding'      => array(
				'device'    => array(
					'Desktop' => array(
						'top'    => 24,
						'right'  => 24,
						'bottom' => 24,
						'left'   => 24,
					),
				),
				'unit'      => array( 'Desktop' => 'px' ),
				'allChange' => true,
			),
			'cardBoxShadow'    => array(
				'isActive'      => true,
				'selectDefault' => 'var(--sp-smart-team-shadow-light-2dp)',
			),
			'nameColor'        => '#111827',
			'roleColor'        => '#6b7280',
			'nameFontSize'     => array(
				'device' => array(
					'Desktop' => 20,
					'Mobile'  => 18,
				),
			),
			'nameTypography'   => array( 'typography' => array( 'fontWeight' => '600' ) ),
		);

		if ( 'grid' === $slug ) {
			$card_example['horizontalGap'] = array(
				'value' => 28,
				'unit'  => 'px',
			);
			$card_example['verticalGap']   = array(
				'value' => 28,
				'unit'  => 'px',
			);
		}

		$first_request = 'a 3-column team grid with bios, social icons and rounded white cards';
		$examples      = 'Request: "' . $first_request . '"' . "\nResponse: " . wp_json_encode( $card_example );

		if ( 'grid' !== $slug ) {
			$dark_carousel = array(
				'cardDesign'                => 'card-1',
				'columns'                   => array(
					'device' => array(
						'Desktop' => 4,
						'Tablet'  => 2,
						'Mobile'  => 1,
					),
				),
				'sliderAutoPlay'            => true,
				'carouselAutoplayDelay'     => array(
					'value' => 4000,
					'unit'  => 'ms',
				),
				'pauseOnHover'              => true,
				'enablePaginationDots'      => true,
				'paginationStyle'           => 'dots',
				'paginationDotsColor'       => 'rgba(255,255,255,0.35)',
				'paginationDotsActiveColor' => '#ffffff',
				'sectionBg'                 => array(
					'color' => array(
						'style'      => 'bgColor',
						'solidColor' => '#0b1220',
					),
				),
				'sectionPadding'            => array(
					'device'    => array(
						'Desktop' => array(
							'top'    => 48,
							'right'  => 24,
							'bottom' => 48,
							'left'   => 24,
						),
					),
					'unit'      => array( 'Desktop' => 'px' ),
					'allChange' => false,
				),
				'nameColor'                 => '#ffffff',
				'roleColor'                 => 'rgba(255,255,255,0.75)',
			);

			$examples .= "\n\nRequest: \"dark autoplay team slider, 4 across\"\nResponse: " . wp_json_encode( $dark_carousel );
		}

		$examples .= "\n\nRequest (a refinement of an existing block): \"make the photos round with a zoom on hover\"\nResponse: " . wp_json_encode(
			array(
				'imageBorderRadius'  => array(
					'value'     => array(
						'top'    => 50,
						'right'  => 50,
						'bottom' => 50,
						'left'   => 50,
					),
					'unit'      => '%',
					'allChange' => true,
				),
				'imageHoverEffect'  => 'zoom-in',
			)
		);

		return $examples;
	}

	/**
	 * System prompt for picking a Ready Pattern from a shortlist.
	 *
	 * @return string System prompt.
	 */
	public static function get_pattern_selection_prompt(): string {
		return 'You match a WordPress user\'s request to one pre-built Smart Team "Ready Pattern" — a finished team-member showcase layout.

You are given candidate patterns as pipe-delimited lines:
slug | name | block | use-cases | tags | complexity | description

Output Requirements:
1. Output ONLY a raw JSON object. No markdown, no backticks, no prose.
2. Shape: {"slug": "<candidate slug or empty string>", "confidence": <number between 0 and 1>, "reason": "<max 20 words>"}
3. Pick a candidate only when it genuinely delivers what the user asked for — a compatible layout (grid or carousel) and a compatible look or purpose (leadership page, staff directory, dark, minimal, …).
4. A pattern that merely shares a block type is NOT a match. Prefer an empty slug over a loose one.
5. Set "slug" to "" when no candidate fits, when the request is only about settings (columns, speed, colors) rather than a design, or when you are unsure.
6. Never invent a slug: it must be copied exactly from a candidate line.
7. A candidate that cannot deliver a structural property the request states outright — a column count, a carousel vs. a grid, a dark background — is not a match however closely its wording fits.
8. "confidence" reflects how well the chosen candidate satisfies the request; below 0.6 the pattern is discarded.';
	}

	/**
	 * User message for pattern selection.
	 *
	 * @param string $prompt     Natural language user prompt.
	 * @param string $block_name Target block name.
	 * @param string $candidates Pipe-delimited candidate lines.
	 * @return string
	 */
	public static function build_pattern_selection_message( string $prompt, string $block_name, string $candidates ): string {
		$message  = "Requested Block: {$block_name} (a default unless the request names another layout)\n";
		$message .= "User Request: \"{$prompt}\"\n\n";
		$message .= "Candidate Patterns:\n{$candidates}\n\n";
		$message .= 'Return the selection JSON:';

		return $message;
	}

	/**
	 * User message for attribute generation, with the block's current values
	 * for catalog options when refining.
	 *
	 * @param string $prompt              Natural language user prompt.
	 * @param string $block_name          Target block name.
	 * @param array  $existing_attributes Existing block attributes if updating.
	 * @return string
	 */
	public static function build_user_message( string $prompt, string $block_name = 'sptp/grid', array $existing_attributes = array() ): string {
		$message  = "Target Block: {$block_name}\n";
		$message .= "User Request: \"{$prompt}\"\n";

		$relevant_keys = AICatalogBuilder::catalog_relevant_keys_for_block( $block_name );

		// Only the free form of what is stored: a Pro value (a card-7 design, a
		// fade effect …) is left out, so the model — told never to use one —
		// sees it as "already set, leave alone" instead of "fix" it, and a Pro
		// design survives a refine untouched (CLAUDE.md Rule 3).
		$current_values = AIValueValidator::validate( array_intersect_key( $existing_attributes, array_flip( $relevant_keys ) ), $block_name );

		$elements = self::current_elements( $existing_attributes['cardElements'] ?? null );
		if ( ! empty( $elements ) ) {
			$current_values['elements'] = $elements;
		}

		if ( ! empty( $current_values ) ) {
			$message .= 'Current Values (only for the options above — unlisted options already have a value, leave them alone): ' . wp_json_encode( $current_values ) . "\n";
		}

		$message .= 'Generate updated attribute JSON, including only the keys you are changing:';

		return $message;
	}

	/**
	 * Visible/hidden state of each free Member Information row, as the `elements` map.
	 *
	 * @param mixed $rows `cardElements` rows.
	 * @return array<string, bool>
	 */
	private static function current_elements( $rows ): array {
		if ( ! is_array( $rows ) ) {
			return array();
		}

		$elements = array();
		foreach ( $rows as $row ) {
			if ( is_array( $row ) && isset( $row['value'] ) && in_array( $row['value'], Pro_Gate::FREE_CARD_ELEMENTS, true ) ) {
				$elements[ $row['value'] ] = ! empty( $row['show'] );
			}
		}

		return $elements;
	}
}
