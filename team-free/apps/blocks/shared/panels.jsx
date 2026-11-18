/**
 * Shared inspector panels for every member layout block (grid, carousel, …).
 *
 * Each export is the body of one PanelBody (see ../shared/inspector.jsx),
 * matching the Figma inspector. CardDesignControls is the design picker plus
 * the per-design controls (Content Box, Image Position/Gap, Image Area) that
 * every layout block's own Display Settings panel starts with. Built from the
 * shared controls in apps/components/.
 */

import { __ } from '@wordpress/i18n';
import { moduleOffElements } from './moduleGate';
import {
	isFreeBioSource,
	isFreeCardElement,
	isFreeDetailsOpenAs,
	isFreeFilterBy,
	isFreeImageHoverEffect,
	isFreeCardHoverEffect,
	isFreeMakeClickable,
	isFreeMaskShape,
	resolveBioSource,
	resolveDetailsOpenAs,
	resolveImageHoverEffect,
	resolveMakeClickable,
	resolveMaskShape,
} from './proGate';
import { Notice, ExternalLink } from '@wordpress/components';
import { useState } from '@wordpress/element';
import {
	SPRangeControl,
	SPToggleGroupControl,
	SelectField,
	Toggle,
	SpColorPicker,
	Layouts,
	MultipleSelect,
	DragAndDropDnd,
	TabControls,
	Background,
	Border,
	BoxShadow,
	Spacing,
	Divider,
	WidthHeight,
	Popover,
	Typography,
	InputControl,
	SkillColorList,
	ProNotice,
} from '../../components';
import { BgIcon, GradientIcon } from '../../components/background/svgIcon';
import { LeftIcon, CenterIcon, RightIcon } from '../../components/icons';
import {
	PRO_NOTICE_QUERY,
	PRO_NOTICE_CARD_CONTENT,
	PRO_NOTICE_MEMBER_IMAGE,
	PRO_NOTICE_SOCIAL,
	PRO_NOTICE_MEMBER_DETAILS,
} from './proNotices';
import { CARD_DESIGN_ITEMS, HOVER_CONTENT_EXCLUDED, applyCardDesign } from './cardDesign';
import useQueryOptions from '../../hooks/useQueryOptions';
import useDetailsTemplates from '../../hooks/useDetailsTemplates';
import {
	SkillBarOne,
	SkillBarTwo,
	SkillBarThree,
	SocialStyleOne,
	SocialStyleTwo,
	SocialStyleThree,
	SocialStyleFour,
} from './icons';

// Image Masking "Choose Style" shapes (Member Image → Settings), in the Figma
// panel's order. Each cell previews the actual SVG the CSS mask uses
// (blocks/assets/images/mask/), so the picker and the render can never drift.
// Only the diamond is free (Pro_Gate::FREE_MASK_SHAPES); the rest
// render locked with a crown badge on hover.
const MASK_SHAPES = [3, 2, 8, 15, 21, 17, 18, 19, 20, 4, 5];

const blocksUrl = window.sptpBlocksEditor?.blocksUrl || '';

const MaskIcon = ({ shape, active }) => (
	<span className={`sp-smart-team-mask-icon${active ? ' active' : ''}`}>
		<img src={`${blocksUrl}assets/images/mask/${shape}.svg`} alt="" />
	</span>
);

const MASK_ITEMS = MASK_SHAPES.map((n) => {
	const shape = `mask${n}`;
	return { value: shape, icon: <MaskIcon shape={shape} />, pro: !isFreeMaskShape(shape) };
});

/* -------------------------------------------------------------------------- */
/* Card design controls — the Select Card Design picker + per-design controls */
/* (used in every layout block's Display Settings panel, after its style picker) */
/* -------------------------------------------------------------------------- */
export function CardDesignControls({ attributes, setAttributes }) {
	const {
		cardDesign,
		imagePosition,
		imageContentGap,
		imageAreaPosition,
		imageAreaGap,
		contentBoxWidth,
		contentBoxOffset,
		contentBoxAlignment,
	} = attributes;

	// Design switching swaps still-at-default controls to the new design's
	// defaults — catalogue + swap logic shared with the first-insert
	// CardDesignPicker (see cardDesign.js).
	const handleCardDesignChange = (newDesign) =>
		applyCardDesign(newDesign, attributes, setAttributes);

	return (
		<>
			<Layouts
				label={__('Select Card Design', 'team-free')}
				attributes={cardDesign}
				attributesKey="cardDesign"
				setAttributes={setAttributes}
				onChange={handleCardDesignChange}
				items={CARD_DESIGN_ITEMS}
				grid={3}
				perPage={6}
				displayActive
			/>

			{/* Content Box — card-3's overlapping white box: its width, how far it
			    climbs over the photo (Offset), and its horizontal alignment, in a
			    settings popover (same pattern as Member Image → Image Filter). */}
			{cardDesign === 'card-3' && (
				<Popover label={__('Content Box', 'team-free')}>
					<div className="sp-smart-team-content-box-popover">
						<SPRangeControl
							label={__('Width', 'team-free')}
							attributes={contentBoxWidth}
							attributesKey="contentBoxWidth"
							setAttributes={setAttributes}
							units={['%']}
							min={10}
							max={100}
							step={1}
						/>
						<SPRangeControl
							label={__('Offset', 'team-free')}
							attributes={contentBoxOffset}
							attributesKey="contentBoxOffset"
							setAttributes={setAttributes}
							units={['px']}
							min={0}
							max={200}
							step={1}
						/>
						<SPToggleGroupControl
							label={__('Alignment', 'team-free')}
							attributes={contentBoxAlignment}
							attributesKey="contentBoxAlignment"
							setAttributes={setAttributes}
							items={[
								{
									label: <LeftIcon />,
									value: 'left',
									tooltip: __('Left', 'team-free'),
								},
								{
									label: <CenterIcon />,
									value: 'center',
									tooltip: __('Center', 'team-free'),
								},
								{
									label: <RightIcon />,
									value: 'right',
									tooltip: __('Right', 'team-free'),
								},
							]}
						/>
					</div>
				</Popover>
			)}

			{/* Photo side + photo-to-text gap — the horizontal split designs:
			    card-2 (photo beside text) and card-5 (photo over the panel edge). */}
			{['card-2', 'card-5'].includes(cardDesign) && (
				<>
					<SPToggleGroupControl
						label={__('Image Position', 'team-free')}
						attributes={imagePosition || 'left'}
						attributesKey="imagePosition"
						setAttributes={setAttributes}
						items={[
							{ label: __('Left', 'team-free'), value: 'left' },
							{ label: __('Right', 'team-free'), value: 'right' },
						]}
					/>
					<SPRangeControl
						label={__('Image To Content Gap', 'team-free')}
						attributes={imageContentGap}
						attributesKey="imageContentGap"
						setAttributes={setAttributes}
						units={['px', 'em', 'rem']}
						min={0}
						max={100}
						step={1}
					/>
				</>
			)}

			{/* Image-area side + area-to-content gap — card-9's __side column
			    (photo + name/role) splits the card like card-2's photo does. */}
			{cardDesign === 'card-9' && (
				<>
					<SPToggleGroupControl
						label={__('Image Area Position', 'team-free')}
						attributes={imageAreaPosition || 'left'}
						attributesKey="imageAreaPosition"
						setAttributes={setAttributes}
						items={[
							{ label: __('Left', 'team-free'), value: 'left' },
							{ label: __('Right', 'team-free'), value: 'right' },
						]}
					/>
					<SPRangeControl
						label={__('Image Area Gap', 'team-free')}
						attributes={imageAreaGap}
						attributesKey="imageAreaGap"
						setAttributes={setAttributes}
						units={['px', 'em', 'rem']}
						min={0}
						max={100}
						step={1}
					/>
				</>
			)}
		</>
	);
}

