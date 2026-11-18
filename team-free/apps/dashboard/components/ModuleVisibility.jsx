import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import ModuleCard from './ModuleCard';
import { UpgradeIcon } from './icons';
import PreloaderSettingsDrawer from './PreloaderSettingsDrawer';
import WhiteLabelDrawer from './WhiteLabelDrawer';
import useModuleToggle from '../hooks/useModuleToggle';

/**
 * The Modules page body: the modules Free can switch, then the Pro modules
 * under an "Unlock Powerful Features with Pro!" header with the upgrade button.
 * Free modules save to `settings.modules` (Pro's key and shape).
 */
const ModuleVisibility = () => {
	const { free, pro, modules, isSaving, onToggle, pluginUrl, upgradeUrl } = useModuleToggle();
	const [settingsOpenFor, setSettingsOpenFor] = useState(null);

	return (
		<div className="sptp-modules-page">
			<section className="sptp-page-section">
				<div className="sptp-page-section__head">
					<div>
						<h2 className="sptp-page-section__title">
							{__('Manage Modules', 'team-free')}
						</h2>
						<p className="sptp-page-section__desc">
							{__(
								'Enable only the modules you need to keep your site fast and optimized.',
								'team-free'
							)}
						</p>
					</div>
				</div>
				<div className="sptp-module-grid">
					{free.map((module) => (
						<ModuleCard
							key={module.key}
							module={module}
							active={!!modules[module.key]}
							isSaving={isSaving}
							onToggle={onToggle}
							onSettingsClick={setSettingsOpenFor}
							pluginUrl={pluginUrl}
						/>
					))}
				</div>
				<PreloaderSettingsDrawer
					open={'preloader' === settingsOpenFor}
					onClose={() => setSettingsOpenFor(null)}
					pluginUrl={pluginUrl}
				/>
				<WhiteLabelDrawer
					open={'white_label' === settingsOpenFor}
					onClose={() => setSettingsOpenFor(null)}
					pluginUrl={pluginUrl}
				/>
			</section>

			<section className="sptp-page-section">
				<div className="sptp-page-section__head">
					<div>
						<h2 className="sptp-page-section__title">
							{__('Unlock Powerful Features with Pro!', 'team-free')}
						</h2>
						<p className="sptp-page-section__desc">
							{__(
								'Upgrade now to access advanced features that helps to manage and display your team members.',
								'team-free'
							)}
						</p>
					</div>
					<a
						className="sptp-btn-upgrade"
						href={upgradeUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						<UpgradeIcon />
						{__('Upgrade to Pro', 'team-free')}
					</a>
				</div>
				<div className="sptp-module-grid">
					{pro.map((module) => (
						<ModuleCard
							key={module.key}
							module={module}
							active={false}
							isPro
							onToggle={onToggle}
							pluginUrl={pluginUrl}
						/>
					))}
				</div>
			</section>
		</div>
	);
};

export default ModuleVisibility;
