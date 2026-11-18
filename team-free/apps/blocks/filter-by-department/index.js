/**
 * Filter by Department — Pro-only block registration. See
 * ../carousel-3d/index.js for why this carries no real edit UI. Static in Pro
 * but registered dynamic here (Includes\Filter_By_Department extends
 * Pro_Stub_Block), so `save: () => null` is correct — nothing needs
 * preserving for content-validity (unlike live-frontend-filter, its parent).
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { FilterByDepartmentIcon } from './icons';

registerBlockType('sptp/filter-by-department', {
	apiVersion: 3,
	title: __('Filter by Department', 'team-free'),
	description: __(
		'Filter team members by department as a dropdown or button group.',
		'team-free'
	),
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
