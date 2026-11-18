import { memo } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { ResetIcon } from '../../icons/icons';
import { useDeviceType } from '../../controls/controls';

export const Units = memo(({ attributes, setAttributes, attributesKey, units, onUnitChange }) => {
	const deviceType = useDeviceType();
	// Set unit function.
	const setUnit = (newValue) => {
		if (onUnitChange) {
			onUnitChange(newValue);
			return;
		}
		if (attributes.unit?.[deviceType]) {
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
			setAttributes({
				[attributesKey]: {
					...attributes,
					unit: newValue.toLowerCase(),
				},
			});
		}
	};

	const unit =
		'object' === typeof attributes?.unit ? attributes.unit?.[deviceType] : attributes?.unit;

	return (
		<div className="sp-smart-team-units">
			<span className="sp-smart-team-units-indicator-label">{unit}</span>
			<div className="sp-smart-team-units-btn">
				{units?.map((item, i) => (
					<Button
						className={unit === item.toLowerCase() ? 'active' : ''}
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
});

export const ResetButton = memo(({ onClick }) => {
	return (
		<Button className="sp-smart-team-header-control-reset" onClick={onClick}>
			<ResetIcon />
		</Button>
	);
});

export const SpLinkedButton = ({
	attributes,
	attributesKey,
	setAttributes,
	Icon,
	updateAllChange,
}) => {
	const linked = attributes?.allChange || false;
	return (
		<div
			className={`sp-link-btn${linked ? '' : ' active'}`}
			onClick={() =>
				updateAllChange
					? updateAllChange(!linked)
					: setAttributes({
							[attributesKey]: {
								...attributes,
								allChange: !linked,
							},
						})
			}
		>
			<span className="sp-link-side-icon">{Icon}</span>
		</div>
	);
};
