import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	FILTER_ALL,
	getReadyPatternsFavoritesPath,
	getReadyPatternsRestBase,
	SORT_DEFAULT,
	TIER_ALL,
} from './constants';
import {
	getVisiblePatterns,
	isPatternFavorite,
	tallyCategoryCounts,
	tallyTierCounts,
} from './filterHelpers';

/**
 * Fetch and filter the Ready Patterns manifest.
 *
 * @param {Object}  options
 * @param {boolean} options.isOpen Whether the modal is open (triggers initial fetch).
 * @return {Object} Library state and actions.
 */
export default function usePatternLibrary({ isOpen }) {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [hasFetched, setHasFetched] = useState(false);
	const [error, setError] = useState(null);
	const [tier, setTier] = useState(TIER_ALL);
	const [category, setCategory] = useState(FILTER_ALL);
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState(SORT_DEFAULT);
	const [gridDensity, setGridDensity] = useState(3);
	const [favorites, setFavorites] = useState([]);
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

	const fetchManifest = useCallback(async ({ force = false } = {}) => {
		setLoading(true);
		setError(null);
		try {
			const path = force
				? `${getReadyPatternsRestBase()}?force=1`
				: getReadyPatternsRestBase();
			const data = await apiFetch({ path });
			setItems(Array.isArray(data) ? data : []);
		} catch (fetchError) {
			setError(fetchError);
		} finally {
			setLoading(false);
			setHasFetched(true);
		}
	}, []);

	// Fetch once per session — an empty manifest is a valid result, not a
	// reason to refetch (guarding on items.length caused an infinite loop).
	useEffect(() => {
		if (isOpen && !hasFetched && !loading) {
			fetchManifest();
		}
	}, [isOpen, hasFetched, loading, fetchManifest]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		apiFetch({ path: getReadyPatternsFavoritesPath() })
			.then((response) => {
				if (Array.isArray(response?.favorites)) {
					setFavorites(response.favorites);
				}
			})
			.catch(() => {});
	}, [isOpen]);

	const toggleFavorite = useCallback(
		async (pattern) => {
			const key = pattern?.slug || pattern?.id;
			if (undefined === key || '' === key) {
				return;
			}

			const wasFavorite = isPatternFavorite(favorites, pattern);
			const optimistic = wasFavorite
				? favorites.filter(
						(entry) =>
							String(entry) !== String(key) && String(entry) !== String(pattern?.id)
					)
				: [...favorites, key];
			setFavorites(optimistic);
			try {
				const response = await apiFetch({
					path: getReadyPatternsFavoritesPath(),
					method: 'POST',
					data: {
						id: pattern?.id,
						slug: pattern?.slug || '',
						action: wasFavorite ? 'remove' : 'add',
					},
				});
				if (Array.isArray(response?.favorites)) {
					setFavorites(response.favorites);
				}
			} catch (favoriteError) {
				setFavorites(favorites);
			}
		},
		[favorites]
	);

	const clearFilters = useCallback(() => {
		setCategory(FILTER_ALL);
		setTier(TIER_ALL);
		setSearch('');
	}, []);

	const counts = useMemo(() => tallyCategoryCounts(items), [items]);
	const tierCounts = useMemo(() => tallyTierCounts(items), [items]);
	const visibleItems = useMemo(
		() =>
			getVisiblePatterns(items, {
				tier,
				category,
				search,
				sort,
				favoritesOnly: showFavoritesOnly,
				favorites,
			}),
		[items, tier, category, search, sort, showFavoritesOnly, favorites]
	);

	return {
		items,
		loading,
		error,
		tier,
		setTier,
		category,
		setCategory,
		clearFilters,
		search,
		setSearch,
		sort,
		setSort,
		gridDensity,
		setGridDensity,
		counts,
		tierCounts,
		visibleItems,
		favorites,
		toggleFavorite,
		showFavoritesOnly,
		setShowFavoritesOnly,
		fetchManifest,
		retry: () => fetchManifest(),
		refresh: () => fetchManifest({ force: true }),
	};
}
