import { __ } from '@wordpress/i18n';
import { GridIcon } from '../../blocks/grid/icons';
import { CarouselIcon } from '../../blocks/carousel/icons';
import { Carousel3dIcon } from '../../blocks/carousel-3d/icons';
import { AjaxPaginationIcon } from '../../blocks/ajax-pagination/icons';
import { AjaxMemberSearchIcon } from '../../blocks/ajax-member-search/icons';
import { LiveFrontendFilterIcon } from '../../blocks/live-frontend-filter/icons';
import { ClassicShortcodeIcon } from '../components/ClassicShortcodeIcon';
import { generateDemoLink } from '../../components/demoLinks';

/**
 * Per-block metadata for the Blocks page, keyed by block name. `Icon` is the
 * block's own registered icon (the Figma "Smart Team Block Icons" set). Add an
 * entry here when a new toggle-managed block is registered.
 */
const blocksInfo = {
	'sptp/carousel': {
		title: __('Carousel', 'team-free'),
		Icon: CarouselIcon,
		demoLink: generateDemoLink('carousel'),
		docLink: 'https://docs.getwpteam.com/guide/blocks/carousel',
	},
	'sptp/carousel-3d': {
		title: __('3D Carousel', 'team-free'),
		Icon: Carousel3dIcon,
		demoLink: generateDemoLink('carousel-3d'),
		docLink: 'https://docs.getwpteam.com/guide/blocks/carousel-3d',
	},
	'sptp/grid': {
		title: __('Grid', 'team-free'),
		Icon: GridIcon,
		demoLink: generateDemoLink('grid'),
		docLink: 'https://docs.getwpteam.com/guide/blocks/grid',
	},
	'sptp/ajax-pagination': {
		title: __('Ajax Pagination', 'team-free'),
		Icon: AjaxPaginationIcon,
		docLink: 'https://docs.getwpteam.com/guide/blocks/ajax-pagination',
	},
	'sptp/ajax-member-search': {
		title: __('Ajax Member Search', 'team-free'),
		Icon: AjaxMemberSearchIcon,
		docLink: 'https://docs.getwpteam.com/guide/blocks/ajax-member-search',
	},
	'sptp/live-frontend-filter': {
		title: __('Live Frontend Filter', 'team-free'),
		Icon: LiveFrontendFilterIcon,
		docLink: 'https://docs.getwpteam.com/guide/blocks/live-frontend-filter',
	},
	'sp-team-pro/shortcode': {
		title: __('Classic Shortcode', 'team-free'),
		Icon: ClassicShortcodeIcon,
		docLink: 'https://docs.getwpteam.com/guide/classic/overview',
	},
};

/**
 * Metadata for a block, with a title derived from the slug when it has no entry.
 *
 * @param {string} name Full block name (e.g. "sptp/grid").
 * @return {{title:string, Icon:?Function, demoLink?:string, docLink?:string}} Block info.
 */
export const getBlockInfo = (name) => {
	if (blocksInfo[name]) {
		return blocksInfo[name];
	}
	const slug = (name || '').split('/').pop() || name;
	const title = slug
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
	return { title, Icon: null };
};

export default blocksInfo;
