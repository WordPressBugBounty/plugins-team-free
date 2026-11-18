/**
 * Grid — Style tab content.
 *
 * Exports the "Style" panels consumed by inspect.js through the shared
 * <TabControls /> layout: ContentStyle (item text colors) and ContainerStyle
 * (the shared section box — background/border/spacing/shadow).
 */

import { __ } from '@wordpress/i18n';
import {
	Background,
	Border,
	BoxShadow,
	Spacing,
	SpColorPicker,
	SPRangeControl,
	Toggle,
} from '../../components';
import { BgIcon, GradientIcon, TransparentIcon } from '../../components/background/svgIcon';

export function ContentStyle({ attributes, setAttributes }) {
	const { nameColor, roleColor, bioColor, imageRadius, socialIconColor, socialBorderColor } =
		attributes;
	return (
		<>
			<SpColorPicker
				label={__('Name Color', 'team-free')}
				value={nameColor || ''}
				attributesKey="nameColor"
				setAttributes={setAttributes}
			/>
			<SpColorPicker
				label={__('Role Color', 'team-free')}
				value={roleColor || ''}
				attributesKey="roleColor"
				setAttributes={setAttributes}
			/>
			<SpColorPicker
				label={__('Bio Color', 'team-free')}
				value={bioColor || ''}
				attributesKey="bioColor"
				setAttributes={setAttributes}
			/>
			<SPRangeControl
				label={__('Image Radius', 'team-free')}
				attributes={imageRadius}
				attributesKey="imageRadius"
				setAttributes={setAttributes}
				min={0}
				max={100}
				step={1}
			/>
			<SpColorPicker
				label={__('Social Icon Color', 'team-free')}
				value={socialIconColor || ''}
				attributesKey="socialIconColor"
				setAttributes={setAttributes}
			/>
			<SpColorPicker
				label={__('Social Border Color', 'team-free')}
				value={socialBorderColor || ''}
				attributesKey="socialBorderColor"
				setAttributes={setAttributes}
			/>
		</>
	);
}

export function ContainerStyle({ attributes, setAttributes }) {
	const {
		sectionPadding,
		sectionMargin,
		sectionBg,
		sectionBorder,
		sectionBorderWidth,
		sectionBorderRadius,
		sectionBoxShadow,
	} = attributes;

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
					{
						label: <BgIcon />,
						value: 'bgColor',
						tooltip: __('Color', 'team-free'),
					},
					{
						label: <GradientIcon />,
						value: 'gradient',
						tooltip: __('Gradient', 'team-free'),
					},
					{
						label: <TransparentIcon />,
						value: 'transparent',
						tooltip: __('Transparent', 'team-free'),
					},
				]}
			/>

			<Border
				label={__('Border', 'team-free')}
				attributes={{
					border: sectionBorder || {},
					borderWidth: sectionBorderWidth || {},
				}}
				attributesKey={{
					border: 'sectionBorder',
					borderWidth: 'sectionBorderWidth',
				}}
				setAttributes={setAttributes}
				units={['px', 'em']}
				btnType="color"
			/>
			<Spacing
				label={__('Border Radius', 'team-free')}
				attributes={sectionBorderRadius || {}}
				attributesKey="sectionBorderRadius"
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>

			<Toggle
				label={__('Enable Box Shadow', 'team-free')}
				attributes={!!sectionBoxShadow?.isActive}
				onChange={(current) =>
					setAttributes({
						sectionBoxShadow: {
							...sectionBoxShadow,
							isActive: !current,
						},
					})
				}
			/>
			{sectionBoxShadow?.isActive && (
				<BoxShadow
					attributes={sectionBoxShadow}
					attributesKey="sectionBoxShadow"
					setAttributes={setAttributes}
				/>
			)}

			<Spacing
				label={__('Padding', 'team-free')}
				attributes={sectionPadding || {}}
				attributesKey="sectionPadding"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
			{/* Same 0 minimum as the shared Advanced Settings copy — both edit
			    `sectionMargin`, so their ranges must agree. */}
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
