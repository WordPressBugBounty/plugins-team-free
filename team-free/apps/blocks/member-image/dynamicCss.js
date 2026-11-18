/**
 * Member Image — client-side dynamic CSS generator.
 *
 * Twin of blocks/Includes/Styles/Member_Image.php. A scoped copy of the image
 * rules in shared/cardDynamicCss.js, anchored to this block's #uniqueId. Keep
 * in lock-step — same selectors, same breakpoints, same property order.
 */

import commonDynamicCss from '../../shared/commonDynamicCss';
import {
	objectToCssString,
	wrapInMediaQuery,
	borderStyles,
	spacingShorthandValue,
} from '../../shared/helpFn';

// Extract a width/height dimension (value+unit) for one device, or '' when
// unset. Twin of Member_Image.php size_dim_value().
const sizeDimValue = (size, dim, device) => {
	const value = size?.device?.[device]?.[dim];
	if (value === '' || value === null || value === undefined) {
		return '';
	}
	const unit = size?.unit?.[device]?.[dim] ?? 'px';
	return `${value}${unit}`;
};

const archiveResponsiveCss = (attributes, deviceType) => {
	const base = `#${attributes.uniqueId}`;
	const avatar = `${base} .sp-smart-team-card__avatar`;
	const rules = [];

	// Photo box — Width / Height (an empty Height means Auto). No margin: the
	// block's spacing is Advanced Settings → General.
	const avatarStyles = {
		width: sizeDimValue(attributes.imageSize, 'width', deviceType),
		height: sizeDimValue(attributes.imageSize, 'height', deviceType),
	};

	if (deviceType === 'Desktop') {
		avatarStyles['border-radius'] = spacingShorthandValue(attributes.imageBorderRadius);
		// Border is per state — `none` (the default) emits nothing.
		Object.assign(
			avatarStyles,
			borderStyles(attributes.imageBorder, attributes.imageBorderWidth)
		);
	}

	rules.push({ selector: avatar, styles: avatarStyles });

	if (deviceType === 'Desktop') {
		rules.push({
			selector: `${avatar}:hover`,
			styles: borderStyles(attributes.imageBorderHover, attributes.imageBorderWidthHover),
		});

		// Image Filter is Pro — Free emits no filter CSS (twin of
		// Styles\Member_Image; the stored attributes are left untouched).
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
