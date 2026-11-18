/**
 * Editor twin of blocks/Includes/Pro_Gate.php.
 *
 * Reads the `sptpProGate` object localized by AssetManager from
 * Pro_Gate::localize() — the free block list, free card designs and free
 * card elements. This file never re-declares those lists itself (the
 * twin-surface rule in docs/pro-free-separation.md §3): PHP is the only
 * source of truth, JS only asks it questions.
 *
 * Every reader FAILS OPEN when the localized payload is missing (a test
 * harness, a context where the editor bundle loaded without it) — better a
 * visible/unlocked option than one silently hidden.
 */

const payload = () => (typeof window !== 'undefined' ? window.sptpProGate : undefined);

/**
 * The 18 free block names.
 *
 * @return {string[]}
 */
export const getFreeBlockList = () => {
	const list = payload()?.freeBlocks;
	return Array.isArray(list) ? list : null;
};

/**
 * Whether a block name is one of the free blocks. Fails open (true) when the
 * list is missing, and also returns true for any name absent from a present
 * list's negative space — callers that need "is this specific block gated"
 * should use `isFreeBlock`, not assume every unknown name is Pro-only.
 *
 * @param {string} name Full block name, e.g. 'sptp/carousel-3d'.
 * @return {boolean}
 */
export const isFreeBlock = (name) => {
	const list = getFreeBlockList();
	if (!list) {
		return true;
	}
	return list.includes(name);
};

/**
 * Whether a `cardDesign` value is one of the free designs.
 *
 * @param {string} value e.g. 'card-1' or 'card-7'.
 * @return {boolean}
 */
