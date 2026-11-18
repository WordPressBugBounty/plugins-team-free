/**
 * Module-level opener registry for the editor-level Ready Patterns host.
 *
 * Exactly one host registers into this slot. Blocks call `openReadyPatterns`
 * and never own a modal instance.
 *
 * A request can arrive before the host has mounted — a deep link fires from the
 * page `load` event while the editor is still booting — so the latest such
 * request is parked and handed to the host the moment it registers. It is
 * delivered once; a later re-registration never replays it.
 */

let openHandler = null;
let pendingRequest = null;

/**
 * Register the function that opens the Ready Patterns modal.
 *
 * Returns an unsubscribe that clears the slot only when it still points at
 * this handler, so a future second host cannot blank a newer registration.
 *
 * @param {Function|null} handler Callback accepting `{ clientId?, blockName? }`.
 * @return {Function} Cleanup that clears the slot when still owned by `handler`.
 */
export function setReadyPatternsOpener(handler) {
	openHandler = handler;
	if (handler && pendingRequest) {
		const request = pendingRequest;
		pendingRequest = null;
		handler(request);
	}
	return () => {
		if (openHandler === handler) {
			openHandler = null;
		}
	};
}

/**
 * Open the Ready Patterns library from outside the modal tree.
 *
 * Before a host registers, the request is parked (last one wins) and delivered
 * on registration.
 *
 * @param {Object} [options]
 * @param {string} [options.clientId]  Target block client id (omit for no explicit target).
 * @param {string} [options.blockName] Optional sugar for the initial category.
 */
export function openReadyPatterns(options = {}) {
	if (openHandler) {
		openHandler(options);
		return;
	}
	pendingRequest = options;
}
