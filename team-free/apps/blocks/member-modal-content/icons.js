/**
 * Member Modal Content — icons.
 *
 * CloseIcon is the JSX twin of Member_Modal_Content::close_icon_svg() — same
 * geometry, same 1em box on `currentColor`, so the Icon Size / Color controls
 * drive the canvas exactly like the frontend.
 */

export const MemberModalContentIcon = () => (
	<svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
		<rect x="5" y="7" width="6" height="10" rx="1" fill="currentColor" opacity="0.35" />
		<path
			d="M13 8h6M13 11.5h6M13 15h4"
			stroke="currentColor"
			strokeWidth="1.4"
			strokeLinecap="round"
		/>
	</svg>
);

export const CloseIcon = () => (
	<svg
		viewBox="0 0 24 24"
		width="1em"
		height="1em"
		fill="none"
		aria-hidden="true"
		focusable="false"
	>
		<path
			d="M18 6 6 18M6 6l12 12"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
);

// Prev/next arrows are NOT defined here: both renderers use the Carousel
// block's 12-glyph set (NAV_ARROW_ICONS ↔ Carousel::nav_arrow_svg()), so the
// Navigation Style picker and the arrow geometry have one source.
