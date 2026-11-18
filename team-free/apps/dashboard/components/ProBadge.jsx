import { __ } from '@wordpress/i18n';
import { ProCrownIcon } from '../../components/icons';

/**
 * The crown + PRO pill (Figma "Free or Pro bages"), same as wp-carousel's.
 * Sits inline next to a module title, or pinned to a card corner via `className`.
 * Crown only until the card is hovered or focused, when the "PRO" label slides
 * out (as in wp-carousel-free — the card styles in style.scss drive the reveal).
 * The accessible name is "PRO" throughout.
 *
 * @param {Object} props
 * @param {string} props.className Extra class, e.g. a positioning modifier.
 */
const ProBadge = ({ className = '' }) => (
	<span
		className={`sptp-pro-badge ${className}`.trim()}
		role="img"
		aria-label={__('PRO', 'team-free')}
		title={__('PRO', 'team-free')}
	>
		<ProCrownIcon color="currentColor" fill="none" size={12} />
		<span className="sptp-pro-badge__label" aria-hidden="true">
			{__('PRO', 'team-free')}
		</span>
	</span>
);

export default ProBadge;
