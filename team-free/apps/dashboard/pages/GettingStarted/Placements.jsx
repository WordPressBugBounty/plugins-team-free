/**
 * Dashboard card: "Team Showcase Placements".
 *
 * Lists every page, post, template and widget area that shows a Smart Team
 * block, classic shortcode or saved template, and the shortcodes and templates
 * not placed anywhere yet. The report comes from `GET sptp/v1/placements`
 * (Placements::report()) and is stored server-side: every visit shows it as it
 * was last synced, and only the Sync button (or a first visit, with nothing
 * stored yet) scans the site.
 */

import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { toastErrorMsg } from '../../utils/toast';
import {
	PAGE_SIZE,
	filterRows,
	formatDate,
	formatRelativeTime,
	sourceFilters,
	sourceLabel,
	splitLayouts,
} from './usageHelpers';
import './placements.scss';

const PLACEMENTS_ROUTE = '/sptp/v1/placements';

const ExternalIcon = () => (
	<svg
		viewBox="0 0 24 24"
		width="12"
		height="12"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
		<path d="M15 3h6v6" />
		<path d="M10 14L21 3" />
	</svg>
);

const SyncIcon = () => (
	<svg
		viewBox="0 0 24 24"
		width="16"
		height="16"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
		<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
		<path d="M21 3v5h-5" />
		<path d="M3 21v-5h5" />
	</svg>
);

/**
 * Empty-state artwork: a browser window with three dashed member slots.
 *
 * @return {JSX.Element} Artwork.
 */
const EmptyArtwork = () => (
	<svg
		className="sptp-placements__empty-art"
		viewBox="0 0 200 114"
		width="150"
		height="86"
		fill="none"
		aria-hidden="true"
		focusable="false"
	>
		<rect x="22" y="14" width="156" height="96" rx="10" fill="#fff" stroke="#dcdcde" />
		<path d="M22 24a10 10 0 0 1 10-10h136a10 10 0 0 1 10 10v8H22z" fill="#f6f7f7" />
		<line x1="22" y1="32" x2="178" y2="32" stroke="#dcdcde" />
		<circle cx="33" cy="23" r="2.5" fill="#dcdcde" />
		<circle cx="41" cy="23" r="2.5" fill="#dcdcde" />
		<circle cx="49" cy="23" r="2.5" fill="#dcdcde" />
		<rect x="34" y="52" width="38" height="5" rx="2.5" fill="#f2f3f4" />
		<rect
			x="44"
			y="66"
			width="30"
			height="24"
			rx="5"
			fill="#f7fbf9"
			stroke="#b9d9c6"
			strokeDasharray="3 3"
		/>
		<rect
			x="85"
			y="66"
			width="30"
			height="24"
			rx="5"
			fill="#f7fbf9"
			stroke="#b9d9c6"
			strokeDasharray="3 3"
		/>
		<rect
			x="126"
			y="66"
			width="30"
			height="24"
			rx="5"
			fill="#f7fbf9"
			stroke="#b9d9c6"
			strokeDasharray="3 3"
		/>
		<path
			d="M36 74l-4 4 4 4"
			stroke="#c3c4c7"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M164 74l4 4-4 4"
			stroke="#c3c4c7"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<circle cx="92" cy="98" r="2" fill="#2b5f47" />
		<circle cx="100" cy="98" r="2" fill="#dcdcde" />
		<circle cx="108" cy="98" r="2" fill="#dcdcde" />
		<circle cx="168" cy="18" r="15" fill="#2b5f47" />
		<path d="M168 11v14M161 18h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
	</svg>
);

/**
 * Ask the dashboard route for the placements report.
 *
 * @param {boolean} [refresh] Scan the site again instead of answering from the stored report.
 * @return {Promise<Object>} Report.
 */
const fetchPlacements = (refresh = false) =>
	apiFetch({
		path: refresh ? addQueryArgs(PLACEMENTS_ROUTE, { refresh: true }) : PLACEMENTS_ROUTE,
	});

