/**
 * Member Bio — inserter / toolbar icon.
 *
 * A speech bubble holding two short lines: a SHORT personal statement. The
 * motif is deliberately unlike its neighbours in the inserter — Member Name is
 * the person (head + shoulders), Member Designation the briefcase, and Member
 * Description four full-width bare lines (the long-form twin of this block).
 * 24×24 viewBox and a 1.4 stroke to match the rest of the set.
 */

export const MemberBioIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M.35 22.2V5.8C.35 5 1 4.35 1.8 4.35H8a.65.65 0 0 1 0 1.3H1.8a.15.15 0 0 0-.15.15v16.4c0 .083.067.15.15.15h20.4a.15.15 0 0 0 .15-.15V5.8a.15.15 0 0 0-.15-.15H16a.65.65 0 0 1 0-1.3h6.2c.8 0 1.45.65 1.45 1.45v16.4c0 .8-.65 1.45-1.45 1.45H1.8C1 23.65.35 23 .35 22.2"
			fill="#2b5f47"
		/>
		<path
			d="M20 12.95a.55.55 0 1 1 0 1.1h-4.5a.55.55 0 1 1 0-1.1zm0 3a.55.55 0 1 1 0 1.1h-4.5a.55.55 0 1 1 0-1.1zm-15.35 3.4h7.7v-8.7h-7.7zm9 .15a1.15 1.15 0 0 1-1.15 1.15h-8a1.15 1.15 0 0 1-1.15-1.15v-9c0-.635.515-1.15 1.15-1.15h8c.635 0 1.15.515 1.15 1.15z"
			fill="#2b5f47"
		/>
		<path
			d="M8.95 13.5a.45.45 0 1 0-.9 0 .45.45 0 0 0 .9 0m1.1 0a1.55 1.55 0 1 1-3.1 0 1.55 1.55 0 0 1 3.1 0M8.5 15.75a4.1 4.1 0 0 1 4.1 4.1h-1.3a2.8 2.8 0 0 0-5.6 0H4.4a4.1 4.1 0 0 1 4.1-4.1M15.35 5a3.35 3.35 0 1 0-6.7 0 .65.65 0 0 1-1.3 0 4.65 4.65 0 0 1 9.3 0 .65.65 0 0 1-1.3 0"
			fill="#2b5f47"
		/>
		<path
			d="M12.65 5a.65.65 0 1 0-1.3 0 .65.65 0 0 0 1.3 0m1.3 0a1.95 1.95 0 1 1-3.9 0 1.95 1.95 0 0 1 3.9 0"
			fill="#2b5f47"
		/>
	</svg>
);
