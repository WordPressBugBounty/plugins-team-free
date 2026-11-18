import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { STORE_NAME } from '../store';
import IntegrationsPanel from '../components/IntegrationsPanel';
import PerformancePanel from '../components/PerformancePanel';
import AdvancedPanel from '../components/AdvancedPanel';
import CustomCodePanel from '../components/CustomCodePanel';
import ToolsPanel from '../components/ToolsPanel';
import AISettingsPanel from '../components/AISettingsPanel';
import AccessibilityPanel from '../components/AccessibilityPanel';
import {
	AdditionalCodesIcon,
	AdvancedIcon,
	AITabIcon,
	ChevronRightIcon,
	ClassicSettingsIcon,
	IntegrationsTabIcon,
	PerformanceIcon,
	ToolsIcon,
} from '../components/SettingsIcons';

/**
 * Settings — side-menu + panel shell, ported from Smart Team Pro's Settings page.
 *
 * Performance, Advanced Controls and Additional CSS & JS edit the classic
 * `_sptp_settings` option (the classic Settings screen no longer renders them),
 * Accessibility edits the carousel's screen-reader messages (the classic
 * screen's last section), Tools is the classic import/export screen, and Integrations switches the page
 * builder modules (`sptp_dashboard_options → integrations`). AI Configuration
 * (Pro's panel, `sptp_ai_settings`) shows only while the AI Team Builder module is
 * on. Pro's License Key tab has no Free counterpart.
 */

const TABS = [
	{
		value: 'integrations',
		label: __('Integrations', 'team-free'),
		Icon: IntegrationsTabIcon,
	},
	{
		value: 'ai',
		label: __('AI Configuration', 'team-free'),
		Icon: AITabIcon,
	},
	{
		value: 'performance',
		label: __('Performance', 'team-free'),
		Icon: PerformanceIcon,
	},
	{
		value: 'advanced',
		label: __('Advanced Controls', 'team-free'),
		Icon: AdvancedIcon,
	},
	{
		value: 'tools',
		label: __('Tools', 'team-free'),
		Icon: ToolsIcon,
	},
	{
		value: 'additional',
		label: __('Additional CSS & JS', 'team-free'),
		Icon: AdditionalCodesIcon,
	},
	// The classic screen's last section (Accessibility), as a page of its own — last in the menu, as before.
	{
		value: 'accessibility',
		label: __('Classic Settings', 'team-free'),
		Icon: ClassicSettingsIcon,
	},
];

const DEFAULT_TAB = TABS[0].value;

/** The AI tab exists only while the AI Team Builder module is on. */
const MODULE_TABS = ['ai'];

/**
 * Sub-tab lives in the hash as `#settings=<tab>`, like Pro.
 *
 * @param {Array} tabs Tabs this site shows.
 * @return {string} Active tab.
 */
const readTab = (tabs = TABS) => {
	const tab = window.location?.hash?.replace('#', '').split('=')[1];
	return tabs.some((item) => item.value === tab) ? tab : DEFAULT_TAB;
};

const Settings = () => {
	// `ai` is null in the payload while its module is off.
	const hasAISettings = useSelect((select) => null !== select(STORE_NAME).getAISettings(), []);
	const tabs = TABS.filter((item) => !MODULE_TABS.includes(item.value) || hasAISettings);

	const [activeTab, setActiveTab] = useState(readTab(tabs));

	// Sidebar links / back-forward can change the sub-tab too.
	useEffect(() => {
		const onHashChange = () => setActiveTab(readTab(tabs));
		window.addEventListener('hashchange', onHashChange);
		return () => window.removeEventListener('hashchange', onHashChange);
	}, [hasAISettings]); // eslint-disable-line react-hooks/exhaustive-deps

	const goToTab = (value) => {
		setActiveTab(value);
		window.location.hash = `settings=${value}`;
	};

	return (
		<div className="sptp-settings">
			<div className="sptp-settings__body">
				<nav className="sptp-settings__menu">
					<ul>
						{tabs.map(({ value, label, Icon }) => (
							<li key={value}>
								<button
									type="button"
									className={`sptp-settings__tab${activeTab === value ? ' is-active' : ''}`}
									onClick={() => goToTab(value)}
									aria-current={activeTab === value ? 'true' : undefined}
								>
									<span className="sptp-settings__tab-label">
										<span className="sptp-settings__tab-icon">
											<Icon />
										</span>
										{label}
									</span>
									{activeTab === value && (
										<span className="sptp-settings__tab-arrow">
											<ChevronRightIcon />
										</span>
									)}
								</button>
							</li>
						))}
					</ul>
				</nav>

				<div className="sptp-settings__panel sptp-settings__panel--flow">
					{'integrations' === activeTab && <IntegrationsPanel />}
					{'performance' === activeTab && <PerformancePanel />}
					{'advanced' === activeTab && <AdvancedPanel />}
					{'accessibility' === activeTab && <AccessibilityPanel />}
					{'ai' === activeTab && hasAISettings && <AISettingsPanel />}
					{'tools' === activeTab && <ToolsPanel />}
					{'additional' === activeTab && <CustomCodePanel />}
				</div>
			</div>
		</div>
	);
};

export default Settings;