/* -------------------------------------------------------------------------- */
/* Query Builder                                                              */
/* -------------------------------------------------------------------------- */
// Filter Members modes — only Latest is free; the rest carry the `(Pro)` tag.
const FILTER_BY_ITEMS = [
	{ label: __('Latest', 'team-free'), value: 'latest' },
	{ label: __('Taxonomies', 'team-free'), value: 'groups' },
	{ label: __('Specific', 'team-free'), value: 'specific' },
].map((item) =>
	isFreeFilterBy(item.value)
		? item
		: { ...item, label: `${item.label} (${__('Pro', 'team-free')})`, disabled: true }
);

export function QueryBuilder({ attributes, setAttributes }) {
	const { filterBy, excludesItems, limit, orderBy, order, enableRandomOrder } = attributes;

	// Taxonomies/Specific are Pro: Free always queries Latest, so it ships no
	// Select Taxonomies / Select Members pickers. A value Pro stored in
	// `selectedGroups`/`includesItems` is left untouched for re-activation.
	const { memberOptions } = useQueryOptions();

	return (
		<>
			<SelectField
				label={__('Filter Members', 'team-free')}
				attributes={filterBy}
				attributesKey="filterBy"
				setAttributes={setAttributes}
				items={FILTER_BY_ITEMS}
			/>

			<MultipleSelect
				label={__('Exclude Members', 'team-free')}
				attributes={excludesItems}
				attributesKey="excludesItems"
				setAttributes={setAttributes}
				items={memberOptions}
				reset
			/>

			<SPRangeControl
				label={__('Show Member', 'team-free')}
				attributes={limit}
				attributesKey="limit"
				setAttributes={setAttributes}
				min={1}
				max={200}
				step={1}
			/>

			<Toggle
				label={__('Random Order', 'team-free')}
				attributes={!!enableRandomOrder}
				onChange={(current) => setAttributes({ enableRandomOrder: !current })}
			/>

			{!enableRandomOrder && (
				<>
					<SelectField
						label={__('Order By', 'team-free')}
						attributes={orderBy}
						attributesKey="orderBy"
						setAttributes={setAttributes}
						items={[
							{ label: __('Date', 'team-free'), value: 'date' },
							{ label: __('Title', 'team-free'), value: 'title' },
							{ label: __('Modified', 'team-free'), value: 'modified' },
							{ label: __('Drag & Drop', 'team-free'), value: 'menu_order' },
						]}
					/>

					<SPToggleGroupControl
						label={__('Order Direction', 'team-free')}
						attributes={order}
						attributesKey="order"
						setAttributes={setAttributes}
						items={[
							{ label: __('Ascending', 'team-free'), value: 'asc' },
							{ label: __('Descending', 'team-free'), value: 'desc' },
						]}
					/>
				</>
			)}

			<ProNotice {...PRO_NOTICE_QUERY} />
		</>
	);
}

/* -------------------------------------------------------------------------- */
/* Card Elements — Settings / Style tabs                                      */
/* -------------------------------------------------------------------------- */
export function CardElements({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={CardElementsSettings}
			StyleTab={CardElementsStyle}
		/>
	);
}

// Card Content → Hover Effect options; the Pro ones are disabled "(Pro)" rows.
const CARD_HOVER_EFFECTS = [
	{ label: __('None', 'team-free'), value: 'none' },
	{ label: __('Slide Up', 'team-free'), value: 'slide-up' },
	{ label: __('Slide Down', 'team-free'), value: 'slide-down' },
	{ label: __('Slide Left', 'team-free'), value: 'slide-left' },
	{ label: __('Slide Right', 'team-free'), value: 'slide-right' },
	{ label: __('Scale Up', 'team-free'), value: 'scale-up' },
	{ label: __('Scale Down', 'team-free'), value: 'scale-down' },
].map((item) =>
	isFreeCardHoverEffect(item.value)
		? item
		: { ...item, label: `${item.label} (${__('Pro', 'team-free')})`, disabled: true }
);

/* Settings tab — the Member Information toggle list (reordering is Pro) + card behavior. */
function CardElementsSettings({ attributes, setAttributes }) {
	const {
		cardDesign,
		cardElements = [],
		readMoreButton,
		contentAlignment,
		hoverEffect,
	} = attributes;

	// Elements added after release are missing from Member Information lists
	// saved before they existed — append them (hidden) so old blocks still get
	// their toggles. The full merged list persists on the next list change.
	const LATER_ELEMENTS = [
		{ id: 'language', value: 'language', label: __('Language', 'team-free'), show: false },
		{ id: 'gender', value: 'gender', label: __('Gender', 'team-free'), show: false },
	];
	// An overlay card IS the photo — __content is a scrim layer over a full-bleed
	// image — so Photo/Image is REQUIRED there: its row shows on and its toggle is
	// locked (both renderers force it into the element list too, so a block saved
	// with it off still renders the photo). The position of the image is fixed
	// on these designs anyway (it renders image-first).
	const requiredValues =
		typeof cardDesign === 'string' && cardDesign.indexOf('overlay-') === 0 ? ['image'] : [];
	const elementsList = [
		...cardElements,
		...LATER_ELEMENTS.filter((el) => !cardElements.some((c) => c && c.value === el.value)),
	].map((el) => (el && requiredValues.includes(el.value) ? { ...el, show: true } : el));

	// Rows whose Modules-page feature is off.
	const hiddenValues = moduleOffElements();

	// Split, remembering each hidden row's position. The rows are only kept out
	// of the UI — they must be spliced back on every change, or reordering the
	// visible list would silently drop them from the saved attribute and the
	// user's choices would be gone when the module is switched back on.
	// Pro-only rows (Pro_Gate::FREE_CARD_ELEMENTS) are kept out of the free
	// list the same way and shown below it as locked "(Pro)" rows, like Real
	// Testimonials Free — spliced back unchanged so Pro's stored order and
	// toggles survive a Free save.
	const hiddenRows = [];
	const visibleList = [];
	const proList = [];
	elementsList.forEach((el, index) => {
		if (el && hiddenValues.includes(el.value)) {
			hiddenRows.push({ index, row: el });
		} else if (el && !isFreeCardElement(el.value)) {
			hiddenRows.push({ index, row: el });
			proList.push(el);
		} else {
			visibleList.push(el);
		}
	});

	const withHiddenRows = (items) => {
		const merged = [...items];
		// Ascending order, so each splice lands at its original index.
		hiddenRows.forEach(({ index, row }) => {
			merged.splice(Math.min(index, merged.length), 0, row);
		});
		return merged;
	};

	// `key` forces DragAndDropDnd to re-seed its internal state when the stored
	// list changes (it snapshots `items` once on mount).
	const listKey = visibleList.map((c) => `${c.id}:${c.show ? 1 : 0}`).join('|');

	return (
		<>
			<DragAndDropDnd
				key={listKey}
				label={__('Member Information', 'team-free')}
				items={visibleList}
				toggleBtn
				lockedValues={requiredValues}
				proItems={proList}
				onChange={(items) => setAttributes({ cardElements: withHiddenRows(items) })}
			/>

			{/* Read More Button is Pro-only in its entirety — the control stays
			    visible (locked) so Free users can see the feature exists
			    (Pro_Gate::read_more_button always renders it off). */}
			<Toggle
				label={__('Read More Button', 'team-free')}
				attributes={!!readMoreButton}
				onChange={(current) => setAttributes({ readMoreButton: !current })}
				isPro
			/>

			{/* Hover Content is Pro-only in its entirety — a locked, empty select
			    that never writes `hoverContent`; Free has no reveal markup, CSS
			    or runtime. Not shown on the split/side-column designs, like Pro. */}
			{!HOVER_CONTENT_EXCLUDED.includes(cardDesign) && (
				<MultipleSelect label={__('Hover Content', 'team-free')} isPro />
			)}

			{/* Only None is free — the six effects are disabled "(Pro)" options
			    with no CSS in Free; a Pro-saved effect shows (and renders) as None. */}
			<SelectField
				label={__('Hover Effect', 'team-free')}
				attributes={isFreeCardHoverEffect(hoverEffect) ? hoverEffect : 'none'}
				attributesKey="hoverEffect"
				setAttributes={setAttributes}
				items={CARD_HOVER_EFFECTS}
			/>

			<SPToggleGroupControl
				label={__('Alignment', 'team-free')}
				attributes={contentAlignment}
				attributesKey="contentAlignment"
				setAttributes={setAttributes}
				items={[
					{ label: <LeftIcon />, value: 'left', tooltip: __('Left', 'team-free') },
					{ label: <CenterIcon />, value: 'center', tooltip: __('Center', 'team-free') },
					{ label: <RightIcon />, value: 'right', tooltip: __('Right', 'team-free') },
				]}
			/>

			<ProNotice {...PRO_NOTICE_CARD_CONTENT} />
		</>
	);
}

