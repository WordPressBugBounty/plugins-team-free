/**
 * Whether a Pro block was just inserted, and how to take it back out without
 * leaving an undo step (port of wp-carousel-free's useInsertedTeaser.js).
 */

import { store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch, useRegistry, useSelect } from '@wordpress/data';

/**
 * @param {string} clientId Block client id.
 * @return {{justInserted: boolean, removeSilently: Function}} State and action.
 */
export default function useInsertedTeaser(clientId) {
	// True only for a block the inserter, slash inserter or a drag just added —
	// never one parsed from saved content.
	const justInserted = useSelect(
		(select) => Boolean(clientId && select(blockEditorStore).wasBlockJustInserted?.(clientId)),
		[clientId]
	);
	const registry = useRegistry();
	const { removeBlock, __unstableMarkNextChangeAsNotPersistent } = useDispatch(blockEditorStore);

	// Folded into the insert's undo step, so Undo does not bring back a block
	// the user never saw.
	const removeSilently = () => {
		// Checked before the not-persistent mark, or a skipped removal would drop
		// the user's next real change from undo.
		if (!registry.select(blockEditorStore).getBlock(clientId)) {
			return;
		}
		__unstableMarkNextChangeAsNotPersistent?.();
		removeBlock(clientId, false);
	};

	return { justInserted, removeSilently };
}
