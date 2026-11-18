/**
 * Turn a generated attribute set into the update a layout block should get.
 *
 * Picking a card design is more than writing `cardDesign`: the design picker
 * runs `applyCardDesign()`, which swaps every still-at-default control
 * (alignment, photo ratio, radius, visible rows) to the new design's defaults. A generated design that skipped
 * that would render with the previous design's leftovers. So the design is
 * applied first through the same function the picker uses, and the model's
 * own explicit settings are layered on top.
 */

import { getBlockType } from '@wordpress/blocks';
import { applyCardDesign } from '../cardDesign';

/**
 * Registered attribute defaults for a block.
 *
 * @param {string} blockName Block name.
 * @return {Object} Attribute defaults.
 */
export function registeredDefaults(blockName) {
	const attributes = getBlockType(blockName)?.attributes || {};

	return Object.fromEntries(
		Object.entries(attributes)
			.filter(([, definition]) => undefined !== definition?.default)
			.map(([key, definition]) => [key, definition.default])
	);
}

/**
 * Run the design picker logic and capture what it would write.
 *
 * Free's port: Grid and Carousel share `applyCardDesign()`; Pro's overlay
 * design swap and its grid-style / 3D-layout swaps have no Free counterpart.
 *
 * @param {string} design Design to apply.
 * @param {Object} base   Attributes the design switches from.
 * @return {Object} Attributes the design picker would set.
 */
export function designSwaps(design, base) {
	let swaps = {};
	applyCardDesign(design, base, (next) => {
		swaps = next;
	});

	return swaps;
}

/**
 * Re-apply the model's row visibility choices on top of the design's rows.
 *
 * The server resolved the model's `elements` map against the block's rows
 * before any design swap; the rows whose `show` it flipped are the model's
 * decisions, and they must survive a design that also toggles rows.
 *
 * @param {Array} designRows Rows after the design swap.
 * @param {Array} baseRows   Rows before generation.
 * @param {Array} aiRows     Rows the server returned.
 * @return {Array} Merged rows.
 */
function mergeElementRows(designRows, baseRows, aiRows) {
	const before = Object.fromEntries((baseRows || []).map((row) => [row.value, !!row.show]));
	const decided = Object.fromEntries(
		(aiRows || [])
			.filter((row) => before[row.value] !== !!row.show)
			.map((row) => [row.value, !!row.show])
	);

	return designRows.map((row) =>
		row.value in decided ? { ...row, show: decided[row.value] } : row
	);
}

/**
 * Build the attribute update for a generated configuration.
 *
 * @param {Object}  options
 * @param {string}  options.blockName  Block being built or refined.
 * @param {Object}  options.attributes Merged attributes from the server.
 * @param {Array}   options.changed    Top-level keys the model set.
 * @param {?Object} options.current    The block's current attributes (refine), or null (fresh insert).
 * @return {Object} Attributes to write.
 */
export function buildAttributeUpdate({ blockName, attributes, changed = [], current = null }) {
	const base = current || registeredDefaults(blockName);
	const update = Object.fromEntries(
		changed
			.filter((key) => 'cardDesign' !== key && key in attributes)
			.map((key) => [key, attributes[key]])
	);

	// A block with no design shows the first-insert picker instead of the
	// members, so a new block always gets one even if the model skipped it.
	let design = changed.includes('cardDesign') ? attributes.cardDesign : '';
	if (!design && !base.cardDesign) {
		design = 'card-1';
	}

	if (!design || design === base.cardDesign) {
		return update;
	}

	const swaps = designSwaps(design, base);

	if (swaps.cardElements && update.cardElements) {
		update.cardElements = mergeElementRows(
			swaps.cardElements,
			base.cardElements,
			update.cardElements
		);
	}

	return { ...swaps, ...update };
}
