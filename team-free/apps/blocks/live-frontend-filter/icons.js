/**
 * Live Frontend Filter — block + inspector icons.
 *
 * The Justify/Align sets are ports of testimonial-pro's Icons.jsx; the Flex
 * Direction / Flex Wrap arrows are drawn to match (24px grid, #757575).
 */

// Funnel over a row of chips — the container of the taxonomy filters.
export const LiveFrontendFilterIcon = () => (
	<svg width={25} height={24} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M2.15 13.627a.65.65 0 0 1 .65-.65h2.7a.65.65 0 1 1 0 1.3H2.8a.65.65 0 0 1-.65-.65m6.574-.75a.469.469 0 0 1 .65.65l-.061.073-.67.671a.625.625 0 0 1-.786.08l-.1-.08-.669-.671-.06-.073a.469.469 0 0 1 .65-.65l.072.06.45.45.45-.45z"
			fill="#2b5f47"
		/>
		<path
			d="M10.2 11.625a.35.35 0 0 0-.35-.35h-8.2a.35.35 0 0 0-.35.35v4c0 .193.157.35.35.35h8.2a.35.35 0 0 0 .35-.35zm1.3 4a1.65 1.65 0 0 1-1.65 1.65h-8.2A1.65 1.65 0 0 1 0 15.625v-4c0-.911.74-1.65 1.65-1.65h8.2c.912 0 1.65.739 1.65 1.65zm11.4-4a.35.35 0 0 0-.35-.35h-8.2a.35.35 0 0 0-.35.35v4c0 .193.157.35.35.35h8.2a.35.35 0 0 0 .35-.35zm1.3 4a1.65 1.65 0 0 1-1.65 1.65h-8.2a1.65 1.65 0 0 1-1.65-1.65v-4c0-.911.74-1.65 1.65-1.65h8.2c.912 0 1.65.739 1.65 1.65z"
			fill="#2b5f47"
		/>
		<path d="M17.05 13.625a1 1 0 1 1-2 0 1 1 0 0 1 2 0" fill="#2b5f47" />
		<path
			d="M15.674 13.248a.25.25 0 0 1 .353 0l1 1a.25.25 0 1 1-.353.354l-1-1a.25.25 0 0 1 0-.354m2.376.377a.65.65 0 0 1 .65-.65h2.7a.65.65 0 1 1 0 1.3h-2.7a.65.65 0 0 1-.65-.65m-10.4-6.9a.9.9 0 0 1 0 1.8h-6.5a.9.9 0 0 1 0-1.8zm12.349 0a.9.9 0 0 1 0 1.8H13.85a.9.9 0 0 1 0-1.8z"
			fill="#2b5f47"
		/>
	</svg>
);

/* Flex Direction — arrow toward the flow end, bar at the start. */
export const FlexRowIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M4.75 22h-1.5V2h1.5z" fill="#757575" />
		<path
			d="M8 11.25h9.19l-3.22-3.22 1.06-1.06 5.03 5.03-5.03 5.03-1.06-1.06 3.22-3.22H8z"
			fill="#757575"
		/>
	</svg>
);
export const FlexColumnIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M2 4.75v-1.5h20v1.5z" fill="#757575" />
		<path
			d="M12.75 8v9.19l3.22-3.22 1.06 1.06L12 20.06l-5.03-5.03 1.06-1.06 3.22 3.22V8z"
			fill="#757575"
		/>
	</svg>
);
export const FlexRowReverseIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M20.75 22h-1.5V2h1.5z" fill="#757575" />
		<path
			d="M16 12.75H6.81l3.22 3.22-1.06 1.06L3.94 12l5.03-5.03 1.06 1.06-3.22 3.22H16z"
			fill="#757575"
		/>
	</svg>
);
export const FlexColumnReverseIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M2 20.75v-1.5h20v1.5z" fill="#757575" />
		<path
			d="M11.25 16V6.81l-3.22 3.22-1.06-1.06L12 3.94l5.03 5.03-1.06 1.06-3.22-3.22V16z"
			fill="#757575"
		/>
	</svg>
);

/* Justify Content — port of testimonial-pro's Justify* icons. */
export const JustifyStartIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M7.75 22h-1.5V2h1.5zm5-5h-3V7h3zm5 0h-3V7h3z" fill="#757575" />
	</svg>
);
export const JustifyCenterIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M12.75 22h-1.5V2h1.5zM9 17H6V7h3zm9 0h-3V7h3z" fill="#757575" />
	</svg>
);
export const JustifyEndIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M17.75 22h-1.5V2h1.5zm-8.5-5h-3V7h3zm5 0h-3V7h3z" fill="#757575" />
	</svg>
);
export const JustifyBetweenIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M4 22H2.5V2H4zm17.5 0H20V2h1.5zM9 17H6V7h3zm9 0h-3V7h3z" fill="#757575" />
	</svg>
);
export const JustifyAroundIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M4 22H2.5V2H4zm17.5 0H20V2h1.5zM11 17H8V7h3zm5 0h-3V7h3z" fill="#757575" />
	</svg>
);
export const JustifyEvenlyIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M3.75 22h-1.5V2h1.5zm18 0h-1.5V2h1.5zm-11.5-5h-3V7h3zm6.5 0h-3V7h3z"
			fill="#757575"
		/>
	</svg>
);

/* Align Items — port of testimonial-pro's Align* icons. */
export const AlignStartIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fill="#757575" d="M22 5.25v1.5H2v-1.5zm-6 3.5v10h-3v-10zm-5 0v7H8v-7z" />
	</svg>
);
export const AlignCenterIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fill="#757575" d="M22 11.5V13H2v-1.5z" />
		<path fill="#757575" d="M16.111 4.5v15h-3v-15zm-5 2v11h-3v-11z" />
	</svg>
);
export const AlignEndIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fill="#757575" d="M22 18.75v-1.5H2v1.5zm-6-3.5v-10h-3v10zm-5 0v-7H8v7z" />
	</svg>
);
export const AlignStretchIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M22 2.5H2V4h20zM11 6H8v12h3zm5 0h-3v12h3zm6 14H2v1.5h20z" fill="#757575" />
	</svg>
);

/* Flex Wrap — straight run vs. bend back to the next line. */
export const NoWrapIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M3 11.25h13.19l-3.22-3.22 1.06-1.06 5.03 5.03-5.03 5.03-1.06-1.06 3.22-3.22H3z"
			fill="#757575"
		/>
	</svg>
);
export const WrapIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M3 7.25h14a3.75 3.75 0 0 1 0 7.5H8.81l2.22 2.22-1.06 1.06-4.03-4.03 4.03-4.03 1.06 1.06-2.22 2.22H17a2.25 2.25 0 0 0 0-4.5H3z"
			fill="#757575"
		/>
	</svg>
);
