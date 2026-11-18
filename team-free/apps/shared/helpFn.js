/**
 * Shared CSS helpers for client-side dynamic CSS generation.
 *
 * Mirrors the Css_Helpers PHP helpers so each block's dynamicCss.js can
 * produce the same `{ desktop_css, tablet_css, mobile_css }` rule arrays
 * and have them flattened into a CSS string identical to what the server
 * emits.
 */

export const objectToCssString = (dynamicCss) => {
	let css = '';
	if (!Array.isArray(dynamicCss)) {
		return css;
	}

	dynamicCss.forEach((item) => {
		if (!item?.styles || typeof item.styles !== 'object') {
			return;
		}
		let styles = '';
		Object.entries(item.styles).forEach(([property, value]) => {
			if (value !== null && value !== undefined && value !== '' && value !== false) {
				styles += `${property}: ${value};`;
			}
		});
		if (styles) {
			css += `${item.selector} {${styles}}`;
		}
	});

	return css;
};

/**
 * Wrap a CSS string in a media query block.
 *
 * @param {string} cssString  Flattened CSS produced by objectToCssString().
 * @param {string} mediaQuery e.g. 'only screen and (max-width: 1023px)'
 * @return {string}
 */
export const wrapInMediaQuery = (cssString, mediaQuery) => {
	if (!cssString) {
		return '';
	}
	return `@media ${mediaQuery} { ${cssString} }`;
};

/**
 * Merge duplicate selectors so the same selector emits a single rule.
 * @param cssArray
 */
export const filterDuplicateSelector = (cssArray) => {
	if (!Array.isArray(cssArray)) {
		return [];
	}
	const map = {};

	cssArray.forEach((entry) => {
		if (!entry?.selector || typeof entry.styles !== 'object') {
			return;
		}
		const { selector, styles } = entry;
		if (!Object.keys(styles).length) {
			return;
		}

		if (map[selector]) {
			map[selector].styles = { ...map[selector].styles, ...styles };
		} else {
			map[selector] = { selector, styles: { ...styles } };
		}
	});

	return Object.values(map);
};

/**
 * Flatten a responsive CSS object into a single string with media queries.
 *
 * @param {Object} cssObj Shape: { desktop_css, tablet_css, mobile_css }
 * @return {string}
 */
export const filterResponsiveDynamicCss = (cssObj) => {
	if (!cssObj || typeof cssObj !== 'object') {
		return '';
	}

	const desktop = filterDuplicateSelector(cssObj.desktop_css || []);
	const tablet = filterDuplicateSelector(cssObj.tablet_css || []);
	const mobile = filterDuplicateSelector(cssObj.mobile_css || []);

	let css = objectToCssString(desktop);
	css += ' @media only screen and (min-width: 600px) and (max-width: 1023px) { ';
	css += objectToCssString(tablet);
	css += ' } @media only screen and (max-width: 599px) {';
	css += objectToCssString(mobile);
	css += ' }';

	return css.trim();
};

/**
 * Build a CSS shorthand `padding`/`margin` value from a responsive spacing attribute.
 *
 * @param {Object} spacing Attribute payload produced by Att_Utils::responsive_spacing.
 * @param {string} device  'Desktop' | 'Tablet' | 'Mobile'
 * @return {string}
 */
export const responsiveSpacingValue = (spacing, device = 'Desktop') => {
	if (!spacing || typeof spacing !== 'object') {
		return '';
	}

	const deviceValues = spacing.device?.[device];
	if (!deviceValues) {
		return '';
	}

	const unit =
		typeof spacing.unit === 'object' ? spacing.unit?.[device] || 'px' : spacing.unit || 'px';

	const { top = '', right = '', bottom = '', left = '' } = deviceValues;
	if (`${top}${right}${bottom}${left}`.trim() === '') {
		return '';
	}

	return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
};

/**
 * Build a CSS shorthand (`top right bottom left`) from a non-responsive
 * spacing attribute produced by Att_Utils::spacing — used for border-width
 * and border-radius. Twin of Css_Helpers::spacing_shorthand_value().
 *
 * @param {Object} spacing Attribute payload `{ value:{top,right,bottom,left}, unit }`.
 * @return {string}
 */
export const spacingShorthandValue = (spacing) => {
	if (!spacing || typeof spacing !== 'object') {
		return '';
	}

	const value = spacing.value || {};
	const unit = typeof spacing.unit === 'object' ? 'px' : spacing.unit || 'px';
	const { top = '', right = '', bottom = '', left = '' } = value;

	if (`${top}${right}${bottom}${left}`.trim() === '') {
		return '';
	}

	const side = (v) => `${v === '' || v === null || v === undefined ? 0 : v}${unit}`;
	return `${side(top)} ${side(right)} ${side(bottom)} ${side(left)}`;
};

/**
 * Build border CSS rules from a border + border-width attribute pair.
 * Twin of Css_Helpers::border_styles().
 *
 * @param {Object} border Attribute `{ style, color }`.
 * @param {Object} width  Spacing attribute for border width.
 * @return {Object} CSS property map.
 */
