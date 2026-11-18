/**
 * Resets donor-site identity on a pattern's Smart Team blocks before insert.
 *
 * Smart Team's member-aware field blocks (`sptp/member-image`,
 * `sptp/member-photo-gallery`, …) carry no attachment id the way a carousel
 * item does — they resolve their photo from the referenced member post at
 * render time. What they carry instead is `memberId`: `0` means "auto — the
 * current member from context", and anything else pins the block to one
 * specific `sptp_member` post on the authoring site
 * (`wp-team-pro-demo-site-core`'s README, "Portability"). The pattern server's
 * own portability rewrite already resets a non-zero `memberId` to `0` before a
 * pattern is published, so this is belt-and-suspenders — the same posture
 * wp-carousel-pro's sanitizer takes with its already server-stripped donor
 * query keys.
 *
 * The query-builder blocks (Grid, Carousel, 3D Carousel, the ajax addons) keep
 * their design (`filterBy`, `limit`, `orderBy`, `order`) — only the server's
 * own `strip_donor_query()` touches their donor group/member selection
 * (`selectedGroups`, `includesItems`, `excludesItems`), which is already gone
 * from the served payload by the time it reaches this module.
 */

import { isSptpBlockName } from './patternBlockAllowList';

/**
 * Sanitize parsed pattern attributes before applying to the editor block.
 *
 * @param {Object} attributes Parsed block attributes from the pattern payload.
 * @return {Object} Sanitized attributes.
 */
export function sanitizePatternAttributes(attributes) {
	if (!attributes || 'object' !== typeof attributes) {
		return attributes;
	}

	const next = { ...attributes };

	// parse() fills schema defaults, so patterns always carry uniqueId (usually "").
	// The target block must keep its own id — per-instance CSS is scoped to it.
	delete next.uniqueId;

	if ('memberId' in next && 0 !== next.memberId && '' !== next.memberId) {
		next.memberId = 0;
	}

	return next;
}

/**
 * Sanitize every `sptp/*` block in a parsed pattern tree.
 *
 * Allow-listed core wrappers are returned untouched — by reference when nothing
 * below them changed — so authored headings, copy, and images insert verbatim.
 *
 * @param {Array} blocks Parsed blocks.
 * @return {Array} Blocks with Smart Team attributes sanitized.
 */
export function sanitizePatternTree(blocks) {
	if (!Array.isArray(blocks)) {
		return blocks;
	}

	let treeChanged = false;

	const sanitized = blocks.map((block) => {
		const hasInner = Array.isArray(block?.innerBlocks) && block.innerBlocks.length > 0;
		const innerBlocks = hasInner ? sanitizePatternTree(block.innerBlocks) : block?.innerBlocks;

		if (!isSptpBlockName(block?.name)) {
			if (innerBlocks === block?.innerBlocks) {
				return block;
			}
			treeChanged = true;
			return { ...block, innerBlocks };
		}

		const attributes = sanitizePatternAttributes(block.attributes) || {};
		treeChanged = true;

		return { ...block, attributes, innerBlocks };
	});

	return treeChanged ? sanitized : blocks;
}
