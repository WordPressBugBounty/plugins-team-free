import { __ } from '@wordpress/i18n';

/**
 * Opens the block inserter on the Smart Team category when a new post is reached
 * with `?sptpblock_inserter=true` — the "Create a Saved Template" link on the
 * dashboard's Saved Templates tab. (The Ready Patterns deep link has its own
 * handler in shared/ready-patterns/deepLink.js.)
 *
 * The editor mounts asynchronously, so both the dispatch and the scroll are
 * polled rather than run once on load.
 */
const QUERY_PARAM = 'sptpblock_inserter';
const POLL_INTERVAL_MS = 100;
const OPEN_ATTEMPTS = 20;
const SCROLL_ATTEMPTS = 30;

window.addEventListener('load', function () {
	const url = new URL(window.location.href);

	if (!url.searchParams.has(QUERY_PARAM)) {
		return;
	}

	function tryScroll() {
		const headings = document.querySelectorAll('.block-editor-inserter__panel-title');
		const teamHeading = Array.from(headings).find(
			(heading) => heading.textContent.trim() === __('Smart Team', 'team-free')
		);

		if (!teamHeading) {
			return false;
		}

		teamHeading.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
			inline: 'nearest',
		});

		return true;
	}

	function tryOpenInserter() {
		const dispatch = window.wp?.data?.dispatch;
		if (!dispatch) {
			return false;
		}

		if (dispatch('core/editor')?.setIsInserterOpened) {
			dispatch('core/editor').setIsInserterOpened(true);
		} else if (dispatch('core/edit-post')?.setIsInserterOpened) {
			dispatch('core/edit-post').setIsInserterOpened(true);
		} else {
			return false;
		}

		// Strip it so a reload does not reopen the inserter.
		url.searchParams.delete(QUERY_PARAM);
		window.history.replaceState(null, '', url.toString());

		let scrollAttempts = 0;
		const scrollInterval = setInterval(() => {
			scrollAttempts++;
			if (tryScroll() || scrollAttempts > SCROLL_ATTEMPTS) {
				clearInterval(scrollInterval);
			}
		}, POLL_INTERVAL_MS);

		return true;
	}

	let attempts = 0;
	const interval = setInterval(() => {
		attempts++;
		if (tryOpenInserter() || attempts > OPEN_ATTEMPTS) {
			clearInterval(interval);
		}
	}, POLL_INTERVAL_MS);
});
