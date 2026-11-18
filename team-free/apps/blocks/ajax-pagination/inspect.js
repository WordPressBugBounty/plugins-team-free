/**
 * Ajax Pagination — General inspector (orchestrator).
 *
 * Two PanelBody sections: the block's own Settings/Style tabs (port of
 * testimonial-pro's ajax-pagination inspector) and the shared Advanced
 * Settings. Open/close is accordion-style via the panel-body context.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { usePanelBodyContext } from '../../hooks/togglePanelBodyContext';
import {
	SPRangeControl,
	SPToggleGroupControl,
	SelectField,
	SpColorPicker,
	TabControls,
	Toggle,
	Background,
	Border,
	BoxShadow,
	Spacing,
	Divider,
	Typography,
	InputControl,
} from '../../components';
import { BgIcon, GradientIcon } from '../../components/background/svgIcon';
import { JustifyLeftIcon, JustifyCenterIcon, JustifyRightIcon } from '../../components/icons';
import { AdvancedSettings } from './advance';

/* Settings tab — Show Member Per Page, the Display Style dropdown
 * (one control for Load More Button / Only Number / Number with Next-Previous /
 * Only Next-Previous — it writes the paginationButtonType + paginationNumberType
 * pair), Button Label + Infinite Scroll (Load More only), Gap (number styles)
 * and responsive Alignment. */
function PaginationSettings({ attributes, setAttributes }) {
	const {
		itemPerPage,
		paginationButtonType,
		loadMoreLabel,
		infiniteScroll,
		paginationNumberType,
		paginationNumberOfLinks,
		paginationNextPrevStyle,
		paginationNumberGap,
		paginationAlignment,
	} = attributes;
	const isLoadMore = paginationButtonType !== 'number';

	// The dropdown value derives from the stored pair (the legacy number-arrow
	// variant reads as Only Number).
	const displayStyle = isLoadMore
		? 'load-more'
		: ['number-prev-next-arrow', 'prev-next'].includes(paginationNumberType)
			? paginationNumberType
			: 'number';
	const hasNumbers = ['number', 'number-prev-next-arrow'].includes(displayStyle);
	const hasNextPrev = ['number-prev-next-arrow', 'prev-next'].includes(displayStyle);

	const onDisplayStyleChange = (value) => {
		if (value === 'load-more') {
			setAttributes({ paginationButtonType: 'load-more' });
		} else {
			setAttributes({ paginationButtonType: 'number', paginationNumberType: value });
		}
	};

	return (
		<>
			<SPRangeControl
				label={__('Show Member Per Page', 'team-free')}
				attributes={itemPerPage}
				attributesKey="itemPerPage"
				setAttributes={setAttributes}
				min={1}
				max={50}
				step={1}
			/>

			<SelectField
				label={__('Display Style', 'team-free')}
				value={displayStyle}
				onChange={onDisplayStyleChange}
				attributes={displayStyle}
				attributesKey="paginationButtonType"
				setAttributes={setAttributes}
				items={[
					{ label: __('Load More Button', 'team-free'), value: 'load-more' },
					{ label: __('Only Number', 'team-free'), value: 'number' },
					{
						label: __('Number with Next/Previous', 'team-free'),
						value: 'number-prev-next-arrow',
					},
					{ label: __('Only Next/Previous', 'team-free'), value: 'prev-next' },
				]}
			/>

			{isLoadMore && (
				<>
					<Toggle
						label={__('Infinite Scroll', 'team-free')}
						attributes={!!infiniteScroll}
						onChange={(current) => setAttributes({ infiniteScroll: !current })}
					/>
					{/* Infinite Scroll replaces the button, so it has no label. */}
					{!infiniteScroll && (
						<InputControl
							label={__('Button Label', 'team-free')}
							attributes={loadMoreLabel}
							attributesKey="loadMoreLabel"
							setAttributes={setAttributes}
							placeholder={__('Load More', 'team-free')}
							inputType="text"
							flex={false}
						/>
					)}
				</>
			)}

			{hasNumbers && (
				<SPRangeControl
					label={__('Number Of Links', 'team-free')}
					attributes={paginationNumberOfLinks}
					attributesKey="paginationNumberOfLinks"
					setAttributes={setAttributes}
					min={1}
					max={10}
					step={1}
				/>
			)}

			{hasNextPrev && (
				<SelectField
					label={__('Next/Previous Button Style', 'team-free')}
					attributes={paginationNextPrevStyle}
					attributesKey="paginationNextPrevStyle"
					setAttributes={setAttributes}
					items={[
						{ label: __('Only Label', 'team-free'), value: 'label' },
						{ label: __('Only Icon', 'team-free'), value: 'icon' },
						{ label: __('Label with Icon', 'team-free'), value: 'label-icon' },
					]}
				/>
			)}

			{!isLoadMore && (
				<SPRangeControl
					label={__('Gap Between Items', 'team-free')}
					attributes={paginationNumberGap}
					attributesKey="paginationNumberGap"
					setAttributes={setAttributes}
					units={['px', 'em']}
					min={0}
					max={100}
					step={1}
				/>
			)}

			<SPToggleGroupControl
				label={__('Alignment', 'team-free')}
				attributes={paginationAlignment}
				attributesKey="paginationAlignment"
				setAttributes={setAttributes}
				items={[
					{ label: <JustifyLeftIcon />, value: 'left', tooltip: __('Left', 'team-free') },
					{
						label: <JustifyCenterIcon />,
						value: 'center',
						tooltip: __('Center', 'team-free'),
					},
					{
						label: <JustifyRightIcon />,
						value: 'right',
						tooltip: __('Right', 'team-free'),
					},
				]}
			/>
		</>
	);
}