export const isFreeCardDesign = (value) => {
	const list = payload()?.freeCardDesigns;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * The card design Free actually renders — twin of Pro_Gate::card_design()
 * (with the editor's `|| 'card-1'` default folded in): a Pro card-4…11 or
 * overlay-N preset renders as card-1. Fails open without the payload.
 *
 * @param {string} value Stored `cardDesign`.
 * @return {string}
 */
export const resolveCardDesign = (value) => {
	const design = value || 'card-1';
	return isFreeCardDesign(design) ? design : 'card-1';
};

/**
 * Card attributes as the dynamic CSS must see them — twin of
 * Pro_Gate::style_attributes(): `cardDesign` normalized like the markup, and a
 * Pro overlay preset's still-default light text colors (the localized
 * `proOverlayTextColors`) dropped so card-1's dark text holds. Returns a copy.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object}
 */
export const resolveStyleAttributes = (attributes) => {
	const stored = typeof attributes?.cardDesign === 'string' ? attributes.cardDesign : '';
	const next = { ...attributes, cardDesign: resolveCardDesign(stored) };
	const overlayColors = payload()?.proOverlayTextColors;
	if (stored.indexOf('overlay-') === 0 && overlayColors && typeof overlayColors === 'object') {
		Object.keys(overlayColors).forEach((key) => {
			if (
				typeof next[key] === 'string' &&
				next[key].trim().toLowerCase() === overlayColors[key]
			) {
				delete next[key];
			}
		});
	}
	return next;
};

/**
 * Whether a `cardElements` entry's value is a free element key.
 *
 * @param {string} value Element key, e.g. 'skills'.
 * @return {boolean}
 */
export const isFreeCardElement = (value) => {
	const list = payload()?.freeCardElements;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * Whether a `carouselStyle` value is one of the free styles.
 *
 * @param {string} value e.g. 'default' or 'center'.
 * @return {boolean}
 */
export const isFreeCarouselStyle = (value) => {
	const list = payload()?.freeCarouselStyles;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * Whether a `slidingEffect` value is one of the free effects.
 *
 * @param {string} value e.g. 'slide' or 'fade'.
 * @return {boolean}
 */
export const isFreeSlideEffect = (value) => {
	const list = payload()?.freeSlideEffects;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * Whether a `carouselDisplayStyle` value is one of the free styles.
 *
 * @param {string} value 'horizontal' or 'vertical'.
 * @return {boolean}
 */
export const isFreeDisplayStyle = (value) => {
	const list = payload()?.freeDisplayStyles;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * Whether a Query Builder `filterBy` value is one of the free modes.
 *
 * @param {string} value 'latest', 'groups' or 'specific'.
 * @return {boolean}
 */
export const isFreeFilterBy = (value) => {
	const list = payload()?.freeFilterBy;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * Whether a Grid `gridStyle` value is one of the free styles.
 *
 * @param {string} value e.g. 'normal' or 'polaroid'.
 * @return {boolean}
 */
export const isFreeGridStyle = (value) => {
	const list = payload()?.freeGridStyles;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * Whether a Card Content `hoverEffect` value is one of the free effects.
 * Only 'none' — Free has no render code for the Pro effects.
 *
 * @param {string} value e.g. 'none' or 'slide-up'.
 * @return {boolean}
 */
export const isFreeCardHoverEffect = (value) => {
	const list = payload()?.freeCardHoverEffects;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * Whether an Image Masking `imageMaskShape` value is one of the free shapes.
 *
 * @param {string} value e.g. 'mask3' (diamond) or 'mask2' (hexagon).
 * @return {boolean}
 */
export const isFreeMaskShape = (value) => {
	const list = payload()?.freeMaskShapes;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * A stored `imageMaskShape` resolved to the shape Free renders — a Pro shape
 * (including the 'mask2' attribute default) falls back to the diamond, like
 * Pro_Gate::mask_shape(). The stored value is never rewritten.
 *
 * @param {string} value Stored attribute value.
 * @return {string}
 */
export const resolveMaskShape = (value) => (value && isFreeMaskShape(value) ? value : 'mask3');

/**
 * Whether a Navigation Arrow `navIconName` value is one of the free Arrow Styles.
 *
 * @param {string} value e.g. 'chevron-solid' or 'arrow-minimal'.
 * @return {boolean}
 */
export const isFreeNavArrowStyle = (value) => {
	const list = payload()?.freeNavArrowStyles;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * A stored `navIconName` resolved to the Arrow Style Free renders — a Pro
 * style falls back to 'chevron-outline', like Pro_Gate::nav_arrow_style().
 * The stored value is never rewritten.
 *
 * @param {string} value Stored attribute value.
 * @return {string}
 */
export const resolveNavArrowStyle = (value) =>
	value && isFreeNavArrowStyle(value) ? value : 'chevron-outline';

/**
 * Whether a Pagination Dots `paginationStyle` value is one of the free styles
 * (Dots, Numbers).
 *
 * @param {string} value e.g. 'dots' or 'fraction'.
 * @return {boolean}
 */
export const isFreePaginationStyle = (value) => {
	const list = payload()?.freePaginationStyles;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * A stored `paginationStyle` resolved to the style Free renders — a Pro style
 * falls back to 'dots', like Pro_Gate::pagination_style(). The stored value is
 * never rewritten.
 *
 * @param {string} value Stored attribute value.
 * @return {string}
 */
export const resolvePaginationStyle = (value) =>
	value && isFreePaginationStyle(value) ? value : 'dots';

/**
 * Whether a Member Image `imageHoverEffect` value is one of the free effects.
 *
 * @param {string} value e.g. 'zoom-in' or 'shine'.
 * @return {boolean}
 */
export const isFreeImageHoverEffect = (value) => {
	const list = payload()?.freeImageHoverEffects;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * A stored `imageHoverEffect` resolved to the effect Free renders — a Pro
 * effect falls back to 'none', like Pro_Gate::image_hover_effect(). The
 * stored value is never rewritten.
 *
 * @param {string} value Stored attribute value.
 * @return {string}
 */
export const resolveImageHoverEffect = (value) =>
	value && isFreeImageHoverEffect(value) ? value : 'none';

/**
 * Whether a Basic Information `bioSource` value is one of the free sources.
 *
 * @param {string} value 'short', 'full' or 'auto'.
 * @return {boolean}
 */
export const isFreeBioSource = (value) => {
	const list = payload()?.freeBioSources;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * A stored `bioSource` resolved to the source Free renders — Auto Fallback
 * (Pro) falls back to the short bio, like Pro_Gate::bio_source(). The stored
 * value is never rewritten.
 *
 * @param {string} value Stored attribute value.
 * @return {string}
 */
export const resolveBioSource = (value) => (value && isFreeBioSource(value) ? value : 'short');

/**
 * Whether a Member Details `detailsOpenAs` value is one of the free modes.
 *
 * @param {string} value 'single' or 'modal'.
 * @return {boolean}
 */
export const isFreeDetailsOpenAs = (value) => {
	const list = payload()?.freeDetailsOpenAs;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * A stored `detailsOpenAs` resolved to the mode Free renders — Modal (Pro,
 * and the attribute default) falls back to Single Page, like
 * Pro_Gate::details_open_as(). The stored value is never rewritten.
 *
 * @param {string} value Stored attribute value.
 * @return {string}
 */
export const resolveDetailsOpenAs = (value) =>
	value && isFreeDetailsOpenAs(value) ? value : 'single';

/**
 * Whether a Member Details `makeClickable` value is one of the free targets.
 *
 * @param {string} value 'image', 'name', 'image-name' or 'full'.
 * @return {boolean}
 */
export const isFreeMakeClickable = (value) => {
	const list = payload()?.freeMakeClickable;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(value);
};

/**
 * A stored `makeClickable` resolved to the target Free renders — every Pro
 * target falls back to Only Image, like Pro_Gate::make_clickable(). The
 * stored value is never rewritten.
 *
 * @param {string} value Stored attribute value.
 * @return {string}
 */
export const resolveMakeClickable = (value) =>
	value && isFreeMakeClickable(value) ? value : 'image';

/**
 * Whether a Ready Patterns tier is one Free may insert — the tier half of
 * Pro_Gate::is_free_pattern(). Resolve the item's tier first with the
 * library's `resolveItemTier()` (ready-patterns/filterHelpers.js). A Pro
 * pattern stays listed and previewable; only Insert is swapped for an Upgrade
 * link, and the REST route refuses its markup anyway.
 *
 * @param {string} tier Resolved tier, 'free' or 'pro'.
 * @return {boolean}
 */
export const isFreePatternTier = (tier) => {
	const list = payload()?.freePatternTiers;
	if (!Array.isArray(list)) {
		return true;
	}
	return list.includes(tier);
};

/**
 * Every Pro-only block listed in the inserter (the keys of
 * Pro_Gate::PRO_INSERTER_BLOCKS). Empty without a payload.
 *
 * @return {string[]} Block names.
 */
export const getProInserterBlockNames = () => {
	const map = payload()?.proInserterBlocks;
	return map && typeof map === 'object' ? Object.keys(map) : [];
};

/**
 * The Ready Patterns category a Pro-only block's "View Demo" link opens, or
 * null when the block is not listed in the inserter — the JS
 * half of Pro_Gate::PRO_INSERTER_BLOCKS. Fails closed (null): with no payload
 * a Pro block simply stays out of the inserter, as before.
 *
 * @param {string} name Full block name, e.g. 'sptp/carousel-3d'.
 * @return {string|null} Pattern category slug.
 */
export const getProInserterPatternCategory = (name) => {
	const map = payload()?.proInserterBlocks;
	if (!map || typeof map !== 'object' || !Object.prototype.hasOwnProperty.call(map, name)) {
		return null;
	}
	return typeof map[name] === 'string' ? map[name] : null;
};
