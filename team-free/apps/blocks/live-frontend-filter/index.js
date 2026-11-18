/**
 * Live Frontend Filter — Pro-only block registration. See ../carousel-3d/index.js
 * for why this carries no real edit UI. save.jsx is the one exception: it is
 * kept identical to Pro's for content-validity (see save.jsx for why).
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import save from './save.jsx';
import { LiveFrontendFilterIcon } from './icons';

registerBlockType('sptp/live-frontend-filter', {
	apiVersion: 3,
	title: __('Live Frontend Filter', 'team-free'),
	description: __(
		'Filter team members instantly on the frontend without page reload.',
		'team-free'
	),
	category: 'sptp',
	parent: ['sptp/team-group'],
	icon: <LiveFrontendFilterIcon />,
	supports: {
		html: false,
		inserter: false,
		customClassName: true,
	},
	edit: () => null,
	save,
});
