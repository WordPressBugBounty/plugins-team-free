/**
 * Editor-level Ready Patterns host + "Patterns Library" header launcher.
 *
 * The button is a plain DOM node re-asserted on every `@wordpress/data` store
 * tick (idempotent: a present button short-circuits immediately). Gutenberg
 * exposes no official slot in the header toolbar, and swaps its toolbar
 * between responsive layouts, wiping any node appended there; re-adding a
 * plain node inside the same synchronous callback that discovers it missing
 * leaves no visible gap. A `createPortal`-based version would drive the
 * button through React state, so a wipe would leave the button gone until the
 * next render — visible as a flash — and a document.body-wide
 * MutationObserver would re-run that check on every unrelated editor DOM
 * mutation.
 *
 * The React tree registered via `registerPlugin` is the **only** owner of
 * `ReadyPatternsModal`. Blocks request the library through `openReadyPatterns`
 * and never host a modal of their own — which is why the host registers even
 * when the header button is withheld (the `sptp_ready_patterns_enabled` filter).
 */

import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { subscribe } from '@wordpress/data';
import ReadyPatternsModal from './ReadyPatternsModal';
import { isReadyPatternsLauncherEnabled } from './constants';
import { setReadyPatternsOpener, openReadyPatterns } from './openerRegistry';
import { maybeOpenFromDeepLink } from './deepLink';

const TOOLBAR_SELECTORS = ['.edit-post-header-toolbar', '.editor-header__toolbar'];
const SLOT_CLASS = 'sptp-ready-patterns-launcher-slot';
const BUTTON_CLASS = 'sptp-ready-patterns-launcher';
// Inlined mark (white fill — it sits on the brand-coloured button), the Smart
// Team glyph from apps/icons/icons.js (TeamCategoryIcon).
const LOGO_SVG =
	'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><g fill="#fff"><path d="M6.825 10.62v.091l-1.175.362c-.317.09-.724 1.13-1.04 2.666.994.588 2.215.95 3.39.95h.452c1.04-.09 2.079-.362 2.938-.904-.317-1.537-.678-2.577-1.04-2.667l-1.22-.407v-.09q0-.067-.136-.136l-.135-.09.09-.09c.09-.091.18-.227.226-.272.136-.18.271-.407.316-.633.046-.09.09-.18.09-.27v-.046h.046q.136-.135.136-.271V8.45c0-.09 0-.135-.09-.226v-.587c0-.814-.679-1.447-1.447-1.447h-.497c-.814 0-1.447.678-1.447 1.447v.587a.35.35 0 0 0-.09.226v.362c0 .09.045.226.136.271h.045v.045c0 .09.045.181.09.271.09.226.181.407.317.633.09.09.135.181.226.271l.09.09-.136.091z"/><path d="M3.977 13.331c.046-.18.09-.406.136-.587.452-1.853.904-2.215 1.31-2.305l.679-.181c-.09-.18-.226-.362-.272-.588a.34.34 0 0 0-.09-.18l-.723-.226v-.09q0-.069-.136-.136l-.135-.09.09-.091c.09-.09.136-.18.226-.271.136-.181.271-.407.316-.588.046-.09.09-.18.09-.271v-.045h.046q.135-.136.136-.271v-.362c0-.09 0-.136-.09-.226v-.588c0-.813-.679-1.446-1.447-1.446H3.57c-.814 0-1.447.678-1.447 1.446v.588a.35.35 0 0 0-.09.226v.362c0 .09.045.226.135.27h.046v.046c0 .09.045.18.09.271.09.226.18.407.316.633.09.09.136.18.226.271l.136.045-.136.09c-.09.046-.09.091-.135.136v.09l-1.175.362c.316 1.447 1.22 2.803 2.44 3.706M12.34 4.7h-.498c-.814 0-1.446.677-1.446 1.446v.587c-.046.09-.046.136-.046.226v.362c0 .09.046.226.136.27h.045v.046c.045.09.045.18.09.271.091.226.181.407.317.633.045.09.136.18.226.271l.09.09-.135.091c-.09.045-.09.09-.136.136v.09l-.723.226c0 .09-.045.136-.09.18-.09.182-.181.362-.272.588l.678.181c.407.09.86.497 1.311 2.305.045.226.09.407.136.633a7 7 0 0 0 1.04-.95c.677-.813 1.22-1.762 1.446-2.801l-1.175-.362v-.09q0-.068-.136-.136l-.226-.045.09-.09c.09-.091.136-.181.226-.272.136-.18.271-.407.317-.587a.64.64 0 0 0 .09-.272v-.045h.045q.136-.135.136-.27V7.05c0-.09 0-.136-.09-.226v-.588c0-.859-.633-1.537-1.447-1.537"/><path d="M8 16c-4.43 0-8-3.616-8-8 0-4.43 3.57-8 8-8s8 3.616 8 8c-.045 4.43-3.616 8-8 8M8 .814C4.068.814.859 4.068.859 8S4.068 15.141 8 15.141 15.141 11.932 15.141 8 11.932.814 8 .814"/></g></svg>';

