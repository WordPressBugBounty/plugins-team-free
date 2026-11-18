<?php
/**
 * The one source of truth for every Pro-vs-free decision in the block layer.
 *
 * Read-only and idempotent (CLAUDE.md Rule 3 and Rule 8; see
 * docs/pro-free-separation.md §3): normalization happens on read, at render
 * time, and a stored Pro value is never rewritten. Passing an already-free
 * value returns it unchanged; an empty/unknown value returns the free
 * default.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

defined( 'ABSPATH' ) || exit;

/**
 * Class Pro_Gate.
 */
class Pro_Gate {

	/**
	 * Blocks that ship with their real render logic in Free (12 of 25) — see
	 * docs/pro-free-separation.md §6.
	 *
	 * @var array<int, string>
	 */
	const FREE_BLOCKS = array(
		'sptp/grid',
		'sptp/carousel',
		'sptp/team-group',
		'sptp/member-bio',
		'sptp/member-description',
		'sptp/member-designation',
		'sptp/member-image',
		'sptp/member-modal-content',
		'sptp/member-name',
		'sptp/member-skills',
		'sptp/social-profile',
		'sptp/ajax-pagination',
		// The legacy shortcode block — free, so its Dashboard → Blocks switch is unlocked.
		'sp-team-pro/shortcode',
	);

	/**
	 * Pro-only blocks Free lists in the inserter — last in the Smart Team
	 * section, with a crown chip (WP Carousel Free's pattern) — each mapped to the Ready Patterns
	 * category its canvas notice's "View Demo" link opens. Inserting one
	 * renders only an upsell notice in the editor and the block's existing
	 * fallback on the front end — no Pro logic ships (CLAUDE.md Rule 8). The
	 * other Pro-only blocks stay hidden: they are Team Group children with no
	 * library category of their own.
	 *
	 * @var array<string, string>
	 */
	const PRO_INSERTER_BLOCKS = array(
		'sptp/carousel-3d' => 'carousel-3d',
	);

	/**
	 * Card designs Free renders as their own look. Anything else (card-4 …
	 * card-11, or a Pro overlay preset overlay-1 … overlay-5) normalizes to 'card-1'.
	 *
	 * @var array<int, string>
	 */
	const FREE_CARD_DESIGNS = array( '', 'card-1', 'card-2', 'card-3' );

	/**
	 * The light text Pro's overlay look sets for the dark scrim — the 3D
	 * Carousel's schema defaults and what Pro's design switch stores for
	 * overlay-1 … overlay-5. Free renders those as card-1 (white card), so a
	 * value still equal to these reads as unset there (style_attributes()).
	 *
	 * @var array<string, string>
	 */
	const PRO_OVERLAY_TEXT_COLORS = array(
		'nameColor' => '#ffffff',
		'roleColor' => '#e0e0e0',
		'bioColor'  => '#ffffff',
	);

	/**
	 * Card attributes as the dynamic-CSS engines (Styles\CardCss and its JS
	 * twin cardDynamicCss.js) must see them in Free: `cardDesign` normalized
	 * exactly like the markup (card_design()), and — when the stored design is
	 * a Pro overlay preset or the block is the Pro 3D Carousel — the overlay's
	 * still-default light text colors dropped, so card-1's dark text holds
	 * instead of white-on-white. Returns a copy; the stored attributes are
	 * never touched (read-only, idempotent).
	 *
	 * @param array $attributes Block attributes (with `blockName` on the CSS path).
	 * @return array
	 */
	public static function style_attributes( $attributes ) {
		if ( ! is_array( $attributes ) ) {
			return array();
		}
		$stored       = isset( $attributes['cardDesign'] ) && is_string( $attributes['cardDesign'] ) ? $attributes['cardDesign'] : '';
		$block_name   = isset( $attributes['blockName'] ) && is_string( $attributes['blockName'] ) ? $attributes['blockName'] : '';
		$from_overlay = 0 === strpos( $stored, 'overlay-' ) || in_array( $block_name, array( 'carousel-3d', 'sptp/carousel-3d' ), true );

		$attributes['cardDesign'] = self::card_design( $stored );
		if ( $from_overlay ) {
			foreach ( self::PRO_OVERLAY_TEXT_COLORS as $key => $overlay_value ) {
				if ( isset( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) && strtolower( trim( $attributes[ $key ] ) ) === $overlay_value ) {
					unset( $attributes[ $key ] );
				}
			}
		}
		return $attributes;
	}

