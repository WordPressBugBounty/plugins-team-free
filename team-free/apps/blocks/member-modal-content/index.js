/**
 * Member Modal Content — the Member Details modal shell as a block.
 *
 * Holds the member field blocks that make up the popup, and owns the shell's
 * own settings (display style, animation, size, close icon, navigation). It
 * belongs at the root of a details template (`sptp_member_template`); the
 * frontend renders it for one member through the `sptp_member_details` ajax
 * action.
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { MemberModalContentIcon } from './icons';

registerBlockType('sptp/member-modal-content', {
	apiVersion: 3,
	title: __('Member Modal Content', 'team-free'),
	description: __(
		'The member details popup — add the member blocks that make up its content.',
		'team-free'
	),
	category: 'sptp',
	icon: <MemberModalContentIcon />,
	keywords: [
		__('team', 'team-free'),
		__('modal', 'team-free'),
		__('popup', 'team-free'),
		__('member details', 'team-free'),
	],
	supports: {
		// The renderer already emits the `align{value}` class on #uniqueId.
		// Align sizes the block's BOX; the Width control sizes the dialog
		// inside it (capped by the box, since the dialog is max-width: 100%).
		align: ['wide', 'full'],
		html: false,
		customClassName: false,
	},
	edit: Edit,
	save,
});
