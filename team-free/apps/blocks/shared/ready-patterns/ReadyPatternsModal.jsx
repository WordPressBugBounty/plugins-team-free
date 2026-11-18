import { __, sprintf, _n } from '@wordpress/i18n';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	createPortal,
} from '@wordpress/element';
import { useConstrainedTabbing, useFocusOnMount, useMergeRefs } from '@wordpress/compose';
import { dispatch, select } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import ErrorBoundary from './ErrorBoundary';
import Sidebar from './Sidebar';
import LibraryToolbar from './LibraryToolbar';
import PatternGrid from './PatternGrid';
import PreviewDrawer from './PreviewDrawer';
import usePatternLibrary from './usePatternLibrary';
import { insertPattern } from './insertPattern';
import { categoryFromBlockName } from './constants';
import { isFreePattern } from './filterHelpers';
import { CloseIcon, LogoMarkIcon } from './icons';
import './ready-patterns.scss';

/**
 * Move DOM focus to a block wrapper (canvas may be iframed).
 * `selectBlock` sets selection only; this makes keyboard focus follow.
 *
 * @param {string|null|undefined} clientId Block client id.
 */
function focusBlockInCanvas(clientId) {
	if (!clientId) {
		return;
	}

	const selector = `[data-block="${clientId}"]`;
	const tryFocus = (doc) => {
		const el = doc?.querySelector?.(selector);
		if (el && 'function' === typeof el.focus) {
			el.focus({ preventScroll: true });
			return true;
		}
		return false;
	};

	if (tryFocus(document)) {
		return;
	}

	const canvas = document.querySelector(
		'iframe[name="editor-canvas"], iframe.edit-site-visual-editor__editor-canvas'
	);
	if (canvas?.contentDocument) {
		tryFocus(canvas.contentDocument);
	}
}

/**
 * Fullscreen Ready Patterns Library modal — hosted once at editor level.
 *
 * @param {Object}      props
 * @param {boolean}     props.isOpen
 * @param {Function}    props.onClose
 * @param {string|null} [props.targetClientId]     Client id from the open request.
 * @param {string|null} [props.requestedBlockName] Optional category sugar from the request.
 * @return {JSX.Element|null} Portal contents when open.
 */
