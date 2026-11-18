/**
 * Member Skills — General inspector (orchestrator).
 *
 * Reuses the shared member-card `Skills` panel (Settings: display style /
 * progress-bar style / height / % visibility / gap; Style: colors / typography /
 * multi-color — minus its Margin control, see SkillsPanel below) and the shared
 * Advanced Settings (General / Visibility / Advanced). Open/close is
 * accordion-style via the panel-body context.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { usePanelBodyContext } from '../../hooks/togglePanelBodyContext';
import { Skills } from '../shared/panels';
import { AdvancedSettings } from '../shared/advance';

// The shared panel's Margin control is hidden here: this block's wrapper spacing
// belongs to Advanced Settings → General, while a card's skills element has no
// such tab and keeps it. `showAlignment` adds the Button-display Alignment
// control, which is standalone-only for the mirror-image reason — in a card the
// chip row already follows the card's Content Alignment. Module-level (not an
// inline arrow) so re-renders never remount the panel.
function SkillsPanel(props) {
	return <Skills {...props} showMargin={false} showAlignment />;
}

const PANELS = [
	// key 'general' = the panel-context default, so this opens on load.
	{ key: 'general', title: __('Display Settings', 'team-free'), Body: SkillsPanel },
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
