<?php
/**
 * AI Pattern Matcher
 *
 * Shortlists Ready Patterns for a natural language prompt and resolves the model's pick.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;
use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;
use ShapedPlugin\WPTeam\Blocks\Includes\ReadyPatterns\PatternRepository;

defined( 'ABSPATH' ) || exit;

/**
 * AIPatternMatcher class.
 *
 * The AI builder is pattern-first: a prompt a published Ready Pattern already
 * answers is served by inserting that pattern, so the model never has to invent
 * attribute JSON for a layout somebody already designed. Only a shortlist
 * reaches the model — a local lexical pass narrows the catalog and the model
 * only judges relevance.
 */
class AIPatternMatcher {

	/**
	 * Maximum candidates handed to the model.
	 */
	const MAX_CANDIDATES = 16;

	/**
	 * Minimum confidence the model must report before a pattern is inserted.
	 */
	const MIN_CONFIDENCE = 0.6;

	/**
	 * Confidence assumed when the model picks a pattern but reports no number.
	 */
	const ASSUMED_CONFIDENCE = 0.75;

	/**
	 * Characters kept from a pattern description in the candidate list.
	 */
	const DESCRIPTION_LIMIT = 120;

	/**
	 * Weight applied to terms the prompt implies rather than states.
	 */
	const SYNONYM_WEIGHT = 0.8;

	/**
	 * Weight applied to a word that names the container rather than the subject.
	 */
	const GENERIC_WEIGHT = 0.35;

	/**
	 * Score a pattern must reach before it is worth a slot in the shortlist.
	 *
	 * A settings-only prompt ("make it 4 columns") lands under this on every
	 * item, so it costs no model round-trip at all.
	 */
	const MIN_SCORE = 4.0;

	/**
	 * Prompt words that carry no matching signal: conversational filler and
	 * the settings vocabulary that describes a knob rather than a design.
	 *
	 * @var string[]
	 */
	private const STOP_WORDS = array( 'the', 'and', 'with', 'for', 'from', 'that', 'this', 'have', 'has', 'want', 'wants', 'need', 'needs', 'make', 'made', 'create', 'creates', 'build', 'builds', 'please', 'show', 'shows', 'showing', 'using', 'use', 'uses', 'add', 'into', 'some', 'more', 'like', 'give', 'set', 'put', 'can', 'you', 'not', 'but', 'are', 'its', 'each', 'per', 'all', 'new', 'our', 'ours', 'your', 'yours', 'their', 'them', 'they', 'who', 'what', 'when', 'where', 'how', 'why', 'about', 'here', 'there', 'these', 'those', 'will', 'would', 'could', 'should', 'get', 'got', 'let', 'see', 'look', 'looks', 'looking', 'nice', 'nicer', 'good', 'better', 'really', 'very', 'change', 'update', 'turn', 'increase', 'decrease', 'design', 'designs', 'layout', 'layouts', 'style', 'styles', 'thing', 'things', 'stuff', 'color', 'colors', 'colour', 'colours', 'speed', 'column', 'columns', 'size', 'width', 'height', 'margin', 'padding', 'font', 'gap', 'spacing', 'delay', 'duration', 'arrow', 'arrows', 'dots', 'loop', 'page', 'website', 'site', 'section' );

	/**
	 * Words that name the container, not the subject. Almost every prompt says
	 * "team", so it steers without outvoting the thing being built.
	 *
	 * @var string[]
	 */
	private const GENERIC_TERMS = array( 'team', 'teams', 'member', 'members', 'people', 'staff', 'showcase', 'block', 'widget' );

	/**
	 * Short prompt words that still carry meaning; every other one is dropped.
	 *
	 * @var string[]
	 */
	private const SHORT_TERMS = array( 'ceo', 'hr', '3d' );

