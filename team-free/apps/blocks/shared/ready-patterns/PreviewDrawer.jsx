import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { PATTERN_UPGRADE_URL, PREVIEW_DEVICES } from './constants';
import { isFreePattern } from './filterHelpers';
import { ProCrownIcon } from '../../../components/icons';
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	CloseIcon,
	DesktopIcon,
	DownloadIcon,
	MobileIcon,
	RefreshIcon,
	TabletIcon,
} from './icons';

/**
 * Height the frame falls back to before the stage has been measured.
 */
const FALLBACK_STAGE_HEIGHT = 560;

const DEVICE_ICONS = {
	desktop: DesktopIcon,
	tablet: TabletIcon,
	mobile: MobileIcon,
};

/**
 * Translated label for a device key.
 *
 * @param {string} key Device key.
 * @return {string} Label.
 */
function deviceLabel(key) {
	if ('tablet' === key) {
		return __('Tablet', 'team-free');
	}
	if ('mobile' === key) {
		return __('Mobile', 'team-free');
	}

	return __('Desktop', 'team-free');
}

/**
 * Sandbox flags for the preview frame. A cross-origin preview also gets
 * `allow-same-origin` — without it the frame's origin is `null`, so its icon
 * fonts (CORS fetches) are blocked and render as empty squares. That flag is
 * withheld for a same-origin URL, where it would let the frame script the editor.
 *
 * @param {string} url Preview URL.
 * @return {string} Sandbox attribute value.
 */
function sandboxFor(url) {
	const base = 'allow-scripts allow-forms allow-popups';
	try {
		const { origin } = new URL(url, window.location.href);
		return origin === window.location.origin ? base : `${base} allow-same-origin`;
	} catch (e) {
		return base;
	}
}

/**
 * In-modal preview drawer: live iframe when the pattern has a preview URL,
 * full-size thumbnail otherwise. The header carries the title, width switcher,
 * Insert and close, and a footer under the stage carries the pattern stepper —
 * so the stage between them gets the drawer's full width.
 *
 * A Pro pattern gets an "Upgrade to Pro" link in the header where a free one
 * gets Insert — the same swap PatternCard makes in the grid.
 *
 * The iframe is sandboxed (see `sandboxFor()`), and deliberately keeps the
 * default referrer policy — third-party players embedded inside a previewed
 * pattern reject refererless requests.
 *
 * @param {Object}   props
 * @param {Object}   props.pattern     Manifest item being previewed.
 * @param {Function} props.onClose     Close handler.
 * @param {Function} props.onInsert    Insert handler.
 * @param {boolean}  props.isInserting Whether this pattern's insert is in flight.
 * @param {number}   props.index       Zero-based position in the filtered list, or -1 when absent.
 * @param {number}   props.total       How many patterns the filtered list holds.
 * @param {Function} props.onPrevious  Step to the previous pattern.
 * @param {Function} props.onNext      Step to the next pattern.
 * @return {JSX.Element} Drawer markup.
 */
