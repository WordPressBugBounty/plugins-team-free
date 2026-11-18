/**
 * Smart Team — Divi 5 module.
 *
 * Divi hands React and every `divi.*` package in on the global scope, so this
 * bundle reads them off `window` rather than importing them (see the `externals`
 * in webpack.config.js). The edit renderer fetches the saved template's rendered
 * markup — CSS included — from `/sptp/divi5/v1/team-html`, because the template
 * is block content that only the server can render.
 */

import metadata from './module.json';
import { SettingsContent } from './settings-content';
import * as moduleTeamIcon from './icons/module-team';

// Access React from global scope (Divi provides this).
const React = window?.vendor?.React;
const { useEffect, useRef } = React || {};

const ModuleContainer = window?.divi?.module?.ModuleContainer;
const StyleContainer = window?.divi?.module?.StyleContainer;
const elementClassnames = window?.divi?.module?.elementClassnames;
const registerModule = window?.divi?.moduleLibrary?.registerModule;
const addAction = window?.vendor?.wp?.hooks?.addAction;
const addFilter = window?.vendor?.wp?.hooks?.addFilter;
const useFetch = window?.divi?.rest?.useFetch;

// Divi's builder window carries wp.i18n; fall back to the English string.
const __ = window?.vendor?.wp?.i18n?.__ || window?.wp?.i18n?.__ || ((text) => text);

const MODULE_CLASS = 'sptp_divi5_team';
const WRAPPER_CLASS = 'sptp-divi5-team-wrapper';

const noticeStyle = {
	padding: '20px',
	textAlign: 'center',
	color: '#999',
	borderRadius: '4px',
	border: '1px dotted #ddd',
};

const ModuleStyles = ({ elements, settings, mode, state, noStyleTag }) => (
	<StyleContainer mode={mode} state={state} noStyleTag={noStyleTag}>
		{elements.style({
			attrName: 'module',
			styleProps: {
				disabledOn: {
					disabledModuleVisibility: settings?.disabledModuleVisibility,
				},
			},
		})}
	</StyleContainer>
);

const ModuleScriptData = ({ elements }) => <>{elements.scriptData({ attrName: 'module' })}</>;

const moduleClassnames = ({ classnamesInstance, attrs }) => {
	classnamesInstance.add(elementClassnames({ attrs: attrs?.module?.decoration ?? {} }));
};

const EditRenderer = ({ attrs, id, name, elements }) => {
	const templateId = attrs?.templateId?.innerContent?.desktop?.value || '0';
	const { fetch, response, isLoading } = useFetch(null);

	const abortRef = useRef(null);
	const lastFetchedRef = useRef(null);

	useEffect(() => {
		if (!templateId || '0' === templateId) {
			return undefined;
		}

		// useFetch re-runs on every render; without this the same template would
		// be requested in a loop.
		if (lastFetchedRef.current === templateId) {
			return undefined;
		}
		lastFetchedRef.current = templateId;

		if (abortRef.current) {
			abortRef.current.abort();
		}
		abortRef.current = new AbortController();

		fetch({
			method: 'GET',
			restRoute: `/sptp/divi5/v1/team-html?template_id=${templateId}`,
		})
			.then(() => {
				// The markup lands via dangerouslySetInnerHTML, so carousels and
				// the ajax addons inside it still need hydrating.
				setTimeout(() => {
					if (typeof window.sptpTeamInit === 'function') {
						window.sptpTeamInit();
					}
				}, 0);
			})
			.catch((error) => {
				if ('AbortError' !== error.name) {
					// eslint-disable-next-line no-console
					console.error('Smart Team: failed to load template', error);
				}
			});

		return () => {
			if (abortRef.current) {
				abortRef.current.abort();
				abortRef.current = null;
			}
		};
		// `fetch` is a new identity every render — depending on it loops.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [templateId]);

	const renderBody = () => {
		if (!templateId || '0' === templateId) {
			return (
				<div style={noticeStyle}>
					<p style={{ fontSize: '14px', margin: 0 }}>
						{__('Please select a saved template', 'team-free')}
					</p>
				</div>
			);
		}

		if (isLoading || !response) {
			return (
				<div style={noticeStyle}>
					<p style={{ fontSize: '14px', margin: 0 }}>
						{__('Loading template…', 'team-free')}
					</p>
				</div>
			);
		}

		if (!response.success) {
			return (
				<div style={noticeStyle}>
					<p style={{ fontSize: '14px', margin: 0 }}>
						{response.message || __('Failed to load template', 'team-free')}
					</p>
				</div>
			);
		}

		return <div dangerouslySetInnerHTML={{ __html: response.html }} />;
	};

	return (
		<ModuleContainer
			attrs={attrs}
			elements={elements}
			id={id}
			moduleClassName={MODULE_CLASS}
			name={name}
			scriptDataComponent={ModuleScriptData}
			stylesComponent={ModuleStyles}
			classnamesFunction={moduleClassnames}
		>
			{elements.styleComponents({ attrName: 'module' })}
			<div
				className={`et_pb_module_inner ${WRAPPER_CLASS}`}
				data-builder-template-id={templateId}
			>
				{renderBody()}
			</div>
		</ModuleContainer>
	);
};

export const sptpDivi5Team = {
	metadata,
	renderers: {
		edit: EditRenderer,
	},
	settings: {
		content: SettingsContent,
	},
};

addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'sptp.divi5Team', () => {
	registerModule(sptpDivi5Team.metadata, sptpDivi5Team);
});

/**
 * Publish the addon icon under the name module.json's `moduleIcon` points at.
 *
 * Spreading the incoming map is required — returning a bare object wipes every
 * other module's icon out of the library.
 */
if (addFilter) {
	addFilter('divi.iconLibrary.icon.map', 'sptp.divi5Team', (icons) => ({
		...icons,
		[moduleTeamIcon.name]: moduleTeamIcon,
	}));
}
