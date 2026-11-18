import { useEffect } from '@wordpress/element';

/* Dashboard pages with their own wp-admin sidebar entry, keyed by the hash
   their link carries. Every other page belongs to "Getting Started". */
const SIDEBAR_PAGES = ['settings'];

/**
 * Mark the matching wp-admin sidebar entry current as the dashboard changes page.
 *
 * The sidebar has two links into this app — "Getting Started" and "Settings"
 * (`…#settings=integrations`) — and the URL hash
 * never reaches PHP, so core always marks "Getting Started" current. Move the
 * marker client-side instead.
 *
 * @param {string} page Active dashboard page value.
 */
const useSubmenuHighlight = (page) => {
	useEffect(() => {
		const links = document.querySelectorAll(
			'#adminmenu .wp-submenu a[href*="page=sptp_dashboard"]'
		);
		const owner = SIDEBAR_PAGES.includes(page) ? page : null;

		links.forEach((link) => {
			const hash = (link.getAttribute('href') || '').split('#')[1] || '';
			const linkPage = SIDEBAR_PAGES.find((item) => item === hash.split('=')[0]) || null;
			const isCurrent = owner === linkPage;

			link.classList.toggle('current', isCurrent);
			link.parentElement?.classList.toggle('current', isCurrent);
			if (isCurrent) {
				link.setAttribute('aria-current', 'page');
			} else {
				link.removeAttribute('aria-current');
			}
		});
	}, [page]);
};

export default useSubmenuHighlight;
