/**
 * useGoogleFontApi — returns the Google Fonts catalog for the Typography control.
 *
 * Fetches the Google Webfonts API once (same source as Real Testimonials Pro)
 * and maps each entry to the `{ label, value, font: { family, variants } }`
 * shape the font-family Select expects. The catalog is cached module-wide so
 * multiple Typography instances share one request.
 */

import { useEffect, useState } from '@wordpress/element';
import { isGoogleFontsEnabled } from '../utils/googleFonts.js';

const GOOGLE_FONTS_API_URL =
	'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCJIzfKoHlACqsmK1zDzl-OAsgtJPk8BtI';

let catalogCache = null;
let catalogRequest = null;

const fetchGoogleFonts = () => {
	if (catalogCache) {
		return Promise.resolve(catalogCache);
	}
	if (!catalogRequest) {
		catalogRequest = fetch(GOOGLE_FONTS_API_URL)
			.then((response) => (response.status === 200 ? response.json() : { items: [] }))
			.then((data) => {
				catalogCache = (data?.items || []).map((item) => ({
					label: item.family,
					value: item.family,
					font: { family: item.family, variants: item.variants },
				}));
				return catalogCache;
			})
			.catch((error) => {
				// eslint-disable-next-line no-console
				console.error('Error fetching Google Fonts:', error);
				catalogRequest = null;
				return [];
			});
	}
	return catalogRequest;
};

const useGoogleFonts = () => {
	const [googleFonts, setGoogleFonts] = useState(catalogCache || []);

	useEffect(() => {
		if (!isGoogleFontsEnabled() || googleFonts.length > 0) {
			return undefined;
		}
		let isMounted = true;
		fetchGoogleFonts().then((fonts) => {
			if (isMounted && fonts.length > 0) {
				setGoogleFonts(fonts);
			}
		});
		return () => {
			isMounted = false;
		};
	}, []);

	return { googleFonts, isEnabled: isGoogleFontsEnabled() };
};

export default useGoogleFonts;
