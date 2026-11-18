import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import { HireButtonIcon } from './icons';

/**
 * Pro-only block registration. Registered so a page built in Pro never shows an
 * invalid-block warning once Pro is removed, but carries none of its real edit UI —
 * the canvas gate in inserterVisibility.js (editor.BlockEdit) shows the Pro notice
 * (shared/proBlockNotice.jsx) instead, and the block renders nothing on the front
 * end (Includes\Pro_Stub_Block). Free's Add New Member screen has the Hire URL
 * field disabled as Pro-only (CLAUDE.md Rule 8; docs/pro-free-separation.md §6).
 */
registerBlockType('sptp/hire-button', {
	apiVersion: 3,
	title: __('Hire Me Button', 'team-free'),
	description: __("Display a button linking to a team member's hire URL.", 'team-free'),
	category: 'sptp',
	icon: <HireButtonIcon />,
	keywords: [
		__('team', 'team-free'),
		__('member', 'team-free'),
		__('hire', 'team-free'),
		__('button', 'team-free'),
		__('contact', 'team-free'),
	],
	supports: {
		align: ['wide', 'full'],
		html: false,
		customClassName: true,
	},
	edit: () => null,
	save: () => null,
});
