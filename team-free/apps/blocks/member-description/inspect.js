/**
 * Member Description — General inspector (orchestrator).
 *
 * Same control set as the Member Designation block: two PanelBody sections —
 * the block's own Display Settings (Settings/Style tabs) and the shared
 * Advanced Settings. Open/close is accordion-style via the panel-body context.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { usePanelBodyContext } from '../../hooks/togglePanelBodyContext';
import { SPToggleGroupControl, SpColorPicker, TabControls, Typography } from '../../components';
// Text-align icons (not the Justify* flex set) — this control emits `text-align`.
import { LeftIcon, CenterIcon, RightIcon } from '../../components/icons';
// Shared Advanced Settings — General (wrapper bg/spacing) / Visibility / Advanced.
import { AdvancedSettings } from '../shared/advance';

/* Settings tab — alignment only (Figma: Member Description / General). */
function MemberDescriptionSettings({ attributes, setAttributes }) {
	const { descriptionAlignment } = attributes;

	return (
		<SPToggleGroupControl
			label={__('Alignment', 'team-free')}
			attributes={descriptionAlignment}
			attributesKey="descriptionAlignment"
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
function MemberDescriptionStyle({ attributes, setAttributes }) {
	const { descriptionColor } = attributes;

	const typoProps = {
		family: attributes.descriptionTypography,
		familyKey: 'descriptionTypography',
		fontSize: attributes.descriptionFontSize,
		fontSizeKey: 'descriptionFontSize',
		lineHeight: attributes.descriptionLineHeight,
		lineHeightKey: 'descriptionLineHeight',
		fontSpacing: attributes.descriptionLetterSpacing,
		fontSpacingKey: 'descriptionLetterSpacing',
		wordSpacing: attributes.descriptionWordSpacing,
		wordSpacingKey: 'descriptionWordSpacing',
		globalTypo: attributes.descriptionGlobalTypo,
		globalTypoKey: 'descriptionGlobalTypo',
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
				value={descriptionColor || ''}
				attributesKey="descriptionColor"
				setAttributes={setAttributes}
			/>
		</>
	);
}

/* Panel body — the block's Settings/Style tabs. */
function MemberDescriptionPanel({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={MemberDescriptionSettings}
			StyleTab={MemberDescriptionStyle}
		/>
	);
}

const PANELS = [
	// key 'general' = the panel-context default, so this opens on load.
	{ key: 'general', title: __('Display Settings', 'team-free'), Body: MemberDescriptionPanel },
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
