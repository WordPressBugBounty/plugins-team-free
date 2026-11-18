import { Button, ColorPicker, ColorIndicator, Popover, Tooltip } from '@wordpress/components';
import './editor.scss';
import { useMemo, memo, useEffect, useState } from '@wordpress/element';
import { ResetIcon } from '../../icons/icons';
import { useSelect } from '@wordpress/data';
import { getBlockType } from '@wordpress/blocks';

const SpColorPicker = (props) => {
	const {
		setAttributes,
		value,
		attributesKey,
		label,
		colorType = 'normal',
		attributes = {},
		onChange,
		resetButton = true,
		defaultColor = '',
	} = props;

	const [isVisible, setIsVisible] = useState(false);
	const activeColor = value || attributes?.[colorType] || attributes;

	const toggleVisible = () => {
		setIsVisible((state) => !state);
	};

	// The block's registered default for plain string color attributes — so
	// reset restores the real default (not '') without call sites passing a
	// defaultColor prop. Object-shaped attributes keep the prop-driven path.
	const registeredDefault = useSelect(
		(select) => {
			const block = select('core/block-editor')?.getSelectedBlock?.();
			const def = block
				? getBlockType(block.name)?.attributes?.[attributesKey]?.default
				: undefined;
			return typeof def === 'string' ? def : undefined;
		},
		[attributesKey]
	);
	const effDefault = defaultColor || registeredDefault || '';

	const themeAllColors = useSelect((_select) => {
		const settings = _select('core/block-editor').getSettings();
		const colors = settings?.colors || [];
		const palette = settings?.__experimentalFeatures?.color?.palette;

		const originalColors = palette?.custom ? palette?.theme : undefined;

		return { colors, originalColors };
	}, []);

	const mergedThemeColors = useMemo(
		() => [...(themeAllColors.originalColors || []), ...(themeAllColors.colors || [])],
		[themeAllColors.originalColors, themeAllColors.colors]
	);

	const colorPickerValue = (pickerValue) => {
		if (pickerValue?.startsWith('#')) {
			return pickerValue;
		}
		return pickerValue || '';
	};

	const handleColorChange = (_value) => {
		if (colorType && typeof attributes?.[colorType] !== 'undefined') {
			setAttributes({
				[attributesKey]: { ...attributes, [colorType]: _value },
			});
		} else {
			setAttributes({ [attributesKey]: _value });
		}
	};

	const setDefault = () => {
		if (onChange) {
			onChange(effDefault);
		} else {
			handleColorChange(effDefault);
		}
	};

	useEffect(() => {
		const clickOutSite = (e) => {
			const target = e.target.closest('.sp-smart-team-picker-pallet-wrapper');
			const buttonTarget = e.target.closest(
				'.sp-smart-team-color-picker-right-area .sp-color-picker-btn'
			);
			const familyTarget = e.target.closest('.css-1nmdiq5-menu');
			if (!target && isVisible && !buttonTarget && !familyTarget) {
				setIsVisible(false);
			}
		};
		window.addEventListener('click', clickOutSite);

		return () => window.removeEventListener('click', clickOutSite);
	});

	return (
		<div className="sp-smart-team-color-picker sp-smart-team-component-mb">
			<p className="sp-smart-team-component-title">{label}</p>
			<div className="sp-smart-team-color-picker-right-area">
				{resetButton && effDefault !== (value || '') && (
					<Button
						className="sp-smart-team-header-control-reset"
						onClick={() => setDefault()}
					>
						<ResetIcon />
					</Button>
				)}
				<Button className="sp-color-picker-btn" onClick={() => toggleVisible()}>
					<ColorIndicator colorValue={value} />
				</Button>

				{isVisible && (
					<Popover shift={true} focusOnMount={false}>
						<div className={`sp-smart-team-picker-pallet-wrapper`}>
							<ColorPicker
								color={colorPickerValue(value)}
								onChange={onChange || handleColorChange}
								enableAlpha
							/>
							<p className="sp-default-color-pallet sp-default-theme-color">
								Theme Color
							</p>
							<ul className="sp-smart-team-color-picker-palette">
								{mergedThemeColors?.map((item, i) => (
									<Tooltip key={i} text={item?.name}>
										<li
											style={{
												backgroundColor: item.color,
											}}
											className={`${item.color === activeColor ? 'active' : ''}`}
										>
											<Button
												aria-label={item.name}
												onClick={() =>
													onChange
														? onChange(item.color)
														: handleColorChange(item.color)
												}
												value={item.color}
											/>
										</li>
									</Tooltip>
								))}
							</ul>
						</div>
					</Popover>
				)}
			</div>
		</div>
	);
};

export default memo(SpColorPicker);
