import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import {
	CLEAR_CACHE_ROUTE,
	SETTINGS_ROUTE,
	SAVED_TEMPLATES_ROUTE,
	SAVED_TEMPLATES_BULK_ROUTE,
	SAVED_TEMPLATES_DUPLICATE_ROUTE,
} from './constants';

export const setApiData = (data) => ({ type: 'SET_API_DATA', data });
export const setLoading = (isLoading) => ({ type: 'SET_LOADING', isLoading });
export const setSaving = (isSaving) => ({ type: 'SET_SAVING', isSaving });
export const setError = (error) => ({ type: 'SET_ERROR', error });
export const setTemplates = (templates) => ({ type: 'SET_TEMPLATES', templates });
export const setTemplatesLoading = (isLoading) => ({ type: 'SET_TEMPLATES_LOADING', isLoading });

export const fetchApiData =
	() =>
	async ({ dispatch }) => {
		dispatch(setLoading(true));
		dispatch(setError(null));
		try {
			const data = await apiFetch({ path: SETTINGS_ROUTE });
			dispatch(setApiData(data));
		} catch (error) {
			dispatch(
				setError(error?.message || __('The dashboard could not be loaded.', 'team-free'))
			);
		}
		dispatch(setLoading(false));
	};

/**
 * Save part of the settings (`{ settings: { active_blocks, modules } }`). The change is
 * applied to the store first so the switch moves at once; the server's reply
 * (what was actually stored) then replaces it, and a failure restores the
 * previous data. Resolves to true when saved, false otherwise.
 *
 * @param {Object} payload    Request body.
 * @param {Object} optimistic `settings` to show while the request is in flight.
 */
export const saveSettings =
	(payload, optimistic) =>
	async ({ dispatch, select }) => {
		const previous = select.getApiData();
		if (optimistic) {
			dispatch(
				setApiData({ ...previous, settings: { ...previous.settings, ...optimistic } })
			);
		}
		dispatch(setSaving(true));
		try {
			const data = await apiFetch({ path: SETTINGS_ROUTE, method: 'POST', data: payload });
			dispatch(setApiData(data));
			dispatch(setSaving(false));
			return true;
		} catch (error) {
			dispatch(setApiData(previous));
			dispatch(setSaving(false));
			return false;
		}
	};

export const fetchSavedTemplates =
	(search = '', page = 1, perPage = 10) =>
	async ({ dispatch }) => {
		dispatch(setTemplatesLoading(true));
		try {
			const data = await apiFetch({
				path: addQueryArgs(SAVED_TEMPLATES_ROUTE, {
					search,
					page,
					per_page: perPage,
				}),
			});
			dispatch(setTemplates(data));
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Smart Team: failed to load saved templates', error);
		}
		dispatch(setTemplatesLoading(false));
	};

/**
 * Publish / draft / delete saved templates. Resolves to the REST result so the
 * caller can report what happened; throws on a failed request.
 *
 * @param {number[]} ids    Template post ids.
 * @param {string}   action `publish` | `draft` | `delete`.
 */
export const bulkSavedTemplates = (ids, action) => async () =>
	apiFetch({
		path: SAVED_TEMPLATES_BULK_ROUTE,
		method: 'POST',
		data: { ids, action },
	});

/**
 * Duplicate one saved template (or legacy generator) as a draft.
 *
 * @param {number} id Template post id.
 */
export const duplicateSavedTemplate = (id) => async () =>
	apiFetch({
		path: SAVED_TEMPLATES_DUPLICATE_ROUTE,
		method: 'POST',
		data: { id },
	});

/**
 * Persist one Settings-page group (`performance`, `advanced`, `customCode`, `singlePage`, `whiteLabel`, `accessibility` or `preloader`).
 * Rejects on a failed request so the panel can surface it — unlike
 * `saveSettings`, which swallows errors. The reply (what was actually stored)
 * replaces the store's data.
 *
 * @param {string} group  Payload key the REST route reads.
 * @param {Object} values The group's values.
 */
const saveGroup =
	(group, values) =>
	async ({ dispatch }) => {
		dispatch(setSaving(true));
		try {
			const data = await apiFetch({
				path: SETTINGS_ROUTE,
				method: 'POST',
				data: { [group]: values },
			});
			dispatch(setApiData(data));
		} finally {
			dispatch(setSaving(false));
		}
	};

export const savePerformance = (values) => saveGroup('performance', values);
export const saveAdvanced = (values) => saveGroup('advanced', values);
export const saveCustomCode = (values) => saveGroup('customCode', values);
export const saveSinglePage = (values) => saveGroup('singlePage', values);
export const saveWhiteLabel = (values) => saveGroup('whiteLabel', values);
export const savePreloader = (values) => saveGroup('preloader', values);
export const saveAccessibility = (values) => saveGroup('accessibility', values);
export const saveDiagnostics = (values) => saveGroup('diagnostics', values);

/**
 * Record the wizard's diagnostic-data decision. Sent for a "no" as well as a
 * "yes" — PHP needs to know the admin was asked, so the notice stops either way.
 *
 * @param {boolean} allowed The admin's choice.
 */
export const saveDiagnosticsConsent = (allowed) =>
	saveGroup('diagnostics', { allow_diagnostic_data: !!allowed });

/** Drop every `sptp_` transient (Performance → Flush Cache). */
export const clearCache = () => async () => apiFetch({ path: CLEAR_CACHE_ROUTE, method: 'POST' });

/**
 * Reload the payload with WordPress Connectors probed — the one outbound
 * check the dashboard bootstrap skips. Called by Settings → AI Configuration
 * on mount only. A failure keeps the unprobed data.
 */
export const fetchAISettings =
	() =>
	async ({ dispatch }) => {
		try {
			const data = await apiFetch({ path: addQueryArgs(SETTINGS_ROUTE, { ai_probe: 1 }) });
			dispatch(setApiData(data));
		} catch (error) {
			// Keep what the bootstrap loaded.
		}
	};

/**
 * Persist the AI Configuration tab. Resolves with the full response so the
 * panel can read `aiKeyResult` — a key the provider refused is not stored,
 * and that has to be reported rather than a plain "saved". Rejects on a
 * failed request.
 *
 * @param {Object} ai `{ provider, primary, api_key, remove_key, dismiss_connector_notice }`.
 * @return {Promise<Object>} REST response.
 */
export const saveAISettings =
	(ai) =>
	async ({ dispatch }) => {
		dispatch(setSaving(true));
		try {
			const data = await apiFetch({
				path: SETTINGS_ROUTE,
				method: 'POST',
				data: { ai },
			});
			dispatch(setApiData(data));
			return data;
		} finally {
			dispatch(setSaving(false));
		}
	};
