import { useEffect } from '@wordpress/element';

/**
 * Keep wp-admin's side menu pinned while this app's height changes.
 *
 * Core decides once, on load and on window resize, whether the menu is pinned
 * or scrolls with the page (`setPinMenu()` in wp-admin/js/common.js), by
 * comparing the menu's height with the page's. The dashboard mounts as a short
 * spinner and grows once its data arrives, so core measured a short page,
 * left the menu unpinned, and the menu then scrolls away leaving only its dark
 * backing. Core's own `wp-pin-menu` event re-runs that measurement.
 *
 * @param {Object} ref React ref to the element whose height changes.
 */
const usePinAdminMenu = (ref) => {
	useEffect(() => {
		const el = ref.current;
		const $ = window.jQuery;
		if (!el || !$ || 'undefined' === typeof ResizeObserver) {
			return undefined;
		}

		let frame = 0;
		const repin = () => {
			window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(() => $(document).trigger('wp-pin-menu'));
		};

		repin();
		const observer = new ResizeObserver(repin);
		observer.observe(el);

		return () => {
			window.cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [ref]);
};

export default usePinAdminMenu;
