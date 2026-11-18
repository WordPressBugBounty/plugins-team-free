// Update Version of Space Control v2.
import { RangeControl } from '@wordpress/components';
import { ResetButton, SpLinkedButton, Units } from '../utility';
import Responsive from '../responsive/responsive';
import { BorderIcon } from '../../icons/icons';
import './editor.scss';
import { sideAxisIcons } from '../../controls/constants';
import { useDeviceType } from '../../controls/controls';
import { memo, useEffect, useState, useMemo } from '@wordpress/element';
import useRegisteredDefault from '../../hooks/useRegisteredDefault';
import useCanvasDefault from '../../hooks/useCanvasDefault';

const SIDES = ['top', 'right', 'bottom', 'left'];
const ZERO_SIDES = { top: 0, right: 0, bottom: 0, left: 0 };

const SpCustomRanger = ({
	attr,
	sideKey = 'all',
	onChangeHandler,
	rangeStep,
	min,
	max,
	step,
	rangeMax,
	indicator = '',
	selectUnit = '',
}) => {
	const [showInput, setShowInput] = useState(true);
	const rangerStep = showInput ? rangeStep : step;
	const iconType = indicator ? `${indicator}-${sideKey}` : sideKey;

	// FIX: Use nullish check so 0 is treated as a number, not a falsy empty string
	const rangeValue = useMemo(() => {
		const val = sideKey === 'all' ? attr?.top : attr?.[sideKey];
		return val !== undefined && val !== null && val !== '' ? Number(val) : 0;
	}, [attr, sideKey]);

	const sliderMin = min;
	const sliderMax = showInput && rangeMax ? rangeMax : max;
	const dashMarks = useMemo(() => {
		if (!showInput) {
			return false;
		}
		const TARGET = 6;
		const totalRange = sliderMax - sliderMin;
		if (totalRange <= 0) {
			return false;
		}
		return Array.from({ length: TARGET + 1 }, (_, i) => ({
			value: sliderMin + (i * totalRange) / TARGET,
		}));
	}, [sliderMin, sliderMax, showInput]);

	return (
		<div className="sp-smart-range-control-ranger-row">
			<div className="sp-smart-range-control sp-side-demo-icon">
				<span className="sp-link-side-icon">{sideAxisIcons[iconType]}</span>
			</div>
			<div className="sp-smart-range-control sp-ranger">
				<RangeControl
					value={rangeValue}
					onChange={(val) => onChangeHandler(sideKey, val)}
					step={rangerStep}
					min={sliderMin}
					max={sliderMax}
					withInputField={!showInput}
					marks={dashMarks}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					renderTooltipContent={(value) => `${value}${selectUnit || ''}`}
				/>
			</div>
			<div
				className="sp-smart-range-control sp-preset-btn"
				onClick={() => setShowInput(!showInput)}
			>
				<BorderIcon isActive={!showInput} />
			</div>
		</div>
	);
};

