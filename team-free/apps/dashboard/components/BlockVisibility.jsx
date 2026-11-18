import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { STORE_NAME } from '../store';
import BlockCard from './BlockCard';
import { toastErrorMsg, toastSuccessMsg } from '../utils/toast';

const GROUPS = [
	{
		key: 'parent',
		label: __('Control Blocks', 'team-free'),
		desc: __('Turn blocks on or off as needed to improve performance.', 'team-free'),
	},
	{
		key: 'child',
		label: __('Child Blocks', 'team-free'),
		desc: __(
			'Add-ons that work inside a control block. They turn off with their control blocks.',
			'team-free'
		),
	},
];

/**
 * Parent / Child block switches; the classic shortcode block is listed with
 * the parents (it is top-level too) though the server toggles it independently. Free blocks save to `settings.active_blocks`;
 * Pro-only blocks are listed with a crown badge and a locked switch.
 */
const BlockVisibility = () => {
	const settings = useSelect((select) => select(STORE_NAME).getSettings(), []);
	const { allBlockList, freeBlocks } = useSelect(
		(select) => select(STORE_NAME).getDashboardInfo(),
		[]
	);
	const isSaving = useSelect((select) => select(STORE_NAME).isSaving(), []);
	const { saveSettings } = useDispatch(STORE_NAME);

	const activeBlocks = useMemo(() => settings?.active_blocks || [], [settings]);

	const grouped = useMemo(() => {
		const result = { parent: [], child: [] };
		activeBlocks.forEach((block) => {
			if (
				(allBlockList?.parent || []).includes(block.name) ||
				(allBlockList?.classic || []).includes(block.name)
			) {
				result.parent.push(block);
			} else if ((allBlockList?.child || []).includes(block.name)) {
				result.child.push(block);
			}
		});
		// Free blocks first (classic shortcode included), Pro-only blocks after;
		// the stored order is kept within each tier.
		const isFree = (b) => (freeBlocks || []).includes(b.name);
		Object.keys(result).forEach((key) => {
			result[key] = [...result[key].filter(isFree), ...result[key].filter((b) => !isFree(b))];
		});
		return result;
	}, [activeBlocks, allBlockList, freeBlocks]);

	const onToggle = async (name) => {
		const target = activeBlocks.find((item) => item.name === name);
		if (!target || isSaving) {
			return;
		}
		const show = !target.show;
		const updated = activeBlocks.map((item) => (item.name === name ? { ...item, show } : item));

		const saved = await saveSettings(
			{ settings: { active_blocks: updated } },
			{ active_blocks: updated }
		);

		if (!saved) {
			toastErrorMsg(__('The change could not be saved.', 'team-free'));
			return;
		}
		toastSuccessMsg(
			show
				? __('Block enabled successfully.', 'team-free')
				: __('Block disabled successfully.', 'team-free')
		);
	};

	return (
		<div className="sptp-blocks-page">
			{GROUPS.map(({ key, label, desc }) => {
				const items = grouped[key];
				if (!items || items.length === 0) {
					return null;
				}
				return (
					<section key={key} className="sptp-block-section">
						<div className="sptp-block-section__head">
							<h2 className="sptp-block-section__title">{label}</h2>
							<p className="sptp-block-section__desc">{desc}</p>
						</div>
						<div className="sptp-block-grid">
							{items.map((block) => (
								<BlockCard
									key={block.name}
									block={block}
									isPro={!(freeBlocks || []).includes(block.name)}
									isSaving={isSaving}
									onToggle={onToggle}
								/>
							))}
						</div>
					</section>
				);
			})}
		</div>
	);
};

export default BlockVisibility;
