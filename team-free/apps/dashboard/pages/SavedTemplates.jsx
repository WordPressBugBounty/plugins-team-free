import { __, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { toast } from 'react-hot-toast';
import { STORE_NAME } from '../store';
import SavedTemplatesPromo from '../components/SavedTemplatesPromo';
import {
	CheckIcon,
	CopyIcon,
	DeleteBinIcon,
	EditPencilIcon,
	EmptyStateFolderIcon,
	LeftArrow,
	PlusIcon,
	RightArrow,
	ShortcodeCopyIcon,
} from '../components/SavedTemplateIcons';

const PER_PAGE = 10;
const TITLE_MAX = 37;

/**
 * Copy to clipboard with an execCommand fallback for non-secure contexts.
 *
 * @param {string} text Text to copy.
 * @return {Promise<boolean>} Whether the copy succeeded.
 */
const copyText = async (text) => {
	if (window.navigator?.clipboard?.writeText) {
		try {
			await window.navigator.clipboard.writeText(text);
			return true;
		} catch (error) {
			// Fall through to the textarea fallback below.
		}
	}

	try {
		const textarea = window.document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		textarea.style.pointerEvents = 'none';
		window.document.body.appendChild(textarea);
		textarea.select();
		const ok = window.document.execCommand('copy');
		window.document.body.removeChild(textarea);
		return ok;
	} catch (error) {
		return false;
	}
};

/**
 * Saved Templates — the management table for block-editor team layouts reusable
 * as a shortcode, plus the legacy generator ("classic") shortcodes.
 */
const SavedTemplates = () => {
	const [bulkAction, setBulkAction] = useState('');
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState([]);
	const [copiedId, setCopiedId] = useState(0);
	const [busy, setBusy] = useState(false);
	// Flips once the first request settles, so a failed fetch can't leave the
	// placeholder spinning forever.
	const [attempted, setAttempted] = useState(false);

	const { adminUrl, homeUrl, pluginUrl } = useSelect(
		(select) => select(STORE_NAME).getDashboardInfo(),
		[]
	);
	const templates = useSelect((select) => select(STORE_NAME).getTemplates(), []);
	const totalItems = useSelect((select) => select(STORE_NAME).getTemplatesTotalItems(), []);
	const libraryCount = useSelect((select) => select(STORE_NAME).getTemplatesLibraryCount(), []);
	const hasResolvedLibrary = useSelect((select) => select(STORE_NAME).hasResolvedTemplates(), []);
	const loading = useSelect((select) => select(STORE_NAME).isTemplatesLoading(), []);
	const { fetchSavedTemplates, bulkSavedTemplates, duplicateSavedTemplate } =
		useDispatch(STORE_NAME);

	const wpAdminUrl = adminUrl || `${homeUrl || ''}wp-admin/`;
	const createUrl = `${wpAdminUrl}post-new.php?post_type=sptp_saved_template&sptpblock_inserter=true`;

	// Debounce the search box, and restart at page 1 on a new term.
	useEffect(() => {
		const timer = window.setTimeout(() => {
			setSearch(searchInput);
			setPage(1);
		}, 300);
		return () => window.clearTimeout(timer);
	}, [searchInput]);

	useEffect(() => {
		Promise.resolve(fetchSavedTemplates(search, page, PER_PAGE)).finally(() =>
			setAttempted(true)
		);
		// A selection can only ever act on rows the user can see.
		setSelected([]);
	}, [fetchSavedTemplates, search, page]);

	const refresh = useCallback(
		() => fetchSavedTemplates(search, page, PER_PAGE),
		[fetchSavedTemplates, search, page]
	);

	// Clear the "Copied!" chip a moment after it appears.
	useEffect(() => {
		if (!copiedId) {
			return undefined;
		}
		const timer = window.setTimeout(() => setCopiedId(0), 2000);
		return () => window.clearTimeout(timer);
	}, [copiedId]);

	const copyShortcode = async (item) => {
		const ok = await copyText(item.shortcode);
		if (ok) {
			setCopiedId(item.id);
		} else {
			toast.error(__('Failed to copy shortcode.', 'team-free'));
		}
	};

	const toggleRow = (id) =>
		setSelected((current) =>
			current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
		);

	const allChecked =
		templates.length > 0 && templates.every((item) => selected.includes(item.id));

	const toggleAll = () => setSelected(allChecked ? [] : templates.map((item) => item.id));

	const runBulk = async (action, ids) => {
		if (!ids.length || busy) {
			return;
		}

		if (
			'delete' === action &&
			// eslint-disable-next-line no-alert
			!window.confirm(
				__(
					'Are you sure you want to delete the selected template(s)? This cannot be undone.',
					'team-free'
				)
			)
		) {
			return;
		}

		setBusy(true);
		try {
			const result = await bulkSavedTemplates(ids, action);
			const failed = result?.failed?.length || 0;

			if (failed) {
				toast.error(__('Some templates could not be updated.', 'team-free'));
			} else if ('delete' === action) {
				toast.success(__('Template(s) deleted.', 'team-free'));
			} else {
				toast.success(__('Template status updated.', 'team-free'));
			}

			setSelected([]);
			await refresh();
		} catch (error) {
			toast.error(__('The request failed. Try again.', 'team-free'));
		}
		setBusy(false);
	};

	const applyBulk = () => {
		if (!bulkAction) {
			return;
		}
		runBulk(bulkAction, selected);
		setBulkAction('');
	};

	const duplicate = async (id) => {
		if (busy) {
			return;
		}
		setBusy(true);
		try {
			await duplicateSavedTemplate(id);
			toast.success(__('Template duplicated.', 'team-free'));
			await refresh();
		} catch (error) {
			toast.error(__('Failed to duplicate the template.', 'team-free'));
		}
		setBusy(false);
	};

	const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

	const columns = ['checkBox', 'title', 'block', 'shortcode', 'date', 'action'];

	// The banner introduces the feature, so it retires once the first template exists.
	const hasTemplates = libraryCount > 0;
	const showPromo = hasResolvedLibrary && !hasTemplates;

	const columnLabel = (column) => {
		switch (column) {
			case 'title':
				return __('Title', 'team-free');
			case 'block':
				return __('Block', 'team-free');
			case 'shortcode':
				return __('Shortcode', 'team-free');
			case 'date':
				return __('Date', 'team-free');
			case 'action':
				return __('Actions', 'team-free');
			default:
				return '';
		}
	};

	const formatDate = (value) => {
		if (!value) {
			return '';
		}
		// WordPress hands over site-local "Y-m-d H:i:s" — normalize the space so
		// Safari parses it too, and render it as-is (no timezone shifting).
		const date = new Date(value.replace(' ', 'T'));
		return isNaN(date.getTime()) ? value : date.toLocaleString('en-US');
	};

	const blockLabel = (item) => {
		if ('block' !== item.editorType) {
			return __('Classic', 'team-free');
		}
		return item.blockTitle || __('Block Editor', 'team-free');
	};

	// Until the first response we don't know whether to show the promo, the
	// empty state or the table. Painting any of them would be replaced a moment
	// later at a different height, so hold one fixed placeholder instead.
	if (!hasResolvedLibrary && !attempted) {
		return (
			<div className="sptp-page sptp-saved-templates">
				<div className="sptp-saved-templates__pending">
					<span className="spinner is-active" style={{ float: 'none', margin: 0 }} />
				</div>
			</div>
		);
	}

	return (
		<div className="sptp-page sptp-saved-templates">
			{showPromo && <SavedTemplatesPromo createUrl={createUrl} pluginUrl={pluginUrl} />}
			<div
				className={`sptp-saved-templates__container${
					hasTemplates ? '' : ' sptp-saved-templates__container--bare'
				}`}
			>
				{hasTemplates && (
					<div className="sptp-saved-template-header">
						<div className="sptp-saved-template-header__left">
							<select
								className="sptp-saved-template-select"
								value={bulkAction}
								onChange={(event) => setBulkAction(event.target.value)}
								aria-label={__('Bulk action', 'team-free')}
							>
								<option value="">{__('Bulk Action', 'team-free')}</option>
								<option value="publish">{__('Publish', 'team-free')}</option>
								<option value="draft">{__('Draft', 'team-free')}</option>
								<option value="delete">{__('Delete', 'team-free')}</option>
							</select>
							<button
								type="button"
								className="sptp-saved-template-apply"
								onClick={applyBulk}
								disabled={busy || !bulkAction || !selected.length}
							>
								{__('Apply', 'team-free')}
							</button>
							<input
								type="text"
								className="sptp-saved-template-search"
								placeholder={__('Search…', 'team-free')}
								value={searchInput}
								spellCheck="false"
								onChange={(event) => setSearchInput(event.target.value)}
								aria-label={__('Search templates', 'team-free')}
							/>
						</div>
						<div className="sptp-saved-template-header__right">
							<a href={createUrl} className="sptp-saved-template-add-new">
								<PlusIcon />
								{__('Create a Saved Template', 'team-free')}
							</a>
						</div>
					</div>
				)}

				<table className="sptp-saved-template-table">
					<thead className="sptp-saved-template-table__head">
						<tr>
							{columns.map((column) => (
								<th key={column} className={`sptp-saved-template-col-${column}`}>
									{'checkBox' === column ? (
										<input
											type="checkbox"
											checked={allChecked}
											onChange={toggleAll}
											aria-label={__('Select all templates', 'team-free')}
										/>
									) : (
										columnLabel(column)
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody
						className="sptp-saved-template-table__body"
						style={{
							opacity: loading || busy ? 0.5 : 1,
							// Reserve a full page of rows while paginating so a
							// short last page doesn't collapse the table height.
							minHeight: totalPages > 1 ? '640px' : undefined,
						}}
					>
						{loading && !templates.length && (
							<tr>
								<td className="sptp-saved-template-empty" colSpan={columns.length}>
									<span
										className="spinner is-active"
										style={{ float: 'none', margin: 0 }}
									/>
								</td>
							</tr>
						)}

						{!loading && !templates.length && (
							<tr className="sptp-saved-template-empty-row">
								<td className="sptp-saved-template-empty" colSpan={columns.length}>
									<div className="sptp-saved-template-empty__message">
										<EmptyStateFolderIcon />
										<p className="sptp-saved-template-empty__text">
											{search
												? __(
														'No team showcases match your search.',
														'team-free'
													)
												: __('No team showcase yet.', 'team-free')}
										</p>
									</div>
									{!search && (
										<a
											href={createUrl}
											className="sptp-saved-template-empty__cta"
										>
											{__('Create a Saved Template', 'team-free')}
											<PlusIcon />
										</a>
									)}
								</td>
							</tr>
						)}

						{templates.map((item) => {
							// The REST title arrives escaped; decode it so the
							// length trim can't cut an entity in half.
							const title =
								decodeEntities(item.title?.rendered || '') ||
								__('(No Title)', 'team-free');

							return (
								<tr key={item.id}>
									<td className="sptp-saved-template-col-checkBox">
										<input
											type="checkbox"
											checked={selected.includes(item.id)}
											onChange={() => toggleRow(item.id)}
											aria-label={sprintf(
												/* translators: %s: template title. */
												__('Select %s', 'team-free'),
												title
											)}
										/>
									</td>
									<td className="sptp-saved-template-col-title">
										<a href={item.editUrl} title={title}>
											<span className="sptp-saved-template-title">
												{title.length > TITLE_MAX
													? `${title.slice(0, TITLE_MAX)}…`
													: title}
											</span>
										</a>
									</td>
									<td className="sptp-saved-template-col-block">
										<span className="sptp-block-badge">{blockLabel(item)}</span>
									</td>
									<td className="sptp-saved-template-col-shortcode">
										<button
											type="button"
											className="sptp-saved-template-shortcode"
											onClick={() => copyShortcode(item)}
											title={__('Click to copy', 'team-free')}
										>
											{item.shortcode}
										</button>
										{copiedId === item.id ? (
											<span className="sptp-saved-template-copied">
												<CheckIcon />
												{__('Copied!', 'team-free')}
											</span>
										) : (
											<button
												type="button"
												className="sptp-saved-template-copy-icon"
												onClick={() => copyShortcode(item)}
												aria-label={__('Copy shortcode', 'team-free')}
											>
												<ShortcodeCopyIcon />
											</button>
										)}
									</td>
									<td className="sptp-saved-template-col-date">
										<div className="sptp-saved-template-status">
											{item.status}
										</div>
										<div>{formatDate(item.modified)}</div>
									</td>
									<td className="sptp-saved-template-col-action">
										<div className="sptp-saved-template-actions">
											<a
												href={item.editUrl}
												className="sptp-saved-template-action"
												title={__('Edit', 'team-free')}
												aria-label={__('Edit', 'team-free')}
											>
												<EditPencilIcon />
											</a>
											<button
												type="button"
												className="sptp-saved-template-action"
												onClick={() => duplicate(item.id)}
												title={__('Duplicate', 'team-free')}
												aria-label={__('Duplicate', 'team-free')}
											>
												<CopyIcon />
											</button>
											<button
												type="button"
												className="sptp-saved-template-action sptp-saved-template-action--delete"
												onClick={() => runBulk('delete', [item.id])}
												title={__('Delete', 'team-free')}
												aria-label={__('Delete', 'team-free')}
											>
												<DeleteBinIcon />
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>

				{hasTemplates && (
					// Hidden, not unmounted, while loading: removing it would
					// pull the page up and push it back down on every fetch.
					<div
						className="sptp-saved-template-footer"
						style={loading ? { visibility: 'hidden' } : undefined}
					>
						<div className="sptp-saved-template-count">
							{sprintf(
								/* translators: 1: current page, 2: total pages. */
								__('Page %1$d of %2$d', 'team-free'),
								page,
								totalPages
							)}{' '}
							<span>
								{sprintf(
									/* translators: %d: number of templates. */
									__('[ %d Items ]', 'team-free'),
									totalItems
								)}
							</span>
						</div>
						{totalPages > 1 && (
							<div className="sptp-saved-template-pagination">
								<button
									type="button"
									className={`sptp-pagination-btn${1 === page ? ' is-disabled' : ''}`}
									onClick={() => setPage(Math.max(1, page - 1))}
									disabled={1 === page}
									aria-label={__('Previous page', 'team-free')}
								>
									<LeftArrow />
								</button>
								{pages.map((value) => (
									<button
										key={value}
										type="button"
										className={`sptp-pagination-btn${page === value ? ' is-active' : ''}`}
										onClick={() => setPage(value)}
									>
										{value}
									</button>
								))}
								<button
									type="button"
									className={`sptp-pagination-btn${page === totalPages ? ' is-disabled' : ''}`}
									onClick={() => setPage(Math.min(totalPages, page + 1))}
									disabled={page === totalPages}
									aria-label={__('Next page', 'team-free')}
								>
									<RightArrow />
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default SavedTemplates;
