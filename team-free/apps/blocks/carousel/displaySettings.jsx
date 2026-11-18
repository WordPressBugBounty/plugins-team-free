/**
 * Carousel — Display Settings panel body (Figma: Smart Team / Carousel /
 * Layout / General).
 *
 * Two tabs: Settings (carousel style/effect + card design + direction/partial
 * view/columns/gap/align + nav/pagination toggles) and Carousel (autoplay,
 * speed, loop, interaction toggles) — the shared TabControls Settings +
 * CarouselTab pair. The card-design picker + per-design controls come from
 * the shared CardDesignControls.
 */

import { __ } from '@wordpress/i18n';
import {
	SPRangeControl,
	SPToggleGroupControl,
	SelectField,
	Toggle,
	Layouts,
	TabControls,
	ProNotice,
} from '../../components';
import {
	VerticalAlignTopIcon,
	VerticalAlignCenterIcon,
	VerticalAlignBottomIcon,
	FullWithIcon,
} from '../../components/icons';
import { PRO_NOTICE_CAROUSEL_DISPLAY } from '../shared/proNotices';
import { CardDesignControls } from '../shared/panels';
import {
	CarouselStyleDefault,
	CarouselStyleCenter,
	CarouselStyleTicker,
	CarouselStyleMultiRow,
} from './icons';
import { isFreeCarouselStyle, isFreeSlideEffect, isFreeDisplayStyle } from '../shared/proGate';

// `pro` is resolved once, here, from Pro_Gate's localized free-style list —
// only 'default' is free (docs/pro-free-separation.md §5, same one-catalogue
// pattern CARD_DESIGN_ITEMS uses).
const CAROUSEL_STYLE_ITEMS = [
	{ value: 'default', name: __('Standard', 'team-free'), icon: <CarouselStyleDefault /> },
	{ value: 'center', name: __('Center', 'team-free'), icon: <CarouselStyleCenter /> },
	{ value: 'ticker', name: __('Ticker', 'team-free'), icon: <CarouselStyleTicker /> },
	{ value: 'multi-row', name: __('Multi-Row', 'team-free'), icon: <CarouselStyleMultiRow /> },
].map((item) => ({ ...item, pro: !isFreeCarouselStyle(item.value) }));

// Slide Effect options. Only the default carousel style exposes the effect —
// the center and rtl styles lock the slide effect (resolved by SwiperConfig /
// useSwiperConfig, which also still accept legacy ken-burns/coverflow values).
// Fade/Spring are Pro — plain disabled options with a "(Pro)" label suffix,
// same select-option treatment Real Testimonials Free uses (a native <select>
// can't render a crown inside an <option>).
const SLIDE_EFFECT_BASE = [
	{ label: __('None', 'team-free'), value: 'none' },
	{ label: __('Slide', 'team-free'), value: 'slide' },
	{ label: __('Flip', 'team-free'), value: 'flip' },
	{ label: __('Cube', 'team-free'), value: 'cube' },
	{ label: __('Fade', 'team-free'), value: 'fade' },
	{ label: __('Spring', 'team-free'), value: 'spring' },
];
const SLIDE_EFFECTS = SLIDE_EFFECT_BASE.map((item) => {
	const pro = !isFreeSlideEffect(item.value);
	return pro
		? { ...item, label: `${item.label} (${__('Pro', 'team-free')})`, disabled: true }
		: item;
});