	/**
	 * Element keys a free layout block's card-content loop
	 * (MemberLayoutBlock::render_element()) may show — the six free rows of
	 * the Card Content → Member Information list (Figma node 678:280148).
	 * Skills is free: the Add New Member screen's Skills repeater is Free's own
	 * field (switched by the Member Skills module). Every other element
	 * (contact rows, experience, language, gender, custom info) is Pro: the
	 * inspector shows it as a locked "(Pro)" row and the renderer skips it. `video`/`resume`/`photo-gallery` were never
	 * selectable Grid/Carousel card elements (and are Pro-only blocks too —
	 * see BLOCK_FALLBACK), so there is nothing to gate for them here.
	 *
	 * @var array<int, string>
	 */
	const FREE_CARD_ELEMENTS = array(
		'image',
		'name',
		'role',
		'bio',
		'social',
		'skills',
	);

	/**
	 * Carousel Style values Free can select and render. Of the four options
	 * offered in the Select Carousel Style picker, only 'default' is free —
	 * 'center', 'ticker' and 'multi-row' are Pro. 'coverflow' is not a new
	 * Pro/free distinction: it is a pre-existing legacy stored value (no
	 * longer offered in the picker) that both plugins have always accepted
	 * and normalized in SwiperConfig::resolve_effect() — kept free here so
	 * old content it wasn't gated in the first place doesn't regress.
	 *
	 * @var array<int, string>
	 */
	const FREE_CAROUSEL_STYLES = array( 'default', 'coverflow' );

	/**
	 * Slide Effect values Free can select and render. 'fade' and 'spring' are
	 * Pro. 'ken-burns' is a legacy stored value (no longer offered in the
	 * picker, resolved to a plain slide transition) kept free for the same
	 * back-compat reason as 'coverflow' above.
	 *
	 * @var array<int, string>
	 */
	const FREE_SLIDE_EFFECTS = array( 'none', 'slide', 'flip', 'cube', 'ken-burns' );

	/**
	 * Carousel Display Style (direction) values Free can select and render.
	 * 'vertical' is Pro.
	 *
	 * @var array<int, string>
	 */
	const FREE_DISPLAY_STYLES = array( 'horizontal' );

	/**
	 * Query Builder "Filter Members" values Free offers. 'groups'
	 * (Taxonomies) and 'specific' are Pro — Free ships no picker or query
	 * logic for them; MemberQuery always queries Latest. Localized only so
	 * the editor can tag those options `(Pro)`.
	 *
	 * @var array<int, string>
	 */
	const FREE_FILTER_BY = array( 'latest' );

	/**
	 * Grid "Select Grid Style" values Free offers. 'polaroid' and
	 * 'staggered' are Pro — Free ships no CSS or markup for them, so a
	 * Pro-saved style simply renders as the normal grid. Localized only so the
	 * editor can lock those tiles.
	 *
	 * @var array<int, string>
	 */
	const FREE_GRID_STYLES = array( 'normal' );

	/**
	 * Card Content → Hover Effect values Free offers: only 'none'. Slide
	 * Up/Down/Left/Right and Scale Up/Down are Pro — Free ships no CSS or
	 * class output for them (`hoverEffect` is registered but never read), so a
	 * Pro-saved effect simply renders with no card hover. Localized only so
	 * the editor can lock those options.
	 *
	 * @var array<int, string>
	 */
	const FREE_CARD_HOVER_EFFECTS = array( 'none' );

	/**
	 * Member Image → Image Masking shapes Free can select and render: only
	 * 'mask3' (diamond). Every other shape is Pro and renders as the diamond
	 * (see mask_shape()).
	 *
	 * @var array<int, string>
	 */
	const FREE_MASK_SHAPES = array( 'mask3' );

