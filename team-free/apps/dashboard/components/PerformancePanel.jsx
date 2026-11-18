import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { toast } from 'react-hot-toast';
import { STORE_NAME } from '../store';
import SettingsRow from './SettingsRow';
import SaveAndReset from './SaveAndReset';
import useSettingsDraft from '../hooks/useSettingsDraft';

/**
 * Settings → Performance.
 *
 * These values live in the classic `_sptp_settings` option, not in the
 * dashboard's own, so a toggle here reaches the frontend gates at once. The
 * classic Settings screen is gone, so this panel is their only editor. Load Modal by REST API and Cache Time are Pro-only (Free has no
 * modal and a fixed cache lifetime), so they are not listed.
 */

const OPTIONS = [
	{
		name: 'enqueue_google_font',
		label: __('Google Fonts', 'team-free'),
		help: __('Check this box to load Google Fonts on your site.', 'team-free'),
		type: 'checkbox',
	},
	{
		name: 'sptp_use_cache',
		label: __('Cache', 'team-free'),
		help: __(
			'To make Smart Team faster, keep enable cache. The cache is enabled by default.',
			'team-free'
		),
		type: 'checkbox',
	},
	{
		name: 'cache_remove',
		label: __('Clear Cached', 'team-free'),
		help: __(
			'Clear all cached data to refresh content and apply recent changes immediately.',
			'team-free'
		),
		type: 'button',
		buttonLabel: __('Flush Cache', 'team-free'),
	},
];

const PerformancePanel = () => {
	const { draft, isSaving, update, save, reset } = useSettingsDraft({
		selector: 'getPerformanceSettings',
		action: 'savePerformance',
		defaultsKey: 'performanceDefaults',
	});

	const { clearCache } = useDispatch(STORE_NAME);
	const [flushing, setFlushing] = useState(false);

	const onFlush = async () => {
		setFlushing(true);
		try {
			await clearCache();
			toast.success(__('Cache cleared successfully.', 'team-free'));
		} catch (error) {
			toast.error(__('Could not clear the cache.', 'team-free'));
		}
		setFlushing(false);
	};

	return (
		<div className="sptp-settings-panel">
			<div className="sptp-settings-panel__rows">
				{OPTIONS.map((option) => (
					<SettingsRow
						key={option.name}
						option={option}
						value={draft[option.name]}
						onChange={(value) => update(option.name, value)}
						onClick={onFlush}
						busy={flushing}
					/>
				))}
			</div>

			<SaveAndReset isSaving={isSaving} onSave={save} onReset={reset} />
		</div>
	);
};

export default PerformancePanel;
