/**
 * Shared — card design catalogue + design-switch swap logic.
 *
 * Shared by the Display Settings → Select Card Design control (GeneralTab)
 * and the first-insert CardDesignPicker placeholder, so both apply a design
 * the exact same way (port of testimonial-pro's blocks/shared/cardDesign.js).
 */

import {
	CardEight,
	CardEleven,
	CardFive,
	CardFour,
	CardNine,
	CardOne,
	CardSix,
	CardTen,
	CardThree,
	CardTwo,
} from './icons';
import {
	OverlayCardFive,
	OverlayCardFour,
	OverlayCardOne,
	OverlayCardThree,
	OverlayCardTwo,
} from '../carousel-3d/icons';
import { isFreeCardDesign } from './proGate';

// The Select Card Design cells (Figma order) — no `label` so the inspector's
// Layouts control stays icon-only; the first-insert picker derives its
// tooltip text from `value`. `pro` is resolved once, here, from Pro_Gate's
// localized free-design list (docs/pro-free-separation.md §5: one catalogue
// per surface, honored by the shared control — both CardDesignPicker and the
// inspector's Layouts control read this same flag).
export const CARD_DESIGN_ITEMS = [
	{ value: 'card-1', icon: <CardOne /> },
	{ value: 'card-2', icon: <CardTwo /> },
	{ value: 'card-3', icon: <CardThree /> },
	{ value: 'card-4', icon: <CardFour /> },
	{ value: 'card-5', icon: <CardFive /> },
	{ value: 'card-6', icon: <CardSix /> },
	{ value: 'card-8', icon: <CardEight /> },
	{ value: 'card-9', icon: <CardNine /> },
	{ value: 'card-10', icon: <CardTen /> },
	{ value: 'card-11', icon: <CardEleven /> },
	// The overlay presets (Pro's 3D Carousel look, on Grid and Carousel in Pro) —
	// always locked Pro tiles here: Free ships no overlay CSS or markup, and
	// Pro_Gate::card_design() renders a Pro-saved overlay-N as card-1.
	{ value: 'overlay-1', icon: <OverlayCardOne /> },
	{ value: 'overlay-2', icon: <OverlayCardTwo /> },
	{ value: 'overlay-3', icon: <OverlayCardThree /> },
	{ value: 'overlay-4', icon: <OverlayCardFour /> },
	{ value: 'overlay-5', icon: <OverlayCardFive /> },
].map((item) => ({ ...item, pro: !isFreeCardDesign(item.value) }));

// Per-design control defaults. BASE_DEFAULTS holds every swappable control's
// stock (card-1) value; DESIGN_OVERRIDES lists only what a design changes.
// Switching design swaps a control to the new design's default only while it
// still holds the old design's default, so customized values are kept (same
// pattern as the Skills bar-height swap).
// card-2 (Figma Card_02): horizontal — left text, 2 columns, 38px outlined icons.
// card-3 (Figma Card_03): overlap — centered, 38px outlined icons.
// card-4 (Figma Card_04): photo-over-panel — 73% photo, 5px radius.
// card-5 (Figma Card_05): horizontal photo-over-panel — 46% photo, left, 2 cols.
// card-6 (Figma Card_06): minimal photo card — flush photo, on-photo "+" flyout.
// card-7 (Pro, dropped from Pro's picker): no tile and no card-7 CSS or markup
//   (a saved card-7 renders as card-1); its overrides stay so switching AWAY
//   from a Pro-saved card-7 swaps its still-at-default white text back.
// overlay-1 … overlay-5 (Pro): locked tiles, same reason — OVERLAY_BASE below
//   is Pro's shared overlay look, kept only for that switch-away swap.
// card-9 (Figma Card_09): profile split — circular photo + name/role in a
//   left side column on a light panel; bio, contact rows and outlined
//   social chips on the right (email/phone/location toggled on).
// card-10 (Figma Card_10): bordered header card — small circular photo +
//   name/role header over a divider; bio; outlined Read More → button and
//   social chips sharing the footer row.
// card-11 (Figma Card_11): split-header card — circular photo top-left and
//   icon-only social glyphs top-right on one line; "name | role" below.
//
// Default `show` flags of the Member Information list (mirrors the
// cardElements defaults in attributes.php) — the elementShows override
// below toggles entries per design.
const BASE_ELEMENT_SHOWS = {
	image: true,
	name: true,
	role: true,
	bio: true,
	social: true,
	email: false,
	mobile: false,
	phone: false,
	location: false,
	website: false,
	experience: false,
	language: false,
	gender: false,
	skills: false,
	custom: false,
};

