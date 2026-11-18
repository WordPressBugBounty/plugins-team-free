/**
 * Ready Patterns — per-block sidebar icons.
 *
 * Only the three top-level layout blocks are library categories (see
 * `constants.js`'s CATEGORY_SLUGS) — every other `sptp/*` block is a child
 * inserted inside one of these three, never its own category.
 */

import { GridIcon } from '../../grid/icons';
import { CarouselIcon } from '../../carousel/icons';
import { Carousel3dIcon } from '../../carousel-3d/icons';

export const CATEGORY_ICONS = {
	grid: GridIcon,
	carousel: CarouselIcon,
	'carousel-3d': Carousel3dIcon,
};
