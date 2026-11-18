import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { SocialProfileIcon } from './icons';

// Single-page builder field block: renders a member's social-profile icons.
// On a member page it resolves the current member.
registerBlockType('sptp/social-profile', {
	apiVersion: 3,
	title: __('Social Profile', 'team-free'),
	description: __("Display a team member's social profile icons.", 'team-free'),
	category: 'sptp',
	icon: <SocialProfileIcon />,
	keywords: [__('team', 'team-free'), __('member', 'team-free'), __('social', 'team-free')],
	supports: {
		// The renderers already emit the `align{value}` class on #uniqueId.
		align: ['wide', 'full'],
		html: false,
		customClassName: true,
	},
	edit: Edit,
	save,
});