export default function ReadyPatternsModal({
	isOpen,
	onClose,
	targetClientId = null,
	requestedBlockName = null,
}) {
	const panelRef = useRef(null);
	const previousFocusRef = useRef(null);
	const insertedFocusClientIdRef = useRef(null);
	const previewOriginRef = useRef(null);
	const [insertingId, setInsertingId] = useState(null);
	const [refreshing, setRefreshing] = useState(false);
	const [previewPattern, setPreviewPattern] = useState(null);

	const constrainedTabbingRef = useConstrainedTabbing();
	const focusOnMountRef = useFocusOnMount('firstElement');
	const dialogRef = useMergeRefs([panelRef, constrainedTabbingRef, focusOnMountRef]);

	const library = usePatternLibrary({ isOpen });

	useEffect(() => {
		if (isOpen) {
			// eslint-disable-next-line @wordpress/no-global-active-element -- restore editor focus on close
			previousFocusRef.current = document.activeElement;
			insertedFocusClientIdRef.current = null;

			const storeName =
				requestedBlockName ||
				(targetClientId ? select(blockEditorStore).getBlockName(targetClientId) : null);
			const initialCategory = categoryFromBlockName(storeName);
			if ('all' !== initialCategory) {
				library.setCategory(initialCategory);
			}
		} else {
			setPreviewPattern(null);
		}
		// Only run when the modal opens — category pre-selection is intentional one-shot.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const handleKeyDown = (event) => {
			// The preview drawer owns Escape while it is open.
			if ('Escape' === event.key && !previewPattern) {
				event.preventDefault();
				onClose();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose, previewPattern]);

	useEffect(() => {
		if (isOpen) {
			return;
		}

		const focusClientId = insertedFocusClientIdRef.current;
		if (focusClientId) {
			// After a successful insert, follow the block — the invoker may be gone.
			requestAnimationFrame(() => focusBlockInCanvas(focusClientId));
			insertedFocusClientIdRef.current = null;
			return;
		}

		if (previousFocusRef.current?.focus) {
			previousFocusRef.current.focus();
		}
	}, [isOpen]);

	const handleBackdropClick = useCallback(
		(event) => {
			if (previewPattern) {
				return;
			}
			if (panelRef.current && !panelRef.current.contains(event.target)) {
				onClose();
			}
		},
		[onClose, previewPattern]
	);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await library.refresh();
		} finally {
			setRefreshing(false);
		}
	}, [library]);

	const runInsert = useCallback(
		async (pattern) => {
			setInsertingId(pattern.id);
			try {
				const result = await insertPattern({
					patternId: pattern.id,
					patternName: pattern.name,
					requestedClientId: targetClientId,
				});
				if (result?.success) {
					insertedFocusClientIdRef.current = result.focusClientId || null;
					setPreviewPattern(null);
					onClose();
				}
			} catch (insertError) {
				dispatch('core/notices').createErrorNotice(
					insertError?.message || __('Failed to insert pattern.', 'team-free')
				);
			} finally {
				setInsertingId(null);
			}
		},
		[targetClientId, onClose]
	);

	const handleInsert = useCallback(
		(pattern) => {
			// A Pro pattern's card and drawer offer an Upgrade link instead of
			// Insert — this is the backstop so no caller can insert one anyway.
			// (Pro's requirements preflight is not ported: Free has no modules
			// to require, and `minPluginVersion` counts Pro releases.)
			if (insertingId || !isFreePattern(pattern)) {
				return;
			}

			runInsert(pattern);
		},
		[insertingId, runInsert]
	);

	const handlePreview = useCallback((pattern) => {
		// eslint-disable-next-line @wordpress/no-global-active-element -- restore the invoking Preview button
		previewOriginRef.current = document.activeElement;
		setPreviewPattern(pattern);
	}, []);

	// Where the previewed pattern sits in the list the grid is currently showing.
	// -1 once a filter change has dropped it out, which hides the step controls.
	const previewIndex = useMemo(
		() =>
			previewPattern
				? library.visibleItems.findIndex((item) => item.id === previewPattern.id)
				: -1,
		[previewPattern, library.visibleItems]
	);

	// Stops at both ends rather than wrapping, so the footer's disabled Prev and
	// Next report where the list really ends.
	const handleStepPreview = useCallback(
		(offset) => {
			const items = library.visibleItems;
			if (previewIndex < 0) {
				return;
			}

			const next = previewIndex + offset;
			if (next < 0 || next >= items.length) {
				return;
			}

			setPreviewPattern(items[next]);
		},
		[library.visibleItems, previewIndex]
	);

	const handleClosePreview = useCallback(() => {
		setPreviewPattern(null);
		const origin = previewOriginRef.current;
		previewOriginRef.current = null;
		if (origin?.focus) {
			requestAnimationFrame(() => origin.focus());
		}
	}, []);

	const statusMessage = useMemo(() => {
		if (library.loading) {
			return __('Loading patterns…', 'team-free');
		}

		return sprintf(
			/* translators: %d: number of patterns shown */
			_n('%d pattern', '%d patterns', library.visibleItems.length, 'team-free'),
			library.visibleItems.length
		);
	}, [library.loading, library.visibleItems.length]);

	if (!isOpen) {
		return null;
	}

	return createPortal(
		<div className="sptp-ready-patterns-backdrop" onMouseDown={handleBackdropClick}>
			<div
				className="sptp-ready-patterns-modal"
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-label={__('Ready Patterns Library', 'team-free')}
			>
				<header className="sptp-ready-patterns-header">
					<div className="sptp-ready-patterns-brand">
						<LogoMarkIcon />
						<h2 className="sptp-ready-patterns-title">
							{__('Ready Patterns Library', 'team-free')}
						</h2>
					</div>
					<div className="sptp-ready-patterns-header-actions">
						<button
							type="button"
							className="sptp-ready-patterns-close"
							onClick={onClose}
							aria-label={__('Close', 'team-free')}
						>
							<CloseIcon />
						</button>
					</div>
				</header>

				<div className="sptp-ready-patterns-body">
					<ErrorBoundary onRetry={library.retry}>
						<Sidebar
							tier={library.tier}
							onTierChange={library.setTier}
							search={library.search}
							onSearchChange={library.setSearch}
							category={library.category}
							onCategoryChange={library.setCategory}
							counts={library.counts}
							tierCounts={library.tierCounts}
							onClearFilters={library.clearFilters}
						/>
						<div className="sptp-ready-patterns-main">
							<LibraryToolbar
								sort={library.sort}
								onSortChange={library.setSort}
								gridDensity={library.gridDensity}
								onGridDensityChange={library.setGridDensity}
								favoritesCount={library.favorites.length}
								showFavoritesOnly={library.showFavoritesOnly}
								onToggleFavoritesView={() =>
									library.setShowFavoritesOnly(!library.showFavoritesOnly)
								}
								onRefresh={handleRefresh}
								refreshing={refreshing || library.loading}
							/>
							<div className="screen-reader-text" aria-live="polite">
								{statusMessage}
							</div>
							<PatternGrid
								loading={library.loading}
								error={library.error}
								onRetry={library.retry}
								items={library.visibleItems}
								gridDensity={library.gridDensity}
								onInsert={handleInsert}
								onPreview={handlePreview}
								insertingId={insertingId}
								favorites={library.favorites}
								onToggleFavorite={library.toggleFavorite}
							/>
						</div>
					</ErrorBoundary>
				</div>

				{previewPattern ? (
					<PreviewDrawer
						pattern={previewPattern}
						onClose={handleClosePreview}
						onInsert={handleInsert}
						isInserting={insertingId === previewPattern.id}
						index={previewIndex}
						total={library.visibleItems.length}
						onPrevious={() => handleStepPreview(-1)}
						onNext={() => handleStepPreview(1)}
					/>
				) : null}
			</div>
		</div>,
		document.body
	);
}
