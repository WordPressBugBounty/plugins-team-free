import { RangeControl, Button } from '@wordpress/components';
import './editor.scss';
import { memo, useState, useEffect } from '@wordpress/element';
import { useDeviceType } from '../../controls/controls';
import Responsive from '../responsive/responsive';
import Units from './units';
import ResetButton from './resetBtn';
import { ResetIcon } from '../../icons/icons';
import useCanvasDefault from '../../hooks/useCanvasDefault';

// const clearTimeoutRef = useRef(null);
const SPRangeControl = ({
	attributes,
	attributesKey,
	parentKey,
	parentAttributes,
	setAttributes = () => {},
	label,
	onValueChange = false,
	onUnitChange = false,
	units,
	resetIcon = true,
	min = 0,
	max = 200,
	step = 1,
	defaultValue = {},
	className = '',
	helpText = '',
	typoLineHeight = false,
	customValue = '',
	setCustomReset = false,
	/** Optional unit label shown on the header row (e.g. "PX", "sec"). */
	unitBadge = null,
	/** Skip the header row entirely — for callers that render their own label. */
	hideHeader = false,
	// Pro-lock: the full control (device switcher, reset, unit, slider, number
	// field) drawn dimmed and inert, showing the value in `attributes` — the
	// fixed one Free renders. Writes nothing.
	isPro = false,
}) => {
	const deviceType = useDeviceType();
	const [eventLoad, setEventLoad] = useState(false);

	const value = (() => {
		if (attributes?.device) {
			return attributes.device[deviceType];
		}
		// Any `{ value, unit }` shaped attribute — even when value is ''/undefined
		// (e.g. right after a reset), never fall through to the raw object.
		if (attributes && typeof attributes === 'object') {
			return attributes.value;
		}
		return attributes;
	})();

	const [currentValue, setCurrentValue] = useState(value);
	// While unset, show the value the design's stylesheet renders instead of 0.
	const canvasDefault = useCanvasDefault(attributesKey, !parentKey && !customValue);

	useEffect(() => {
		setCurrentValue(value);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- value is derived from attributes + deviceType
	}, [deviceType, attributes]);

	// Update attribute
	const updateValue = (newValue) => {
		let updatedValue;

		if (attributes?.device) {
			updatedValue = {
				...attributes,
				device: {
					...attributes.device,
					[deviceType]: newValue,
				},
			};
		} else if (attributes && typeof attributes === 'object') {
			// Preserve the `{ value, unit }` shape even when value is currently
			// ''/undefined (post-reset) — collapsing to a bare number drops the unit.
			updatedValue = { ...attributes, value: newValue };
		} else {
			updatedValue = newValue;
		}

		// Nested parentKey support (like NewBackground)
		if (parentKey && parentAttributes) {
			setAttributes({
				[parentKey]: {
					...parentAttributes,
					[attributesKey]: updatedValue,
				},
			});
		} else {
			setAttributes({
				[attributesKey]: updatedValue,
			});
		}
	};

	// Debounced set
	let setClearTimeOut;
	const setValue = (newValue) => {
		setCurrentValue(newValue);
		clearTimeout(setClearTimeOut);
		setClearTimeOut = setTimeout(() => updateValue(newValue), 100);
	};

	// Active Label.
	const activeLabel = (e) => {
		const input = e.target.parentNode.parentNode.parentNode;
		const inputId = input.querySelector('input').getAttribute('id');
		e.target.setAttribute('for', inputId);
		setEventLoad(eventLoad);
	};
	let rangeMax = max;
	if (typeof attributes?.unit === 'object' && attributes?.unit?.[deviceType] === '%') {
		rangeMax = typoLineHeight ? 200 : 100;
	}

	return (
		<>
			<div
				className={`sp-smart-team-range-control sp-smart-team-component-mb${
					!attributes?.device && !units ? ' sp-negative-space' : ''
				}${isPro ? ' is-pro' : ''} ${className}`}
			>
				{!hideHeader && (
					<div className="sp-smart-team-header-control">
						<div className="sp-smart-team-header-control-left">
							<span
								onClick={(e) => activeLabel(e)}
								className="sp-smart-team-component-title"
							>
								{label}
							</span>
							{attributes?.device && <Responsive />}
						</div>
						<div className="sp-smart-team-header-control-right">
							{isPro && (
								<Button
									className="sp-smart-team-header-control-reset active"
									aria-hidden="true"
									tabIndex={-1}
								>
									<ResetIcon />
								</Button>
							)}
							{resetIcon && !isPro && (
								<ResetButton
									attributes={attributes}
									setAttributes={setAttributes}
									attributesKey={attributesKey}
									defaultValue={defaultValue}
									setCurrentValue={setCurrentValue}
									setCustomReset={setCustomReset}
								/>
							)}
							{units && (
								<Units
									attributes={attributes}
									setAttributes={setAttributes}
									attributesKey={attributesKey}
									units={units}
									onUnitChange={onUnitChange ? onUnitChange : false}
								/>
							)}
							{unitBadge ? (
								<span className="sp-smart-team-range-control__unit-badge">
									{unitBadge}
								</span>
							) : null}
						</div>
					</div>
				)}

				<RangeControl
					value={
						customValue ||
						((currentValue === '' ||
							currentValue === undefined ||
							currentValue === null) &&
						canvasDefault !== undefined
							? canvasDefault
							: currentValue)
					}
					disabled={isPro}
					color="var(--sp-smart-team-primary-2-600)"
					onChange={(newValue) =>
						onValueChange
							? onValueChange({
									value: newValue,
									deviceType,
								})
							: setValue(newValue)
					}
					min={min}
					max={rangeMax}
					step={step}
					help={helpText}
					__nextHasNoMarginBottom={true}
					__next40pxDefaultSize
				/>
			</div>
		</>
	);
};

export default memo(SPRangeControl);