/* Style tab — the card box (Normal/Hover): background, border, radius, shadow, padding. */
function CardElementsStyle({ attributes, setAttributes }) {
	const {
		cardDesign,
		cardBg,
		cardBorder,
		cardBorderHover,
		cardBorderWidth,
		cardBorderWidthHover,
		cardBorderRadius,
		cardBoxShadow,
		cardBoxShadowHover,
		cardPadding,
	} = attributes;

	// Overlay cards have no box shadow — the "card" is a full-bleed photo, so
	// there is no box to cast one. The Normal/Hover state toggle DOES apply, but
	// on these designs it scopes the BACKGROUND ONLY (the scrim — both
	// dynamic-CSS twins already emit `cardBg.hover` on `__content:hover`): the
	// border is the same in both states, so it stays on the normal attributes.
	const isOverlay = typeof cardDesign === 'string' && cardDesign.indexOf('overlay-') === 0;

	const [openState, setOpenState] = useState('normal');
	const isHover = openState === 'hover';
	const colorType = isHover ? 'hover' : 'color';
	const boxShadow = isHover ? cardBoxShadowHover : cardBoxShadow;
	const boxShadowKey = isHover ? 'cardBoxShadowHover' : 'cardBoxShadow';
	const borderState = isOverlay ? 'normal' : openState;
	const borderIsHover = borderState === 'hover';
	const border = borderIsHover ? cardBorderHover : cardBorder;
	const borderWidth = borderIsHover ? cardBorderWidthHover : cardBorderWidth;
	const borderKey = borderIsHover ? 'cardBorderHover' : 'cardBorder';
	const borderWidthKey = borderIsHover ? 'cardBorderWidthHover' : 'cardBorderWidth';

	return (
		<>
			<SPToggleGroupControl
				attributes={openState}
				onClick={(value) => setOpenState(value)}
				items={[
					{ label: __('Normal', 'team-free'), value: 'normal' },
					{ label: __('Hover', 'team-free'), value: 'hover' },
				]}
			/>

			{/* Normal and Hover are independent — editing one never touches the
			    other (as in Smart Team Pro). On overlay this Background paints the scrim (the dynamic CSS
			    retargets it to __content), but it keeps the standard Background
			    Type / Background Color labels — it is the same control doing the
			    same thing, and "Overlay" read as a separate feature. */}
			<Background
				label={__('Background Type', 'team-free')}
				attributes={cardBg || {}}
				attributesKey="cardBg"
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
				attributes={{ border: border || {}, borderWidth: borderWidth || {} }}
				attributesKey={{ border: borderKey, borderWidth: borderWidthKey }}
				setAttributes={setAttributes}
				units={['px', 'em']}
				btnType="color"
				parentState={borderState}
			/>

			<Spacing
				label={__('Border Radius', 'team-free')}
				attributes={cardBorderRadius || {}}
				attributesKey="cardBorderRadius"
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
			/>

			{!isOverlay && (
				<>
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
				</>
			)}

			<Divider position="sp-w-100pct bottom" />

			<Spacing
				label={__('Padding', 'team-free')}
				attributes={cardPadding || {}}
				attributesKey="cardPadding"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
			/>
		</>
	);
}

/* -------------------------------------------------------------------------- */
/* Member Image — Settings / Style tabs                                       */
/* -------------------------------------------------------------------------- */
export function MemberImage({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={MemberImageSettings}
			StyleTab={MemberImageStyle}
		/>
	);
}

/* Settings tab — resolution, aspect ratio, size and image toggles. */
function MemberImageSettings({ attributes, setAttributes }) {
	const {
		cardDesign,
		imageResolution,
		imageAspectRatio,
		imageSize,
		imageMasking,
		imageMaskShape,
		imageRetina,
	} = attributes;

	// Overlay cards have no image Width/Height: the photo is absolutely positioned
	// to FILL the card (inset: 0) and the CARD is what Aspect Ratio sizes, so a
	// width would win over the right inset and leave the photo short of the edge.
	// Both dynamic-CSS twins skip the avatar size for these designs too, so an
	// older saved value stays inert.
	// Like WP Carousel Pro, Width/Height only show for the Custom ratio.
	const isOverlay = typeof cardDesign === 'string' && cardDesign.indexOf('overlay-') === 0;

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
					{ label: __('Wide - 16:9', 'team-free'), value: '16-9' },
					{ label: __('Tall - 9:16', 'team-free'), value: '9-16' },
					...(isOverlay ? [] : [{ label: __('Custom', 'team-free'), value: 'custom' }]),
				]}
			/>

			{!isOverlay && imageAspectRatio === 'custom' && (
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
				label={__('Load 2x for Retina Display', 'team-free')}
				attributes={!!imageRetina}
				onChange={(current) => setAttributes({ imageRetina: !current })}
			/>

			<Toggle
				label={__('Image Masking', 'team-free')}
				attributes={!!imageMasking}
				onChange={(current) => setAttributes({ imageMasking: !current })}
			/>
			{imageMasking && (
				<div className="sp-smart-team-mask-picker">
					<Layouts
						label={__('Choose Style', 'team-free')}
						attributes={resolveMaskShape(imageMaskShape)}
						attributesKey="imageMaskShape"
						setAttributes={setAttributes}
						items={MASK_ITEMS}
						grid={5}
					/>
				</div>
			)}

			{/* Image Flip, Lazy Loading and Special Tag are Pro: locked off, never
			    written — a Pro-saved `true` (and the Special Tag style/position
			    children) is left as is. Figma node 728:206029. */}
			<Toggle label={__('Image Flip', 'team-free')} attributes={false} isPro />
			<Toggle label={__('Lazy Loading', 'team-free')} attributes={false} isPro />
			<Toggle label={__('Special Tag', 'team-free')} attributes={false} isPro />

			<ProNotice {...PRO_NOTICE_MEMBER_IMAGE} />
		</>
	);
}

