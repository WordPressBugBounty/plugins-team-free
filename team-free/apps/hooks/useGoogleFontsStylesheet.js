/**
 * useGoogleFontsStylesheet — inject/update a Google Fonts <link> in the editor.
 *
 * No-op when `url` is empty (e.g. Google Fonts disabled). Keyed by `id` so each
 * Typography instance manages its own stylesheet link without clobbering others.
 */

import { useEffect } from '@wordpress/element';

const useGoogleFontsStylesheet = (url, id) => {
	useEffect(() => {
		if (!url || !id) {
			return undefined;
		}

		const linkId = `sp-smart-team-gfont-${id}`;
		let link = document.getElementById(linkId);

		if (!link) {
			link = document.createElement('link');
			link.id = linkId;
			link.rel = 'stylesheet';
			document.head.appendChild(link);
		}
		link.href = url;

		return undefined;
	}, [url, id]);
};

export default useGoogleFontsStylesheet;
