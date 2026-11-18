import { __ } from '@wordpress/i18n';
import BlockVisibility from '../../components/BlockVisibility';

/**
 * Wizard step 2 — the same block switches the Dashboard's Blocks page renders,
 * writing the same `settings.active_blocks`.
 */
const Blocks = () => (
	<div className="sptp-wizard-step">
		<div className="sptp-wizard-step__head">
			<h2 className="sptp-wizard-step__title">
				{__('Enable the Blocks You Need', 'team-free')}
			</h2>
			<p className="sptp-wizard-step__desc">
				{__(
					'Turn on the blocks that match your workflow. You can update your selection anytime.',
					'team-free'
				)}
			</p>
		</div>
		<div className="sptp-wizard-step__body">
			<BlockVisibility />
		</div>
	</div>
);

export default Blocks;
