import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import SpColorPicker from '../color/color.js';

import { Tooltip } from '@wordpress/components';
import { BorderIcon, CheckMark, ResetIcon } from '../../icons/icons.js';
import { BoxSpacing } from './boxSpacing.js';
import './editor.scss';
import { shadowDefaultList } from './shadowPresets.js';

// Preset shadows shown in the picker. This plugin has no global-settings store,
// so the presets come from the bundled shadowDefaultList. Each preset's cssValue
// references the --sp-smart-team-shadow-<slug> variable from style.scss.
const formatShadow = (shadow) => ({
	...shadow,
	cssValue: `var(--sp-smart-team-shadow-${shadow.slug})`,
	value:
		shadow.type === 'inset'
			? `inset ${shadow['x-offset']}px ${shadow['y-offset']}px ${shadow.blur}px ${
					shadow.spread || shadow.speared || 0
				}px ${shadow.color}`
			: `${shadow['x-offset']}px ${shadow['y-offset']}px ${shadow.blur}px ${
					shadow.spread || shadow.speared || 0
				}px ${shadow.color}`,
});

const AVAILABLE_SHADOWS = (shadowDefaultList.shadowList || []).map(formatShadow);

const BoxShadow = ({
	attributes,
	attributesKey,
	setAttributes,
	defaultColor = '#4E4F521A',
	onChange = false,
}) => {
	const [selectedShadow, setSelectedShadow] = useState('var(--sp-smart-team-shadow-medium-4dp)');
	const [customShadow, setCustomShadow] = useState(false);
	const [update, setUpdate] = useState(0);

	// Initialize selected shadow from attributes (selectDefault = full CSS variable).
	useEffect(() => {
		if (attributes?.selectDefault && attributes.selectDefault !== 'custom') {
			setSelectedShadow(attributes.selectDefault);
		}
		if (attributes?.selectDefault === 'custom') {
			setCustomShadow(true);
		}
	}, [attributes]);

	const shadowColor = (newColor) => {
		if (onChange) {
			onChange(attributesKey, { ...attributes, color: newColor });
		} else {
			setAttributes({
				[attributesKey]: { ...attributes, color: newColor },
			});
		}
	};

	const shadowHandler = (newValue) => {
		setAttributes({
			[attributesKey]: { ...attributes, selectDefault: newValue },
		});
	};

	const handleShadowType = () => {
		const newCustomShadow = !customShadow;
		setCustomShadow(newCustomShadow);

		if (newCustomShadow) {
			// Switching to custom shadow
			if (onChange) {
				onChange(attributesKey, {
					...attributes,
					selectDefault: 'custom',
				});
			} else {
				setAttributes({
					[attributesKey]: {
						...attributes,
						selectDefault: 'custom',
					},
				});
			}
		} else {
			// Switching back to preset shadows
			if (selectedShadow && selectedShadow !== 'custom') {
				shadowHandler(selectedShadow);
			}
		}
	};

	const handleShadowSelect = (newValue) => {
		setSelectedShadow(newValue);
		if (onChange) {
			onChange(attributesKey, { ...attributes, selectDefault: newValue });
		} else {
			shadowHandler(newValue);
		}
	};

	const handleReset = () => {
		// Reset to the default medium shadow (full CSS variable).
		const defaultVar =
			AVAILABLE_SHADOWS.length > 2
				? AVAILABLE_SHADOWS[2].cssValue
				: AVAILABLE_SHADOWS[0]?.cssValue || 'var(--sp-smart-team-shadow-medium-4dp)';
		setSelectedShadow(defaultVar);
		shadowHandler(defaultVar);
	};

	return (
		<>
			<div className="sp-smart-team-shadow-selector-container">
				{/* Header */}
				<div className="sp-smart-team-shadow-selector-header">
					<p className="sp-smart-team-shadow-selector-title">Shadow Type</p>
					<div className="sp-smart-team-shadow-selector-actions">
						{!customShadow && (
							<Tooltip text="Reset to default">
								<button
									className="sp-smart-team-action-button sp-smart-team-action-refresh"
									onClick={handleReset}
								>
									<ResetIcon />
								</button>
							</Tooltip>
						)}

						<Tooltip text={customShadow ? 'Switch to Presets' : 'Switch to Custom'}>
							<button
								onClick={handleShadowType}
								className="sp-smart-team-action-button"
							>
								<BorderIcon isActive={customShadow} />
							</button>
						</Tooltip>
					</div>
				</div>

				{customShadow ? (
					<BoxSpacing
						key={update}
						label={__('Box Shadow', 'team-free')}
						customClass={'sp-box-shadow'}
						attributes={attributes}
						attributesKey={attributesKey}
						setAttributes={setAttributes}
						boxUnits={true}
						units={['Outset', 'Inset']}
						labelItem={{
							top: __('X Offset', 'team-free'),
							right: __('Y Offset', 'team-free'),
							bottom: __('Blur', 'team-free'),
							left: __('Speared', 'team-free'),
						}}
						handleReset={handleReset}
						onChange={onChange}
					/>
				) : (
					<div className="sp-smart-team-shadow-options-grid">
						{AVAILABLE_SHADOWS.map((shadow, i) => {
							const shadowCssVar =
								shadow?.cssValue || `var(--sp-smart-team-shadow-${shadow.slug})`;
							return (
								<Tooltip
									key={shadow.slug || i}
									text={shadow.title}
									className="custom-tooltip"
								>
									<button
										onClick={() => handleShadowSelect(shadowCssVar)}
										className={`sp-smart-team-shadow-option ${selectedShadow === shadowCssVar ? 'selected' : ''}`}
										style={{
											boxShadow: shadowCssVar,
										}}
									>
										{selectedShadow === shadowCssVar && (
											<div className="sp-smart-team-checkmark">
												<CheckMark />
											</div>
										)}
									</button>
								</Tooltip>
							);
						})}
					</div>
				)}
			</div>

			{customShadow && (
				<SpColorPicker
					label={__('Shadow Color', 'team-free')}
					value={attributes.color}
					onChange={shadowColor}
					defaultColor={defaultColor}
				/>
			)}
		</>
	);
};

export default BoxShadow;