function SettingsTab({ attributes, setAttributes }) {
	const {
		carouselStyle,
		slidingEffect,
		carouselDisplayStyle,
		partialSlideView,
		columns,
		columnGap,
		carouselRows,
		alignItems,
		enableNavigationArrow,
		enablePaginationDots,
	} = attributes;

	const style = carouselStyle || 'default';
	const isDefaultStyle = style === 'default';
	const isTicker = style === 'ticker';
	const isMultiRow = style === 'multi-row';

	return (
		<>
			<Layouts
				label={__('Select Carousel Style', 'team-free')}
				showActiveName
				attributes={style}
				attributesKey="carouselStyle"
				setAttributes={setAttributes}
				items={CAROUSEL_STYLE_ITEMS}
				grid={2}
				displayActive
			/>

			{isDefaultStyle && (
				<SelectField
					label={__('Slide Effect', 'team-free')}
					attributes={slidingEffect || 'slide'}
					attributesKey="slidingEffect"
					setAttributes={setAttributes}
					items={SLIDE_EFFECTS}
				/>
			)}

			<CardDesignControls attributes={attributes} setAttributes={setAttributes} />

			{/* Multi-row uses Swiper's grid module, which is horizontal-only. */}
			{!isMultiRow && (
				<SPToggleGroupControl
					label={__('Display Direction', 'team-free')}
					attributes={carouselDisplayStyle || 'horizontal'}
					attributesKey="carouselDisplayStyle"
					setAttributes={setAttributes}
					items={[
						{ label: __('Horizontal', 'team-free'), value: 'horizontal' },
						{
							label: __('Vertical', 'team-free'),
							value: 'vertical',
							pro: !isFreeDisplayStyle('vertical'),
						},
					]}
				/>
			)}

			{/* Partial Slide View is Pro-only in its entirety — the control stays
			    visible (locked) so Free users can see the feature exists, but
			    Free never exposes its side/offset settings (Pro_Gate::partial_view
			    always normalizes the stored value to false at render). */}
			{isDefaultStyle && (
				<Toggle
					label={__('Partial Slide View', 'team-free')}
					attributes={!!partialSlideView}
					onChange={(current) => setAttributes({ partialSlideView: !current })}
					isPro
				/>
			)}

			<SPRangeControl
				label={__('Columns', 'team-free')}
				attributes={columns}
				attributesKey="columns"
				setAttributes={setAttributes}
				min={1}
				max={8}
				step={1}
			/>
			{/* Number of Rows → Swiper grid.rows (multi-row style only). */}
			{isMultiRow && (
				<SPRangeControl
					label={__('Number of Rows', 'team-free')}
					attributes={carouselRows ?? 2}
					attributesKey="carouselRows"
					setAttributes={setAttributes}
					onValueChange={({ value }) => setAttributes({ carouselRows: value })}
					min={1}
					max={5}
					step={1}
				/>
			)}
			<SPRangeControl
				label={__('Gap Between Items', 'team-free')}
				attributes={columnGap}
				attributesKey="columnGap"
				setAttributes={setAttributes}
				units={['px']}
				min={0}
				max={100}
				step={1}
			/>

			<SPToggleGroupControl
				label={__('Align Items', 'team-free')}
				attributes={alignItems}
				attributesKey="alignItems"
				setAttributes={setAttributes}
				items={[
					{
						label: <VerticalAlignTopIcon />,
						value: 'start',
						tooltip: __('Top', 'team-free'),
					},
					{
						label: <VerticalAlignCenterIcon />,
						value: 'center',
						tooltip: __('Middle', 'team-free'),
					},
					{
						label: <VerticalAlignBottomIcon />,
						value: 'end',
						tooltip: __('Bottom', 'team-free'),
					},
					{
						label: <FullWithIcon />,
						value: 'stretch',
						tooltip: __('Stretch', 'team-free'),
					},
				]}
			/>

			{!isTicker && (
				<>
					<Toggle
						label={__('Navigation Arrow', 'team-free')}
						attributes={!!enableNavigationArrow}
						onChange={(current) => setAttributes({ enableNavigationArrow: !current })}
					/>
					<Toggle
						label={__('Pagination Dots', 'team-free')}
						attributes={!!enablePaginationDots}
						onChange={(current) => setAttributes({ enablePaginationDots: !current })}
					/>
				</>
			)}

			<ProNotice {...PRO_NOTICE_CAROUSEL_DISPLAY} />
		</>
	);
}