// Member Image → Hover Effects. Only None / Zoom In / Zoom Out are free
// (Pro_Gate::FREE_IMAGE_HOVER_EFFECTS); the rest are disabled options with a
// "(Pro)" suffix, like the Carousel Slide Effect select.
const IMAGE_HOVER_EFFECTS = [
	{ label: __('None', 'team-free'), value: 'none' },
	{ label: __('Zoom In', 'team-free'), value: 'zoom-in' },
	{ label: __('Zoom Out', 'team-free'), value: 'zoom-out' },
	{ label: __('Move Left', 'team-free'), value: 'move-left' },
	{ label: __('Move Right', 'team-free'), value: 'move-right' },
	{ label: __('Move Top', 'team-free'), value: 'move-top' },
	{ label: __('Move Bottom', 'team-free'), value: 'move-bottom' },
	{ label: __('Rotate', 'team-free'), value: 'rotate' },
	{ label: __('Grow Rotate', 'team-free'), value: 'grow-rotate' },
	{ label: __('Shine', 'team-free'), value: 'shine' },
	{ label: __('Circle Shine', 'team-free'), value: 'circle-shine' },
].map((item) =>
	isFreeImageHoverEffect(item.value)
		? item
		: { ...item, label: `${item.label} (${__('Pro', 'team-free')})`, disabled: true }
);

/* Style tab — hover effect, Image Filter (Pro), radius, margin. */
function MemberImageStyle({ attributes, setAttributes }) {
	const { cardDesign, imageHoverEffect, imageBorderRadius, imageMargin } = attributes;

	// Overlay cards have no image Margin: the photo is absolutely positioned to
	// FILL the card (inset: 0), so a margin only shrinks the full-bleed photo and
	// re-opens the gap the bottom panel sits over. Both dynamic-CSS twins skip
	// the rule for overlay designs too, so an older saved value stays inert.
	const isOverlay = typeof cardDesign === 'string' && cardDesign.indexOf('overlay-') === 0;
	const isMasked = !isOverlay && !!attributes.imageMasking;

	return (
		<>
			<SelectField
				label={__('Hover Effects', 'team-free')}
				attributes={resolveImageHoverEffect(imageHoverEffect)}
				attributesKey="imageHoverEffect"
				setAttributes={setAttributes}
				items={IMAGE_HOVER_EFFECTS}
			/>

			{/* Image Filter is Pro — a locked row (Figma node 678:280583); Free
			    ships no filter controls or filter CSS. */}
			<Popover label={__('Image Filter', 'team-free')} isPro />

			<Divider position="sp-w-100pct bottom" />

			{/* The mask shape IS the outline — a radius would clip its edges. */}
			{!isMasked && (
				<Spacing
					label={__('Border Radius', 'team-free')}
					attributes={imageBorderRadius || {}}
					attributesKey="imageBorderRadius"
					setAttributes={setAttributes}
					units={['px', '%', 'em']}
					responsive={false}
					indicator="radius"
					max={100}
				/>
			)}

			{!isOverlay && (
				<Spacing
					label={__('Margin', 'team-free')}
					attributes={imageMargin || {}}
					attributesKey="imageMargin"
					setAttributes={setAttributes}
					units={['px', 'em', 'rem']}
					indicator=""
				/>
			)}
		</>
	);
}

// Basic Information → Bio Source. Short Bio / Full Description are free
// (Pro_Gate::FREE_BIO_SOURCES); Auto Fallback carries the `(Pro)` tag.
const BIO_SOURCE_ITEMS = [
	{ label: __('Short Bio', 'team-free'), value: 'short' },
	{ label: __('Full Description', 'team-free'), value: 'full' },
	{ label: __('Auto Fallback', 'team-free'), value: 'auto' },
].map((item) =>
	isFreeBioSource(item.value)
		? item
		: { ...item, label: `${item.label} (${__('Pro', 'team-free')})`, disabled: true }
);

/* -------------------------------------------------------------------------- */
/* Basic Information — Settings / Style tabs                                  */
/* -------------------------------------------------------------------------- */
export function BasicInformation({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={BasicInfoSettings}
			StyleTab={BasicInfoStyle}
		/>
	);
}

/* Settings tab — name tag, bio source, display style. Auto Fallback and the
 * Limited display style (Length / Ellipsis Points / Make Ellipsis Clickable)
 * are Pro — Free ships no controls or truncation for them. */
function BasicInfoSettings({ attributes, setAttributes }) {
	const { nameHtmlTag, bioSource } = attributes;

	return (
		<>
			<SPToggleGroupControl
				label={__('Name HTML Tag', 'team-free')}
				attributes={nameHtmlTag}
				attributesKey="nameHtmlTag"
				setAttributes={setAttributes}
				items={[
					{ label: 'H1', value: 'h1' },
					{ label: 'H2', value: 'h2' },
					{ label: 'H3', value: 'h3' },
					{ label: 'H4', value: 'h4' },
					{ label: 'H5', value: 'h5' },
					{ label: 'H6', value: 'h6' },
				]}
			/>

			<SelectField
				label={__('Bio Source', 'team-free')}
				attributes={resolveBioSource(bioSource)}
				attributesKey="bioSource"
				setAttributes={setAttributes}
				items={BIO_SOURCE_ITEMS}
			/>

			{/* Free always renders the full bio — Limited is shown locked. The
			    stored `bioDisplayStyle` (default 'limited') is left as-is. */}
			<SPToggleGroupControl
				label={__('Display Style', 'team-free')}
				attributes="full"
				attributesKey="bioDisplayStyle"
				setAttributes={setAttributes}
				items={[
					{ label: __('Full', 'team-free'), value: 'full' },
					{ label: __('Limited', 'team-free'), value: 'limited', pro: true },
				]}
			/>
		</>
	);
}

/* Style tab — per-element typography, color and margin. card-8 additionally
 * exposes the caption chips' background + padding (white name box / tinted
 * role chip on the photo). */
