/**
 * Carousel — client-side dynamic CSS generator.
 *
 * Twin of blocks/Includes/Styles/Carousel.php. The shared card rules live in
 * ../shared/cardDynamicCss (twin of CardCss.php); this file contributes only
 * the carousel-layout rules: slide alignment, the grouped-effect
 * (fade/cube/flip) multi-column grid, the navigation arrows and the
 * pagination dots.
 */

import { buildDynamicCss } from '../shared/cardDynamicCss';
import { resolvePaginationStyle } from '../shared/proGate';
import {
	backgroundStyles, // eslint-disable-line no-unused-vars -- parity import list
	borderStyles,
	boxShadowValue,
	responsiveSpacingValue,
	spacingShorthandValue,
	singleResponsiveValue,
	typographyStyles,
} from '../../shared/helpFn';

const FLEX_ALIGN = { left: 'flex-start', center: 'center', right: 'flex-end' };

const typoBundle = (attributes, prefix) => ({
	family: attributes[`${prefix}Typography`],
	fontSize: attributes[`${prefix}FontSize`],
	lineHeight: attributes[`${prefix}LineHeight`],
	letterSpacing: attributes[`${prefix}LetterSpacing`],
	wordSpacing: attributes[`${prefix}WordSpacing`],
});

// Navigation-arrow rules for one device (twin of Styles\Carousel::nav_arrow_css()).
// Exported so the Member Photo Gallery block reuses the identical chrome rules
// (PHP twin: Includes\Styles\Carousel_Chrome).
export const navArrowCss = (attributes, base, device) => {
	const rules = [];

	// Placement (top/bottom + left/right) is static in style.scss: Offset X /
	// Offset Y are Pro, so Free never reads navOffsetX/Y.
	rules.push(
		{
			selector: `${base} .sp-smart-team-swiper-nav-arrows`,
			styles: { gap: singleResponsiveValue(attributes.navIconGap, device) },
		},
		{
			selector: `${base} .sp-smart-team-swiper-navigation`,
			styles: { padding: responsiveSpacingValue(attributes.navIconPadding, device) },
		}
	);
	const iconSize = singleResponsiveValue(attributes.navIconSize, device);
	rules.push({
		selector: `${base} .sp-smart-team-swiper-navigation svg`,
		styles: { width: iconSize, height: iconSize },
	});

	if (device === 'Desktop') {
		rules.push(
			{
				selector: `${base} .sp-smart-team-swiper-navigation`,
				styles: {
					color: attributes.navIconColor || '',
					'background-color': attributes.navIconBgColor || '',
					'border-radius': spacingShorthandValue(attributes.navIconBorderRadius),
					'box-shadow': boxShadowValue(attributes.navIconBoxShadow),
					...borderStyles(attributes.navIconBorder, attributes.navIconBorderWidth),
				},
			},
			{
				selector: `${base} .sp-smart-team-swiper-navigation:hover`,
				styles: {
					color: attributes.navIconColorHover || '',
					'background-color': attributes.navIconBgColorHover || '',
					'box-shadow': boxShadowValue(attributes.navIconBoxShadowHover),
					'border-color': attributes.navIconBorder?.hoverColor || '',
				},
			}
		);
	}

	return rules;
};

// Pagination rules for one device (twin of Styles\Carousel::pagination_css()).
export const paginationCss = (attributes, base, device) => {
	const rules = [];
	const stored = attributes.paginationStyle || 'dots';
	const style = resolvePaginationStyle(stored);

	rules.push({
		selector: `${base} .sp-smart-team-swiper-pagination`,
		styles: {
			margin: responsiveSpacingValue(attributes.paginationDotsMargin, device),
			gap: singleResponsiveValue(attributes.paginationDotsSpaceBetween, device),
		},
	});

	// Bullet size. A Pro style falls back to plain dots, and the size Pro seeded
	// for it (e.g. Fraction 60×25) would draw ovals — keep the base 12×12 round
	// dots instead.
	if (stored === style) {
		rules.push({
			selector: `${base} .sp-smart-team-swiper-pagination .swiper-pagination-bullet`,
			styles: {
				width: singleResponsiveValue(attributes.paginationDotsWidth, device),
				height: singleResponsiveValue(attributes.paginationDotsHeight, device),
			},
		});
	}

	// The Numbers style carries text — typography is responsive.
	if (style === 'number') {
		// Number bullets set their own size/line-height, so the text rules must land on them too.
		rules.push({
			selector: `${base} .sp-smart-team-swiper-pagination, ${base} .sp-smart-team-swiper-pagination .swiper-pagination-bullet`,
			styles: typographyStyles(typoBundle(attributes, 'pagination'), device),
		});
	}

	if (device === 'Desktop') {
		rules.push(
			{
				selector: `${base} .sp-smart-team-swiper-pagination.swiper-pagination`,
				styles: {
					'justify-content': FLEX_ALIGN[attributes.paginationDotsPosition] || 'center',
				},
			},
			{
				selector: `${base} .sp-smart-team-swiper-pagination .swiper-pagination-bullet`,
				styles: { 'background-color': attributes.paginationDotsColor || '' },
			},
			{
				selector: `${base} .sp-smart-team-swiper-pagination .swiper-pagination-bullet-active`,
				styles: { 'background-color': attributes.paginationDotsActiveColor || '' },
			}
		);
	}

	return rules;
};

