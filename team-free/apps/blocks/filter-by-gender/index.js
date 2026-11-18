/**
 * Filter by Gender — Pro-only block registration. See
 * ../filter-by-department/index.js.
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { FilterByDepartmentIcon } from '../filter-by-department/icons';

registerBlockType('sptp/filter-by-gender', {
	apiVersion: 3,
	title: __('Filter by Gender', 'team-free'),
	description: __('Filter team members by gender as a dropdown or button group.', 'team-free'),
	category: 'sptp',
	parent: ['sptp/live-frontend-filter'],
	icon: <FilterByDepartmentIcon />,
	supports: {
		html: false,
		customClassName: true,
	},
	edit: () => null,
	save: () => null,
});
