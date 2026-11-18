<?php
/**
 * AI Catalog Builder
 *
 * Per-block attribute catalogs for the AI builder's attribute-generation path.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

defined( 'ABSPATH' ) || exit;

/**
 * AICatalogBuilder class.
 *
 * The registered attribute schemas run to hundreds of keys (per-element
 * typography, per-state borders, letter/word spacing). Sending all of that
 * would cost more tokens than the pattern path this falls back from, so this
 * is a hand-curated, AI-facing subset: only the keys worth an AI decision.
 *
 * Free's port of Pro's catalog: it names the free blocks and the free values
 * only — every Pro option (card-4 … card-11, Overlay, hover content, image
 * filters, contact rows, Read More, the Pro carousel styles …) is left
 * out, so the model is never told it exists. Every value list comes from
 * Pro_Gate, and `AIValueValidator::RULES` enforces the identical lists.
 */
class AICatalogBuilder {

	/**
	 * The free layout blocks the builder generates for.
	 *
	 * @var string[]
	 */
	const BLOCKS = array( 'grid', 'carousel' );

	/**
	 * Value shapes referenced by more than one catalog line, spelled out once.
	 */
	const SHAPES = 'Value shapes referenced below:
	- <color> = a CSS hex or rgba string, e.g. "#111827" or "rgba(17,24,39,0.85)".
	- <responsive> = { "device": { "Desktop": number, "Tablet": number, "Mobile": number }, "unit": { "Desktop": "px", "Tablet": "px", "Mobile": "px" } }. Tablet/Mobile are optional.
	- <range> = { "value": number, "unit": "px" }.
	- <corners> = { "value": { "top": int, "right": int, "bottom": int, "left": int }, "unit": "px"|"%", "allChange": bool }. Set "allChange": true when all four are equal.
	- <padding> = { "device": { "Desktop": { "top": int, "right": int, "bottom": int, "left": int } }, "unit": { "Desktop": "px" }, "allChange": bool }.
	- <background> = { "color": { "style": "bgColor"|"gradient"|"transparent", "solidColor": <color>, "gradient": "linear-gradient(...)" }, "hover": { "style": "bgColor"|"gradient", "solidColor": <color> } }.
	- <border> = { "style": "none"|"solid"|"dashed"|"dotted"|"double", "color": <color>, "hoverColor": <color> }.
	- <shadow> = { "isActive": bool, "selectDefault": "var(--sp-smart-team-shadow-subtle-1dp)"|"var(--sp-smart-team-shadow-light-2dp)"|"var(--sp-smart-team-shadow-medium-4dp)"|"var(--sp-smart-team-shadow-sharp-4dp)"|"var(--sp-smart-team-shadow-strong-8dp)"|"var(--sp-smart-team-shadow-deep-12dp)" }.
	- <typography> = { "typography": { "fontWeight": "300"|"400"|"500"|"600"|"700"|"800", "style": ""|"italic", "transform": ""|"uppercase"|"capitalize"|"lowercase", "decoration": ""|"underline"|"line-through" } }. Never set a font family — the site theme owns that.
';

