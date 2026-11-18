/**
 * Ajax Pagination — editor preview markup.
 *
 * Static twin of Ajax_Pagination::render_block() (port of testimonial-pro's
 * Pagination.jsx): no fetching — real paging is the frontend runtime in
 * blocks/assets/js/script.js. Markup and classes must stay identical to the
 * PHP shell so the dynamic CSS selectors resolve in both views. Numbered
 * pages show a representative strip out of 8 pages: exactly Number of Links
 * numbered buttons, then "…" and the last page.
 */

const ChevronIcon = () => (
	<svg
		width="10"
		height="10"
		viewBox="0 0 10 10"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.1"
		strokeLinecap="round"
		strokeLinejoin="round"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path d="M3.5 1.5 7 5 3.5 8.5" />
	</svg>
);

// Preview twin of the runtime's pagesToRender (script.js): a sliding window of
// `links` numbered buttons (current page = 1 here), the last page anchored
// after "…" — so the strip always shows exactly Number of Links numbers.
const previewPages = (links, totalPages) => {
	if (totalPages <= links) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}
	const pages = [];
	for (let p = 1; p <= links; p++) {
		pages.push(p);
	}
	// Like the runtime, the far anchor is always fenced off with "…".
	pages.push('dots', totalPages);
	return pages;
};

const Pagination = ({ attributes }) => {
	const {
		paginationButtonType,
		loadMoreLabel,
		paginationNumberType,
		paginationNumberOfLinks,
		paginationNextPrevStyle,
		paginationPrevLabel,
		paginationNextLabel,
	} = attributes;

	const buttonType = paginationButtonType === 'number' ? 'number' : 'load-more';
	const numberType = paginationNumberType || 'number';

	const isNumber = ['number', 'number-arrow', 'number-prev-next-arrow'].includes(numberType);
	const hasArrows = ['number-arrow', 'number-prev-next-arrow', 'prev-next'].includes(numberType);

	// Next/Previous Button Style: label | icon | label-icon.
	const npStyle = ['label', 'icon', 'label-icon'].includes(paginationNextPrevStyle)
		? paginationNextPrevStyle
		: 'icon';
	const showNpIcon = npStyle !== 'label';
	const showNpLabel = npStyle !== 'icon';

	const stop = (e) => e.preventDefault();
	const item = 'sp-smart-team-ajax-pagination__item';

	// Alignment is responsive → applied as justify-content by dynamicCss.js.
	return (
		<div className="sp-smart-team-ajax-pagination__wrapper">
			{/* Kept under Infinite Scroll too: the frontend sentinel is invisible, so this is the only selectable surface in the editor. */}
			{buttonType === 'load-more' && (
				<div className="sp-smart-team-ajax-pagination__load-more">
					<a href="#" className={item} onClick={stop}>
						{loadMoreLabel || 'Load More'}
					</a>
				</div>
			)}

			{buttonType === 'number' && (
				<div className="sp-smart-team-ajax-pagination__buttons">
					{hasArrows && (
						<a href="#" className={`${item} ${item}--prev is-disabled`} onClick={stop}>
							{showNpIcon && (
								<span className="sp-smart-team-ajax-pagination__prev-icon">
									<ChevronIcon />
								</span>
							)}
							{showNpLabel && (paginationPrevLabel || 'Prev')}
						</a>
					)}

					{/* Windowed strip like the runtime: Number of Links numbered
					    buttons + "…" + the last page (representative 8 pages). */}
					{isNumber &&
						previewPages(
							Math.max(1, parseInt(paginationNumberOfLinks?.value, 10) || 2),
							8
						).map((page, index) =>
							page === 'dots' ? (
								<span
									key={`dots-${index}`}
									className={`${item} sp-smart-team-ajax-pagination__dots`}
								>
									…
								</span>
							) : (
								<a
									key={page}
									href="#"
									className={`${item}${page === 1 ? ' is-current' : ''}`}
									onClick={stop}
								>
									{/* Zero-padded display (01, 02, …), like the frontend runtime. */}
									{String(page).padStart(2, '0')}
								</a>
							)
						)}

					{hasArrows && (
						<a href="#" className={`${item} ${item}--next`} onClick={stop}>
							{showNpLabel && (paginationNextLabel || 'Next')}
							{showNpIcon && (
								<span className="sp-smart-team-ajax-pagination__next-icon">
									<ChevronIcon />
								</span>
							)}
						</a>
					)}
				</div>
			)}
		</div>
	);
};

export default Pagination;
