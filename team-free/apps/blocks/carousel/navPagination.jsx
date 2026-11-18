/**
 * Carousel — Navigation Arrow + Pagination Dots panel bodies (port of
 * testimonial-pro's NavigationArrow / PaginationDots panels). Each panel
 * shows only while its Display Settings toggle is on (gated in inspect.js);
 * both use the shared Settings/Style TabControls pair.
 */

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	SPRangeControl,
	SPToggleGroupControl,
	SelectField,
	Toggle,
	Layouts,
	TabControls,
	SpColorPicker,
	Border,
	BoxShadow,
	Spacing,
	Divider,
	Popover,
	Typography,
	ProNotice,
	ProTag,
} from '../../components';
import { PRO_NOTICE_NAVIGATION } from '../shared/proNotices';
import { NAV_ARROW_ICONS, PAGINATION_STYLE_ICONS } from './icons';
import {
	isFreeNavArrowStyle,
	isFreePaginationStyle,
	resolveNavArrowStyle,
	resolvePaginationStyle,
} from '../shared/proGate';

// Arrow Style choices for the shared Layouts picker — each icon wrapped in a
// nav-icon cell. The cell CSS (editor.scss) keeps the small fixed-size glyphs
// at natural size (overriding the Layouts svg{width:100%} stretch) and fills
// the selected cell brand green. Every style is free
// (Pro_Gate::FREE_NAV_ARROW_STYLES lists all twelve), so no tile is locked.
const NAV_ICON_ITEMS = Object.entries(NAV_ARROW_ICONS).map(([value, icon]) => ({
	value,
	icon: <span className="sp-smart-team-nav-icon-cell">{icon}</span>,
	pro: !isFreeNavArrowStyle(value),
}));

const NAV_POSITIONS = [
	{ label: __('Vertical Center', 'team-free'), value: 'vertical_center' },
	{ label: __('Top Left', 'team-free'), value: 'top_left' },
	{ label: __('Top Center', 'team-free'), value: 'top_center' },
	{ label: __('Top Right', 'team-free'), value: 'top_right' },
	{ label: __('Bottom Left', 'team-free'), value: 'bottom_left' },
	{ label: __('Bottom Center', 'team-free'), value: 'bottom_center' },
	{ label: __('Bottom Right', 'team-free'), value: 'bottom_right' },
];

// A responsive `{ device, unit }` value at `value` px on every device — what
// the locked Offset rows display (nothing is ever written back).
const lockedOffset = (value) => ({
	device: { Desktop: value, Tablet: value, Mobile: value },
	unit: { Desktop: 'px', Tablet: 'px', Mobile: 'px' },
});

function NavigationSettings({ attributes, setAttributes }) {
	const { navIconName, navIconPosition, navIconSize } = attributes;
	// Fixed placement Free renders (carousel/style.scss): Vertical Center hangs the
	// arrows 24px outside the slides; the top/bottom rows sit 20px off the carousel.
	const isVerticalCenter = (navIconPosition || 'vertical_center') === 'vertical_center';
	const fixedOffsetX = isVerticalCenter ? -24 : 0;
	const fixedOffsetY = isVerticalCenter ? 0 : 20;

	// Figma order: Arrow Style → Size → Show on Hover → Arrow Position →
	// Offset X → Offset Y → Pro note (no Gap Between Icons control — navIconGap
	// keeps its default via dynamic CSS). Show on Hover and the offsets are Pro:
	// locked rows that never write navIconVisibleOnHover / navOffsetX / navOffsetY
	// (a Pro-saved value stays stored untouched, Free just doesn't render it);
	// the offsets show the fixed placement Free renders.
	return (
		<>
			<Layouts
				label={__('Arrow Style', 'team-free')}
				attributes={resolveNavArrowStyle(navIconName)}
				attributesKey="navIconName"
				setAttributes={setAttributes}
				items={NAV_ICON_ITEMS}
				grid={6}
			/>
			<SPRangeControl
				label={__('Size', 'team-free')}
				attributes={navIconSize}
				attributesKey="navIconSize"
				setAttributes={setAttributes}
				units={['px']}
				min={8}
				max={60}
				step={1}
			/>
			<Toggle label={__('Show on Hover', 'team-free')} attributes={false} isPro />
			<SelectField
				label={__('Arrow Position', 'team-free')}
				attributes={navIconPosition || 'vertical_center'}
				attributesKey="navIconPosition"
				setAttributes={setAttributes}
				items={NAV_POSITIONS}
			/>
			<SPRangeControl
				label={__('Offset X', 'team-free')}
				attributes={lockedOffset(fixedOffsetX)}
				attributesKey="navOffsetX"
				units={['px']}
				min={-200}
				max={200}
				step={1}
				isPro
			/>
			<SPRangeControl
				label={__('Offset Y', 'team-free')}
				attributes={lockedOffset(fixedOffsetY)}
				attributesKey="navOffsetY"
				units={['px']}
				min={-200}
				max={200}
				step={1}
				isPro
			/>
			<ProNotice {...PRO_NOTICE_NAVIGATION} />
		</>
	);
}

