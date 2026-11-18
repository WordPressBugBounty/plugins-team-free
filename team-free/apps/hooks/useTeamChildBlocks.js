/**
 * useTeamChildBlocks — wrap the grid in sptp/team-group + manage addon child
 * blocks from the grid's Display Settings toggles.
 *
 * Port of testimonial-pro's useRealChildBlocks: turning a toggle on wraps the
 * block in the (inserter-hidden) team-group container and inserts the addon
 * child block; turning every toggle off unwraps back to the bare block. While
 * wrapped, the children are kept in sync with the toggles. Addons render
 * before the grid (sptp/ajax-member-search, then sptp/live-frontend-filter
 * closest to the grid) or after it (sptp/ajax-pagination).
 *
 * @param {string} clientId   Current parent block client ID
 * @param {Object} attributes Current parent block attributes (addon toggles)
 */

import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';

const TEAM_GROUP_BLOCK = 'sptp/team-group';
const AJAX_PAGINATION_BLOCK = 'sptp/ajax-pagination';
const AJAX_SEARCH_BLOCK = 'sptp/ajax-member-search';
const LIVE_FILTER_BLOCK = 'sptp/live-frontend-filter';

const ADDON_BLOCKS = [AJAX_PAGINATION_BLOCK, AJAX_SEARCH_BLOCK, LIVE_FILTER_BLOCK];

const useTeamChildBlocks = (clientId, attributes) => {
	const { ajaxPagination, ajaxSearch, liveFrontendFilter } = attributes;

	const { replaceBlocks, selectBlock } = useDispatch('core/block-editor');
	const currentBlock = useSelect(
		(select) => select('core/block-editor').getBlock(clientId),
		[clientId]
	);

	const parentClientId = useSelect(
		(select) => {
			const { getBlock, getBlockParents } = select('core/block-editor');
			const parentIds = getBlockParents(clientId);

			if (!parentIds?.length) {
				return null;
			}

			return (
				parentIds.find((parentId) => getBlock(parentId)?.name === TEAM_GROUP_BLOCK) || null
			);
		},
		[clientId]
	);

	const parentBlock = useSelect(
		(select) => parentClientId && select('core/block-editor').getBlock(parentClientId),
		[parentClientId]
	);

	useEffect(() => {
		if (!currentBlock) {
			return;
		}

		const isParentBlockActive = parentBlock?.name === TEAM_GROUP_BLOCK;

		// Ajax Search and Live Frontend Filter are Pro (their toggles are locked
		// in Free). A Pro-saved `true` only counts while its child still exists —
		// Free never creates one, nor re-adds one the author deleted.
		const hasChild = (blockName) =>
			isParentBlockActive && parentBlock.innerBlocks.some((b) => b.name === blockName);
		const searchOn = !!ajaxSearch && hasChild(AJAX_SEARCH_BLOCK);
		const filterOn = !!liveFrontendFilter && hasChild(LIVE_FILTER_BLOCK);

		const anyEnabled = !!ajaxPagination || searchOn || filterOn;

		// Toggle → addon block, split by where the addon sits relative to the
		// grid (search then filter above it, pagination below it).
		const beforeToggles = [
			[searchOn, AJAX_SEARCH_BLOCK],
			[filterOn, LIVE_FILTER_BLOCK],
		];
		const afterToggles = [[ajaxPagination, AJAX_PAGINATION_BLOCK]];

		const buildAddons = (toggles, cloneFrom = null) =>
			toggles
				.filter(([enabled]) => !!enabled)
				.map(([, blockName]) => {
					// Keep a re-added child's previous settings when it still exists.
					const existing = cloneFrom?.find((b) => b.name === blockName);
					return existing
						? createBlock(blockName, existing.attributes, existing.innerBlocks)
						: createBlock(blockName);
				});

		// CASE 1: Wrap the block with team-group + addon children.
		if (!isParentBlockActive && anyEnabled) {
			const beforeAddons = buildAddons(beforeToggles);
			const afterAddons = buildAddons(afterToggles);
			const mainBlock = createBlock(
				currentBlock.name,
				currentBlock.attributes,
				currentBlock.innerBlocks
			);

			const newParentBlock = createBlock(
				TEAM_GROUP_BLOCK,
				{ align: currentBlock?.attributes?.align },
				[...beforeAddons, mainBlock, ...afterAddons]
			);

			replaceBlocks([clientId], newParentBlock);

			const lastAddon = [...beforeAddons, ...afterAddons].pop();
			if (lastAddon) {
				selectBlock(lastAddon.clientId);
			}
			return;
		}

		// CASE 2: Unwrap when all addon toggles are turned off.
		if (isParentBlockActive && !anyEnabled) {
			const mainBlock = parentBlock.innerBlocks.find(
				(block) => block.name === currentBlock.name
			);
			if (mainBlock) {
				const newBlock = createBlock(
					mainBlock.name,
					{
						...mainBlock.attributes,
						align: parentBlock?.attributes?.align,
					},
					mainBlock.innerBlocks
				);
				replaceBlocks([parentClientId], [newBlock]);
			}
			return;
		}

		// CASE 3: Already wrapped → sync addon children with the toggles.
		if (isParentBlockActive) {
			const existingBlocks = parentBlock.innerBlocks || [];
			const nonAddon = existingBlocks.filter((b) => !ADDON_BLOCKS.includes(b.name));

			const needsChange = [...beforeToggles, ...afterToggles].some(
				([enabled, blockName]) =>
					!!enabled !== existingBlocks.some((b) => b.name === blockName)
			);
			if (!needsChange) {
				return;
			}

			const newBeforeAddons = buildAddons(beforeToggles, existingBlocks);
			const newAfterAddons = buildAddons(afterToggles, existingBlocks);

			const updatedParentBlock = createBlock(TEAM_GROUP_BLOCK, parentBlock.attributes, [
				...newBeforeAddons,
				...nonAddon,
				...newAfterAddons,
			]);
			replaceBlocks([parentClientId], updatedParentBlock);

			// Select the just-added addon (a toggle that was off and is now on).
			const newlyAdded = [...newBeforeAddons, ...newAfterAddons].find(
				(b) => !existingBlocks.some((existing) => existing.name === b.name)
			);
			if (newlyAdded) {
				selectBlock(newlyAdded.clientId);
			}
		}
	}, [
		ajaxPagination,
		ajaxSearch,
		liveFrontendFilter,
		clientId,
		currentBlock,
		parentBlock,
		parentClientId,
		replaceBlocks,
		selectBlock,
	]);
};

export default useTeamChildBlocks;
