/**
 * Single slot for the editor-level Pro upgrade dialog's opener (port of
 * wp-carousel-free's shared/pro-upgrade/openerRegistry.js).
 *
 * One host (`host.jsx`) registers into it; a Pro block calls
 * `openProUpgradeDialog` and never owns a dialog, because it removes itself
 * right after asking.
 */

let openHandler = null;

/**
 * Register the function that opens the dialog.
 *
 * @param {Function|null} handler Callback accepting `{ blockName? }`.
 * @return {Function} Cleanup that clears the slot while it still holds `handler`.
 */
export function setProUpgradeOpener(handler) {
	openHandler = handler;
	return () => {
		if (openHandler === handler) {
			openHandler = null;
		}
	};
}

/**
 * Whether a host is mounted; editor screens that render no plugins (the
 * widgets screen) have none.
 *
 * @return {boolean} True when `openProUpgradeDialog` can open it.
 */
export function hasProUpgradeOpener() {
	return null !== openHandler;
}

/**
 * Open the dialog from outside its tree.
 *
 * @param {Object} [options]
 * @param {string} [options.blockName] Pro block that asked for it.
 * @return {boolean} Whether a host was there to open it.
 */
export function openProUpgradeDialog(options = {}) {
	if (!openHandler) {
		return false;
	}
	openHandler(options);
	return true;
}
