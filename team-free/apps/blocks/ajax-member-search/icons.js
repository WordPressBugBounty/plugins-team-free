/**
 * Ajax Member Search — inserter icon + Choose Icon preset glyphs.
 *
 * The preset glyphs are inline SVG stand-ins for the Font Awesome classes the
 * `searchBtnIcon` attribute stores — the inspector sidebar lives in the admin
 * document where sp_team_fontawesome isn't enqueued, so `<i class="fa …">`
 * labels wouldn't render there.
 */

/* Fill-based paths (no strokes), like the alignment icons in
 * components/icons.js — the toggle-group stylesheet paints buttons via
 * `svg { fill }` / active `path { fill }`, which turns stroke-drawn shapes
 * into blobs. Rendered at 18px (a notch below the 24px alignment icons) so
 * the five-button row doesn't crowd the sidebar. */
export const SearchGlyph = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none">
		<path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.49 4.49 0 0 1 9.5 14z" />
	</svg>
);

export const SearchPlusGlyph = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none">
		<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
		<path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
	</svg>
);

export const ArrowLeftGlyph = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none">
		<path d="m12 4 1.41 1.41L7.83 11H20v2H7.83l5.58 5.59L12 20l-8-8 8-8z" />
	</svg>
);

export const ArrowRightGlyph = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none">
		<path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
	</svg>
);

/* The Font Awesome 4.7 fa-paper-plane outline — same glyph the frontend
 * button renders, so the panel preview matches. */
export const PaperPlaneGlyph = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={18}
		height={18}
		viewBox="0 0 1792 1792"
		fill="none"
	>
		<path d="M1764 11q33 24 27 64l-256 1536q-5 29-32 45-14 8-31 8-11 0-24-5l-453-185-242 295q-18 23-49 23-13 0-22-4-19-7-30.5-23.5T640 1728v-349l864-1059-1069 925-395-162q-37-14-40-55-2-40 32-59L1696 9q15-9 32-9 20 0 36 11z" />
	</svg>
);

export const AjaxMemberSearchIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M19.08 10.345a8.545 8.545 0 1 0-17.09 0 8.545 8.545 0 0 0 17.09 0m1.6 0c0 5.603-4.542 10.146-10.145 10.146S.391 15.948.391 10.345 4.932.201 10.535.201 20.68 4.742 20.681 10.345"
			fill="#2b5f47"
		/>
		<path
			d="M11.912 9.515a1.377 1.377 0 1 0-2.754 0 1.377 1.377 0 0 0 2.754 0m1.4 0a2.777 2.777 0 1 1-5.553 0 2.777 2.777 0 0 1 5.553 0m-2.777 3.325a5.836 5.836 0 0 1 5.836 5.836h-1.5a4.336 4.336 0 0 0-8.672 0H4.7a5.836 5.836 0 0 1 5.836-5.836m7.355 4.11a.8.8 0 1 0-1.13 1.13l5.484 5.485a.8.8 0 1 0 1.13-1.13z"
			fill="#2b5f47"
		/>
	</svg>
);
