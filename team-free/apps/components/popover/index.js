import { Popover } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { getRandomId } from '../../controls/controls';
import ProTag from '../proTag/proTag.js';
import { PopOverCustomToggleIcon, PopOverToggleIcon } from './icons';
import './editor.scss';

// compound component.
const SpPopover = ({
	children,
	label = 'popover',
	toggleIcon = false,
	className = '',
	offset = 10,
	// Icon-only mode — render just the toggle button (no title row, no bottom
	// margin) so the popover can sit inline, e.g. inside a sortable list row.
	toggleOnly = false,
	// WP Popover placement against the anchor (this component's own wrapper, so
	// the whole label+icon row). Left undefined the popover keeps core's
	// bottom-start, i.e. flush with the label; `bottom-end` drops it under the
	// toggle icon instead — right for a small body like an alignment matrix.
	placement = undefined,
	// Pro-lock (Figma: Smart Team / Toggle & Title, node 678:280583): the label
	// carries a green "(Pro)" tag and the toggle icon is dimmed and inert, so
	// the popover never opens and `children` are never rendered.
	isPro = false,
}) => {
	const [open, setOpen] = useState(false);
	const uniqueId = `${getRandomId('sp-eab')}popover`;

	useEffect(() => {
		const clickOutSite = (e) => {
			// A control that unmounts on click (e.g. a range Reset button hiding
			// itself at the default) is detached by now, so closest() can't place it.
			if (!e.target.isConnected) {
				return;
			}
			const componentView = e.target.closest('.sp-smart-team-popover__content-visible');
			// SpColorPicker's palette renders in its own portal outside the
			// popover content — clicking it must not close this popover.
			const colorPicker = e.target.closest(
				'.sp-smart-team-color-picker-renderer, .sp-smart-team-picker-pallet-wrapper'
			);
			const buttonTarget = e.target.closest(
				`.sp-smart-team-popover-toggle-button.${uniqueId}`
			);
			const select = e.target.closest('.css-1nmdiq5-menu');
			if (open && !componentView && !buttonTarget && !select && !colorPicker) {
				setOpen(false);
			}
		};
		window.addEventListener('click', clickOutSite);

		return () => window.removeEventListener('click', clickOutSite);
	});

	if (isPro) {
		return (
			<div
				className={`sp-smart-team-popover-component sp-smart-team-component-mb is-pro${
					className ? ` ${className}` : ''
				}`}
			>
				<div className="sp-smart-team-popover-toggle-wrapper sp-d-flex sp-justify-between">
					<span className="sp-smart-team-component-title">
						{label}
						<ProTag />
					</span>
					<button
						type="button"
						disabled
						aria-disabled="true"
						className="sp-smart-team-popover-toggle-button"
					>
						{toggleIcon ? <PopOverCustomToggleIcon /> : <PopOverToggleIcon />}
					</button>
				</div>
			</div>
		);
	}

	if (toggleOnly) {
		return (
			<div className={`sp-smart-team-popover-component${className ? ` ${className}` : ''}`}>
				<button
					onClick={() => setOpen((prev) => !prev)}
					className={`sp-smart-team-popover-toggle-button ${uniqueId} sp-cursor-pointer${
						open ? ' active' : ''
					}`}
				>
					{toggleIcon ? <PopOverCustomToggleIcon /> : <PopOverToggleIcon />}
				</button>
				{open && (
					<Popover shift={true} offset={offset} resize={false} placement={placement}>
						<div className="sp-smart-team-popover__content-visible sp-smart-team-tabs-panel">
							<div className="sp-smart-team-popover__content-visible-content">
								{children}
							</div>
						</div>
					</Popover>
				)}
			</div>
		);
	}

	return (
		<div
			className={`sp-smart-team-popover-component sp-smart-team-component-mb${
				className ? ` ${className}` : ''
			}`}
		>
			{label && (
				<div className="sp-smart-team-popover-toggle-wrapper sp-d-flex sp-justify-between">
					<span className="sp-smart-team-component-title">{label}</span>
					<button
						onClick={() => setOpen((prev) => !prev)}
						className={`sp-smart-team-popover-toggle-button ${uniqueId} sp-cursor-pointer${
							open ? ' active' : ''
						}`}
					>
						{toggleIcon ? <PopOverCustomToggleIcon /> : <PopOverToggleIcon />}
					</button>
				</div>
			)}
			{open && (
				<Popover shift={true} offset={offset} resize={false} placement={placement}>
					<div className="sp-smart-team-popover__content-visible sp-smart-team-tabs-panel">
						<div className="sp-smart-team-popover__content-visible-content">
							{children}
						</div>
					</div>
				</Popover>
			)}
		</div>
	);
};

SpPopover.Header = ({ children }) => (
	<div className="sp-smart-team-popover__content-visible-label">{children}</div>
);

SpPopover.Content = ({ children }) => (
	<div className="sp-smart-team-popover__content">{children}</div>
);

export default SpPopover;
