/**
 * Pure helpers for the "Team Showcase Placements" table.
 *
 * Rows come from Placements::report(): { key, source, location, layouts,
 * names, modified, editUrl }. `source` is "block", "shortcode" or "template";
 * `location` is null for a classic shortcode or saved template placed nowhere.
 */

import { __, sprintf, _n } from '@wordpress/i18n';

/** Rows shown at first, and added by each "Load more". */
export const PAGE_SIZE = 5;

/** Layout names written out before the rest fold behind "+N". */
export const LAYOUT_LIMIT = 5;

/** Source keys, in the order their filter tabs appear. */
export const SOURCES = ['block', 'shortcode', 'template'];

/**
 * Display name of a placement source.
 *
 * @param {string} source "block", "shortcode" or "template".
 * @return {string} Name.
 */
export function sourceLabel(source) {
	switch (source) {
		case 'shortcode':
			return __('Shortcode', 'team-free');
		case 'template':
			return __('Saved Template', 'team-free');
		default:
			return __('Block', 'team-free');
	}
}

/**
 * The filter tabs above the table.
 *
 * Only worth showing when the report mixes sources; when shown, only the
 * types present get a tab, so none of them leads to an empty table.
 *
 * @param {Array} rows Report rows.
 * @return {Array<{key: string, label: string}>} Tabs, All first; empty when
 *                                               fewer than two types are used.
 */
export function sourceFilters(rows) {
	const present = new Set((Array.isArray(rows) ? rows : []).map((row) => row?.source));
	const used = SOURCES.filter((source) => present.has(source));

	if (used.length < 2) {
		return [];
	}

	const labels = {
		block: __('Blocks', 'team-free'),
		shortcode: __('Shortcodes', 'team-free'),
		template: __('Saved Templates', 'team-free'),
	};

	return [
		{ key: 'all', label: __('All', 'team-free') },
		...used.map((source) => ({ key: source, label: labels[source] })),
	];
}

/**
 * Rows matching the selected source and the search text. The search reads the
 * location's title and type, the shortcode / template names and the layouts.
 *
 * @param {Array}  rows           Report rows.
 * @param {Object} filters
 * @param {string} filters.source "all" or a source key.
 * @param {string} filters.query  Text to find.
 * @return {Array} Matching rows, in report order.
 */
export function filterRows(rows, { source = 'all', query = '' } = {}) {
	const needle = String(query || '')
		.trim()
		.toLowerCase();

	return (Array.isArray(rows) ? rows : []).filter((row) => {
		if (source && 'all' !== source && row?.source !== source) {
			return false;
		}

		if (!needle) {
			return true;
		}

		return [
			row?.location?.title,
			row?.location?.type,
			...(Array.isArray(row?.names) ? row.names : []),
			...(Array.isArray(row?.layouts) ? row.layouts : []),
		]
			.join(' ')
			.toLowerCase()
			.includes(needle);
	});
}

/**
 * Split layout names into the ones written out and the ones folded away.
 *
 * @param {string[]} layouts Layout names.
 * @param {number}   [limit] How many to write out.
 * @return {{shown: string[], rest: string[]}} Both parts.
 */
export function splitLayouts(layouts, limit = LAYOUT_LIMIT) {
	const list = Array.isArray(layouts) ? layouts : [];

	return { shown: list.slice(0, limit), rest: list.slice(limit) };
}

/**
 * Short, locale-aware date for "Last updated".
 *
 * @param {number} timestamp Unix seconds.
 * @return {string} Date, or a dash when there is none.
 */
export function formatDate(timestamp) {
	if (!timestamp) {
		return '—';
	}

	try {
		return new Intl.DateTimeFormat(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(new Date(timestamp * 1000));
	} catch (error) {
		return '—';
	}
}

/**
 * "just now" / "5 minutes ago" / "2 days ago" for the Sync tooltip.
 *
 * @param {number} timestamp Unix seconds.
 * @param {number} [now]     Unix seconds to measure from.
 * @return {string} Label, or an empty string when there is no timestamp.
 */
export function formatRelativeTime(timestamp, now = Math.floor(Date.now() / 1000)) {
	if (!timestamp) {
		return '';
	}

	const seconds = Math.max(0, now - timestamp);

	if (seconds < 60) {
		return __('just now', 'team-free');
	}

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) {
		/* translators: %d: number of minutes */
		return sprintf(_n('%d minute ago', '%d minutes ago', minutes, 'team-free'), minutes);
	}

	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		/* translators: %d: number of hours */
		return sprintf(_n('%d hour ago', '%d hours ago', hours, 'team-free'), hours);
	}

	const days = Math.floor(hours / 24);
	/* translators: %d: number of days */
	return sprintf(_n('%d day ago', '%d days ago', days, 'team-free'), days);
}

/**
 * Time-of-day greeting for the hero card.
 *
 * @param {number} [hour] Local hour, 0–23.
 * @return {string} Greeting.
 */
export function greeting(hour = new Date().getHours()) {
	if (hour < 12) {
		return __('Good morning', 'team-free');
	}

	if (hour < 17) {
		return __('Good afternoon', 'team-free');
	}

	return __('Good evening', 'team-free');
}
