import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { Toaster } from 'react-hot-toast';
import { toastStyle } from '../utils/toast';
import Stepper from './Stepper';
import { NavChevronIcon } from './Icons';
import Welcome from './steps/Welcome';
import Blocks from './steps/Blocks';
import Modules from './steps/Modules';
import Finish from './steps/Finish';

const STEP_COMPONENTS = {
	welcome: Welcome,
	blocks: Blocks,
	modules: Modules,
	finish: Finish,
};

// Pro's License Key step is left out — Free has no licence.
const STEPS = [
	{ key: 'welcome', label: __('Welcome', 'team-free') },
	{ key: 'blocks', label: __('Blocks', 'team-free') },
	{ key: 'modules', label: __('Modules', 'team-free') },
	{ key: 'finish', label: __('Finish', 'team-free') },
];

/**
 * Setup wizard, ported from Smart Team Pro (Figma 594:21405). Opened from the
 * header's Get Help → Setup Wizard (`#setup-wizard`).
 *
 * The design covers the whole plugin screen, so the app renders this instead
 * of the header/footer shell, and the wizard hides wp-admin's own footer while
 * it is mounted.
 *
 * @param {Object}   props
 * @param {Function} props.onExit Leave the wizard and return to the dashboard.
 */
const SetupWizard = ({ onExit }) => {
	const [current, setCurrent] = useState(0);

	// The Finish step owns the consent state, so it hands the footer a closure
	// that saves and exits; until it mounts, Finish is a plain exit.
	const finishHandler = useRef(null);
	const [isFinishing, setFinishing] = useState(false);

	const registerFinish = useCallback((handler) => {
		finishHandler.current = handler;
	}, []);

	const handleFinish = async () => {
		setFinishing(true);
		try {
			await (finishHandler.current ? finishHandler.current() : onExit());
		} finally {
			setFinishing(false);
		}
	};

	// wp-admin's footer sits below our fixed surface and would scroll into view.
	useEffect(() => {
		const footer = document.getElementById('wpfooter');
		if (!footer) {
			return undefined;
		}
		const previous = footer.style.display;
		footer.style.display = 'none';
		return () => {
			footer.style.display = previous;
		};
	}, []);

	const lastIndex = STEPS.length - 1;
	const StepComponent = STEP_COMPONENTS[STEPS[current]?.key] || null;

	return (
		<div className="sptp-wizard">
			<div className="sptp-wizard__inner">
				<Stepper steps={STEPS} current={current} />

				<div className="sptp-wizard__card">
					{StepComponent && (
						<StepComponent onExit={onExit} registerFinish={registerFinish} />
					)}
				</div>

				<div className="sptp-wizard__nav">
					{0 === current ? (
						<button
							type="button"
							className="sptp-wizard-btn sptp-wizard-btn--ghost"
							onClick={onExit}
						>
							{__('Skip It', 'team-free')}
						</button>
					) : (
						<button
							type="button"
							className="sptp-wizard-btn sptp-wizard-btn--ghost"
							onClick={() => setCurrent((step) => Math.max(0, step - 1))}
						>
							<NavChevronIcon direction="prev" />
							{__('Previous', 'team-free')}
						</button>
					)}

					{current !== lastIndex ? (
						<button
							type="button"
							className="sptp-wizard-btn sptp-wizard-btn--primary"
							onClick={() => setCurrent((step) => Math.min(lastIndex, step + 1))}
						>
							{__('Next Step', 'team-free')}
							<NavChevronIcon direction="next" />
						</button>
					) : (
						<button
							type="button"
							className="sptp-wizard-btn sptp-wizard-btn--primary"
							onClick={handleFinish}
							disabled={isFinishing}
						>
							{isFinishing ? (
								<>
									{/* Core admin's own spinner: @wordpress/components would add ~1 MB. */}
									<span
										className="spinner is-active"
										style={{ float: 'none', margin: 0 }}
									/>
									{__('Finishing…', 'team-free')}
								</>
							) : (
								__('Finish', 'team-free')
							)}
						</button>
					)}
				</div>
			</div>

			{/* The wizard renders instead of the app shell, so it carries its
			     own Toaster — the steps' save confirmations land here. */}
			<Toaster
				position="top-right"
				toastOptions={{
					style: {
						...toastStyle,
						borderRadius: '10px',
						maxWidth: '400px',
					},
				}}
			/>
		</div>
	);
};

export default SetupWizard;
