import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import PatternCard from './PatternCard';
import { isPatternFavorite } from './filterHelpers';

function SkeletonCard() {
	return (
		<article className="sptp-ready-patterns-card is-skeleton" aria-hidden="true">
			<div className="sptp-ready-patterns-card-thumb" />
			<div className="sptp-ready-patterns-card-body">
				<div className="sptp-ready-patterns-skeleton-line" />
				<div className="sptp-ready-patterns-skeleton-btn" />
			</div>
		</article>
	);
}

// Scrollable pattern card grid with loading, empty, and error states.
export default function PatternGrid({
	loading,
	error,
	onRetry,
	items,
	gridDensity,
	onInsert,
	onPreview,
	insertingId,
	favorites,
	onToggleFavorite,
}) {
	if (error) {
		return (
			<div className="sptp-ready-patterns-state sptp-ready-patterns-state--error">
				<p>{__('Unable to load patterns. Please try again.', 'team-free')}</p>
				<Button variant="secondary" onClick={onRetry}>
					{__('Retry', 'team-free')}
				</Button>
			</div>
		);
	}

	if (loading && 0 === items.length) {
		return (
			<div className={`sptp-ready-patterns-grid cols-${gridDensity}`}>
				{Array.from({ length: 6 }).map((_unused, index) => (
					<SkeletonCard key={`skeleton-${index}`} />
				))}
			</div>
		);
	}

	if (!loading && 0 === items.length) {
		return (
			<div className="sptp-ready-patterns-state sptp-ready-patterns-state--empty">
				<p>{__('No patterns match your filters.', 'team-free')}</p>
			</div>
		);
	}

	return (
		<div
			className={`sptp-ready-patterns-grid cols-${gridDensity}`}
			role="list"
			aria-label={__('Ready Patterns', 'team-free')}
		>
			{items.map((pattern) => (
				<PatternCard
					key={pattern.id}
					pattern={pattern}
					onInsert={onInsert}
					onPreview={onPreview}
					insertingId={insertingId}
					isFavorite={isPatternFavorite(favorites, pattern)}
					onToggleFavorite={onToggleFavorite}
				/>
			))}
		</div>
	);
}
