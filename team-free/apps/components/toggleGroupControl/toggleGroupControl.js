import { useDeviceType } from '../../controls/controls';
import './editor.scss';
import { memo } from '@wordpress/element';
import Responsive from '../responsive/responsive';
import ProTag from '../proTag/proTag.js';

const SPToggleGroupControl = ({
	attributes,
	attributesKey,
	setAttributes,
	label = '',
	items,
	onClick = false,
	hasDivider = true,
	extraClass = '',
	disabled = false,
}) => {
	// Device type
	const deviceType = useDeviceType();

	// Update button group value
	const setButtonGroup = (newValue) => {
		if (attributes?.device) {
			setAttributes({
				[attributesKey]: {
					...attributes,
					device: {
						...attributes.device,
						[deviceType]: newValue,
					},
				},
			});
		} else {
			setAttributes({ [attributesKey]: newValue });
		}
	};

	// Get the active value
	const activeValue = attributes?.device ? attributes.device?.[deviceType] : attributes;

	// Drives the sliding highlight's position.
	const activeIndex = items?.findIndex((item) => item.value === activeValue) ?? -1;

	// Pro-locked options (`pro: true`) are never selectable in Free.
	const isLocked = (item) => Boolean(item.disabled || item.pro);

	// Handle button click
	const handleClick = (item) => {
		if (disabled || isLocked(item) || item.value === activeValue) {
			return;
		}

		if (onClick) {
			onClick(item.value);
		} else {
			setButtonGroup(item.value);
		}
	};

	return (
		<div className="sp-smart-team-toggle-button-group-wrapper sp-smart-team-component-mb">
			{label && (
				<div className="sp-smart-team-header">
					<span className="sp-smart-team-component-title">{label}</span>
					{attributes?.device && <Responsive />}
				</div>
			)}
			<div
				role="radiogroup"
				aria-label={typeof label === 'string' ? label : undefined}
				className={`sp-smart-team-toggle-button-group${hasDivider ? ' sp-has-divider' : ''}${
					disabled ? ' is-disabled' : ''
				}${extraClass ? ` ${extraClass}` : ''}`}
				style={{ '--total-buttons': items?.length || 1, '--active-index': activeIndex }}
			>
				{activeIndex >= 0 && (
					<span className="sp-smart-team-toggle-button-indicator" aria-hidden="true" />
				)}
				{items?.map((item, i) => (
					<button
						key={i}
						type="button"
						role="radio"
						aria-checked={activeValue === item.value}
						aria-label={item.tooltip || undefined}
						title={item.tooltip || undefined}
						value={item.value}
						disabled={disabled || isLocked(item)}
						className={`sp-smart-team-toggle-button${activeValue === item.value ? ' active' : ''}${
							item.pro ? ' is-pro' : ''
						}`}
						onClick={() => handleClick(item)}
					>
						<span className="sp-smart-team-toggle-button-content">
							{item.label}
							{/* Static tag: a disabled <button> swallows clicks on its children. */}
							{item.pro && <ProTag />}
						</span>
					</button>
				))}
			</div>
		</div>
	);
};

export default memo(SPToggleGroupControl);
