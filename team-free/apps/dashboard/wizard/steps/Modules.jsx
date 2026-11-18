import { __ } from '@wordpress/i18n';
import ProBadge from '../../components/ProBadge';
import useModuleToggle from '../../hooks/useModuleToggle';

/**
 * Wizard step 3 (Figma 902:6717) — one compact grid: the modules Free can switch
 * first, then the Pro ones with the crown badge in place of a switch. Saves the
 * same `settings.modules` as the Dashboard's Modules page.
 */
const Modules = () => {
	const { free, pro, modules, isSaving, onToggle, pluginUrl } = useModuleToggle();

	return (
		<div className="sptp-wizard-step">
			<div className="sptp-wizard-step__head">
				<h2 className="sptp-wizard-step__title">
					{__('Enable the Modules You Need', 'team-free')}
				</h2>
				<p className="sptp-wizard-step__desc">
					{__(
						'Unlock powerful features to enhance your team — fully customizable anytime.',
						'team-free'
					)}
				</p>
			</div>
			<div className="sptp-wizard-step__body">
				<div className="sptp-wizard-modules">
					{[...free, ...pro].map((module) => {
						const isPro = !free.includes(module);
						const active = !!modules[module.key];

						return (
							<div
								key={module.key}
								className={`sptp-wizard-module${isPro ? ' is-pro' : ''}`}
							>
								<img
									className="sptp-wizard-module__icon"
									src={`${pluginUrl}dist/images/modules/${module.key}.svg`}
									alt=""
									width="44"
									height="44"
								/>
								<h4 className="sptp-wizard-module__title">{module.title}</h4>
								{isPro ? (
									<ProBadge />
								) : (
									<button
										type="button"
										role="switch"
										aria-checked={active}
										aria-label={module.title}
										className={`sptp-switch${active ? ' is-on' : ''}`}
										disabled={isSaving}
										onClick={() => onToggle(module.key)}
									>
										<span className="sptp-switch__knob" />
									</button>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default Modules;
