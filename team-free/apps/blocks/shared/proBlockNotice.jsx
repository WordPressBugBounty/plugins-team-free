/**
 * Canvas stand-in for a Pro-only block — port of wp-carousel-free's
 * ProBlockPlaceholder.
 *
 * An insertable Pro block (Pro_Gate::PRO_INSERTER_BLOCKS — today the 3D
 * Carousel): picking it in the inserter opens the "Do more with Smart Team
 * Pro" dialog (pro-upgrade/) and takes the block straight back out, with no
 * undo step. A copy already saved in a post (by Pro, before a downgrade) stays
 * put as a slim line whose "Learn more" opens the same dialog, so no content is
 * lost. Where no dialog host is mounted (the widgets screen) the block stays
 * and the line links to the pricing page.
 *
 * Every other Pro-only block (resume, video, additional / custom information,
 * the filters…) can't be inserted in Free, so it is only ever met in content
 * saved by Pro, e.g. a Single Page template built while Pro was active. That
 * author already knows Pro, so it gets one plain line saying the block is a
 * Pro block and is not shown on the site — no upgrade button.
 *
 * Calls useBlockProps so the wrapper keeps the editor's own block id/classes —
 * the block stays selectable, so the author can still delete it. Nothing here
 * touches the block's attributes (CLAUDE.md Rule 3).
 */

import { BlockIcon, useBlockProps } from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { createInterpolateElement, useEffect, useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { getProInserterBlockNames } from './proGate';
import { hasProUpgradeOpener, openProUpgradeDialog } from './pro-upgrade/openerRegistry';
import useInsertedTeaser from './pro-upgrade/useInsertedTeaser';
import './proBlockNotice.scss';

export const PRO_BLOCK_UPGRADE_URL =
	'https://getwpteam.com/pricing/?utm_source=free-plugin&utm_medium=pro-block';

/**
 * Insertable Pro block: hand off to the dialog on insert, else a slim line.
 *
 * @param {Object} props
 * @param {string} props.name     Full block name.
 * @param {string} props.clientId Block client id.
 * @return {Element} The line, or an empty wrapper while handing off.
 */
const ProInserterBlockLine = ({ name, clientId }) => {
	const blockProps = useBlockProps({ className: 'sp-smart-team-pro-block-placeholder' });
	const { justInserted, removeSilently } = useInsertedTeaser(clientId);
	const title = getBlockType(name)?.title || name;
	const hasDialog = hasProUpgradeOpener();
	const handsOff = justInserted && hasDialog;
	// StrictMode runs mount effects twice; a ref survives that, so the dialog
	// opens and the block goes once.
	const hasHandedOff = useRef(false);

	useEffect(() => {
		if (!handsOff || hasHandedOff.current) {
			return;
		}
		hasHandedOff.current = true;
		openProUpgradeDialog({ blockName: name });
		removeSilently();
		// Once, for the insert that mounted this block.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [handsOff]);

	if (handsOff) {
		return <div {...blockProps} />;
	}

	return (
		<div {...blockProps}>
			<div className="sp-smart-team-pro-block-placeholder__line">
				<span className="sp-smart-team-pro-block-placeholder__icon" aria-hidden="true">
					<BlockIcon icon={getBlockType(name)?.icon} />
				</span>
				<span className="sp-smart-team-pro-block-placeholder__text">
					{sprintf(
						/* translators: %s: Pro block title, e.g. "3D Carousel". */
						__('%s is a Smart Team Pro block.', 'team-free'),
						title
					)}
				</span>
				{hasDialog ? (
					<button
						type="button"
						className="sp-smart-team-pro-block-placeholder__learn-more"
						onClick={() => openProUpgradeDialog({ blockName: name })}
					>
						{__('Learn more', 'team-free')}
					</button>
				) : (
					<a
						className="sp-smart-team-pro-block-placeholder__learn-more"
						href={PRO_BLOCK_UPGRADE_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('Upgrade to Pro', 'team-free')}
					</a>
				)}
			</div>
		</div>
	);
};

/**
 * Pro-only block that can't be inserted in Free: one plain line.
 *
 * @param {Object} props
 * @param {string} props.name Full block name.
 * @return {Element} The line.
 */
const ProSavedBlockText = ({ name }) => {
	const blockProps = useBlockProps();
	const title = getBlockType(name)?.title || name;

	return (
		<div {...blockProps}>
			<p className="sp-smart-team-pro-block-text">
				{createInterpolateElement(
					sprintf(
						/* translators: %s: block title, e.g. "Additional Information". */
						__(
							'<b>%s</b> is a Pro block. It is not shown on your site in the free version.',
							'team-free'
						),
						title
					),
					{ b: <strong /> }
				)}
			</p>
		</div>
	);
};

/**
 * @param {Object} props
 * @param {string} props.name     Full block name.
 * @param {string} props.clientId Block client id.
 * @return {Element} The stand-in.
 */
const ProBlockNotice = ({ name, clientId }) =>
	getProInserterBlockNames().includes(name) ? (
		<ProInserterBlockLine name={name} clientId={clientId} />
	) : (
		<ProSavedBlockText name={name} />
	);

export default ProBlockNotice;
