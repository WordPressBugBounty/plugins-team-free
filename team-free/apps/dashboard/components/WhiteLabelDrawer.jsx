/**
 * White Label Branding drawer — opened from the gear icon on the White Label
 * module card (Figma 3327:23757). Free ships the custom labels only: Member,
 * Teams and Designations. The plugin name, logos and hide-branding switches are
 * Pro's, shown as a Pro Features box. Values are a draft saved by Save Changes.
 */
import { __, sprintf } from '@wordpress/i18n';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ModuleSettingsDrawer from './ModuleSettingsDrawer';

/** Label groups: one input for a single name, a singular + plural pair for two. */
const LABEL_GROUPS = [
	{
		label: __('Member Label', 'team-free'),
		fields: ['memberSingular', 'memberPlural'],
	},
	{
		label: __('Teams Label', 'team-free'),
		fields: ['teamLabel'],
	},
	{
		label: __('Departments Label', 'team-free'),
		fields: ['groupSingular', 'groupPlural'],
	},
	{
		label: __('Designations Label', 'team-free'),
		fields: ['designationSingular', 'designationPlural'],
	},
];

const EDITABLE_KEYS = LABEL_GROUPS.flatMap((group) => group.fields);

const pick = (source) =>
	EDITABLE_KEYS.reduce((values, key) => ({ ...values, [key]: source[key] ?? '' }), {});

const isSame = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** What the Pro plugin adds to White Label Branding. */
const proFeatures = () => [
	__('Custom plugin name in the admin menu', 'team-free'),
	__('Custom logo and favicon', 'team-free'),
	__('Hide branding and upgrade notices', 'team-free'),
	__('Team singular label', 'team-free'),
];

const ProFeaturesBox = ({ upgradeUrl }) => (
	<div className="sptp-wl-drawer__pro">
		<p className="sptp-wl-drawer__pro-title">{__('Make the Plugin Your Own', 'team-free')}</p>
		<p className="sptp-wl-drawer__pro-subtitle">
			{__('Brand the whole plugin as your own:', 'team-free')}
		</p>
		<ul className="sptp-wl-drawer__pro-list">
			{proFeatures().map((feature) => (
				<li key={feature}>{feature}</li>
			))}
		</ul>
		<a
			className="sptp-wl-drawer__pro-btn"
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
);

const WhiteLabelDrawer = ({ open, onClose, pluginUrl }) => {
	const { settings, defaults, isSaving, upgradeUrl } = useSelect((select) => {
		const store = select(STORE_NAME);
		return {
			settings: store.getWhiteLabelSettings(),
			defaults: store.getSettingsMeta().whiteLabelDefaults || {},
			isSaving: store.isSaving(),
			upgradeUrl: store.getDashboardInfo().upgradeUrl,
		};
	}, []);
	const { saveWhiteLabel } = useDispatch(STORE_NAME);

	const [draft, setDraft] = useState(pick(settings));
	const [initial, setInitial] = useState(pick(settings));

	// Reopening discards an unsaved draft, as in Pro.
	useEffect(() => {
		if (open) {
			const next = pick(settings);
			setDraft(next);
			setInitial(next);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const resetValues = pick(defaults);
	const hasChanges = !isSame(draft, initial);
	const canReset = !isSame(draft, resetValues);

	const onSave = async () => {
		try {
			await saveWhiteLabel(draft);
			toast.success(__('White Label settings saved.', 'team-free'));
			onClose();
		} catch (error) {
			toast.error(__('Could not save the White Label settings.', 'team-free'));
		}
	};

	const input = (key, label) => (
		<input
			key={key}
			type="text"
			className="sptp-wl-drawer__input"
			aria-label={label}
			value={draft[key] ?? ''}
			placeholder={defaults[key]}
			onChange={(event) => setDraft((prev) => ({ ...prev, [key]: event.target.value }))}
		/>
	);

	return (
		<ModuleSettingsDrawer
			open={open}
			onClose={onClose}
			title={__('White Label Branding', 'team-free')}
			iconSrc={`${pluginUrl}dist/images/modules/white_label.svg`}
			className="sptp-wl-drawer"
			footer={
				<>
					<button
						type="button"
						className="sptp-module-drawer__btn sptp-wl-drawer__btn--save"
						onClick={onSave}
						disabled={isSaving || !hasChanges}
					>
						{isSaving ? __('Saving…', 'team-free') : __('Save Changes', 'team-free')}
					</button>
					<button
						type="button"
						className="sptp-module-drawer__btn sptp-wl-drawer__btn--reset"
						onClick={() => setDraft(resetValues)}
						disabled={isSaving || !canReset}
					>
						{__('Reset Changes', 'team-free')}
					</button>
				</>
			}
		>
			<div className="sptp-wl-drawer__row">
				<div className="sptp-wl-drawer__row-text">
					<div className="sptp-wl-drawer__row-title">
						{__('Custom Labels', 'team-free')}
					</div>
					<p className="sptp-wl-drawer__row-desc">
						{__(
							'Customize member and taxonomy labels to match your use case.',
							'team-free'
						)}
					</p>
				</div>
				<div className="sptp-wl-drawer__row-control">
					{LABEL_GROUPS.map((group) => (
						<div key={group.label} className="sptp-wl-drawer__label-group">
							<p className="sptp-wl-drawer__label">{group.label}</p>
							<div className="sptp-wl-drawer__pair">
								{group.fields.map((key, index) =>
									input(
										key,
										1 === group.fields.length
											? group.label
											: sprintf(
													/* translators: 1: label name, 2: singular or plural. */
													__('%1$s (%2$s)', 'team-free'),
													group.label,
													0 === index
														? __('singular', 'team-free')
														: __('plural', 'team-free')
												)
									)
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			<ProFeaturesBox upgradeUrl={upgradeUrl} />
		</ModuleSettingsDrawer>
	);
};

export default WhiteLabelDrawer;
