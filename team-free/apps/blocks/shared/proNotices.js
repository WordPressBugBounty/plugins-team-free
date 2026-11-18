/**
 * Copy for every Inspector Pro notice, in one place — each call site renders
 * `<ProNotice {...ENTRY} />`. Every claim and count is checked against Smart
 * Team Pro's own controls (../wp-team-pro/apps/blocks) and Pro_Gate::FREE_*;
 * update both together when either side changes.
 *
 * Tone follows wp-carousel-free's proFeatures.js: a plain, benefit-led title,
 * one short subtitle, and short noun-phrase bullets ("N more …", "&" over "and").
 */

import { __ } from '@wordpress/i18n';

/** Query Builder → Filter Members (Taxonomies / Specific are Pro). */
export const PRO_NOTICE_QUERY = {
	title: __('Show Exactly the Right Members', 'team-free'),
	subtitle: __('Advanced filters for every member query.', 'team-free'),
	features: [
		__('Filter by taxonomy', 'team-free'),
		__('Hand-pick specific members', 'team-free'),
	],
};

/** Card Content — Pro card rows, ordering and hover behaviour. */
export const PRO_NOTICE_CARD_CONTENT = {
	title: __('Show More on Every Card', 'team-free'),
	subtitle: __('Richer member details at a glance.', 'team-free'),
	features: [
		__('Email, phone & location', 'team-free'),
		__('Custom info fields', 'team-free'),
		__('Drag-and-drop ordering', 'team-free'),
		__('Reveal content on hover', 'team-free'),
		__('6 card hover effects', 'team-free'),
	],
};

/** Member Image — masking, flip, lazy loading, special tag, hover, filter. */
export const PRO_NOTICE_MEMBER_IMAGE = {
	title: __('Make Every Photo Stand Out', 'team-free'),
	subtitle: __('More ways to shape and style member photos.', 'team-free'),
	features: [
		__('10 more mask shapes', 'team-free'),
		__('Flip to a second photo', 'team-free'),
		__('8 more hover effects', 'team-free'),
		__('Blur, grayscale & more filters', 'team-free'),
		__('Lazy loading & special tags', 'team-free'),
	],
};

/** Social Profiles → Style → Custom Styling. */
export const PRO_NOTICE_SOCIAL = {
	title: __('Match Icons to Your Brand', 'team-free'),
	subtitle: __('Full style control over every profile icon.', 'team-free'),
	features: [
		__('Custom icon & background colors', 'team-free'),
		__('Borders & box shadows', 'team-free'),
		__('Separate hover styles', 'team-free'),
	],
};

/** Member Details — Modal and the wider Make Clickable choices. */
export const PRO_NOTICE_MEMBER_DETAILS = {
	title: __('Open Profiles Your Way', 'team-free'),
	subtitle: __('Show full details without leaving the page.', 'team-free'),
	features: [
		__('Quick-view modal popup', 'team-free'),
		__('Editable modal template', 'team-free'),
		__('Clickable name or full card', 'team-free'),
	],
};

/** Carousel → Navigation Arrow (Show on Hover, offsets). */
export const PRO_NOTICE_NAVIGATION = {
	title: __('Place Arrows Exactly Right', 'team-free'),
	subtitle: __('Navigation that matches your design.', 'team-free'),
	features: [__('Show arrows on hover', 'team-free'), __('Custom X & Y offsets', 'team-free')],
};

/** Carousel → Display Settings. */
export const PRO_NOTICE_CAROUSEL_DISPLAY = {
	title: __('Design Without Limits', 'team-free'),
	subtitle: __('More ways to shape and present every slide.', 'team-free'),
	features: [
		__('12 more card designs', 'team-free'),
		__('Center, ticker & multi-row styles', 'team-free'),
		__('Fade & spring effects', 'team-free'),
		__('Vertical direction', 'team-free'),
		__('Partial slide view', 'team-free'),
	],
};

/** Grid → Display Settings. */
export const PRO_NOTICE_GRID_DISPLAY = {
	title: __('Help Visitors Find Them Faster', 'team-free'),
	subtitle: __('More grid styles, plus filter and search.', 'team-free'),
	features: [
		__('Polaroid & staggered styles', 'team-free'),
		__('12 more card designs', 'team-free'),
		__('Live frontend filter', 'team-free'),
		__('Instant Ajax search', 'team-free'),
	],
};

/** Additional Information — a locked Pro panel. */
export const PRO_NOTICE_ADDITIONAL_INFO = {
	title: __('Style Every Extra Detail', 'team-free'),
	subtitle: __('Icons and spacing for each detail line.', 'team-free'),
	features: [
		__('Meta icons beside each detail', 'team-free'),
		__('Choice of icon styles', 'team-free'),
		__('Icon size & spacing control', 'team-free'),
	],
};

/** Carousel → Motion Effects — a locked Pro panel. */
export const PRO_NOTICE_MOTION_EFFECTS = {
	title: __('Animate Cards on Scroll', 'team-free'),
	subtitle: __('Give your team a memorable entrance.', 'team-free'),
	features: [
		__('25+ entrance animations', 'team-free'),
		__('Scroll-driven motion', 'team-free'),
		__('Animation speed & delay', 'team-free'),
		__('Turn off per device', 'team-free'),
	],
};
