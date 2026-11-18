/**
 * Ajax Pagination — editor component.
 *
 * Renders the static Pagination preview inside the styled `#uniqueId` div (so
 * the `#uniqueId …` dynamic-CSS selectors match editor + frontend) and the
 * inspector panels from inspect.js.
 */

import { useMemo } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

import { BlockInspectorTabs } from '../../components';
import useUniqueId from '../../hooks/useUniqueId';
import dynamicCss from './dynamicCss';
import { extractGoogleFontImports } from '../../utils/googleFonts.js';
import Inspector from './inspect';
import Pagination from './Pagination';
import ExtraIdWrapper from '../../shared/ExtraIdWrapper.jsx';
import { TogglePanelBodyProvider } from '../../hooks/togglePanelBodyContext';

export default function Edit({ clientId, attributes, setAttributes }) {
	const { uniqueId } = attributes;

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-ajax-pagination-', 'sptp/');

	const blockStyling = useMemo(
		() => extractGoogleFontImports(attributes) + dynamicCss(attributes),
		[attributes]
	);

	const blockProps = useBlockProps({ className: 'sp-smart-team-wrapper' });

	return (
		<div {...blockProps}>
			<style dangerouslySetInnerHTML={{ __html: blockStyling }} />

			<TogglePanelBodyProvider>
				<BlockInspectorTabs
					attributes={{ ...attributes, blockName: 'ajax-pagination' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/blocks/ajax-pagination"
					readyPatternsLink="https://shapedplugin.com/plugin/wp-team-pro/#patterns"
					previewLink="https://shapedplugin.com/plugin/wp-team-pro/"
				/>

				{/* Custom CSS ID renders as its own outer div, never replacing
				    #uniqueId — the editor twin of render_block_callback(). */}
				<ExtraIdWrapper id={attributes.additionalId}>
					<div
						id={uniqueId}
						className={`sp-smart-team-ajax-pagination ${attributes.additionalCssClass || ''}`.trim()}
					>
						<Pagination attributes={attributes} />
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
