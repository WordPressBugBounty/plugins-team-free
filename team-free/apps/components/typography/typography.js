import Select from 'react-select';
import { __ } from '@wordpress/i18n';
import { Button, Popover, RangeControl, Flex, Tooltip } from '@wordpress/components';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import ComponentsTopSection from '../componentsTopControl/ComponentsTopSection.js';
import { EditIcon } from './svgIcon.js';
import './editor.scss';
import SelectField from '../selectField/selectField.js';
import {
	fontWeightMap,
	getFontSizePresets,
	getFontWeightList,
	textCaseOptions,
	textDecorationOptions,
} from './utility.js';
import InputControl from '../inputControl/inputControl.js';
import { useDeviceType } from '../../controls/controls.js';
import classNames from 'classnames';
import { BorderIcon } from '../../icons/icons.js';
import { useSelect } from '@wordpress/data';
import useGoogleFonts from '../../hooks/useGoogleFontApi.js';
import useGoogleFontsStylesheet from '../../hooks/useGoogleFontsStylesheet.js';
import useCanvasDefault from '../../hooks/useCanvasDefault.js';
import useRegisteredDefault from '../../hooks/useRegisteredDefault.js';
import { buildGoogleFontsUrl, isGoogleFontsEnabled } from '../../utils/googleFonts.js';