function BasicInfoStyle({ attributes, setAttributes }) {
	const {
		cardDesign,
		nameColor,
		nameColorHover,
		nameBgColor,
		nameBgColorHover,
		roleColor,
		roleBgColor,
		bioColor,
	} = attributes;
	const [nameState, setNameState] = useState('normal');
	const isNameHover = nameState === 'hover';
	const isCard8 = cardDesign === 'card-8';

	const typoProps = (prefix) => ({
		family: attributes[`${prefix}Typography`],
		familyKey: `${prefix}Typography`,
		fontSize: attributes[`${prefix}FontSize`],
		fontSizeKey: `${prefix}FontSize`,
		lineHeight: attributes[`${prefix}LineHeight`],
		lineHeightKey: `${prefix}LineHeight`,
		fontSpacing: attributes[`${prefix}LetterSpacing`],
		fontSpacingKey: `${prefix}LetterSpacing`,
		wordSpacing: attributes[`${prefix}WordSpacing`],
		wordSpacingKey: `${prefix}WordSpacing`,
		globalTypo: attributes[`${prefix}GlobalTypo`],
		globalTypoKey: `${prefix}GlobalTypo`,
	});

	const marginProps = (key) => ({
		label: __('Margin', 'team-free'),
		attributes: attributes[key] || {},
		attributesKey: key,
		setAttributes,
		units: ['px', 'em', 'rem'],
		min: 0,
		max: 300,
		indicator: '',
	});

	return (
		<>
			{/* Member Name */}
			<p className="sp-smart-team-style-section-title">{__('Member Name', 'team-free')}</p>
			<Typography
				attributes={typoProps('name')}
				setAttributes={setAttributes}
				fontSizeDefault={{ unit: 'px', value: 20 }}
			/>
			<SPToggleGroupControl
				attributes={nameState}
				onClick={(value) => setNameState(value)}
				items={[
					{ label: __('Normal', 'team-free'), value: 'normal' },
					{ label: __('Hover', 'team-free'), value: 'hover' },
				]}
			/>
			{/* Normal and Hover are independent — editing one never touches the other. */}
			<SpColorPicker
				label={__('Color', 'team-free')}
				value={(isNameHover ? nameColorHover : nameColor) || ''}
				attributesKey={isNameHover ? 'nameColorHover' : 'nameColor'}
				setAttributes={setAttributes}
			/>
			{isCard8 && (
				<>
					<SpColorPicker
						label={__('Background Color', 'team-free')}
						value={(isNameHover ? nameBgColorHover : nameBgColor) || ''}
						attributesKey={isNameHover ? 'nameBgColorHover' : 'nameBgColor'}
						setAttributes={setAttributes}
					/>
					<Spacing
						label={__('Padding', 'team-free')}
						attributes={attributes.namePadding || {}}
						attributesKey="namePadding"
						setAttributes={setAttributes}
						units={['px', 'em', 'rem']}
						indicator=""
						defaultValue={{ top: '', right: '', bottom: '', left: '' }}
					/>
				</>
			)}
			<Spacing {...marginProps('nameMargin')} />

			<Divider position="sp-w-100pct bottom" />

			{/* Position / Job Title */}
			<p className="sp-smart-team-style-section-title">
				{__('Position/Job Title', 'team-free')}
			</p>
			<Typography
				attributes={typoProps('role')}
				setAttributes={setAttributes}
				fontSizeDefault={{ unit: 'px', value: 16 }}
			/>
			<SpColorPicker
				label={__('Color', 'team-free')}
				value={roleColor || ''}
				attributesKey="roleColor"
				setAttributes={setAttributes}
			/>
			{isCard8 && (
				<>
					<SpColorPicker
						label={__('Background Color', 'team-free')}
						value={roleBgColor || ''}
						attributesKey="roleBgColor"
						setAttributes={setAttributes}
					/>
					<Spacing
						label={__('Padding', 'team-free')}
						attributes={attributes.rolePadding || {}}
						attributesKey="rolePadding"
						setAttributes={setAttributes}
						units={['px', 'em', 'rem']}
						indicator=""
						defaultValue={{ top: '', right: '', bottom: '', left: '' }}
					/>
				</>
			)}
			<Spacing {...marginProps('roleMargin')} />

			<Divider position="sp-w-100pct bottom" />

			{/* Short Bio */}
			<p className="sp-smart-team-style-section-title">{__('Short Bio', 'team-free')}</p>
			<Typography
				attributes={typoProps('bio')}
				setAttributes={setAttributes}
				fontSizeDefault={{ unit: 'px', value: 16 }}
			/>
			<SpColorPicker
				label={__('Color', 'team-free')}
				value={bioColor || ''}
				attributesKey="bioColor"
				setAttributes={setAttributes}
			/>
			<Spacing {...marginProps('bioMargin')} />
		</>
	);
}

/* -------------------------------------------------------------------------- */
/* Skills — Settings / Style tabs                                             */
/* -------------------------------------------------------------------------- */
export function Skills({ attributes, setAttributes, showMargin = true, showAlignment = false }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			// Alignment is standalone-only: inside a card the
			// chip row already follows the card's Content Alignment, so a second
			// control there would fight it. Module-level components, like the
			// showMargin pair below.
			Settings={showAlignment ? SkillsSettingsWithAlignment : SkillsSettings}
			// A standalone caller passes showMargin={false} — its wrapper spacing
			// is Advanced Settings → General. Inside a card
			// there is no such tab, so the layout blocks keep the control.
			// Module-level components (not inline arrows) so switching the flag
			// never remounts the tab and closes an open Typography popover.
			StyleTab={showMargin ? SkillsStyle : SkillsStyleNoMargin}
		/>
	);
}

/* Settings tab — display style, progress-bar variant, height, % visibility, gap
 * (plus Alignment on the standalone block — see the Skills() comment). */
function SkillsSettings({ attributes, setAttributes, showAlignment = false }) {
	const {
		skillsDisplayStyle,
		skillsProgressBarStyle,
		skillsBarHeight,
		skillsPercentVisibility,
		skillsItemGap,
		skillsAlignment,
	} = attributes;
	const isProgress = skillsDisplayStyle === 'progress';

	// Default bar height per style — style-3 (label inside the bar) needs a taller
	// bar than the thin style-1/2 bars. The Height slider still overrides this.
	const barHeightDefault = { 'style-1': 8, 'style-2': 8, 'style-3': 24 };
	const currentBarHeightDefault = barHeightDefault[skillsProgressBarStyle] ?? 8;

	// Switching bar style swaps the height to the new style's default, but only
	// when it's still the previous style's default — so a custom height is kept.
	const handleBarStyleChange = (newStyle) => {
		const oldDefault = barHeightDefault[skillsProgressBarStyle] ?? 8;
		const newDefault = barHeightDefault[newStyle] ?? 8;
		if (newDefault !== oldDefault && Number(skillsBarHeight?.device?.Desktop) === oldDefault) {
			setAttributes({
				skillsBarHeight: {
					device: { Desktop: newDefault, Tablet: newDefault, Mobile: newDefault },
					unit: { Desktop: 'px', Tablet: 'px', Mobile: 'px' },
				},
			});
		}
	};

	return (
		<>
			<SPToggleGroupControl
				label={__('Skills Display Style', 'team-free')}
				attributes={skillsDisplayStyle}
				attributesKey="skillsDisplayStyle"
				setAttributes={setAttributes}
				items={[
					{ label: __('Progress Bar', 'team-free'), value: 'progress' },
					{ label: __('Button', 'team-free'), value: 'button' },
				]}
			/>

			{isProgress && (
				<>
					<Layouts
						label={__('Select Progress Bar Style', 'team-free')}
						attributes={skillsProgressBarStyle}
						attributesKey="skillsProgressBarStyle"
						setAttributes={setAttributes}
						onChange={handleBarStyleChange}
						items={[
							{ value: 'style-1', icon: <SkillBarOne /> },
							{ value: 'style-2', icon: <SkillBarTwo /> },
							{ value: 'style-3', icon: <SkillBarThree /> },
						]}
						grid={1}
						displayActive
					/>

					<SPRangeControl
						label={__('Height', 'team-free')}
						attributes={skillsBarHeight}
						attributesKey="skillsBarHeight"
						setAttributes={setAttributes}
						units={['px', 'em', 'rem']}
						defaultValue={{ value: currentBarHeightDefault, unit: 'px' }}
						min={0}
						max={100}
						step={1}
					/>

					<SelectField
						label={__('Visible Percentage Text', 'team-free')}
						attributes={skillsPercentVisibility}
						attributesKey="skillsPercentVisibility"
						setAttributes={setAttributes}
						items={[
							{ label: __('Always', 'team-free'), value: 'always' },
							{ label: __('On Hover', 'team-free'), value: 'hover' },
							{ label: __('Hide', 'team-free'), value: 'hide' },
						]}
					/>
				</>
			)}

			<SPRangeControl
				label={__('Gap Between Items', 'team-free')}
				attributes={skillsItemGap}
				attributesKey="skillsItemGap"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				min={0}
				max={100}
				step={1}
			/>

			{/* Button display only: the chips are a wrapping flex ROW, so this is
			    `justify-content`. The progress bars are a column flex filling the
			    block width — there is nothing to align there. */}
			{showAlignment && !isProgress && (
				<SPToggleGroupControl
					label={__('Alignment', 'team-free')}
					attributes={skillsAlignment}
					attributesKey="skillsAlignment"
					setAttributes={setAttributes}
					items={[
						{ label: <LeftIcon />, value: 'left', tooltip: __('Left', 'team-free') },
						{
							label: <CenterIcon />,
							value: 'center',
							tooltip: __('Center', 'team-free'),
						},
						{ label: <RightIcon />, value: 'right', tooltip: __('Right', 'team-free') },
					]}
				/>
			)}
		</>
	);
}