	/**
	 * Member-card attributes both layout blocks share. `{…}` tokens are filled
	 * from Pro_Gate's free lists.
	 */
	const BASE_CATALOG = '- "cardDesign": {designs} — the card template; ALWAYS set it on a new block. card-1 photo on top, centred text; card-2 horizontal photo beside the text; card-3 text panel overlapping the photo.
	- "columns": <responsive> with unit "" (items per row, {max_columns})
	- "contentAlignment": "left"|"center"|"right"
	- "elements": { "<element>": bool } — show or hide Member Information rows. Elements: {elements}. Only list the ones you change. "Basic Information" = "name", "role", "bio"; "photo"/"image" = "image"; "social profiles"/"social icons" = "social". "skills" = "skills". Contact details and custom fields are not available — never mention them.
	- "limit": int (1-50, members shown), "orderBy": "date"|"title"|"modified"|"menu_order", "order": "asc"|"desc", "enableRandomOrder": bool
	- "cardBg": <background>, "cardBorder": <border>, "cardBorderWidth": <corners>, "cardBorderRadius": <corners>, "cardPadding": <padding>, "cardBoxShadow": <shadow>, "cardBoxShadowHover": <shadow>
	- "imageAspectRatio": "original"|"1-1"|"4-3"|"3-4"|"3-2"|"16-9"|"9-16", "imageBorderRadius": <corners> (50 with unit "%" = circular photo)
	- "imageHoverEffect": {image_hover_effects}
	- "imageMasking": bool (clip the photo to a diamond shape), "imageMaskShape": {mask_shapes} (only read while imageMasking is true — set both)
	- "imageResolution": "full"|"thumbnail"|"medium"|"medium_large"|"large", "imageSize": { "device": { "Desktop": { "width": number, "height": number } }, "unit": { "Desktop": { "width": "%"|"px", "height": "px" } } }, "imageMargin": <padding>
	- "imagePosition": "left"|"right", "imageContentGap": <range> — which side the photo sits beside the text; only card-2 reads it. When the user asks for the photo on the left/right (beside the text), also set "cardDesign": "card-2".
	- Name text: {text:name}, "nameHtmlTag": "h1"|"h2"|"h3"|"h4"|"h5"|"h6", "nameColorHover": <color>
	- Role (job title) text: {text:role}
	- Bio text: {text:bio}, "bioSource": {bio_sources} ("short" = Short Bio, "full" = full description)
	- "socialIconStyle": "style-1"|"style-2"|"style-3"|"style-4"
	- "showMemberDetails": bool (clicking the photo opens the member\'s single page)
	- "sectionBg": <background>, "sectionPadding": <padding> — the box around the whole block';

	/**
	 * Grid-only gaps and the pagination addon toggle.
	 */
	const GRID_CATALOG = '- "horizontalGap": <range>, "verticalGap": <range> (space between cards)
	- "ajaxPagination": bool (adds a Load More / pagination control)';

	/**
	 * Carousel behaviour, navigation arrows and pagination dots.
	 */
	const CAROUSEL_CATALOG = '- "slidingEffect": {slide_effects} — the transition between slides
	- "columnGap": <responsive> (space between cards), "slideToScroll": <responsive> with unit ""
	- "sliderAutoPlay": bool, "carouselAutoplayDelay": <range> with unit "ms" (500-10000), "carouselSpeed": <range> with unit "ms" (slide transition, 100-5000), "pauseOnHover": bool, "infiniteLoop": bool, "carouselDirection": "rtl" (cards move right to left, default)|"ltr" (cards move left to right)
	- "enableNavigationArrow": bool, "navIconName": {nav_arrow_styles}, "navIconPosition": "vertical_center"|"top_left"|"top_center"|"top_right"|"bottom_left"|"bottom_center"|"bottom_right", "navIconColor": <color>, "navIconColorHover": <color>, "navIconBgColor": <color>, "navIconBgColorHover": <color>
	- "enablePaginationDots": bool, "paginationStyle": {pagination_styles}, "paginationDotsColor": <color>, "paginationDotsActiveColor": <color>';

	/**
	 * Normalize a block name to its bare slug.
	 *
	 * @param string $block_name Block name, with or without the `sptp/` prefix.
	 * @return string Slug, `grid` when unknown.
	 */
	public static function slug( string $block_name ): string {
		$slug = str_replace( 'sptp/', '', $block_name );

		return in_array( $slug, self::BLOCKS, true ) ? $slug : 'grid';
	}

	/**
	 * Free card designs, without Pro_Gate's '' (unset) entry.
	 *
	 * @return string[]
	 */
	public static function card_designs(): array {
		return array_values( array_filter( Pro_Gate::FREE_CARD_DESIGNS ) );
	}

	/**
	 * Free slide effects the picker offers ('ken-burns' is a legacy stored value).
	 *
	 * @return string[]
	 */
	public static function slide_effects(): array {
		return array_values( array_diff( Pro_Gate::FREE_SLIDE_EFFECTS, array( 'none', 'ken-burns' ) ) );
	}

	/**
	 * Build the AI-facing attribute catalog for one block.
	 *
	 * @param string $block_name Block name, with or without the `sptp/` prefix.
	 * @return string Catalog lines.
	 */
	public static function get_catalog( string $block_name ): string {
		$slug = self::slug( $block_name );

		$tokens = array(
			'{designs}'             => self::enum( self::card_designs() ),
			'{max_columns}'         => 'carousel' === $slug ? '1-8' : '1-6',
			'{elements}'            => self::enum( Pro_Gate::FREE_CARD_ELEMENTS, ', ' ),
			'{image_hover_effects}' => self::enum( Pro_Gate::FREE_IMAGE_HOVER_EFFECTS ),
			'{mask_shapes}'         => self::enum( Pro_Gate::FREE_MASK_SHAPES ),
			'{bio_sources}'         => self::enum( Pro_Gate::FREE_BIO_SOURCES ),
			'{slide_effects}'       => self::enum( self::slide_effects() ),
			'{nav_arrow_styles}'    => self::enum( Pro_Gate::FREE_NAV_ARROW_STYLES ),
			'{pagination_styles}'   => self::enum( Pro_Gate::FREE_PAGINATION_STYLES ),
		);

		$base = strtr( self::BASE_CATALOG, $tokens );
		$base = preg_replace_callback( '/\{text:([a-zA-Z]+)\}/', array( self::class, 'text_group' ), $base );

		$catalog = self::SHAPES . "\n\n" . $base;

		if ( 'carousel' === $slug ) {
			$catalog .= "\n" . strtr( self::CAROUSEL_CATALOG, $tokens );
		} else {
			$catalog .= "\n" . self::GRID_CATALOG;
		}

		return $catalog;
	}

	/**
	 * Quote a value list as a catalog enum.
	 *
	 * @param string[] $values Values.
	 * @param string   $glue   Separator.
	 * @return string
	 */
	private static function enum( array $values, string $glue = '|' ): string {
		return '"' . implode( '"' . $glue . '"', $values ) . '"';
	}

	/**
	 * Spell out the text-style keys one card element shares, so each key is
	 * named literally (`catalog_relevant_keys_for_block()` reads them back).
	 *
	 * @param array $match Regex match; [1] is the attribute prefix.
	 * @return string Catalog fragment.
	 */
	private static function text_group( array $match ): string {
		return sprintf(
			'"%1$sColor": <color>, "%1$sFontSize": <responsive>, "%1$sLineHeight": <responsive> with unit "" (e.g. 1.5), "%1$sTypography": <typography>',
			$match[1]
		);
	}

	/**
	 * Top-level attribute keys a block's catalog names.
	 *
	 * Derived from the catalog text itself so it cannot drift from what the
	 * model reads. Used to trim what a refine echoes back as "current values".
	 *
	 * @param string $block_name Block name, with or without the `sptp/` prefix.
	 * @return string[] Top-level keys.
	 */
	public static function catalog_relevant_keys_for_block( string $block_name ): array {
		$catalog = substr( self::get_catalog( $block_name ), strlen( self::SHAPES ) );

		preg_match_all( '/"([a-zA-Z][a-zA-Z0-9]*)":/', $catalog, $matches );

		$keys = array_values( array_unique( $matches[1] ) );

		// Leaf names inside shapes (`type`, `trigger`, …) are not attributes.
		return array_values( array_intersect( $keys, array_keys( AIValueValidator::schema_defaults( $block_name ) ) ) );
	}
}
