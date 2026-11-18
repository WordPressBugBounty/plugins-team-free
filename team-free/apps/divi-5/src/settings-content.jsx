/**
 * Settings panel for the Divi 5 module.
 *
 * module.json can only declare a static option list, so the saved templates are
 * fetched here and patched into the select's group configuration before Divi
 * renders it.
 */

const { useState, useEffect } = window?.vendor?.wp?.element;
const { set } = window?.lodash;
const loggedFetch = window?.divi?.rest?.loggedFetch;
const ModuleGroups = window?.divi?.module?.ModuleGroups;

// Divi's builder window carries wp.i18n; fall back to the English string.
const __ = window?.vendor?.wp?.i18n?.__ || window?.wp?.i18n?.__ || ((text) => text);

const PLACEHOLDER = { 0: { label: __('- Select Template -', 'team-free') } };

const SettingsContent = ({ groupConfiguration }) => {
	const [templates, setTemplates] = useState(PLACEHOLDER);

	useEffect(() => {
		let cancelled = false;

		loggedFetch({
			method: 'GET',
			restRoute: '/sptp/divi5/v1/saved-templates',
		})
			.then((result) => {
				// loggedFetch returns the payload directly or wrapped.
				const data = result?.data || result;

				if (cancelled || !data || typeof data !== 'object') {
					return;
				}

				const options = { ...PLACEHOLDER };
				Object.entries(data).forEach(([id, label]) => {
					options[id] = { label };
				});

				setTemplates(options);
			})
			.catch((error) => {
				// eslint-disable-next-line no-console
				console.error('Smart Team: failed to load saved templates', error);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	if (groupConfiguration?.mainContent?.component) {
		set(
			groupConfiguration,
			[
				'mainContent',
				'component',
				'props',
				'fields',
				'templateIdInnerContent',
				'component',
				'props',
				'options',
			],
			templates
		);
	}

	return <ModuleGroups groups={groupConfiguration} />;
};

export { SettingsContent };
