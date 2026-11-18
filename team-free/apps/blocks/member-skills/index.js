import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { MemberSkillsIcon } from './icons';

// Single-page builder field block: renders a member's skills as progress bars
// or button/chips. On a member page it resolves the current member.
registerBlockType('sptp/member-skills', {
	apiVersion: 3,
	title: __('Member Skills', 'team-free'),
	description: __("Display a team member's skills as progress bars or buttons.", 'team-free'),
	category: 'sptp',
	icon: <MemberSkillsIcon />,
	keywords: [__('team', 'team-free'), __('member', 'team-free'), __('skills', 'team-free')],
	supports: {
		// The renderers already emit the `align{value}` class on #uniqueId.
		align: ['wide', 'full'],
		html: false,
		customClassName: true,
	},
	edit: Edit,
	save,
});
