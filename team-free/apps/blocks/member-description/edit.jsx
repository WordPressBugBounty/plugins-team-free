/**
 * Member Description — editor component.
 *
 * Renders a short placeholder description inside the styled `#uniqueId` div (so
 * the `#uniqueId …` dynamic-CSS selectors match editor + frontend). On the
 * frontend the block resolves the CURRENT queried member and prints their real
 * post content (see Member_Description::render_block()).
 *
 * Static placeholder, no `useMembers` — same reasoning as Member Bio / Member
 * Name / Member Designation: the member varies per request, so one arbitrary
 * member previews nothing useful. It also keeps the canvas SHORT: this field is
 * the member's whole post content, and a real one runs to hundreds of words,
 * burying every other block in the layout while designing.
 */

import { useMemo } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

import { BlockInspectorTabs } from '../../components';
import useUniqueId from '../../hooks/useUniqueId';
import dynamicCss from './dynamicCss';
import { extractGoogleFontImports } from '../../utils/googleFonts.js';
import Inspector from './inspect';
import ExtraIdWrapper from '../../shared/ExtraIdWrapper.jsx';
import { TogglePanelBodyProvider } from '../../hooks/togglePanelBodyContext';

// Two sentences — long enough to read as the "full description" field next to
// the one-line Member Bio, short enough to keep the canvas workable.
// Deliberately untranslated: it stands in for member text, not UI copy.
const PREVIEW_DESCRIPTION =
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
	'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

export default function Edit({ clientId, attributes, setAttributes }) {
	const { uniqueId } = attributes;

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-member-description-', 'sptp/');

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
					attributes={{ ...attributes, blockName: 'member-description' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/member-details/field-blocks#member-description"
					readyPatternsLink="https://shapedplugin.com/plugin/wp-team-pro/#patterns"
					previewLink="https://shapedplugin.com/plugin/wp-team-pro/"
				/>

				{/* Custom CSS ID renders as its own outer div, never replacing
				    #uniqueId — the editor twin of render_block_callback(). */}
				<ExtraIdWrapper id={attributes.additionalId}>
					<div
						id={uniqueId}
						className={`sp-smart-team-member-description ${attributes.additionalCssClass || ''}`.trim()}
					>
						<p className="sp-smart-team-member-description__text">
							{PREVIEW_DESCRIPTION}
						</p>
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
