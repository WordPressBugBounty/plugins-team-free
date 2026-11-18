/**
 * Preloader settings drawer — opened from the gear icon on the Preloader
 * module card.
 */
import { __ } from '@wordpress/i18n';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import SPRangeControl from '../../components/rangeControl/rangeControl';
import Units from '../../components/rangeControl/units';
import ModuleSettingsDrawer from './ModuleSettingsDrawer';
const SPINNER_STYLES = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
// Skeleton is Pro's — a locked segment, never selectable in Free.
const PRELOADER_STYLES = [
	{ label: __('Spinner', 'team-free'), value: 'spinner' },
	{ label: __('Skeleton', 'team-free'), value: 'skeleton', pro: true },
];

const proFeatures = () => [
	__('Skeleton preloader style', 'team-free'),
	__('Custom preloader image or GIF', 'team-free'),
];

const ProTag = () => (
	<span className="sptp-preloader-settings__pro-tag">{__('(Pro)', 'team-free')}</span>
);

// `minLoadingTime` is always persisted in milliseconds — `minLoadingTimeUnit`
// only decides which unit the range control displays it in.
const TIME_UNITS = {
	ms: { min: 0, max: 5000, step: 50 },
	s: { min: 0, max: 5, step: 0.1 },
};
const MAX_MS = 5000;

// Fallback while the bootstrap loads; the server's DashboardHelper::PRELOADER_DEFAULTS wins.
const DEFAULTS = {
	minLoadingTime: 300,
	minLoadingTimeUnit: 'ms',
	style: 'spinner',
	spinnerStyle: '01',
};

const isSame = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Milliseconds → the displayed unit.
 * @param ms
 * @param unit
 */
const toUnit = (ms, unit) => (unit === 's' ? Math.round((ms / 1000) * 10) / 10 : ms);

/**
 * The displayed unit → milliseconds, clamped to the window the frontend honours.
 * @param value
 * @param unit
 */
const toMs = (value, unit) => {
	const ms =
		unit === 's' ? Math.round((Number(value) || 0) * 1000) : Math.round(Number(value) || 0);
	return Math.max(0, Math.min(MAX_MS, ms));
};

