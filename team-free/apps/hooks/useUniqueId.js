import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

const collectUniqueIds = (blocks, prefix) => {
	return blocks.reduce(
		(acc, block) => {
			if (block?.attributes?.uniqueId && block.name?.startsWith(prefix)) {
				acc.blockIds.push(block.attributes.uniqueId);
				acc.clientIds.push(block.clientId);
			}
			if (block.innerBlocks) {
				const nested = collectUniqueIds(block.innerBlocks, prefix);
				acc.blockIds.push(...nested.blockIds);
				acc.clientIds.push(...nested.clientIds);
			}
			return acc;
		},
		{ blockIds: [], clientIds: [] }
	);
};

const isDuplicate = (blockIds, blockId, currentIndex) => {
	const matches = blockIds.filter((id) => id === blockId);
	return matches.length > 1 && currentIndex === blockIds.lastIndexOf(blockId);
};

const useUniqueId = (
	clientId,
	uniqueId,
	setAttributes,
	idPrefix = 'sptp-',
	blockNamespace = 'sptp/'
) => {
	// Return a boolean, not the id lists: useSelect re-renders when its result
	// changes by reference, and fresh arrays on every store update re-rendered
	// every Smart Team block on every keystroke anywhere in the editor.
	const needsNewId = useSelect(
		(select) => {
			if (!clientId) {
				return false;
			}
			if (!uniqueId) {
				return true;
			}
			const blockEditor = select('core/block-editor');
			const allBlocks = blockEditor?.getBlocks ? blockEditor.getBlocks() : [];
			const { blockIds, clientIds } = collectUniqueIds(allBlocks, blockNamespace);
			return isDuplicate(blockIds, uniqueId, clientIds.indexOf(clientId));
		},
		[clientId, uniqueId, blockNamespace]
	);

	useEffect(() => {
		if (!clientId || !needsNewId) {
			return;
		}

		const shortClientId = clientId.split('-').pop();
		setAttributes({ uniqueId: `${idPrefix}${shortClientId}` });
	}, [clientId, needsNewId, idPrefix, setAttributes]);
};

export default useUniqueId;
