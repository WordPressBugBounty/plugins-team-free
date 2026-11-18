import { useEffect } from '@wordpress/element';

/**
 * Stretch this app to at least the height of wp-admin's side menu.
 *
 * `admin-footer.php` closes `#wpcontent` with a `.clear` div, which clears the
 * floated `#adminmenuwrap` — so the page is never shorter than the menu. When
 * the menu outgrows the window (a laptop, a site with many plugins), the space
 * it adds below a viewport-tall app shows as a bare grey strip under the
 * dashboard's footer. Publishing the menu's reach as `--sptp-admin-menu-height`
 * lets the CSS min-height cover it, so the footer sits at the real bottom.
 *
 * Set on the mount point, not the app root: the wizard swaps the root element,
 * the mount point stays, and the property inherits down to either.
 */
const useAdminMenuHeight = () => {
	useEffect(() => {
		const el = document.getElementById('sptp-admin-dashboard-wrapper');
		const menu = document.getElementById('adminmenuwrap');
		const wrap = document.getElementById('wpwrap');
		if (!el || !menu || !wrap || 'undefined' === typeof ResizeObserver) {
			return undefined;
		}

		let frame = 0;
		const measure = () => {
			window.cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(() => {
				// offsetHeight ignores core's fixed/absolute pinning; the app's
				// offset inside #wpwrap is what already sits above it.
				const offset = el.getBoundingClientRect().top - wrap.getBoundingClientRect().top;
				const reach = Math.max(0, Math.ceil(menu.offsetHeight - offset));
				el.style.setProperty('--sptp-admin-menu-height', `${reach}px`);
			});
		};

		measure();
		// The menu changes height when it folds or a submenu opens.
		const observer = new ResizeObserver(measure);
		observer.observe(menu);
		window.addEventListener('resize', measure);

		return () => {
			window.cancelAnimationFrame(frame);
			observer.disconnect();
			window.removeEventListener('resize', measure);
		};
	}, []);
};

export default useAdminMenuHeight;