export const borderStyles = (border, width) => {
	const styles = {};
	const style = border?.style || '';

	if (!style || style === 'none') {
		return styles;
	}

	styles['border-style'] = style;
	if (border?.color) {
		styles['border-color'] = border.color;
	}

	const borderWidth = spacingShorthandValue(width);
	if (borderWidth) {
		styles['border-width'] = borderWidth;
	}

	return styles;
};

/**
 * Build background CSS rules from a background attribute.
 * Twin of Css_Helpers::background_styles().
 *
 * @param {Object} bg Attribute `{ color:{ style, solidColor, gradient } }`.
 * @return {Object} CSS property map.
 */
export const backgroundStyles = (bg) => {
	const styles = {};
	const color = bg?.color || {};
	const style = color.style || '';

	// Each state resets the opposite property so a state fully replaces another —
	// e.g. a solid hover color must clear a normal-state gradient (background-image)
	// or the gradient keeps painting over the hover color.
	if (style === 'bgColor' && color.solidColor) {
		styles['background-color'] = color.solidColor;
		styles['background-image'] = 'none';
	} else if (style === 'gradient' && color.gradient) {
		styles['background-image'] = color.gradient;
		styles['background-color'] = 'transparent';
	} else if (style === 'transparent') {
		styles['background-color'] = 'transparent';
		styles['background-image'] = 'none';
	}

	return styles;
};

/**
 * Build a CSS `box-shadow` value from a box-shadow attribute payload.
 * Returns '' when the shadow is disabled. Twin of Css_Helpers::box_shadow_css().
 *
 * @param {Object} shadow Attribute `{ value:{top,right,bottom,left}, unit, color, isActive }`.
 * @return {string}
 */
export const boxShadowValue = (shadow) => {
	if (!shadow || typeof shadow !== 'object' || !shadow.isActive) {
		return '';
	}

	// Preset shadow selected from the BoxShadow control (a CSS variable, e.g. var(--sp-smart-team-shadow-medium-4dp)).
	if (shadow.selectDefault && shadow.selectDefault !== 'custom') {
		return shadow.selectDefault;
	}

	const { top = 0, right = 0, bottom = 0, left = 0 } = shadow.value || {};
	const color = shadow.color || '';
	const inset = String(shadow.unit || '').toLowerCase() === 'inset' ? 'inset ' : '';

	return `${inset}${top}px ${right}px ${bottom}px ${left}px ${color}`.trim();
};

/**
 * Resolve a single-responsive scalar attribute (Att_Utils::single_responsive —
 * `{ device:{Desktop,Tablet,Mobile}, unit:{…} }`) to a CSS value for one device.
 * Returns '' when that device has no value. Twin of
 * Css_Helpers::single_responsive_value().
 *
 * @param {Object} attr   single_responsive payload.
 * @param {string} device 'Desktop' | 'Tablet' | 'Mobile'
 * @return {string}
 */
export const singleResponsiveValue = (attr, device = 'Desktop') => {
	const value = attr?.device?.[device];
	if (value === '' || value === null || value === undefined) {
		return '';
	}
	const unit = typeof attr?.unit === 'object' ? (attr.unit?.[device] ?? '') : (attr?.unit ?? '');
	return `${value}${unit}`;
};

/**
 * Build typography CSS props from the Typography control bundle. Responsive
 * metrics (font-size / line-height / letter-spacing / word-spacing) are emitted
 * for the given device; the non-responsive font face (family/weight/style/
 * transform/decoration) is emitted only on the Desktop pass to avoid repeating
 * it inside every media query. Twin of Css_Helpers::typography_styles().
 *
 * @param {Object} typo   `{ family, fontSize, lineHeight, letterSpacing, wordSpacing }`.
 * @param {string} device 'Desktop' | 'Tablet' | 'Mobile'
 * @return {Object} CSS property map.
 */
export const typographyStyles = (typo = {}, device = 'Desktop') => {
	const styles = {};
	const { family, fontSize, lineHeight, letterSpacing, wordSpacing } = typo;

	styles['font-size'] = singleResponsiveValue(fontSize, device);
	styles['line-height'] = singleResponsiveValue(lineHeight, device);

	if (device === 'Desktop') {
		// Letter/word spacing are non-responsive ({ value, unit }) — emit once.
		const spacingCss = (s) =>
			s && s.value !== '' && s.value !== null && s.value !== undefined
				? `${s.value}${s.unit || 'px'}`
				: '';
		styles['letter-spacing'] = spacingCss(letterSpacing);
		styles['word-spacing'] = spacingCss(wordSpacing);

		const t = family?.typography || {};
		if (t.family && t.family !== 'Default') {
			styles['font-family'] = t.family;
		}
		if (t.fontWeight) {
			styles['font-weight'] = t.fontWeight;
		}
		if (t.style) {
			styles['font-style'] = t.style;
		}
		if (t.transform) {
			styles['text-transform'] = t.transform;
		}
		if (t.decoration) {
			styles['text-decoration'] = t.decoration;
		}
	}

	return styles;
};

/**
 * Small utilities ported from styble-pro/src/blocks/shared/helpFn.js so the
 * shared components keep working when they import them by name.
 * @param data
 */
export const jsonParse = (data) => {
	try {
		return JSON.parse(data);
	} catch (e) {
		return null;
	}
};

export const getObjectValuesToJsArray = (object) => Object?.values(object || {});
