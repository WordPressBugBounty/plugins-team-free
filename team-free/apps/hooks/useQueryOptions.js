/**
 * useQueryOptions — fetches the member option list for the Query Builder's
 * Exclude Members select.
 *
 * Returns `{ value, label }[]` from the block REST route. Editor-only; nonce
 * auto-supplied by apiFetch in wp-admin. The Taxonomies / Specific pickers are
 * Pro, so Free fetches no group options and never scopes the list by group.
 */

import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const useQueryOptions = () => {
	const [memberOptions, setMemberOptions] = useState([]);

	useEffect(() => {
		let isMounted = true;

		apiFetch({ path: '/sptp/v1/member-options' })
			.catch(() => [])
			.then((members) => {
				if (isMounted) {
					setMemberOptions(Array.isArray(members) ? members : []);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	return { memberOptions };
};

export default useQueryOptions;
