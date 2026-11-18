/**
 * "Do more with Smart Team Pro" — what picking a Pro block in the inserter
 * opens instead of putting the block on the canvas (port of
 * wp-carousel-free's shared/pro-upgrade/ProUpgradeDialog.jsx).
 *
 * The Pro layouts drifting by, the Pro features in two columns, and the way
 * to upgrade. The layout artwork is a real Smart Team Pro render of each
 * layout (blocks/assets/images/pro-upgrade/*.webp, shipped with the plugin,
 * loaded from SPT_BLOCKS_URL — never from a remote host). Every feature listed is checked
 * against the Lite vs Pro page (apps/dashboard/pages/LiteVsPro.jsx) —
 * update both together.
 */

import { Modal } from '@wordpress/components';
import { getBlockType } from '@wordpress/blocks';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { PRO_BLOCK_UPGRADE_URL } from '../proBlockNotice';
import { getProInserterPatternCategory } from '../proGate';
import { generateDemoLink } from '../../../components/demoLinks';
import './pro-upgrade-dialog.scss';

// Same base the Image Masking picker loads its shapes from (AssetManager).
const IMAGE_DIR = `${window.sptpBlocksEditor?.blocksUrl || ''}assets/images/pro-upgrade/`;

/**
 * Pro layouts shown in the drifting lane.
 *
 * @return {Array<{title: string, image: string}>} Layout cards.
 */
function getLayoutCards() {
	return [
		{ title: __('3D Carousel', 'team-free'), image: 'carousel-3d.webp' },
		{ title: __('Overlay Cards', 'team-free'), image: 'overlay-cards.webp' },
		{ title: __('Center Carousel', 'team-free'), image: 'carousel-center.webp' },
		{ title: __('Ticker Carousel', 'team-free'), image: 'carousel-ticker.webp' },
		{ title: __('Multi-Row Carousel', 'team-free'), image: 'carousel-multi-row.webp' },
		{ title: __('Polaroid Grid', 'team-free'), image: 'grid-polaroid.webp' },
		{ title: __('Staggered Grid', 'team-free'), image: 'grid-staggered.webp' },
	];
}

/**
 * Pro features listed in the dialog.
 *
 * @return {Array<string>} Feature labels.
 */
function getFeatures() {
	return [
		__('3D & Panorama Carousels', 'team-free'),
		__('12 More Card Designs incl. Overlays', 'team-free'),
		__('Center, Ticker & Multi-Row Carousels', 'team-free'),
		__('Polaroid & Staggered Grids', 'team-free'),
		__('Ajax Member Search & Live Filter', 'team-free'),
		__('Quick-View Modal for Member Details', 'team-free'),
		__('Resume, Video & Photo Gallery', 'team-free'),
		__('Unlimited Custom Fields', 'team-free'),
		__('Motion Effects & Hover Content', 'team-free'),
		__('Image Flip, More Mask Shapes & Filters', 'team-free'),
		__('Priority Support', 'team-free'),
	];
}

/**
 * One drifting lane of layout cards, doubled so the loop never shows a gap.
 *
 * @return {Element} Lane.
 */
function LayoutLane() {
	const cards = getLayoutCards();

	return (
		<div className="sp-smart-team-pro-upgrade-lanes" aria-hidden="true">
			<div className="sp-smart-team-pro-upgrade-lane">
				{[...cards, ...cards].map(({ title, image }, index) => (
					<figure key={index} className="sp-smart-team-pro-upgrade-card">
						<img
							src={`${IMAGE_DIR}${image}`}
							alt=""
							width="326"
							height="231"
							// Eager on purpose: the lane is wider than the dialog and drifts,
							// so lazy loading left the off-screen cards blank until they
							// scrolled in. All seven previews total ~92 KB, shipped locally.
							loading="eager"
							decoding="async"
						/>
						<figcaption>{title}</figcaption>
					</figure>
				))}
			</div>
		</div>
	);
}

/**
 * The dialog.
 *
 * @param {Object}   props
 * @param {string}   [props.blockName] Pro block that opened it.
 * @param {Function} props.onClose     Closes the dialog.
 * @return {Element} Dialog.
 */
export default function ProUpgradeDialog({ blockName, onClose }) {
	const blockTitle = blockName ? getBlockType(blockName)?.title : '';
	const demoLink = generateDemoLink(blockName ? getProInserterPatternCategory(blockName) : null);

	return (
		<Modal
			className="sp-smart-team-pro-upgrade"
			overlayClassName="sp-smart-team-pro-upgrade-overlay"
			title={__('Smart Team Pro', 'team-free')}
			onRequestClose={onClose}
			__experimentalHideHeader
		>
			<div className="sp-smart-team-pro-upgrade-visual">
				<LayoutLane />
				<button
					type="button"
					className="sp-smart-team-pro-upgrade-close"
					aria-label={__('Close', 'team-free')}
					onClick={onClose}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						aria-hidden="true"
					>
						<path d="M6 6l12 12M18 6L6 18" />
					</svg>
				</button>
			</div>
			<div className="sp-smart-team-pro-upgrade-body">
				<div className="sp-smart-team-pro-upgrade-intro">
					<h2 className="sp-smart-team-pro-upgrade-title">
						{__('Do more with Smart Team Pro', 'team-free')}
					</h2>
					<p className="sp-smart-team-pro-upgrade-subtitle">
						{blockTitle
							? createInterpolateElement(
									sprintf(
										/* translators: %s: Pro block title, e.g. "3D Carousel". */
										__(
											'<strong>%s</strong> is a Pro block. Upgrade to unlock it with more layouts, card designs and member details for every team showcase.',
											'team-free'
										),
										blockTitle
									),
									{ strong: <strong /> }
								)
							: __(
									'More layouts, card designs and member details for every team showcase.',
									'team-free'
								)}
					</p>
				</div>
				<ul className="sp-smart-team-pro-upgrade-features">
					{getFeatures().map((feature) => (
						<li key={feature}>{feature}</li>
					))}
				</ul>
				<div className="sp-smart-team-pro-upgrade-actions">
					<a
						className="sp-smart-team-pro-upgrade-demo"
						href={demoLink}
						target="_blank"
						rel="noopener noreferrer"
					>
						{blockTitle
							? sprintf(
									/* translators: %s: Pro block title, e.g. "3D Carousel". */
									__('View %s Demo', 'team-free'),
									blockTitle
								)
							: __('View Demo', 'team-free')}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
						</svg>
					</a>
					<a
						className="sp-smart-team-pro-upgrade-cta"
						href={PRO_BLOCK_UPGRADE_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('Upgrade to Pro', 'team-free')}
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</a>
					<span className="sp-smart-team-pro-upgrade-guarantee">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
						</svg>
						{__('14-day money-back guarantee', 'team-free')}
					</span>
				</div>
			</div>
		</Modal>
	);
}
