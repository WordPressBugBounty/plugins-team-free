/**
 * Ajax Member Search — Pro-only block registration. See ../carousel-3d/index.js
 * for why this carries no real edit UI.
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { AjaxMemberSearchIcon } from './icons';

registerBlockType('sptp/ajax-member-search', {
	apiVersion: 3,
	title: __('Ajax Member Search', 'team-free'),
	description: __('A keyword search box for a layout block’s members.', 'team-free'),
	category: 'sptp',
	icon: <AjaxMemberSearchIcon />,
	parent: ['sptp/team-group'],
	supports: {
		html: false,
	},
	edit: () => null,
	save: () => null,
});
