/**
 * Shared member-card dynamic CSS (editor).
 *
 * Twin of blocks/Includes/Styles/CardCss.php. cardResponsiveCss() builds the
 * per-device rules for the shared `.sp-smart-team-card` markup; every layout
 * block's dynamicCss.js composes it with its own layout rules through
 * buildDynamicCss(). Keep this in lock-step with CardCss.php — same selectors,
 * same breakpoints, same property order.
 */

import commonDynamicCss from '../../shared/commonDynamicCss';
import {
	objectToCssString,
	wrapInMediaQuery,
	backgroundStyles,
	borderStyles,
	boxShadowValue,
	responsiveSpacingValue,
	spacingShorthandValue,
	singleResponsiveValue,
	typographyStyles,
} from '../../shared/helpFn';
import { resolveMaskShape, resolveStyleAttributes } from './proGate';

// Map the contentAlignment button-group value to a flexbox alignment keyword.
const FLEX_ALIGN = { left: 'flex-start', center: 'center', right: 'flex-end' };

// Extract a width/height dimension (value+unit) from a width_height attribute
// for a device, or '' when unset. Twin of Grid.php size_dim_value().
const sizeDimValue = (size, dim, device) => {
	const value = size?.device?.[device]?.[dim];
	if (value === '' || value === null || value === undefined) {
		return '';
	}
	const unit = size?.unit?.[device]?.[dim] ?? 'px';
	return `${value}${unit}`;
};

// True when a spacing attribute has any side filled on any device. Only an empty
// side is unset (the SCSS look holds) — 0 is a real value, as in Pro.
// Twin of CardCss::spacing_has_value().
const spacingHasValue = (spacing) => {
	// Plain spacing shape ({ value: { top, … }, unit }) — one side set is enough.
	const sideSet = (sides) =>
		Object.values(sides || {}).some((v) => v !== '' && v !== null && v !== undefined);
	const devices = spacing?.device;
	if (!devices) {
		return sideSet(spacing?.value);
	}
	return Object.values(devices).some(sideSet);
};