	/**
	 * Canonical catalog term → the everyday words that imply it.
	 *
	 * Patterns are tagged with `PatternVocabulary` use cases plus tags and
	 * keywords; visitors type something else. Keyed by the canonical term so a
	 * new phrasing is one word added to an existing row. A multi-word alias is
	 * matched against consecutive prompt words.
	 *
	 * @var array<string, string[]>
	 */
	private const TERM_ALIASES = array(
		// Use cases (PatternVocabulary::USE_CASE_LABELS).
		'about-us'           => array( 'about', 'about us', 'who we are', 'our story', 'meet the team', 'company', 'our people' ),
		'leadership-team'    => array( 'leadership', 'leaders', 'leader', 'executive', 'executives', 'management', 'ceo', 'founder', 'founders', 'director', 'directors', 'c suite' ),
		'hiring-page'        => array( 'hiring', 'careers', 'career', 'jobs', 'recruiting', 'recruitment', 'join us', 'join our team', 'open positions', 'we are hiring' ),
		'agency-team'        => array( 'agency', 'studio', 'creative', 'designers', 'developers', 'freelancers', 'consultants', 'firm' ),
		'staff-directory'    => array( 'directory', 'staff directory', 'employees', 'employee', 'colleagues', 'personnel', 'faculty', 'doctors', 'lawyers', 'agents', 'large team', 'everyone' ),
		'speaker-lineup'     => array( 'speaker', 'speakers', 'conference', 'event', 'events', 'lineup', 'panel', 'panelists', 'talks', 'summit', 'webinar', 'presenters' ),
		'board-of-directors' => array( 'board', 'board of directors', 'trustees', 'advisors', 'advisory', 'advisory board', 'committee', 'governance' ),
		'department-page'    => array( 'department', 'departments', 'division', 'unit', 'office', 'branch', 'squad', 'group' ),

		// Tags used across the catalog.
		'minimal'            => array( 'minimal', 'clean', 'simple', 'subtle', 'understated', 'plain', 'modern' ),
		'dark'               => array( 'dark', 'night', 'black', 'black background', 'dark mode' ),
		'boxed'              => array( 'boxed', 'box', 'boxes', 'card', 'cards', 'bordered', 'framed' ),
		'card-shadow'        => array( 'shadow', 'shadows', 'elevated', 'floating', 'raised' ),
		'hover-overlay'      => array( 'overlay', 'hover', 'on hover', 'reveal', 'text over', 'text on image', 'mouse over' ),
		'circle-image'       => array( 'circle', 'circular', 'round', 'rounded photo', 'round photos', 'avatar', 'avatars' ),
		'bio-expand'         => array( 'bio', 'bios', 'biography', 'read more', 'details', 'description', 'profile' ),
		'social-icons'       => array( 'social', 'social icons', 'social links', 'linkedin', 'twitter', 'facebook', 'instagram' ),
		'list-style'         => array( 'list', 'list style', 'horizontal', 'side by side', 'photo left', 'row' ),
		'fullwidth'          => array( 'fullwidth', 'full width', 'wide', 'edge to edge', 'full screen' ),
		'4-column'           => array( 'four', 'compact', 'dense', 'small cards' ),
		'3-column'           => array( 'three' ),

		// Blocks.
		'grid'               => array( 'grid', 'gallery', 'wall', 'tiles', 'static', 'polaroid', 'polaroids', 'staggered', 'masonry', 'zigzag' ),
		'carousel'           => array( 'carousel', 'slider', 'slideshow', 'slide', 'slides', 'swipe', 'rotating', 'scrolling' ),
		'carousel-3d'        => array( '3d', '3d carousel', 'coverflow', 'cover flow', 'perspective', 'panorama', 'panoramic' ),

		// Carousel traits found in pattern names.
		'autoplay'           => array( 'autoplay', 'auto play', 'automatic', 'auto rotate', 'plays itself' ),
		'center'             => array( 'center', 'centered', 'centre', 'focus', 'spotlight' ),
		'coverflow'          => array( 'coverflow', 'cover flow', '3d', 'perspective', 'panorama', 'panoramic' ),
		'panorama'           => array( 'panorama', 'panoramic', 'curved', 'cylinder', 'tunnel', 'concave', 'wraparound' ),
		'polaroid'           => array( 'polaroid', 'polaroids', 'instant photo', 'photo frame', 'scrapbook', 'tilted', 'snapshot' ),
		'staggered'          => array( 'staggered', 'stagger', 'zigzag', 'masonry', 'offset columns', 'uneven' ),
		'fade'               => array( 'fade', 'fading', 'crossfade' ),
		'vertical'           => array( 'vertical', 'up and down', 'stacked' ),
		'peek'               => array( 'peek', 'partial', 'partially', 'next card visible' ),
		'two-row'            => array( 'two row', 'two rows', 'multi row', 'multiple rows' ),
		'skills'             => array( 'skill', 'skills', 'expertise', 'progress bar', 'progress bars' ),
		'showcase'           => array( 'showcase', 'featured', 'highlight', 'hero' ),
	);

