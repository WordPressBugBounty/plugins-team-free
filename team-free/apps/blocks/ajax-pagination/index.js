import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { AjaxPaginationIcon } from './icons';

// Child of the (inserter-hidden) team-group container — never inserted by
// hand; the grid's Ajax Pagination toggle adds/removes it via
// useTeamChildBlocks. Mirrors testimonial-pro's ajax-pagination block.json.
registerBlockType('sptp/ajax-pagination', {
	apiVersion: 3,
	title: __('Ajax Pagination', 'team-free'),
	description: __(
		'Display AJAX-powered pagination for team members with smooth navigation without page reload.',
		'team-free'
	),
	category: 'sptp',
	parent: ['sptp/team-group'],
	icon: <AjaxPaginationIcon />,
	supports: {
		html: false,
		inserter: false,
		customClassName: true,
	},
	edit: Edit,
	save,
});
