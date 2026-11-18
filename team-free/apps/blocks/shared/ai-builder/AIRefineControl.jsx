import { __ } from '@wordpress/i18n';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import BrandMarkIcon from './BrandMarkIcon';
import { isAIBuilderEnabled } from './constants';
import { openAIBuilder } from './openerRegistry';
import './ai-builder.scss';

/**
 * Block-toolbar AI entry for a layout block. On a block still showing the
 * first-insert design picker it builds (a Ready Pattern may replace it);
 * once a design is chosen it refines the existing settings.
 *
 * @param {Object}  props
 * @param {string}  props.clientId     Block client id.
 * @param {string}  props.blockName    Block name.
 * @param {boolean} props.isConfigured Whether a card design has been chosen.
 * @return {JSX.Element|null} Toolbar control.
 */
export default function AIRefineControl({ clientId, blockName, isConfigured }) {
	if (!isAIBuilderEnabled()) {
		return null;
	}

	const label = isConfigured
		? __('Refine with AI', 'team-free')
		: __('Build with AI', 'team-free');

	return (
		<BlockControls group="other">
			<ToolbarGroup>
				<ToolbarButton
					className="sptp-ai-refine-toolbar-btn"
					icon={<BrandMarkIcon size={18} />}
					label={label}
					onClick={() => openAIBuilder({ clientId, blockName, isRefining: isConfigured })}
				>
					{label}
				</ToolbarButton>
			</ToolbarGroup>
		</BlockControls>
	);
}
