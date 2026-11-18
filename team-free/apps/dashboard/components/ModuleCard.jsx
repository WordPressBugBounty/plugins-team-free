import { __, sprintf } from '@wordpress/i18n';
import { DocsFilledIcon } from './icons';
import ProBadge from './ProBadge';

/**
 * A module card (Figma 785:12890 / 798:7050): gradient icon tile, title with an
 * inline PRO badge and the switch, a description, and Demo / Video / Docs chips.
 * A Pro module has no switch: the PRO badge takes its place, as in the design.
 *
 * @param {Object}   props
 * @param {Object}   props.module            Module info from modulesInfo.
 * @param {boolean}  props.active            Whether the module is on.
 * @param {boolean}  props.isPro             Whether the module is Pro-only.
 * @param {boolean}  props.isSaving          A save is in flight; the switch waits for it.
 * @param {Function} props.onToggle          Called with the module key when switched.
 * @param {Function} [props.onSettingsClick] Called with the module key when the gear is clicked
 *                                           (only shown when `module.hasSettings` and the module is on).
 * @param {string}   props.pluginUrl         Plugin root URL, for the icon src.
 */
const ModuleCard = ({
	module,
	active,
	isPro = false,
	isSaving = false,
	onToggle,
	onSettingsClick,
	pluginUrl,
}) => (
	<div className={`sptp-module-card${isPro ? ' is-pro' : ''}`}>
		<div className="sptp-module-card__top">
			<span className="sptp-module-card__icon">
				<img
					src={`${pluginUrl}dist/images/modules/${module.key}.svg`}
					alt=""
					width="44"
					height="44"
				/>
			</span>
			<div className="sptp-module-card__body">
				<div className="sptp-module-card__head">
					<h4 className="sptp-module-card__title">{module.title}</h4>
					{isPro && <ProBadge />}
					{!isPro && (
						<button
							type="button"
							role="switch"
							aria-checked={!!active}
							aria-label={module.title}
							className={`sptp-switch${active ? ' is-on' : ''}`}
							disabled={isSaving}
							onClick={() => onToggle(module.key)}
						>
							<span className="sptp-switch__knob" />
						</button>
					)}
				</div>
				<p className="sptp-module-card__desc">{module.desc}</p>
			</div>
		</div>

		<div className="sptp-module-card__foot">
			{module.docLink && (
				<a
					className="sptp-chip"
					href={module.docLink}
					target="_blank"
					rel="noopener noreferrer"
				>
					<DocsFilledIcon />
					{__('Docs', 'team-free')}
				</a>
			)}
			{module.hasSettings && !isPro && onSettingsClick && (
				<button
					type="button"
					className={`sptp-module-card__settings${active ? '' : ' is-disabled'}`}
					onClick={active ? () => onSettingsClick(module.key) : undefined}
					disabled={!active}
					aria-label={sprintf(
						/* translators: %s: module title. */
						__('%s settings', 'team-free'),
						module.title
					)}
				>
					<img
						src={`${pluginUrl}dist/images/settings.svg`}
						alt=""
						width="20"
						height="20"
					/>
				</button>
			)}
		</div>
	</div>
);

export default ModuleCard;
