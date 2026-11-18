import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { MemberBioIcon } from './icons';

// Single-page builder field block: renders a member's short bio. On a member
// single page it resolves the current member automatically; the "Member"
// control can pin a specific member.
registerBlockType('sptp/member-bio', {
	apiVersion: 3,
	title: __('Member Bio', 'team-free'),
	description: __("Display a team member's short bio.", 'team-free'),
	category: 'sptp',
	icon: <MemberBioIcon />,
	keywords: [
		__('team', 'team-free'),
		__('member', 'team-free'),
		__('bio', 'team-free'),
		__('short bio', 'team-free'),
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
