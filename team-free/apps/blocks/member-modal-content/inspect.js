/**
 * Member Modal Content — General inspector (orchestrator).
 *
 * Two PanelBody sections — Display Settings (Settings/Style tabs) and the
 * shared Advanced Settings. Settings mirrors the Figma: how the modal presents
 * itself (display style + animation + size), how it closes (click outside,
 * close icon and its placement) and whether it steps between members.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { usePanelBodyContext } from '../../hooks/togglePanelBodyContext';
import {
	AdvancedTabFields,
	Background,
	Border,
	BoxShadow,
	Layouts,
	Popover,
	SPRangeControl,
	SPToggleGroupControl,
	SelectField,
	SpColorPicker,
	Spacing,
	TabControls,
	Toggle,
} from '../../components';
import { BgIcon, GradientIcon } from '../../components/background/svgIcon';
// The arrow glyphs + placements are the Carousel block's set — reused so the
// picker, both renderers and the CSS all read from one source.
import { NAV_ARROW_ICONS } from '../carousel/icons';

const NAV_ICON_ITEMS = Object.entries(NAV_ARROW_ICONS).map(([value, icon]) => ({
	value,
	icon: <span className="sp-smart-team-nav-icon-cell">{icon}</span>,
}));

const NAV_POSITIONS = [
	{ label: __('Top Left', 'team-free'), value: 'top_left' },
	{ label: __('Top Center', 'team-free'), value: 'top_center' },
	{ label: __('Top Right', 'team-free'), value: 'top_right' },
	{ label: __('Vertical Center', 'team-free'), value: 'vertical_center' },
	{ label: __('Bottom Left', 'team-free'), value: 'bottom_left' },
	{ label: __('Bottom Center', 'team-free'), value: 'bottom_center' },
	{ label: __('Bottom Right', 'team-free'), value: 'bottom_right' },
];

// Popup entrance animations — twin of the `--anim-{value}` keyframe rules in
// style.scss. Slide In has no picker: it animates by sliding in from its side.
export const POPUP_ANIMATIONS = [
	{ label: __('None', 'team-free'), value: 'none' },
	{ label: __('Fade In', 'team-free'), value: 'fade-in' },
	{ label: __('Zoom In', 'team-free'), value: 'zoom-in' },
	{ label: __('Zoom Out', 'team-free'), value: 'zoom-out' },
	{ label: __('Slide Up', 'team-free'), value: 'slide-up' },
	{ label: __('Slide Down', 'team-free'), value: 'slide-down' },
	{ label: __('Slide Left', 'team-free'), value: 'slide-left' },
	{ label: __('Slide Right', 'team-free'), value: 'slide-right' },
	{ label: __('Flip', 'team-free'), value: 'flip' },
	{ label: __('Rotate', 'team-free'), value: 'rotate' },
];

/* Settings tab. */
function ModalSettings({ attributes, setAttributes }) {
	const {
		displayStyle,
		popupAnimation,
		slideInPosition,
		modalWidth,
		modalMaxHeight,
		closeOnClickOutside,
		showCloseIcon,
		closeIconSize,
		closeIconPosition,
		closeIconOffset,
		showNavigation,
		navigationStyle,
		navigationIconSize,
		navigationPosition,
		navigationOffset,
	} = attributes;

	const isPopup = displayStyle !== 'slide-in';

	return (
		<>
			<SPToggleGroupControl
				label={__('Display Style', 'team-free')}
				attributes={displayStyle}
				attributesKey="displayStyle"
				setAttributes={setAttributes}
				items={[
					{ label: __('Popup', 'team-free'), value: 'popup' },
					{ label: __('Slide In', 'team-free'), value: 'slide-in' },
				]}
			/>

			{isPopup ? (
				<SelectField
					label={__('Popup Animation', 'team-free')}
					attributes={popupAnimation}
					attributesKey="popupAnimation"
					setAttributes={setAttributes}
					items={POPUP_ANIMATIONS}
				/>
			) : (
				<SelectField
					label={__('Slide In From', 'team-free')}
					attributes={slideInPosition}
					attributesKey="slideInPosition"
					setAttributes={setAttributes}
					items={[
						{ label: __('Right', 'team-free'), value: 'right' },
						{ label: __('Left', 'team-free'), value: 'left' },
					]}
				/>
			)}

			<SPRangeControl
				label={__('Width', 'team-free')}
				attributes={modalWidth}
				attributesKey="modalWidth"
				setAttributes={setAttributes}
				units={['px', '%', 'vw']}
				min={0}
				max={1600}
				step={1}
			/>
			<SPRangeControl
				label={__('Max-height', 'team-free')}
				attributes={modalMaxHeight}
				attributesKey="modalMaxHeight"
				setAttributes={setAttributes}
				units={['px', '%', 'vh']}
				min={0}
				max={1600}
				step={1}
			/>

			<Toggle
				label={__('Close when Click Outside', 'team-free')}
				attributes={!!closeOnClickOutside}
				onChange={(current) => setAttributes({ closeOnClickOutside: !current })}
			/>
			<Toggle
				label={__('Close Icon', 'team-free')}
				attributes={!!showCloseIcon}
				onChange={(current) => setAttributes({ showCloseIcon: !current })}
			/>

			{/* Placement controls are meaningless without the icon they place. */}
			{!!showCloseIcon && (
				<>
					<SPRangeControl
						label={__('Icon Size', 'team-free')}
						attributes={closeIconSize}
						attributesKey="closeIconSize"
						setAttributes={setAttributes}
						units={['px', 'em', 'rem']}
						min={0}
						max={100}
						step={1}
					/>
					<SelectField
						label={__('Icon Position', 'team-free')}
						attributes={closeIconPosition}
						attributesKey="closeIconPosition"
						setAttributes={setAttributes}
						items={[
							{ label: __('Inside - Left', 'team-free'), value: 'inside-left' },
							{ label: __('Inside - Right', 'team-free'), value: 'inside-right' },
							{ label: __('Outside - Left', 'team-free'), value: 'outside-left' },
							{ label: __('Outside - Right', 'team-free'), value: 'outside-right' },
						]}
					/>
					<SPRangeControl
						label={__('Offset', 'team-free')}
						attributes={closeIconOffset}
						attributesKey="closeIconOffset"
						setAttributes={setAttributes}
						units={['px', 'em', 'rem']}
						min={0}
						max={200}
						step={1}
					/>
				</>
			)}

			<Toggle
				label={__('Show Navigation', 'team-free')}
				attributes={!!showNavigation}
				onChange={(current) => setAttributes({ showNavigation: !current })}
			/>

			{/* Arrow controls follow the toggle they belong to. */}
			{!!showNavigation && (
				<>
					{/* Default (not `toggleOnly`) mode: `toggleOnly` renders the
					    icon button ALONE and drops the label — the label + button
					    row is the Content Box / Tag Style / Image Filter pattern. */}
					<Popover label={__('Navigation Style', 'team-free')}>
						<Layouts
							attributes={navigationStyle || 'chevron-outline'}
							attributesKey="navigationStyle"
							setAttributes={setAttributes}
							items={NAV_ICON_ITEMS}
							grid={6}
						/>
					</Popover>
					<SPRangeControl
						label={__('Navigation Icon Size', 'team-free')}
						attributes={navigationIconSize}
						attributesKey="navigationIconSize"
						setAttributes={setAttributes}
						units={['px']}
						min={8}
						max={60}
						step={1}
					/>
					<SelectField
						label={__('Position', 'team-free')}
						attributes={navigationPosition || 'vertical_center'}
						attributesKey="navigationPosition"
						setAttributes={setAttributes}
						items={NAV_POSITIONS}
					/>
					<SPRangeControl
						label={__('Offset', 'team-free')}
						attributes={navigationOffset}
						attributesKey="navigationOffset"
						setAttributes={setAttributes}
						units={['px', 'em', 'rem']}
						min={-100}
						max={200}
						step={1}
					/>
				</>
			)}
		</>
	);
}

