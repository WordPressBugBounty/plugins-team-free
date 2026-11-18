/**
 * Member Image — General inspector (orchestrator).
 *
 * Two PanelBody sections: the block's own Display Settings (Settings/Style tabs,
 * a standalone twin of the shared member-card Member Image panel) and the shared
 * Advanced Settings. Open/close is accordion-style via the panel-body context.
 */

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import { usePanelBodyContext } from '../../hooks/togglePanelBodyContext';
import {
	Border,
	Divider,
	Popover,
	SelectField,
	Spacing,
	SPToggleGroupControl,
	TabControls,
	Toggle,
	WidthHeight,
} from '../../components';
// Shared Advanced Settings — General (wrapper bg/spacing) / Visibility / Advanced.
import { AdvancedSettings } from '../shared/advance';
import { isFreeImageHoverEffect, resolveImageHoverEffect } from '../shared/proGate';

// Hover Effects — only None / Zoom In / Zoom Out are free
// (Pro_Gate::FREE_IMAGE_HOVER_EFFECTS); the rest are disabled "(Pro)" options.
const IMAGE_HOVER_EFFECTS = [
	{ label: __('None', 'team-free'), value: 'none' },
	{ label: __('Zoom In', 'team-free'), value: 'zoom-in' },
	{ label: __('Zoom Out', 'team-free'), value: 'zoom-out' },
	{ label: __('Move Left', 'team-free'), value: 'move-left' },
	{ label: __('Move Right', 'team-free'), value: 'move-right' },
	{ label: __('Move Top', 'team-free'), value: 'move-top' },
	{ label: __('Move Bottom', 'team-free'), value: 'move-bottom' },
	{ label: __('Rotate Left', 'team-free'), value: 'rotate-left' },
	{ label: __('Rotate Right', 'team-free'), value: 'rotate-right' },
	{ label: __('Grow Rotate', 'team-free'), value: 'grow-rotate' },
	{ label: __('Shine', 'team-free'), value: 'shine' },
	{ label: __('Circle Shine', 'team-free'), value: 'circle-shine' },
].map((item) =>
	isFreeImageHoverEffect(item.value)
		? item
		: { ...item, label: `${item.label} (${__('Pro', 'team-free')})`, disabled: true }
);

/* Settings tab — resolution, aspect ratio, size and image toggles
   (Figma: Member Image / Display Settings → Settings). */
function MemberImageSettings({ attributes, setAttributes }) {
	const { imageResolution, imageAspectRatio, imageSize, imageLazyLoad, imageRetina } = attributes;

	return (
		<>
			<SelectField
				label={__('Image Resolution', 'team-free')}
				attributes={imageResolution}
				attributesKey="imageResolution"
				setAttributes={setAttributes}
				items={[
					{ label: __('Original', 'team-free'), value: 'full' },
					{ label: __('Thumbnail', 'team-free'), value: 'thumbnail' },
					{ label: __('Medium', 'team-free'), value: 'medium' },
					{ label: __('Medium Large', 'team-free'), value: 'medium_large' },
					{ label: __('Large', 'team-free'), value: 'large' },
				]}
			/>

			{/* `Original` keeps the photo's natural height; `Custom` drops the ratio
			    so the Width/Height fields — shown only then — size the photo box. */}
			<SelectField
				label={__('Aspect Ratio', 'team-free')}
				attributes={imageAspectRatio}
				attributesKey="imageAspectRatio"
				setAttributes={setAttributes}
				items={[
					{ label: __('Original', 'team-free'), value: 'original' },
					{ label: __('Square - 1:1', 'team-free'), value: '1-1' },
					{ label: __('Standard - 4:3', 'team-free'), value: '4-3' },
					{ label: __('Portrait - 3:4', 'team-free'), value: '3-4' },
					{ label: __('Classic - 3:2', 'team-free'), value: '3-2' },
					{ label: __('Classic Portrait - 2:3', 'team-free'), value: '2-3' },
					{ label: __('Wide - 16:9', 'team-free'), value: '16-9' },
					{ label: __('Tall - 9:16', 'team-free'), value: '9-16' },
					{ label: __('Custom', 'team-free'), value: 'custom' },
				]}
			/>

			{imageAspectRatio === 'custom' && (
				<WidthHeight
					attributes={imageSize || {}}
					attributesKey="imageSize"
					setAttributes={setAttributes}
					units={['px', '%', 'em', 'rem']}
					min={0}
					max={2000}
					step={1}
				/>
			)}

			<Toggle
				label={__('Lazy Loading', 'team-free')}
				attributes={!!imageLazyLoad}
				onChange={(current) => setAttributes({ imageLazyLoad: !current })}
			/>
			<Toggle
				label={__('Load 2x for Retina Display', 'team-free')}
				attributes={!!imageRetina}
				onChange={(current) => setAttributes({ imageRetina: !current })}
			/>
		</>
	);
}

/* Style tab — hover effect, Image Filter (Pro), border (Normal/Hover), radius. */
function MemberImageStyle({ attributes, setAttributes }) {
	const {
		imageHoverEffect,
		imageBorder,
		imageBorderHover,
		imageBorderWidth,
		imageBorderWidthHover,
		imageBorderRadius,
	} = attributes;
	const [openState, setOpenState] = useState('normal');
	const isHover = openState === 'hover';
	// The Normal/Hover toggle scopes the Border.
	const border = isHover ? imageBorderHover : imageBorder;
	const borderWidth = isHover ? imageBorderWidthHover : imageBorderWidth;
	const borderKey = isHover ? 'imageBorderHover' : 'imageBorder';
	const borderWidthKey = isHover ? 'imageBorderWidthHover' : 'imageBorderWidth';

	return (
		<>
			<SelectField
				label={__('Hover Effects', 'team-free')}
				attributes={resolveImageHoverEffect(imageHoverEffect)}
				attributesKey="imageHoverEffect"
				setAttributes={setAttributes}
				items={IMAGE_HOVER_EFFECTS}
			/>

			<SPToggleGroupControl
				attributes={openState}
				onClick={(value) => setOpenState(value)}
				items={[
					{ label: __('Normal', 'team-free'), value: 'normal' },
					{ label: __('Hover', 'team-free'), value: 'hover' },
				]}
			/>

			{/* Image Filter is Pro — a locked row; Free ships no filter controls
			    or filter CSS. */}
			<Popover label={__('Image Filter', 'team-free')} isPro />

			{/* Normal and Hover are independent — editing one never touches the other. */}
			<Border
				label={__('Border', 'team-free')}
				attributes={{ border: border || {}, borderWidth: borderWidth || {} }}
				attributesKey={{ border: borderKey, borderWidth: borderWidthKey }}
				setAttributes={setAttributes}
				units={['px', 'em']}
				btnType="color"
				parentState={openState}
			/>

			<Divider position="sp-w-100pct bottom" />

			{/* Empty default — the shared card SCSS (4px radius) holds until
			    customized. No Margin control: the block's spacing is Advanced
			    Settings → General. */}
			<Spacing
				label={__('Border Radius', 'team-free')}
				attributes={imageBorderRadius || {}}
				attributesKey="imageBorderRadius"
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
		</>
	);
}

/* Panel body — the block's Settings/Style tabs. */
function MemberImagePanel({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={MemberImageSettings}
			StyleTab={MemberImageStyle}
		/>
	);
}

const PANELS = [
	// key 'general' = the panel-context default, so this opens on load.
	{ key: 'general', title: __('Display Settings', 'team-free'), Body: MemberImagePanel },
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
