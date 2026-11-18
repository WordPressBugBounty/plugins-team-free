/**
 * Canvas defaults — the value a design's stylesheet gives an attribute that is
 * registered empty ('').
 *
 * Most styling attributes default to '' so the card design's SCSS holds, which
 * left their controls showing 0 after a reset. Instead of a hand-kept table of
 * SCSS numbers per design, the block's own dynamicCss() is run once with a
 * sentinel in the attribute to learn which selector + property it drives, and
 * that property's computed value is read from the editor canvas.
 */

const SIDES = ['top', 'right', 'bottom', 'left'];
const DEVICES = ['Desktop', 'Tablet', 'Mobile'];
// One sentinel per side so a shorthand's token order maps back to the sides.
const SENTINELS = [7771, 7772, 7773, 7774];
const LONGHANDS = {
	padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
	margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
	'border-width': [
		'border-top-width',
		'border-right-width',
		'border-bottom-width',
		'border-left-width',
	],
	'border-radius': [
		'border-top-left-radius',
		'border-top-right-radius',
		'border-bottom-right-radius',
		'border-bottom-left-radius',
	],
};

export const isEmptyValue = (value) => value === '' || value === null || value === undefined;

const isSidesObject = (value) =>
	!!value && typeof value === 'object' && SIDES.some((side) => side in value);

// 'single' = one number (responsive or { value, unit }), 'sides' = a spacing box.
export const attributeKind = (attr) => {
	if (!attr || typeof attr !== 'object') {
		return null;
	}
	if (attr.device) {
		return isSidesObject(attr.device.Desktop) ? 'sides' : 'single';
	}
	if (isSidesObject(attr.value)) {
		return 'sides';
	}
	return 'value' in attr ? 'single' : null;
};

// The slot the control shows for the active device ('' when unset).
export const currentSlot = (attr, device) => (attr?.device ? attr.device[device] : attr?.value);

export const isSlotEmpty = (attr, device) => {
	const slot = currentSlot(attr, device);
	if (isSidesObject(slot)) {
		return SIDES.every((side) => isEmptyValue(slot[side]));
	}
	return isEmptyValue(slot);
};

export const currentUnit = (attr, device) =>
	typeof attr?.unit === 'object' && attr?.unit !== null ? attr.unit[device] : attr?.unit;

const fillSentinel = (attr, kind) => {
	const filled =
		kind === 'sides'
			? Object.fromEntries(SIDES.map((side, i) => [side, SENTINELS[i]]))
			: SENTINELS[0];
	if (attr.device) {
		return { ...attr, device: Object.fromEntries(DEVICES.map((device) => [device, filled])) };
	}
	return { ...attr, value: filled };
};

const SENTINEL_TOKEN = /^(777[1-4])([a-z%]*)$/i;

// Find the rule an attribute drives: { selector, property, sentinels, unitless }.
// Hover rules and calc() values (offsets the design adds) are skipped — their
// computed value is not the attribute's own.
export const findProbeTarget = (cssFn, attributes, attributesKey) => {
	const attr = attributes?.[attributesKey];
	const kind = attributeKind(attr);
	if (!kind || typeof cssFn !== 'function') {
		return null;
	}
	let css = '';
	try {
		css = cssFn({ ...attributes, [attributesKey]: fillSentinel(attr, kind) }) || '';
	} catch (e) {
		return null;
	}
	const rule = /([^{}]+)\{([^{}]*)\}/g;
	let match;
	while ((match = rule.exec(css))) {
		const selector = match[1].trim();
		if (!selector || selector.startsWith('@') || /:hover|::/.test(selector)) {
			continue;
		}
		for (const declaration of match[2].split(';')) {
			const colon = declaration.indexOf(':');
			if (colon < 0 || !declaration.includes('777')) {
				continue;
			}
			const property = declaration.slice(0, colon).trim();
			const tokens = declaration
				.slice(colon + 1)
				.replace(/!important/i, '')
				.trim()
				.split(/\s+/);
			const parsed = tokens.map((token) => token.match(SENTINEL_TOKEN));
			if (parsed.some((token) => !token)) {
				continue;
			}
			if (kind === 'sides' && !LONGHANDS[property]) {
				continue;
			}
			return {
				kind,
				selector,
				property,
				sentinels: parsed.map((token) => Number(token[1])),
				unitless: parsed[0][2] === '',
			};
		}
	}
	return null;
};

// CSS 1–4 value expansion: [a] → a a a a, [a b] → a b a b, [a b c] → a b c b.
const expandFour = (list) => {
	const [a, b = a, c = a, d = b] = list;
	return [a, b, c, d];
};

const round = (number) => Math.round(number * 100) / 100;

// Computed px → the control's unit. Undefined when it cannot be converted (%).
const fromPx = (px, unit, element, view, unitless) => {
	if (!Number.isFinite(px)) {
		return undefined;
	}
	const fontSize = parseFloat(view.getComputedStyle(element).fontSize);
	if (unitless) {
		return fontSize ? round(px / fontSize) : undefined;
	}
	const normalized = String(unit || 'px').toLowerCase();
	if (normalized === 'px') {
		return round(px);
	}
	if (normalized === 'em') {
		return fontSize ? round(px / fontSize) : undefined;
	}
	if (normalized === 'rem') {
		const rootSize = parseFloat(
			view.getComputedStyle(element.ownerDocument.documentElement).fontSize
		);
		return rootSize ? round(px / rootSize) : undefined;
	}
	return undefined;
};

const parsePx = (value, property) => {
	if (value === 'normal') {
		return property === 'letter-spacing' || property === 'word-spacing' ? 0 : NaN;
	}
	return parseFloat(value);
};

// The target's computed value in the canvas document: a number for a 'single'
// attribute, { top, right, bottom, left } for a 'sides' one.
export const readProbeTarget = (target, doc, unit) => {
	const element = target.selector
		.split(',')
		.map((selector) => {
			try {
				return doc.querySelector(selector.trim());
			} catch (e) {
				return null;
			}
		})
		.find(Boolean);
	const view = doc?.defaultView;
	if (!element || !view) {
		return undefined;
	}
	const style = view.getComputedStyle(element);
	if (target.kind === 'single') {
		return fromPx(
			parsePx(style.getPropertyValue(target.property), target.property),
			unit,
			element,
			view,
			target.unitless
		);
	}
	const sentinels = expandFour(target.sentinels);
	const sides = {};
	LONGHANDS[target.property].forEach((longhand, i) => {
		const side = SIDES[sentinels[i] - SENTINELS[0]];
		const value = fromPx(
			parseFloat(style.getPropertyValue(longhand)),
			unit,
			element,
			view,
			false
		);
		if (side && value !== undefined) {
			sides[side] = value;
		}
	});
	return SIDES.every((side) => side in sides) ? sides : undefined;
};