export default function PreviewDrawer({
	pattern,
	onClose,
	onInsert,
	isInserting,
	index = -1,
	total = 0,
	onPrevious,
	onNext,
}) {
	const [device, setDevice] = useState(PREVIEW_DEVICES[0].key);
	const [isFrameLoading, setIsFrameLoading] = useState(true);
	// Measured content box of the stage — the frame is scaled to fit it, so the
	// preview stays fitted at any drawer width and through window resizes.
	const [stage, setStage] = useState({ width: 0, height: 0 });
	const closeRef = useRef(null);
	const stageRef = useRef(null);
	const drawerRef = useRef(null);

	useEffect(() => {
		closeRef.current?.focus();
	}, []);

	useEffect(() => {
		const handleKeyDown = (event) => {
			if ('Escape' === event.key) {
				event.preventDefault();
				event.stopPropagation();
				onClose();
			}
		};

		document.addEventListener('keydown', handleKeyDown, true);
		return () => document.removeEventListener('keydown', handleKeyDown, true);
	}, [onClose]);

	useEffect(() => {
		const node = stageRef.current;
		if (!node || 'undefined' === typeof ResizeObserver) {
			return undefined;
		}

		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			setStage({ width: Math.round(width), height: Math.round(height) });
		});
		observer.observe(node);

		return () => observer.disconnect();
	}, []);

	// Mouse-down rather than click, so releasing a text selection that started
	// inside the drawer never counts as clicking the dimmed area.
	const handleBackdropMouseDown = (event) => {
		if (drawerRef.current && !drawerRef.current.contains(event.target)) {
			onClose();
		}
	};

	const activeDevice =
		PREVIEW_DEVICES.find((entry) => entry.key === device) || PREVIEW_DEVICES[0];
	const scale = stage.width ? Math.min(1, stage.width / activeDevice.width) : 1;
	const frameHeight = Math.round((stage.height || FALLBACK_STAGE_HEIGHT) / scale);
	const isPro = !isFreePattern(pattern);
	// Only an http(s) page is framed — the manifest is remote data.
	const previewUrl = /^https?:\/\//i.test(pattern?.previewUrl || '') ? pattern.previewUrl : '';
	const thumb = pattern?.thumb?.['2x'] || pattern?.thumb?.['1x'] || pattern?.image || '';
	// The footer's count only means anything while the previewed pattern is still
	// part of the filtered list — changing a filter underneath the drawer drops it out.
	const isListed = index >= 0;
	const canPrevious = index > 0;
	const canNext = isListed && index < total - 1;

	// A new pattern swaps the iframe src — show the preloader again until it lands.
	// Device switching only resizes the frame, so it must not reset this.
	useEffect(() => {
		setIsFrameLoading(true);
	}, [previewUrl]);

	return (
		<div className="sptp-ready-patterns-drawer-backdrop" onMouseDown={handleBackdropMouseDown}>
			<section
				className="sptp-ready-patterns-drawer"
				ref={drawerRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="sptp-ready-patterns-drawer-title"
			>
				<header className="sptp-ready-patterns-drawer-header">
					<h2
						className="sptp-ready-patterns-drawer-title"
						id="sptp-ready-patterns-drawer-title"
					>
						{pattern?.name}
					</h2>

					<div
						className="sptp-ready-patterns-drawer-devices"
						role="group"
						aria-label={__('Preview width', 'team-free')}
					>
						{PREVIEW_DEVICES.map((entry) => {
							const Icon = DEVICE_ICONS[entry.key] || DesktopIcon;
							return (
								<button
									key={entry.key}
									type="button"
									className={`sptp-ready-patterns-drawer-device${
										entry.key === device ? ' is-active' : ''
									}`}
									aria-pressed={entry.key === device}
									aria-label={deviceLabel(entry.key)}
									title={deviceLabel(entry.key)}
									onClick={() => setDevice(entry.key)}
								>
									<Icon />
								</button>
							);
						})}
					</div>

					<div className="sptp-ready-patterns-drawer-header-right">
						{isPro ? (
							<a
								className="sptp-ready-patterns-upgrade-btn"
								href={PATTERN_UPGRADE_URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								<ProCrownIcon color="#fff" fill="none" size={16} />
								{__('Upgrade to Pro', 'team-free')}
							</a>
						) : (
							<button
								type="button"
								className={`sptp-ready-patterns-insert-btn${isInserting ? ' is-busy' : ''}`}
								onClick={() => onInsert(pattern)}
								disabled={isInserting}
							>
								{isInserting
									? __('Inserting…', 'team-free')
									: __('Insert', 'team-free')}
								{isInserting ? <RefreshIcon /> : <DownloadIcon />}
							</button>
						)}
						<button
							type="button"
							className="sptp-ready-patterns-drawer-close"
							aria-label={__('Close preview', 'team-free')}
							onClick={onClose}
							ref={closeRef}
						>
							<CloseIcon size={24} />
						</button>
					</div>
				</header>

				<div className="sptp-ready-patterns-drawer-body">
					<div className="sptp-ready-patterns-drawer-stage" ref={stageRef}>
						{previewUrl ? (
							<iframe
								className={`sptp-ready-patterns-drawer-frame${
									isFrameLoading ? ' is-loading' : ''
								}`}
								title={sprintf(
									/* translators: %s: pattern name */
									__('Preview of %s', 'team-free'),
									pattern?.name || ''
								)}
								src={previewUrl}
								sandbox={sandboxFor(previewUrl)}
								onLoad={() => setIsFrameLoading(false)}
								style={{
									width: `${activeDevice.width}px`,
									height: `${frameHeight}px`,
									transform: `scale(${scale})`,
								}}
							/>
						) : (
							<div className="sptp-ready-patterns-drawer-thumb">
								{thumb ? (
									<img src={thumb} alt="" />
								) : (
									<p>
										{__('No preview available for this pattern.', 'team-free')}
									</p>
								)}
							</div>
						)}

						{previewUrl && isFrameLoading ? (
							<div className="sptp-ready-patterns-drawer-loader" aria-hidden="true">
								<span className="sptp-ready-patterns-drawer-loader-spinner" />
								<span className="sptp-ready-patterns-drawer-loader-text">
									{__('Loading preview…', 'team-free')}
								</span>
							</div>
						) : null}
					</div>
				</div>

				{isListed ? (
					<footer className="sptp-ready-patterns-drawer-footer">
						<span className="sptp-ready-patterns-drawer-footer-count">
							{sprintf(
								/* translators: 1: current pattern number, 2: total patterns */
								__('Patterns %1$d of %2$d', 'team-free'),
								index + 1,
								total
							)}
						</span>

						<div
							className="sptp-ready-patterns-drawer-footer-nav"
							role="group"
							aria-label={__('Browse patterns', 'team-free')}
						>
							<button
								type="button"
								className="sptp-ready-patterns-drawer-page"
								aria-label={__('Previous pattern', 'team-free')}
								onClick={onPrevious}
								disabled={!canPrevious}
							>
								<ChevronLeftIcon />
								{__('Prev', 'team-free')}
							</button>
							<button
								type="button"
								className="sptp-ready-patterns-drawer-page"
								aria-label={__('Next pattern', 'team-free')}
								onClick={onNext}
								disabled={!canNext}
							>
								{__('Next', 'team-free')}
								<ChevronRightIcon />
							</button>
						</div>
					</footer>
				) : null}
			</section>
		</div>
	);
}
