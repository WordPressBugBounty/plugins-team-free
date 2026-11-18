/**
 * Opener registry for the AI Team Builder modal. The editor-level host
 * registers the listener; blocks and the header button only call openAIBuilder().
 */

import { getInsertableLayoutBlocks, isAIBuilderEnabled } from './constants';

let listener = null;
// A request made before the editor-level host mounts (the dashboard deep link) waits here.
let pending = null;

export function setAIBuilderOpener(fn) {
	listener = fn;
	if (pending) {
		const request = pending;
		pending = null;
		listener(request);
	}
	return () => {
		listener = null;
	};
}

/**
 * @param {Object}  [options]
 * @param {?string} [options.clientId]   Block to target, or null for a fresh insert.
 * @param {string}  [options.blockName]  Block type to build or refine; defaults to the first enabled layout.
 * @param {boolean} [options.isRefining] True when the block is already configured —
 *                                       a refine never lets a Ready Pattern replace it.
 */
export function openAIBuilder({
	clientId = null,
	blockName = 'sptp/grid',
	isRefining = false,
} = {}) {
	// Callers gate their own buttons, but the module state decides, not the call site.
	if (!isAIBuilderEnabled()) {
		return;
	}
	const request = {
		clientId,
		blockName: blockName || getInsertableLayoutBlocks()[0] || 'sptp/grid',
		isRefining,
	};
	if (typeof listener !== 'function') {
		pending = request;
		return;
	}
	listener(request);
}
