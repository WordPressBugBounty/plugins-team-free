import { __ } from '@wordpress/i18n';
import { useState, memo } from '@wordpress/element';
import SpColorPicker from '../color/color';
import SPToggleGroupControl from '../toggleGroupControl/toggleGroupControl';
import { DashedStyle, DottedStyle, DoubleStyle, SolidStyle } from '../../icons/icons';
import './editor.scss';
import Spacing from '../spacing/spacing';
import { useDeviceType } from '../../controls/controls';

const Border = ({
	label = 'Border',
	attributes,
	setAttributes,
	attributesKey,
	units = ['px', 'em'],
	btnType = false,
	/** When set, parent provides a single Normal/Hover tab - hide internal Normal/Hover/Active tabs and show only this state. */
	parentState = false,
	// Every *BorderWidth attribute in the plugin defaults to 1px all-around
	// (Att_Utils::spacing( 1, 1, 1, 1 )) — reset must restore that, not 0.
	defaultValue = {
		unit: 'px',
		value: { top: 1, right: 1, bottom: 1, left: 1 },
	},
	defaultColor = '#fff',
	onStateUpdate = false,
	responsive = false,
	showBorderColor = true,
	// For a SINGLE border object ({ style, color, hoverColor }) under a parent
	// Normal/Hover toggle: the hover state reads/writes hoverColor instead of
	// clobbering the normal color. The two colors are independent — normal
	// edits never touch hoverColor. Without it, parentState keeps the legacy
	// contract where the CALLER swaps in a separate hover object.
	syncHoverColor = false,
	// Opt-in mirror (unused by the blocks — normal and hover stay independent):
	// copies the whole border object / border width onto the named hover
	// attribute on every edit.
	syncKey = '',
	syncWidthKey = '',
}) => {
	const [buttonTab, setButtonTab] = useState('color');
	const { border, borderWidth } = attributes;
	// When parentState is set, use it instead of internal buttonTab; always use 'style' for border style.
	const effectiveTab = parentState ? parentState : buttonTab;
	const useParentState = parentState === 'normal' || parentState === 'hover';

	// Commit a border object, mirroring it onto the separate hover attribute
	// when syncKey is set (normal-state edits only — see prop docs).
	const writeBorderObject = (next) => {
		if (onStateUpdate) {
			onStateUpdate(attributesKey.border, next);
			return;
		}
		const payload = { [attributesKey.border]: next };
		if (syncKey) {
			payload[syncKey] = { ...next };
		}
		setAttributes(payload);
	};

	// Commit the color for the active parent state, applying the opted-in
	// hover mirroring (normal → hover; hover edits never touch normal).
	const writeParentStateColor = (newValue) => {
		const next = { ...border };
		if (syncHoverColor && parentState === 'hover') {
			next.hoverColor = newValue;
		} else {
			next.color = newValue;
		}
		writeBorderObject(next);
	};

	// Commit the border width (value changes), mirroring onto the separate
	// hover border-width attribute when syncWidthKey is set.
	const writeBorderWidth = (newValue) => {
		const payload = { [attributesKey.borderWidth]: newValue };
		if (syncWidthKey) {
			payload[syncWidthKey] = { ...newValue };
		}
		setAttributes(payload);
	};

	const _deviceType = useDeviceType();

	const borderColorOptions = [
		{ label: 'color', value: 'color' },
		...(attributes.border.hoverColor ||
		attributes.border.hoverColor === '' ||
		attributes.border.hover ||
		attributes.border.hover === ''
			? [{ label: 'Hover', value: 'hover' }]
			: []),
		...(attributes.border.activeColor ||
		attributes.border.activeColor === '' ||
		attributes.border.active ||
		attributes.border.active === ''
			? [{ label: 'Active', value: 'activeColor' }]
			: []),
	];

	const hoverColor = () => {
		if (border?.hoverColor !== undefined) {
			return 'hoverColor';
		}
		if (border?.hover !== undefined) {
			return 'hover';
		}
		if (border?.activeColor !== undefined) {
			return 'activeColor';
		}
		return 'active';
	};

	const borderStyleString = () => {
		if (btnType && btnType !== 'color') {
			return 'hoverStyle';
		}
		return 'style';
	};
	const updateBorderWithHandler = (newValue) => {
		if (onStateUpdate) {
			onStateUpdate(attributesKey.borderWidth, newValue);
		}
		return false;
	};
	const updateSpacingUtilityHandler = (type, newUtility) => {
		if (onStateUpdate) {
			onStateUpdate(attributesKey.borderWidth, {
				...attributes.borderWidth,
				[type]: newUtility,
			});
		} else {
			const updateAttr =
				type === 'allChange'
					? { ...attributes.borderWidth, [type]: newUtility }
					: {
							...attributes.borderWidth,
							[type]: newUtility,
						};
			writeBorderWidth(updateAttr);
		}
	};

	return (
		<>
			<div className="sp-smart-team-border-control sp-smart-team-component-mb ">
				<div className="sp-smart-team-header-control sp-mb-8px">
					<span className="sp-smart-team-component-title">{label}</span>
				</div>
				<div
					className={`sp-smart-team-border-style-wrapper${
						!['none', ''].includes(border?.[borderStyleString()])
							? ' sp-smart-team-component-mb'
							: ''
					}`}
				>
					<SPToggleGroupControl
						hasDivider={false}
						attributes={border?.[borderStyleString()]}
						onClick={(newValue) =>
							writeBorderObject({
								...border,
								[borderStyleString()]: newValue,
							})
						}
						items={[
							{ label: 'None', value: 'none' },
							{ label: <SolidStyle />, value: 'solid' },
							{ label: <DashedStyle />, value: 'dashed' },
							{ label: <DottedStyle />, value: 'dotted' },
							{ label: <DoubleStyle />, value: 'double' },
						]}
					/>
				</div>
				{!['none', ''].includes(border?.[borderStyleString()]) && (
					<>
						<div className="sp-smart-team-component-mb">
							<Spacing
								key={borderStyleString()}
								label={'Border Width'}
								attributes={borderWidth}
								attributesKey={attributesKey.borderWidth}
								setAttributes={setAttributes}
								units={units}
								rangeStep={0.5}
								min={0}
								max={10}
								rangeMax={2}
								defaultValue={defaultValue}
								onChange={
									onStateUpdate
										? updateBorderWithHandler
										: syncWidthKey
											? writeBorderWidth
											: false
								}
								onUnitChange={(newValue) =>
									updateSpacingUtilityHandler('unit', newValue)
								}
								updateAllChange={(newValue) =>
									updateSpacingUtilityHandler('allChange', newValue)
								}
								responsive={responsive}
							/>
						</div>
						{!btnType && !useParentState && (
							<SPToggleGroupControl
								attributes={buttonTab}
								items={borderColorOptions}
								onClick={(newValue) => setButtonTab(newValue)}
							/>
						)}
						{/* Parent Normal/Hover tabs — one color field. Legacy contract: the
						    caller swaps in a separate border object per state and this
						    always edits `color`. With syncHoverColor the object is shared
						    and the hover state edits `hoverColor` instead. */}
						{showBorderColor && useParentState && (
							<SpColorPicker
								label={__('Border Color', 'team-free')}
								value={
									syncHoverColor && parentState === 'hover'
										? border?.hoverColor
										: border?.color
								}
								onChange={writeParentStateColor}
								defaultColor={
									typeof defaultColor === 'object'
										? defaultColor.color
										: defaultColor
								}
							/>
						)}
						{showBorderColor && !useParentState && (
							<>
								{((btnType && btnType === 'color') ||
									(!btnType && buttonTab === 'color')) && (
									<SpColorPicker
										label={__('Border Color', 'team-free')}
										value={border?.color}
										onChange={(newValue) =>
											onStateUpdate
												? onStateUpdate(attributesKey.border, {
														...border,
														color: newValue,
													})
												: setAttributes({
														[attributesKey.border]: {
															...border,
															color: newValue,
														},
													})
										}
										defaultColor={
											typeof defaultColor === 'object'
												? defaultColor.color
												: defaultColor
										}
									/>
								)}
								{([btnType, effectiveTab].includes('hover') ||
									[btnType, effectiveTab].includes('activeColor')) && (
									<SpColorPicker
										label={__('Border Color Hover', 'team-free')}
										value={border?.[hoverColor()]}
										onChange={(newValue) =>
											onStateUpdate
												? onStateUpdate(attributesKey.border, {
														...border,
														hoverColor: newValue,
													})
												: setAttributes({
														[attributesKey.border]: {
															...border,
															[hoverColor()]: newValue,
														},
													})
										}
										defaultColor={
											typeof defaultColor === 'object'
												? defaultColor.hover
												: defaultColor
										}
									/>
								)}
							</>
						)}
					</>
				)}
			</div>
		</>
	);
};

export default memo(Border);
