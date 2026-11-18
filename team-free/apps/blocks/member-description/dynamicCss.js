/**
 * Member Description — client-side dynamic CSS generator.
 *
 * Twin of blocks/Includes/Styles/Member_Description.php. Keep this in lock-step
 * — same selectors, same breakpoints, same property order.
 */

import commonDynamicCss from '../../shared/commonDynamicCss';
import {
	objectToCssString,
	wrapInMediaQuery,
	singleResponsiveValue,
	typographyStyles,
} from '../../shared/helpFn';

// Typography control bundle for an attribute prefix (twin of typo_bundle()).
const typoBundle = (attributes, prefix) => ({
	family: attributes[`${prefix}Typography`] || {},
	fontSize: attributes[`${prefix}FontSize`] || {},
	lineHeight: attributes[`${prefix}LineHeight`] || {},
	letterSpacing: attributes[`${prefix}LetterSpacing`] || {},
	wordSpacing: attributes[`${prefix}WordSpacing`] || {},
});

const archiveResponsiveCss = (attributes, deviceType) => {
	const base = `#${attributes.uniqueId}`;
	const text = `${base} .sp-smart-team-member-description__text`;
	const rules = [];

	// Text: alignment + typography (per device) (+ color on Desktop). No margin —
	// the block's spacing is Advanced Settings → General.
	const textStyles = {
		'text-align': singleResponsiveValue(attributes.descriptionAlignment, deviceType),
		...typographyStyles(typoBundle(attributes, 'description'), deviceType),
	};

	if (deviceType === 'Desktop') {
		textStyles.color = attributes.descriptionColor || '';
	}

	rules.push({ selector: text, styles: textStyles });

	return rules;
};

const dynamicCss = (attributes) => {
	if (!attributes.uniqueId) {
		return '';
	}

	const desktopCss = objectToCssString(archiveResponsiveCss(attributes, 'Desktop'));
	const tabletCss = wrapInMediaQuery(
		objectToCssString(archiveResponsiveCss(attributes, 'Tablet')),
		'only screen and (max-width: 1023px)'
	);
	const mobileCss = wrapInMediaQuery(
		objectToCssString(archiveResponsiveCss(attributes, 'Mobile')),
		'only screen and (max-width: 599px)'
	);

	return `${desktopCss} ${tabletCss} ${mobileCss} ${commonDynamicCss(attributes)}`;
};

export default dynamicCss;
