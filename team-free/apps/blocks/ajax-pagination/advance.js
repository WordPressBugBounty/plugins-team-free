/**
 * Ajax Pagination — Advanced Settings panel.
 *
 * Exports AdvancedSettings: the body of the "Advanced Settings" PanelBody in
 * inspect.js — a <TabControls /> with Visibility (responsive hide) and
 * Advanced (custom class / custom CSS) tabs only (no General
 * wrapper-box tab for this child block).
 */

import { __ } from '@wordpress/i18n';
import TabControls from '../../components/tabControls/tabControls';
import { Toggle, AdvancedTabFields } from '../../components';

function VisibilityTab({ attributes, setAttributes }) {
	const { hideOnDesktop, hideOnTablet, hideOnMobile } = attributes;
	return (
		<>
			<Toggle
				label={__('Hide on Desktop', 'team-free')}
				attributes={!!hideOnDesktop}
				onChange={(current) => setAttributes({ hideOnDesktop: !current })}
			/>
			<Toggle
				label={__('Hide on Tablet', 'team-free')}
				attributes={!!hideOnTablet}
				onChange={(current) => setAttributes({ hideOnTablet: !current })}
			/>
			<Toggle
				label={__('Hide on Mobile', 'team-free')}
				attributes={!!hideOnMobile}
				onChange={(current) => setAttributes({ hideOnMobile: !current })}
			/>
		</>
	);
}

function AdvancedTab({ attributes, setAttributes }) {
	return <AdvancedTabFields attributes={attributes} setAttributes={setAttributes} />;
}

/* Advanced Settings panel body: Visibility / Advanced sub-tabs. */
export function AdvancedSettings({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			VisibilityTab={VisibilityTab}
			AdvancedTab={AdvancedTab}
			displayIcon={false}
			initialTab="visibility"
		/>
	);
}