/**
 * The "Last synced …" label, kept current by its own timer so the table does
 * not re-render every tick.
 *
 * @param {number} timestamp Unix seconds of the last scan.
 * @return {string} Label.
 */
function useRelativeTime(timestamp) {
	const [label, setLabel] = useState(() => formatRelativeTime(timestamp));

	useEffect(() => {
		setLabel(formatRelativeTime(timestamp));

		if (!timestamp) {
			return undefined;
		}

		const timer = setInterval(() => setLabel(formatRelativeTime(timestamp)), 30000);

		return () => clearInterval(timer);
	}, [timestamp]);

	return label;
}

/**
 * Sync button: scans the site again. Its tooltip says when the report was
 * last built.
 *
 * @param {Object}   props
 * @param {boolean}  props.syncing   A scan is running.
 * @param {number}   props.scannedAt Unix seconds of the last scan.
 * @param {Function} props.onSync    Start a scan.
 * @return {JSX.Element} Button with tooltip.
 */
function SyncButton({ syncing, scannedAt, onSync }) {
	const ago = useRelativeTime(scannedAt);
	const title = syncing
		? __('Scanning your site…', 'team-free')
		: __('Sync placements', 'team-free');
	const detail = syncing
		? __('Looking for blocks & shortcodes', 'team-free')
		: sprintf(
				/* translators: %s: when the placements were last scanned, e.g. "2 minutes ago" or "just now" */
				__('Last synced %s', 'team-free'),
				ago
			);

	return (
		<span className="sptp-placements__tip-wrap">
			<button
				type="button"
				className={`sptp-placements__sync${syncing ? ' is-syncing' : ''}`}
				onClick={onSync}
				disabled={syncing}
				aria-label={title}
				aria-describedby="sptp-placements-sync-tip"
			>
				<SyncIcon />
			</button>
			<span className="sptp-placements__tip" id="sptp-placements-sync-tip" role="tooltip">
				{title}
				{(syncing || scannedAt) && (
					<span className="sptp-placements__tip-sub">{detail}</span>
				)}
			</span>
		</span>
	);
}

/**
 * "Used on" cell: where the placement is, with Edit / View on hover.
 *
 * @param {Object} props
 * @param {Object} props.row Report row.
 * @return {JSX.Element} Cell.
 */
function UsedOn({ row }) {
	const { location } = row;

	if (!location) {
		return (
			<div className="sptp-placements__where">
				<div className="sptp-placements__unused">{__('Not used yet', 'team-free')}</div>
				<div className="sptp-placements__sub">
					<span
						className={`sptp-placements__meta sptp-placements__meta--unused${
							row.editUrl ? ' has-actions' : ''
						}`}
					>
						{__('Add it to a page or post', 'team-free')}
					</span>
					{row.editUrl && (
						<span className="sptp-placements__actions">
							<a href={row.editUrl} className="sptp-placements__action">
								{__('Edit', 'team-free')}
							</a>
						</span>
					)}
				</div>
			</div>
		);
	}

	const hasActions = location.editUrl || location.viewUrl;

	return (
		<div className="sptp-placements__where">
			<div className="sptp-placements__title-line">
				{location.editUrl ? (
					<a href={location.editUrl} className="sptp-placements__title">
						{location.title}
					</a>
				) : (
					<span className="sptp-placements__title">{location.title}</span>
				)}
				{location.statusLabel && (
					<span className="sptp-placements__status">{location.statusLabel}</span>
				)}
			</div>
			<div className="sptp-placements__sub">
				<span className={`sptp-placements__meta${hasActions ? ' has-actions' : ''}`}>
					{location.type}
				</span>
				{hasActions && (
					<span className="sptp-placements__actions">
						{location.editUrl && (
							<a href={location.editUrl} className="sptp-placements__action">
								{__('Edit', 'team-free')}
							</a>
						)}
						{location.editUrl && location.viewUrl && (
							<span className="sptp-placements__sep" aria-hidden="true">
								|
							</span>
						)}
						{location.viewUrl && (
							<a
								href={location.viewUrl}
								className="sptp-placements__action"
								target="_blank"
								rel="noreferrer"
							>
								{__('View', 'team-free')}
								<ExternalIcon />
							</a>
						)}
					</span>
				)}
			</div>
		</div>
	);
}