	/**
	 * Alias table indexed for lookup, built once per request.
	 *
	 * @var array{words: array<string, string[]>, phrases: array<string, string[]>, maxPhraseWords: int}|null
	 */
	private static $alias_map = null;

	/**
	 * Shortlist the patterns worth showing the model for a prompt.
	 *
	 * @param string $prompt     Natural language prompt.
	 * @param string $block_name Block the request is aimed at.
	 * @return array<int, array<string, mixed>> Manifest items, most relevant first.
	 */
	public static function shortlist( string $prompt, string $block_name = '' ): array {
		/**
		 * Filter whether the AI builder may answer a prompt with a Ready Pattern.
		 *
		 * Returning false sends every prompt down the attribute-generation path.
		 *
		 * @param bool $enabled Default enabled state.
		 */
		if ( ! PatternRepository::is_enabled() || ! apply_filters( 'sptp_ai_pattern_first_enabled', true ) ) {
			return array();
		}

		return self::rank( ( new PatternRepository() )->get_manifest(), $prompt, $block_name );
	}

	/**
	 * Rank a manifest against a prompt and cut it down to the shortlist.
	 *
	 * @param array<int, array<string, mixed>> $items      Normalized manifest items.
	 * @param string                           $prompt     Natural language prompt.
	 * @param string                           $block_name Block the request is aimed at.
	 * @return array<int, array<string, mixed>>
	 */
	public static function rank( array $items, string $prompt, string $block_name = '' ): array {
		if ( empty( $items ) ) {
			return array();
		}

		$matchers = self::token_matchers( self::weighted_tokens( $prompt ) );
		if ( empty( $matchers ) ) {
			return array();
		}

		$scored = array();
		foreach ( $items as $index => $item ) {
			if ( ! is_array( $item ) || empty( $item['slug'] ) || empty( $item['blockName'] ) ) {
				continue;
			}

			// A Pro-tier pattern, one this site cannot satisfy, or one whose block
			// is switched off is never offered: the editor would refuse to insert
			// it anyway (Free only previews Pro patterns).
			if ( ! Pro_Gate::is_free_pattern( $item ) || ! self::requirements_met( $item['requires'] ?? array() ) || ! DashboardHelper::is_block_enabled( (string) $item['blockName'] ) ) {
				continue;
			}

			$score = self::score_item( $item, $matchers, $block_name );
			if ( self::MIN_SCORE > $score ) {
				continue;
			}

			$scored[] = array(
				'score' => $score,
				'hit'   => isset( $item['hit'] ) ? (int) $item['hit'] : 0,
				'index' => $index,
				'item'  => $item,
			);
		}

		usort(
			$scored,
			static function ( $left, $right ) {
				// Within a hundredth, popularity is a better tiebreak than manifest order.
				$left_score  = round( $left['score'], 2 );
				$right_score = round( $right['score'], 2 );
				if ( $left_score !== $right_score ) {
					return $left_score < $right_score ? 1 : -1;
				}

				if ( $left['hit'] !== $right['hit'] ) {
					return $left['hit'] < $right['hit'] ? 1 : -1;
				}

				return $left['index'] <=> $right['index'];
			}
		);

		return array_column( array_slice( $scored, 0, self::MAX_CANDIDATES ), 'item' );
	}

	/**
	 * The weighted vocabulary a prompt resolves to, alias expansion included.
	 *
	 * Exposed so `AIBlockRouter` reads the same vocabulary as the shortlist.
	 *
	 * @param string $prompt Natural language prompt.
	 * @return array<string, float> Term => weight.
	 */
	public static function prompt_terms( string $prompt ): array {
		return self::weighted_tokens( $prompt );
	}

	/**
	 * Weight below which a term is only naming the container.
	 *
	 * @return float
	 */
	public static function generic_term_weight(): float {
		return self::GENERIC_WEIGHT;
	}

