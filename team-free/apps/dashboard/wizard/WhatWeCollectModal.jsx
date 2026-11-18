import { __ } from '@wordpress/i18n';
import { createInterpolateElement, useEffect } from '@wordpress/element';
import { ExternalArrowIcon } from './Icons';

/* Every field Diagnostics::collect() sends, in the readme's words — WordPress.org
   guideline 7 wants the consent copy to name each one (docs/wordpress-org.md §7). */
const COLLECTED = [
	__('Site administrator email address', 'team-free'),
	__('Site URL and language', 'team-free'),
	__('WordPress, PHP, Smart Team and Smart Team database versions', 'team-free'),
	__('Active theme name, and the name and version of each active plugin', 'team-free'),
	__('Names of the Smart Team blocks the site uses (no team member content)', 'team-free'),
];

/**
 * The Finish step's "What We Collect?" dialog — the twin of Pro's
 * WhatWeCollectModal, on plain markup because the dashboard avoids
 * `@wordpress/components` (~1 MB). Escape, the close button or the backdrop
 * dismisses it.
 *
 * @param {Object}   props
 * @param {Function} props.onClose Dismiss the modal.
 */
const WhatWeCollectModal = ({ onClose }) => {
	useEffect(() => {
		const onKey = (event) => {
			if ('Escape' === event.key) {
				onClose();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [onClose]);

	return (
		<div className="sptp-wizard-collect-overlay" onClick={onClose} role="presentation">
			<div
				className="sptp-wizard-collect-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="sptp-wizard-collect-title"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="sptp-wizard-collect-modal__header">
					<h2 id="sptp-wizard-collect-title" className="sptp-wizard-collect-modal__title">
						{__('What We Collect?', 'team-free')}
					</h2>
					<button
						type="button"
						className="sptp-wizard-collect-modal__close"
						onClick={onClose}
						aria-label={__('Close', 'team-free')}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							aria-hidden="true"
							focusable="false"
						>
							<path d="m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" />
						</svg>
					</button>
				</div>
				<hr />
				<p className="sptp-wizard-collect-modal__text">
					{__(
						'We collect only diagnostic data and basic plugin usage information. This may include:',
						'team-free'
					)}
				</p>
				<ul className="sptp-wizard-collect-modal__list">
					{COLLECTED.map((item) => (
						<li key={item} className="sptp-wizard-collect-modal__text">
							{item}
						</li>
					))}
				</ul>
				<p className="sptp-wizard-collect-modal__text">
					{__(
						'This information helps us improve performance, fix issues faster, and ensure',
						'team-free'
					)}{' '}
					<strong>{__('Smart Team', 'team-free')}</strong>{' '}
					{__('stays compatible with the popular plugins and themes.', 'team-free')}
				</p>
				<p className="sptp-wizard-collect-modal__text">
					{createInterpolateElement(
						__(
							'We collect your admin email address and first and last name but <b>no other personal data</b>, and we <b>never send spam</b>—promise.',
							'team-free'
						),
						{ b: <strong /> }
					)}
				</p>
				<p className="sptp-wizard-collect-modal__text">
					{__('Your Privacy is First', 'team-free')}{' '}
					<a
						href="https://shapedplugin.com/information-we-collect/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('Learn More', 'team-free')}
						<ExternalArrowIcon />
					</a>
				</p>
			</div>
		</div>
	);
};

export default WhatWeCollectModal;
