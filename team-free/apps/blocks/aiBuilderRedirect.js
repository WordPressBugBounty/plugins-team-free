import { AI_BUILDER_QUERY_PARAM } from './shared/aiBuilderDeepLink';
import { openAIBuilder } from './shared/ai-builder/openerRegistry';

/**
 * Opens the AI Team Builder when a new page is reached through its deep link
 * (`?sptp_ai_builder`, the dashboard's "Build with AI" button). Ported from
 * Pro's redirect.js, which also carries its inserter / pattern deep links —
 * Free keeps those in redirect.js and ready-patterns/deepLink.js.
 */
const START_PAGE_MODAL = '.editor-start-page-options__modal';
const POLL_INTERVAL_MS = 100;
const EDITOR_WAIT_MS = 15000;
// Core renders the "Choose a pattern" modal a beat after the editor is ready, and not at all when no pattern fits the post type.
const START_PAGE_WAIT_MS = 1500;

/**
 * Whether core is about to show its "Choose a pattern" modal — the same test
 * its StartPageOptions component makes: the preference on and a fresh, empty post.
 *
 * @return {?boolean} Null while the editor has not loaded its post yet.
 */
function expectsStartPageModal() {
	const { select } = window.wp?.data || {};
	const editor = select?.('core/editor');
	if (!editor?.getCurrentPostType?.()) {
		return null;
	}
	const enabled = select('core/preferences')?.get('core', 'enableChoosePatternModal');
	return Boolean(enabled) && editor.isEditedPostEmpty();
}

/**
 * Run `open` once the editor is free to show a modal. A core Modal closes when
 * focus leaves it, so a modal opened on a fresh page is closed at once by the
 * "Choose a pattern" modal core opens there; that one is dismissed for this
 * visit (the preference is untouched) before `open` runs.
 *
 * @param {Function} open Opens the deep-linked modal.
 */
function openWhenEditorIsFree(open) {
	const startedAt = Date.now();
	let waitStartPageUntil = 0;

	const timer = setInterval(() => {
		const startModal = document.querySelector(START_PAGE_MODAL);
		if (startModal) {
			clearInterval(timer);
			startModal.querySelector('.components-modal__header button')?.click();
			// Let core finish unmounting it, so focus is not pulled away from ours.
			setTimeout(open, 0);
			return;
		}

		const expected = expectsStartPageModal();
		if (null === expected && Date.now() - startedAt < EDITOR_WAIT_MS) {
			return;
		}
		if (expected && !waitStartPageUntil) {
			waitStartPageUntil = Date.now() + START_PAGE_WAIT_MS;
		}
		if (expected && Date.now() < waitStartPageUntil) {
			return;
		}

		clearInterval(timer);
		open();
	}, POLL_INTERVAL_MS);
}

window.addEventListener('load', function () {
	const url = new URL(window.location.href);

	if (!url.searchParams.has(AI_BUILDER_QUERY_PARAM)) {
		return;
	}

	// Strip first so a reload does not reopen the modal.
	url.searchParams.delete(AI_BUILDER_QUERY_PARAM);
	window.history.replaceState(null, '', url.toString());
	openWhenEditorIsFree(() => openAIBuilder({}));
});
