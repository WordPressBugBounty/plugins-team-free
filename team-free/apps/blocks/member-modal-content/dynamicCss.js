/**
 * Member Modal Content — client-side dynamic CSS generator.
 *
 * Twin of blocks/Includes/Styles/Member_Modal_Content.php. Keep this in
 * lock-step — same selectors, same breakpoints, same property order.
 */

import commonDynamicCss from '../../shared/commonDynamicCss';
import {
	objectToCssString,
	wrapInMediaQuery,
	singleResponsiveValue,
	responsiveSpacingValue,
	spacingShorthandValue,
	backgroundStyles,
	borderStyles,
	boxShadowValue,
} from '../../shared/helpFn';

// Normal-state paint for one of the two chrome buttons (close / navigation) —
// the same shape for both, only the attribute prefix differs.
const buttonStyles = (attributes, prefix) => ({
	color: attributes[`${prefix}Color`] || '',
	'border-radius': spacingShorthandValue(attributes[`${prefix}Radius`]),
	...backgroundStyles(attributes[`${prefix}Bg`]),
	...borderStyles(attributes[`${prefix}Border`], attributes[`${prefix}BorderWidth`]),
});

// Hover paint. A hover state that emits NOTHING cannot switch anything off —
// the normal rule keeps painting on hover — so a Border of None must CANCEL the
// normal one, and via a transparent color rather than `border-style: none` so
// the button keeps its size (the documented rule for every per-state pair here).
const buttonHoverStyles = (attributes, prefix) => {
	const normalBorder = borderStyles(
		attributes[`${prefix}Border`],
		attributes[`${prefix}BorderWidth`]
	);
	let hoverBorder = borderStyles(
		attributes[`${prefix}BorderHover`],
		attributes[`${prefix}BorderWidthHover`]
	);

	if (!Object.keys(hoverBorder).length && Object.keys(normalBorder).length) {
		hoverBorder = { 'border-color': 'transparent' };
	}

	return {
		color: attributes[`${prefix}ColorHover`] || '',
		// The hover state lives on the SAME background object, under `hover`.
		...backgroundStyles({ color: attributes[`${prefix}Bg`]?.hover }),
		...hoverBorder,
	};
};

const modalResponsiveCss = (attributes, deviceType) => {
	const base = `#${attributes.uniqueId}`;
	const dialog = `${base} .sp-smart-team-member-modal__dialog`;
	const content = `${base} .sp-smart-team-member-modal__content`;
	const close = `${base} .sp-smart-team-member-modal__close`;
	const rules = [];

	// The dialog box: size per device.
	const dialogStyles = {
		width: singleResponsiveValue(attributes.modalWidth, deviceType),
		'max-height': singleResponsiveValue(attributes.modalMaxHeight, deviceType),
	};

	// Padding goes on the SCROLL CONTAINER, not the dialog — see style.scss:
	// on the dialog it would inset the scrollbar away from the modal's edge.
	rules.push({
		selector: content,
		styles: { padding: responsiveSpacingValue(attributes.modalPadding, deviceType) },
	});

	// Close icon: the glyph is a 1em box, so font-size IS the icon size.
	// Padding is responsive, so it rides every pass (unlike the paint below).
	const closeStyles = {
		'font-size': singleResponsiveValue(attributes.closeIconSize, deviceType),
		padding: responsiveSpacingValue(attributes.closeIconPadding, deviceType),
	};

	// The offset rides a custom property on the root and style.scss decides
	// which edges each `--icon-{position}` modifier applies it to — so neither
	// twin has to branch on the position.
	rules.push({
		selector: base,
		styles: {
			'--sptp-modal-close-offset': singleResponsiveValue(
				attributes.closeIconOffset,
				deviceType
			),
		},
	});

	// Navigation — the arrow row's placement (Offset → the edges the chosen
	// position uses) and the glyph size. The SVGs carry fixed width/height
	// attributes, so the size has to hit the svg, not the button's font-size.
	if (attributes.showNavigation) {
		const offset = singleResponsiveValue(attributes.navigationOffset, deviceType);
		const position = attributes.navigationPosition || 'vertical_center';
		const isBottom = ['bottom_left', 'bottom_center', 'bottom_right'].includes(position);
		const navSize = singleResponsiveValue(attributes.navigationIconSize, deviceType);

		// One Offset, unlike the carousel's X/Y pair: it insets the row from the
		// edges its placement uses. `vertical_center` keeps its 50% anchor (the
		// translate in style.scss re-centers it) and spends the offset on the
		// left/right inset only — an offset there would push it off-centre.
		const placement = { left: offset, right: offset };
		if (position === 'vertical_center') {
			// A constant, not a responsive value — emit it once and let it
			// cascade, instead of repeating it in every media query.
			if (deviceType === 'Desktop') {
				placement.top = '50%';
			}
		} else {
			placement[isBottom ? 'bottom' : 'top'] = offset;
		}

		rules.push({
			selector: `${base} .sp-smart-team-member-modal__nav-arrows`,
			styles: placement,
		});
		rules.push({
			selector: `${base} .sp-smart-team-member-modal__nav svg`,
			styles: { width: navSize, height: navSize },
		});
		rules.push({
			selector: `${base} .sp-smart-team-member-modal__nav`,
			styles: {
				padding: responsiveSpacingValue(attributes.navigationIconPadding, deviceType),
			},
		});
	}

	// Non-responsive paint — Desktop pass only, exactly like every other twin.
	if (deviceType === 'Desktop') {
		Object.assign(
			dialogStyles,
			{
				'border-radius': spacingShorthandValue(attributes.modalRadius),
				'box-shadow': boxShadowValue(attributes.modalBoxShadow),
			},
			backgroundStyles(attributes.modalBg),
			borderStyles(attributes.modalBorder, attributes.modalBorderWidth)
		);

		Object.assign(closeStyles, buttonStyles(attributes, 'closeIcon'));

		// Painted only while Background Overlay is on; with it off the
		// `--no-overlay` class in style.scss zeroes the scrim instead.
		if (attributes.showBackgroundOverlay) {
			rules.push({
				selector: `${base} .sp-smart-team-member-modal__overlay`,
				styles: { 'background-color': attributes.overlayColor || '' },
			});
		}
	}

	rules.push({ selector: dialog, styles: dialogStyles });
	rules.push({ selector: close, styles: closeStyles });

	if (deviceType === 'Desktop') {
		rules.push({
			selector: `${close}:hover`,
			styles: buttonHoverStyles(attributes, 'closeIcon'),
		});

		if (attributes.showNavigation) {
			rules.push({
				selector: `${base} .sp-smart-team-member-modal__nav`,
				styles: buttonStyles(attributes, 'navigationIcon'),
			});
			rules.push({
				selector: `${base} .sp-smart-team-member-modal__nav:hover`,
				styles: buttonHoverStyles(attributes, 'navigationIcon'),
			});
		}
	}

	return rules;
};

const dynamicCss = (attributes) => {
	if (!attributes?.uniqueId) {
		return '';
	}

	const desktop = objectToCssString(modalResponsiveCss(attributes, 'Desktop'));
	const tablet = wrapInMediaQuery(
		objectToCssString(modalResponsiveCss(attributes, 'Tablet')),
		'only screen and (max-width: 1023px)'
	);
	const mobile = wrapInMediaQuery(
		objectToCssString(modalResponsiveCss(attributes, 'Mobile')),
		'only screen and (max-width: 599px)'
	);

	return `${desktop} ${tablet} ${mobile} ${commonDynamicCss(attributes)}`;
};

export default dynamicCss;
