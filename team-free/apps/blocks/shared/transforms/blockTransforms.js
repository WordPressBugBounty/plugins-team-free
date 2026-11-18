/**
 * Block transforms — the "Transform to" menu on the Free layout blocks.
 *
 * Grid ↔ Carousel only: the 3D Carousel is a Pro-only stub in Free (it shows
 * the Pro notice), so it is never offered as a target.
 */

import { createBlock, getBlockType } from '@wordpress/blocks';
import mapAttributesToBlock from './mapAttributes';
import { isToggleEnabled } from '../blockToggle';

export const LAYOUT_BLOCKS = ['sptp/carousel', 'sptp/grid'];

/**
 * A Grid with an ajax addon on sits inside a `sptp/team-group` beside its
 * pagination / search / filter blocks, which only the Grid can drive — a
 * swapped-in carousel would leave them orphaned, so the switch is not offered.
 *
 * @param {Object} attributes Donor attributes.
 * @return {boolean} Whether any team-group addon is on.
 */
const hasAjaxAddons = (attributes) =>
	!!(attributes?.ajaxPagination || attributes?.ajaxSearch || attributes?.liveFrontendFilter);

/**
 * `registerBlockType` transforms for one layout block.
 *
 * @param {string} blockName Full block name, e.g. `sptp/grid`.
 * @return {{to: Array}} Transforms.
 */
export default function buildBlockTransforms(blockName) {
	return {
		to: LAYOUT_BLOCKS.filter((target) => target !== blockName).map((target) => ({
			type: 'block',
			blocks: [target],
			// A block switched off on Dashboard → Blocks stays registered (saved
			// content keeps editing) but must not be a new target.
			isMatch: (attributes) =>
				!!getBlockType(target) && isToggleEnabled(target) && !hasAjaxAddons(attributes),
			transform: (attributes) =>
				createBlock(target, mapAttributesToBlock(attributes, blockName, target)),
		})),
	};
}