const TypographyNew = ({
	setAttributes,
	attributes,
	fontSizeDefault = { unit: 'px', value: 16 },
	// Size the design's stylesheet applies while the attribute is unset — shown instead of an empty slider.
	fontSizePlaceholder,
	typographyLabel = 'Typography',
	fontSizePresetType = 'body',
	onStateUpdate = false,
}) => {
	const fontFamilies = useSelect((_select) => {
		const settings = _select('core/editor')?.getEditorSettings();
		return settings?.__experimentalFeatures?.typography?.fontFamilies || [];
	}, []);

	const [systemFonts, setSystemFonts] = useState([]);
	const [allFonts, setAllFonts] = useState([]);
	const [fontLists, setFontLists] = useState([]);
	const {
		family = {},
		familyKey,
		fontSize,
		fontSizeKey,
		lineHeight,
		lineHeightKey,
		fontSpacing,
		fontSpacingKey,
		wordSpacing,
		wordSpacingKey,
	} = attributes;
	const deviceType = useDeviceType();
	// Registered defaults win over the fontSizeDefault / lineDefaultValue fallbacks.
	const fontSizeRegistered = useRegisteredDefault(fontSizeKey);
	const lineHeightRegistered = useRegisteredDefault(lineHeightKey);
	const fontSizeReset = fontSizeRegistered?.device
		? {
				value: fontSizeRegistered.device?.[deviceType] ?? '',
				unit:
					(typeof fontSizeRegistered.unit === 'object'
						? fontSizeRegistered.unit?.[deviceType]
						: fontSizeRegistered.unit) || fontSizeDefault.unit,
			}
		: fontSizeDefault;
	const fontSizePresets = getFontSizePresets(fontSizePresetType);
	// What the design renders while a value is unset — shown instead of 0 / blank.
	const fontSizeCanvas = useCanvasDefault(
		fontSizeKey,
		!onStateUpdate && fontSizePlaceholder === undefined
	);
	const lineHeightCanvas = useCanvasDefault(lineHeightKey, !onStateUpdate);
	const letterSpacingCanvas = useCanvasDefault(fontSpacingKey, !onStateUpdate);
	const wordSpacingCanvas = useCanvasDefault(wordSpacingKey, !onStateUpdate);

	const [isVisible, setIsVisible] = useState(false);
	const [isCustomFontSize, setIsCustomFontSize] = useState(
		(!fontSizePresets?.find((preset) => preset?.value === fontSize?.device?.[deviceType]) &&
			fontSize?.device?.[deviceType] !== '') ||
			false
	);
	const typoBtnRef = useRef(null);
	const toggleVisible = () => {
		setIsVisible((state) => !state);
	};
	const { googleFonts } = useGoogleFonts();
	useEffect(() => {
		const googleFontsReady = isGoogleFontsEnabled() ? googleFonts.length > 0 : true;

		if (allFonts.length === 0 && googleFontsReady) {
			let wpFonts = [];
			if (fontFamilies) {
				const customFonts = fontFamilies.custom || [];
				const themeFonts = fontFamilies.theme || [];
				const _systemFonts = [...customFonts, ...themeFonts];
				wpFonts = _systemFonts?.map((f) => {
					const variants = f?.fontFace?.map((v) => v.fontWeight);
					let variantsArray = [];
					if (variants?.length > 0) {
						variantsArray = variants?.length === 1 ? variants[0]?.split(' ') : variants;
					} else {
						variantsArray = ['300', '400', '500', '600', '700', '800'];
					}
					return {
						label: f.name,
						value: f.fontFamily,
						font: {
							family: f.fontFamily,
							variants: variantsArray,
						},
					};
				});
			}

			const grouped = [
				...(wpFonts.length > 0 ? [{ label: 'System Fonts', options: wpFonts }] : []),
				...(isGoogleFontsEnabled() && googleFonts.length > 0
					? [
							{
								label: 'Google Fonts',
								options: googleFonts.filter((font, i) => i < 50 && font),
							},
						]
					: []),
			];
			setSystemFonts(wpFonts);
			setAllFonts([...wpFonts, ...(isGoogleFontsEnabled() ? googleFonts : [])]);
			setFontLists(grouped);
		}
	}, [googleFonts, fontFamilies, allFonts]);
	const fontSearch = (inputValue) => {
		if (!inputValue) {
			setFontLists([
				...(systemFonts.length > 0
					? [
							{
								label: 'System Fonts',
								options: systemFonts,
							},
						]
					: []),
				...(isGoogleFontsEnabled()
					? [
							{
								label: 'Google Fonts',
								options: googleFonts.filter((font, i) => i < 50 && font),
							},
						]
					: []),
			]);
			return;
		}

		const searchedFonts = allFonts
			.filter((font) => font.label.toLowerCase().includes(inputValue.toLowerCase()))
			.slice(0, 30);
		setFontLists([
			{
				label: 'Search Result',
				options: searchedFonts,
			},
		]);
	};
	// Close on an outside click. Listen only while the popup is open: the
	// listener used to be re-bound on every render, open or not.
	useEffect(() => {
		if (!isVisible) {
			return undefined;
		}
		const clickOutSite = (e) => {
			// A control that unmounts on click (a range Reset button hiding itself
			// at the default) is detached by now, so closest() can't place it.
			if (!e.target.isConnected) {
				return;
			}
			const target = e.target.closest('.sp-smart-team-typography-fonts');
			const familyTarget = e.target.closest('.css-1nmdiq5-menu');
			// The trigger button toggles the popup itself.
			if (!target && !familyTarget && !typoBtnRef.current?.contains(e.target)) {
				setIsVisible(false);
			}
		};
		window.addEventListener('click', clickOutSite);

		return () => window.removeEventListener('click', clickOutSite);
	}, [isVisible]);

	// default and active family options.
	const defaultFamilyOption = {
		label: 'Default',
		value: 'Default',
		font: {
			family: 'Default',
			variants: ['300', '400', '500', '600', '700', '800'],
		},
	};

	// Ensure family has typography property with defaults
	const safeFamily = {
		typography: {
			family: '',
			fontWeight: '',
			style: '',
			transform: '',
			decoration: '',
			...family?.typography,
		},
		googleFont: family?.googleFont,
		...family,
	};

	const activeGoogleFontUrl = useMemo(() => {
		const fontFamily = safeFamily?.typography?.family;
		const fontWeight = safeFamily?.typography?.fontWeight || '400';

		if (!fontFamily || fontFamily === 'Default') {
			return '';
		}

		return buildGoogleFontsUrl([`${fontFamily}:${fontWeight}`]);
	}, [safeFamily?.typography?.family, safeFamily?.typography?.fontWeight]);

	useGoogleFontsStylesheet(activeGoogleFontUrl, `typography-${familyKey || 'default'}`);

	const activeFontFamily =
		!safeFamily.typography?.family || safeFamily.typography.family === ''
			? defaultFamilyOption
			: {
					label:
						allFonts?.find((font) => font.value === safeFamily.typography.family)
							?.label || safeFamily.typography.family,
					value: safeFamily.googleFont?.family,
					font: safeFamily.googleFont,
				};

	const allFamilyList = [defaultFamilyOption, ...fontLists];

	const isAvailableOnList = allFamilyList?.find((font) => font.value === activeFontFamily.value);

	const fontFamilySelectOptions = isAvailableOnList
		? allFamilyList
		: [defaultFamilyOption, activeFontFamily, ...fontLists];

	// font family.
	const { fontWeight, style } = safeFamily.typography;

	const onChangeFontStyle = (fontStyle) => {
		const arrayOfStyles = fontWeightMap[fontStyle]?.split(' ');
		const _style = fontWeightMap[fontStyle]?.includes('italic') ? 'italic' : '';
		const _fontWeight = arrayOfStyles?.[arrayOfStyles?.length - 1];

		if (onStateUpdate) {
			onStateUpdate(familyKey, {
				...safeFamily,
				typography: {
					...safeFamily.typography,
					fontWeight: _fontWeight,
					style: _style,
				},
			});
			return;
		}

		setAttributes({
			[familyKey]: {
				...safeFamily,
				typography: {
					...safeFamily.typography,
					fontWeight: _fontWeight,
					style: _style,
				},
			},
		});
	};

	const onChangeFontSize = (newValue) => {
		setAttributes({
			[fontSizeKey]: {
				...fontSize,
				device: {
					...fontSize?.device,
					[deviceType]: newValue.value,
				},
				unit: {
					...fontSize.unit,
					[deviceType]: fontSize?.unit?.[deviceType]
						? fontSize?.unit?.[deviceType]
						: fontSizeDefault.unit,
				},
			},
		});
	};

	const onChangeTextStyles = (key, value) => {
		const newValue = safeFamily.typography[key] === value ? '' : value;
		if (onStateUpdate) {
			onStateUpdate(familyKey, {
				...safeFamily,
				typography: {
					...safeFamily.typography,
					[key]: newValue,
				},
			});
			return;
		}
		setAttributes({
			[familyKey]: {
				...safeFamily,
				typography: {
					...safeFamily.typography,
					[key]: newValue,
				},
			},
		});
	};

	return (
		<div className="sp-smart-team-typography sp-smart-team-component-mb">
			<Flex
				justify="space-between"
				align="center"
				className="sp-smart-team-typography-trigger"
			>
				<p> {typographyLabel}</p>
				<Button
					ref={typoBtnRef}
					aria-label={isVisible ? 'open typography popup' : 'close typography popup'}
					onClick={() => toggleVisible()}
					size="compact"
					className={classNames({ active: isVisible })}
					icon={<EditIcon />}
				/>
			</Flex>

			{isVisible && (
				<Popover shift={true} focusOnMount={false}>
					<div className={`sp-smart-team-typography-fonts`}>
						<div className="sp-smart-team-typography-header">
							<h4>{__('Typography', 'team-free')}</h4>
						</div>

						<div className="sp-smart-team-typography-fields">
							<div
								className={`sp-smart-team-typography-family sp-smart-team-component-mb`}
							>
								<div className="sp-smart-team-select-field">
									<div className="sp-smart-team-header">
										<span className="sp-smart-team-component-title">
											{__('Font Family', 'team-free')}
										</span>
									</div>

									<Select
										options={fontFamilySelectOptions}
										value={activeFontFamily}
										placeholder={activeFontFamily.label}
										onChange={(nextFont) =>
											onStateUpdate
												? onStateUpdate(familyKey, {
														...safeFamily,
														googleFont: nextFont?.font,
														typography: {
															...safeFamily.typography,
															family:
																'Default' !== nextFont?.font?.family
																	? nextFont?.font?.family
																	: '',
															fontWeight:
																'regular' ===
																nextFont?.font?.variants?.[0]
																	? '400'
																	: nextFont?.font?.variants?.[0],
														},
													})
												: setAttributes({
														[familyKey]: {
															...safeFamily,
															googleFont: nextFont?.font,
															typography: {
																...safeFamily.typography,
																family:
																	'Default' !==
																	nextFont?.font?.family
																		? nextFont?.font?.family
																		: '',
																fontWeight:
																	'regular' ===
																	nextFont?.font?.variants?.[0]
																		? '400'
																		: nextFont?.font
																				?.variants?.[0],
															},
														},
													})
										}
										onInputChange={(inputValue) => fontSearch(inputValue)}
									/>
								</div>
							</div>
							<SelectField
								label={__('Font Style', 'team-free')}
								attributes={
									activeFontFamily?.font?.variants?.includes(
										`${fontWeight || ''}${style || ''}`
									)
										? `${fontWeight || ''}${style || ''}`
										: fontWeight || ''
								}
								items={getFontWeightList(activeFontFamily)}
								onChange={(newStyle) => onChangeFontStyle(newStyle)}
								__nextHasNoMarginBottom
							/>
						</div>

						<div className="sp-smart-team-typography-multiple-button-group sp-smart-team-component-mb">
							<ComponentsTopSection
								label={__('Font Size', 'team-free')}
								units={['px', '%', 'Em']}
								attributes={fontSize}
								setAttributes={setAttributes}
								attributesKey={fontSizeKey}
								onReset={() =>
									!onStateUpdate &&
									setAttributes({
										[fontSizeKey]: {
											...fontSize,
											device: {
												...fontSize?.device,
												[deviceType]: fontSizeReset.value,
											},
											unit: {
												...fontSize.unit,
												[deviceType]: fontSizeReset.unit,
											},
										},
									})
								}
								onUnitChange={(newUnit) => {
									const unit = String(newUnit).toLowerCase();
									if (onStateUpdate) {
										onStateUpdate(fontSizeKey, { ...fontSize, unit });
										return;
									}
									setAttributes({
										[fontSizeKey]: {
											...fontSize,
											unit: {
												...(typeof fontSize?.unit === 'object'
													? fontSize.unit
													: {}),
												[deviceType]: unit,
											},
										},
									});
								}}
							/>
							<div
								className={classNames(
									'sp-smart-team-typography-font-size-presets',
									isCustomFontSize && 'active'
								)}
							>
								{isCustomFontSize ? (
									<RangeControl
										// value={ ajax ? currentValue : value }
										value={
											fontSize.device?.[deviceType] ||
											fontSize?.value ||
											fontSizePlaceholder ||
											fontSizeCanvas
										}
										color="var(--sp-smart-team-primary-2-600)"
										onChange={(newValue) =>
											onStateUpdate
												? onStateUpdate(fontSizeKey, {
														...fontSize,
														value: newValue,
													})
												: onChangeFontSize({
														value: newValue,
													})
										}
										min={0}
										max={100}
										step={1}
										__nextHasNoMarginBottom={true}
										__next40pxDefaultSize
									/>
								) : (
									<div className="sp-smart-team-button-group-list">
										{fontSizePresets?.map(({ label, value }, i) => (
											<button
												key={i}
												className={`components-button ${
													[
														fontSize?.device?.[deviceType],
														fontSize?.value,
													].includes(value)
														? ' active'
														: ''
												}`}
												onClick={() =>
													onStateUpdate
														? onStateUpdate(fontSizeKey, {
																...fontSize,
																value,
															})
														: onChangeFontSize({
																value,
															})
												}
											>
												<span title={value}>{label}</span>
											</button>
										))}
									</div>
								)}

								<Button onClick={() => setIsCustomFontSize((prev) => !prev)}>
									<BorderIcon isActive={isCustomFontSize} />
								</Button>
							</div>
						</div>

						<div className="sp-smart-team-typography-word-spacing-latter-spacing-wrapper sp-d-flex sp-gap-8px">
							<div className="sp-smart-team-typography-line-height-picker">
								<ComponentsTopSection
									label={__('Line Height', 'team-free')}
									attributes={lineHeight}
									attributesKey={lineHeightKey}
									setAttributes={setAttributes}
								/>
								<InputControl
									placeholder={lineHeightCanvas}
									attributes={
										lineHeight?.device?.[deviceType] ??
										lineHeight?.value ??
										lineHeightRegistered?.device?.[deviceType] ??
										''
									}
									flex={false}
									step={0.1}
									min={0}
									onChange={(newValue) =>
										setAttributes({
											[lineHeightKey]: {
												...lineHeight,
												device: {
													...lineHeight?.device,
													[deviceType]: newValue,
												},
											},
										})
									}
								/>
							</div>
							<div className="sp-smart-team-typography-line-height-picker">
								<ComponentsTopSection
									label={__('Letter Spacing', 'team-free')}
									attributes={fontSpacing}
									attributesKey={fontSpacingKey}
									setAttributes={setAttributes}
									units={['px', '%', 'em']}
									onUnitChange={(newValue) =>
										setAttributes({
											[fontSpacingKey]: {
												...fontSpacing,
												unit: String(newValue).toLowerCase(),
											},
										})
									}
								/>

								<InputControl
									placeholder={letterSpacingCanvas}
									attributes={fontSpacing?.value}
									type="number"
									flex={false}
									onChange={(newValue) =>
										setAttributes({
											[fontSpacingKey]: {
												...fontSpacing,
												value: newValue,
											},
										})
									}
									min={-100}
									step={0.1}
								/>
							</div>
						</div>
						{wordSpacing && (
							<div className="sp-smart-team-typography-letter-spacing-picker">
								<ComponentsTopSection
									label={__('Word Spacing', 'team-free')}
									attributes={wordSpacing}
									attributesKey={wordSpacingKey}
									setAttributes={setAttributes}
									units={['px', '%', 'em']}
									onUnitChange={(newValue) =>
										setAttributes({
											[wordSpacingKey]: {
												...wordSpacing,
												unit: String(newValue).toLowerCase(),
											},
										})
									}
								/>
								<InputControl
									placeholder={wordSpacingCanvas}
									attributes={wordSpacing?.value}
									type="number"
									flex={false}
									onChange={(newValue) =>
										setAttributes({
											[wordSpacingKey]: {
												...wordSpacing,
												value: newValue,
											},
										})
									}
									min={-100}
									step={0.1}
								/>
							</div>
						)}

						<Flex align="center">
							<div className="sp-smart-team-typography-multiple-button-group sp-smart-team-component-mb">
								<ComponentsTopSection label={__('Decoration', 'team-free')} />

								<div className="sp-smart-team-button-group-list">
									{textDecorationOptions?.map(({ label, key, value }, i) => (
										<Tooltip placement="top" text={value} key={i}>
											<button
												className={`components-button${safeFamily.typography[key] === value ? ' active' : ''}`}
												onClick={() => onChangeTextStyles(key, value)}
											>
												<span title={value}>{label}</span>
											</button>
										</Tooltip>
									))}
								</div>
							</div>
							<div className="sp-smart-team-typography-multiple-button-group sp-smart-team-component-mb">
								<ComponentsTopSection label={__('Case', 'team-free')} />
								<div className="sp-smart-team-button-group-list">
									{textCaseOptions?.map(({ label, key, value }, i) => (
										<Tooltip placement="top" text={value} key={i}>
											<button
												className={`components-button ${safeFamily.typography[key] === value ? ' active' : ''}`}
												onClick={() => onChangeTextStyles(key, value)}
											>
												<span title={value}>{label}</span>
											</button>
										</Tooltip>
									))}
								</div>
							</div>
						</Flex>
					</div>
				</Popover>
			)}
		</div>
	);
};

export default TypographyNew;
