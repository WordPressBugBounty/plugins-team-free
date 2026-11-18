/**
 * Ready Patterns deep link — opens the library when the editor loads with
 * `?sptp_patterns=true`, pre-selected on `sptp_pattern_block`'s category.
 * The target of a Pro block's "View Demo" link (proBlockNotice.jsx).
 *
 * The args are stripped with `history.replaceState` first, so a reload or a
 * back navigation never reopens the modal. The request goes through
 * `openReadyPatterns()`, which parks it until the editor-level host mounts —
 * no polling for the editor DOM. An unknown category opens "All Patterns".
 */

import { BLOCK_NAME_TO_CATEGORY, CATEGORY_SLUGS, DEEP_LINK } from './constants';
import { openReadyPatterns } from './openerRegistry';

/**
 * The block name whose category the modal pre-selects, or null for "all".
 *
 * @param {string|null} category Category slug from the URL.
 * @return {string|null} Block name.
 */
const blockNameForCategory = (category) => {
	if (!category || !CATEGORY_SLUGS.includes(category)) {
		return null;
	}
	return (
		Object.keys(BLOCK_NAME_TO_CATEGORY).find(
			(name) => BLOCK_NAME_TO_CATEGORY[name] === category
		) || null
	);
};

export function maybeOpenFromDeepLink() {
	if (typeof window === 'undefined' || !window.location) {
		return;
	}

	const url = new URL(window.location.href);
	if ('true' !== url.searchParams.get(DEEP_LINK.QUERY_ARG)) {
		return;
	}

	const blockName = blockNameForCategory(url.searchParams.get(DEEP_LINK.CATEGORY_ARG));

	url.searchParams.delete(DEEP_LINK.QUERY_ARG);
	url.searchParams.delete(DEEP_LINK.CATEGORY_ARG);
	window.history.replaceState(window.history.state, '', url.toString());

	openReadyPatterns(blockName ? { blockName } : {});
}
