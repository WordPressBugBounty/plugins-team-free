/**
 * Setup wizard icons — vector data exported from the Figma wizard frame
 * (594:21405), except StepTickIcon, which the design never shows because no
 * step is complete on the Welcome screen; that one follows testimonial-pro's
 * wizard tick.
 */

export const StepArrowIcon = () => (
	<svg
		className="sptp-wizard-stepper__arrow"
		width={35}
		height={12}
		viewBox="0 0 35 12"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="M1.5 5.25C1.08579 5.25 0.75 5.58579 0.75 6C0.75 6.41421 1.08579 6.75 1.5 6.75V6V5.25ZM34.0303 6.53033C34.3232 6.23744 34.3232 5.76256 34.0303 5.46967L29.2574 0.696699C28.9645 0.403806 28.4896 0.403806 28.1967 0.696699C27.9038 0.989593 27.9038 1.46447 28.1967 1.75736L32.4393 6L28.1967 10.2426C27.9038 10.5355 27.9038 11.0104 28.1967 11.3033C28.4896 11.5962 28.9645 11.5962 29.2574 11.3033L34.0303 6.53033ZM1.5 6V6.75H33.5V6V5.25H1.5V6Z"
			fill="#BBBBBB"
		/>
	</svg>
);

export const StepTickIcon = () => (
	<svg
		width={16}
		height={15}
		viewBox="0 0 16 15"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path d="M0 7.733 4.968 15h2.129L16 1.533 13.935 0l-8 9.467L2 5.733z" fill="#fff" />
	</svg>
);

export const FeatureCheckIcon = () => (
	<svg
		className="sptp-wizard-feature__icon"
		width={14}
		height={14}
		viewBox="0 0 13.125 11.9574"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="M10.9385 5.11762C10.5947 5.11762 10.3161 5.39634 10.3161 5.74007V10.2392C10.3161 10.5002 10.1037 10.7125 9.84274 10.7125H1.71823C1.45726 10.7125 1.24491 10.5002 1.24491 10.2392V2.11465C1.24491 1.85368 1.45726 1.64138 1.71823 1.64138H8.38297C8.7267 1.64138 9.00542 1.36267 9.00542 1.01893C9.00542 0.67519 8.7267 0.396475 8.38297 0.396475H1.71823C0.770766 0.396475 0 1.16724 0 2.11465V10.2392C0 11.1866 0.770766 11.9574 1.71823 11.9574H9.84274C10.7902 11.9574 11.561 11.1866 11.561 10.2392V5.74007C11.561 5.39631 11.2823 5.11762 10.9385 5.11762Z"
			fill="currentColor"
		/>
		<path
			d="M12.0616 0.183112L5.13909 7.1317L3.35997 5.34616C3.11732 5.10261 2.72325 5.10195 2.4797 5.34454C2.23614 5.58719 2.23543 5.98133 2.47808 6.22482L4.45517 8.20905C4.63764 8.39236 4.88048 8.49329 5.13912 8.49329H5.13964C5.39848 8.49312 5.64143 8.39192 5.82318 8.20902L12.9435 1.06178C13.1862 0.818225 13.1854 0.424065 12.9419 0.181499C12.6983 -0.0611498 12.3042 -0.0603841 12.0616 0.183112Z"
			fill="currentColor"
		/>
	</svg>
);

/**
 * The design's "angle-up" glyph. Figma rotates the instance rather than
 * shipping left/right variants, so the direction is a CSS class here too.
 *
 * @param {Object} props
 * @param {string} props.direction `next` (points right) or `prev` (points left).
 */
export const NavChevronIcon = ({ direction = 'next' }) => (
	<svg
		className={`sptp-wizard-nav__chevron sptp-wizard-nav__chevron--${direction}`}
		width={17}
		height={17}
		viewBox="0 0 17 17"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="M8.05328 5.82583C8.33149 5.59892 8.74162 5.61492 9.00095 5.87425L13.2509 10.1243C13.5276 10.4009 13.5276 10.8493 13.2509 11.1259C12.9743 11.4025 12.5259 11.4025 12.2493 11.1259L8.50014 7.37669L4.75095 11.1259C4.47433 11.4025 4.02594 11.4025 3.74932 11.1259C3.4727 10.8493 3.4727 10.4009 3.74932 10.1243L7.99932 5.87425L8.05328 5.82583Z"
			fill="currentColor"
		/>
	</svg>
);

/** The "Learn More" out-arrow on the Finish step's What We Collect modal. */
export const ExternalArrowIcon = () => (
	<svg
		width={20}
		height={20}
		viewBox="0 0 20 20"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="m5.39 5.382.057 1.6 6.708-.244-7.664 7.664 1.132 1.13 7.666-7.665-.246 6.712 1.6.056.35-9.601-9.603.348Z"
			fill="currentColor"
		/>
	</svg>
);
