import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import SettingsRow from './SettingsRow';
import SaveAndReset from './SaveAndReset';
import useSettingsDraft from '../hooks/useSettingsDraft';
import WhatWeCollectModal from '../wizard/WhatWeCollectModal';

/**
 * Settings → Advanced Controls.
 *
 * Like Performance, these values live in the classic `_sptp_settings` option so
 * the runtime gates keep one source of truth. The classic Settings screen is
 * gone, so this panel is their only editor. Exclude from Search is Pro-only (Free has
 * no runtime for it), so it is not listed.
 */

const EDITOR_BLOCK = 'block';
const EDITOR_CLASSIC = 'classic';

const OPTIONS = [
	{
		name: 'sptp_gb_block',
		label: __('New Member Editor', 'team-free'),
		help: __('Select the editor to open when adding a new member.', 'team-free'),
		type: 'select',
		choices: [
			{
				value: EDITOR_BLOCK,
				label: __('Block Editor (Gutenberg)', 'team-free'),
			},
			{
				value: EDITOR_CLASSIC,
				label: __('Classic Editor', 'team-free'),
			},
		],
	},
	{
		name: 'delete_on_remove',
		label: __('Clean-up Data on Deletion', 'team-free'),
		help: __('Remove all plugin data completely when the plugin is uninstalled.', 'team-free'),
		type: 'checkbox',
	},
	{
		name: 'enqueue_swiper_js',
		label: __('Swiper JS', 'team-free'),
		help: __(
			'Load the Swiper JavaScript library for shortcode-based teams. Uncheck it only if your theme or another plugin already loads it.',
			'team-free'
		),
		type: 'checkbox',
	},
	{
		name: 'enqueue_swiper',
		label: __('Swiper CSS', 'team-free'),
		help: __(
			'Load the Swiper stylesheet for shortcode-based teams. Uncheck it only if your theme or another plugin already loads it.',
			'team-free'
		),
		type: 'checkbox',
	},
	{
		name: 'enqueue_fontawesome',
		label: __('Font Awesome', 'team-free'),
		help: __(
			'Load the Font Awesome icons for shortcode-based teams. Uncheck them only if your theme or another plugin already loads them.',
			'team-free'
		),
		type: 'checkbox',
	},
	{
		name: 'allow_diagnostic_data',
		label: __('Contribute to Smart Team', 'team-free'),
		type: 'checkbox',
		className: 'sptp-settings-row--contribute',
	},
];

/**
 * The editor row is a select, but the stored value is the boolean
 * `sptp_gb_block` the member post type and `use_block_editor_for_member()`
 * read (and Pro shares) — translate at the edge rather than migrating the option.
 *
 * @param {Object} option Row definition.
 * @param {Object} draft  Current draft values.
 * @return {*} Value for the control.
 */
const controlValue = (option, draft) =>
	'sptp_gb_block' === option.name
		? draft.sptp_gb_block
			? EDITOR_BLOCK
			: EDITOR_CLASSIC
		: draft[option.name];

const storedValue = (name, value) => ('sptp_gb_block' === name ? EDITOR_BLOCK === value : value);

const AdvancedPanel = () => {
	const { draft, isSaving, update, save, reset } = useSettingsDraft({
		selector: 'getAdvancedSettings',
		action: 'saveAdvanced',
		defaultsKey: 'advancedDefaults',
		// Opt-in consent: only a changed checkbox records it, Reset leaves it alone.
		changeOnly: ['allow_diagnostic_data'],
	});

	const [isCollectOpen, setCollectOpen] = useState(false);

	const diagnosticHelp = (
		<>
			{__(
				'Share non-sensitive diagnostic data to help us fix bugs faster, make smarter decisions, and build features that truly matter to you. Nothing is sent unless this is checked. See',
				'team-free'
			)}{' '}
			<button
				type="button"
				className="sptp-settings-row__help-link"
				onClick={() => setCollectOpen(true)}
			>
				{__('what we collect', 'team-free')}
			</button>
			.
		</>
	);

	return (
		<div className="sptp-settings-panel">
			<div className="sptp-settings-panel__rows">
				{OPTIONS.map((option) => (
					<SettingsRow
						key={option.name}
						option={
							'allow_diagnostic_data' === option.name
								? { ...option, help: diagnosticHelp }
								: option
						}
						value={controlValue(option, draft)}
						onChange={(value) => update(option.name, storedValue(option.name, value))}
					/>
				))}
			</div>

			<SaveAndReset isSaving={isSaving} onSave={save} onReset={reset} />

			{isCollectOpen && <WhatWeCollectModal onClose={() => setCollectOpen(false)} />}
		</div>
	);
};

export default AdvancedPanel;
