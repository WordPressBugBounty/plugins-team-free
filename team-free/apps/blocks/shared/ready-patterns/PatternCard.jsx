import { __ } from '@wordpress/i18n';
import {
	DownloadIcon,
	EyeIcon,
	HeartFilledIcon,
	HeartIcon,
	LogoMarkIcon,
	RefreshIcon,
} from './icons';
import { ProCrownIcon } from '../../../components/icons';
import { PATTERN_UPGRADE_URL } from './constants';
import { isFreePattern } from './filterHelpers';

/** Fallback thumbnail box size — the 3:2 aspect the thumbnail standard mandates. */
const THUMB_WIDTH = 600;
const THUMB_HEIGHT = 400;

/**
 * Single pattern card in the grid.
 *
 * A Pro pattern shows a crown "Pro" link to the upgrade page where a free one
 * offers Insert — the Real Testimonials Free treatment. Preview stays open to
 * every pattern; it is the upsell.
 *
 * @param {Object}   props
 * @param {Object}   props.pattern          Manifest item.
 * @param {Function} props.onInsert         Insert handler.
 * @param {Function} props.onPreview        Preview handler.
 * @param {*}        props.insertingId      ID of the pattern currently being inserted.
 * @param {boolean}  props.isFavorite       Whether this pattern is favorited.
 * @param {Function} props.onToggleFavorite Toggle-favorite handler.
 * @return {JSX.Element} Card markup.
 */
export default function PatternCard({
	pattern,
	onInsert,
	onPreview,
	insertingId,
	isFavorite,
	onToggleFavorite,
}) {
	const isBusy = insertingId === pattern.id;
	const isPro = !isFreePattern(pattern);
	const thumbOneX = pattern.thumb?.['1x'] || pattern.image || '';
	const thumbTwoX = pattern.thumb?.['2x'] || '';
	const thumbWidth = pattern.thumb?.w || THUMB_WIDTH;
	const thumbHeight = pattern.thumb?.h || THUMB_HEIGHT;

	return (
		<article
			className={`sptp-ready-patterns-card${pattern.dark ? ' is-dark' : ''}${isPro ? ' is-pro' : ''}`}
			role="listitem"
		>
			<div className="sptp-ready-patterns-card-thumb">
				{thumbOneX ? (
					<img
						src={thumbOneX}
						srcSet={thumbTwoX ? `${thumbOneX} 1x, ${thumbTwoX} 2x` : undefined}
						width={thumbWidth}
						height={thumbHeight}
						alt=""
						loading="lazy"
					/>
				) : (
					<span className="sptp-ready-patterns-card-thumb-placeholder">
						<LogoMarkIcon />
					</span>
				)}
				<button
					type="button"
					className="sptp-ready-patterns-preview-link"
					onClick={() => onPreview(pattern)}
				>
					<EyeIcon />
					{__('Preview', 'team-free')}
				</button>
			</div>
			<div className="sptp-ready-patterns-card-body">
				<h3 className="sptp-ready-patterns-card-title">{pattern.name}</h3>
				<button
					type="button"
					className={`sptp-ready-patterns-favorite-btn${isFavorite ? ' is-favorite' : ''}`}
					aria-label={
						isFavorite
							? __('Remove from favorites', 'team-free')
							: __('Add to favorites', 'team-free')
					}
					aria-pressed={isFavorite}
					onClick={() => onToggleFavorite(pattern)}
				>
					{isFavorite ? <HeartFilledIcon size={14} /> : <HeartIcon size={14} />}
				</button>
				{isPro ? (
					<a
						className="sptp-ready-patterns-pro-btn"
						href={PATTERN_UPGRADE_URL}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={__('Upgrade to Pro to insert this pattern', 'team-free')}
					>
						<ProCrownIcon color="#12a150" fill="none" size={14} />
						{__('Pro', 'team-free')}
					</a>
				) : (
					<button
						type="button"
						className={`sptp-ready-patterns-insert-btn${isBusy ? ' is-busy' : ''}`}
						onClick={() => onInsert(pattern)}
						disabled={isBusy}
					>
						{isBusy ? __('Inserting…', 'team-free') : __('Insert', 'team-free')}
						{isBusy ? <RefreshIcon /> : <DownloadIcon />}
					</button>
				)}
			</div>
		</article>
	);
}
