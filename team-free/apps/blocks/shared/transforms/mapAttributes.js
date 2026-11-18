/**
 * Attribute mapping for layout-block transforms (Grid ↔ Carousel).
 *
 * Port of Pro's: only what the user actually changed travels — a value still
 * equal to the donor's stock look for its card design falls back to the
 * target's own default. The card design then goes through the same swap the
 * design picker runs (`buildAttributeUpdate`), with the user's values on top.
 */

import { getBlockType } from '@wordpress/blocks';
import {
	buildAttributeUpdate,
	designSwaps,
	registeredDefaults,
} from '../ai-builder/applyGenerated';

// Editor-only flags that must never ride into a real block.
const NEVER_COPIED = ['cardDesign', 'isPreview'];

function isEqual(a, b) {
	if (a === b) {
		return true;
	}
	if (!a || !b || 'object' !== typeof a || 'object' !== typeof b) {
		return false;
	}
	if (Array.isArray(a) !== Array.isArray(b)) {
		return false;
	}
	const keys = Object.keys(a);
	return (
		keys.length === Object.keys(b).length &&
		keys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && isEqual(a[key], b[key]))
	);
}

/**
 * The donor's untouched look: registered defaults plus its design's swaps.
 *
 * @param {string} blockName Donor block name.
 * @param {string} design    Donor card design.
 * @return {Object} Stock attribute values.
 */
function stockAttributes(blockName, design) {
	const defaults = registeredDefaults(blockName);
	return design ? { ...defaults, ...designSwaps(design, defaults) } : defaults;
}

/**
 * Translate a layout block's attributes into another layout block's.
 *
 * `uniqueId` rides along: the donor is replaced in the same operation, so the
 * id keeps one owner and the per-instance CSS scope survives.
 *
 * @param {Object} attributes      Donor attributes.
 * @param {string} sourceBlockName Donor block name.
 * @param {string} targetBlockName Target block name.
 * @return {Object} Attributes for `createBlock`.
 */
export default function mapAttributesToBlock(attributes, sourceBlockName, targetBlockName) {
	const registered = getBlockType(targetBlockName)?.attributes;
	if (!registered) {
		return { ...attributes };
	}

	const stock = stockAttributes(sourceBlockName, attributes.cardDesign);
	const custom = {};
	Object.keys(attributes).forEach((key) => {
		if (
			!(key in registered) ||
			NEVER_COPIED.includes(key) ||
			undefined === attributes[key] ||
			isEqual(attributes[key], stock[key])
		) {
			return;
		}
		custom[key] = attributes[key];
	});

	// No design yet = the first-insert picker, which the target keeps showing.
	if (!attributes.cardDesign) {
		return custom;
	}

	return buildAttributeUpdate({
		blockName: targetBlockName,
		attributes: { ...custom, cardDesign: attributes.cardDesign },
		changed: [...Object.keys(custom), 'cardDesign'],
	});
}
