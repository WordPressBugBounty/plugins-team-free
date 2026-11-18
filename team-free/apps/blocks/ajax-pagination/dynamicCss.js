/**
 * Ajax Pagination — client-side dynamic CSS generator.
 *
 * Twin of blocks/Includes/Styles/Ajax_Pagination.php. Block-specific rules are
 * built per-device in archiveResponsiveCss() and joined with media queries,
 * then the shared section/box styles are appended via commonDynamicCss().
 *
 * Keep this in lock-step with Ajax_Pagination.php — same selectors, same
 * breakpoints, same property order.
 */

import commonDynamicCss from '../../shared/commonDynamicCss';
import {
	objectToCssString,
	wrapInMediaQuery,
	backgroundStyles,
	borderStyles,
	boxShadowValue,
	responsiveSpacingValue,
	singleResponsiveValue,
	spacingShorthandValue,
	typographyStyles,
} from '../../shared/helpFn';

const dynamicCss = (attributes) => {
	const {
		uniqueId,
		paginationColor,
		paginationColorHover,
		paginationBg,
		paginationBorder,
		paginationBorderWidth,
		paginationBoxShadow,
		paginationBoxShadowHover,
		paginationBorderRadius,
		paginationPadding,
		paginationMargin,
		paginationNumberGap,
		paginationAlignment,
	} = attributes;

	// Map the responsive Alignment control value to a flexbox keyword.
	const FLEX_ALIGN = { left: 'flex-start', center: 'center', right: 'flex-end' };

	if (!uniqueId) {
		return '';
	}

	const base = `#${uniqueId}`;

	// Assemble the Typography control bundle for the `pagination` prefix.
	const typoBundle = {
		family: attributes.paginationTypography,
		fontSize: attributes.paginationFontSize,
		lineHeight: attributes.paginationLineHeight,
		letterSpacing: attributes.paginationLetterSpacing,
		wordSpacing: attributes.paginationWordSpacing,
	};

	// Color/background/border/radius and the numbered-buttons gap are
	// non-responsive (Desktop pass); typography, padding and the wrapper margin
	// are emitted per device. Mirrors archive_responsive_css() in PHP.
	const archiveResponsiveCss = (deviceType) => {
		const allResponsiveCss = [];

		const itemStyles = {
			padding: responsiveSpacingValue(paginationPadding, deviceType),
			...typographyStyles(typoBundle, deviceType),
		};

		if (deviceType === 'Desktop') {
			Object.assign(
				itemStyles,
				{
					color: paginationColor || '',
					'border-radius': spacingShorthandValue(paginationBorderRadius),
					'box-shadow': boxShadowValue(paginationBoxShadow),
				},
				backgroundStyles(paginationBg),
				borderStyles(paginationBorder, paginationBorderWidth)
			);

			allResponsiveCss.push({
				// Hover and the runtime's active page (`.is-current`) share one
				// state, like testimonial-pro's Hover & Active. :is() (not
				// :where()) so the hover rule outranks the normal-state rule
				// emitted later at the same base specificity.
				selector: `${base} .sp-smart-team-ajax-pagination__item:is(:hover, .is-current)`,
				styles: {
					color: paginationColorHover || '',
					'box-shadow': boxShadowValue(paginationBoxShadowHover),
					...backgroundStyles({ color: paginationBg?.hover }),
					'border-color': paginationBorder?.hoverColor || '',
				},
			});
		}

		allResponsiveCss.push(
			{
				selector: `${base} .sp-smart-team-ajax-pagination__item`,
				styles: itemStyles,
			},
			{
				// Gap Between Items — responsive (Device icon).
				selector: `${base} .sp-smart-team-ajax-pagination__buttons`,
				styles: { gap: singleResponsiveValue(paginationNumberGap, deviceType) },
			},
			{
				selector: `${base} .sp-smart-team-ajax-pagination__wrapper`,
				styles: {
					margin: responsiveSpacingValue(paginationMargin, deviceType),
					// Tablet/Mobile inherit Desktop until set (empty → no rule).
					'justify-content': FLEX_ALIGN[paginationAlignment?.device?.[deviceType]] || '',
				},
			}
		);

		return allResponsiveCss;
	};

	const desktopCss = [...archiveResponsiveCss('Desktop')];
	const tabletCss = [...archiveResponsiveCss('Tablet')];
	const mobileCss = [...archiveResponsiveCss('Mobile')];

	const tabletMediaQueryCss = wrapInMediaQuery(
		objectToCssString(tabletCss),
		'only screen and (max-width: 1023px)'
	);
	const mobileMediaQueryCss = wrapInMediaQuery(
		objectToCssString(mobileCss),
		'only screen and (max-width: 599px)'
	);

	return `${objectToCssString(
		desktopCss
	)} ${tabletMediaQueryCss} ${mobileMediaQueryCss} ${commonDynamicCss(attributes)}`;
};

export default dynamicCss;
