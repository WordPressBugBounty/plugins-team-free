/**
 * Social Profile — General inspector (orchestrator).
 *
 * Reuses the shared member-card `SocialProfiles` panel (Settings: icon style /
 * size / area size / gap + Pro notice; Style: locked Custom Styling + Border Radius —
 * minus its Margin control, see SocialPanel below) and the shared Advanced Settings
 * (General / Visibility / Advanced). Open/close is accordion-style via the
 * panel-body context.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { usePanelBodyContext } from '../../hooks/togglePanelBodyContext';
import { SocialProfiles } from '../shared/panels';
import { AdvancedSettings } from '../shared/advance';

// Two standalone-block tweaks to the shared panel: its Margin control is hidden
// (this block's wrapper spacing belongs to Advanced Settings → General, while a
// card's social element has no such tab and keeps it) and an Alignment control is
// added (a card's icon row follows the card's Content Alignment instead).
// Module-level (not an inline arrow) so re-renders never remount the panel.
function SocialPanel(props) {
	return <SocialProfiles {...props} showMargin={false} showAlignment />;
}

const PANELS = [
	// key 'general' = the panel-context default, so this opens on load.
	{ key: 'general', title: __('Display Settings', 'team-free'), Body: SocialPanel },
	{ key: 'advanced', title: __('Advanced Settings', 'team-free'), Body: AdvancedSettings },
];

const Inspector = ({ attributes, setAttributes }) => {
	const { openPanel, togglePanelBody } = usePanelBodyContext();

	return (
		<>
			{PANELS.map(({ key, title, Body }, index) => (
				<PanelBody
					key={key}
					title={title}
					initialOpen={index === 0}
					className="sp-smart-team-grid-panel-body"
					opened={openPanel === key}
					onToggle={() => togglePanelBody(key)}
				>
					{openPanel === key && (
						<Body attributes={attributes} setAttributes={setAttributes} />
					)}
				</PanelBody>
			))}
		</>
	);
};

export default Inspector;