// Navigation Arrow → Style tab (Figma): a Normal/Hover state toggle over the
// Color + Background Color, then Border Style, Box Shadow, Border Radius and
// Padding. Mirrors the ajax-pagination Style tab; state-aware color/border via
// the existing per-state nav attributes (navIconColor(Hover),
// navIconBgColor(Hover), navIconBoxShadow(Hover), border syncHoverColor).
function NavigationStyle({ attributes, setAttributes }) {
	const {
		navIconColor,
		navIconColorHover,
		navIconBgColor,
		navIconBgColorHover,
		navIconBoxShadow,
		navIconBoxShadowHover,
	} = attributes;
	const [state, setState] = useState('normal');
	const isHover = state === 'hover';
	const boxShadow = isHover ? navIconBoxShadowHover : navIconBoxShadow;
	const boxShadowKey = isHover ? 'navIconBoxShadowHover' : 'navIconBoxShadow';

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
			{/* Normal and Hover are independent — editing one never touches the other. */}
			<SpColorPicker
				label={__('Color', 'team-free')}
				value={(isHover ? navIconColorHover : navIconColor) || ''}
				attributesKey={isHover ? 'navIconColorHover' : 'navIconColor'}
				setAttributes={setAttributes}
			/>
			<SpColorPicker
				label={__('Background Color', 'team-free')}
				value={(isHover ? navIconBgColorHover : navIconBgColor) || ''}
				attributesKey={isHover ? 'navIconBgColorHover' : 'navIconBgColor'}
				setAttributes={setAttributes}
			/>
			<Border
				label={__('Border Style', 'team-free')}
				attributes={{
					border: attributes.navIconBorder || {},
					borderWidth: attributes.navIconBorderWidth || {},
				}}
				attributesKey={{ border: 'navIconBorder', borderWidth: 'navIconBorderWidth' }}
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

			<Spacing
				label={__('Border Radius', 'team-free')}
				attributes={attributes.navIconBorderRadius || {}}
				attributesKey="navIconBorderRadius"
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
			/>
			<Spacing
				label={__('Padding', 'team-free')}
				attributes={attributes.navIconPadding || {}}
				attributesKey="navIconPadding"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
			/>
		</>
	);
}

export function NavigationArrowPanel({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={NavigationSettings}
			StyleTab={NavigationStyle}
		/>
	);
}

// Labels mirror testimonial-pro's SWIPER_PAGINATION_DOTS_OPTIONS; each carries a
// preview icon shown on the right of its dropdown row. Free first (Dots, Numbers — Pro_Gate::FREE_PAGINATION_STYLES),
// then the Pro styles: those rows show a "(Pro)" tag and open the upgrade link
// instead of selecting (Free ships no CSS, markup or Swiper config for them).
const PAGINATION_STYLES = [
	{ label: __('Dots', 'team-free'), value: 'dots', icon: PAGINATION_STYLE_ICONS.dots },
	{ label: __('Numbers', 'team-free'), value: 'number', icon: PAGINATION_STYLE_ICONS.number },
	{ label: __('Dynamic', 'team-free'), value: 'dynamic', icon: PAGINATION_STYLE_ICONS.dynamic },
	{ label: __('Strokes', 'team-free'), value: 'strokes', icon: PAGINATION_STYLE_ICONS.strokes },
	{
		label: __('Scrollbar', 'team-free'),
		value: 'scrollbar',
		icon: PAGINATION_STYLE_ICONS.scrollbar,
	},
	{ label: __('Stepper', 'team-free'), value: 'stepper', icon: PAGINATION_STYLE_ICONS.stepper },
	{
		label: __('Fraction', 'team-free'),
		value: 'fraction',
		icon: PAGINATION_STYLE_ICONS.fraction,
	},
].map((item) => ({ ...item, pro: !isFreePaginationStyle(item.value) }));

