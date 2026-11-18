/**
 * Editor-level AI Team Builder host + "Create with AI" header launcher.
 *
 * Same plain-DOM, store-tick re-assert approach as the Ready Patterns
 * launcher (see ready-patterns/toolbarButton.jsx for why): Gutenberg has no
 * header slot and swaps its toolbar between layouts, wiping appended nodes.
 */

import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { subscribe } from '@wordpress/data';
import AIBuilderModal from './AIBuilderModal';
import { isAIBuilderEnabled } from './constants';
import { setAIBuilderOpener, openAIBuilder } from './openerRegistry';

const TOOLBAR_SELECTORS = ['.edit-post-header-toolbar', '.editor-header__toolbar'];
const SLOT_CLASS = 'sptp-ai-builder-launcher-slot';
const BUTTON_CLASS = 'sptp-ai-builder-launcher';
// Sparkle glyph — trusted, hard-coded markup; the label is added as a text node.
const SPARKLE_SVG =
	'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 2.5c.3 0 .5.2.6.5.9 4 3.4 6.5 7.4 7.4.3.1.5.3.5.6s-.2.5-.5.6c-4 .9-6.5 3.4-7.4 7.4-.1.3-.3.5-.6.5s-.5-.2-.6-.5c-.9-4-3.4-6.5-7.4-7.4-.3-.1-.5-.3-.5-.6s.2-.5.5-.6c4-.9 6.5-3.4 7.4-7.4.1-.3.3-.5.6-.5Z" fill="currentColor"/><path d="M19 15.5c.2 0 .3.1.4.3.3 1.3 1.1 2.1 2.4 2.4.2.1.3.2.3.4s-.1.3-.3.4c-1.3.3-2.1 1.1-2.4 2.4-.1.2-.2.3-.4.3s-.3-.1-.4-.3c-.3-1.3-1.1-2.1-2.4-2.4-.2-.1-.3-.2-.3-.4s.1-.3.3-.4c1.3-.3 2.1-1.1 2.4-2.4.1-.2.2-.3.4-.3Z" fill="currentColor"/></svg>';

let openModal = () => {};

function buildButton() {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = BUTTON_CLASS;
	button.innerHTML = SPARKLE_SVG;
	button.appendChild(document.createTextNode(__('Build with AI', 'team-free')));
	button.addEventListener('click', () => openModal());
	return button;
}

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

function AIBuilderHost() {
	const [isOpen, setIsOpen] = useState(false);
	const [targetClientId, setTargetClientId] = useState(null);
	const [requestedBlockName, setRequestedBlockName] = useState(null);
	const [isRefining, setIsRefining] = useState(false);

	useEffect(() => {
		const unsubscribe = setAIBuilderOpener(
			({ clientId = null, blockName = null, isRefining: refining = false } = {}) => {
				setTargetClientId(clientId || null);
				setRequestedBlockName(blockName || null);
				setIsRefining(refining);
				setIsOpen(true);
			}
		);
		openModal = () => openAIBuilder({});
		return () => {
			unsubscribe();
			openModal = () => {};
		};
	}, []);

	return (
		<AIBuilderModal
			isOpen={isOpen}
			onClose={() => setIsOpen(false)}
			targetClientId={targetClientId}
			requestedBlockName={requestedBlockName}
			isRefining={isRefining}
		/>
	);
}

export function registerAIBuilderLauncher() {
	// A switched-off module gets no launcher and no host, which is what makes
	// openAIBuilder() inert for every other entry point too.
	if (!isAIBuilderEnabled()) {
		return;
	}
	registerPlugin('sptp-ai-builder-launcher', { render: AIBuilderHost });
	subscribe(ensureToolbarButton);
	ensureToolbarButton();
}