// Alignment-bearing variant — see the Skills() comment above.
function SkillsSettingsWithAlignment(props) {
	return <SkillsSettings {...props} showAlignment />;
}

/* Style tab — dispatches to the progress-bar or button (chip) style controls. */
function SkillsStyle({ attributes, setAttributes, showMargin = true }) {
	return attributes.skillsDisplayStyle === 'button' ? (
		<SkillsButtonStyle
			attributes={attributes}
			setAttributes={setAttributes}
			showMargin={showMargin}
		/>
	) : (
		<SkillsProgressStyle
			attributes={attributes}
			setAttributes={setAttributes}
			showMargin={showMargin}
		/>
	);
}

// Margin-less variant — see the Skills() comment above.
function SkillsStyleNoMargin(props) {
	return <SkillsStyle {...props} showMargin={false} />;
}

/* Progress-bar style — multi-color toggle, bar/label/tooltip colors, radius, margin. */
function SkillsProgressStyle({ attributes, setAttributes, showMargin = true }) {
	const {
		skillsProgressBarStyle,
		skillMultiColor,
		skillBarColors,
		skillBarFillColor,
		skillBarTrackColor,
		skillLabelColor,
		skillPercentColor,
		skillTooltipBgColor,
		skillBarRadius,
		skillMargin,
	} = attributes;

	const typoProps = {
		family: attributes.skillLabelTypography,
		familyKey: 'skillLabelTypography',
		fontSize: attributes.skillLabelFontSize,
		fontSizeKey: 'skillLabelFontSize',
		lineHeight: attributes.skillLabelLineHeight,
		lineHeightKey: 'skillLabelLineHeight',
		fontSpacing: attributes.skillLabelLetterSpacing,
		fontSpacingKey: 'skillLabelLetterSpacing',
		wordSpacing: attributes.skillLabelWordSpacing,
		wordSpacingKey: 'skillLabelWordSpacing',
		globalTypo: attributes.skillLabelGlobalTypo,
		globalTypoKey: 'skillLabelGlobalTypo',
	};

	return (
		<>
			<Toggle
				label={__('Multi Color Skill Bar', 'team-free')}
				attributes={!!skillMultiColor}
				onChange={(current) => setAttributes({ skillMultiColor: !current })}
			/>
			{/* Per-skill color pairs (Figma) — pair N colors the Nth bar; the
			    common pickers below stay as the fallback for every bar without
			    a pair of its own. */}
			{skillMultiColor && (
				<SkillColorList
					colors={Array.isArray(skillBarColors) ? skillBarColors : []}
					onChange={(next) => setAttributes({ skillBarColors: next })}
				/>
			)}
			<SpColorPicker
				label={__('Progress Bar Active Color', 'team-free')}
				value={skillBarFillColor || ''}
				attributesKey="skillBarFillColor"
				setAttributes={setAttributes}
			/>
			<SpColorPicker
				label={__('Progress Bar Base Color', 'team-free')}
				value={skillBarTrackColor || ''}
				attributesKey="skillBarTrackColor"
				setAttributes={setAttributes}
			/>
			<Typography
				attributes={typoProps}
				setAttributes={setAttributes}
				typographyLabel={__('Label Typography', 'team-free')}
				fontSizeDefault={{ unit: 'px', value: 14 }}
			/>
			<SpColorPicker
				label={__('Label Color', 'team-free')}
				value={skillLabelColor || ''}
				attributesKey="skillLabelColor"
				setAttributes={setAttributes}
			/>
			<SpColorPicker
				label={__('Percentage Text Color', 'team-free')}
				value={skillPercentColor || ''}
				attributesKey="skillPercentColor"
				setAttributes={setAttributes}
			/>
			{/* The tooltip bubble only exists on bar style-1 — hide the control
			    on styles 2/3 (the dynamic CSS already only targets style-1). */}
			{(skillsProgressBarStyle || 'style-1') === 'style-1' && (
				<SpColorPicker
					label={__('Tooltip Background Color', 'team-free')}
					value={skillTooltipBgColor || ''}
					attributesKey="skillTooltipBgColor"
					setAttributes={setAttributes}
				/>
			)}
			<Spacing
				label={__('Progress Bar Radius', 'team-free')}
				attributes={skillBarRadius || {}}
				attributesKey="skillBarRadius"
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
			/>
			{showMargin && (
				<Spacing
					label={__('Margin', 'team-free')}
					attributes={skillMargin || {}}
					attributesKey="skillMargin"
					setAttributes={setAttributes}
					units={['px', 'em', 'rem']}
					indicator=""
					defaultValue={{ top: 0, right: 0, bottom: 0, left: 0 }}
				/>
			)}
		</>
	);
}

