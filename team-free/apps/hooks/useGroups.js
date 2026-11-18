/**
 * useGroups — fetches term options for a filterable member taxonomy.
 *
 * Returns `{ value: term_id, label: name }[]` from the /sptp/v1/groups block
 * REST route. `taxonomy` is optional and whitelisted server-side
 * (sptp_group | sptp_designation | sptp_location | sptp_gender); omitted =
 * sptp_group (department). Editor-only (nonce auto-supplied by apiFetch in
 * wp-admin). Used by the four taxonomy filter blocks' previews + their Show
 * Terms include/exclude selects.
 */

import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

const useGroups = (taxonomy = '') => {
	const [groups, setGroups] = useState([]);

	useEffect(() => {
		let isMounted = true;

		const path = taxonomy ? addQueryArgs('/sptp/v1/groups', { taxonomy }) : '/sptp/v1/groups';

		apiFetch({ path })
			.catch(() => [])
			.then((options) => {
				if (isMounted) {
					setGroups(Array.isArray(options) ? options : []);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [taxonomy]);

	return groups;
};

export default useGroups;
