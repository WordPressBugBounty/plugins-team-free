/**
 * Ready Patterns — the trust boundary for composite pattern payloads.
 *
 * A pattern payload is remote markup inserted straight into post content, so the
 * set of blocks it may contain is deny-by-default and lives in exactly one place.
 * Widening it is a deliberate edit to this file.
 */

import { getBlockType } from '@wordpress/blocks';

export const SPTP_BLOCK_PREFIX = 'sptp/';

/**
 * Core blocks a pattern may use as structure around its Smart Team blocks.
 *
 * `core/html`, `core/shortcode`, `core/freeform`, `core/missing` and embeds are
 * deliberately absent: they carry arbitrary markup or execute arbitrary code.
 */
export const PATTERN_WRAPPER_ALLOW_LIST = [
	'core/group',
	'core/columns',
	'core/column',
	'core/heading',
	'core/paragraph',
	'core/buttons',
	'core/button',
	'core/spacer',
	'core/separator',
	'core/image',
];

/** Structural ingest limits — generous for real patterns, cheap to check. */
export const MAX_PATTERN_BLOCKS = 30;
export const MAX_PATTERN_DEPTH = 4;
export const MAX_PATTERN_BYTES = 262144;

/** Rejection reasons returned by validatePatternTree(). */
export const REJECT_EMPTY = 'empty';
export const REJECT_DISALLOWED_BLOCK = 'disallowed-block';
export const REJECT_UNREGISTERED_BLOCK = 'unregistered-block';
export const REJECT_NO_SPTP_BLOCK = 'no-sptp-block';
export const REJECT_TOO_MANY_BLOCKS = 'too-many-blocks';
export const REJECT_TOO_DEEP = 'too-deep';
export const REJECT_TOO_LARGE = 'too-large';

/**
 * Whether a block name belongs to this plugin.
 *
 * @param {string} name Block name.
 * @return {boolean} True for a `sptp/*` name.
 */
export function isSptpBlockName(name) {
	return 'string' === typeof name && name.startsWith(SPTP_BLOCK_PREFIX);
}

/**
 * Whether serialized markup is over the ingest size limit.
 *
 * Checked before `parse()` so a nesting bomb never gets built into a tree.
 *
 * @param {string} markup Serialized block markup.
 * @return {boolean} True when the payload is too large.
 */
export function exceedsPatternSizeLimit(markup) {
	if ('string' !== typeof markup) {
		return false;
	}

	const bytes =
		'undefined' !== typeof TextEncoder
			? new TextEncoder().encode(markup).length
			: markup.length;

	return bytes > MAX_PATTERN_BYTES;
}

/**
 * Validate a parsed pattern tree against the allow-list and the ingest limits.
 *
 * @param {Array} blocks Top-level parsed blocks.
 * @return {{valid: boolean, reason?: string, blockName?: string}} Validation result.
 */
export function validatePatternTree(blocks) {
	if (!Array.isArray(blocks) || 0 === blocks.length) {
		return { valid: false, reason: REJECT_EMPTY };
	}

	let total = 0;
	let hasSptpBlock = false;
	let failure = null;

	const walk = (nodes, depth) => {
		if (failure) {
			return;
		}

		if (depth > MAX_PATTERN_DEPTH) {
			failure = { valid: false, reason: REJECT_TOO_DEEP };
			return;
		}

		nodes.forEach((node) => {
			if (failure) {
				return;
			}

			const name = node?.name;
			total += 1;

			if (total > MAX_PATTERN_BLOCKS) {
				failure = { valid: false, reason: REJECT_TOO_MANY_BLOCKS };
				return;
			}

			if ('string' !== typeof name || '' === name) {
				failure = {
					valid: false,
					reason: REJECT_DISALLOWED_BLOCK,
					blockName: String(name),
				};
				return;
			}

			if (isSptpBlockName(name)) {
				if (!getBlockType(name)) {
					failure = { valid: false, reason: REJECT_UNREGISTERED_BLOCK, blockName: name };
					return;
				}
				hasSptpBlock = true;
			} else if (!PATTERN_WRAPPER_ALLOW_LIST.includes(name)) {
				failure = { valid: false, reason: REJECT_DISALLOWED_BLOCK, blockName: name };
				return;
			}

			if (Array.isArray(node.innerBlocks) && node.innerBlocks.length > 0) {
				walk(node.innerBlocks, depth + 1);
			}
		});
	};

	walk(blocks, 1);

	if (failure) {
		return failure;
	}

	if (!hasSptpBlock) {
		return { valid: false, reason: REJECT_NO_SPTP_BLOCK };
	}

	return { valid: true };
}

/**
 * Collect every distinct block name in a parsed tree.
 *
 * @param {Array} blocks Parsed blocks.
 * @return {string[]} Distinct block names.
 */
export function collectBlockNames(blocks) {
	const names = new Set();

	const walk = (nodes) => {
		(nodes || []).forEach((node) => {
			if (node?.name) {
				names.add(node.name);
			}
			if (Array.isArray(node?.innerBlocks) && node.innerBlocks.length > 0) {
				walk(node.innerBlocks);
			}
		});
	};

	walk(blocks);

	return Array.from(names);
}
