import './editor.scss';

const Divider = ({ position = '', color = '' }) => {
	return (
		<span
			className={`sp-smart-team-divider ${position} ${color}`.trim()}
			style={{
				...(color && { borderBottom: `1px solid ${color}` }),
			}}
		></span>
	);
};

export default Divider;
