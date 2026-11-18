/**
 * useDetailsTemplates — where the member single page is edited.
 *
 * Fetches `sptp/v1/details-templates` (Member_REST). `singlePageUrl` is the
 * Site Editor screen for the "Single Item: Member" template
 * (Blocks\Includes\MemberTemplate) behind the Member Details panel's
 * "Configure Single Page Template" link — '' on classic themes, where the
 * panel hides it. Pro's same route also lists the modal details templates;
 * the modal is Pro-only, so Free's response carries only the URL.
 *
 * Cached at module level (like useGoogleFontApi) — every layout block's
 * inspector shares one request per page load.
 */

import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const FALLBACK = {
	singlePageUrl: '',
};

let cached = null;
let request = null;

const useDetailsTemplates = () => {
	const [data, setData] = useState(cached || FALLBACK);

	useEffect(() => {
		if (cached) {
			return undefined;
		}

		let active = true;

		if (!request) {
			request = apiFetch({ path: '/sptp/v1/details-templates' });
		}

		request
			.then((response) => {
				cached = {
					singlePageUrl: response?.singlePageEditUrl || '',
				};
				if (active) {
					setData(cached);
				}
			})
			.catch(() => {
				// Keep the fallback — the panel still works, the link just waits.
				request = null;
			});

		return () => {
			active = false;
		};
	}, []);

	return data;
};

export default useDetailsTemplates;
