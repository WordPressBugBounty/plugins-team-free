/**
 * Social Profile — client-side dynamic CSS generator.
 *
 * Twin of blocks/Includes/Styles/Social_Profile.php. A scoped copy of the
 * social block in shared/cardDynamicCss.js, anchored to this block's #uniqueId.
 * Keep in lock-step — same selectors, same breakpoints, same property order.
 */

import commonDynamicCss from '../../shared/commonDynamicCss';
import {
	objectToCssString,
	wrapInMediaQuery,
	responsiveSpacingValue,
	spacingShorthandValue,
	singleResponsiveValue,
} from '../../shared/helpFn';

// Responsive Alignment value → flexbox keyword (twin of $flex_align in
// Styles/Social_Profile.php). Tablet/Mobile inherit Desktop until set (empty →
// no rule, so the SCSS `justify-content: center` holds).
const FLEX_ALIGN = { left: 'flex-start', center: 'center', right: 'flex-end' };

const archiveResponsiveCss = (attributes, deviceType) => {
	const base = `#${attributes.uniqueId}`;
	const rules = [];

	// Responsive: gap + alignment on the list; icon area (box) size / glyph size /
	// margin on the chips.
	const socialArea = singleResponsiveValue(attributes.socialIconAreaSize, deviceType);
	rules.push(
		{
			selector: `${base} .sp-smart-team-card__social`,
			styles: {
				gap: singleResponsiveValue(attributes.socialItemGap, deviceType),
				'justify-content':
					FLEX_ALIGN[attributes.socialAlignment?.device?.[deviceType]] || '',
			},
		},
		{
			selector: `${base} .sp-smart-team-card__social a`,
			styles: {
				width: socialArea,
				height: socialArea,
				'font-size': singleResponsiveValue(attributes.socialIconSize, deviceType),
				margin: responsiveSpacingValue(attributes.socialMargin, deviceType),
			},
		}
	);

	if (deviceType === 'Desktop') {
		// Border radius only. Custom Styling (per-state color / bg / border /
		// shadow) is Pro — Free emits no CSS for it (twin of Styles\Social_Profile;
		// the stored attributes are left untouched).
		rules.push({
			selector: `${base} .sp-smart-team-card__social a`,
			styles: { 'border-radius': spacingShorthandValue(attributes.socialBorderRadius) },
		});
	}

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
