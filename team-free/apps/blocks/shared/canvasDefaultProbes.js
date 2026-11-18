/**
 * Registers every block's editor dynamicCss() with useCanvasDefault, so a
 * control for an attribute registered empty shows the design's real value
 * (read from the canvas) instead of 0.
 */
import { registerCanvasDefaultProbe } from '../../hooks/useCanvasDefault';
import ajaxPagination from '../ajax-pagination/dynamicCss';
import carousel from '../carousel/dynamicCss';
import grid from '../grid/dynamicCss';
import memberBio from '../member-bio/dynamicCss';
import memberDescription from '../member-description/dynamicCss';
import memberDesignation from '../member-designation/dynamicCss';
import memberImage from '../member-image/dynamicCss';
import memberModalContent from '../member-modal-content/dynamicCss';
import memberName from '../member-name/dynamicCss';
import memberSkills from '../member-skills/dynamicCss';
import socialProfile from '../social-profile/dynamicCss';

const PROBES = {
	'ajax-pagination': ajaxPagination,
	carousel,
	grid,
	'member-bio': memberBio,
	'member-description': memberDescription,
	'member-designation': memberDesignation,
	'member-image': memberImage,
	'member-modal-content': memberModalContent,
	'member-name': memberName,
	'member-skills': memberSkills,
	'social-profile': socialProfile,
	// 3D Carousel renders through Carousel's renderer in Free.
	'carousel-3d': carousel,
};

Object.entries(PROBES).forEach(([slug, cssFn]) =>
	registerCanvasDefaultProbe(`sptp/${slug}`, cssFn)
);
