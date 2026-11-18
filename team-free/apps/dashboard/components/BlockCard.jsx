import { __ } from '@wordpress/i18n';
import { getBlockInfo } from '../constants/blocksInfo';
import ProBadge from './ProBadge';
import { DemoLinkIcon, DocsLinkIcon } from './icons';

/**
 * A single block row: icon box + title + Demo/Docs links, with a visibility
 * switch on the right (Figma 785:12812). A Pro-only block carries the crown
 * + PRO pill (same as wp-carousel) in its top-right corner and a disabled switch.
 *
 * @param {Object}   props
 * @param {Object}   props.block    Active-block entry: { name, show }.
 * @param {boolean}  props.isPro    Whether the block is Pro-only.
 * @param {boolean}  props.isSaving A save is in flight; the switch waits for it.
 * @param {Function} props.onToggle Called with the block name when switched.
 */
const BlockCard = ({ block, isPro = false, isSaving = false, onToggle }) => {
	const { title, Icon, demoLink, docLink } = getBlockInfo(block.name);

	return (
		<div className={`sptp-block-card${isPro ? ' is-pro' : ''}`}>
			<div className="sptp-block-card__main">
				<span className="sptp-block-card__icon">{Icon && <Icon />}</span>
				<div className="sptp-block-card__content">
					<h4 className="sptp-block-card__title">{title}</h4>
					<div className="sptp-block-card__links">
						{demoLink && (
							<a href={demoLink} target="_blank" rel="noopener noreferrer">
								<DemoLinkIcon />
								{__('Demo', 'team-free')}
							</a>
						)}
						{docLink && (
							<a href={docLink} target="_blank" rel="noopener noreferrer">
								<DocsLinkIcon />
								{__('Docs', 'team-free')}
							</a>
						)}
					</div>
				</div>
			</div>

			<button
				type="button"
				role="switch"
				aria-checked={!isPro && !!block.show}
				aria-label={title}
				className={`sptp-switch${!isPro && block.show ? ' is-on' : ''}`}
				disabled={isPro || isSaving}
				onClick={() => onToggle(block.name)}
			>
				<span className="sptp-switch__knob" />
			</button>

			{isPro && <ProBadge className="sptp-block-card__pro" />}
		</div>
	);
};

export default BlockCard;
