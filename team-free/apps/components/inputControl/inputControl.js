// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
import {
	__experimentalInputControl as Input, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';
import './editor.scss';
import { useDeviceType } from '../../controls/controls';
import Responsive from '../responsive/responsive';
import { useEffect, useRef, useState } from '@wordpress/element';

const InputControl = ({
	attributes,
	attributesKey,
	setAttributes,
	label,
	ajax = false,
	flex = true,
	// Figma "stepper" variant: a compact right-aligned NumberControl with the
	// custom up/down spin buttons instead of the wide plain input.
	stepper = false,
	inputType = 'number',
	placeholder,
	onChange = false,
	help = false,
	min = 1,
	step = 1,
	max = 100000,
	className = '',
}) => {
	const deviceType = useDeviceType();

	const value = attributes?.device ? attributes?.device?.[deviceType] : attributes;

	// Local mirror so typing stays responsive; resync when the stored value
	// changes externally (device switch, reset, etc.).
	const [currentValue, setCurrentValue] = useState(value);
	useEffect(() => {
		setCurrentValue(value);
	}, [value]);

	const ajaxTimer = useRef(null);
	useEffect(() => () => clearTimeout(ajaxTimer.current), []);

	// Persist a value to the attribute (device-aware), clamping only numbers.
	const writeValue = (newValue) => {
		let next = newValue;
		if (inputType === 'number' && next !== '' && Number(next) > max) {
			next = max;
		}

		if (attributes?.device) {
			setAttributes({
				[attributesKey]: {
					...attributes,
					device: { ...attributes.device, [deviceType]: next },
				},
			});
		} else {
			setAttributes({ [attributesKey]: next });
		}
	};

	const handleChange = (newValue) => {
		// A custom onChange owns persistence (used for nested attribute shapes).
		if (onChange) {
			onChange(newValue);
			return;
		}

		setCurrentValue(newValue);

		if (ajax) {
			clearTimeout(ajaxTimer.current);
			ajaxTimer.current = setTimeout(() => writeValue(newValue), 500);
		} else {
			writeValue(newValue);
		}
	};

	return (
		<div
			className={`sp-smart-team-input-control sp-smart-team-component-mb ${
				stepper ? 'sp-smart-team-input-control--stepper' : ''
			} ${className}`}
		>
			<div className="sp-smart-team-spacing-part-1">
				<div
					className={`sp-smart-team-header-input-control ${flex ? 'd-flex' : 'd-block'}`}
				>
					<div className="sp-smart-team-header-control-left">
						<span className="sp-smart-team-component-title">{label}</span>
						{attributes?.device && <Responsive />}
					</div>
					<div className="sp-smart-team-header-control-right">
						{stepper ? (
							<NumberControl
								value={onChange ? value : currentValue}
								onChange={(val) => handleChange(val)}
								help={help}
								step={step}
								min={min}
								max={max}
								spinControls="custom"
							/>
						) : (
							<Input
								type={inputType}
								value={onChange ? value : currentValue}
								onChange={(val) => handleChange(val)}
								placeholder={placeholder}
								help={help}
								step={step}
								min={min}
								max={max}
								__next40pxDefaultSize
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default InputControl;
