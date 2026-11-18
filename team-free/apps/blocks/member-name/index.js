import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { MemberNameIcon } from './icons';

// Single-page builder field block: renders a member's name. On a member single
// page it resolves the current member automatically; the "Member" control can
// pin a specific member (editor preview + explicit override).
registerBlockType('sptp/member-name', {
	apiVersion: 3,
	title: __('Member Name', 'team-free'),
	description: __("Display a team member's name, linked to their single page.", 'team-free'),
	category: 'sptp',
	icon: <MemberNameIcon />,
	keywords: [__('team', 'team-free'), __('member', 'team-free'), __('name', 'team-free')],
	supports: {
		// The renderers already emit the `align{value}` class on #uniqueId.
		align: ['wide', 'full'],
		html: false,
		customClassName: true,
	},
	edit: Edit,
	save,
});
