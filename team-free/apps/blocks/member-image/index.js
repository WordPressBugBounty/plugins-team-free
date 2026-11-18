import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { MemberImageIcon } from './icons';

// Single-page builder field block: renders a member's photo. On a member page
// it resolves the current member automatically; the "Member" control can pin a
// specific member (editor preview + explicit override).
registerBlockType('sptp/member-image', {
	apiVersion: 3,
	title: __('Member Image', 'team-free'),
	description: __("Display a team member's photo.", 'team-free'),
	category: 'sptp',
	icon: <MemberImageIcon />,
	keywords: [
		__('team', 'team-free'),
		__('member', 'team-free'),
		__('image', 'team-free'),
		__('photo', 'team-free'),
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
