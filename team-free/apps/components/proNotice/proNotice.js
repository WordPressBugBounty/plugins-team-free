/**
 * ProNotice — the one Pro upsell card in the block Inspector (same design as
 * WP Carousel Free's inspector notice): title, one-line subtitle, a ✦ feature
 * list and an "Upgrade to Pro" link. Copy lives in
 * `apps/blocks/shared/proNotices.js`; each call site spreads one entry.
 *
 * `isPanel` drops the top margin when the notice is a locked panel's only
 * content (proPanels.jsx).
 *
 * Purely presentational — it reads and writes no attributes, so it is safe on
 * every free block (docs/pro-free-separation.md §5).
 */

import { __ } from '@wordpress/i18n';
import { UPGRADE_URL } from '../proTag/proTag.js';
import './editor.scss';

const ProNotice = ({ title, subtitle, features = [], isPanel = false }) => (
	<div className={`sp-smart-team-pro-notice${isPanel ? ' sp-smart-team-pro-notice--panel' : ''}`}>
		<h4 className="sp-smart-team-pro-notice__title">{title}</h4>
		<p className="sp-smart-team-pro-notice__subtitle">{subtitle}</p>
		<ul className="sp-smart-team-pro-notice__list">
			{features.map((feature) => (
				<li key={feature}>
					<span className="sp-smart-team-pro-notice__marker" aria-hidden="true">
						✦
					</span>
					{feature}
				</li>
			))}
		</ul>
		<a
			className="sp-smart-team-pro-notice__button"
			href={UPGRADE_URL}
			target="_blank"
			rel="noopener noreferrer"
		>
			{__('Upgrade to Pro', 'team-free')}
		</a>
	</div>
);

export default ProNotice;