/* Style tab (Figma, mirrors the Read More Style tab) — item chips: typography,
 * Normal/Hover color + Background Type, border, box shadow, radius, padding,
 * wrapper margin. Hover shares the numbered `.is-current` state. */
function PaginationStyle({ attributes, setAttributes }) {
	const {
		paginationButtonType,
		paginationColor,
		paginationColorHover,
		paginationBg,
		paginationBorder,
		paginationBorderWidth,
		paginationBoxShadow,
		paginationBoxShadowHover,
		paginationBorderRadius,
		paginationPadding,
		paginationMargin,
	} = attributes;
	const [state, setState] = useState('normal');
	const isHover = state === 'hover';
	const colorType = isHover ? 'hover' : 'color';
	const boxShadow = isHover ? paginationBoxShadowHover : paginationBoxShadow;
	const boxShadowKey = isHover ? 'paginationBoxShadowHover' : 'paginationBoxShadow';

	const typoProps = {
		family: attributes.paginationTypography,
		familyKey: 'paginationTypography',
		fontSize: attributes.paginationFontSize,
		fontSizeKey: 'paginationFontSize',
		lineHeight: attributes.paginationLineHeight,
		lineHeightKey: 'paginationLineHeight',
		fontSpacing: attributes.paginationLetterSpacing,
		fontSpacingKey: 'paginationLetterSpacing',
		wordSpacing: attributes.paginationWordSpacing,
		wordSpacingKey: 'paginationWordSpacing',
		globalTypo: attributes.paginationGlobalTypo,
		globalTypoKey: 'paginationGlobalTypo',
	};

	return (
		<>
			<Typography
				attributes={typoProps}
				setAttributes={setAttributes}
				fontSizeDefault={{ unit: 'px', value: 14 }}
			/>
			<SPToggleGroupControl
				attributes={state}
				onClick={(value) => setState(value)}
				items={[
					{ label: __('Normal', 'team-free'), value: 'normal' },
					{
						label:
							paginationButtonType === 'number'
								? __('Hover & Active', 'team-free')
								: __('Hover', 'team-free'),
						value: 'hover',
					},
				]}
			/>
			<SpColorPicker
				label={__('Color', 'team-free')}
				value={(isHover ? paginationColorHover : paginationColor) || ''}
				attributesKey={isHover ? 'paginationColorHover' : 'paginationColor'}
				setAttributes={setAttributes}
			/>
			<Background
				label={__('Background Type', 'team-free')}
				attributes={paginationBg || {}}
				attributesKey="paginationBg"
				setAttributes={setAttributes}
				colorType={colorType}
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
			<Border
				label={__('Border', 'team-free')}
				attributes={{
					border: paginationBorder || {},
					borderWidth: paginationBorderWidth || {},
				}}
				attributesKey={{ border: 'paginationBorder', borderWidth: 'paginationBorderWidth' }}
				setAttributes={setAttributes}
				units={['px', 'em']}
				btnType="color"
				parentState={state}
				syncHoverColor
			/>
			<Toggle
				label={__('Box Shadow', 'team-free')}
				attributes={!!boxShadow?.isActive}
				onChange={(current) =>
					setAttributes({ [boxShadowKey]: { ...boxShadow, isActive: !current } })
				}
			/>
			{boxShadow?.isActive && (
				<BoxShadow
					attributes={boxShadow}
					attributesKey={boxShadowKey}
					setAttributes={setAttributes}
				/>
			)}

			<Divider position="sp-w-100pct bottom" />

			{/* Empty default — the static SCSS 4px radius holds until customized;
			    reset restores empty, not zeros. */}
			<Spacing
				label={__('Border Radius', 'team-free')}
				attributes={paginationBorderRadius || {}}
				attributesKey="paginationBorderRadius"
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
			{/* Empty defaults — the static SCSS (item 10px 20px / wrapper
			    margin-top 32px) holds until customized; reset restores empty,
			    not zeros. */}
			<Spacing
				label={__('Padding', 'team-free')}
				attributes={paginationPadding || {}}
				attributesKey="paginationPadding"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
			<Spacing
				label={__('Margin', 'team-free')}
				attributes={paginationMargin || {}}
				attributesKey="paginationMargin"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
				min={0}
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
		</>
	);
}

/* Panel body — the block's Settings/Style tabs. */
function AjaxPaginationPanel({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={PaginationSettings}
			StyleTab={PaginationStyle}
		/>
	);
}

const PANELS = [
	// key 'general' = the panel-context default, so this opens on load.
	{ key: 'general', title: __('Ajax Pagination', 'team-free'), Body: AjaxPaginationPanel },
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
