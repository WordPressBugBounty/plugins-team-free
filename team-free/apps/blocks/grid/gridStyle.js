/**
 * Grid — Select Grid Style catalogue (Figma "Layout Style" 3073:154320).
 *
 * Only the normal grid is free. Polaroid and Staggered are Pro: Free ships no
 * CSS or markup for them, so the tiles are locked (`pro`, resolved once from
 * Pro_Gate's localized list like CARD_DESIGN_ITEMS) and a Pro-saved
 * `gridStyle` renders as the normal grid without being rewritten.
 */

import { __ } from '@wordpress/i18n';
import { GridStyleNormal, GridStylePolaroid, GridStyleStaggered } from './gridStyleIcons';
import { isFreeGridStyle } from '../shared/proGate';

export const GRID_STYLE_ITEMS = [
	{ value: 'normal', name: __('Grid', 'team-free'), icon: <GridStyleNormal /> },
	{ value: 'polaroid', name: __('Polaroid', 'team-free'), icon: <GridStylePolaroid /> },
	{ value: 'staggered', name: __('Staggered', 'team-free'), icon: <GridStyleStaggered /> },
].map((item) => ({ ...item, pro: !isFreeGridStyle(item.value) }));