	/**
	 * Render candidates as compact pipe-delimited lines for the model.
	 *
	 * @param array<int, array<string, mixed>> $candidates Shortlisted manifest items.
	 * @return string
	 */
	public static function to_prompt_payload( array $candidates ): string {
		$lines = array();

		foreach ( $candidates as $item ) {
			$description = isset( $item['description'] ) ? (string) $item['description'] : '';
			if ( mb_strlen( $description ) > self::DESCRIPTION_LIMIT ) {
				$description = mb_substr( $description, 0, self::DESCRIPTION_LIMIT ) . '…';
			}

			$lines[] = implode(
				' | ',
				array(
					(string) $item['slug'],
					isset( $item['name'] ) ? (string) $item['name'] : '',
					str_replace( 'sptp/', '', (string) $item['blockName'] ),
					implode( ',', isset( $item['useCases'] ) && is_array( $item['useCases'] ) ? $item['useCases'] : array() ),
					implode( ',', isset( $item['tags'] ) && is_array( $item['tags'] ) ? $item['tags'] : array() ),
					isset( $item['complexity'] ) ? (string) $item['complexity'] : '',
					str_replace( array( "\r", "\n", '|' ), ' ', $description ),
				)
			);
		}

		return implode( "\n", $lines );
	}

	/**
	 * Resolve the model's selection against the shortlist it was given.
	 *
	 * A slug outside the shortlist is a hallucination, not a pick.
	 *
	 * @param array<string, mixed>             $selection  Parsed model response.
	 * @param array<int, array<string, mixed>> $candidates Shortlist handed to the model.
	 * @return array{pattern: array<string, mixed>, confidence: float, reason: string}|null
	 */
	public static function resolve_selection( array $selection, array $candidates ): ?array {
		$slug = '';
		foreach ( array( 'slug', 'patternSlug', 'pattern_slug' ) as $key ) {
			if ( ! empty( $selection[ $key ] ) && is_scalar( $selection[ $key ] ) ) {
				$slug = sanitize_title( (string) $selection[ $key ] );
				break;
			}
		}

		if ( '' === $slug ) {
			return null;
		}

		$confidence = isset( $selection['confidence'] ) && is_numeric( $selection['confidence'] )
			? (float) $selection['confidence']
			: self::ASSUMED_CONFIDENCE;

		if ( $confidence < self::MIN_CONFIDENCE ) {
			return null;
		}

		foreach ( $candidates as $item ) {
			if ( isset( $item['slug'] ) && $slug === (string) $item['slug'] ) {
				return array(
					'pattern'    => $item,
					'confidence' => $confidence,
					'reason'     => isset( $selection['reason'] ) && is_scalar( $selection['reason'] )
						? sanitize_text_field( (string) $selection['reason'] )
						: '',
				);
			}
		}

		return null;
	}

	/**
	 * Whether a pattern may replace what the target block already holds.
	 *
	 * Only while the block is still unconfigured — a layout block with no card
	 * design yet is showing the first-insert picker. A configured block's
	 * prompt is a refinement, which goes through attribute generation.
	 *
	 * @param array<string, mixed> $attributes Existing block attributes.
	 * @return bool
	 */
	public static function allows_pattern_insert( array $attributes ): bool {
		return empty( $attributes ) || empty( $attributes['cardDesign'] );
	}

	/**
	 * Whether this site satisfies a pattern's declared requirements.
	 *
	 * An unknown module slug counts as met, mirroring the editor's
	 * `describeRequirements()`, so a server-side addition cannot silently hide
	 * the whole catalog from the builder.
	 *
	 * @param mixed $requires Normalized `requires` block.
	 * @return bool
	 */
	public static function requirements_met( $requires ): bool {
		if ( ! is_array( $requires ) ) {
			return true;
		}

		$modules = isset( $requires['modules'] ) && is_array( $requires['modules'] ) ? $requires['modules'] : array();
		foreach ( $modules as $module_slug ) {
			if ( ! DashboardHelper::is_module_enabled( (string) $module_slug ) ) {
				return false;
			}
		}

		$min_version = isset( $requires['minPluginVersion'] ) ? (string) $requires['minPluginVersion'] : '';

		return '' === $min_version || version_compare( SPT_PLUGIN_VERSION, $min_version, '>=' );
	}

