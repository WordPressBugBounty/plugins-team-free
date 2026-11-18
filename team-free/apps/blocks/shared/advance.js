/**
 * Shared — Advanced Settings panel for every member layout block.
 *
 * Exports AdvancedSettings: the body of the "Advanced Settings" PanelBody in
 * inspect.js — a <TabControls /> with General (background/spacing), Visibility
 * (responsive hide), and Advanced (custom class / custom CSS) tabs.
 */

import { __ } from '@wordpress/i18n';
import TabControls from '../../components/tabControls/tabControls';
import { Toggle, Background, Spacing, AdvancedTabFields } from '../../components';
import { BgIcon, GradientIcon } from '../../components/background/svgIcon';

/* General tab — block wrapper background + spacing. */
function GeneralTab({ attributes, setAttributes }) {
	const { sectionBg, sectionPadding, sectionMargin } = attributes;
	return (
		<>
			<Background
				label={__('Background Type', 'team-free')}
				attributes={sectionBg || {}}
				attributesKey="sectionBg"
				setAttributes={setAttributes}
				colorType="color"
				colorLabel={__('Background Color', 'team-free')}
				items={[
					{ label: <BgIcon />, value: 'bgColor', tooltip: __('Color', 'team-free') },
					{
						label: <GradientIcon />,
						value: 'gradient',
						tooltip: __('Gradient', 'team-free'),
					},
				]}
			/>
			<Spacing
				label={__('Padding', 'team-free')}
				attributes={sectionPadding || {}}
				attributesKey="sectionPadding"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
			{/* Starts at 0 — the slider used to open at -300px, so its handle sat
			    near the left edge showing a negative margin before any edit. */}
			<Spacing
				label={__('Margin', 'team-free')}
				attributes={sectionMargin || {}}
				attributesKey="sectionMargin"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
		</>
	);
}

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

/* Advanced Settings panel body (inside the General inspector): General /
 * Visibility / Advanced sub-tabs. Rendered by inspect.js inside its own
 * PanelBody, so this returns just the TabControls. */
export function AdvancedSettings({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={GeneralTab}
			VisibilityTab={VisibilityTab}
			AdvancedTab={AdvancedTab}
			settingsTabTitle={__('General', 'team-free')}
			displayIcon={false}
			initialTab="settings"
		/>
	);
}