// Recommended bullet width/height per free style, applied on switch so each
// style starts at its intended shape (port of testimonial-pro's
// paginationDotChangeHandler size map). Dots fall back to 12×12.
const PAGINATION_STYLE_SIZE = {
	number: { width: 30, height: 30 },
};

// Pagination Style picker — the Figma icon-button dropdown (label + a
// sliders-icon toggle opening a popover list), a port of testimonial-pro's
// SelectDropdown built on the shared Popover. Not a plain SelectField.
function PaginationStylePicker({ paginationStyle, onSelect }) {
	const active = paginationStyle || 'dots';
	return (
		<Popover label={__('Pagination Style', 'team-free')}>
			<ul className="sp-smart-team-select-dropdown">
				{PAGINATION_STYLES.map(({ value, label, icon, pro }) => (
					// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
					<li
						key={value}
						className={`sp-smart-team-select-dropdown-option${active === value ? ' active' : ''}${pro ? ' is-pro' : ''}`}
						onClick={() => {
							if (pro) {
								return;
							}
							onSelect(value);
						}}
					>
						<span>
							{label}
							{pro && <ProTag />}
						</span>
						{icon && (
							<span className="sp-smart-team-select-dropdown-option__icon">
								{icon}
							</span>
						)}
					</li>
				))}
			</ul>
		</Popover>
	);
}

function PaginationSettings({ attributes, setAttributes }) {
	const {
		paginationStyle,
		paginationDotsWidth,
		paginationDotsHeight,
		paginationDotsSpaceBetween,
	} = attributes;
	const style = resolvePaginationStyle(paginationStyle);

	// Picking a style also seeds every device's bullet width/height with that
	// style's recommended shape (round dots default to 12×12), so e.g. Numbers
	// starts as square chips on desktop, tablet and mobile alike without the
	// user resizing (port of testimonial-pro's paginationDotChangeHandler).
	const selectStyle = (value) => {
		const size = PAGINATION_STYLE_SIZE[value] || { width: 12, height: 12 };
		const allDevices = (v) => ({ Desktop: v, Tablet: v, Mobile: v });
		setAttributes({
			paginationStyle: value,
			paginationDotsWidth: { ...paginationDotsWidth, device: allDevices(size.width) },
			paginationDotsHeight: { ...paginationDotsHeight, device: allDevices(size.height) },
		});
	};

	return (
		<>
			<PaginationStylePicker paginationStyle={style} onSelect={selectStyle} />
			<SPRangeControl
				label={__('Width', 'team-free')}
				attributes={paginationDotsWidth}
				attributesKey="paginationDotsWidth"
				setAttributes={setAttributes}
				units={['px']}
				min={2}
				max={100}
				step={1}
			/>
			<SPRangeControl
				label={__('Height', 'team-free')}
				attributes={paginationDotsHeight}
				attributesKey="paginationDotsHeight"
				setAttributes={setAttributes}
				units={['px']}
				min={2}
				max={100}
				step={1}
			/>
			<SPRangeControl
				label={__('Space Between Dots', 'team-free')}
				attributes={paginationDotsSpaceBetween}
				attributesKey="paginationDotsSpaceBetween"
				setAttributes={setAttributes}
				units={['px']}
				min={0}
				max={100}
				step={1}
			/>
		</>
	);
}

function PaginationStyleTab({ attributes, setAttributes }) {
	const { paginationStyle, paginationDotsColor, paginationDotsActiveColor } = attributes;
	const style = resolvePaginationStyle(paginationStyle);

	return (
		<>
			<SpColorPicker
				label={__('Color', 'team-free')}
				value={paginationDotsColor || ''}
				attributesKey="paginationDotsColor"
				setAttributes={setAttributes}
			/>
			<SpColorPicker
				label={__('Active Color', 'team-free')}
				value={paginationDotsActiveColor || ''}
				attributesKey="paginationDotsActiveColor"
				setAttributes={setAttributes}
			/>
			{style === 'number' && (
				<Typography
					attributes={{
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
					}}
					setAttributes={setAttributes}
				/>
			)}
			<Spacing
				label={__('Margin', 'team-free')}
				attributes={attributes.paginationDotsMargin || {}}
				attributesKey="paginationDotsMargin"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
			/>
		</>
	);
}

export function PaginationDotsPanel({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={PaginationSettings}
			StyleTab={PaginationStyleTab}
		/>
	);
}
