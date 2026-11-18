/**
 * Grid — client-side dynamic CSS generator.
 *
 * Twin of blocks/Includes/Styles/Grid.php. The shared card rules live in
 * ../shared/cardDynamicCss (twin of CardCss.php); this file contributes only
 * the grid-track rules (columns / gaps / align-items on the `__items` grid).
 */

import { buildDynamicCss } from '../shared/cardDynamicCss';

// Grid-track rules for one device (twin of Styles\Grid::layout_responsive_css()).
const gridResponsiveCss = (attributes, deviceType) => {
	const { uniqueId, columns, horizontalGap, verticalGap, alignItems } = attributes;
	const rules = [];

	// Responsive: column count.
	const columnCount = columns?.device?.[deviceType] ?? '';
	const gridStyles = {};
	if (columnCount !== '' && columnCount !== null && columnCount !== undefined) {
		gridStyles['grid-template-columns'] = `repeat(${parseInt(columnCount, 10)}, 1fr)`;
	}

	// Non-responsive: gaps + alignment — emit once on the Desktop pass.
	if (deviceType === 'Desktop') {
		const hGap = horizontalGap?.value ?? '';
		const hGapUnit = horizontalGap?.unit ?? 'px';
		if (hGap !== '' && hGap !== null && hGap !== undefined) {
			gridStyles['column-gap'] = `${hGap}${hGapUnit}`;
		}

		const vGap = verticalGap?.value ?? '';
		const vGapUnit = verticalGap?.unit ?? 'px';
		if (vGap !== '' && vGap !== null && vGap !== undefined) {
			gridStyles['row-gap'] = `${vGap}${vGapUnit}`;
		}

		if (alignItems) {
			gridStyles['align-items'] = alignItems;
		}
	}

	if (Object.keys(gridStyles).length) {
		rules.push({
			selector: `#${uniqueId} .sp-smart-team-grid__items`,
			styles: gridStyles,
		});
	}

	return rules;
};

const dynamicCss = (attributes) =>
	buildDynamicCss(attributes, (device) => gridResponsiveCss(attributes, device));

export default dynamicCss;
