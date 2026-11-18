/**
 * Member Name — General inspector (orchestrator).
 *
 * Two PanelBody sections: the block's own Display Settings (Settings/Style tabs)
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

/* Settings tab — HTML tag + alignment (Figma: Member Name / General). */
function MemberNameSettings({ attributes, setAttributes }) {
	const { nameTag, nameAlignment } = attributes;

	return (
		<>
			<SPToggleGroupControl
				label={__('HTML Tag', 'team-free')}
				attributes={nameTag}
				attributesKey="nameTag"
				setAttributes={setAttributes}
				items={[
					{ label: 'H1', value: 'h1' },
					{ label: 'H2', value: 'h2' },
					{ label: 'H3', value: 'h3' },
					{ label: 'H4', value: 'h4' },
					{ label: 'H5', value: 'h5' },
					{ label: 'H6', value: 'h6' },
					{ label: __('Span', 'team-free'), value: 'span' },
				]}
			/>

			<SPToggleGroupControl
				label={__('Alignment', 'team-free')}
				attributes={nameAlignment}
				attributesKey="nameAlignment"
				setAttributes={setAttributes}
				items={[
					{ label: <LeftIcon />, value: 'left', tooltip: __('Left', 'team-free') },
					{ label: <CenterIcon />, value: 'center', tooltip: __('Center', 'team-free') },
					{ label: <RightIcon />, value: 'right', tooltip: __('Right', 'team-free') },
				]}
			/>
		</>
	);
}

/* Style tab — typography + color. (No Margin control: the block's spacing is
   Advanced Settings → General.) */
function MemberNameStyle({ attributes, setAttributes }) {
	const { nameColor } = attributes;

	const typoProps = {
		family: attributes.nameTypography,
		familyKey: 'nameTypography',
		fontSize: attributes.nameFontSize,
		fontSizeKey: 'nameFontSize',
		lineHeight: attributes.nameLineHeight,
		lineHeightKey: 'nameLineHeight',
		fontSpacing: attributes.nameLetterSpacing,
		fontSpacingKey: 'nameLetterSpacing',
		wordSpacing: attributes.nameWordSpacing,
		wordSpacingKey: 'nameWordSpacing',
		globalTypo: attributes.nameGlobalTypo,
		globalTypoKey: 'nameGlobalTypo',
	};

	return (
		<>
			<Typography
				attributes={typoProps}
				setAttributes={setAttributes}
				// 32px — matches the `nameFontSize` attribute default in
				// Types/Member_Name/attributes.php, so the control's fallback and what
				// the block actually renders agree.
				fontSizeDefault={{ unit: 'px', value: 32 }}
			/>

			<SpColorPicker
				label={__('Color', 'team-free')}
				value={nameColor || ''}
				attributesKey="nameColor"
				setAttributes={setAttributes}
			/>
		</>
	);
}

/* Panel body — the block's Settings/Style tabs. */
function MemberNamePanel({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={MemberNameSettings}
			StyleTab={MemberNameStyle}
		/>
	);
}

const PANELS = [
	// key 'general' = the panel-context default, so this opens on load.
	{ key: 'general', title: __('Display Settings', 'team-free'), Body: MemberNamePanel },
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
