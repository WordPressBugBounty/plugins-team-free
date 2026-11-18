import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { MemberDesignationIcon } from './icons';

// Single-page builder field block: renders a member's designation (job
// position). On a member single page it resolves the current member
// automatically; the "Member" control can pin a specific member.
registerBlockType('sptp/member-designation', {
	apiVersion: 3,
	title: __('Member Designation', 'team-free'),
	description: __("Display a team member's designation or job position.", 'team-free'),
	category: 'sptp',
	icon: <MemberDesignationIcon />,
	keywords: [
		__('team', 'team-free'),
		__('member', 'team-free'),
		__('designation', 'team-free'),
		__('job title', 'team-free'),
		__('role', 'team-free'),
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
