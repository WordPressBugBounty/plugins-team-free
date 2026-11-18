/**
 * useMembers — editor data hook for member-driven blocks.
 *
 * Mirrors Real Testimonials Pro's useApiData: fetches normalized member data
 * from the block REST route (`sptp/v1/members`) so the editor canvas shows a
 * live preview. apiFetch supplies the REST nonce automatically in wp-admin. The
 * frontend does NOT use this — it renders server-side via Grid::render_block().
 */

import { useEffect, useState, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
import demoMembers from '../blocks/shared/demo-members.json';

// Flatten a MultipleSelect value (option objects or ids) to a comma-separated
// id list for the REST query.
const optionIdsCsv = (items) =>
	Array.isArray(items)
		? items
				.map((i) => (i && typeof i === 'object' ? (i.value ?? i.id) : i))
				.filter(Boolean)
				.join(',')
		: '';

// WordPress stores term names / titles HTML-entity encoded (`&` → `&amp;`).
// The PHP renderer prints them into HTML where the browser decodes them, but
// React escapes text nodes, so the editor would show the raw entity — decode
// every string in the payload once here.
const decodeDeep = (value) => {
	if (typeof value === 'string') {
		return decodeEntities(value);
	}
	if (Array.isArray(value)) {
		return value.map(decodeDeep);
	}
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, decodeDeep(item)])
		);
	}
	return value;
};

const useMembers = (attributes) => {
	const { excludesItems, limit, orderBy, order, enableRandomOrder } = attributes;

	const [state, setState] = useState({
		members: [],
		total: 0,
		loading: true,
		error: '',
		isDemoMembers: false,
	});

	// Filter Members is always Latest in Free (Taxonomies/Specific are Pro),
	// matching MemberQuery::build_args_from_attributes().
	const exclude = optionIdsCsv(excludesItems);

	const queryData = useMemo(
		() => ({
			per_page: limit || 6,
			exclude,
			orderby: orderBy || 'date',
			order: order || 'desc',
			random: enableRandomOrder ? '1' : '',
		}),
		[limit, exclude, orderBy, order, enableRandomOrder]
	);

	useEffect(() => {
		let isMounted = true;
		setState((prev) => ({ ...prev, loading: true }));

		const params = new URLSearchParams();
		Object.entries(queryData).forEach(([key, value]) => {
			if (value) {
				params.append(key, value);
			}
		});

		apiFetch({ path: `/sptp/v1/members?${params.toString()}`, method: 'GET' })
			.then((response) => {
				if (!isMounted) {
					return;
				}
				const fetched = response.data || [];
				// Editor-only fallback so a site with no members yet can still judge
				// the card designs. Free has no Groups/Specific filter, so an empty
				// result always means a missing team.
				const isDemoMembers = fetched.length === 0;
				const demo =
					queryData.per_page > 0 ? demoMembers.slice(0, queryData.per_page) : demoMembers;
				setState({
					members: isDemoMembers ? demo : decodeDeep(fetched),
					total: isDemoMembers ? demo.length : response.total || 0,
					loading: false,
					error: '',
					isDemoMembers,
				});
			})
			.catch((err) => {
				if (!isMounted) {
					return;
				}
				setState({
					members: [],
					total: 0,
					loading: false,
					error: err.message || 'Failed to fetch members',
					isDemoMembers: false,
				});
			});

		return () => {
			isMounted = false;
		};
	}, [queryData]);

	return state;
};

export default useMembers;
