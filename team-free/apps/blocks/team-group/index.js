/**
 * Team Group — static InnerBlocks container (port of testimonial-pro's
 * testimonial-group). Never inserted by hand: the grid's Display Settings
 * toggles wrap/unwrap it via useTeamChildBlocks.
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './Edit.jsx';
import Save from './Save.jsx';
import { TeamGroupIcon } from './icons';

registerBlockType('sptp/team-group', {
	apiVersion: 3,
	title: __('Team Group', 'team-free'),
	description: __(
		'Container block for team members with navigation and pagination controls.',
		'team-free'
	),
	category: 'sptp',
	icon: <TeamGroupIcon />,
	supports: {
		align: ['wide', 'full'],
		inserter: false,
		customClassName: false,
		html: false,
	},
	attributes: {
		uniqueId: {
			type: 'string',
			default: '',
		},
	},
	edit: Edit,
	save: Save,
});
