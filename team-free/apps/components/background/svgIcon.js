export const TransparentIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none">
		<path fill="#CCC" d="M0 2a2 2 0 0 1 2-2h2v4H0V2Z" />
		<path fill="#8C8F94" d="M4 0h4v4H4z" />
		<path fill="#CCC" d="M8 0h4v4H8z" />
		<path fill="#8C8F94" d="M12 0h2a2 2 0 0 1 2 2v2h-4V0ZM0 4h4v4H0z" />
		<path fill="#CCC" d="M4 4h4v4H4z" />
		<path fill="#8C8F94" d="M8 4h4v4H8z" />
		<path fill="#CCC" d="M12 4h4v4h-4zM0 8h4v4H0z" />
		<path fill="#8C8F94" d="M4 8h4v4H4z" />
		<path fill="#CCC" d="M8 8h4v4H8z" />
		<path fill="#8C8F94" d="M12 8h4v4h-4zM0 12h4v4H2a2 2 0 0 1-2-2v-2Z" />
		<path fill="#CCC" d="M4 12h4v4H4z" />
		<path fill="#8C8F94" d="M8 12h4v4H8z" />
		<path fill="#CCC" d="M12 12h4v2a2 2 0 0 1-2 2h-2v-4Z" />
	</svg>
);

export const BgIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none">
		<rect width={16} height={16} fill="#8C8F94" rx={2} />
	</svg>
);

export const GradientIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlSpace="preserve"
		width={16}
		height={16}
		style={{
			enableBackground: 'new 0 0 17 16',
		}}
		viewBox="0 0 17 16"
	>
		<path
			d="M16.9 14V2c0-1.1-.9-2-2-2h-12c-.5 0-1 .2-1.4.6l14.8 14.8c.4-.4.6-.9.6-1.4z"
			style={{
				fill: '#ccc',
			}}
		/>
		<path
			d="M1.5.6C1.2.9.9 1.4.9 2v12c0 1.1.9 2 2 2h12c.6 0 1.1-.2 1.4-.6L1.5.6z"
			style={{
				fill: '#8c8f94',
			}}
		/>
	</svg>
);

export const Image = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlSpace="preserve"
		id="Layer_1"
		x={0}
		y={0}
		width={16}
		height={16}
		style={{
			enableBackground: 'new 0 0 16 16',
		}}
		viewBox="0 0 16 16"
	>
		<style>{'.st0{fill:#8c8f94}'}</style>
		<path
			d="M14 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zM2 1.3h12c.4 0 .7.3.7.7v11.4l-2.3-2.9c-.2-.3-.6-.3-.8 0l-.9 1.2-3.3-3.3c-.2-.2-.5-.2-.7 0l-5.3 5.3V2c-.1-.4.2-.7.6-.7z"
			className="st0"
		/>
		<circle cx={11} cy={5} r={2} className="st0" />
	</svg>
);

export const Video = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none">
		<path
			fill="#8C8F94"
			d="M13.956 0H2.044A2.012 2.012 0 0 0 0 2.044v11.912C0 15.11.889 16 2.044 16h11.912A2.012 2.012 0 0 0 16 13.956V2.044A2.012 2.012 0 0 0 13.956 0Zm.71 13.956c0 .355-.355.71-.71.71H2.044c-.355 0-.71-.355-.71-.71V2.044c0-.355.355-.71.71-.71h11.912c.355 0 .71.355.71.71v11.912Zm-8.444-3.29L10.667 8 6.222 5.333v5.334Z"
		/>
	</svg>
);