/* Button (chip) style — typography, text/background color, border, radius, spacing. */
function SkillsButtonStyle({ attributes, setAttributes, showMargin = true }) {
	const { skillButtonColor, skillButtonBg, skillButtonBorder, skillButtonBorderWidth } =
		attributes;

	const typoProps = {
		family: attributes.skillButtonTypography,
		familyKey: 'skillButtonTypography',
		fontSize: attributes.skillButtonFontSize,
		fontSizeKey: 'skillButtonFontSize',
		lineHeight: attributes.skillButtonLineHeight,
		lineHeightKey: 'skillButtonLineHeight',
		fontSpacing: attributes.skillButtonLetterSpacing,
		fontSpacingKey: 'skillButtonLetterSpacing',
		wordSpacing: attributes.skillButtonWordSpacing,
		wordSpacingKey: 'skillButtonWordSpacing',
		globalTypo: attributes.skillButtonGlobalTypo,
		globalTypoKey: 'skillButtonGlobalTypo',
	};

	return (
		<>
			<Typography
				attributes={typoProps}
				setAttributes={setAttributes}
				fontSizeDefault={{ unit: 'px', value: 14 }}
			/>
			<SpColorPicker
				label={__('Color', 'team-free')}
				value={skillButtonColor || ''}
				attributesKey="skillButtonColor"
				setAttributes={setAttributes}
			/>
			<SpColorPicker
				label={__('Background Color', 'team-free')}
				value={skillButtonBg || ''}
				attributesKey="skillButtonBg"
				setAttributes={setAttributes}
			/>
			<Border
				label={__('Border', 'team-free')}
				attributes={{
					border: skillButtonBorder || {},
					borderWidth: skillButtonBorderWidth || {},
				}}
				attributesKey={{
					border: 'skillButtonBorder',
					borderWidth: 'skillButtonBorderWidth',
				}}
				setAttributes={setAttributes}
				units={['px', 'em']}
				btnType="color"
			/>
			<Spacing
				label={__('Border Radius', 'team-free')}
				attributes={attributes.skillButtonRadius || {}}
				attributesKey="skillButtonRadius"
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
			<Spacing
				label={__('Padding', 'team-free')}
				attributes={attributes.skillButtonPadding || {}}
				attributesKey="skillButtonPadding"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>
			{showMargin && (
				<Spacing
					label={__('Margin', 'team-free')}
					attributes={attributes.skillButtonMargin || {}}
					attributesKey="skillButtonMargin"
					setAttributes={setAttributes}
					units={['px', 'em', 'rem']}
					indicator=""
					defaultValue={{ top: '', right: '', bottom: '', left: '' }}
				/>
			)}
		</>
	);
}

/* -------------------------------------------------------------------------- */
/* Social Profiles                                                            */
/* -------------------------------------------------------------------------- */
export function SocialProfiles({
	attributes,
	setAttributes,
	showMargin = true,
	showAlignment = false,
}) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			// showAlignment adds the standalone block's Alignment control (a card's
			// icon row follows the card's Content Alignment instead).
			Settings={showAlignment ? SocialSettingsWithAlignment : SocialSettings}
			// Same split as Skills above: the standalone sptp/social-profile block
			// passes showMargin={false} (its wrapper spacing is Advanced Settings →
			// General), while a card's social element has no such tab and keeps
			// socialMargin. Module-level components so the flag never remounts the
			// tab and drops its Normal/Hover state.
			StyleTab={showMargin ? SocialStyle : SocialStyleNoMargin}
		/>
	);
}

/* Settings tab — icon style picker plus icon/area sizing and item gap. For
 * card-6 the icons live in the on-photo flyout, so its corner (Icon Position)
 * and inset (Offset) lead the tab. `showAlignment` adds the standalone block's
 * Alignment control at the end. */
function SocialSettings({ attributes, setAttributes, showAlignment = false }) {
	const {
		cardDesign,
		socialIconPosition,
		socialIconOffset,
		socialIconStyle,
		socialIconSize,
		socialIconAreaSize,
		socialItemGap,
		socialAlignment,
	} = attributes;

	return (
		<>
			{(cardDesign === 'card-6' || cardDesign === 'card-8') && (
				<>
					<SelectField
						label={__('Icon Position', 'team-free')}
						attributes={socialIconPosition}
						attributesKey="socialIconPosition"
						setAttributes={setAttributes}
						items={[
							{ label: __('Top Left', 'team-free'), value: 'top-left' },
							{ label: __('Top Right', 'team-free'), value: 'top-right' },
							{ label: __('Bottom Left', 'team-free'), value: 'bottom-left' },
							{ label: __('Bottom Right', 'team-free'), value: 'bottom-right' },
						]}
					/>

					<SPRangeControl
						label={__('Offset', 'team-free')}
						attributes={socialIconOffset}
						attributesKey="socialIconOffset"
						setAttributes={setAttributes}
						units={['px']}
						min={0}
						max={100}
						step={1}
					/>
				</>
			)}

			<Layouts
				label={__('Icon Style', 'team-free')}
				attributes={socialIconStyle}
				attributesKey="socialIconStyle"
				setAttributes={setAttributes}
				items={[
					{ value: 'style-1', icon: <SocialStyleOne /> },
					{ value: 'style-2', icon: <SocialStyleTwo /> },
					{ value: 'style-3', icon: <SocialStyleThree /> },
					{ value: 'style-4', icon: <SocialStyleFour /> },
				]}
				grid={4}
				displayActive
			/>

			<SPRangeControl
				label={__('Icon Size', 'team-free')}
				attributes={socialIconSize}
				attributesKey="socialIconSize"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				min={0}
				max={100}
				step={1}
			/>

			<SPRangeControl
				label={__('Icon Area Size', 'team-free')}
				attributes={socialIconAreaSize}
				attributesKey="socialIconAreaSize"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				min={0}
				max={100}
				step={1}
			/>

			<SPRangeControl
				label={__('Gap Between Items', 'team-free')}
				attributes={socialItemGap}
				attributesKey="socialItemGap"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				min={0}
				max={100}
				step={1}
			/>

			{/* Standalone sptp/social-profile only — inside a card the icon row
			    follows the card's Content Alignment, so this would fight it. */}
			{showAlignment && (
				<SPToggleGroupControl
					label={__('Alignment', 'team-free')}
					attributes={socialAlignment}
					attributesKey="socialAlignment"
					setAttributes={setAttributes}
					items={[
						{ label: <LeftIcon />, value: 'left', tooltip: __('Left', 'team-free') },
						{
							label: <CenterIcon />,
							value: 'center',
							tooltip: __('Center', 'team-free'),
						},
						{ label: <RightIcon />, value: 'right', tooltip: __('Right', 'team-free') },
					]}
				/>
			)}

			{/* Style → Custom Styling is Pro (Figma: Smart Team / Pro notes,
			    node 814:14767). */}
			<ProNotice {...PRO_NOTICE_SOCIAL} />
		</>
	);
}

// Alignment-bearing variant — see the SocialProfiles() comment above.
function SocialSettingsWithAlignment(props) {
	return <SocialSettings {...props} showAlignment />;
}

/* Style tab — Border Radius (+ Margin on the card's social element). Custom
 * Styling (per-state color / background / border / box-shadow) is Pro: Free
 * shows its toggle locked (always off, never writes) with no controls and no
 * CSS behind it — the socialCustomStyling / socialIconColor… attributes stay
 * registered and stored untouched. */
function SocialStyle({ attributes, setAttributes, showMargin = true }) {
	const { socialBorderRadius, socialMargin } = attributes;

	return (
		<>
			<Toggle label={__('Custom Styling', 'team-free')} attributes={false} isPro />

			<Spacing
				label={__('Border Radius', 'team-free')}
				attributes={socialBorderRadius || {}}
				attributesKey="socialBorderRadius"
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
				defaultValue={{ top: '', right: '', bottom: '', left: '' }}
			/>

			{showMargin && (
				<Spacing
					label={__('Margin', 'team-free')}
					attributes={socialMargin || {}}
					attributesKey="socialMargin"
					setAttributes={setAttributes}
					units={['px', 'em', 'rem']}
					max={300}
					indicator=""
				/>
			)}
		</>
	);
}

// Margin-less variant — see the SocialProfiles() comment above.
function SocialStyleNoMargin(props) {
	return <SocialStyle {...props} showMargin={false} />;
}

/* -------------------------------------------------------------------------- */
/* Read More — Settings / Style tabs                                          */
/* -------------------------------------------------------------------------- */
export function ReadMore({ attributes, setAttributes }) {
	return (
		<TabControls
			attributes={attributes}
			setAttributes={setAttributes}
			Settings={ReadMoreSettings}
			StyleTab={ReadMoreStyle}
		/>
	);
}

