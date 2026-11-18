import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { MemberDescriptionIcon } from './icons';

// Single-page builder field block: renders a member's description (the post
// content). On a member single page it resolves the current member
// automatically; the "Member" control can pin a specific member.
registerBlockType('sptp/member-description', {
	apiVersion: 3,
	title: __('Member Description', 'team-free'),
	description: __("Display a team member's full description.", 'team-free'),
	category: 'sptp',
	icon: <MemberDescriptionIcon />,
	keywords: [
		__('team', 'team-free'),
		__('member', 'team-free'),
		__('description', 'team-free'),
		__('bio', 'team-free'),
		__('about', 'team-free'),
	],
	supports: {
		// The renderers already emit the `align{value}` class on #uniqueId.
		align: ['wide', 'full'],
		html: false,
		customClassName: true,
	},
	edit: Edit,
	save,
});