/* The style set behind the Close Button Style / Navigation Button Style
   popovers. Both buttons take the same controls, so one component serves both —
   only the attribute prefix differs.

   Normal/Hover scopes Color, Background and Border; Border Radius is per-button,
   not per-state. Normal and Hover are independent. */
function ButtonStyleControls({ attributes, setAttributes, prefix }) {
	const [state, setState] = useState('normal');
	const isHover = state === 'hover';
	const colorKey = isHover ? `${prefix}ColorHover` : `${prefix}Color`;
	const borderKey = isHover ? `${prefix}BorderHover` : `${prefix}Border`;
	const widthKey = isHover ? `${prefix}BorderWidthHover` : `${prefix}BorderWidth`;

	return (
		<>
			<SPToggleGroupControl
				attributes={state}
				onClick={(value) => setState(value)}
				items={[
					{ label: __('Normal', 'team-free'), value: 'normal' },
					{ label: __('Hover', 'team-free'), value: 'hover' },
				]}
			/>
			<SpColorPicker
				label={__('Color', 'team-free')}
				value={attributes[colorKey] || ''}
				attributesKey={colorKey}
				setAttributes={setAttributes}
			/>
			<Background
				label={__('Background Type', 'team-free')}
				attributes={attributes[`${prefix}Bg`] || {}}
				attributesKey={`${prefix}Bg`}
				setAttributes={setAttributes}
				colorType={isHover ? 'hover' : 'color'}
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
					border: attributes[borderKey] || {},
					borderWidth: attributes[widthKey] || {},
				}}
				attributesKey={{ border: borderKey, borderWidth: widthKey }}
				setAttributes={setAttributes}
				units={['px', 'em']}
				btnType="color"
				parentState={state}
			/>
			<Spacing
				label={__('Border Radius', 'team-free')}
				attributes={attributes[`${prefix}Radius`] || {}}
				attributesKey={`${prefix}Radius`}
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
			{/* Sizes the button's chip around its glyph — the close ✕ has no box
			    of its own until this is set, and the nav button grows past its
			    40px minimum. */}
			<Spacing
				label={__('Padding', 'team-free')}
				attributes={attributes[`${prefix}Padding`] || {}}
				attributesKey={`${prefix}Padding`}
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
		</>
	);
}