	/**
	 * Relevance score for one manifest item.
	 *
	 * @param array<string, mixed>                               $item       Manifest item.
	 * @param array<string, array{weight: float, regex: string}> $matchers   Prompt token matchers.
	 * @param string                                             $block_name Block the request is aimed at.
	 * @return float
	 */
	private static function score_item( array $item, array $matchers, string $block_name ): float {
		$name        = isset( $item['name'] ) ? strtolower( (string) $item['name'] ) : '';
		$description = isset( $item['description'] ) ? strtolower( (string) $item['description'] ) : '';
		$terms       = self::item_terms( $item );
		$terms_blob  = implode( ' ', $terms );
		$haystack    = $name . ' ' . $description . ' ' . $terms_blob;
		$score       = 0.0;

		foreach ( $matchers as $key => $matcher ) {
			$token = (string) $key;

			// Cheap gate before any regex pass.
			if ( false === strpos( $haystack, $token ) ) {
				continue;
			}

			$weight = $matcher['weight'];

			if ( in_array( $token, $terms, true ) ) {
				$score += 4 * $weight;
			} elseif ( 1 === preg_match( $matcher['regex'], $terms_blob ) ) {
				$score += 2 * $weight;
			}

			if ( '' !== $name && 1 === preg_match( $matcher['regex'], $name ) ) {
				$score += 5 * $weight;
			}

			if ( '' !== $description && 1 === preg_match( $matcher['regex'], $description ) ) {
				$score += 1.5 * $weight;
			}
		}

		// A nudge, not a filter: the request's block is a default as often as a choice.
		if ( '' !== $block_name && isset( $item['blockName'] ) && $block_name === $item['blockName'] ) {
			$score += 2;
		}

		return $score;
	}

	/**
	 * Compile one whole-word matcher per prompt token.
	 *
	 * Whole words only, so "car" never scores "cards"; the optional plural
	 * suffix keeps "photo" reaching "photos".
	 *
	 * @param array<string, float> $weighted_tokens Token => weight.
	 * @return array<string, array{weight: float, regex: string}>
	 */
	private static function token_matchers( array $weighted_tokens ): array {
		$matchers = array();

		foreach ( $weighted_tokens as $token => $weight ) {
			$matchers[ (string) $token ] = array(
				'weight' => $weight,
				'regex'  => '/\b' . preg_quote( (string) $token, '/' ) . '(?:s|es)?\b/',
			);
		}

		return $matchers;
	}

	/**
	 * Collect a manifest item's searchable terms.
	 *
	 * @param array<string, mixed> $item Manifest item.
	 * @return string[]
	 */
	private static function item_terms( array $item ): array {
		$terms = array();

		foreach ( array( 'useCases', 'tags', 'keywords', 'blocks' ) as $key ) {
			if ( empty( $item[ $key ] ) || ! is_array( $item[ $key ] ) ) {
				continue;
			}

			foreach ( $item[ $key ] as $value ) {
				if ( is_scalar( $value ) ) {
					$terms = array_merge( $terms, self::split_terms( (string) $value ) );
				}
			}
		}

		foreach ( array( 'category', 'complexity', 'family', 'blockName' ) as $key ) {
			if ( ! empty( $item[ $key ] ) && is_scalar( $item[ $key ] ) ) {
				$terms = array_merge( $terms, self::split_terms( (string) $item[ $key ] ) );
			}
		}

		return array_values( array_unique( $terms ) );
	}

	/**
	 * Split a slug or phrase into lowercase terms, keeping the whole slug too.
	 *
	 * @param string $value Raw value.
	 * @return string[]
	 */
	private static function split_terms( string $value ): array {
		$value = str_replace( 'sptp/', '', strtolower( trim( $value ) ) );
		if ( '' === $value ) {
			return array();
		}

		$terms = array( $value );
		foreach ( (array) preg_split( '/[^a-z0-9]+/', $value, -1, PREG_SPLIT_NO_EMPTY ) as $part ) {
			$terms[] = $part;
		}

		return $terms;
	}

