import { memo } from '@wordpress/element';
import Responsive from '../responsive/responsive';
import { ResetButton, Units } from '../utility';

const ComponentsTopSection = ({
	label,
	units = false,
	attributes,
	setAttributes,
	attributesKey = '',
	onReset = false,
	onUnitChange,
}) => {
	return (
		<div className="sp-smart-team-header-control sp-mb-8px">
			<div className="sp-smart-team-header-control-left">
				<span className="sp-smart-team-component-title">{label}</span>
				{attributes?.device && <Responsive />}
			</div>
			{units && (
				<div className="sp-smart-team-header-control-right">
					{onReset && <ResetButton onClick={() => onReset()} />}
					<Units
						attributes={attributes}
						setAttributes={setAttributes}
						attributesKey={attributesKey}
						units={units}
						onUnitChange={onUnitChange}
					/>
				</div>
			)}
		</div>
	);
};

export default memo(ComponentsTopSection);
