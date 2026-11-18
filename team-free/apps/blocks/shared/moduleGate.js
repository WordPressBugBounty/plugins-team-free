/**
 * Editor-side read of the dashboard's Modules page toggles.
 *
 * AssetManager localizes already-resolved values — `moduleOffBlocks` as block
 * names and `moduleOffElements` as `cardElements` values — so the
 * module↔block and module↔element maps live only on the PHP side
 * (DashboardHelper::MODULE_BLOCKS / ::MODULE_CARD_ELEMENTS).
 *
 * Both readers FAIL OPEN when the localized data is missing (a test harness, a
 * context where the editor bundle loaded without it), matching the rest of the
 * gates: better a visible option than a silently hidden one.
 */

/**
 * Card Content rows whose module is currently off.
 *
 * @return {string[]} `cardElements` values to hide.
 */
export const moduleOffElements = () => {
	const values = window.sptpBlocksEditor?.moduleOffElements;

	return Array.isArray(values) ? values : [];
};

/**
 * Whether a block's module is still on.
 *
 * @param {string} name Block name.
 * @return {boolean} True when the block should behave normally.
 */
export const isBlockModuleEnabled = (name) => {
	const names = window.sptpBlocksEditor?.moduleOffBlocks;

	if (!Array.isArray(names)) {
		return true;
	}

	return !names.includes(name);
};
