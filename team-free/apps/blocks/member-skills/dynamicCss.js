/**
 * Member Skills — client-side dynamic CSS generator.
 *
 * Twin of blocks/Includes/Styles/Member_Skills.php. A scoped copy of the skill
 * block in shared/cardDynamicCss.js, anchored to this block's #uniqueId. Keep
 * in lock-step — same selectors, same breakpoints, same property order.
 */

import commonDynamicCss from '../../shared/commonDynamicCss';
import {
	objectToCssString,
	wrapInMediaQuery,
	borderStyles,
	responsiveSpacingValue,
	spacingShorthandValue,
	singleResponsiveValue,
	typographyStyles,
} from '../../shared/helpFn';

// Responsive Alignment value → flexbox keyword (twin of $flex_align in
// Styles/Member_Skills.php). Empty Tablet/Mobile emit no rule, so they inherit
// the Desktop value through the cascade.
const FLEX_ALIGN = { left: 'flex-start', center: 'center', right: 'flex-end' };

const typoBundle = (attributes, prefix) => ({
	family: attributes[`${prefix}Typography`] || {},
	fontSize: attributes[`${prefix}FontSize`] || {},
	lineHeight: attributes[`${prefix}LineHeight`] || {},
	letterSpacing: attributes[`${prefix}LetterSpacing`] || {},
	wordSpacing: attributes[`${prefix}WordSpacing`] || {},
});

const archiveResponsiveCss = (attributes, deviceType) => {
	const base = `#${attributes.uniqueId}`;
	const rules = [];

	if (deviceType === 'Desktop') {
		const skillRadius = spacingShorthandValue(attributes.skillBarRadius);
		const isSkillStyle3 = (attributes.skillsProgressBarStyle || 'style-2') === 'style-3';
		const trackRadius = isSkillStyle3 ? '0' : skillRadius;

		rules.push(
			{
				selector: `${base} .sp-smart-team-card__skill-name`,
				styles: { color: attributes.skillLabelColor || '' },
			},
			{
				selector: `${base} .sp-smart-team-card__skill-percentage`,
				styles: { color: attributes.skillPercentColor || '' },
			},
			{
				selector: `${base} .sp-smart-team-card__skill-track`,
				styles: {
					'background-color': attributes.skillBarTrackColor || '',
					'border-radius': trackRadius,
				},
			},
			{
				selector: `${base} .sp-smart-team-card__skill-fill`,
				styles: {
					'background-color': attributes.skillBarFillColor || '',
					'border-radius': trackRadius,
				},
			},
			{
				selector: `${base} .sp-smart-team-card__skill--chip`,
				styles: {
					'background-color': attributes.skillButtonBg || '',
					'border-radius': spacingShorthandValue(attributes.skillButtonRadius),
					...borderStyles(
						attributes.skillButtonBorder,
						attributes.skillButtonBorderWidth
					),
				},
			},
			{
				selector: `${base} .sp-smart-team-card__skill--chip, ${base} .sp-smart-team-card__skill--chip .sp-smart-team-card__skill-name, ${base} .sp-smart-team-card__skill--chip .sp-smart-team-card__skill-percentage`,
				styles: { color: attributes.skillButtonColor || '' },
			},
			{
				selector: `${base} .sp-smart-team-card__skills--style-1 .sp-smart-team-card__skill-percentage`,
				styles: { 'background-color': attributes.skillTooltipBgColor || '' },
			},
			{
				selector: `${base} .sp-smart-team-card__skills--style-1 .sp-smart-team-card__skill-percentage::after`,
				styles: { 'border-top-color': attributes.skillTooltipBgColor || '' },
			},
			{
				selector: `${base} .sp-smart-team-card__skills--style-3 .sp-smart-team-card__skill-name`,
				styles: { 'background-color': attributes.skillBarFillColor || '' },
			},
			{
				selector: `${base} .sp-smart-team-card__skills--style-3 .sp-smart-team-card__skill`,
				styles: { 'border-radius': skillRadius },
			}
		);

		// Multi Color Skill Bar — pair N colors the Nth bar (exact position).
		const skillBarColors = Array.isArray(attributes.skillBarColors)
			? attributes.skillBarColors
			: [];
		if (attributes.skillMultiColor && skillBarColors.length) {
			skillBarColors.forEach((pair, i) => {
				const nth = `.sp-smart-team-card__skill:nth-child(${i + 1})`;
				rules.push(
					{
						selector: `${base} ${nth} .sp-smart-team-card__skill-fill`,
						styles: { 'background-color': pair.fill || '' },
					},
					{
						selector: `${base} ${nth} .sp-smart-team-card__skill-track`,
						styles: { 'background-color': pair.track || '' },
					},
					{
						selector: `${base} .sp-smart-team-card__skills--style-3 ${nth} .sp-smart-team-card__skill-name`,
						styles: { 'background-color': pair.fill || '' },
					}
				);
			});
		}
	}

	// Responsive: bar height (track only), skills wrapper margin + gap.
	rules.push(
		{
			selector: `${base} .sp-smart-team-card__skill-track`,
			styles: { height: singleResponsiveValue(attributes.skillsBarHeight, deviceType) },
		},
		{
			selector: `${base} .sp-smart-team-card__skills`,
			styles: {
				margin: responsiveSpacingValue(attributes.skillMargin, deviceType),
				gap: singleResponsiveValue(attributes.skillsItemGap, deviceType),
			},
		},
		{
			selector: `${base} .sp-smart-team-card__skill-name`,
			styles: typographyStyles(typoBundle(attributes, 'skillLabel'), deviceType),
		},
		{
			selector: `${base} .sp-smart-team-card__skill--chip`,
			styles: {
				...typographyStyles(typoBundle(attributes, 'skillButton'), deviceType),
				padding: responsiveSpacingValue(attributes.skillButtonPadding, deviceType),
			},
		},
		{
			// The `--button` class gates the alignment to the chip row: the
			// progress bars are a column flex, where justify-content would shift
			// the bars vertically instead.
			selector: `${base} .sp-smart-team-card__skills--button`,
			styles: {
				margin: responsiveSpacingValue(attributes.skillButtonMargin, deviceType),
				'justify-content':
					FLEX_ALIGN[attributes.skillsAlignment?.device?.[deviceType]] || '',
			},
		}
	);

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
