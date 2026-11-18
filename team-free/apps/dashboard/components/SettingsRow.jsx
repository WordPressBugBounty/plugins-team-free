import { __ } from '@wordpress/i18n';

/**
 * One label + control row of a Settings panel, ported from testimonial-pro's
 * `renderOptionRow`. Supported control types: `select`, `checkbox`, `number`,
 * `button`.
 *
 * @param {Object}   props
 * @param {Object}   props.option    Row definition (see each panel's `OPTIONS`).
 * @param {*}        props.value     Current value.
 * @param {Function} props.onChange  Called with the next value.
 * @param {Function} [props.onClick] Click handler for a `button` row.
 * @param {boolean}  [props.busy]    Disables a `button` row while it works.
 */
const SettingsRow = ({ option, value, onChange, onClick, busy }) => {
	const { name, label, help, type, unit, min, max, buttonLabel, choices, className } = option;

	return (
		<div className={className ? `sptp-settings-row ${className}` : 'sptp-settings-row'}>
			<div className="sptp-settings-row__text">
				<label className="sptp-settings-row__label" htmlFor={`sptp-option-${name}`}>
					{label}
				</label>
				{help && <span className="sptp-settings-row__help">{help}</span>}
			</div>

			<div className="sptp-settings-row__control">
				{'select' === type && (
					<select
						id={`sptp-option-${name}`}
						className="sptp-settings-row__select"
						value={value}
						onChange={(event) => onChange(event.target.value)}
					>
						{(choices || []).map((choice) => (
							<option key={choice.value} value={choice.value}>
								{choice.label}
							</option>
						))}
					</select>
				)}

				{'checkbox' === type && (
					<input
						type="checkbox"
						id={`sptp-option-${name}`}
						className="sptp-settings-row__checkbox"
						checked={!!value}
						onChange={() => onChange(!value)}
					/>
				)}

				{'number' === type && (
					<div className="sptp-settings-row__number">
						<input
							type="number"
							id={`sptp-option-${name}`}
							min={min}
							max={max}
							value={value}
							onChange={(event) => onChange(event.target.value)}
						/>
						{unit && <span className="sptp-settings-row__unit">{unit}</span>}
					</div>
				)}

				{'button' === type && (
					<button
						type="button"
						id={`sptp-option-${name}`}
						className="sptp-settings-row__button"
						onClick={onClick}
						disabled={busy}
					>
						{busy ? __('Flushing…', 'team-free') : buttonLabel}
					</button>
				)}
			</div>
		</div>
	);
};

export default SettingsRow;