const PreloaderSettingsDrawer = ({ open, onClose, pluginUrl }) => {
	const { settings, defaults, upgradeUrl } = useSelect((select) => {
		const store = select(STORE_NAME);
		return {
			settings: store.getPreloaderSettings(),
			defaults: { ...DEFAULTS, ...(store.getSettingsMeta().preloaderDefaults || {}) },
			upgradeUrl: store.getDashboardInfo().upgradeUrl,
		};
	}, []);
	const { savePreloader } = useDispatch(STORE_NAME);

	const [draft, setDraft] = useState({ ...DEFAULTS, ...settings });
	const [initial, setInitial] = useState({ ...DEFAULTS, ...settings });
	useEffect(() => {
		if (open) {
			const next = { ...DEFAULTS, ...settings };
			setDraft(next);
			setInitial(next);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const [saving, setSaving] = useState(false);

	const update = (changes) => setDraft({ ...draft, ...changes });

	const timeUnit = TIME_UNITS[draft.minLoadingTimeUnit] ? draft.minLoadingTimeUnit : 'ms';
	const unitRange = TIME_UNITS[timeUnit];
	const displayValue = toUnit(draft.minLoadingTime ?? 300, timeUnit);

	const hasChanges = !isSame(draft, initial);
	const canReset = !isSame(draft, defaults);

	const onSave = async () => {
		setSaving(true);
		try {
			await savePreloader(draft);
			setInitial(draft);
			toast.success(__('Preloader settings saved.', 'team-free'));
			onClose();
		} catch (error) {
			toast.error(__('Could not save the Preloader settings.', 'team-free'));
		} finally {
			setSaving(false);
		}
	};

	return (
		<ModuleSettingsDrawer
			open={open}
			className="sptp-preloader-settings"
			onClose={onClose}
			title={__('Preloader', 'team-free')}
			ariaLabel={__('Preloader settings', 'team-free')}
			iconSrc={`${pluginUrl}dist/images/modules/preloader.svg`}
			footer={
				<>
					<button
						type="button"
						className="sptp-module-drawer__btn sptp-preloader-settings__btn--secondary"
						onClick={() => setDraft({ ...defaults })}
						disabled={saving || !canReset}
					>
						{__('Reset Changes', 'team-free')}
					</button>
					<button
						type="button"
						className="sptp-module-drawer__btn sptp-preloader-settings__btn--primary"
						onClick={onSave}
						disabled={saving || !hasChanges}
					>
						{saving ? __('Saving…', 'team-free') : __('Save Changes', 'team-free')}
					</button>
				</>
			}
		>
			<div className="sptp-preloader-settings__row sptp-preloader-settings__row--inline">
				<div className="sptp-preloader-settings__row-text">
					<p className="sptp-preloader-settings__row-title">
						{__('Min Loading Time', 'team-free')}
					</p>
					<p className="sptp-preloader-settings__row-desc">
						{__('Set the minimum time the preloader stays visible.', 'team-free')}
					</p>
				</div>
				<div className="sptp-preloader-settings__ranger">
					<SPRangeControl
						hideHeader
						className="sptp-preloader-settings__range"
						attributes={{ value: displayValue, unit: timeUnit }}
						attributesKey="minLoadingTime"
						setAttributes={update}
						onValueChange={({ value }) =>
							update({ minLoadingTime: toMs(value, timeUnit) })
						}
						resetIcon={false}
						min={unitRange.min}
						max={unitRange.max}
						step={unitRange.step}
					/>
					<Units
						attributes={{ unit: timeUnit }}
						attributesKey="minLoadingTimeUnit"
						units={['ms', 's']}
						onUnitChange={({ unit }) => update({ minLoadingTimeUnit: unit })}
					/>
				</div>
			</div>

			<hr className="sptp-preloader-settings__divider" />

			<div className="sptp-preloader-settings__row sptp-preloader-settings__row--inline">
				<div className="sptp-preloader-settings__row-text">
					<p className="sptp-preloader-settings__row-title">
						{__('Preloader Style', 'team-free')}
					</p>
					<p className="sptp-preloader-settings__row-desc">
						{__('Select the type of preloader animation.', 'team-free')}
					</p>
				</div>
				<div
					className="sptp-preloader-settings__segmented"
					role="tablist"
					aria-label={__('Preloader Style', 'team-free')}
				>
					{PRELOADER_STYLES.map((option) => {
						const selected = !option.pro && (draft.style ?? 'spinner') === option.value;
						return (
							<button
								type="button"
								key={option.value}
								role="tab"
								aria-selected={selected}
								aria-disabled={option.pro ? 'true' : undefined}
								className={`sptp-preloader-settings__segment${selected ? ' is-selected' : ''}${
									option.pro ? ' is-pro' : ''
								}`}
								onClick={
									option.pro ? undefined : () => update({ style: option.value })
								}
							>
								{option.label} {option.pro && <ProTag />}
							</button>
						);
					})}
				</div>
			</div>

			{(draft.style ?? 'spinner') === 'spinner' && (
				<div className="sptp-preloader-settings__row sptp-preloader-settings__row--spinner-grid">
					<div className="sptp-preloader-settings__row-text">
						<p className="sptp-preloader-settings__row-title">
							{__('Choose Spinner Style', 'team-free')}
						</p>
						<p className="sptp-preloader-settings__row-desc">
							{__('Pick a spinner design for the loading animation.', 'team-free')}
						</p>
					</div>
					<div className="sptp-preloader-settings__spinner-box">
						<div className="sptp-preloader-settings__spinner-grid">
							{SPINNER_STYLES.map((id) => (
								<button
									type="button"
									key={id}
									className={`sptp-preloader-settings__spinner-cell${
										(draft.spinnerStyle ?? '01') === id ? ' is-selected' : ''
									}`}
									onClick={() => update({ spinnerStyle: id })}
									aria-pressed={(draft.spinnerStyle ?? '01') === id}
								>
									<img
										src={`${pluginUrl}blocks/assets/images/preloader/spinner-${id}.svg`}
										alt=""
										width="54"
										height="54"
									/>
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			<div className="sptp-preloader-settings__pro">
				<p className="sptp-preloader-settings__pro-title">
					{__('Load in Style', 'team-free')}
				</p>
				<ul className="sptp-preloader-settings__pro-list">
					{proFeatures().map((feature) => (
						<li key={feature}>{feature}</li>
					))}
				</ul>
				<a
					className="sptp-preloader-settings__pro-btn"
					href={upgradeUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					{__('Upgrade to Pro', 'team-free')}
					<svg
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M5 12h14M13 6l6 6-6 6" />
					</svg>
				</a>
			</div>
		</ModuleSettingsDrawer>
	);
};

export default PreloaderSettingsDrawer;