// Designs whose layout Pro's Hover Content reveal would break (horizontal
// splits and side-column/header cards) — the locked Hover Content row is not
// shown there, matching Pro's inspector.
export const HOVER_CONTENT_EXCLUDED = ['card-2', 'card-5', 'card-9', 'card-10', 'card-11'];

const BASE_DEFAULTS = {
	contentAlignment: 'center',
	columns: 3,
	socialIconAreaSize: 30,
	socialIconSize: 13,
	socialItemGap: 6,
	socialIconStyle: 'style-3',
	socialIconColor: '',
	socialIconPosition: 'bottom-right',
	socialIconOffset: 20,
	readMoreButton: false,
	nameColor: '#1e1e1e',
	roleColor: '#757575',
	bioColor: '#757575',
	metaTextColor: '',
	metaIconColor: '',
	skillButtonColor: '#1e1e1e',
	skillLabelColor: '#1e1e1e',
	skillPercentColor: '#1e1e1e',
	imageAspectRatio: '1-1',
	imageContentGap: { value: 24, unit: 'px' },
	imageWidth: { value: 100, unit: '%' },
	imageBorderRadius: { value: 4, unit: 'px' },
	// Empty = unset, so the design's SCSS radius/padding holds (0 would override it).
	cardBorderRadius: { value: '', unit: 'px' },
	cardPadding: { value: '', unit: 'px' },
	elementShows: {},
};

// The look every Pro overlay preset starts with (twin of Pro's OVERLAY_BASE,
// limited to the keys Free swaps): light text on the scrim, portrait photo,
// rounded corners, 38px social chips.
const OVERLAY_BASE = {
	nameColor: '#ffffff',
	roleColor: '#e0e0e0',
	bioColor: '#ffffff',
	imageAspectRatio: '3-4',
	cardBorderRadius: { value: 8, unit: 'px' },
	socialIconAreaSize: 38,
	socialIconSize: 15,
};

