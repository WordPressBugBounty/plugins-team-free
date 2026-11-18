/**
 * ProChip — the crown-only Pro marker, port of wp-carousel-free's
 * `ProBadge iconOnly` + `.wpcp-pro-badge--corner`: a 16px round chip (Real Testimonials Free sizing) with the
 * green outline crown. Display-only — it never links anywhere; only a Pro
 * notice's "Upgrade to Pro" button opens the pricing page.
 *
 * `corner` pins it to the top-right of a locked card/tile (the parent must be
 * `position: relative`); without it the chip sits inline (panel titles).
 */

import { __ } from '@wordpress/i18n';
import { ProCrownIcon } from '../icons.js';
import './editor.scss';

const ProChip = ({ corner = false }) => (
	<span
		className={`sp-smart-team-pro-chip${corner ? ' sp-smart-team-pro-chip--corner' : ''}`}
		role="img"
		aria-label={__('Pro', 'team-free')}
	>
		<ProCrownIcon size={10} />
	</span>
);

export default ProChip;
