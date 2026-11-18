import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import modulesInfo from '../constants/modulesInfo';
import { toastErrorMsg, toastSuccessMsg } from '../utils/toast';

/**
 * The module switches shared by the Modules page and the setup wizard's Modules
 * step: the Free / Pro split of `modulesInfo`, the stored on/off state, and the
 * toggle that saves `settings.modules` (Pro's key and shape).
 *
 * @return {Object} { free, pro, modules, isSaving, onToggle, pluginUrl, upgradeUrl }
 */
const useModuleToggle = () => {
	const settings = useSelect((select) => select(STORE_NAME).getSettings(), []);
	const isSaving = useSelect((select) => select(STORE_NAME).isSaving(), []);
	const { pluginUrl, freeModules, upgradeUrl } = useSelect(
		(select) => select(STORE_NAME).getDashboardInfo(),
		[]
	);
	const { saveSettings } = useDispatch(STORE_NAME);

	const modules = settings?.modules || {};
	const freeKeys = freeModules || [];
	const free = modulesInfo.filter((module) => freeKeys.includes(module.key));
	const pro = modulesInfo.filter((module) => !freeKeys.includes(module.key));

	const onToggle = async (key) => {
		if (isSaving || !freeKeys.includes(key)) {
			return;
		}
		const next = { ...modules, [key]: !modules[key] };

		const saved = await saveSettings({ settings: { modules: next } }, { modules: next });

		if (!saved) {
			toastErrorMsg(__('The change could not be saved.', 'team-free'));
			return;
		}
		toastSuccessMsg(
			next[key]
				? __('Module enabled successfully.', 'team-free')
				: __('Module disabled successfully.', 'team-free')
		);
	};

	return { free, pro, modules, isSaving, onToggle, pluginUrl, upgradeUrl };
};

export default useModuleToggle;