// Shared card rules for one device (twin of CardCss::card_responsive_css()).
export const cardResponsiveCss = (attributes, deviceType) => {
	const {
		cardDesign,
		imageContentGap,
		imageAreaGap,
		contentBoxWidth,
		contentBoxOffset,
		contentBoxAlignment,
		contentAlignment,
		cardBg,
		cardBorder,
		cardBorderWidth,
		cardBorderRadius,
		cardBoxShadow,
		cardBoxShadowHover,
		cardPadding,
		cardBorderHover,
		cardBorderWidthHover,
		nameColor,
		nameColorHover,
		nameBgColor,
		nameBgColorHover,
		namePadding,
		nameMargin,
		roleColor,
		roleBgColor,
		rolePadding,
		roleMargin,
		bioColor,
		bioMargin,
		imageRadius,
		imageSize,
		imageMasking,
		imageMaskShape,
		imageBorderRadius,
		imageMargin,
		metaTextColor,
		metaTextColorHover,
		metaIconColor,
		metaIconColorHover,
		metaIconSize,
		metaIconGap,
		metaItemGap,
		socialIconSize,
		socialIconAreaSize,
		socialIconOffset,
		socialItemGap,
		socialBorderRadius,
		socialMargin,
		skillBarFillColor,
		skillBarTrackColor,
		skillLabelColor,
		skillPercentColor,
		skillTooltipBgColor,
		skillsBarHeight,
		skillsItemGap,
		skillBarRadius,
		skillMargin,
		skillButtonColor,
		skillButtonBg,
		skillButtonBorder,
		skillButtonBorderWidth,
		skillButtonRadius,
		skillButtonPadding,
		skillButtonMargin,
		readMoreButton,
		readMoreColor,
		readMoreColorHover,
		readMoreBg,
		readMoreBorder,
		readMoreBorderHover,
		readMoreBorderWidth,
		readMoreBorderWidthHover,
		readMoreBoxShadow,
		readMoreBoxShadowHover,
		readMoreRadius,
		readMorePadding,
		readMoreMargin,
	} = attributes;

	const base = `#${attributes.uniqueId}`;

	// Assemble a Typography control bundle for an element prefix (name/role/bio).
	const typoBundle = (prefix) => ({
		family: attributes[`${prefix}Typography`],
		fontSize: attributes[`${prefix}FontSize`],
		lineHeight: attributes[`${prefix}LineHeight`],
		letterSpacing: attributes[`${prefix}LetterSpacing`],
		wordSpacing: attributes[`${prefix}WordSpacing`],
	});

	const allResponsiveCss = [];

	// Card box (Card Elements → Style tab) — background, border, radius,
	// shadow are non-responsive (Desktop pass); padding is per device. On
	// the overlap/panel designs (card-3/4/5) and the overlay-2 preset the
	// visible card is the __content box (overlap box / mint panel / overlay-2's
	// floating bottom panel), so the WHOLE box styling retargets there (values
	// emit only when set, so the SCSS panel look holds by default); card-6 has
	// no box, so only its background moves. overlay-2 is the only overlay design whose __content
	// reads as a discrete box, so it alone gets the box retarget; the other
	// overlays keep border/radius/padding on the full-bleed card.
	const isOverlayDesign = typeof cardDesign === 'string' && cardDesign.indexOf('overlay-') === 0;
	const boxOnContent = ['card-3', 'card-4', 'card-5', 'overlay-2'].includes(cardDesign);
	const cardStyles = boxOnContent
		? {}
		: { padding: responsiveSpacingValue(cardPadding, deviceType) };
	const contentStyles =
		boxOnContent && spacingHasValue(cardPadding)
			? { padding: responsiveSpacingValue(cardPadding, deviceType) }
			: {};
	if (deviceType === 'Desktop') {
		// Image To Content Gap — the photo-to-text flex gap on card-2's split
		// row. Image Area Gap is card-9's equivalent for its __side column.
		const imageGap = imageContentGap?.value ?? '';
		const areaGap = imageAreaGap?.value ?? '';
		const splitGap =
			cardDesign === 'card-2' && imageGap !== ''
				? `${imageGap}${imageContentGap?.unit ?? 'px'}`
				: cardDesign === 'card-9' && areaGap !== ''
					? `${areaGap}${imageAreaGap?.unit ?? 'px'}`
					: '';
		// On these designs the visible card is the __content box (card-3's
		// overlap box, card-4/5's mint panel; card-6 has
		// no box and content spans the card) while the item stays transparent —
		// paint the card background there instead.
		// Overlay: the Card Content Background is the overlay scrim, so it paints
		// __content (not the transparent item) — same as the panel designs
		// (isOverlayDesign is computed above with boxOnContent).
		// UNLESS Image Masking is on: the photo is then a shape and the background
		// belongs INSIDE it, so it moves to a layer within the masked wrap (the
		// `bgInMask` rules further down) and is emitted neither on __content nor on
		// the item — a card-wide scrim would spill across the bare card around the
		// shape.
		const bgInMask = isOverlayDesign && !!imageMasking && !!imageMaskShape;
		const bgOnContent =
			(isOverlayDesign && !bgInMask) ||
			['card-3', 'card-4', 'card-5', 'card-6'].includes(cardDesign);
		const boxStyles = {
			'border-radius': boxOnContent
				? spacingHasValue(cardBorderRadius)
					? spacingShorthandValue(cardBorderRadius)
					: ''
				: spacingShorthandValue(cardBorderRadius),
			'box-shadow': boxShadowValue(cardBoxShadow),
			...borderStyles(cardBorder, cardBorderWidth),
		};
		const hoverBoxStyles = {
			'box-shadow': boxShadowValue(cardBoxShadowHover),
			...borderStyles(cardBorderHover, cardBorderWidthHover),
		};
		Object.assign(
			cardStyles,
			{ gap: splitGap },
			boxOnContent ? {} : boxStyles,
			bgOnContent || bgInMask ? {} : backgroundStyles(cardBg)
		);
		// card-5's photo-to-text clearance lives inside the panel's padding
		// calc — feed the Image To Content Gap in via the CSS var instead of
		// a flex gap (the photo overlaps the panel, so a gap would split
		// them). Set on the item; the panel inherits it.
		if (cardDesign === 'card-5' && imageGap !== '') {
			cardStyles['--sptp-image-content-gap'] = `${imageGap}${imageContentGap?.unit ?? 'px'}`;
		}

		allResponsiveCss.push({
			selector: `${base} .sp-smart-team-card:hover`,
			styles: {
				...(boxOnContent ? {} : hoverBoxStyles),
				...(bgOnContent || bgInMask ? {} : backgroundStyles({ color: cardBg?.hover })),
			},
		});

		if (bgOnContent || boxOnContent) {
			Object.assign(
				contentStyles,
				boxOnContent ? boxStyles : {},
				bgOnContent ? backgroundStyles(cardBg) : {}
			);
			allResponsiveCss.push({
				selector: `${base} .sp-smart-team-card:hover .sp-smart-team-card__content`,
				styles: {
					...(boxOnContent ? hoverBoxStyles : {}),
					...(bgOnContent ? backgroundStyles({ color: cardBg?.hover }) : {}),
				},
			});
		}

		// A set Background REPLACES the preset's SCSS scrim — unmasked that happens
		// by itself (both are `background` on __content, and #uniqueId wins). With
		// the color moved inside the shape the replacement has to be explicit, or
		// the scrim keeps painting over the whole card AND over the shape (it is
		// z-index 2, the masked layer is inside the z-index 1 avatar), leaving the
		// control looking dead.
		if (bgInMask) {
			const maskBgSet = Object.keys(backgroundStyles(cardBg)).length > 0;
			const maskBgHoverSet =
				Object.keys(backgroundStyles({ color: cardBg?.hover })).length > 0;
			const clearBg = { 'background-color': 'transparent', 'background-image': 'none' };
			if (maskBgSet) {
				Object.assign(contentStyles, clearBg);
			}
			if (maskBgSet || maskBgHoverSet) {
				allResponsiveCss.push({
					selector: `${base} .sp-smart-team-card:hover .sp-smart-team-card__content`,
					styles: clearBg,
				});
			}
		}
	}
	allResponsiveCss.push({
		selector: `${base} .sp-smart-team-card`,
		styles: cardStyles,
	});
	allResponsiveCss.push({
		selector: `${base} .sp-smart-team-card__content`,
		styles: contentStyles,
	});

	// card-3 Content Box (Display Settings) — the overlap box's width and how
	// far it climbs over the photo (offset → negative top margin) are
	// responsive; the horizontal alignment is not.
	if (cardDesign === 'card-3') {
		const contentBox = {
			width: singleResponsiveValue(contentBoxWidth, deviceType),
		};
		const boxOffset = singleResponsiveValue(contentBoxOffset, deviceType);
		if (boxOffset !== '') {
			contentBox['margin-top'] = `-${boxOffset}`;
		}
		if (deviceType === 'Desktop') {
			contentBox['align-self'] = FLEX_ALIGN[contentBoxAlignment] || 'center';
		}
		allResponsiveCss.push({
			selector: `${base} .sp-smart-team-card__content`,
			styles: contentBox,
		});
	}

	// Member Image → size (width/height) + margin, per device. Margin only
	// emits when the user set a non-zero value so the full-bleed default holds.
	// Width 100% (the default) means "full bleed": the SCSS stretch +
	// negative side margins already span the card edge-to-edge, while an
	// explicit width:100% would resolve against __content's padded box and
	// leave the photo short on the right — emit custom sizes only.
	// Overlay designs have NO image Width/Height and NO image margin at all (the
	// panel hides both controls): the avatar is absolutely positioned to fill the
	// card, so a width would win over the right inset and a margin would shrink
	// the full-bleed photo — skip them even if older values are saved.
	const avatarWidth = sizeDimValue(imageSize, 'width', deviceType);
	const avatarStyles = isOverlayDesign
		? {}
		: {
				width: avatarWidth === '100%' ? '' : avatarWidth,
				height: sizeDimValue(imageSize, 'height', deviceType),
			};
	if (!isOverlayDesign && spacingHasValue(imageMargin)) {
		avatarStyles.margin = responsiveSpacingValue(imageMargin, deviceType);
	}
	allResponsiveCss.push({
		selector: `${base} .sp-smart-team-card__avatar`,
		styles: avatarStyles,
	});

	// Responsive: Basic Information typography + margin (name/role/bio).
	// Margin only emits when the user set a non-zero value, so card-design
	// structural margins (e.g. card-2's tight name/role pair) hold by default.
	// On card-8 the name/role caption chips also take a Padding (empty by
	// default so the SCSS caption padding holds).
	const isCard8 = cardDesign === 'card-8';
	allResponsiveCss.push(
		{
			selector: `${base} .sp-smart-team-card__name`,
			styles: {
				...typographyStyles(typoBundle('name'), deviceType),
				margin: spacingHasValue(nameMargin)
					? responsiveSpacingValue(nameMargin, deviceType)
					: '',
				padding: isCard8 ? responsiveSpacingValue(namePadding, deviceType) : '',
			},
		},
		{
			selector: `${base} .sp-smart-team-card__role`,
			styles: {
				...typographyStyles(typoBundle('role'), deviceType),
				margin: spacingHasValue(roleMargin)
					? responsiveSpacingValue(roleMargin, deviceType)
					: '',
				padding: isCard8 ? responsiveSpacingValue(rolePadding, deviceType) : '',
			},
		},
		{
			selector: `${base} .sp-smart-team-card__bio`,
			styles: {
				...typographyStyles(typoBundle('bio'), deviceType),
				margin: spacingHasValue(bioMargin)
					? responsiveSpacingValue(bioMargin, deviceType)
					: '',
			},
		}
	);

	// Responsive: Additional Information meta rows (contact details + custom
	// info, both carry __detail) — typography + icon-to-label gap; meta-icon
	// size; gap between custom-info items.
	allResponsiveCss.push(
		{
			selector: `${base} .sp-smart-team-card__detail`,
			styles: {
				...typographyStyles(typoBundle('meta'), deviceType),
				gap: singleResponsiveValue(metaIconGap, deviceType),
			},
		},
		{
			selector: `${base} .sp-smart-team-card__meta-icon :is(i, svg)`,
			styles: { 'font-size': singleResponsiveValue(metaIconSize, deviceType) },
		},
		{
			selector: `${base} .sp-smart-team-card__custom`,
			styles: { gap: singleResponsiveValue(metaItemGap, deviceType) },
		}
	);

	// Responsive: Social icons — area (box) size, icon (glyph) size, gap.
	const socialArea = singleResponsiveValue(socialIconAreaSize, deviceType);
	// Margin belongs to the whole row, not each chip. !important: the
	// `ul[class*='sp-smart-team-']` reset in style.scss sets margin with !important.
	const socialRowMargin = responsiveSpacingValue(socialMargin, deviceType);
	allResponsiveCss.push(
		{
			selector: `${base} .sp-smart-team-card__social`,
			styles: {
				gap: singleResponsiveValue(socialItemGap, deviceType),
				margin: socialRowMargin ? `${socialRowMargin} !important` : '',
			},
		},
		{
			selector: `${base} .sp-smart-team-card__social a`,
			styles: {
				width: socialArea,
				height: socialArea,
				'font-size': singleResponsiveValue(socialIconSize, deviceType),
			},
		},
		// card-6 flyout — the "+"/"×" toggle chip matches the icon area size,
		// and the Offset control feeds the corner inset via a CSS variable
		// consumed by the position variants in style.scss.
		{
			selector: `${base} .sp-smart-team-card__social-toggle`,
			styles: { width: socialArea, height: socialArea },
		},
		{
			selector: `${base} .sp-smart-team-card__social-flyout`,
			styles: {
				'--sptp-social-flyout-offset': singleResponsiveValue(socialIconOffset, deviceType),
			},
		}
	);
	// Non-responsive: colors, image radius, social colors.
	if (deviceType === 'Desktop') {
		// card-8 caption chips — the name/role Background Color controls only
		// apply on that design (the chips are its on-photo caption boxes).
		allResponsiveCss.push(
			{
				selector: `${base} .sp-smart-team-card__name`,
				styles: {
					color: nameColor || '',
					'background-color': isCard8 ? nameBgColor || '' : '',
				},
			},
			{
				selector: `${base} .sp-smart-team-card__name:hover`,
				styles: {
					color: nameColorHover || '',
					'background-color': isCard8 ? nameBgColorHover || '' : '',
				},
			},
			{
				selector: `${base} .sp-smart-team-card__role`,
				styles: {
					color: roleColor || '',
					'background-color': isCard8 ? roleBgColor || '' : '',
				},
			},
			{
				selector: `${base} .sp-smart-team-card__bio`,
				styles: { color: bioColor || '' },
			}
		);

		// Non-responsive: Additional Information colors (Normal/Hover). Text color
		// cascades to the value links (a { color: inherit }); icon color drives
		// the glyph fill and (for outline/light styles) the stroke via currentColor.
		// The contact row's HOVER state is scoped to LINKED rows — `:has(a)`. Email,
		// mobile, phone and website render an anchor; Location, Experience, Language,
		// Gender do not, and recolouring those on hover promised a click that does
		// nothing. Gated on the ROW being hovered (not `a:hover`) so icon + value
		// respond together, and so it still previews in the editor canvas where the
		// links are inert. Twin of Styles/CardCss.php.
		const detailLinkHover = `${base} .sp-smart-team-card__detail:has(a):hover`;
		allResponsiveCss.push(
			{
				selector: `${base} .sp-smart-team-card__detail`,
				styles: { color: metaTextColor || '' },
			},
			{
				selector: detailLinkHover,
				styles: { color: metaTextColorHover || '' },
			},
			{
				selector: `${base} .sp-smart-team-card__meta-icon :is(i, svg)`,
				styles: { color: metaIconColor || '' },
			},
			{
				selector: `${detailLinkHover} .sp-smart-team-card__meta-icon :is(i, svg)`,
				styles: { color: metaIconColorHover || '' },
			}
		);

		const radiusValue = imageRadius?.value ?? '';
		const radiusUnit = imageRadius?.unit ?? 'px';
		if (radiusValue !== '' && radiusValue !== null && radiusValue !== undefined) {
			allResponsiveCss.push({
				selector: `${base} .sp-smart-team-card__avatar`,
				styles: { 'border-radius': `${radiusValue}${radiusUnit}` },
			});
		}

		// Member Image → Border Radius (the live Style-tab control) — emitted
		// after imageRadius so it is authoritative for the avatar corners.
		allResponsiveCss.push({
			selector: `${base} .sp-smart-team-card__avatar`,
			styles: { 'border-radius': spacingShorthandValue(imageBorderRadius) },
		});

		// Member Image → Image Masking (ported from Styble Pro) — the chosen
		// preset SVG masks the photo box. Fixed contain/center/no-repeat per the
		// Figma panel (no size/position controls). Twin of Grid.php.
		// A Pro shape previews as the diamond (resolveMaskShape ↔
		// Pro_Gate::mask_shape()).
		if (imageMasking && imageMaskShape) {
			const maskUrl = `url(${
				window.sptpBlocksEditor?.blocksUrl || ''
			}assets/images/mask/${resolveMaskShape(imageMaskShape)}.svg)`;
			allResponsiveCss.push(
				{
					selector: `${base} .sp-smart-team-card__image-wrap`,
					styles: {
						'-webkit-mask-image': maskUrl,
						'mask-image': maskUrl,
						'-webkit-mask-size': 'contain',
						'mask-size': 'contain',
						'-webkit-mask-repeat': 'no-repeat',
						'mask-repeat': 'no-repeat',
						'-webkit-mask-position': 'center center',
						'mask-position': 'center center',
					},
				},
				// The avatar's gray placeholder background sits behind the masked
				// wrap and would show around the shape — clear it while masking.
				{
					selector: `${base} .sp-smart-team-card__avatar`,
					styles: { background: 'transparent' },
				}
			);

			// Overlay + masking: the Card Content Background paints INSIDE THE
			// SHAPE ONLY. It normally paints `__content` — an absolute layer over
			// the whole card — which with a mask spills across the bare card
			// around the shape. So on these designs it moves to a layer INSIDE the
			// masked wrap (`::after` over the photo), which the mask clips for
			// free, and `bgOnContent` skips `__content` (see the card-box block
			// above). Emitted only when a background is actually set, so an empty
			// control leaves no stray layer. `pointer-events: none` keeps the photo
			// link / social flyout clickable underneath.
			if (isOverlayDesign) {
				const maskBg = backgroundStyles(cardBg);
				const maskBgHover = backgroundStyles({ color: cardBg?.hover });
				if (Object.keys(maskBg).length) {
					allResponsiveCss.push({
						selector: `${base} .sp-smart-team-card__image-wrap::after`,
						styles: {
							content: '""',
							position: 'absolute',
							inset: '0',
							'pointer-events': 'none',
							...maskBg,
						},
					});
				}
				if (Object.keys(maskBgHover).length) {
					allResponsiveCss.push({
						selector: `${base} .sp-smart-team-card:hover .sp-smart-team-card__image-wrap::after`,
						styles: maskBgHover,
					});
				}
			}
		}

		// Member Image → Image Filter is Pro — Free emits no filter CSS
		// (twin of CardCss; the stored attributes are left untouched).

		// Social icons — border radius only. Custom Styling (per-state color /
		// background / border / box-shadow) is Pro — Free emits no CSS for it
		// (twin of CardCss; the stored attributes are left untouched).
		allResponsiveCss.push({
			selector: `${base} .sp-smart-team-card__social a`,
			styles: { 'border-radius': spacingShorthandValue(socialBorderRadius) },
		});

		// Non-responsive: card content alignment (text + flex children).
		if (contentAlignment) {
			const flexAlign = FLEX_ALIGN[contentAlignment] || 'center';
			allResponsiveCss.push(
				{
					selector: `${base} .sp-smart-team-card__content`,
					styles: { 'text-align': contentAlignment, 'align-items': flexAlign },
				},
				{
					// Skills only in the button (chip) display — bar styles are a
					// column flex where justify-content would shift bars vertically.
					selector: `${base} .sp-smart-team-card__detail, ${base} .sp-smart-team-card__social, ${base} .sp-smart-team-card__skills--button`,
					styles: { 'justify-content': flexAlign },
				}
			);
		}

		// Non-responsive: skill bar colors + radius. In style-3 the radius
		// rounds the clipping .skill (below) and the inner track/fill stay
		// square; every other style rounds the track + fill directly.
		const skillRadius = spacingShorthandValue(skillBarRadius);
		const isSkillStyle3 = (attributes.skillsProgressBarStyle || 'style-1') === 'style-3';
		allResponsiveCss.push(
			{
				selector: `${base} .sp-smart-team-card__skill-name`,
				styles: { color: skillLabelColor || '' },
			},
			{
				selector: `${base} .sp-smart-team-card__skill-percentage`,
				styles: { color: skillPercentColor || '' },
			},
			{
				selector: `${base} .sp-smart-team-card__skill-track`,
				styles: {
					'background-color': skillBarTrackColor || '',
					'border-radius': isSkillStyle3 ? '0' : skillRadius,
				},
			},
			{
				selector: `${base} .sp-smart-team-card__skill-fill`,
				styles: {
					'background-color': skillBarFillColor || '',
					'border-radius': isSkillStyle3 ? '0' : skillRadius,
				},
			},
			// Button display (chip) — background, border and radius from the
			// Button style controls (typography/padding/margin below, per device).
			{
				selector: `${base} .sp-smart-team-card__skill--chip`,
				styles: {
					'background-color': skillButtonBg || '',
					'border-radius': spacingShorthandValue(skillButtonRadius),
					...borderStyles(skillButtonBorder, skillButtonBorderWidth),
				},
			},
			// Chip text color — also targets name/percentage so it beats the
			// progress skillLabel/skillPercent color rules' ID specificity.
			{
				selector: `${base} .sp-smart-team-card__skill--chip, ${base} .sp-smart-team-card__skill--chip .sp-smart-team-card__skill-name, ${base} .sp-smart-team-card__skill--chip .sp-smart-team-card__skill-percentage`,
				styles: { color: skillButtonColor || '' },
			},
			// Style-1 tooltip bubble background (+ its caret) — the "Tooltip
			// Background Color" control only affects the style-1 bubble.
			{
				selector: `${base} .sp-smart-team-card__skills--style-1 .sp-smart-team-card__skill-percentage`,
				styles: { 'background-color': skillTooltipBgColor || '' },
			},
			{
				selector: `${base} .sp-smart-team-card__skills--style-1 .sp-smart-team-card__skill-percentage::after`,
				styles: { 'border-top-color': skillTooltipBgColor || '' },
			},
			// Style-3 — the name block sits on the bar, so it takes the fill color.
			{
				selector: `${base} .sp-smart-team-card__skills--style-3 .sp-smart-team-card__skill-name`,
				styles: { 'background-color': skillBarFillColor || '' },
			},
			// Style-3 — the skill clips to the bar radius so both ends round
			// (the name block on the left and the track on the right).
			{
				selector: `${base} .sp-smart-team-card__skills--style-3 .sp-smart-team-card__skill`,
				styles: { 'border-radius': skillRadius },
			}
		);

		// Multi Color Skill Bar — pair N colors the Nth bar (exact position,
		// no cycling); bars beyond the list keep the common fill/track
		// colors above. The nth-child selectors are more specific than the
		// global rules, so only background-color is overridden per pair.
		const skillBarColors = Array.isArray(attributes.skillBarColors)
			? attributes.skillBarColors
			: [];
		if (attributes.skillMultiColor && skillBarColors.length) {
			skillBarColors.forEach((pair, i) => {
				const nth = `.sp-smart-team-card__skill:nth-child(${i + 1})`;
				allResponsiveCss.push(
					{
						selector: `${base} ${nth} .sp-smart-team-card__skill-fill`,
						styles: { 'background-color': pair.fill || '' },
					},
					{
						selector: `${base} ${nth} .sp-smart-team-card__skill-track`,
						styles: { 'background-color': pair.track || '' },
					},
					// Style-3 — the name block rides the fill color (same as the
					// global rule above).
					{
						selector: `${base} .sp-smart-team-card__skills--style-3 ${nth} .sp-smart-team-card__skill-name`,
						styles: { 'background-color': pair.fill || '' },
					}
				);
			});
		}
	}

	// Responsive: skill bar height + skills block margin. Height is set on the
	// track only; the fill keeps its base height:100% so style-3's taller bar
	// (min-height) is filled without fighting an explicit fill height.
	const barHeight = singleResponsiveValue(skillsBarHeight, deviceType);
	allResponsiveCss.push(
		{
			selector: `${base} .sp-smart-team-card__skill-track`,
			styles: { height: barHeight },
		},
		{
			selector: `${base} .sp-smart-team-card__skills`,
			styles: {
				margin: responsiveSpacingValue(skillMargin, deviceType),
				gap: singleResponsiveValue(skillsItemGap, deviceType),
			},
		},
		// Label typography (Skills → Style → Label Typography) — responsive,
		// on the bar-style skill name (the chip styles its own text below).
		{
			selector: `${base} .sp-smart-team-card__skill-name`,
			styles: typographyStyles(typoBundle('skillLabel'), deviceType),
		},
		// Button display (chip) — responsive typography and padding per chip;
		// the Margin control spaces the whole skills wrapper, not each chip.
		{
			selector: `${base} .sp-smart-team-card__skill--chip`,
			styles: {
				...typographyStyles(typoBundle('skillButton'), deviceType),
				padding: responsiveSpacingValue(skillButtonPadding, deviceType),
			},
		},
		{
			selector: `${base} .sp-smart-team-card__skills--button`,
			styles: { margin: responsiveSpacingValue(skillButtonMargin, deviceType) },
		}
	);

	// Read More button — only when the button is enabled. Color/background/
	// border/radius/shadow are non-responsive (Desktop pass); typography,
	// padding and margin are emitted per device.
	if (readMoreButton) {
		const btnStyles = {
			padding: responsiveSpacingValue(readMorePadding, deviceType),
			...typographyStyles(typoBundle('readMore'), deviceType),
		};

		if (deviceType === 'Desktop') {
			Object.assign(
				btnStyles,
				{
					color: readMoreColor || '',
					'border-radius': spacingShorthandValue(readMoreRadius),
					'box-shadow': boxShadowValue(readMoreBoxShadow),
				},
				backgroundStyles(readMoreBg),
				borderStyles(readMoreBorder, readMoreBorderWidth)
			);

			allResponsiveCss.push({
				selector: `${base} .sp-smart-team-card__read-more-btn:hover`,
				styles: {
					color: readMoreColorHover || '',
					'box-shadow': boxShadowValue(readMoreBoxShadowHover),
					...backgroundStyles({ color: readMoreBg?.hover }),
					...borderStyles(readMoreBorderHover, readMoreBorderWidthHover),
				},
			});
		}

		allResponsiveCss.push(
			{
				selector: `${base} .sp-smart-team-card__read-more-btn`,
				styles: btnStyles,
			},
			{
				selector: `${base} .sp-smart-team-card__read-more`,
				// Gated like every other margin control so the default (all-zero)
				// is not emitted — otherwise a `margin:0` at ID specificity would
				// clobber layout margins the card CSS sets on __read-more (e.g.
				// the overlay-2 collapse margin that hides Read More until hover).
				styles: {
					margin: spacingHasValue(readMoreMargin)
						? responsiveSpacingValue(readMoreMargin, deviceType)
						: '',
				},
			}
		);
	}

	return allResponsiveCss;
};

// Assemble the full dynamic CSS string: layout rules (per block) + shared card
// rules per device, media-query wrapped, plus the common section/box styles
// (twin of CardCss::generate()).
export const buildDynamicCss = (rawAttributes, layoutRules = () => []) => {
	if (!rawAttributes.uniqueId) {
		return '';
	}
	// Same design the canvas renders and no leftover overlay white text (twin
	// of the Pro_Gate::style_attributes() call in CardCss::__construct()).
	const attributes = resolveStyleAttributes(rawAttributes);

	const perDevice = (device) => [
		...layoutRules(device),
		...cardResponsiveCss(attributes, device),
	];

	const tabletMediaQueryCss = wrapInMediaQuery(
		objectToCssString(perDevice('Tablet')),
		'only screen and (max-width: 1023px)'
	);
	const mobileMediaQueryCss = wrapInMediaQuery(
		objectToCssString(perDevice('Mobile')),
		'only screen and (max-width: 599px)'
	);

	return `${objectToCssString(
		perDevice('Desktop')
	)} ${tabletMediaQueryCss} ${mobileMediaQueryCss} ${commonDynamicCss(attributes)}`;
};
