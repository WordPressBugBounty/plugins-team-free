/**
 * Explicit column-count enforcement. A number the prompt states outright
 * ("5 columns") must not lose to a matched pattern's baked-in layout or a
 * generation that drifted off it.
 */

/**
 * Read an explicit column count out of the prompt.
 *
 * @param {string} promptText User prompt.
 * @param {number} [max]      Largest count the block's control allows.
 * @return {number|null} Column count, or null when the prompt names none.
 */
export function extractColumnCount(promptText, max = 6) {
	const match = /(\d+)\s*[- ]?\s*(?:columns?|across|per row)\b/i.exec(promptText || '');
	if (!match) {
		return null;
	}
	const columns = parseInt(match[1], 10);
	return Number.isFinite(columns) && columns > 0 ? Math.min(columns, max) : null;
}

/**
 * Patch `columns.device.Desktop` from an explicit count in the prompt. Tablet
 * and Mobile keep what they had — guessing a scaled-down value would be
 * another fabricated number.
 *
 * @param {Object}  attributes         Attributes to check/patch.
 * @param {string}  promptText         User prompt.
 * @param {Object}  [options]
 * @param {?Object} [options.fallback] The block's current (or default) `columns`,
 *                                     used when `attributes` carries none — a
 *                                     model that omitted `columns` is the drift
 *                                     this exists to correct.
 * @param {number}  [options.max]      Largest count the block allows.
 * @return {Object} Patched attributes, or the same reference when unchanged.
 */
export function applyColumnOverride(attributes, promptText, { fallback = null, max = 6 } = {}) {
	const columns = extractColumnCount(promptText, max);
	const current = attributes?.columns || fallback;
	if (!columns || !current || Number(current?.device?.Desktop) === columns) {
		return attributes;
	}

	return {
		...attributes,
		columns: { ...current, device: { ...current.device, Desktop: columns } },
	};
}

/**
 * Find the Smart Team layout block inside a full block tree — a pattern root
 * may be a wrapper (the team-group, a core/group) with the layout nested inside.
 *
 * @param {Object|null} block Full block object (innerBlocks included).
 * @return {Object|null} The layout block, or null.
 */
export function findLayoutBlock(block) {
	if (!block) {
		return null;
	}
	if (['sptp/grid', 'sptp/carousel'].includes(block.name)) {
		return block;
	}
	for (const inner of block.innerBlocks || []) {
		const found = findLayoutBlock(inner);
		if (found) {
			return found;
		}
	}
	return null;
}
