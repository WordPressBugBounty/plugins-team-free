import { __ } from '@wordpress/i18n';
import {
	categoryLabels,
	CATEGORY_SLUGS,
	FILTER_ALL,
	TIER_ALL,
	TIER_FREE,
	TIER_PREMIUM,
} from './constants';
import { CATEGORY_ICONS } from './blockIcons';
import { CloseIcon, SearchIcon } from './icons';

/**
 * One facet row: label, optional icon, count badge, active state.
 *
 * @param {Object}        props
 * @param {string}        props.label    Row label.
 * @param {Function|null} props.icon     Optional icon component.
 * @param {number}        props.count    Item count badge.
 * @param {boolean}       props.isActive Whether this row is selected.
 * @param {Function}      props.onSelect Click handler.
 * @return {JSX.Element} Row button.
 */
function FacetRow({ label, icon: Icon, count, isActive, onSelect }) {
	return (
		<button
			type="button"
			className={`sptp-ready-patterns-category${isActive ? ' is-active' : ''}`}
			aria-pressed={isActive}
			onClick={onSelect}
		>
			{Icon ? (
				<span className="sptp-ready-patterns-category-icon">
					<Icon />
				</span>
			) : null}
			<span className="sptp-ready-patterns-category-label">{label}</span>
			<span className="sptp-ready-patterns-badge">{count ?? 0}</span>
		</button>
	);
}

/**
 * Left sidebar: tier filter, search, and the block-type axis.
 *
 * No use-case or tag facet: tags still widen search matching (see
 * `filterHelpers.js`'s `searchHaystack`), but have no browsable row here.
 *
 * @param {Object}   props
 * @param {string}   props.tier             Active tier filter.
 * @param {Function} props.onTierChange     Tier change handler.
 * @param {string}   props.search           Search query.
 * @param {Function} props.onSearchChange   Search change handler.
 * @param {string}   props.category         Active block-axis filter.
 * @param {Function} props.onCategoryChange Category change handler.
 * @param {Object}   props.counts           Block-axis item counts.
 * @param {Object}   props.tierCounts       Tier item counts.
 * @param {Function} props.onClearFilters   Clear-all handler.
 * @return {JSX.Element} Sidebar markup.
 */
export default function Sidebar({
	tier,
	onTierChange,
	search,
	onSearchChange,
	category,
	onCategoryChange,
	counts,
	tierCounts,
	onClearFilters,
}) {
	const tierOptions = [
		{ value: TIER_ALL, label: __('All', 'team-free') },
		{ value: TIER_FREE, label: __('Free', 'team-free') },
		{ value: TIER_PREMIUM, label: __('Pro', 'team-free') },
	];

	const labels = categoryLabels();
	const activeSelections = [
		FILTER_ALL !== category
			? {
					key: `category:${category}`,
					label: labels[category] || category,
					onRemove: () => onCategoryChange(FILTER_ALL),
				}
			: null,
	].filter(Boolean);

	return (
		<aside className="sptp-ready-patterns-sidebar">
			<div className="sptp-ready-patterns-tier">
				{tierOptions.map((option) => (
					<button
						key={option.value}
						type="button"
						className={`sptp-ready-patterns-tier-btn${option.value === tier ? ' is-active' : ''}`}
						aria-pressed={option.value === tier}
						onClick={() => onTierChange(option.value)}
					>
						{option.label}
						<span className="sptp-ready-patterns-tier-count">
							{tierCounts?.[option.value] ?? 0}
						</span>
					</button>
				))}
			</div>

			<div className="sptp-ready-patterns-search">
				<label className="screen-reader-text" htmlFor="sptp-ready-patterns-search-input">
					{__('Search patterns', 'team-free')}
				</label>
				<SearchIcon />
				<input
					type="search"
					id="sptp-ready-patterns-search-input"
					className="sptp-ready-patterns-search-input"
					placeholder={__('Search patterns', 'team-free')}
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
				/>
			</div>

			{activeSelections.length > 0 ? (
				<div className="sptp-ready-patterns-active-filters">
					<h3 className="sptp-ready-patterns-sidebar-heading">
						{__('Active Filters', 'team-free')}
					</h3>
					<ul className="sptp-ready-patterns-active-list">
						{activeSelections.map((selection) => (
							<li key={selection.key}>
								<button
									type="button"
									className="sptp-ready-patterns-active-chip"
									onClick={selection.onRemove}
								>
									<span>{selection.label}</span>
									<CloseIcon size={10} />
								</button>
							</li>
						))}
					</ul>
					<button
						type="button"
						className="sptp-ready-patterns-clear-filters"
						onClick={onClearFilters}
					>
						{__('Clear all', 'team-free')}
					</button>
				</div>
			) : null}

			<h3 className="sptp-ready-patterns-sidebar-heading">{__('Block Type', 'team-free')}</h3>
			<nav
				className="sptp-ready-patterns-categories"
				aria-label={__('Pattern categories', 'team-free')}
			>
				<FacetRow
					label={labels.all}
					count={counts?.all ?? 0}
					isActive={FILTER_ALL === category}
					onSelect={() => onCategoryChange(FILTER_ALL)}
				/>
				{CATEGORY_SLUGS.map((slug) => (
					<FacetRow
						key={slug}
						label={labels[slug]}
						icon={CATEGORY_ICONS[slug]}
						count={counts?.[slug] ?? 0}
						isActive={slug === category}
						onSelect={() => onCategoryChange(slug)}
					/>
				))}
			</nav>
		</aside>
	);
}