/**
 * "Type & Layouts" cell: the source, then its layouts, the tail folded into a
 * "+N" chip whose tooltip names the rest.
 *
 * @param {Object} props
 * @param {Object} props.row Report row.
 * @return {JSX.Element} Cell.
 */
function TypeAndLayouts({ row }) {
	const { shown, rest } = splitLayouts(row.layouts);
	const names = (row.names || []).filter(Boolean).join(', ');

	return (
		<div className="sptp-placements__layouts" title={names || undefined}>
			<span className={`sptp-placements__type sptp-placements__type--${row.source}`}>
				{sprintf(
					/* translators: %s: "Block", "Shortcode" or "Saved Template" */
					__('%s:', 'team-free'),
					sourceLabel(row.source)
				)}
			</span>{' '}
			{shown.join(', ')}
			{rest.length > 0 && (
				<>
					{' '}
					<span className="sptp-placements__tip-wrap sptp-placements__more-wrap">
						<span className="sptp-placements__more" tabIndex={0}>
							{sprintf(
								/* translators: %d: number of hidden layouts */
								__('+%d', 'team-free'),
								rest.length
							)}
						</span>
						<span className="sptp-placements__tip" role="tooltip">
							{rest.join(', ')}
						</span>
					</span>
				</>
			)}
		</div>
	);
}

/**
 * The card.
 *
 * @param {Object}   props
 * @param {string}   props.createUrl  Where "Add to a Page" goes, for the empty state.
 * @param {Function} [props.onReport] Called with the report each time one loads or syncs.
 * @return {JSX.Element} Card.
 */
