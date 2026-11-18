/**
 * Shared section/box dynamic CSS.
 *
 * Twin of the PHP CommonAttributes box styling. Emits the wrapper-level styles
 * (padding, margin, background, border, radius, box-shadow) shared by every
 * block via CommonAttributes::get(), scoped to `#uniqueId`. Each block's own
 * dynamicCss.js appends its block-specific rules and calls this for the common
 * box — mirroring the advanced-text → commonDynamicCss split in styble-pro.
 */

import {
	objectToCssString,
	wrapInMediaQuery,
	responsiveSpacingValue,
	spacingShorthandValue,
	backgroundStyles,
	borderStyles,
	boxShadowValue,
} from './helpFn';

const commonDynamicCss = (attributes) => {
	const {
		uniqueId,
		customCss,
		sectionPadding,
		sectionMargin,
		sectionBg,
		sectionBorder,
		sectionBorderWidth,
		sectionBorderRadius,
		sectionBoxShadow,
		hideOnDesktop,
		hideOnTablet,
		hideOnMobile,
	} = attributes;

	if (!uniqueId) {
		return '';
	}

	// Dynamic CSS ALWAYS anchors to #uniqueId — the Advanced → Custom CSS ID
	// lives on a separate outer wrapper and never replaces it.
	const base = `#${uniqueId}`;

	const buildResponsiveCss = (deviceType) => {
		const rules = [
			{
				selector: base,
				styles: {
					padding: responsiveSpacingValue(sectionPadding, deviceType),
					margin: responsiveSpacingValue(sectionMargin, deviceType),
				},
			},
		];

		// Non-responsive box styles only emit once, on the base (Desktop) pass.
		if (deviceType === 'Desktop') {
			rules[0].styles = {
				...rules[0].styles,
				...backgroundStyles(sectionBg),
				...borderStyles(sectionBorder, sectionBorderWidth),
				'border-radius': spacingShorthandValue(sectionBorderRadius),
				'box-shadow': boxShadowValue(sectionBoxShadow),
			};
		}

		return rules;
	};

	const desktopCss = [...buildResponsiveCss('Desktop')];
	const tabletCss = [...buildResponsiveCss('Tablet')];
	const mobileCss = [...buildResponsiveCss('Mobile')];

	const tabletMediaQueryCss = wrapInMediaQuery(
		objectToCssString(tabletCss),
		'only screen and (max-width: 1023px)'
	);
	const mobileMediaQueryCss = wrapInMediaQuery(
		objectToCssString(mobileCss),
		'only screen and (max-width: 599px)'
	);

	// Visibility (Advanced → Visibility). The frontend twin uses display:none; in
	// the editor the block is only dimmed so it stays selectable/editable while
	// previewing the hidden state at the matching device width.
	const dim = objectToCssString([{ selector: base, styles: { opacity: '0.35' } }]);
	let hideCss = '';
	if (hideOnDesktop) {
		hideCss += wrapInMediaQuery(dim, 'only screen and (min-width: 1024px)');
	}
	if (hideOnTablet) {
		hideCss += wrapInMediaQuery(
			dim,
			'only screen and (min-width: 600px) and (max-width: 1023px)'
		);
	}
	if (hideOnMobile) {
		hideCss += wrapInMediaQuery(dim, 'only screen and (max-width: 599px)');
	}

	// Custom CSS (Advanced → Advanced) — user-authored rules, with the literal
	// `selector` token rewritten to this block's `#uniqueId` wrapper.
	const customCssRules = customCss ? customCss.replace(/\bselector\b/g, base) : '';

	return `${objectToCssString(
		desktopCss
	)} ${tabletMediaQueryCss} ${mobileMediaQueryCss} ${hideCss} ${customCssRules}`;
};

export default commonDynamicCss;
