import { parse, getBlockType, createBlock } from '@wordpress/blocks';
import { dispatch, select } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { speak } from '@wordpress/a11y';
import { getReadyPatternsRestBase } from './constants';
import { isFreeBlock } from '../proGate';
import { sanitizePatternTree } from './sanitizePatternAttributes';
import { resolveTargetClientId } from './resolveTargetClientId';
import {
	collectBlockNames,
	exceedsPatternSizeLimit,
	isSptpBlockName,
	REJECT_DISALLOWED_BLOCK,
	REJECT_NO_SPTP_BLOCK,
	REJECT_TOO_DEEP,
	REJECT_TOO_MANY_BLOCKS,
	REJECT_UNREGISTERED_BLOCK,
	validatePatternTree,
} from './patternBlockAllowList';

/**
 * Announce through WordPress's global live region (survives modal unmount).
 *
 * @param {string} message Message to speak.
 */
function announce(message) {
	try {
		speak(message);
	} catch (error) {
		window.wp?.a11y?.speak?.(message);
	}
}

/**
 * Re-create every `sptp/*` block from its attributes.
 *
 * The pattern server strips `uniqueId` from the comment delimiter but not from a
 * static block's saved HTML (`sptp/team-group` prints it as `id`), so the parsed
 * block fails validation. Regenerating it from attributes drops the donor markup.
 *
 * @param {Array} blocks Parsed (sanitized) blocks.
 * @return {Array} Blocks with Smart Team blocks rebuilt.
 */
export function rebuildSptpBlocks(blocks) {
	if (!Array.isArray(blocks)) {
		return blocks;
	}

	return blocks.map((block) => {
		const innerBlocks = rebuildSptpBlocks(block?.innerBlocks || []);

		if (isSptpBlockName(block?.name)) {
			return createBlock(block.name, block.attributes, innerBlocks);
		}

		return { ...block, innerBlocks };
	});
}

/**
 * Whether the parsed root block is a registered Smart Team block.
 *
 * @param {Object|null} block Parsed block.
 * @return {boolean} True when the parsed block is a registered Smart Team type.
 */
export function isValidSptpRootBlock(block) {
	return Boolean(block?.name && isSptpBlockName(block.name) && getBlockType(block.name));
}

/**
 * Build the user-facing message for a validation failure.
 *
 * @param {string} patternName Pattern display name.
 * @param {Object} result      Validation result from validatePatternTree().
 * @return {string} Translated notice text.
 */
function rejectionMessage(patternName, result) {
	const blockName = result?.blockName || '';

	if (REJECT_DISALLOWED_BLOCK === result?.reason) {
		return sprintf(
			/* translators: 1: pattern name, 2: block name */
			__(
				'Could not insert "%1$s" — the block "%2$s" is not allowed in patterns.',
				'team-free'
			),
			patternName,
			blockName
		);
	}

	if (REJECT_UNREGISTERED_BLOCK === result?.reason) {
		return sprintf(
			/* translators: 1: pattern name, 2: block name */
			__(
				'Could not insert "%1$s" — the block "%2$s" is not available on this site.',
				'team-free'
			),
			patternName,
			blockName
		);
	}

	if (REJECT_NO_SPTP_BLOCK === result?.reason) {
		return sprintf(
			/* translators: %s: pattern name */
			__('Could not insert "%s" — the pattern contains no Smart Team block.', 'team-free'),
			patternName
		);
	}

	if (REJECT_TOO_MANY_BLOCKS === result?.reason) {
		return sprintf(
			/* translators: %s: pattern name */
			__('Could not insert "%s" — the pattern contains too many blocks.', 'team-free'),
			patternName
		);
	}

	if (REJECT_TOO_DEEP === result?.reason) {
		return sprintf(
			/* translators: %s: pattern name */
			__('Could not insert "%s" — the pattern is nested too deeply.', 'team-free'),
			patternName
		);
	}

	return sprintf(
		/* translators: %s: pattern name */
		__('Could not insert "%s" — invalid block pattern.', 'team-free'),
		patternName
	);
}

/**
 * Report a rejection: notice, announcement, and a failed result.
 *
 * @param {string} message Notice text.
 * @return {{success: boolean}} Failed insertion result.
 */
function reject(message) {
	dispatch('core/notices').createErrorNotice(message);
	announce(message);

	return { success: false };
}

/**
 * Whether a block type may be inserted at the intended root on this site.
 *
 * Blocks that declare a `parent`/`ancestor` (core/column, core/button) can only
 * ever be inserted inside their own wrapper, so asking about the document root
 * would reject every valid composite. For those the site-level allow-list is
 * consulted directly instead.
 *
 * @param {string}      name         Block name.
 * @param {string|null} rootClientId Intended insertion root ('' for document root).
 * @param {Object}      editorSelect Block editor selectors.
 * @return {boolean} True when the block is insertable.
 */
