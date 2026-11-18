/**
 * WidthHeight — two independent dimension fields (Figma: Member Image → Width/Height).
 *
 * Each field has its own label, device (responsive) indicator and unit badge
 * (no linked-fields mode), and the height can be left empty to mean "Auto".
 *
 * Stored shape (responsive):
 *   { device: { Desktop:{width,height}, Tablet, Mobile },
 *     unit:   { Desktop:{width,height}, Tablet, Mobile } }
 */

// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
import { __experimentalInputControl as InputControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Responsive from '../responsive/responsive';
import { ResetButton } from '../utility';
import { useDeviceType } from '../../controls/controls';
import './editor.scss';

const DEFAULT_UNIT = { width: '%', height: 'px' };
// Reset targets — match the registered attribute default
// (Att_Utils::width_height( 100, '', '%', 'px' )): width 100%, height Auto.
const DEFAULT_VALUE = { width: 100, height: '' };

const WidthHeight = ({
	attributes = {},
	attributesKey,
	setAttributes = () => {},
	units = ['px', '%', 'em', 'rem'],
	min = 0,
	max = 2000,
	step = 1,
	widthLabel = __('Width', 'team-free'),
	heightLabel = __('Height', 'team-free'),
	resetIcon = true,
	defaultValues = DEFAULT_VALUE,
	defaultUnits = DEFAULT_UNIT,
}) => {
	const device = useDeviceType(); // 'Desktop' | 'Tablet' | 'Mobile'

	const getDim = (dim) => ({
		value: attributes?.device?.[device]?.[dim] ?? '',
		unit: attributes?.unit?.[device]?.[dim] || DEFAULT_UNIT[dim],
	});

	const update = (dim, patch) => {
		const current = getDim(dim);
		const next = { ...current, ...patch };
		setAttributes({
			[attributesKey]: {
				...attributes,
				device: {
					...attributes?.device,
					[device]: { ...attributes?.device?.[device], [dim]: next.value },
				},
				unit: {
					...attributes?.unit,
					[device]: { ...attributes?.unit?.[device], [dim]: next.unit },
				},
			},
		});
	};

	// Plain render function (NOT a nested component) so the inputs keep focus and
	// stepper clicks register continuously instead of remounting on every change.
	const renderField = (dim, label) => {
		const { value, unit } = getDim(dim);
		return (
			<div className="sp-smart-team-wh-field">
				<div className="sp-smart-team-wh-field__head">
					<span className="sp-smart-team-component-title">{label}</span>
					{/* Device switcher, reset and unit sit as one tight cluster. */}
					<div className="sp-smart-team-wh-field__controls">
						<Responsive />
						{resetIcon && (
							<ResetButton
								onClick={() =>
									update(dim, {
										value: defaultValues[dim] ?? '',
										unit: defaultUnits[dim],
									})
								}
							/>
						)}
						{/* Unit picker — hover the badge to reveal the unit options (like the device switcher). */}
						<div className="sp-smart-team-units">
							<span className="sp-smart-team-units-indicator-label">{unit}</span>
							<div className="sp-smart-team-units-btn">
								{units.map((item, i) => (
									<Button
										key={i}
										className={unit === item.toLowerCase() ? 'active' : ''}
										value={item}
										onClick={() => update(dim, { unit: item.toLowerCase() })}
									>
										{item}
									</Button>
								))}
							</div>
						</div>
					</div>
				</div>
				<InputControl
					type="number"
					min={min}
					max={max}
					step={step}
					value={value === '' ? '' : value}
					placeholder={dim === 'height' ? __('Auto', 'team-free') : ''}
					onChange={(val) => update(dim, { value: val === '' ? '' : parseInt(val, 10) })}
				/>
			</div>
		);
	};

	return (
		<div className="sp-smart-team-wh-control sp-smart-team-component-mb">
			<div className="sp-smart-team-wh-grid">
				{renderField('width', widthLabel)}
				{renderField('height', heightLabel)}
			</div>
		</div>
	);
};

export default WidthHeight;
