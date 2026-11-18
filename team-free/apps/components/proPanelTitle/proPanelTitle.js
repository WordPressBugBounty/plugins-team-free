/**
 * ProPanelTitle — Inspector PanelBody title with the Pro crown, for panels
 * that hold nothing but a Pro notice (Additional Information, Motion Effects).
 * Matches WP Carousel Free's locked-panel title (`.wpcp-panel-pro`): the 20px
 * round crown chip, 6px after the label.
 *
 * Purely presentational — it reads and writes no attributes and links nowhere
 * (docs/pro-free-separation.md §5).
 */

import ProChip from '../proChip/proChip.js';
import './editor.scss';

const ProPanelTitle = ({ label }) => (
	<span className="sp-smart-team-pro-panel-title">
		{label}
		<ProChip />
	</span>
);

export default ProPanelTitle;