	/**
	 * Carousel / Photo Gallery → Navigation Arrow → Arrow Style values Free
	 * can select and render: every glyph of the picker (all twelve are free).
	 * An unknown value renders as 'chevron-outline' (see nav_arrow_style()).
	 * Show on Hover and Offset X / Offset Y are Pro
	 * in their entirety: Free ships no CSS for them (the attributes are
	 * registered, never read) — see Styles\Carousel_Chrome::nav_arrow_css().
	 *
	 * @var array<int, string>
	 */
	const FREE_NAV_ARROW_STYLES = array(
		'chevron-solid',
		'chevron-outline',
		'chevron-bold',
		'double-chevron',
		'arrow-solid',
		'arrow-outline',
		'arrow-minimal',
		'chevron-border-line',
		'double-chevron-outline',
		'triangle-outline',
		'arrow-line',
		'arrow-send',
	);

	/**
	 * Carousel / Photo Gallery → Pagination Dots → Pagination Style values
	 * Free can select and render: 'dots' and 'number', listed first in the
	 * picker. Dynamic, Strokes, Scrollbar, Stepper and Fraction are Pro and
	 * render as 'dots' (see pagination_style()) — Free ships no CSS, markup or
	 * Swiper config for them.
	 *
	 * @var array<int, string>
	 */
	const FREE_PAGINATION_STYLES = array( 'dots', 'number' );

	/**
	 * Member Image → Hover Effects values Free can select and render. Move
	 * Left/Right/Top/Bottom, Rotate, Grow Rotate, Shine and Circle Shine are
	 * Pro and render as 'none' (see image_hover_effect()).
	 *
	 * @var array<int, string>
	 */
	const FREE_IMAGE_HOVER_EFFECTS = array( 'none', 'zoom-in', 'zoom-out' );

	/**
	 * Basic Information → Bio Source values Free can select and render.
	 * 'auto' (Auto Fallback) is Pro and renders as the short bio (see
	 * bio_source()). The Display Style 'limited' mode (Length / Ellipsis
	 * Points / Make Ellipsis Clickable) is Pro in its entirety: Free ships no
	 * truncation code and always prints the full text, whatever
	 * `bioDisplayStyle` holds.
	 *
	 * @var array<int, string>
	 */
	const FREE_BIO_SOURCES = array( 'short', 'full' );

	/**
	 * Member Details → Open as values Free can select and render. 'modal' is
	 * Pro (Free ships no modal runtime or details templates) and renders as
	 * the Single Page link (see details_open_as()). The attribute default
	 * stays 'modal' — it is shared with Pro, so an untouched block resolves
	 * to Single Page here and back to Modal when Pro returns.
	 *
	 * @var array<int, string>
	 */
	const FREE_DETAILS_OPEN_AS = array( 'single' );

	/**
	 * Member Details → Make Clickable values Free can select and render.
	 * Only Name, Image and Name and Full Card are Pro and render as Only
	 * Image (see make_clickable()).
	 *
	 * @var array<int, string>
	 */
	const FREE_MAKE_CLICKABLE = array( 'image' );

	/**
	 * Ready Patterns library tiers Free can insert. A pattern of any other tier
	 * is listed and previewable, but its card and preview drawer offer an
	 * Upgrade link instead of Insert, and the REST route never serves its markup
	 * (see is_free_pattern()).
	 *
	 * @var array<int, string>
	 */
	const FREE_PATTERN_TIERS = array( 'free' );

	/**
	 * Pro block => the free block whose renderer stands in for it, or null to
	 * render nothing (the addon carries no content of its own). Only the 14
	 * blocks NOT in FREE_BLOCKS appear here — the member-data blocks (resume,
	 * hire button, video, photo gallery, additional/custom information)
	 * included: Free's Add New Member screen has no (enabled) field for their data. Member Skills is the
	 * exception — it has one, so it is a real free block.
	 *
	 * @var array<string, string|null>
	 */
	const BLOCK_FALLBACK = array(
		'sptp/carousel-3d'            => 'sptp/carousel',
		'sptp/member-resume'          => null,
		'sptp/hire-button'            => null,
		'sptp/member-video'           => null,
		'sptp/member-photo-gallery'   => null,
		'sptp/additional-information' => null,
		'sptp/custom-information'     => null,
		'sptp/ajax-member-search'     => null,
		'sptp/live-frontend-filter'   => null,
		'sptp/filter-by-department'   => null,
		'sptp/filter-by-designation'  => null,
		'sptp/filter-by-location'     => null,
		'sptp/filter-by-gender'       => null,
	);

