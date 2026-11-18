/**
 * Ready Patterns — shared constants.
 */

import { __ } from '@wordpress/i18n';

export const READY_PATTERNS_PREFIX = 'sptp-ready-patterns';

/** Where a Pro pattern's Upgrade link (card + preview drawer) points. */
export const PATTERN_UPGRADE_URL =
	'https://getwpteam.com/pricing/?utm_source=free-plugin&utm_medium=ready-patterns';

/**
 * Sidebar block-axis slugs (excludes "all"), in display order. Mirrors
 * Pro's `PatternVocabulary::CATEGORY_LABELS` (not ported to Free).
 *
 * Only the three top-level layout blocks are library categories. Every other
 * `sptp/*` block (team-group, the ajax/filter addons, the member field
 * blocks, social-profile, hire-button) is a
 * CHILD of one of these three — never a freestanding library entry — so a
 * pattern's `category` always resolves to one of these three regardless of
 * which child blocks it nests.
 */
export const CATEGORY_SLUGS = ['carousel', 'carousel-3d', 'grid'];

/**
 * Category slug → translated sidebar label.
 *
 * @return {Record<string, string>} Label map.
 */
export function categoryLabels() {
	return {
		all: __('All Patterns', 'team-free'),
		carousel: __('Carousel', 'team-free'),
		'carousel-3d': __('3D Carousel', 'team-free'),
		grid: __('Grid', 'team-free'),
	};
}

/** Map block name → default sidebar category slug. Mirrors Pro's `PatternVocabulary::BLOCK_MAP`. */
export const BLOCK_NAME_TO_CATEGORY = {
	'sptp/carousel': 'carousel',
	'sptp/carousel-3d': 'carousel-3d',
	'sptp/grid': 'grid',
};

export const FILTER_ALL = 'all';

export const TIER_ALL = 'all';
export const TIER_FREE = 'free';
export const TIER_PREMIUM = 'premium';

export const SORT_DEFAULT = 'default';
export const SORT_POPULAR = 'popular';
export const SORT_LATEST = 'latest';

export const GRID_DENSITY_TWO = 2;
export const GRID_DENSITY_THREE = 3;

/** Preview drawer device widths in logical pixels. */
export const PREVIEW_DEVICES = [
	{ key: 'desktop', width: 1440 },
	{ key: 'tablet', width: 834 },
	{ key: 'mobile', width: 390 },
];

/**
 * Whether the header-toolbar shortcut should be injected.
 *
 * Not a feature flag: the modal, the REST routes and every other way into the
 * library ignore it. Only the `sptp_ready_patterns_enabled` filter feeds it in
 * Free (Pro also has a dashboard module for it).
 *
 * @return {boolean} True when the header button belongs in the toolbar.
 */
export function isReadyPatternsLauncherEnabled() {
	if (typeof window === 'undefined') {
		return false;
	}
	return Boolean(window.sptpBlocksEditor?.readyPatterns?.headerLauncher);
}

/**
 * REST base URL for patterns endpoints.
 *
 * @return {string} REST path for apiFetch.
 */
export function getReadyPatternsRestBase() {
	return window.sptpBlocksEditor?.readyPatterns?.restBase || '/sptp/v1/patterns';
}

/**
 * REST path for the favorites endpoint.
 *
 * @return {string} REST path for apiFetch.
 */
export function getReadyPatternsFavoritesPath() {
	return '/sptp/v1/pattern-favorites';
}

/**
 * Resolve initial category from a block name.
 *
 * @param {string} blockName Registered block name.
 * @return {string} Category slug or "all".
 */
export function categoryFromBlockName(blockName) {
	return BLOCK_NAME_TO_CATEGORY[blockName] || 'all';
}

/**
 * Deep-link query args: a Pro block's "View Demo" link opens a new page
 * editor with `?sptp_patterns=true&sptp_pattern_block=<category>`, and
 * deepLink.js opens the library on that category (Real Testimonials Free's
 * `realpatterns` / `rtp_pattern_block` pattern).
 */
export const DEEP_LINK = {
	QUERY_ARG: 'sptp_patterns',
	CATEGORY_ARG: 'sptp_pattern_block',
};

/**
 * The "View Demo" URL for a library category.
 *
 * @param {string} category Category slug, one of CATEGORY_SLUGS.
 * @return {string} Admin URL of a new page that opens the library on it.
 */
export function buildPatternLibraryLink(category) {
	const adminUrl = window.sptpBlocksEditor?.adminUrl || '';
	const params = new URLSearchParams({
		post_type: 'page',
		[DEEP_LINK.QUERY_ARG]: 'true',
		[DEEP_LINK.CATEGORY_ARG]: category,
	});
	return `${adminUrl}post-new.php?${params.toString()}`;
}

/**
 * Nearest layout block (self first, then ancestors) that owns a library category,
 * so a child block's sidebar button opens its parent layout's patterns.
 *
 * @param {string}   clientId                  Block client id.
 * @param {Object}   selectors                 Block-editor selectors.
 * @param {Function} selectors.getBlockName
 * @param {Function} selectors.getBlockParents
 * @return {string|null} Layout block name, or null when none is in scope.
 */
export function layoutBlockNameFor(clientId, { getBlockName, getBlockParents }) {
	if (!clientId) {
		return null;
	}
	const lineage = [clientId, ...getBlockParents(clientId, true)];
	return lineage.map(getBlockName).find((name) => BLOCK_NAME_TO_CATEGORY[name]) || null;
}