/* Style tab — the two button popovers, the backdrop, then the dialog box. */
function ModalStyle({ attributes, setAttributes }) {
	const {
		modalBg,
		modalBorder,
		modalBorderWidth,
		modalBoxShadow,
		showBackgroundOverlay,
		overlayColor,
		showCloseIcon,
		showNavigation,
	} = attributes;

	return (
		<>
			{/* Each button's whole style set lives behind its own popover, so the
			    tab stays the short list in the Figma. Hidden with the button. */}
			{!!showCloseIcon && (
				<Popover label={__('Close Button Style', 'team-free')}>
					<ButtonStyleControls
						attributes={attributes}
						setAttributes={setAttributes}
						prefix="closeIcon"
					/>
				</Popover>
			)}
			{!!showNavigation && (
				<Popover label={__('Navigation Button Style', 'team-free')}>
					<ButtonStyleControls
						attributes={attributes}
						setAttributes={setAttributes}
						prefix="navigationIcon"
					/>
				</Popover>
			)}

			<Toggle
				label={__('Background Overlay', 'team-free')}
				attributes={!!showBackgroundOverlay}
				onChange={(current) => setAttributes({ showBackgroundOverlay: !current })}
			/>
			{!!showBackgroundOverlay && (
				<SpColorPicker
					label={__('Overlay Color', 'team-free')}
					value={overlayColor || ''}
					attributesKey="overlayColor"
					setAttributes={setAttributes}
				/>
			)}

			<Background
				label={__('Background Type', 'team-free')}
				attributes={modalBg || {}}
				attributesKey="modalBg"
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
			<Border
				label={__('Border', 'team-free')}
				attributes={{ border: modalBorder || {}, borderWidth: modalBorderWidth || {} }}
				attributesKey={{ border: 'modalBorder', borderWidth: 'modalBorderWidth' }}
				setAttributes={setAttributes}
				units={['px', 'em']}
				btnType="color"
			/>
			{/* Empty by default so style.scss's 8px radius / 32px padding hold —
			    the reset must clear back to unset, not to an all-zero shorthand
			    that would emit at #uniqueId specificity and flatten the box. */}
			<Spacing
				label={__('Border Radius', 'team-free')}
				attributes={attributes.modalRadius || {}}
				attributesKey="modalRadius"
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
			<Toggle
				label={__('Box Shadow', 'team-free')}
				attributes={!!modalBoxShadow?.isActive}
				onChange={(current) =>
					setAttributes({ modalBoxShadow: { ...modalBoxShadow, isActive: !current } })
				}
			/>
			{!!modalBoxShadow?.isActive && (
				<BoxShadow
					attributes={modalBoxShadow}
					attributesKey="modalBoxShadow"
					setAttributes={setAttributes}
				/>
			)}
			<Spacing
				label={__('Padding', 'team-free')}
				attributes={attributes.modalPadding || {}}
				attributesKey="modalPadding"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
		</>
	);
}

/* Panel body — the block's Settings/Style tabs. */
function ModalPanel({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={ModalSettings}
			StyleTab={ModalStyle}
		/>
	);
}

/* Advanced Settings — the ADVANCED tab's options only (Custom CSS Class(es),
   Custom CSS ID, Custom CSS), with no tab bar.

   NOT the shared AdvancedSettings, which wraps these in General/Visibility/
   Advanced tabs: the wrapper box a General tab would style IS the dialog,
   already covered by the Style tab, and hide-on-device is meaningless for a
   popup the runtime opens on demand. With those two gone there is one tab left,
   so the fields render directly. */
function ModalAdvanced({ attributes, setAttributes }) {
	return <AdvancedTabFields attributes={attributes} setAttributes={setAttributes} />;
}

const PANELS = [
	// key 'general' = the panel-context default, so this opens on load.
	{ key: 'general', title: __('Display Settings', 'team-free'), Body: ModalPanel },
	{ key: 'advanced', title: __('Advanced Settings', 'team-free'), Body: ModalAdvanced },
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
