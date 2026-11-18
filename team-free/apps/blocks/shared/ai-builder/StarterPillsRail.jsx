import { __ } from '@wordpress/i18n';
import { useRef } from '@wordpress/element';
import { getInsertableLayoutBlocks } from './constants';

/**
 * Starter prompts, offered as a horizontally-scrolling pill rail.
 *
 * Each prompt is worded in the Ready Patterns catalog's own vocabulary — its
 * use cases (leadership team, staff directory, speaker lineup, board of
 * directors, hiring page) and tags (dark, boxed, social icons)
 * — so `AIPatternMatcher` can shortlist a real pattern for it. Settings words
 * (column counts, speeds) score nothing there and stay out. Free's set asks
 * only for what the free blocks render: no 3D Carousel or overlay cards, contact rows, member
 * search, Read More or centred carousel style.
 *
 * `label` is the short pill text; `prompt` is what reaches the AI;
 * `blockName` steers the target block when no block is open for editing.
 */
const STARTER_PROMPTS = [
	{
		label: __('Leadership Team', 'team-free'),
		prompt: 'A leadership team grid with circular photos, short bios and social icons.',
		blockName: 'sptp/grid',
	},
	{
		label: __('Staff Directory', 'team-free'),
		prompt: 'A compact four-column staff directory grid with names and job titles.',
		blockName: 'sptp/grid',
	},
	{
		label: __('Team Carousel', 'team-free'),
		prompt: 'An autoplay team carousel with boxed cards and a soft card shadow.',
		blockName: 'sptp/carousel',
	},
	{
		label: __('Board of Directors', 'team-free'),
		prompt: 'A boxed board of directors grid with photos beside each name and position.',
		blockName: 'sptp/grid',
	},
	{
		label: __('Hiring Page', 'team-free'),
		prompt: 'A full-width team grid for our careers page with a Load More button.',
		blockName: 'sptp/grid',
	},
	{
		label: __('Dark Carousel', 'team-free'),
		prompt: 'A dark team slider with white text, navigation arrows and pagination dots.',
		blockName: 'sptp/carousel',
	},
	{
		label: __('About Us', 'team-free'),
		prompt: 'An about us team grid with circular photos, name, position and social icons.',
		blockName: 'sptp/grid',
	},
	{
		label: __('Department Page', 'team-free'),
		prompt: 'A department page team grid with name, position and a short bio for everyone.',
		blockName: 'sptp/grid',
	},
	{
		label: __('Agency Team', 'team-free'),
		prompt: 'An agency team grid with square photos, short bios and social icons.',
		blockName: 'sptp/grid',
	},
	{
		label: __('Speaker Lineup', 'team-free'),
		prompt: 'A speaker lineup carousel with circular photos, job titles and short bios.',
		blockName: 'sptp/carousel',
	},
	{
		label: __('Paged Directory', 'team-free'),
		prompt: 'A staff directory grid with names, job titles and numbered pagination.',
		blockName: 'sptp/grid',
	},
	{
		label: __('3D Cube Carousel', 'team-free'),
		prompt: 'A team carousel with a cube slide effect, social icons and pagination dots.',
		blockName: 'sptp/carousel',
	},
];

export default function StarterPillsRail({ onSelectPrompt }) {
	const railRef = useRef(null);

	// A pill only offers a block this site has switched on.
	const insertable = getInsertableLayoutBlocks();
	const availablePrompts = STARTER_PROMPTS.filter((item) => insertable.includes(item.blockName));

	// Pages the rail forward by ~3/4 of its width, wrapping back to the start.
	const pageForward = () => {
		const el = railRef.current;
		if (!el) {
			return;
		}
		const max = el.scrollWidth - el.clientWidth;
		const next = el.scrollLeft + Math.round(el.clientWidth * 0.75);
		el.scrollTo({ left: next > max - 8 ? 0 : next, behavior: 'smooth' });
	};

	return (
		<div className="sptp-ai-starters">
			<span className="sptp-ai-starters__label">{__('Try a starter', 'team-free')}</span>

			<div ref={railRef} className="sptp-ai-starters__rail">
				{availablePrompts.map((item) => (
					<button
						key={item.label}
						type="button"
						onClick={() => onSelectPrompt(item)}
						className="sptp-ai-starters__pill"
					>
						{item.label}
					</button>
				))}
			</div>

			<button
				type="button"
				aria-label={__('More starters', 'team-free')}
				onClick={pageForward}
				className="sptp-ai-starters__more"
			>
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
					<path
						d="M7 4.5 11.5 9 7 13.5"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
		</div>
	);
}
