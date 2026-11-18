import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ModuleCard from './ModuleCard';
import integrationsInfo from '../constants/integrationsInfo';
import { toastErrorMsg, toastSuccessMsg } from '../utils/toast';

/**
 * Settings → Integrations — the page-builder switches.
 *
 * Saved to `sptp_dashboard_options → integrations` (Pro's key and shape) and
 * read by `PageBuilders\Manager`, which only loads a builder's module while
 * its switch is on. Every integration defaults to on.
 */
const IntegrationsPanel = () => {
	const settings = useSelect((select) => select(STORE_NAME).getSettings(), []);
	const isSaving = useSelect((select) => select(STORE_NAME).isSaving(), []);
	const { pluginUrl } = useSelect((select) => select(STORE_NAME).getDashboardInfo(), []);
	const { saveSettings } = useDispatch(STORE_NAME);

	const integrations = settings?.integrations || {};
	const isActive = (key) => (undefined === integrations[key] ? true : !!integrations[key]);

	const onToggle = async (key) => {
		if (isSaving) {
			return;
		}
		const next = { ...integrations, [key]: !isActive(key) };

		const saved = await saveSettings(
			{ settings: { integrations: next } },
			{ integrations: next }
		);

		if (!saved) {
			toastErrorMsg(__('The change could not be saved.', 'team-free'));
			return;
		}
		toastSuccessMsg(
			next[key]
				? __('Integration enabled successfully.', 'team-free')
				: __('Integration disabled successfully.', 'team-free')
		);
	};

	return (
		<div className="sptp-integrations">
			<div className="sptp-page-section__head">
				<div>
					<h2 className="sptp-page-section__title">
						{__('Manage Integrations', 'team-free')}
					</h2>
					<p className="sptp-page-section__desc">
						{__(
							'Enable only the integrations you need to keep your site fast and optimized.',
							'team-free'
						)}
					</p>
				</div>
			</div>
			<div className="sptp-module-grid sptp-module-grid--two">
				{integrationsInfo.map((item) => (
					<ModuleCard
						key={item.key}
						module={item}
						active={isActive(item.key)}
						isSaving={isSaving}
						onToggle={onToggle}
						pluginUrl={pluginUrl}
					/>
				))}
			</div>
		</div>
	);
};

export default IntegrationsPanel;
