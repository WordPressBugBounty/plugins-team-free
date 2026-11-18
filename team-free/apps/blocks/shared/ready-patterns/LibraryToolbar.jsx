import { __ } from '@wordpress/i18n';
import {
	GRID_DENSITY_THREE,
	GRID_DENSITY_TWO,
	SORT_DEFAULT,
	SORT_LATEST,
	SORT_POPULAR,
} from './constants';
import {
	ChevronDownIcon,
	GridThreeIcon,
	GridTwoIcon,
	HeartFilledIcon,
	HeartIcon,
	RefreshIcon,
} from './icons';

// Toolbar above the pattern grid.
export default function LibraryToolbar({
	sort,
	onSortChange,
	gridDensity,
	onGridDensityChange,
	favoritesCount,
	showFavoritesOnly,
	onToggleFavoritesView,
	onRefresh,
	refreshing,
}) {
	return (
		<div className="sptp-ready-patterns-toolbar">
			<div className="sptp-ready-patterns-sort">
				<span className="sptp-ready-patterns-sort-label" aria-hidden="true">
					{__('Sort By', 'team-free')}
				</span>
				<span className="sptp-ready-patterns-sort-chevron" aria-hidden="true">
					<ChevronDownIcon />
				</span>
				<select
					className="sptp-ready-patterns-sort-select"
					aria-label={__('Sort By', 'team-free')}
					value={sort}
					onChange={(event) => onSortChange(event.target.value)}
				>
					<option value={SORT_DEFAULT}>{__('Default', 'team-free')}</option>
					<option value={SORT_POPULAR}>{__('Popular', 'team-free')}</option>
					<option value={SORT_LATEST}>{__('Latest', 'team-free')}</option>
				</select>
			</div>

			<div className="sptp-ready-patterns-toolbar-actions">
				<div className="sptp-ready-patterns-density">
					<button
						type="button"
						className={`sptp-ready-patterns-density-btn${GRID_DENSITY_TWO === gridDensity ? ' is-active' : ''}`}
						aria-label={__('2 columns', 'team-free')}
						aria-pressed={GRID_DENSITY_TWO === gridDensity}
						onClick={() => onGridDensityChange(GRID_DENSITY_TWO)}
					>
						<GridTwoIcon />
					</button>
					<button
						type="button"
						className={`sptp-ready-patterns-density-btn${GRID_DENSITY_THREE === gridDensity ? ' is-active' : ''}`}
						aria-label={__('3 columns', 'team-free')}
						aria-pressed={GRID_DENSITY_THREE === gridDensity}
						onClick={() => onGridDensityChange(GRID_DENSITY_THREE)}
					>
						<GridThreeIcon />
					</button>
				</div>

				<button
					type="button"
					className={`sptp-ready-patterns-favorites-btn${showFavoritesOnly ? ' is-active' : ''}`}
					aria-label={__('Show favorite patterns', 'team-free')}
					aria-pressed={showFavoritesOnly}
					onClick={onToggleFavoritesView}
				>
					{showFavoritesOnly ? <HeartFilledIcon /> : <HeartIcon />}
					{favoritesCount > 0 && (
						<span className="sptp-ready-patterns-favorites-count">
							{favoritesCount}
						</span>
					)}
				</button>
				<button
					type="button"
					className={`sptp-ready-patterns-refresh-btn${refreshing ? ' is-refreshing' : ''}`}
					aria-label={__('Refresh patterns', 'team-free')}
					onClick={onRefresh}
					disabled={refreshing}
				>
					<RefreshIcon />
				</button>
			</div>
		</div>
	);
}
