/**
 * AI Team Builder mark (design: "Team Showcase Builder" — assets/team-logo.svg),
 * shared by the modal header and the block toolbar button.
 *
 * @param {Object} props
 * @param {number} [props.size]  Width/height in pixels.
 * @param {string} [props.color] Fill color.
 * @return {JSX.Element} The brand mark.
 */
export default function BrandMarkIcon({ size = 32, color = '#2B5F47' }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 172 172"
			fill="none"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d="M86 172C38.3218 172 0 133.081 0 86C0 38.919 38.3218 0 86 0C133.678 0 172 38.919 172 86C171.502 133.678 133.081 172 86 172ZM86 8.75926C43.6968 8.75926 9.15741 43.7963 9.15741 86C9.15741 128.204 43.6968 162.843 86 162.843C128.303 162.843 162.843 128.303 162.843 86C162.843 43.6968 128.303 8.75926 86 8.75926Z"
				fill={color}
			/>
			<path
				d="M84.9505 40.7052C85.3298 39.7649 86.6702 39.7649 87.0495 40.7052L91.6708 52.1603C96.8928 65.1047 107.289 75.3183 120.38 80.3659L132.279 84.9536C133.24 85.3244 133.24 86.6756 132.279 87.0464L120.38 91.6341C107.289 96.6817 96.8928 106.895 91.6708 119.84L87.0495 131.295C86.6702 132.235 85.3298 132.235 84.9505 131.295L80.3292 119.84C75.1072 106.895 64.7111 96.6817 51.6196 91.6341L39.7213 87.0464C38.7596 86.6756 38.7596 85.3244 39.7213 84.9536L51.6196 80.3659C64.7111 75.3183 75.1072 65.1047 80.3292 52.1603L84.9505 40.7052Z"
				fill={color}
			/>
		</svg>
	);
}
