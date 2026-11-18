import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import { MemberVideoIcon } from './icons';

/**
 * Pro-only block registration. Registered so a page built in Pro never shows an
 * invalid-block warning once Pro is removed, but carries none of its real edit UI —
 * the canvas gate in inserterVisibility.js (editor.BlockEdit) shows the Pro notice
 * (shared/proBlockNotice.jsx) instead, and the block renders nothing on the front
 * end (Includes\Pro_Stub_Block). Free's Add New Member screen has no field for this
 * data (CLAUDE.md Rule 8; docs/pro-free-separation.md §6).
 */
registerBlockType('sptp/member-video', {
	apiVersion: 3,
	title: __('Member Video', 'team-free'),
	description: __("Display a team member's video with a play button.", 'team-free'),
	category: 'sptp',
	icon: <MemberVideoIcon />,
	keywords: [
		__('team', 'team-free'),
		__('member', 'team-free'),
		__('video', 'team-free'),
		__('youtube', 'team-free'),
		__('play', 'team-free'),
	],
	supports: {
		align: ['wide', 'full'],
		html: false,
		customClassName: true,
	},
	edit: () => null,
	save: () => null,
});
