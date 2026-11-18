import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import { CustomInformationIcon } from './icons';

/**
 * Pro-only block registration. Registered so a page built in Pro never shows an
 * invalid-block warning once Pro is removed, but carries none of its real edit UI —
 * the canvas gate in inserterVisibility.js (editor.BlockEdit) shows the Pro notice
 * (shared/proBlockNotice.jsx) instead, and the block renders nothing on the front
 * end (Includes\Pro_Stub_Block). Free's Add New Member screen has no field for this
 * data (CLAUDE.md Rule 8; docs/pro-free-separation.md §6).
 */
registerBlockType('sptp/custom-information', {
	apiVersion: 3,
	title: __('Custom Information', 'team-free'),
	description: __("Display a team member's custom information fields.", 'team-free'),
	category: 'sptp',
	icon: <CustomInformationIcon />,
	keywords: [
		__('team', 'team-free'),
		__('member', 'team-free'),
		__('custom', 'team-free'),
		__('extra', 'team-free'),
		__('field', 'team-free'),
	],
	supports: {
		align: ['wide', 'full'],
		html: false,
		customClassName: true,
	},
	edit: () => null,
	save: () => null,
});
