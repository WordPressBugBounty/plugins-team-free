import { StepArrowIcon, StepTickIcon } from './Icons';

/**
 * Wizard progress stepper
 *
 * Numbering comes from the array index, so steps renumber themselves when the
 * list changes instead of leaving a gap.
 *
 * @param {Object}   props
 * @param {Object[]} props.steps   Ordered `{ key, label }` steps.
 * @param {number}   props.current Active step index (0-based).
 */
const Stepper = ({ steps = [], current = 0 }) => (
	<ol className="sptp-wizard-stepper">
		{steps.map((step, index) => {
			const state = index === current ? 'active' : index < current ? 'complete' : 'upcoming';

			return (
				<li
					key={step.key}
					className="sptp-wizard-stepper__item"
					aria-current={index === current ? 'step' : undefined}
				>
					<span className={`sptp-wizard-stepper__num is-${state}`}>
						{'complete' === state ? <StepTickIcon /> : `0${index + 1}`}
					</span>
					<span className="sptp-wizard-stepper__label">{step.label}</span>
					{index !== steps.length - 1 && <StepArrowIcon />}
				</li>
			);
		})}
	</ol>
);

export default Stepper;
