/**
 * Member Bio — editor component.
 *
 * Renders PLACEHOLDER text inside the styled `#uniqueId` div (so the
 * `#uniqueId …` dynamic-CSS selectors match editor + frontend). Like Member
 * Name / Member Designation / Member Image it deliberately does NOT fetch a
 * member (no `useMembers`): this block is built on the Member Details Page
 * template, where the member varies per request, so previewing one arbitrary
 * member's Short Bio says nothing useful — and a member who left the field
 * empty would make the block vanish mid-design. Two lines of lorem exercise the
 * alignment and typography controls just as well, at no REST cost. The frontend
 * renders the CURRENT queried member's real Short Bio (see
 * Member_Bio::render_block()).
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

/* ~2 lines of filler at the default 16px type — deliberately NOT translated:
   it stands in for the member's own text, it is not UI copy. */
const PREVIEW_BIO =
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim.';

export default function Edit({ clientId, attributes, setAttributes }) {
	const { uniqueId } = attributes;

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-member-bio-', 'sptp/');

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
					attributes={{ ...attributes, blockName: 'member-bio' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/member-details/field-blocks#member-bio"
					readyPatternsLink="https://shapedplugin.com/plugin/wp-team-pro/#patterns"
					previewLink="https://shapedplugin.com/plugin/wp-team-pro/"
				/>

				{/* Custom CSS ID renders as its own outer div, never replacing
				    #uniqueId — the editor twin of render_block_callback(). */}
				<ExtraIdWrapper id={attributes.additionalId}>
					<div
						id={uniqueId}
						className={`sp-smart-team-member-bio ${attributes.additionalCssClass || ''}`.trim()}
					>
						<p className="sp-smart-team-member-bio__text">{PREVIEW_BIO}</p>
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