const Spacing = ({
	label,
	attributes,
	attributesKey,
	setAttributes = () => {},
	onChange,
	units = false,
	rangeStep = 8,
	step = 1,
	min = 0,
	max = 300,
	rangeMax = 50,
	resetIcon = true,
	onUnitChange = false,
	indicator = '',
	defaultValue,
	// { value: { top, right, bottom, left }, unit } that reset restores, ahead of the
	// registered default — for a default that depends on another attribute (card design).
	resetValue,
	// { top, right, bottom, left } the design's stylesheet applies while the
	// attribute is unset — shown instead of 0 and used as the base of the first edit.
	placeholder,
	customClass = '',
	responsive = true,
}) => {
	const deviceType = useDeviceType();

	// FIX: Match "desktop" hook value to "Desktop" attribute key
	const normalizedDevice = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);

	const getDeviceAttr = () => {
		return attributes?.device?.[normalizedDevice] || attributes?.value || attributes || {};
	};

	// FIX: Ensure state updates when the device or attributes change externally
	const [simpleAttr, setSimpleAttr] = useState(getDeviceAttr());

	// Depend on the attribute *content* (not its reference): parents often pass a
	// fresh object literal (e.g. `attr || {}`) each render, which would otherwise
	// re-sync on every render and clobber the value mid-drag (slider snaps back).
	useEffect(() => {
		setSimpleAttr(getDeviceAttr());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deviceType, JSON.stringify(attributes)]);

	const linked = attributes?.allChange || false;

	// The block's registered default wins, so reset restores the value set in
	// attributes.php (e.g. 10/20/10/20 px) instead of whatever the call site guessed.
	const registeredDefault = useRegisteredDefault(attributesKey);

	const resolveDefault = () => {
		if (resetValue) {
			return { sides: resetValue.value, unit: resetValue.unit };
		}
		const reg = registeredDefault;
		if (reg?.device?.[normalizedDevice]) {
			return {
				sides: reg.device[normalizedDevice],
				unit: typeof reg.unit === 'object' ? reg.unit?.[normalizedDevice] : reg.unit,
			};
		}
		if (reg?.value && typeof reg.value === 'object') {
			return { sides: reg.value, unit: reg.unit };
		}
		if (defaultValue) {
			return { sides: defaultValue?.value || defaultValue, unit: defaultValue?.unit };
		}
		return { sides: ZERO_SIDES, unit: undefined };
	};
	const { sides: resetSides, unit: resetUnit } = resolveDefault();

	// Without a caller placeholder, fall back to what the design renders on the canvas.
	const canvasDefault = useCanvasDefault(attributesKey, !placeholder);
	const effectivePlaceholder = placeholder || canvasDefault;

	const isUnset = SIDES.every((side) => (simpleAttr?.[side] ?? '') === '');
	const showPlaceholder = !!effectivePlaceholder && isUnset;
	const displayAttr = showPlaceholder ? effectivePlaceholder : simpleAttr;

	const onChangeHandler = (side, newVal, newUnit) => {
		let updatedValue = showPlaceholder
			? SIDES.reduce((acc, key) => ({ ...acc, [key]: effectivePlaceholder[key] ?? '' }), {})
			: { ...simpleAttr };

		if (side === 'reset') {
			updatedValue = newVal;
		} else if (side === 'all') {
			updatedValue = { top: newVal, right: newVal, bottom: newVal, left: newVal };
		} else {
			updatedValue[side] = newVal;
		}

		let newAttributes;
		if (responsive) {
			newAttributes = {
				...attributes,
				device: {
					...attributes?.device,
					[normalizedDevice]: updatedValue,
				},
			};
		} else {
			newAttributes = {
				...attributes,
				value: updatedValue,
			};
		}

		if (newUnit !== undefined) {
			newAttributes.unit =
				responsive && attributes?.unit && typeof attributes.unit === 'object'
					? { ...attributes.unit, [normalizedDevice]: newUnit }
					: newUnit;
		}

		if (onChange) {
			onChange(newAttributes);
		} else {
			setAttributes({ [attributesKey]: newAttributes });
		}
		setSimpleAttr(updatedValue);
	};

	const onValueReset = () => {
		// Per side (not top-for-all) so an asymmetric default survives reset; ?? keeps
		// an explicit '' default as "unset" instead of forcing 0.
		const sides = SIDES.reduce(
			(acc, side) => ({ ...acc, [side]: resetSides?.[side] ?? 0 }),
			{}
		);
		onChangeHandler('reset', sides, resetUnit);
	};

	// String-compare so 1 (attribute default) matches '1' (input field value).
	const currentUnit =
		typeof attributes?.unit === 'object'
			? attributes.unit?.[normalizedDevice]
			: attributes?.unit;
	const isAtDefault =
		SIDES.every(
			(side) => String(simpleAttr?.[side] ?? '') === String(resetSides?.[side] ?? '')
		) &&
		(resetUnit === undefined || resetUnit === currentUnit);

	return (
		<div
			className={`sp-smart-team-spacing-range-control sp-smart-team-component-mb sp-smart-team-range-control ${customClass}`}
		>
			<div className="sp-smart-team-header-control">
				<div className="sp-smart-team-header-control-left">
					<span className="sp-smart-team-component-title">{label}</span>
					{attributes?.device && <Responsive />}
				</div>
				<div className="sp-smart-team-header-control-right">
					{resetIcon && !isAtDefault && <ResetButton onClick={onValueReset} />}
					<SpLinkedButton
						attributes={attributes}
						attributesKey={attributesKey}
						setAttributes={setAttributes}
						Icon={indicator ? sideAxisIcons['radius-all'] : sideAxisIcons.all}
					/>
					{units && (
						<Units
							attributes={attributes}
							setAttributes={setAttributes}
							attributesKey={attributesKey}
							units={units}
							onUnitChange={onUnitChange}
						/>
					)}
				</div>
			</div>

			<div className="sp-smart-team-spacing-body">
				{linked ? (
					<SpCustomRanger
						attr={displayAttr}
						sideKey="all"
						onChangeHandler={onChangeHandler}
						min={min}
						max={max}
						rangeStep={rangeStep}
						step={step}
						rangeMax={rangeMax}
						indicator={indicator}
						selectUnit={attributes?.unit?.[normalizedDevice]}
					/>
				) : (
					SIDES.map((side) => (
						<SpCustomRanger
							key={side}
							attr={displayAttr}
							sideKey={side}
							onChangeHandler={onChangeHandler}
							min={min}
							max={max}
							rangeStep={rangeStep}
							step={step}
							rangeMax={rangeMax}
							indicator={indicator}
							selectUnit={attributes?.unit?.[normalizedDevice]}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default memo(Spacing);
