/**
 * Carousel — General inspector.
 *
 * The panel layout and shared card panels come from the shared
 * LayoutInspector; the carousel contributes its Display Settings body and the
 * Navigation Arrow / Pagination Dots panels (each visible only while its
 * Display Settings toggle is on) and the Pro-only Motion Effects teaser.
 */

import { __ } from '@wordpress/i18n';
import LayoutInspector from '../shared/inspector';
import { DisplaySettings } from './displaySettings';
import { NavigationArrowPanel, PaginationDotsPanel } from './navPagination';
import { MotionEffectsPro } from '../shared/proPanels';

const EXTRA_PANELS = [
	{
		key: 'navigation',
		title: __('Navigation Arrow', 'team-free'),
		Body: NavigationArrowPanel,
		after: 'query',
		visible: (attributes) =>
			!!attributes.enableNavigationArrow && attributes.carouselStyle !== 'ticker',
	},
	{
		key: 'pagination',
		title: __('Pagination Dots', 'team-free'),
		Body: PaginationDotsPanel,
		after: 'query',
		visible: (attributes) =>
			!!attributes.enablePaginationDots && attributes.carouselStyle !== 'ticker',
	},
	{
		key: 'motion',
		title: __('Motion Effects', 'team-free'),
		Body: MotionEffectsPro,
		after: 'details',
		isPro: true,
	},
];

const Inspector = (props) => (
	<LayoutInspector {...props} DisplaySettings={DisplaySettings} extraPanels={EXTRA_PANELS} />
);

export default Inspector;
