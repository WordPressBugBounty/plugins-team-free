import { __ } from '@wordpress/i18n';
import { createInterpolateElement, useCallback, useEffect, useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { STORE_NAME } from '../../store';
import WhatWeCollectModal from '../WhatWeCollectModal';

/**
 * The patterns collage (Figma 602:14661 / 602:14670) is a free-form arrangement
 * of screenshots, so each tile carries the design's own absolute box. `crop`
 * is the inner <img> transform Figma uses to frame a larger source inside the
 * tile — tiles without it simply cover their box.
 *
 * Coordinates are relative to the 1044x280 card, which is exactly the wizard
 * card's content width, so they land as designed at desktop and clip (rather
 * than reflow) below it.
 */
const PATTERN_TILES = [
	{
		file: 'pattern-l1.webp',
		left: 24,
		top: 33,
		width: 108,
		height: 149,
		radius: 2,
		crop: { width: '112.17%', height: '209.98%', left: '-6.04%', top: '-93.06%' },
	},
	{ file: 'pattern-l3.webp', left: 141, top: 68, width: 143, height: 72, radius: 2 },
	{
		file: 'pattern-l2.webp',
		left: 141,
		top: 150,
		width: 60,
		height: 106,
		radius: 1.5,
		crop: { width: '118.33%', height: '141.96%', left: '-9.33%', top: '-6.27%' },
	},
	{ file: 'pattern-l4.webp', left: 210, top: 150, width: 129, height: 95, radius: 2 },
	{ file: 'pattern-l5.webp', left: 24, top: 192, width: 107, height: 56, radius: 2 },
	{
		file: 'pattern-r1.webp',
		right: 25,
		top: 44,
		width: 107,
		height: 137,
		radius: 2,
		crop: { width: '100%', height: '109.87%', left: '0', top: '0.13%' },
	},
	{
		file: 'pattern-r2.webp',
		right: 142,
		top: 57,
		width: 149,
		height: 103,
		radius: 2,
		crop: { width: '115.66%', height: '432.12%', left: '-9.05%', top: '-229.01%' },
	},
	{ file: 'pattern-r3.webp', right: 142, top: 171, width: 165, height: 71, radius: 2 },
	{
		file: 'pattern-r4.webp',
		right: 25,
		top: 191,
		width: 107,
		height: 60,
		radius: 2,
		crop: { width: '100%', height: '98.28%', left: '0', top: '0.86%' },
	},
];

// The "Congratulations!" lettering ships as three overlaid Figma exports; each
// keeps its own inset within the 243.38x127.89 artboard.
const CONGRATS_LAYERS = [
	{ file: 'congrats-1.svg', inset: '0 34.73% 48.82% 22.85%' },
	{ file: 'congrats-2.svg', inset: '33% 0 0 0' },
	{ file: 'congrats-3.svg', inset: '43.35% 0.49% 16.93% 4.44%' },
];

/**
 * Wizard Finish step (Figma 602:14358), ported from Smart Team Pro.
 *
 * The consent box starts ticked (as in Pro and Real Testimonials Free) unless a
 * decision was recorded earlier, which it then reflects. Nothing is sent until
 * the admin clicks Finish with the box still ticked. Either exit records the
 * decision (Diagnostics::record_consent()), so a finished wizard silences the
 * wp-admin consent notice whatever the answer.
 *
 * @param {Object}   props
 * @param {Function} props.onExit         Leave the wizard and return to the dashboard.
 * @param {Function} props.registerFinish Hand the footer Finish button this step's save-and-exit.
 */
const Finish = ({ onExit, registerFinish }) => {
	const { adminUrl, homeUrl, pluginUrl, productHomeUrl } = useSelect(
		(select) => select(STORE_NAME).getDashboardInfo(),
		[]
	);

	const diagnostics = useSelect((select) => select(STORE_NAME).getDiagnostics(), []);
	const { saveDiagnosticsConsent } = useDispatch(STORE_NAME);

	const [isCollectOpen, setCollectOpen] = useState(false);
	const [isSaving, setSaving] = useState(false);
	const [choice, setChoice] = useState(null);
	// Checked until the admin unticks it (as in Pro and Real Testimonials Free);
	// nothing transmits until Finish. A decision recorded earlier overrides that.
	// The bootstrap payload arrives after the wizard mounts, so the row stays
	// hidden until then — else a recorded "no" would show ticked first and flip off.
	const diagnosticsLoaded = undefined !== diagnostics.consent_recorded;
	const defaultConsent = diagnostics.consent_recorded ? diagnostics.allow_diagnostic_data : true;
	const shareData = null !== choice ? choice : Boolean(defaultConsent);

	// Both exits record the decision before leaving, so a finished wizard always
	// produces an explicit answer.
	const leaveWizard = useCallback(
		async (event, exit) => {
			if (event) {
				event.preventDefault();
			}

			setSaving(true);
			try {
				await saveDiagnosticsConsent(shareData);
			} finally {
				setSaving(false);
				exit();
			}
		},
		[saveDiagnosticsConsent, shareData]
	);

	// Re-registers whenever the consent toggle moves, so the footer button
	// always saves the value currently on screen.
	useEffect(() => {
		if (registerFinish) {
			registerFinish(() => leaveWizard(null, onExit));
		}
	}, [registerFinish, leaveWizard, onExit]);

	const wpAdminUrl = adminUrl || `${homeUrl || ''}wp-admin/`;
	const imageBase = `${pluginUrl || ''}dist/images/wizard-finish/`;
	const patternsUrl = `${productHomeUrl || 'https://getwpteam.com/'}patterns/`;

	return (
		<div className="sptp-wizard-finish">
			<div className="sptp-wizard-finish__intro">
				<div className="sptp-wizard-finish__congrats">
					{CONGRATS_LAYERS.map(({ file, inset }) => (
						<img key={file} src={`${imageBase}${file}`} alt="" style={{ inset }} />
					))}
				</div>

				<div className="sptp-wizard-finish__text">
					<h2 className="sptp-wizard-finish__title">
						{__('You’re Ready to Start Adding Members', 'team-free')}
					</h2>
					<p className="sptp-wizard-finish__lead">
						{createInterpolateElement(
							__(
								'Add your team members and start building your team showcase. It only takes <strong>less than 30 seconds</strong>, and you can customize everything as you go.',
								'team-free'
							),
							{ strong: <strong /> }
						)}
					</p>
				</div>

				<div className="sptp-wizard-finish__actions">
					<a
						className="sptp-wizard-finish__cta sptp-wizard-finish__cta--primary"
						href={`${wpAdminUrl}post-new.php?post_type=sptp_member`}
						aria-disabled={isSaving}
						onClick={(event) =>
							leaveWizard(event, () => {
								window.location.href = `${wpAdminUrl}post-new.php?post_type=sptp_member`;
							})
						}
					>
						{__('Add Your Team Member', 'team-free')}
					</a>
					{isSaving ? (
						<span className="sptp-wizard-finish__saving">
							<span
								className="spinner is-active"
								style={{ float: 'none', margin: 0 }}
							/>
							{__('Finishing…', 'team-free')}
						</span>
					) : (
						<button
							type="button"
							className="sptp-wizard-finish__cta sptp-wizard-finish__cta--secondary"
							onClick={(event) => leaveWizard(event, onExit)}
						>
							{__('Go to Dashboard', 'team-free')}
						</button>
					)}
				</div>
			</div>

			<div className="sptp-wizard-finish__promo">
				<div className="sptp-wizard-finish__patterns">
					{PATTERN_TILES.map((tile) => (
						<div
							key={tile.file}
							className="sptp-wizard-finish__tile"
							style={{
								left: undefined === tile.left ? undefined : `${tile.left}px`,
								right: undefined === tile.right ? undefined : `${tile.right}px`,
								top: `${tile.top}px`,
								width: `${tile.width}px`,
								height: `${tile.height}px`,
								borderRadius: `${tile.radius}px`,
							}}
						>
							<img src={`${imageBase}${tile.file}`} alt="" style={tile.crop} />
						</div>
					))}

					<div className="sptp-wizard-finish__patterns-body">
						<p className="sptp-wizard-finish__patterns-title">
							{__('Ready Patterns to Match Every Style and Mood', 'team-free')}
						</p>
						<a
							className="sptp-wizard-finish__patterns-link"
							href={patternsUrl}
							target="_blank"
							rel="noreferrer"
						>
							{__('Explore all Patterns', 'team-free')}
						</a>
					</div>
				</div>

				<div
					className="sptp-wizard-finish__consent"
					style={diagnosticsLoaded ? undefined : { visibility: 'hidden' }}
				>
					<input
						type="checkbox"
						id="sptp-wizard-consent"
						className="sptp-wizard-finish__consent-input"
						checked={shareData}
						onChange={(event) => setChoice(event.target.checked)}
					/>
					{/* Only the box toggles, as in WP Carousel Pro — the text is not a label. */}
					<span className="sptp-wizard-finish__consent-text">
						<span>
							{__(
								'Share non-sensitive diagnostic data to help us fix bugs faster, make smarter decisions, and build features that truly matter to you. Nothing is sent unless this is checked. See',
								'team-free'
							)}
						</span>{' '}
						<button
							type="button"
							className="sptp-wizard-finish__consent-link"
							onClick={() => setCollectOpen(true)}
						>
							{__('what we collect.', 'team-free')}
						</button>
					</span>
				</div>
			</div>

			{isCollectOpen && <WhatWeCollectModal onClose={() => setCollectOpen(false)} />}
		</div>
	);
};

export default Finish;
