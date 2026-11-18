import { memo } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { useDeviceType } from '../../controls/controls';

const Units = ({ attributes, setAttributes, attributesKey, units, onUnitChange = false }) => {
	const deviceType = useDeviceType();
	// Set unit function.
	const setUnit = (newValue) => {
		if (onUnitChange) {
			return onUnitChange({ unit: newValue, deviceType });
		}
		if ('undefined' === typeof attributes.unit && attributes?.device?.[deviceType]) {
			// if (onUnitChange) {
			// 	return onUnitChange({ unit: newValue, deviceType: deviceType });
			// }
			setAttributes({
				[attributesKey]: {
					...attributes,
					unit: {
						...attributes?.unit,
						[deviceType]: newValue.toLowerCase(),
					},
				},
			});
		} else if (attributes.unit?.[deviceType]) {
			// if (onUnitChange) {
			// 	return onUnitChange({ unit: newValue, deviceType: deviceType });
			// }
			setAttributes({
				[attributesKey]: {
					...attributes,
					unit: {
						...attributes.unit,
						[deviceType]: newValue.toLowerCase(),
					},
				},
			});
		} else {
			// if (onUnitChange) {
			// 	return onUnitChange({ unit: newValue, deviceType: deviceType || "Desktop" });
			// }
			setAttributes({
				[attributesKey]: {
					...attributes,
					unit: newValue.toLowerCase(),
				},
			});
		}
	};

	const activeUnitValue = () => {
		if (typeof attributes.unit === 'object' && attributes.unit?.[deviceType]) {
			return attributes.unit?.[deviceType];
		} else if (typeof attributes.unit === 'string') {
			return attributes.unit.toLowerCase();
		}
		return '';
	};

	return (
		<div className="sp-smart-team-units">
			<span>
				{'object' !== typeof attributes?.unit
					? attributes?.unit
					: attributes.unit?.[deviceType]}
			</span>
			<div className="sp-smart-team-units-btn">
				{units?.map((item, i) => (
					<Button
						className={activeUnitValue() === item.toLowerCase() ? 'active' : ''}
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
	);
};

export default memo(Units);