export default function Placements({ createUrl = '', onReport }) {
	const [report, setReport] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [source, setSource] = useState('all');
	const [query, setQuery] = useState('');
	const [limit, setLimit] = useState(PAGE_SIZE);
	const [syncing, setSyncing] = useState(false);

	// Every visit shows the stored report as it was last synced; the server
	// scans by itself only when it has none yet (the very first visit).
	const load = useCallback(async () => {
		setLoading(true);
		setError('');

		try {
			setReport(await fetchPlacements());
		} catch (loadError) {
			setError(loadError?.message || __('The placements could not be loaded.', 'team-free'));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	// Sync: a fresh scan. The table stays up while it runs; a failed scan keeps
	// it and says so in a toast.
	const sync = useCallback(async () => {
		setSyncing(true);

		try {
			setReport(await fetchPlacements(true));
		} catch (syncError) {
			toastErrorMsg(
				syncError?.message || __('The placements could not be synced.', 'team-free')
			);
		} finally {
			setSyncing(false);
		}
	}, []);

	useEffect(() => {
		if (report && onReport) {
			onReport(report);
		}
	}, [report, onReport]);

	const allRows = useMemo(() => (Array.isArray(report?.rows) ? report.rows : []), [report]);
	const filters = useMemo(() => sourceFilters(allRows), [allRows]);
	// A tab no longer offered (one type left after a sync) falls back to All.
	const activeSource = filters.some((filter) => filter.key === source) ? source : 'all';
	const rows = useMemo(
		() => filterRows(allRows, { source: activeSource, query }),
		[allRows, activeSource, query]
	);
	const visibleRows = rows.slice(0, limit);
	const isEmpty = !!report && !error && 0 === allRows.length;
	const isFilled = !!report && !error && allRows.length > 0;

	const pickSource = (key) => {
		setSource(key);
		setLimit(PAGE_SIZE);
	};

	return (
		<section className="sptp-placements" aria-busy={loading || syncing}>
			<div className="sptp-placements__head">
				<div>
					<h2 className="sptp-placements__heading">
						{__('Team Showcase Placements', 'team-free')}
					</h2>
					<p className="sptp-placements__intro">
						{__(
							'Track every block, shortcode, and saved template across your site.',
							'team-free'
						)}
					</p>
				</div>

				{isEmpty && (
					<div className="sptp-placements__tools">
						<SyncButton syncing={syncing} scannedAt={report.scannedAt} onSync={sync} />
					</div>
				)}

				{isFilled && (
					<div className="sptp-placements__tools">
						{filters.length > 0 && (
							<div
								className="sptp-placements__filters"
								role="group"
								aria-label={__('Filter by type', 'team-free')}
							>
								{filters.map((filter) => (
									<button
										key={filter.key}
										type="button"
										className={`sptp-placements__filter${
											activeSource === filter.key ? ' is-active' : ''
										}`}
										aria-pressed={activeSource === filter.key}
										onClick={() => pickSource(filter.key)}
									>
										{filter.label}
									</button>
								))}
							</div>
						)}
						<SyncButton syncing={syncing} scannedAt={report.scannedAt} onSync={sync} />
						<label className="sptp-placements__search" htmlFor="sptp-placements-search">
							<span className="dashicons dashicons-search" aria-hidden="true" />
							<input
								id="sptp-placements-search"
								type="search"
								value={query}
								onChange={(event) => {
									setQuery(event.target.value);
									setLimit(PAGE_SIZE);
								}}
								placeholder={__('Search', 'team-free')}
								aria-label={__('Search placements', 'team-free')}
							/>
						</label>
					</div>
				)}
			</div>

			{error && (
				<div className="sptp-placements__state" role="alert">
					<p>{error}</p>
					<button type="button" className="sptp-placements__load-more" onClick={load}>
						{__('Try again', 'team-free')}
					</button>
				</div>
			)}

			{!error && !report && (
				<div className="sptp-placements__skeleton" aria-hidden="true">
					{[0, 1, 2].map((i) => (
						<span key={i} className="sptp-placements__skeleton-row" />
					))}
				</div>
			)}

			{isFilled && (
				<>
					<div className="sptp-placements__table" role="table">
						<div className="sptp-placements__row sptp-placements__row--head" role="row">
							<span role="columnheader">{__('Used on', 'team-free')}</span>
							<span role="columnheader">{__('Type & Layouts', 'team-free')}</span>
							<span role="columnheader">{__('Last updated', 'team-free')}</span>
						</div>

						{visibleRows.map((row) => (
							<div key={row.key} className="sptp-placements__row" role="row">
								<div role="cell" className="sptp-placements__cell">
									<UsedOn row={row} />
								</div>
								<div role="cell" className="sptp-placements__cell">
									<TypeAndLayouts row={row} />
								</div>
								<div
									role="cell"
									className="sptp-placements__cell sptp-placements__date"
								>
									{formatDate(row.modified)}
								</div>
							</div>
						))}

						{0 === rows.length && (
							<div className="sptp-placements__no-match">
								{__('Nothing matches your filter.', 'team-free')}
							</div>
						)}
					</div>

					<div className="sptp-placements__foot">
						<span>
							{sprintf(
								/* translators: 1: rows shown, 2: rows matching */
								__('Showing %1$d of %2$d', 'team-free'),
								visibleRows.length,
								rows.length
							)}
							{report.capped &&
								' · ' +
									__(
										'Only the 500 most recently updated items were scanned.',
										'team-free'
									)}
						</span>
						{rows.length > limit && (
							<button
								type="button"
								className="sptp-placements__more-link"
								onClick={() => setLimit((current) => current + PAGE_SIZE)}
							>
								{__('Load more →', 'team-free')}
							</button>
						)}
					</div>
				</>
			)}

			{isEmpty && (
				<div className="sptp-placements__empty">
					<EmptyArtwork />
					<h3 className="sptp-placements__empty-title">
						{__('No Team Showcase Yet', 'team-free')}
					</h3>
					<p className="sptp-placements__empty-text">
						{__(
							'Add a block, shortcode, or saved template to any page or post, and it will show up here.',
							'team-free'
						)}
					</p>
					{createUrl && (
						<a className="sptp-placements__empty-link" href={createUrl}>
							{__('Add to a Page', 'team-free')}
							<span className="dashicons dashicons-plus-alt2" aria-hidden="true" />
						</a>
					)}
				</div>
			)}
		</section>
	);
}
