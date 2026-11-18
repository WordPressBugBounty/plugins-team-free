/**
 * Google Fonts helpers for the Typography control.
 *
 * The catalog comes from the Google Webfonts API via the useGoogleFontApi hook
 * (same source as Real Testimonials Pro); the active font's stylesheet is
 * injected in the editor by useGoogleFontsStylesheet. The frontend enqueue
 * lives in PHP (Block_Dynamic_Style).
 */

/**
 * Whether Google Fonts are available in the Typography control.
 *
 * @return {boolean} True.
 */
export const isGoogleFontsEnabled = () => true;

/**
 * A Google Fonts family name (letters, digits, spaces, hyphens) and a weight
 * token (`400`, `700italic`). Twin of Att_Utils::FONT_FAMILY_PATTERN /
 * FONT_WEIGHT_PATTERN. Anything else is skipped: the URL ends up inside
 * `@import url('…')`, where a quote or bracket would end the url() early.
 */
const FONT_FAMILY_PATTERN = /^[A-Za-z0-9 -]+$/;
const FONT_WEIGHT_PATTERN = /^[A-Za-z0-9]*$/;

/**
 * Build a Google Fonts CSS2 stylesheet URL from `Family:weight` entries.
 *
 * @param {string[]} families e.g. ['Roboto:400', 'Open Sans:700italic'].
 * @return {string} Stylesheet URL, or '' when there is nothing to load.
 */
export const buildGoogleFontsUrl = (families = []) => {
	if (!Array.isArray(families) || families.length === 0) {
		return '';
	}
	const query = families
		.filter(Boolean)
		.map((entry) => {
			const parts = String(entry).split(':');
			const family = parts[0];
			if (!family || family === 'Default') {
				return '';
			}
			const rawWeight = parts[1] === undefined ? '400' : parts[1];
			if (
				parts.length > 2 ||
				!FONT_FAMILY_PATTERN.test(family.trim()) ||
				!FONT_WEIGHT_PATTERN.test(rawWeight)
			) {
				return '';
			}
			const isItalic = rawWeight.includes('italic');
			let weight = rawWeight.replace('italic', '') || '400';
			if (weight === 'regular' || weight === 'normal') {
				weight = '400';
			}
			const axis = isItalic ? `ital,wght@1,${weight}` : `wght@${weight}`;
			return `family=${family.trim().replace(/ /g, '+')}:${axis}`;
		})
		.filter(Boolean)
		.join('&');

	return query ? `https://fonts.googleapis.com/css2?${query}&display=swap` : '';
};

/**
 * Build an `@import` statement loading every Google Font used by a block.
 *
 * JS twin of `Att_Utils::extract_font_families_from_attributes()` — scans the
 * attributes for typography values and returns CSS to prepend to the block's
 * editor <style> tag, so the fonts load inside the canvas iframe (the frontend
 * enqueue lives in PHP, Block_Dynamic_Style).
 *
 * @param {Object} attributes Block attributes.
 * @return {string} `@import url('…');` or '' when no Google Font is used.
 */
export const extractGoogleFontImports = (attributes) => {
	if (!isGoogleFontsEnabled() || !attributes || typeof attributes !== 'object') {
		return '';
	}

	const families = Object.values(attributes)
		.map((value) => {
			const family = value?.typography?.family;
			if (!family || family === 'Default') {
				return '';
			}
			return `${family}:${value?.typography?.fontWeight || '400'}`;
		})
		.filter(Boolean);

	const url = buildGoogleFontsUrl([...new Set(families)]);
	return url ? `@import url('${url}');` : '';
};