function isBlockInsertable(name, rootClientId, editorSelect) {
	const blockType = getBlockType(name);
	if (!blockType) {
		return false;
	}

	if (blockType.parent || blockType.ancestor) {
		const allowed = editorSelect.getSettings?.()?.allowedBlockTypes;
		return !Array.isArray(allowed) || allowed.includes(name);
	}

	return editorSelect.canInsertBlockType(name, rootClientId || '');
}

/**
 * Fetch, validate, and apply a Ready Pattern to the editor.
 *
 * @param {Object}      options                     Insertion options.
 * @param {string}      options.patternId           Pattern ID.
 * @param {string}      options.patternName         Display name for notices.
 * @param {string|null} [options.requestedClientId] Client id from the open request.
 * @return {Promise<{ success: boolean, focusClientId?: string|null }>} Result.
 */
export async function insertPattern({ patternId, patternName, requestedClientId = null }) {
	const restBase = getReadyPatternsRestBase().replace(/\/$/, '');
	const data = await apiFetch({
		path: `${restBase}/${patternId}`,
	});

	const raw = data?.content;
	if ('string' !== typeof raw || '' === raw) {
		const message = __('Pattern payload is empty.', 'team-free');
		announce(message);
		throw new Error(message);
	}

	// Size is checked before parse() so an oversized payload never becomes a tree.
	if (exceedsPatternSizeLimit(raw)) {
		return reject(
			sprintf(
				/* translators: %s: pattern name */
				__('Could not insert "%s" — the pattern payload is too large.', 'team-free'),
				patternName
			)
		);
	}

	const parsedBlocks = parse(raw);
	const validation = validatePatternTree(parsedBlocks);
	if (!validation.valid) {
		return reject(rejectionMessage(patternName, validation));
	}

	const editorSelect = select(blockEditorStore);
	const targetClientId = resolveTargetClientId(requestedClientId, {
		getBlock: editorSelect.getBlock,
		getSelectedBlockClientId: editorSelect.getSelectedBlockClientId,
	});

	const insertionPoint = editorSelect.getBlockInsertionPoint();
	const insertionRootClientId = targetClientId
		? (editorSelect.getBlockRootClientId(targetClientId) ?? '')
		: (insertionPoint?.rootClientId ?? '');

	// Never insert part of a section: one blocked block refuses the whole payload.
	const blockedName = collectBlockNames(parsedBlocks).find(
		(name) => !isBlockInsertable(name, insertionRootClientId, editorSelect)
	);
	if (blockedName) {
		return reject(
			sprintf(
				/* translators: 1: pattern name, 2: block name */
				__(
					'Could not insert "%1$s" — the block "%2$s" cannot be inserted here on this site.',
					'team-free'
				),
				patternName,
				blockedName
			)
		);
	}

	// Free only: a pattern nesting a Pro-only block (a filter or search addon)
	// would insert as locked notices. The REST route refuses these too.
	const proBlockName = collectBlockNames(parsedBlocks).find(
		(name) => isSptpBlockName(name) && !isFreeBlock(name)
	);
	if (proBlockName) {
		return reject(
			sprintf(
				/* translators: 1: pattern name, 2: block name */
				__('Could not insert "%1$s" — the block "%2$s" needs Smart Team Pro.', 'team-free'),
				patternName,
				proBlockName
			)
		);
	}

	const roots = rebuildSptpBlocks(sanitizePatternTree(parsedBlocks));
	const isSingleSptpRoot = 1 === roots.length && isSptpBlockName(roots[0]?.name);
	const currentBlockName = targetClientId ? editorSelect.getBlockName(targetClientId) : null;

	let focusClientId = null;

	if (targetClientId && isSingleSptpRoot && roots[0].name === currentBlockName) {
		// Same block: apply in place so the target keeps its clientId (and its
		// per-instance CSS), in one undo step.
		dispatch(blockEditorStore).updateBlockAttributes(targetClientId, roots[0].attributes);
		dispatch(blockEditorStore).selectBlock(targetClientId);
		focusClientId = targetClientId;
	} else if (targetClientId) {
		const newClientIds = dispatch(blockEditorStore).replaceBlocks(targetClientId, roots);
		if (Array.isArray(newClientIds) && newClientIds.length > 0) {
			dispatch(blockEditorStore).selectBlock(newClientIds[0]);
			focusClientId = newClientIds[0];
		} else {
			focusClientId = roots[0]?.clientId ?? null;
			if (focusClientId) {
				dispatch(blockEditorStore).selectBlock(focusClientId);
			}
		}
	} else {
		dispatch(blockEditorStore).insertBlocks(
			roots,
			insertionPoint?.index,
			insertionPoint?.rootClientId
		);
		focusClientId = roots[0]?.clientId ?? null;
		if (focusClientId) {
			dispatch(blockEditorStore).selectBlock(focusClientId);
		}
	}

	announce(
		sprintf(
			/* translators: %s: pattern name */
			__('Inserted pattern "%s".', 'team-free'),
			patternName
		)
	);

	return { success: true, focusClientId };
}
