/**
 * Whether a Dashboard → Blocks switch has this block on. Both lists are
 * localized by AssetManager (`toggleManagedBlocks` = the managed names,
 * `activeBlockList` = the effectively-on subset, parent cascade already
 * applied), so the managed set has one source of truth in PHP.
 *
 * @param {string} name Block name.
 * @return {boolean} False only for a managed block that is switched off.
 */
export const isToggleEnabled = (name) => {
	const managed = window.sptpBlocksEditor?.toggleManagedBlocks;
	const active = window.sptpBlocksEditor?.activeBlockList;

	// Localized data missing (a test harness) — fail open.
	if (!Array.isArray(managed) || !Array.isArray(active) || !managed.includes(name)) {
		return true;
	}
	return active.includes(name);
};
