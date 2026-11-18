import { ToggleControl } from '@wordpress/components';
import './editor.scss';
import { memo } from '@wordpress/element';
import { DndTitleIcon } from '../../icons/icons';
import ProTag from '../proTag/proTag.js';

const Toggle = ({
	label = '',
	attributes,
	setAttributes = () => {},
	attributesKey = '',
	onChange = false,
	updated = false,
	helpText = false,
	flipHor = false,
	flipVer = false,
	// Renders the switch read-only (core's ToggleControl `disabled`) — for a
	// setting a layout REQUIRES, e.g. the Overlay block's Photo/Image row, whose
	// card IS the photo.
	disabled = false,
	// Pro-lock (port of Real Testimonials Free's toggleControl `isPro`): the
	// switch can never be turned on and always reads as off, the label greys
	// out, and a "(Pro)" tag marks it (display-only).
	isPro = false,
}) => {
	return (
		<>
			<div
				className={`sp-smart-team-toggle sp-smart-team-component-mb ${updated ? 'updated-toggle' : ''}${isPro ? ' is-pro' : ''}`}
			>
				{updated && (
					<div className="sp-smart-team-toggle-left">
						<DndTitleIcon />
						<span className="sp-smart-team-component-title">{label}</span>
					</div>
				)}
				{!flipHor && !flipVer && (
					<ToggleControl
						label={
							!updated ? (
								<>
									{label}
									{isPro && <ProTag />}
								</>
							) : (
								''
							)
						}
						checked={isPro ? false : attributes}
						disabled={disabled || isPro}
						onChange={(newField) => {
							if (isPro) {
								return;
							}
							return onChange
								? onChange(!newField)
								: setAttributes({
										[attributesKey]: !attributes,
									});
						}}
						help={helpText}
						__nextHasNoMarginBottom={true}
					/>
				)}

				{flipHor && (
					<div className="sp-smart-team-toggle-flip">
						<div className="sp-smart-team-toggle-left">
							<span className="sp-smart-team-component-title">{label}</span>
						</div>
						<svg
							width={24}
							height={24}
							viewBox="0 0 24 24"
							fill={`${attributes ? '#423ff326' : 'none'} `}
							xmlns="http://www.w3.org/2000/svg"
							onClick={() =>
								onChange
									? onChange(!attributes)
									: setAttributes({
											[attributesKey]: !attributes,
										})
							}
						>
							<rect x={0.5} y={0.5} width={23} height={23} rx={2} stroke="#8c8f94" />
							<path
								d="M4.833 7.167a.33.33 0 0 1 .246.114l.017.02.005.006.013.016.02.02 4.22 4.217.004.005c.124.12.142.204.142.269 0 .082-.03.16-.084.223l-4.336 4.67-.006.006a.334.334 0 0 1-.574-.232v-9c0-.184.15-.334.333-.334Z"
								stroke="#1e1e1e"
							/>
							<path
								d="m18.54 6.96-4.218 4.22c-.01.01-.067.059-.076.069a.82.82 0 0 0-.246.585c0 .205.076.404.22.567l4.329 4.66A.834.834 0 0 0 20 16.5v-9c.001-.677-.84-1.178-1.46-.54"
								fill="#1e1e1e"
							/>
							<path
								d="M12 7.334a.667.667 0 0 0-.667.667v8a.667.667 0 0 0 1.334 0v-8A.667.667 0 0 0 12 7.334"
								fill="#ddd"
							/>
						</svg>
					</div>
				)}
				{flipVer && (
					<div className="sp-smart-team-toggle-flip">
						<div className="sp-smart-team-toggle-left">
							<span className="sp-smart-team-component-title">{label}</span>
						</div>
						<svg
							width={24}
							height={24}
							viewBox="0 0 24 24"
							fill={`${attributes ? '#423ff326' : 'none'} `}
							xmlns="http://www.w3.org/2000/svg"
							onClick={() =>
								onChange
									? onChange(!attributes)
									: setAttributes({
											[attributesKey]: !attributes,
										})
							}
						>
							<rect x={0.5} y={0.5} width={23} height={23} rx={2} stroke="#8c8f94" />
							<path
								d="M7.167 19.167c0-.084.032-.165.098-.232l.016-.014.02-.017.006-.005.016-.013.02-.02 4.217-4.22.005-.005c.12-.123.204-.141.269-.141.082 0 .16.03.223.084l4.67 4.336.006.006a.334.334 0 0 1-.232.574h-9a.335.335 0 0 1-.334-.333Z"
								stroke="#1e1e1e"
							/>
							<path
								d="m6.96 5.46 4.22 4.218c.01.01.059.067.069.076a.82.82 0 0 0 .585.246.85.85 0 0 0 .567-.22l4.66-4.33A.834.834 0 0 0 16.5 4h-9c-.677 0-1.178.84-.54 1.46"
								fill="#1e1e1e"
							/>
							<path
								d="M7.334 12c0 .368.299.667.667.667h8a.667.667 0 0 0 0-1.334h-8a.667.667 0 0 0-.667.667"
								fill="#ddd"
							/>
						</svg>
					</div>
				)}
			</div>
		</>
	);
};

export default memo(Toggle);
