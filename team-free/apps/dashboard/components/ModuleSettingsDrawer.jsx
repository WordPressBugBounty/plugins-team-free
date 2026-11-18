/**
 * Slide-in drawer shell for a module card's gear icon — portal, backdrop,
 * focus trap, Escape to close, body scroll lock and the 300ms slide-in,
 * forked from ChangelogDrawer.jsx (and Pro's ModuleSettingsDrawer). The module drawers only supply their form.
 */
import { __ } from '@wordpress/i18n';
import { createPortal, useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { CloseIcon } from './icons';

const ANIMATION_MS = 300;

/**
 * @param {Object}      props
 * @param {boolean}     props.open        Whether the drawer is open.
 * @param {Function}    props.onClose     Called on close button, backdrop or Escape.
 * @param {string}      props.title       Header title (also the dialog label).
 * @param {string}      props.iconSrc     32px header icon URL.
 * @param {string}      [props.ariaLabel] Dialog label, when it should differ from the title.
 * @param {string}      [props.className] Modifier class on the root.
 * @param {JSX.Element} props.footer      Pinned footer content (the buttons).
 * @param {JSX.Element} props.children    Scrolling body content.
 */
const ModuleSettingsDrawer = ({
	open,
	onClose,
	ariaLabel,
	title,
	iconSrc,
	className = '',
	footer,
	children,
}) => {
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
				'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

	useEffect(() => {
		if (!open) {
			return;
		}
		const { body } = document;
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

	return createPortal(
		<div
			className={`sptp-module-drawer${className ? ` ${className}` : ''}${
				entered ? ' is-open' : ''
			}`}
			onKeyDown={onKeyDown}
			role="presentation"
		>
			<div className="sptp-module-drawer__backdrop" onClick={onClose} role="presentation" />
			<div
				className="sptp-module-drawer__panel"
				role="dialog"
				aria-modal="true"
				aria-label={ariaLabel || title}
				tabIndex={-1}
				ref={panelRef}
			>
				<div className="sptp-module-drawer__header">
					<span className="sptp-module-drawer__icon">
						<img src={iconSrc} alt="" width="32" height="32" />
					</span>
					<p className="sptp-module-drawer__title">{title}</p>
					<button
						type="button"
						className="sptp-module-drawer__close"
						onClick={onClose}
						aria-label={__('Close', 'team-free')}
					>
						<CloseIcon />
					</button>
				</div>
				<div className="sptp-module-drawer__body">{children}</div>
				<div className="sptp-module-drawer__footer">{footer}</div>
			</div>
		</div>,
		document.body
	);
};

export default ModuleSettingsDrawer;
