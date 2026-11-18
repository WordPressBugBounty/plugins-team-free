/**
 * Changelog drawer — the panel behind the header version badge.
 *
 * Deliberately dependency-free: a portal + two CSS transitions, no MUI. It keeps
 * the accessibility MUI's Drawer would have given us — `role="dialog"`,
 * `aria-modal`, Escape to close, background scroll lock, focus moved in on open
 * and returned to the badge on close, and Tab kept inside the panel.
 */
import { __ } from '@wordpress/i18n';
import { createPortal, useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { CloseIcon } from './icons';

const ANIMATION_MS = 300;

const ChangelogDrawer = ({ open, onClose, status, changelog, retry }) => {
	// Kept mounted for one animation beat after `open` flips false, so the panel
	// can slide out instead of vanishing.
	const [mounted, setMounted] = useState(open);
	const [entered, setEntered] = useState(false);
	const panelRef = useRef();
	const returnFocusRef = useRef();

	useEffect(() => {
		if (open) {
			setMounted(true);
			return;
		}

		setEntered(false);
		if (!mounted) {
			return;
		}
		const timer = window.setTimeout(() => {
			setMounted(false);
			if (returnFocusRef.current?.focus) {
				returnFocusRef.current.focus();
			}
		}, ANIMATION_MS);
		return () => window.clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	// Flip to the open state only AFTER the closed state has been painted.
	// One rAF is not enough: it runs before the paint of the frame the panel was
	// inserted in, so the browser would only ever compute the final transform and
	// the drawer would snap into place instead of sliding.
	useEffect(() => {
		if (!mounted || !open) {
			return;
		}
		let inner;
		const outer = window.requestAnimationFrame(() => {
			inner = window.requestAnimationFrame(() => setEntered(true));
		});
		return () => {
			window.cancelAnimationFrame(outer);
			if (inner) {
				window.cancelAnimationFrame(inner);
			}
		};
	}, [mounted, open]);

	// Escape to close + Tab trapped inside the panel.
	const onKeyDown = useCallback(
		(event) => {
			if (event.key === 'Escape') {
				event.stopPropagation();
				onClose();
				return;
			}
			if (event.key !== 'Tab' || !panelRef.current) {
				return;
			}
			const { activeElement } = panelRef.current.ownerDocument;
			const focusable = panelRef.current.querySelectorAll(
				'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
			);
			if (!focusable.length) {
				return;
			}
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		},
		[onClose]
	);

	// Lock background scrolling and move focus into the panel while open.
	useEffect(() => {
		if (!open) {
			return;
		}
		const { body } = document;
		/*
		 * Hiding the scrollbar widens the viewport, so the page would jump right
		 * by the scrollbar's width on open and back on close. Pad that width onto
		 * the elements the viewport sizes — the document itself, plus the admin
		 * bar, which is `position: fixed; width: 100%` and so is not covered by
		 * the body padding. MUI's Modal does the same for the sibling plugins.
		 */
		const scrollbar = window.innerWidth - document.documentElement.clientWidth;
		const padded =
			scrollbar > 0 ? [body, document.getElementById('wpadminbar')].filter(Boolean) : [];
		const restore = padded.map((element) => [element, element.style.paddingRight]);

		const { overflow } = body.style;
		body.style.overflow = 'hidden';
		padded.forEach((element) => {
			const current = parseFloat(window.getComputedStyle(element).paddingRight) || 0;
			element.style.paddingRight = `${current + scrollbar}px`;
		});

		const frame = window.requestAnimationFrame(() => {
			// The badge still holds focus at this point — remember it, then take over.
			returnFocusRef.current = panelRef.current?.ownerDocument.activeElement;
			panelRef.current?.focus();
		});
		return () => {
			body.style.overflow = overflow;
			restore.forEach(([element, value]) => {
				element.style.paddingRight = value;
			});
			window.cancelAnimationFrame(frame);
		};
	}, [open]);

	if (!mounted) {
		return null;
	}

	const renderBody = () => {
		if (status === 'loading' || status === 'idle') {
			return (
				<div className="sptp-changelog__state">
					{/* Core admin's own spinner: @wordpress/components would add ~1 MB. */}
					<span className="spinner is-active" style={{ float: 'none', margin: 0 }} />
					<span>{__('Loading changelog…', 'team-free')}</span>
				</div>
			);
		}

		if (status === 'error') {
			return (
				<div className="sptp-changelog__state">
					<p>{__('The changelog could not be loaded. Please try again.', 'team-free')}</p>
					<button type="button" className="sptp-changelog__retry" onClick={retry}>
						{__('Retry', 'team-free')}
					</button>
				</div>
			);
		}

		if (!changelog) {
			return (
				<div className="sptp-changelog__state">
					<p>{__('No changelog is available right now.', 'team-free')}</p>
				</div>
			);
		}

		return (
			<div
				className="sptp-changelog__content"
				// Built server side from readme.txt with every string esc_html()'d.
				dangerouslySetInnerHTML={{ __html: changelog }}
			/>
		);
	};

	return createPortal(
		<div
			className={`sptp-changelog${entered ? ' is-open' : ''}`}
			onKeyDown={onKeyDown}
			role="presentation"
		>
			<div className="sptp-changelog__backdrop" onClick={onClose} role="presentation" />
			<div
				className="sptp-changelog__panel"
				role="dialog"
				aria-modal="true"
				aria-label={__('Latest updates — Changelog', 'team-free')}
				tabIndex={-1}
				ref={panelRef}
			>
				<div className="sptp-changelog__header">
					<p className="sptp-changelog__title">
						{__('Latest Updates — Changelog', 'team-free')}
					</p>
					<button
						type="button"
						className="sptp-changelog__close"
						onClick={onClose}
						aria-label={__('Close changelog', 'team-free')}
					>
						<CloseIcon />
					</button>
				</div>
				<div className="sptp-changelog__body">{renderBody()}</div>
			</div>
		</div>,
		document.body
	);
};

export default ChangelogDrawer;
