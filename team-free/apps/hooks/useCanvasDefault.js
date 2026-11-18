import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { useDeviceType } from '../controls/controls';
import { currentUnit, findProbeTarget, isSlotEmpty, readProbeTarget } from '../utils/canvasDefault';

// blockName → the block's editor dynamicCss(attributes). Filled by
// apps/blocks/shared/canvasDefaultProbes.js.
const probes = {};
export const registerCanvasDefaultProbe = (blockName, cssFn) => {
	probes[blockName] = cssFn;
};

const canvasDocument = () =>
	document.querySelector('iframe[name="editor-canvas"]')?.contentDocument || document;

// The value the selected block's stylesheet renders for an attribute unset on the
// active device — shown by a control instead of 0. Undefined when the attribute is
// set, not top-level, or cannot be measured.
const useCanvasDefault = (attributesKey, enabled = true) => {
	const deviceType = useDeviceType();
	const block = useSelect((select) => select('core/block-editor')?.getSelectedBlock?.(), []);
	const [measured, setMeasured] = useState(undefined);

	const attributes = block?.attributes;
	const attr = attributesKey ? attributes?.[attributesKey] : undefined;
	const active = enabled && !!probes[block?.name] && !!attr && isSlotEmpty(attr, deviceType);

	useEffect(() => {
		if (!active) {
			setMeasured(undefined);
			return undefined;
		}
		const target = findProbeTarget(probes[block.name], attributes, attributesKey);
		if (!target) {
			setMeasured(undefined);
			return undefined;
		}
		const unit = currentUnit(attr, deviceType);
		const measure = () => setMeasured(readProbeTarget(target, canvasDocument(), unit));
		// The canvas re-renders after the store update, and a device switch resizes
		// the iframe — measure on the next frame and again once both have settled.
		const frame = requestAnimationFrame(measure);
		const timer = setTimeout(measure, 350);
		return () => {
			cancelAnimationFrame(frame);
			clearTimeout(timer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- attributes covers attr/block
	}, [active, attributes, attributesKey, deviceType]);

	return active ? measured : undefined;
};

export default useCanvasDefault;
