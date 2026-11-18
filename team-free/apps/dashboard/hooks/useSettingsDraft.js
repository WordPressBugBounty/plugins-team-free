import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { toast } from 'react-hot-toast';
import { STORE_NAME } from '../store';

/**
 * Draft state for one Settings panel — the edit-locally / save-explicitly cycle
 * the Performance, Advanced Controls and (next) CSS & JS tabs all share.
 *
 * Defaults come from the REST bootstrap (`settingsMeta`) rather than a copy in
 * JS, so Reset always writes what the backend considers default.
 *
 * @param {Object}   options
 * @param {string}   options.selector      Store selector returning the saved values.
 * @param {string}   options.action        Store action that persists them.
 * @param {string}   options.defaultsKey   `settingsMeta` key holding this group's defaults.
 * @param {boolean}  [options.silentReset] Skip Reset's toast — Save still reports.
 * @param {string[]} [options.changeOnly]  Keys sent only when changed and left
 *                                         untouched by Reset (consent choices:
 *                                         saving or resetting other rows must
 *                                         never record one).
 * @return {Object} `{ draft, defaults, update, save, reset, isSaving }`.
 */
const useSettingsDraft = ({
	selector,
	action,
	defaultsKey,
	silentReset = false,
	changeOnly = [],
}) => {
	const { saved, defaults, isSaving } = useSelect(
		(select) => {
			const store = select(STORE_NAME);
			return {
				saved: store[selector](),
				defaults: store.getSettingsMeta()[defaultsKey] || {},
				isSaving: store.isSaving(),
			};
		},
		[selector, defaultsKey]
	);
	const persistAction = useDispatch(STORE_NAME)[action];

	const [draft, setDraft] = useState(saved);

	// The bootstrap request resolves after the first render, and a save returns
	// the stored values — adopt both as the new baseline.
	useEffect(() => {
		setDraft(saved);
	}, [saved]);

	// Drop each `changeOnly` key whose value matches what is stored.
	const withoutUnchanged = (values) => {
		const payload = { ...values };
		changeOnly.forEach((key) => {
			if (payload[key] === saved[key]) {
				delete payload[key];
			}
		});
		return payload;
	};

	// `successText: false` persists without reporting; a failure still speaks up.
	const persist = async (values, successText) => {
		try {
			await persistAction(values);
			if (false !== successText) {
				toast.success(successText || __('Settings saved successfully.', 'team-free'));
			}
		} catch (error) {
			toast.error(__('Could not save the settings.', 'team-free'));
		}
	};

	return {
		draft,
		defaults,
		isSaving,
		update: (name, value) => setDraft((prev) => ({ ...prev, [name]: value })),
		save: () => persist(withoutUnchanged(draft)),
		reset: () => {
			const values = { ...defaults };
			changeOnly.forEach((key) => {
				if (key in saved) {
					values[key] = saved[key];
				}
			});
			setDraft(values);
			persist(
				withoutUnchanged(values),
				silentReset ? false : __('Settings reset successfully.', 'team-free')
			);
		},
	};
};

export default useSettingsDraft;
