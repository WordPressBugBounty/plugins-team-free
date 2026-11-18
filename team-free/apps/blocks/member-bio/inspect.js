/**
 * Member Bio — General inspector (orchestrator).
 *
 * Same control set as the Member Designation / Member Description blocks: two
 * PanelBody sections — the block's own Display Settings (Settings/Style tabs)
 * and the shared Advanced Settings. Open/close is accordion-style via the
 * panel-body context.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { usePanelBodyContext } from '../../hooks/togglePanelBodyContext';
import { SPToggleGroupControl, SpColorPicker, TabControls, Typography } from '../../components';
// Text-align icons (not the Justify* flex set) — this control emits `text-align`.
import { LeftIcon, CenterIcon, RightIcon } from '../../components/icons';
// Shared Advanced Settings — General (wrapper bg/spacing) / Visibility / Advanced.
import { AdvancedSettings } from '../shared/advance';

/* Settings tab — alignment only (Figma: Member Bio / General). */
function MemberBioSettings({ attributes, setAttributes }) {
	const { bioAlignment } = attributes;

	return (
		<SPToggleGroupControl
			label={__('Alignment', 'team-free')}
			attributes={bioAlignment}
			attributesKey="bioAlignment"
			setAttributes={setAttributes}
			items={[
				{ label: <LeftIcon />, value: 'left', tooltip: __('Left', 'team-free') },
				{ label: <CenterIcon />, value: 'center', tooltip: __('Center', 'team-free') },
				{ label: <RightIcon />, value: 'right', tooltip: __('Right', 'team-free') },
			]}
		/>
	);
}

/* Style tab — typography + color. (No Margin control: the block's spacing is
   Advanced Settings → General.) */
function MemberBioStyle({ attributes, setAttributes }) {
	const { bioColor } = attributes;

	const typoProps = {
		family: attributes.bioTypography,
		familyKey: 'bioTypography',
		fontSize: attributes.bioFontSize,
		fontSizeKey: 'bioFontSize',
		lineHeight: attributes.bioLineHeight,
		lineHeightKey: 'bioLineHeight',
		fontSpacing: attributes.bioLetterSpacing,
		fontSpacingKey: 'bioLetterSpacing',
		wordSpacing: attributes.bioWordSpacing,
		wordSpacingKey: 'bioWordSpacing',
		globalTypo: attributes.bioGlobalTypo,
		globalTypoKey: 'bioGlobalTypo',
	};

	return (
		<>
			<Typography
				attributes={typoProps}
				setAttributes={setAttributes}
				fontSizeDefault={{ unit: 'px', value: 16 }}
			/>

			<SpColorPicker
				label={__('Color', 'team-free')}
				value={bioColor || ''}
				attributesKey="bioColor"
				setAttributes={setAttributes}
			/>
		</>
	);
}

/* Panel body — the block's Settings/Style tabs. */
function MemberBioPanel({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={MemberBioSettings}
			StyleTab={MemberBioStyle}
		/>
	);
}

const PANELS = [
	// key 'general' = the panel-context default, so this opens on load.
	{ key: 'general', title: __('Display Settings', 'team-free'), Body: MemberBioPanel },
	{ key: 'advanced', title: __('Advanced Settings', 'team-free'), Body: AdvancedSettings },
];

const Inspector = ({ attributes, setAttributes }) => {
	const { openPanel, togglePanelBody } = usePanelBodyContext();

	return (
		<>
			{PANELS.map(({ key, title, Body }, index) => (
				<PanelBody
					key={key}
					title={title}
					initialOpen={index === 0}
					className="sp-smart-team-grid-panel-body"
					opened={openPanel === key}
					onToggle={() => togglePanelBody(key)}
				>
					{openPanel === key && (
						<Body attributes={attributes} setAttributes={setAttributes} />
					)}
				</PanelBody>
			))}
		</>
	);
};

export default Inspector;