// NOTE: the social chips deliberately keep the card-1 look (BASE_DEFAULTS:
// style-3 brand-colored circles, 30/13/6) as the initial style on EVERY
// design — only structural placement (card-8's on-photo flyout position) is
// swapped per design.
const DESIGN_OVERRIDES = {
	'card-2': {
		contentAlignment: 'left',
		columns: 2,
	},
	'card-4': {
		imageWidth: { value: 73, unit: '%' },
		imageBorderRadius: { value: 5, unit: 'px' },
	},
	'card-5': {
		contentAlignment: 'left',
		columns: 2,
		imageContentGap: { value: 12, unit: 'px' },
		imageWidth: { value: 46, unit: '%' },
		imageBorderRadius: { value: 5, unit: 'px' },
	},
	'card-6': {
		contentAlignment: 'left',
		imageBorderRadius: { value: 0, unit: 'px' },
	},
	'card-7': {
		contentAlignment: 'left',
		nameColor: '#ffffff',
		roleColor: 'rgba(255,255,255,0.8)',
		bioColor: 'rgba(255,255,255,0.9)',
		metaTextColor: 'rgba(255,255,255,0.9)',
		metaIconColor: 'rgba(255,255,255,0.9)',
		skillButtonColor: '#ffffff',
		skillLabelColor: '#ffffff',
		skillPercentColor: '#ffffff',
		imageAspectRatio: '3-4',
		imageBorderRadius: { value: 0, unit: 'px' },
		cardBorderRadius: { value: 8, unit: 'px' },
	},
	'card-8': {
		contentAlignment: 'left',
		socialIconPosition: 'top-left',
		socialIconOffset: 12,
		roleColor: '#1e1e1e',
		metaTextColor: '#1e1e1e',
		metaIconColor: '#1e1e1e',
		imageAspectRatio: '3-4',
		imageBorderRadius: { value: 0, unit: 'px' },
		readMoreButton: true,
		elementShows: { email: true, phone: true, location: true, website: true, skills: true },
	},
	'card-9': {
		contentAlignment: 'left',
		columns: 2,
		metaTextColor: '#1e1e1e',
		metaIconColor: '#1e1e1e',
		imageBorderRadius: { value: 50, unit: '%' },
		cardBorderRadius: { value: 8, unit: 'px' },
		cardPadding: { value: 24, unit: 'px' },
		elementShows: { email: true, phone: true, location: true },
	},
	'card-10': {
		contentAlignment: 'left',
		imageWidth: { value: 80, unit: 'px' },
		imageBorderRadius: { value: 50, unit: '%' },
		cardBorderRadius: { value: 4, unit: 'px' },
		cardPadding: { value: 24, unit: 'px' },
		readMoreButton: true,
	},
	'card-11': {
		contentAlignment: 'left',
		imageWidth: { value: 80, unit: 'px' },
		imageBorderRadius: { value: 50, unit: '%' },
		cardBorderRadius: { value: 8, unit: 'px' },
		cardPadding: { value: 24, unit: 'px' },
	},
	// Pro overlay presets — twin of Pro's per-preset swaps (shared/cardDesign.js).
	'overlay-1': OVERLAY_BASE,
	'overlay-2': {
		...OVERLAY_BASE,
		contentAlignment: 'left',
		socialIconPosition: 'top-right',
		socialIconOffset: 16,
		readMoreButton: true,
	},
	'overlay-3': { ...OVERLAY_BASE, contentAlignment: 'left', readMoreButton: true },
	'overlay-4': {
		...OVERLAY_BASE,
		contentAlignment: 'left',
		readMoreButton: true,
		elementShows: { social: false },
	},
	'overlay-5': OVERLAY_BASE,
};

// Swap groups, by attribute shape.
const STRING_SWAP_KEYS = [
	'contentAlignment',
	'socialIconStyle',
	'socialIconColor',
	'socialIconPosition',
	'readMoreButton',
	'nameColor',
	'roleColor',
	'bioColor',
	'metaTextColor',
	'metaIconColor',
	'skillButtonColor',
	'skillLabelColor',
	'skillPercentColor',
	'imageAspectRatio',
];
const RESPONSIVE_SWAP_KEYS = [
	'socialIconAreaSize',
	'socialIconSize',
	'socialItemGap',
	'socialIconOffset',
];
const SPACING_SWAP_KEYS = ['imageBorderRadius', 'cardBorderRadius'];

// Whether a saved spacing side still holds a design's stock value ('' = unset).
const isStockSide = (value, stock) =>
	stock === '' ? value === '' || value === null || value === undefined : Number(value) === stock;