	/**
	 * Tokenize a prompt into scored terms, expanding implied vocabulary.
	 *
	 * @param string $prompt Natural language prompt.
	 * @return array<string, float> Token => weight.
	 */
	private static function weighted_tokens( string $prompt ): array {
		$words  = preg_split( '/[^a-z0-9]+/', strtolower( wp_strip_all_tags( $prompt ) ), -1, PREG_SPLIT_NO_EMPTY );
		$tokens = array();

		if ( ! is_array( $words ) || empty( $words ) ) {
			return $tokens;
		}

		foreach ( $words as $word ) {
			if ( self::is_matchable_word( $word ) ) {
				$tokens[ $word ] = in_array( $word, self::GENERIC_TERMS, true ) ? self::GENERIC_WEIGHT : 1.0;
			}
		}

		// A plural in the prompt must still reach a singular tag.
		foreach ( array_keys( $tokens ) as $token ) {
			$stem = self::stem( (string) $token );
			if ( $stem !== $token && ! isset( $tokens[ $stem ] ) ) {
				$tokens[ $stem ] = self::SYNONYM_WEIGHT;
			}
		}

		$aliases = self::alias_map();

		foreach ( array_keys( $tokens ) as $token ) {
			self::add_implied_terms( $tokens, $aliases['words'][ $token ] ?? array() );
		}

		// Phrases run over the raw words: "join our team" is carried by words
		// that are stop words on their own.
		foreach ( self::phrases( $words, $aliases['maxPhraseWords'] ) as $phrase ) {
			self::add_implied_terms( $tokens, $aliases['phrases'][ $phrase ] ?? array() );
		}

		return $tokens;
	}

	/**
	 * Whether a prompt word is worth scoring.
	 *
	 * @param string $word Lowercase prompt word.
	 * @return bool
	 */
	private static function is_matchable_word( string $word ): bool {
		if ( in_array( $word, self::STOP_WORDS, true ) || 1 === preg_match( '/^\d+$/', $word ) ) {
			return false;
		}

		return 3 <= strlen( $word ) || in_array( $word, self::SHORT_TERMS, true );
	}

	/**
	 * Add the catalog terms a prompt word or phrase implies, never lifting a
	 * weight already assigned.
	 *
	 * @param array<string, float> $tokens        Token => weight, by reference.
	 * @param string[]             $implied_terms Canonical terms the prompt implies.
	 * @return void
	 */
	private static function add_implied_terms( array &$tokens, array $implied_terms ): void {
		foreach ( $implied_terms as $implied ) {
			foreach ( self::split_terms( $implied ) as $term ) {
				if ( ! isset( $tokens[ $term ] ) ) {
					$tokens[ $term ] = in_array( $term, self::GENERIC_TERMS, true ) ? self::GENERIC_WEIGHT : self::SYNONYM_WEIGHT;
				}
			}
		}
	}

	/**
	 * Every consecutive word run in a prompt, longest first.
	 *
	 * @param string[] $words     Prompt words in order.
	 * @param int      $max_words Longest alias phrase in the table.
	 * @return string[]
	 */
	private static function phrases( array $words, int $max_words ): array {
		$phrases = array();
		$count   = count( $words );

		for ( $length = $max_words; 2 <= $length; $length-- ) {
			for ( $start = 0; $count >= $start + $length; $start++ ) {
				$phrases[] = implode( ' ', array_slice( $words, $start, $length ) );
			}
		}

		return $phrases;
	}

	/**
	 * Alias table indexed for lookup: single words, phrases, longest phrase length.
	 *
	 * @return array{words: array<string, string[]>, phrases: array<string, string[]>, maxPhraseWords: int}
	 */
	private static function alias_map(): array {
		if ( null !== self::$alias_map ) {
			return self::$alias_map;
		}

		$words            = array();
		$phrases          = array();
		$max_phrase_words = 2;

		foreach ( self::TERM_ALIASES as $canonical => $aliases ) {
			foreach ( $aliases as $alias ) {
				$parts = preg_split( '/\s+/', trim( (string) $alias ), -1, PREG_SPLIT_NO_EMPTY );
				if ( ! is_array( $parts ) || empty( $parts ) ) {
					continue;
				}

				$alias_key = implode( ' ', $parts );

				if ( 1 === count( $parts ) ) {
					$words[ $alias_key ][] = (string) $canonical;
					continue;
				}

				$phrases[ $alias_key ][] = (string) $canonical;
				$max_phrase_words        = max( $max_phrase_words, count( $parts ) );
			}
		}

		self::$alias_map = array(
			'words'          => $words,
			'phrases'        => $phrases,
			'maxPhraseWords' => $max_phrase_words,
		);

		return self::$alias_map;
	}

	/**
	 * Strip a naive trailing plural so "speakers" also reaches "speaker".
	 *
	 * @param string $token Lowercase token.
	 * @return string
	 */
	private static function stem( string $token ): string {
		if ( strlen( $token ) < 4 || 's' !== substr( $token, -1 ) || 'ss' === substr( $token, -2 ) ) {
			return $token;
		}

		return substr( $token, 0, -1 );
	}
}