// Exported (Pro reuses it in the 3D Carousel's "Carousel Settings" panel;
// Free ships no 3D Carousel UI).
export function CarouselTab({ attributes, setAttributes }) {
	const {
		carouselStyle,
		sliderAutoPlay,
		carouselAutoplayDelay,
		carouselSpeed,
		carouselDirection,
		slideToScroll,
		pauseOnHover,
		infiniteLoop,
		adaptiveHeight,
		tabAndKeyNavigation,
		mouseWheelControl,
		freeScrollMode,
	} = attributes;

	// The ticker style is a CSS marquee — only the loop speed and pause on
	// hover apply (all the Swiper interaction options are meaningless there).
	if ((carouselStyle || 'default') === 'ticker') {
		return (
			<>
				<SPRangeControl
					label={__('Carousel Speed', 'team-free')}
					attributes={carouselSpeed}
					attributesKey="carouselSpeed"
					setAttributes={setAttributes}
					units={['ms']}
					min={3000}
					max={60000}
					step={500}
				/>
				<Toggle
					label={__('Pause on Hover', 'team-free')}
					attributes={!!pauseOnHover}
					onChange={(current) => setAttributes({ pauseOnHover: !current })}
				/>
			</>
		);
	}

	// Figma order (Carousel tab, non-ticker styles): Speed → Slide to Scroll →
	// Direction (AutoPlay only) → AutoPlay (+Delay when on) → Pause on Hover →
	// the interaction toggles.
	return (
		<>
			<SPRangeControl
				label={__('Carousel Speed', 'team-free')}
				attributes={carouselSpeed}
				attributesKey="carouselSpeed"
				setAttributes={setAttributes}
				units={['ms']}
				min={100}
				max={10000}
				step={100}
			/>
			{/* Slides to Scroll → slidesPerGroup, RESPONSIVE (per Desktop/Tablet/
			    Mobile) like WP Carousel Pro — the device-keyed attribute drives the
			    Swiper breakpoints directly, same pattern as Columns above. */}
			<SPRangeControl
				label={__('Slides to Scroll', 'team-free')}
				attributes={slideToScroll}
				attributesKey="slideToScroll"
				setAttributes={setAttributes}
				min={1}
				max={10}
				step={1}
			/>
			{/* Carousel Direction is offered only while AutoPlay is on — it is the
			    direction the carousel scrolls itself, so with AutoPlay off there is
			    nothing for it to reverse but the initial slide order. It keeps its
			    Figma slot (above AutoPlay) rather than moving under the toggle. */}
			{!!sliderAutoPlay && (
				<SPToggleGroupControl
					label={__('Carousel Direction', 'team-free')}
					attributes={carouselDirection || 'rtl'}
					attributesKey="carouselDirection"
					setAttributes={setAttributes}
					items={[
						{ label: __('Right to Left', 'team-free'), value: 'rtl' },
						{ label: __('Left to Right', 'team-free'), value: 'ltr' },
					]}
				/>
			)}
			<Toggle
				label={__('AutoPlay', 'team-free')}
				attributes={!!sliderAutoPlay}
				onChange={(current) => setAttributes({ sliderAutoPlay: !current })}
			/>
			{!!sliderAutoPlay && (
				<SPRangeControl
					label={__('Autoplay Delay', 'team-free')}
					attributes={carouselAutoplayDelay}
					attributesKey="carouselAutoplayDelay"
					setAttributes={setAttributes}
					units={['ms']}
					min={100}
					max={10000}
					step={100}
				/>
			)}
			<Toggle
				label={__('Pause on Hover', 'team-free')}
				attributes={!!pauseOnHover}
				onChange={(current) => setAttributes({ pauseOnHover: !current })}
			/>
			<Toggle
				label={__('Infinite Loop', 'team-free')}
				attributes={!!infiniteLoop}
				onChange={(current) => setAttributes({ infiniteLoop: !current })}
			/>
			<Toggle
				label={__('Adaptive Height', 'team-free')}
				attributes={!!adaptiveHeight}
				onChange={(current) => setAttributes({ adaptiveHeight: !current })}
			/>
			<Toggle
				label={__('Keyboard Navigation', 'team-free')}
				attributes={!!tabAndKeyNavigation}
				onChange={(current) => setAttributes({ tabAndKeyNavigation: !current })}
			/>
			<Toggle
				label={__('Mouse Wheel Control', 'team-free')}
				attributes={!!mouseWheelControl}
				onChange={(current) => setAttributes({ mouseWheelControl: !current })}
			/>
			<Toggle
				label={__('Free Scroll Mode', 'team-free')}
				attributes={!!freeScrollMode}
				onChange={(current) => setAttributes({ freeScrollMode: !current })}
			/>
		</>
	);
}

export function DisplaySettings({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={SettingsTab}
			CarouselTab={CarouselTab}
		/>
	);
}
