/**
 * Loads the changelog for the header drawer on its FIRST open only; the result
 * is kept for the life of the page, so re-opening costs no request.
 */
import apiFetch from '@wordpress/api-fetch';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';

const CHANGELOG_ROUTE = '/sptp/v1/changelog';

const useChangelog = (shouldLoad) => {
	const [state, setState] = useState({ status: 'idle', changelog: '' }); // idle | loading | loaded | error
	const requested = useRef(false);
	const mounted = useRef(true);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const load = useCallback(() => {
		if (requested.current) {
			return;
		}
		requested.current = true;
		setState({ status: 'loading', changelog: '' });

		apiFetch({ path: CHANGELOG_ROUTE })
			.then((response) => {
				if (mounted.current) {
					setState({ status: 'loaded', changelog: response?.changelog || '' });
				}
			})
			.catch(() => {
				if (mounted.current) {
					// A failed fetch is not an answer: allow a retry.
					requested.current = false;
					setState({ status: 'error', changelog: '' });
				}
			});
	}, []);

	useEffect(() => {
		if (shouldLoad) {
			load();
		}
	}, [shouldLoad, load]);

	return { ...state, retry: load };
};

export default useChangelog;