// Carousel-layout rules for one device (twin of Styles\Carousel::layout_responsive_css()).
const carouselResponsiveCss = (attributes, device) => {
	const base = `#${attributes.uniqueId}`;
	const rules = [];

	// Ticker style — a CSS-only marquee. Item width comes from the columns via
	// container-query vars; the loop duration and flow direction ride on the
	// track. Nav/pagination/swiper rules don't apply. Twin of
	// Styles\Carousel::layout_responsive_css().
	if ((attributes.carouselStyle || 'default') === 'ticker') {
		const columns = attributes.columns?.device?.[device] ?? '';
		const gapValue = attributes.columnGap?.device?.[device] ?? '';
		const vars = {};
		if (columns !== '' && columns !== null && columns !== undefined) {
			vars['--sptp-marquee-cols'] = `${parseInt(columns, 10)}`;
		}
		if (gapValue !== '') {
			vars['--sptp-marquee-col-gap'] =
				`${gapValue}${attributes.columnGap?.unit?.[device] ?? 'px'}`;
		}
		if (Object.keys(vars).length) {
			rules.push({ selector: base, styles: vars });
		}

		if (device === 'Desktop') {
			// Loop duration: Carousel Speed when it's a plausible marquee
			// duration (>= 3000ms); transition-scale values fall back to a calm
			// 25s loop. Direction: 'rtl' (default) flows the cards LEFT;
			// 'ltr' reverses it.
			const speed = Number(attributes.carouselSpeed?.value) || 0;
			const duration = speed >= 3000 ? speed : 25000;
			rules.push({
				selector: `${base} .sp-smart-team-marquee-track`,
				styles: {
					'animation-duration': `${duration}ms`,
					'animation-direction':
						attributes.carouselDirection === 'ltr' ? 'reverse' : 'normal',
				},
			});

			if (attributes.alignItems) {
				const align = attributes.alignItems;
				rules.push({
					selector: `${base} .sp-smart-team-marquee-group`,
					styles: {
						'align-items':
							align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align,
					},
				});
			}
		}

		return rules;
	}

	// Grouped effects (fade/cube/flip) show ONE slide at a time — multi-column
	// layouts are emulated by wrapping N cards into each slide, laid out with
	// this per-device CSS grid.
	const effect = attributes.slidingEffect || 'slide';
	const style = attributes.carouselStyle || 'default';
	const grouped = style === 'default' && ['fade', 'cube', 'flip'].includes(effect);
	if (grouped) {
		const columns = attributes.columns?.device?.[device] ?? '';
		const gapValue = attributes.columnGap?.device?.[device] ?? '';
		const gap =
			gapValue !== '' ? `${gapValue}${attributes.columnGap?.unit?.[device] ?? 'px'}` : '';
		const styles = {};
		if (columns !== '' && columns !== null && columns !== undefined) {
			styles['grid-template-columns'] = `repeat(${parseInt(columns, 10)}, minmax(0, 1fr))`;
		}
		if (gap !== '') {
			styles.gap = gap;
		}
		if (Object.keys(styles).length) {
			rules.push({
				selector: `${base} .sp-smart-team-swiper:is(.swiper-fade, .swiper-cube, .swiper-flip) .sp-smart-team-swiper-effect-group`,
				styles,
			});
		}
	}

	// Align Items — vertical alignment of unequal-height slides on the swiper
	// track (non-responsive, Desktop pass).
	if (device === 'Desktop' && attributes.alignItems) {
		const align = attributes.alignItems;
		rules.push({
			selector: `${base} .sp-smart-team-swiper-wrapper`,
			styles: {
				'align-items':
					align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align,
			},
		});
	}

	if (attributes.enableNavigationArrow) {
		rules.push(...navArrowCss(attributes, base, device));
	}
	if (attributes.enablePaginationDots) {
		rules.push(...paginationCss(attributes, base, device));
	}

	return rules;
};

const dynamicCss = (attributes) =>
	buildDynamicCss(attributes, (device) => carouselResponsiveCss(attributes, device));

export default dynamicCss;