	/**
	 * Normalize a stored `cardDesign` value to a free one.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function card_design( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_CARD_DESIGNS, true ) ? $stored : 'card-1';
	}

	/**
	 * Drop any Pro-only entry from a stored `cardElements` list ( `{ value,
	 * show }` items, as saved by the inspector's sortable Member Information
	 * list — see MemberLayoutBlock::ordered_elements() ).
	 *
	 * @param array $stored Stored `cardElements` attribute.
	 * @return array
	 */
	public static function card_elements( $stored ) {
		if ( ! is_array( $stored ) ) {
			return $stored;
		}

		return array_values(
			array_filter(
				$stored,
				function ( $element ) {
					$value = isset( $element['value'] ) ? $element['value'] : '';
					return in_array( $value, self::FREE_CARD_ELEMENTS, true );
				}
			)
		);
	}

	/**
	 * Normalize a stored `carouselStyle` value to a free one.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function carousel_style( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_CAROUSEL_STYLES, true ) ? $stored : 'default';
	}

	/**
	 * Normalize a stored `slidingEffect` value to a free one.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function slide_effect( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_SLIDE_EFFECTS, true ) ? $stored : 'slide';
	}

	/**
	 * Normalize a stored `carouselDisplayStyle` value to a free one.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function display_style( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_DISPLAY_STYLES, true ) ? $stored : 'horizontal';
	}

	/**
	 * Normalize a stored `imageMaskShape` value to a free one. The attribute
	 * default ('mask2', hexagon) is Pro, so an untouched block resolves to the
	 * diamond too.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function mask_shape( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_MASK_SHAPES, true ) ? $stored : 'mask3';
	}

	/**
	 * Normalize a stored `navIconName` value to a free Arrow Style.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function nav_arrow_style( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_NAV_ARROW_STYLES, true ) ? $stored : 'chevron-outline';
	}

	/**
	 * Normalize a stored `paginationStyle` value to a free one.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function pagination_style( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_PAGINATION_STYLES, true ) ? $stored : 'dots';
	}

	/**
	 * Normalize a stored `imageHoverEffect` value to a free one.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function image_hover_effect( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_IMAGE_HOVER_EFFECTS, true ) ? $stored : 'none';
	}

	/**
	 * Normalize a stored `bioSource` value to a free one.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function bio_source( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_BIO_SOURCES, true ) ? $stored : 'short';
	}

	/**
	 * Normalize a stored `detailsOpenAs` value to a free one.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function details_open_as( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_DETAILS_OPEN_AS, true ) ? $stored : 'single';
	}

	/**
	 * Normalize a stored `makeClickable` value to a free one.
	 *
	 * @param string $stored Stored attribute value.
	 * @return string
	 */
	public static function make_clickable( $stored ) {
		$stored = is_string( $stored ) ? $stored : '';
		return in_array( $stored, self::FREE_MAKE_CLICKABLE, true ) ? $stored : 'image';
	}

	/**
	 * Partial Slide View is Pro-only in its entirety — Free never renders it,
	 * whatever was stored.
	 *
	 * @param mixed $stored Stored attribute value (ignored).
	 * @return bool Always false.
	 */
	public static function partial_view( $stored ) {
		unset( $stored );
		return false;
	}

	/**
	 * The card Read More button is Pro-only in its entirety — Free never
	 * renders it, whatever was stored (the stored `readMoreButton` is left
	 * as-is so re-activating Pro restores it).
	 *
	 * @param mixed $stored Stored attribute value (ignored).
	 * @return bool Always false.
	 */
	public static function read_more_button( $stored ) {
		unset( $stored );
		return false;
	}

	/**
	 * The free block whose renderer should stand in for a Pro-only block, or
	 * null when it must render nothing, or false when the block is already
	 * free (not in BLOCK_FALLBACK at all).
	 *
	 * @param string $block_name Full block name (e.g. 'sptp/carousel-3d').
	 * @return string|null|false
	 */
	public static function block_fallback( $block_name ) {
		return array_key_exists( $block_name, self::BLOCK_FALLBACK )
			? self::BLOCK_FALLBACK[ $block_name ]
			: false;
	}

