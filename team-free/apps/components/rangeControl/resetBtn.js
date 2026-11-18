import { memo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { getBlockType } from '@wordpress/blocks';
import { useDeviceType } from '../../controls/controls';
import { Button } from '@wordpress/components';
import { ResetIcon } from '../../icons/icons';

// Loose equality for attribute values — '', null and undefined all mean "unset".
const norm = (v) => (v === undefined || v === null || v === '' ? '' : String(v));

const ResetButton = ({
	attributes,
	setAttributes,
	attributesKey,
	defaultValue,
	setCurrentValue = () => {},
	setCustomReset = false,
}) => {
	const deviceType = useDeviceType();

	// The block's registered default for this attribute — so reset restores the
	// real default without every call site passing a defaultValue prop.
	const registeredDefault = useSelect(
		(select) => {
			const block = select('core/block-editor')?.getSelectedBlock?.();
			return block
				? getBlockType(block.name)?.attributes?.[attributesKey]?.default
				: undefined;
		},
		[attributesKey]
	);

	// An explicit defaultValue prop wins over the registered default.
	const hasPropDefault = defaultValue && Object.keys(defaultValue).length > 0;
	const effDefault = hasPropDefault ? defaultValue : registeredDefault;

	// Per-device default value/unit (prop defaults may be flat `{ value }`).
	const deviceDefault = effDefault?.device ? effDefault.device?.[deviceType] : effDefault?.value;
	const unitDefault =
		typeof effDefault?.unit === 'object' ? effDefault.unit?.[deviceType] : effDefault?.unit;

	// Hide the button entirely while the attribute sits at its default — there
	// is nothing to reset. Unknown default (e.g. nested sub-keys) keeps the
	// button always available, like before.
	let isDefault = false;
	if (effDefault !== undefined) {
		if (attributes?.device) {
			isDefault =
				norm(attributes.device?.[deviceType]) === norm(deviceDefault) &&
				norm(attributes.unit?.[deviceType]) ===
					norm(unitDefault ?? attributes.unit?.[deviceType]);
		} else if (attributes && typeof attributes === 'object') {
			isDefault =
				norm(attributes.value) === norm(effDefault?.value) &&
				norm(attributes.unit) === norm(unitDefault ?? attributes.unit);
		} else {
			isDefault = norm(attributes) === norm(deviceDefault ?? effDefault);
		}
	}
	if (isDefault) {
		return null;
	}

	// Set default value function and reset.
	const setDefault = () => {
		if (setCustomReset) {
			return setCurrentValue(deviceDefault);
		}
		// It's multiple device (desktop/tablet/mobile). Fall back to the current
		// unit when no default unit is supplied so reset can never blank it out.
		if (attributes?.device) {
			setAttributes({
				[attributesKey]: {
					...attributes,
					device: {
						...attributes.device,
						[deviceType]: deviceDefault ?? '',
					},
					unit: {
						...attributes.unit,
						[deviceType]: unitDefault ?? attributes.unit?.[deviceType] ?? '',
					},
				},
			});
		} else if (attributes && 'object' === typeof attributes) {
			// Single `{ value, unit }` — keep the shape intact: only overwrite the
			// unit when the default supplies one, and never write `value: undefined`
			// (that collapses the attribute on the next change).
			setAttributes({
				[attributesKey]: {
					...attributes,
					value: effDefault?.value ?? '',
					...(unitDefault !== undefined ? { unit: unitDefault } : {}),
				},
			});
		} else {
			setAttributes({
				[attributesKey]: effDefault !== undefined ? effDefault : defaultValue,
			});
		}

		setCurrentValue(deviceDefault);
	};

	return (
		<Button
			className="sp-smart-team-header-control-reset active"
			onClick={() => setDefault()}
			aria-label="Reset to default value"
		>
			<ResetIcon />
		</Button>
	);
};

export default memo(ResetButton);
