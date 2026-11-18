import Select from 'react-select';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ProTag from '../proTag/proTag.js';
import './editor.scss';

const MultipleSelect = ({
	attributes,
	setAttributes,
	attributesKey,
	label,
	items,
	objectData = false,
	value = false,
	onChange = false,
	flex = false,
	reset = false,
	onInputChange = false,
	helpText = '',
	// Pro-lock (same treatment as `Toggle isPro`): the label carries a
	// "(Pro)" tag (display-only), the select is empty and disabled, and nothing
	// is ever written — the stored value stays exactly as Pro saved it.
	isPro = false,
}) => {
	// Ensure items is always an array
	const itemsArray = Array.isArray(items) ? items : [];

	// Calculate selected values - filter items that match the attributes array
	// This recalculates when either items or attributes change
	// Handles cases where attributes might not be an array or items might be empty
	const selectedValues = useMemo(() => {
		const attributesArray = Array.isArray(attributes) ? attributes : [];

		if (!attributesArray.length || !itemsArray.length) {
			return [];
		}

		// Normalize both sides for comparison to handle type mismatches (string vs number)
		// Create a Set for O(1) lookup
		const normalizedAttributesSet = new Set(
			attributesArray.map((attr) => {
				const num = Number(attr);
				return isNaN(num) ? String(attr) : num;
			})
		);

		return itemsArray.filter((item) => {
			const itemValue = item?.value;
			if (itemValue === undefined || itemValue === null) {
				return false;
			}
			// Try both the original value and normalized value
			const normalizedItemValue =
				typeof itemValue === 'number' ? itemValue : Number(itemValue);
			return (
				normalizedAttributesSet.has(itemValue) ||
				(!isNaN(normalizedItemValue) && normalizedAttributesSet.has(normalizedItemValue)) ||
				normalizedAttributesSet.has(String(itemValue))
			);
		});
	}, [attributes, itemsArray]);

	const updateValue = (data) => {
		if (objectData) {
			const updatedValues = data?.map((d) => {
				return { value: d.value, type: d.type };
			});
			setAttributes({ [attributesKey]: updatedValues });
		} else {
			const updatedValues = data?.map((d) => d.value);
			setAttributes({ [attributesKey]: updatedValues });
		}
	};

	if (isPro) {
		return (
			<div
				className={`sp-smart-team-multi-select ${flex ? 'd-flex' : ''} sp-smart-team-component-mb is-pro`}
			>
				<p className="sp-smart-team-component-title">
					{label}
					<ProTag />
				</p>
				<Select
					value={[]}
					isMulti
					isDisabled
					options={[]}
					placeholder={__('Select…', 'team-free')}
					className="sp-smart-team-basic-multi-select"
					classNamePrefix="sp-smart-team-select"
				/>
			</div>
		);
	}

	return (
		<div
			className={`sp-smart-team-multi-select ${flex ? 'd-flex' : ''} sp-smart-team-component-mb`}
		>
			<p className="sp-smart-team-component-title">{label}</p>
			<Select
				value={value ? value : selectedValues}
				isMulti
				options={itemsArray}
				isClearable={reset}
				onChange={(data) => (onChange ? onChange(data) : updateValue(data))}
				// react-select uses the return value as the new input text, so the
				// default must hand the typed text back (returning '' blocked typing).
				onInputChange={(e) => {
					if (onInputChange) {
						onInputChange(e);
					}
					return e;
				}}
				className="sp-smart-team-basic-multi-select"
				classNamePrefix="sp-smart-team-select"
			/>
			{helpText && <p className="sp-smart-help-text">{helpText}</p>}
		</div>
	);
};

export default MultipleSelect;
