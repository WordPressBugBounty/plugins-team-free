import { __ } from '@wordpress/i18n';
import SaveAndReset from './SaveAndReset';
import useSettingsDraft from '../hooks/useSettingsDraft';

/**
 * Settings → Accessibility.
 *
 * Edits the classic `_sptp_settings → carousel_accessibility` fieldset that the
 * carousel template prints as screen-reader messages. It was the classic
 * Settings screen's last section; that screen is gone, so this is its only
 * editor. A switch turns the feature on or off and, while it is on, the five
 * messages sit under it.
 */

const MESSAGES = [
	{ name: 'prev_slide_message', label: __('Previous Slide Message', 'team-free') },
	{ name: 'next_slide_message', label: __('Next Slide Message', 'team-free') },
	{ name: 'first_slide_message', label: __('First Slide Message', 'team-free') },
	{ name: 'last_slide_message', label: __('Last Slide Message', 'team-free') },
	{ name: 'pagination_bullet_message', label: __('Pagination Bullet Message', 'team-free') },
];

const AccessibilityPanel = () => {
	const { draft, defaults, isSaving, update, save, reset } = useSettingsDraft({
		selector: 'getAccessibilitySettings',
		action: 'saveAccessibility',
		defaultsKey: 'accessibilityDefaults',
	});

	const enabled = !!draft.accessibility;

	return (
		<div className="sptp-settings-panel">
			<div className="sptp-settings-panel__rows">
				<div className="sptp-settings-row">
					<div className="sptp-settings-row__text">
						<span
							className="sptp-settings-row__label"
							id="sptp-option-accessibility-label"
						>
							{__('Carousel Accessibility', 'team-free')}
						</span>
						<span className="sptp-settings-row__help">
							{__(
								'Announce slide changes and navigation to screen readers.',
								'team-free'
							)}
						</span>
					</div>
					<div className="sptp-settings-row__control">
						<button
							type="button"
							role="switch"
							aria-checked={enabled}
							aria-labelledby="sptp-option-accessibility-label"
							className={`sptp-switch${enabled ? ' is-on' : ''}`}
							onClick={() => update('accessibility', !enabled)}
						>
							<span className="sptp-switch__knob" />
						</button>
					</div>
				</div>

				{enabled &&
					MESSAGES.map(({ name, label }) => (
						<div key={name} className="sptp-settings-row">
							<div className="sptp-settings-row__text">
								<label
									className="sptp-settings-row__label"
									htmlFor={`sptp-option-${name}`}
								>
									{label}
								</label>
							</div>
							<div className="sptp-settings-row__control">
								<input
									type="text"
									id={`sptp-option-${name}`}
									className="sptp-settings-row__input"
									value={draft[name] ?? ''}
									placeholder={defaults[name]}
									onChange={(event) => update(name, event.target.value)}
								/>
							</div>
						</div>
					))}
			</div>

			<SaveAndReset isSaving={isSaving} onSave={save} onReset={reset} />
		</div>
	);
};

export default AccessibilityPanel;