// Apply a card design: set `cardDesign` and swap every still-at-default
// control to the new design's default (customized values are kept).
export function applyCardDesign(newDesign, attributes, setAttributes) {
	const { cardDesign, columns, imageSize, cardPadding, cardElements } = attributes;
	const from = { ...BASE_DEFAULTS, ...(DESIGN_OVERRIDES[cardDesign] || {}) };
	const to = { ...BASE_DEFAULTS, ...(DESIGN_OVERRIDES[newDesign] || {}) };
	const next = { cardDesign: newDesign };
	const devices = ['Desktop', 'Tablet', 'Mobile'];

	// Simple string-valued controls (alignment, style slugs, colors, ratio).
	STRING_SWAP_KEYS.forEach((key) => {
		if (from[key] !== to[key] && (attributes[key] ?? BASE_DEFAULTS[key]) === from[key]) {
			next[key] = to[key];
		}
	});

	if (from.columns !== to.columns && Number(columns?.device?.Desktop) === from.columns) {
		next.columns = {
			...columns,
			device: { ...columns?.device, Desktop: to.columns },
		};
	}

	// Photo-to-text gap (card-2's flex gap / card-5's panel clearance — the
	// Figma card-5 clearance is 12px, not the 24px control default).
	if (
		(from.imageContentGap.value !== to.imageContentGap.value ||
			from.imageContentGap.unit !== to.imageContentGap.unit) &&
		Number(attributes.imageContentGap?.value) === from.imageContentGap.value &&
		(attributes.imageContentGap?.unit ?? 'px') === from.imageContentGap.unit
	) {
		next.imageContentGap = {
			...attributes.imageContentGap,
			value: to.imageContentGap.value,
			unit: to.imageContentGap.unit,
		};
	}

	// Uniform responsive numbers — swapped on all three devices.
	RESPONSIVE_SWAP_KEYS.forEach((key) => {
		const attr = attributes[key];
		if (from[key] !== to[key] && Number(attr?.device?.Desktop) === from[key]) {
			next[key] = {
				...attr,
				device: { Desktop: to[key], Tablet: to[key], Mobile: to[key] },
			};
		}
	});

	// Photo width (Member Image → Size) — heights are left untouched.
	if (
		(from.imageWidth.value !== to.imageWidth.value ||
			from.imageWidth.unit !== to.imageWidth.unit) &&
		Number(imageSize?.device?.Desktop?.width) === from.imageWidth.value &&
		(imageSize?.unit?.Desktop?.width ?? '%') === from.imageWidth.unit
	) {
		next.imageSize = {
			...imageSize,
			device: Object.fromEntries(
				devices.map((dev) => [
					dev,
					{ ...imageSize?.device?.[dev], width: to.imageWidth.value },
				])
			),
			unit: Object.fromEntries(
				devices.map((dev) => [
					dev,
					{ ...imageSize?.unit?.[dev], width: to.imageWidth.unit },
				])
			),
		};
	}

	// Spacing-shaped radius controls (photo corners + card box corners).
	const corners = ['top', 'right', 'bottom', 'left'];
	SPACING_SWAP_KEYS.forEach((key) => {
		const attr = attributes[key];
		if (
			(from[key].value !== to[key].value || from[key].unit !== to[key].unit) &&
			corners.every((side) => isStockSide(attr?.value?.[side], from[key].value)) &&
			(attr?.unit ?? 'px') === from[key].unit
		) {
			next[key] = {
				...attr,
				value: Object.fromEntries(corners.map((side) => [side, to[key].value])),
				unit: to[key].unit,
			};
		}
	});

	// Card padding (responsive spacing, all sides/devices) — card-9's panel
	// needs breathing room around the whole card.
	if (
		(from.cardPadding.value !== to.cardPadding.value ||
			from.cardPadding.unit !== to.cardPadding.unit) &&
		devices.every((dev) =>
			corners.every((side) =>
				isStockSide(cardPadding?.device?.[dev]?.[side], from.cardPadding.value)
			)
		) &&
		(cardPadding?.unit?.Desktop ?? 'px') === from.cardPadding.unit
	) {
		const paddedSides = Object.fromEntries(corners.map((side) => [side, to.cardPadding.value]));
		next.cardPadding = {
			...cardPadding,
			device: Object.fromEntries(devices.map((dev) => [dev, { ...paddedSides }])),
			unit: Object.fromEntries(devices.map((dev) => [dev, to.cardPadding.unit])),
		};
	}

	// Member Information visibility — card-9 turns the contact rows on by
	// default. Swapped only while every toggle still matches the old
	// design's default set (drag-and-drop reordering doesn't block it).
	if (Array.isArray(cardElements) && cardElements.length) {
		const fromShows = { ...BASE_ELEMENT_SHOWS, ...from.elementShows };
		const toShows = { ...BASE_ELEMENT_SHOWS, ...to.elementShows };
		const showsChanged = Object.keys(toShows).some((k) => fromShows[k] !== toShows[k]);
		const atDefault = cardElements.every((el) => !!el.show === !!fromShows[el.value]);
		if (showsChanged && atDefault) {
			next.cardElements = cardElements.map((el) => ({ ...el, show: !!toShows[el.value] }));
		}
	}

	setAttributes(next);
}
