import { useSelect } from '@wordpress/data';
import { getBlockType } from '@wordpress/blocks';

// The selected block's registered default for an attribute (attributes.php), so a
// control's reset restores the real default rather than a guessed prop value.
const useRegisteredDefault = (attributesKey) =>
	useSelect(
		(select) => {
			const block = select('core/block-editor')?.getSelectedBlock?.();
			return block && attributesKey
				? getBlockType(block.name)?.attributes?.[attributesKey]?.default
				: undefined;
		},
		[attributesKey]
	);

export default useRegisteredDefault;
