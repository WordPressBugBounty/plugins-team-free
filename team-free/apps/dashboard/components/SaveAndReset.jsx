import { __ } from '@wordpress/i18n';

/**
 * The Save / Reset bar under a Settings panel, left-aligned per the Figma. Save
 * is always clickable — re-saving unchanged values is harmless, and a greyed-out
 * button reads as broken. Reset restores that panel's defaults and, because that
 * write is immediate, asks first.
 *
 * @param {Object}   props
 * @param {boolean}  props.isSaving     Whether a save request is in flight.
 * @param {Function} props.onSave       Save handler.
 * @param {Function} props.onReset      Reset handler.
 * @param {string}   [props.busyLabel]  Save label while busy; defaults to "Saving…".
 * @param {string}   [props.resetLabel] Reset button label.
 */
const SaveAndReset = ({ isSaving, onSave, onReset, busyLabel, resetLabel }) => (
	<div className="sptp-save-bar">
		<button type="button" className="sptp-save-bar__save" onClick={onSave} disabled={isSaving}>
			{isSaving ? busyLabel || __('Saving…', 'team-free') : __('Save Changes', 'team-free')}
		</button>
		<button
			type="button"
			className="sptp-save-bar__reset"
			disabled={isSaving}
			onClick={() => {
				// eslint-disable-next-line no-alert
				if (
					window.confirm(
						__('Are you sure you want to reset these settings?', 'team-free')
					)
				) {
					onReset();
				}
			}}
		>
			{resetLabel || __('Reset Changes', 'team-free')}
		</button>
	</div>
);

export default SaveAndReset;
