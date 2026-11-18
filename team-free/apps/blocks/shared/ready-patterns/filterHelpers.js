/**
 * Ready Patterns — pure filter, sort, and count helpers (unit-testable).
 */

import {
	CATEGORY_SLUGS,
	FILTER_ALL,
	SORT_DEFAULT,
	SORT_LATEST,
	SORT_POPULAR,
	TIER_ALL,
	TIER_FREE,
	TIER_PREMIUM,
} from './constants';
import { isFreeBlock, isFreePatternTier } from '../proGate';

/**
 * Whether every `sptp/*` block a manifest item lists (`blockName` + `blocks[]`)
 * is a free block — mirrors Pro_Gate::are_free_blocks().
 *
 * @param {Object} item Manifest item.
 * @return {boolean} True when no listed block is Pro-only.
 */
function listsOnlyFreeBlocks(item) {
	const names = [...(Array.isArray(item?.blocks) ? item.blocks : []), item?.blockName];

	return names.every(
		(name) => 'string' !== typeof name || !name.startsWith('sptp/') || isFreeBlock(name)
	);
}

/**
 * Resolved tier for an item — explicit `tier` wins, legacy `pro` is the fallback.
 * Free only: a free-tier item built on a Pro-only block (a free 3D Carousel
 * pattern) resolves to "pro", like Pro_Gate::is_free_pattern(), so the tier
 * filter, its counts and the card's Insert/Upgrade swap all agree.
 *
 * @param {Object} item Manifest item.
 * @return {string} "free" or "pro".
 */
export function resolveItemTier(item) {
	let tier;
	if ('free' === item?.tier) {
		tier = 'free';
	} else if ('pro' === item?.tier || 'premium' === item?.tier) {
		tier = 'pro';
	} else {
		tier = item?.pro ? 'pro' : 'free';
	}

	return 'free' === tier && !listsOnlyFreeBlocks(item) ? 'pro' : tier;
}

/**
 * Whether Free may insert a manifest item. A Pro pattern is still listed and
 * previewable — its card and preview drawer offer an Upgrade link instead.
 *
 * @param {Object} item Manifest item.
 * @return {boolean} True when the item is free-tier.
 */
export function isFreePattern(item) {
	return isFreePatternTier(resolveItemTier(item));
}

/**
 * Tally manifest items per block-axis category slug.
 *
 * @param {Array} items Manifest items.
 * @return {Record<string, number>} Count map keyed by category slug.
 */
export function tallyCategoryCounts(items) {
	const counts = { all: items.length };
	CATEGORY_SLUGS.forEach((slug) => {
		counts[slug] = 0;
	});
	items.forEach((item) => {
		if (item?.category && Object.prototype.hasOwnProperty.call(counts, item.category)) {
			counts[item.category] += 1;
		}
	});
	return counts;
}

/**
 * Tally manifest items per tier (free vs premium).
 *
 * @param {Array} items Manifest items.
 * @return {Record<string, number>} Count map keyed by tier.
 */
export function tallyTierCounts(items) {
	const counts = { [TIER_ALL]: items.length, [TIER_FREE]: 0, [TIER_PREMIUM]: 0 };
	items.forEach((item) => {
		counts['pro' === resolveItemTier(item) ? TIER_PREMIUM : TIER_FREE] += 1;
	});
	return counts;
}

/**
 * Searchable haystack for an item: name, description, tags, keywords.
 *
 * Tags have no dedicated sidebar facet (see Sidebar.jsx), but they still
 * widen what the search box matches — a manifest item tagged "hover-overlay"
 * is found by typing it, even with no way to browse the tag list directly.
 *
 * @param {Object} item Manifest item.
 * @return {string} Lower-cased haystack.
 */
function searchHaystack(item) {
	const parts = [item?.name || '', item?.description || ''];

	if (Array.isArray(item?.tags)) {
		parts.push(item.tags.join(' '));
	}
	if (Array.isArray(item?.keywords)) {
		parts.push(item.keywords.join(' '));
	}

	return parts.join(' ').toLowerCase();
}

/**
 * Timestamp used by the "Latest" sort: created, then modified, then ID.
 *
 * @param {Object} item Manifest item.
 * @return {number} Comparable value.
 */
function latestRank(item) {
	const stamp = item?.created || item?.modified || '';
	if (stamp) {
		const parsed = Date.parse(stamp);
		if (!Number.isNaN(parsed)) {
			return parsed;
		}
	}

	const numericId = Number(item?.id);

	return Number.isNaN(numericId) ? 0 : numericId;
}

/**
 * Filter manifest items across every axis.
 *
 * @param {Array}  items   Manifest items.
 * @param {Object} filters { tier, category, search }.
 * @return {Array} Filtered manifest items.
 */
export function filterPatterns(items, filters) {
	const { tier = TIER_ALL, category = FILTER_ALL, search = '' } = filters;
	const needle = search.trim().toLowerCase();

	return items.filter((item) => {
		const itemTier = resolveItemTier(item);
		if (TIER_FREE === tier && 'free' !== itemTier) {
			return false;
		}
		if (TIER_PREMIUM === tier && 'pro' !== itemTier) {
			return false;
		}
		if (FILTER_ALL !== category && item.category !== category) {
			return false;
		}
		if (needle && !searchHaystack(item).includes(needle)) {
			return false;
		}
		return true;
	});
}

/**
 * Sort manifest items.
 *
 * @param {Array}  items Manifest items.
 * @param {string} sort  Sort key.
 * @return {Array} Sorted manifest items.
 */
export function sortPatterns(items, sort) {
	const copy = [...items];
	if (SORT_POPULAR === sort) {
		copy.sort((a, b) => (b.hit || 0) - (a.hit || 0));
		return copy;
	}
	if (SORT_LATEST === sort) {
		copy.sort((a, b) => latestRank(b) - latestRank(a));
		return copy;
	}
	copy.sort((a, b) => categoryRank(a) - categoryRank(b));
	return copy;
}

/**
 * Position of an item's block category in CATEGORY_SLUGS — the plugin-wide block order.
 *
 * @param {Object} item Manifest item.
 * @return {number} Index, or the end of the list for an unknown category.
 */
function categoryRank(item) {
	const index = CATEGORY_SLUGS.indexOf(item?.category);
	return -1 === index ? CATEGORY_SLUGS.length : index;
}

/**
 * Whether a pattern is favorited.
 *
 * Favorites are stored by durable slug; entries written before that change are
 * plain IDs, so both are matched until the next toggle rewrites them.
 *
 * @param {Array}                favorites Favorited keys (slugs, or legacy IDs).
 * @param {string|number|Object} pattern   Manifest item, or a bare id/slug.
 * @return {boolean} True when favorited.
 */
export function isPatternFavorite(favorites, pattern) {
	const list = favorites || [];
	const keys =
		pattern && 'object' === typeof pattern
			? [pattern.slug, pattern.id].filter(
					(key) => undefined !== key && null !== key && '' !== key
				)
			: [pattern];

	return list.some((entry) => keys.some((key) => String(entry) === String(key)));
}

/**
 * Compose filter + sort pipeline.
 *
 * @param {Array}  items   Manifest items.
 * @param {Object} options Filter and sort options.
 * @return {Array} Visible patterns after filter and sort.
 */
export function getVisiblePatterns(items, options) {
	const scoped = options.favoritesOnly
		? items.filter((item) => isPatternFavorite(options.favorites, item))
		: items;
	const filtered = filterPatterns(scoped, options);
	return sortPatterns(filtered, options.sort || SORT_DEFAULT);
}
