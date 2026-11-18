import {
	InspectorControls,
	store as blockEditorStore,
	useBlockEditContext,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { openReadyPatterns } from '../../blocks/shared/ready-patterns/openerRegistry';
import {
	BLOCK_NAME_TO_CATEGORY,
	layoutBlockNameFor,
} from '../../blocks/shared/ready-patterns/constants';
import './editor.scss';

const BlockInspectorTabs = ({
	attributes,
	setAttributes,
	General = null,
	Advanced = null,
	icon = null,
	title = '',
	description = '',
	documentLink = '',
}) => {
	const { clientId, name } = useBlockEditContext();
	// Ready Patterns exist only for the parent layout blocks (Grid, Carousel, Overlay).
	const hasReadyPatterns = Boolean(BLOCK_NAME_TO_CATEGORY[name]);
	const layoutBlockName = useSelect(
		(select) => layoutBlockNameFor(clientId, select(blockEditorStore)),
		[clientId]
	);

	return (
		<InspectorControls>
			<div className="sp-smart-team-pro-block-header">
				{(icon || title || description) && (
					<div className="sp-smart-team-pro-block-header__intro">
						{icon && <div className="sp-smart-team-pro-block-header__icon">{icon}</div>}
						<div className="sp-smart-team-pro-block-header__meta">
							{title && (
								<h2 className="sp-smart-team-pro-block-header__title">{title}</h2>
							)}
							{description && (
								<p className="sp-smart-team-pro-block-header__description">
									{description}
								</p>
							)}
						</div>
					</div>
				)}

				<div className="sp-smart-team-pro-block-header__actions">
					{hasReadyPatterns && (
						<button
							type="button"
							className="sp-smart-team-pro-block-header__action sp-smart-team-pro-block-header__action--patterns"
							onClick={() =>
								openReadyPatterns({ clientId, blockName: layoutBlockName })
							}
						>
							{__('Ready Patterns', 'team-free')}
						</button>
					)}
					{documentLink && (
						<a
							className="sp-smart-team-pro-block-header__action sp-smart-team-pro-block-header__action--docs"
							href={documentLink}
							target="_blank"
							rel="noopener noreferrer"
						>
							{__('Documentation', 'team-free')}
						</a>
					)}
				</div>
			</div>

			{/* togglePanelBodyContext stamps `sp-flash` on this wrapper when a
			    canvas element click opens a panel, briefly outlining the opened
			    panel (see editor.scss). */}
			<div className="sp-smart-team-block-panels">
				{General && <General attributes={attributes} setAttributes={setAttributes} />}
				{Advanced && <Advanced attributes={attributes} setAttributes={setAttributes} />}
			</div>
		</InspectorControls>
	);
};

export default BlockInspectorTabs;