	/**
	 * Whether a block name is one of the 12 free blocks.
	 *
	 * @param string $block_name Full block name.
	 * @return bool
	 */
	public static function is_free_block( $block_name ) {
		return in_array( $block_name, self::FREE_BLOCKS, true );
	}

	/**
	 * Whether a Pro-only block is listed in the inserter's Pro section.
	 *
	 * @param string $block_name Full block name.
	 * @return bool
	 */
	public static function is_pro_inserter_block( $block_name ) {
		return array_key_exists( $block_name, self::PRO_INSERTER_BLOCKS );
	}

	/**
	 * Whether a Ready Patterns manifest item is one Free may insert.
	 *
	 * Resolves the tier the way the library's filters do: an explicit `tier`
	 * wins ('premium' reads as 'pro'), and an item without one falls back to
	 * its legacy `pro` flag. A free-tier item built on a Pro-only block (its
	 * `blockName` / `blocks[]`, e.g. a free 3D Carousel pattern) is Pro here too —
	 * inserted, it would only show the locked-block notice.
	 *
	 * @param array $item Manifest item.
	 * @return bool
	 */
	public static function is_free_pattern( $item ) {
		$tier = isset( $item['tier'] ) && is_string( $item['tier'] ) ? $item['tier'] : '';

		if ( 'premium' === $tier ) {
			$tier = 'pro';
		}
		if ( 'free' !== $tier && 'pro' !== $tier ) {
			$tier = empty( $item['pro'] ) ? 'free' : 'pro';
		}
		if ( ! in_array( $tier, self::FREE_PATTERN_TIERS, true ) ) {
			return false;
		}

		$blocks = isset( $item['blocks'] ) && is_array( $item['blocks'] ) ? $item['blocks'] : array();
		if ( isset( $item['blockName'] ) ) {
			$blocks[] = $item['blockName'];
		}

		return self::are_free_blocks( $blocks );
	}

	/**
	 * Whether every `sptp/*` name in a list is a free block. Names outside
	 * the `sptp/` prefix (core blocks) are not this gate's concern.
	 *
	 * @param array $block_names Block names.
	 * @return bool
	 */
	public static function are_free_blocks( $block_names ) {
		foreach ( $block_names as $name ) {
			if ( is_string( $name ) && 0 === strpos( $name, 'sptp/' ) && ! self::is_free_block( $name ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * The editor-twin payload — read by apps/blocks/shared/proGate.js. The
	 * constants above are the only source of truth; the JS never re-declares
	 * them (docs/pro-free-separation.md §3, the twin-surface rule).
	 *
	 * @return array
	 */
	public static function localize() {
		return array(
			'freeBlocks'            => self::FREE_BLOCKS,
			'freeCardDesigns'       => self::FREE_CARD_DESIGNS,
			'proOverlayTextColors'  => self::PRO_OVERLAY_TEXT_COLORS,
			'freeCardElements'      => self::FREE_CARD_ELEMENTS,
			'freeCarouselStyles'    => self::FREE_CAROUSEL_STYLES,
			'freeSlideEffects'      => self::FREE_SLIDE_EFFECTS,
			'freeDisplayStyles'     => self::FREE_DISPLAY_STYLES,
			'freeFilterBy'          => self::FREE_FILTER_BY,
			'freeGridStyles'        => self::FREE_GRID_STYLES,
			'freeCardHoverEffects'  => self::FREE_CARD_HOVER_EFFECTS,
			'freeMaskShapes'        => self::FREE_MASK_SHAPES,
			'freeNavArrowStyles'    => self::FREE_NAV_ARROW_STYLES,
			'freePaginationStyles'  => self::FREE_PAGINATION_STYLES,
			'freeImageHoverEffects' => self::FREE_IMAGE_HOVER_EFFECTS,
			'freeBioSources'        => self::FREE_BIO_SOURCES,
			'freeDetailsOpenAs'     => self::FREE_DETAILS_OPEN_AS,
			'freeMakeClickable'     => self::FREE_MAKE_CLICKABLE,
			'freePatternTiers'      => self::FREE_PATTERN_TIERS,
			'proInserterBlocks'     => self::PRO_INSERTER_BLOCKS,
		);
	}
}
