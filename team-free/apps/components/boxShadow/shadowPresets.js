/**
 * Box-shadow presets for the bundled BoxShadow control.
 *
 * Slugs match the --sp-smart-team-shadow-* CSS variables defined in the block's
 * style.scss (loaded in both editor and frontend), so a selected preset resolves
 * via var(--sp-smart-team-shadow-<slug>) in either context.
 */
export const shadowDefaultList = {
	shadowList: [
		{
			title: 'Subtle (1dp)',
			custom: false,
			slug: 'subtle-1dp',
			type: 'outset',
			'x-offset': '0',
			'y-offset': '1',
			blur: '2',
			speared: '0',
			color: 'rgba(0, 0, 0, 0.12)',
		},
		{
			title: 'Light (2dp)',
			slug: 'light-2dp',
			custom: false,
			type: 'outset',
			'x-offset': '0',
			'y-offset': '2',
			blur: '4',
			speared: '0',
			color: 'rgba(0, 0, 0, 0.14)',
		},
		{
			title: 'Medium (4dp)',
			slug: 'medium-4dp',
			custom: false,
			type: 'outset',
			'x-offset': '0',
			'y-offset': '4',
			blur: '6',
			speared: '0',
			color: 'rgba(0, 0, 0, 0.16)',
		},
		{
			title: 'Strong (8dp)',
			slug: 'strong-8dp',
			custom: false,
			type: 'outset',
			'x-offset': '0',
			'y-offset': '8',
			blur: '18',
			speared: '0',
			color: 'rgba(0, 0, 0, 0.18)',
		},
		{
			title: 'Deep (12dp)',
			slug: 'deep-12dp',
			custom: false,
			type: 'outset',
			'x-offset': '0',
			'y-offset': '12',
			blur: '17',
			speared: '0',
			color: 'rgba(0, 0, 0, 0.20)',
		},
		{
			title: 'Sharp (4dp)',
			slug: 'sharp-4dp',
			custom: false,
			type: 'outset',
			'x-offset': '4',
			'y-offset': '4',
			blur: '0',
			speared: '0',
			color: 'rgba(0, 0, 0, 0.25)',
		},
	],
	shadowRootCSS: '',
};
