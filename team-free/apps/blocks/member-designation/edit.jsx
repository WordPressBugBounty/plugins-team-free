/**
 * Member Designation — editor component.
 *
 * Renders PLACEHOLDER text inside the styled `#uniqueId` div (so the
 * `#uniqueId …` dynamic-CSS selectors match editor + frontend). Like Member
 * Name / Member Image / Member Photo Gallery it deliberately does NOT fetch a
 * member (no `useMembers`): this block is built on the Member Details Page
 * template, where the member varies per request, so previewing one arbitrary
 * member's designation says nothing useful — the placeholder exercises the
 * alignment and typography controls just as well, and costs no REST request.
 * The frontend renders the CURRENT queried member's real designation (see
 * Member_Designation::render_block()).
 */

import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

import { BlockInspectorTabs } from '../../components';
import useUniqueId from '../../hooks/useUniqueId';
import dynamicCss from './dynamicCss';
import { extractGoogleFontImports } from '../../utils/googleFonts.js';
import Inspector from './inspect';
import ExtraIdWrapper from '../../shared/ExtraIdWrapper.jsx';
import { TogglePanelBodyProvider } from '../../hooks/togglePanelBodyContext';

export default function Edit({ clientId, attributes, setAttributes }) {
	const { uniqueId } = attributes;

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-member-designation-', 'sptp/');

	const designation = __('Member Designation', 'team-free');

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
					attributes={{ ...attributes, blockName: 'member-designation' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/member-details/field-blocks#member-designation"
					readyPatternsLink="https://shapedplugin.com/plugin/wp-team-pro/#patterns"
					previewLink="https://shapedplugin.com/plugin/wp-team-pro/"
				/>

				{/* Custom CSS ID renders as its own outer div, never replacing
				    #uniqueId — the editor twin of render_block_callback(). */}
				<ExtraIdWrapper id={attributes.additionalId}>
					<div
						id={uniqueId}
						className={`sp-smart-team-member-designation ${attributes.additionalCssClass || ''}`.trim()}
					>
						<p className="sp-smart-team-member-designation__text">{designation}</p>
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
