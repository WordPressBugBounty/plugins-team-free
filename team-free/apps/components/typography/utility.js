import { DecorationLineThrough, DecorationUnderline, ItalicIcon } from './svgIcon';

export const fontWeightMap = {
	100: 'Thin 100',
	200: 'Extra Light 200',
	300: 'Light 300',
	400: 'Regular 400',
	500: 'Medium 500',
	600: 'Semi Bold 600',
	700: 'Bold 700',
	800: 'Extra Bold 800',
	900: 'Black 900',
	'100italic': 'italic 100',
	'200italic': 'italic 200',
	'300italic': 'italic 300',
	italic: 'italic 400',
	'400italic': 'italic 400',
	'500italic': 'italic 500',
	'600italic': 'italic 600',
	'700italic': 'italic 700',
	'800italic': 'italic 800',
	'900italic': 'italic 900',
};

export const textDecorationOptions = [
	{
		label: <ItalicIcon />,
		key: 'style',
		value: 'italic',
	},
	{
		label: <DecorationUnderline />,
		key: 'decoration',
		value: 'underline',
	},
	{
		label: <DecorationLineThrough />,
		key: 'decoration',
		value: 'line-through',
	},
];
export const textCaseOptions = [
	{
		label: 'AB',
		key: 'transform',
		value: 'uppercase',
	},
	{
		label: 'ab',
		key: 'transform',
		value: 'lowercase',
	},
	{
		label: 'Ab',
		key: 'transform',
		value: 'capitalize',
	},
];
export const getFontWeightList = (activeFontFamily) => {
	const weightLists = activeFontFamily?.font?.variants
		?.map((variant) => {
			const value = variant === 'regular' ? '400' : variant;
			if (fontWeightMap[value]) {
				return { label: fontWeightMap[value], value };
			}
			return null;
		})
		.filter(Boolean);
	const updatedWeightLists = [
		{ label: 'Select Font Style', value: '', disabled: true },
		...weightLists,
	];
	return updatedWeightLists || [{ label: 'Regular', value: 'regular' }];
};
const bodyFontSizePresets = [
	{ value: 12, label: 12 },
	{ value: 14, label: 14 },
	{ value: 16, label: 16 },
	{ value: 18, label: 18 },
	{ value: 20, label: 20 },
];
const titleFontSizePresets = [
	{ value: 18, label: 18 },
	{ value: 20, label: 20 },
	{ value: 24, label: 24 },
	{ value: 32, label: 32 },
	{ value: 44, label: 44 },
];

export const getFontSizePresets = (type) => {
	return type === 'body' ? bodyFontSizePresets : titleFontSizePresets;
};

export const getGlobalTypoPresets = () => {
	// Try to get from window object first (for backward compatibility).
	if (window.StybleSettings?.getTypography) {
		const globalTypo = window.StybleSettings.getTypography();
		const globalTypoSizes = globalTypo?.typographySizes ?? {};

		const result = [];

		Object.keys(globalTypoSizes).forEach((typoKey) => {
			const typoGroup = globalTypoSizes[typoKey];
			if (Array.isArray(typoGroup)) {
				typoGroup.forEach((item) => {
					// Handle "sizes" group (heading, body, button)
					if (item.sizes && Array.isArray(item.sizes)) {
						item.sizes.forEach((size, index) => {
							result.push({
								class: `sp-smart-team-${item.slug}`,
								fontSize: `var(--sp-smart-team-font-size-${item.slug}-${index + 1}, initial)`,
								lineHeight: `var(--sp-smart-team-line-height-${item.slug}-${index + 1}, initial)`,
								value: `${item.slug}-${index + 1}`,
								label: `${item.title} ${index + 1}`,
							});
						});
					}
					// Handle "custom" group
					if (item.fontSize && !item.sizes) {
						result.push({
							class: `sp-smart-team-${item.slug}`,
							value: `sp-smart-team-${item.slug}`,
							label: item.title,
							fontSize: '',
							lineHeight: '',
						});
					}
				});
			}
		});
		return result;
	}

	// This plugin has no global-settings store, so there are no global presets.
	return [];
};