// Set once the host React tree mounts; the imperative button below calls through it.
let openLibrary = () => {};

/**
 * Build the launcher button node (plain DOM). Opens the React-rendered modal.
 *
 * @return {HTMLElement} The clickable button element.
 */
function buildButton() {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = BUTTON_CLASS;
	// Trusted, hard-coded markup + a translated label added as a text node
	// (never interpolated into the HTML string), so there is no injection vector.
	button.innerHTML = LOGO_SVG;
	button.appendChild(document.createTextNode(__('Patterns Library', 'team-free')));
	button.addEventListener('click', () => openLibrary());
	return button;
}

/**
 * Ensure the launcher button is present in the current header toolbar. Cheap and
 * idempotent: returns immediately when the toolbar isn't mounted or the button
 * is already there, and otherwise appends a fresh plain-DOM node synchronously.
 */
function ensureToolbarButton() {
	const toolbar = TOOLBAR_SELECTORS.map((selector) => document.querySelector(selector)).find(
		Boolean
	);
	if (!toolbar || toolbar.querySelector(`.${SLOT_CLASS}`)) {
		return;
	}

	const wrapper = document.createElement('div');
	wrapper.className = SLOT_CLASS;
	wrapper.appendChild(buildButton());
	toolbar.appendChild(wrapper);
}

/**
 * Single editor-level host for the Ready Patterns modal.
 *
 * @return {JSX.Element} Modal owner.
 */
function ReadyPatternsHost() {
	const [isOpen, setIsOpen] = useState(false);
	const [targetClientId, setTargetClientId] = useState(null);
	const [requestedBlockName, setRequestedBlockName] = useState(null);

	useEffect(() => {
		const handler = ({ clientId = null, blockName = null } = {}) => {
			setTargetClientId(clientId || null);
			setRequestedBlockName(blockName || null);
			setIsOpen(true);
		};
		const unsubscribe = setReadyPatternsOpener(handler);
		// Header button: no explicit target (selection fallback runs at insert time).
		openLibrary = () => openReadyPatterns({});
		return () => {
			unsubscribe();
			openLibrary = () => {};
		};
	}, []);

	return (
		<ReadyPatternsModal
			isOpen={isOpen}
			onClose={() => setIsOpen(false)}
			targetClientId={targetClientId}
			requestedBlockName={requestedBlockName}
		/>
	);
}

export function registerReadyPatternsLauncher() {
	// The host is the only owner of the modal, and a block's own request into
	// the library reaches it through openReadyPatterns() — so it always mounts.
	registerPlugin('sptp-ready-patterns-launcher', {
		render: ReadyPatternsHost,
	});

	// A Pro block's "View Demo" link lands here. Runs before the launcher
	// check so the deep link works with the header button switched off.
	maybeOpenFromDeepLink();

	// The header shortcut alone is switchable: turning it off clears the
	// editor toolbar while the library stays reachable through openReadyPatterns().
	if (!isReadyPatternsLauncherEnabled()) {
		return;
	}
	// Re-assert the button on every editor store change. Re-renders/remounts that
	// drop the node are corrected on the next tick; a present button short-circuits.
	subscribe(ensureToolbarButton);
	ensureToolbarButton();
}