/* Settings tab — Show Icon toggle, the Choose Icon picker, icon size + label gap. */
function ReadMoreSettings({ attributes, setAttributes }) {
	const { readMoreLabel } = attributes;

	return (
		<>
			<InputControl
				label={__('Button Label', 'team-free')}
				attributes={readMoreLabel}
				attributesKey="readMoreLabel"
				setAttributes={setAttributes}
				placeholder={__('Read More', 'team-free')}
				flex={false}
				inputType="text"
			/>
		</>
	);
}

/* Style tab — Normal/Hover: text color, background, border, shadow + spacing. */
function ReadMoreStyle({ attributes, setAttributes }) {
	const {
		readMoreColor,
		readMoreColorHover,
		readMoreBg,
		readMoreBorder,
		readMoreBorderHover,
		readMoreBorderWidth,
		readMoreBorderWidthHover,
		readMoreBoxShadow,
		readMoreBoxShadowHover,
	} = attributes;
	const [state, setState] = useState('normal');
	const isHover = state === 'hover';
	const colorType = isHover ? 'hover' : 'color';
	const boxShadow = isHover ? readMoreBoxShadowHover : readMoreBoxShadow;
	const boxShadowKey = isHover ? 'readMoreBoxShadowHover' : 'readMoreBoxShadow';
	const border = isHover ? readMoreBorderHover : readMoreBorder;
	const borderWidth = isHover ? readMoreBorderWidthHover : readMoreBorderWidth;
	const borderKey = isHover ? 'readMoreBorderHover' : 'readMoreBorder';
	const borderWidthKey = isHover ? 'readMoreBorderWidthHover' : 'readMoreBorderWidth';

	const typoProps = {
		family: attributes.readMoreTypography,
		familyKey: 'readMoreTypography',
		fontSize: attributes.readMoreFontSize,
		fontSizeKey: 'readMoreFontSize',
		lineHeight: attributes.readMoreLineHeight,
		lineHeightKey: 'readMoreLineHeight',
		fontSpacing: attributes.readMoreLetterSpacing,
		fontSpacingKey: 'readMoreLetterSpacing',
		wordSpacing: attributes.readMoreWordSpacing,
		wordSpacingKey: 'readMoreWordSpacing',
		globalTypo: attributes.readMoreGlobalTypo,
		globalTypoKey: 'readMoreGlobalTypo',
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
					{ label: __('Hover', 'team-free'), value: 'hover' },
				]}
			/>
			{/* Normal and Hover are independent — editing one never touches the other. */}
			<SpColorPicker
				label={__('Color', 'team-free')}
				value={(isHover ? readMoreColorHover : readMoreColor) || ''}
				attributesKey={isHover ? 'readMoreColorHover' : 'readMoreColor'}
				setAttributes={setAttributes}
			/>
			<Background
				label={__('Background Type', 'team-free')}
				attributes={readMoreBg || {}}
				attributesKey="readMoreBg"
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
				attributes={{ border: border || {}, borderWidth: borderWidth || {} }}
				attributesKey={{ border: borderKey, borderWidth: borderWidthKey }}
				setAttributes={setAttributes}
				units={['px', 'em']}
				btnType="color"
				parentState={state}
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
				attributes={attributes.readMoreRadius || {}}
				attributesKey="readMoreRadius"
				setAttributes={setAttributes}
				units={['px', '%', 'em']}
				responsive={false}
				indicator="radius"
				max={100}
			/>
			<Spacing
				label={__('Padding', 'team-free')}
				attributes={attributes.readMorePadding || {}}
				attributesKey="readMorePadding"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
			/>
			<Spacing
				label={__('Margin', 'team-free')}
				attributes={attributes.readMoreMargin || {}}
				attributesKey="readMoreMargin"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				indicator=""
			/>
		</>
	);
}

// Member Details → Open as. Single Page is free (Pro_Gate::FREE_DETAILS_OPEN_AS)
// and comes first; Modal carries the `(Pro)` tag.
const DETAILS_OPEN_AS_ITEMS = [
	{ label: __('Single Page', 'team-free'), value: 'single' },
	{ label: __('Modal', 'team-free'), value: 'modal' },
].map((item) => (isFreeDetailsOpenAs(item.value) ? item : { ...item, pro: true }));

// Member Details → Make Clickable. Only Image is free
// (Pro_Gate::FREE_MAKE_CLICKABLE); the rest are disabled `(Pro)` options.
const MAKE_CLICKABLE_ITEMS = [
	{ label: __('Only Image', 'team-free'), value: 'image' },
	{ label: __('Only Name', 'team-free'), value: 'name' },
	{ label: __('Image and Name', 'team-free'), value: 'image-name' },
	{ label: __('Full Card', 'team-free'), value: 'full' },
].map((item) =>
	isFreeMakeClickable(item.value)
		? item
		: { ...item, label: `${item.label} (${__('Pro', 'team-free')})`, disabled: true }
);

/* -------------------------------------------------------------------------- */
/* Member Details — single member open behavior (modal / single page) */
/* -------------------------------------------------------------------------- */
export function MemberDetails({ attributes, setAttributes }) {
	const { showMemberDetails, detailsOpenAs, makeClickable, detailsOpenInNewTab } = attributes;

	// Modal is Pro — Free ships no modal runtime or details templates, so the
	// only open behavior is the member's Single Page, edited in the Site
	// Editor. '' on classic themes, where the link is hidden.
	const { singlePageUrl } = useDetailsTemplates();

	return (
		<>
			<Toggle
				label={__('Show Member Details', 'team-free')}
				attributes={!!showMemberDetails}
				onChange={(current) => setAttributes({ showMemberDetails: !current })}
			/>

			{showMemberDetails && (
				<>
					{/* The stored value (default 'modal', shared with Pro) is left
					    as-is — it resolves to Single Page here. */}
					<SPToggleGroupControl
						label={__('Open as', 'team-free')}
						attributes={resolveDetailsOpenAs(detailsOpenAs)}
						attributesKey="detailsOpenAs"
						setAttributes={setAttributes}
						items={DETAILS_OPEN_AS_ITEMS}
					/>

					{!!singlePageUrl && (
						<div className="sp-smart-team-configure-template">
							<ExternalLink href={singlePageUrl}>
								{__('Configure Single Page Template', 'team-free')}
							</ExternalLink>
						</div>
					)}

					<SelectField
						label={__('Make Clickable', 'team-free')}
						attributes={resolveMakeClickable(makeClickable)}
						attributesKey="makeClickable"
						setAttributes={setAttributes}
						items={MAKE_CLICKABLE_ITEMS}
					/>

					<Toggle
						label={__('Link Open In New Tab', 'team-free')}
						attributes={!!detailsOpenInNewTab}
						onChange={(current) => setAttributes({ detailsOpenInNewTab: !current })}
					/>
				</>
			)}

			<ProNotice {...PRO_NOTICE_MEMBER_DETAILS} />
		</>
	);
}

/* -------------------------------------------------------------------------- */
/* Sections pending member-meta/feature work — shown so the panel structure   */
/* matches the design; wire controls in as the features land.                 */
/* -------------------------------------------------------------------------- */
export function ComingSoon({ message }) {
	return (
		<Notice status="info" isDismissible={false}>
			{message || __('Controls for this section are coming soon.', 'team-free')}
		</Notice>
	);
}
