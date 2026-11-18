import { Button } from '@wordpress/components';
import Responsive from '../responsive/responsive';
import { useDeviceType } from '../../controls/controls';
import { ResetIcon } from '../../icons/icons';

export const BoxSpacing = ({
	label,
	customClass,
	attributes,
	attributesKey,
	setAttributes,
	boxUnits,
	units,
	labelItem,
	handleReset,
	onChange = false,
}) => {
	const deviceType = useDeviceType();
	const haveDevice = typeof attributes?.device !== 'undefined' ? true : false;
	const attrValue = haveDevice ? attributes?.device?.[deviceType] : attributes?.value;

	const setSpacingData = (newValue, side) => {
		const updateValue = haveDevice
			? {
					...attributes,
					device: {
						...attributes.device,
						[deviceType]: {
							...attributes.device?.[deviceType],
							[side]: parseInt(newValue),
						},
					},
				}
			: {
					...attributes,
					value: {
						...attributes.value,
						[side]: parseInt(newValue),
					},
				};
		if (onChange) {
			onChange(attributesKey, updateValue);
		} else {
			setAttributes({
				[attributesKey]: updateValue,
			});
		}
	};

	const setUnit = (value) => {
		const updateUnit = haveDevice ? { ...attributes.unit, [deviceType]: value } : value;

		if (onChange) {
			onChange(attributesKey, { ...attributes, unit: updateUnit });
		} else {
			setAttributes({
				[attributesKey]: {
					...attributes,
					unit: updateUnit,
				},
			});
		}
	};

	return (
		<div
			className={`sp-smart-team-spacing${
				customClass ? ' ' + customClass : ''
			} sp-smart-team-component-mb`}
		>
			<div className="sp-smart-team-spacing-part-1">
				<div className="sp-smart-team-header-control">
					<div className="sp-smart-team-header-control-left">
						<span className="sp-smart-team-component-title">{label}</span>
						{attributes?.device && <Responsive />}
					</div>
					<div className="sp-smart-team-header-control-right">
						<Button
							onClick={() => handleReset()}
							className={`sp-smart-team-header-control-reset`}
						>
							<ResetIcon />
						</Button>
						<div className={`sp-smart-team-units ${boxUnits ? 'box' : ''}`}>
							<span className={boxUnits ? 'box-unit' : ''}>
								{'object' !== typeof attributes?.unit
									? attributes?.unit
									: attributes.unit?.[deviceType]}
							</span>
							<div className="sp-smart-team-units-btn">
								{units?.map((item, i) => (
									<Button
										className={
											attributes?.unit?.[deviceType] === item.toLowerCase()
												? 'active'
												: ''
										}
										key={i}
										value={item}
										onClick={(e) => setUnit(e.target.value)}
									>
										{' '}
										{item}{' '}
									</Button>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="sp-smart-team-spacing-part-2">
				{['top', 'right', 'bottom', 'left'].map((side, i) => (
					<div key={i} className={`sp-smart-team-spacing-${side}`}>
						<span className="sp-smart-team-spacing-wrapper">
							<input
								id={`sp-smart-team-spacing-${side}-${i}`}
								onChange={(e) => setSpacingData(e.target.value, [side])}
								type="number"
								value={attrValue?.[side] ?? ''}
							/>
						</span>
						<label htmlFor={`sp-smart-team-spacing-${side}-${i}`}>
							{labelItem?.[side]}
						</label>
					</div>
				))}
			</div>
		</div>
	);
};
