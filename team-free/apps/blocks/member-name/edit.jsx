/**
 * Member Name — editor component.
 *
 * Renders PLACEHOLDER text inside the styled `#uniqueId` div (so the
 * `#uniqueId …` dynamic-CSS selectors match editor + frontend). Like the Member
 * Image and Member Photo Gallery blocks it deliberately does NOT fetch a member
 * (no `useMembers`): this block is built on the Member Details Page template,
 * where the member varies per request, so previewing one arbitrary member's
 * name says nothing useful — the placeholder shows the tag, alignment and
 * typography just as well, and costs no REST request. The frontend renders the
 * CURRENT queried member's real name (see Member_Name::render_block()).
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

const ALLOWED_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'p'];

export default function Edit({ clientId, attributes, setAttributes }) {
	const { uniqueId, nameTag } = attributes;

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-member-name-', 'sptp/');

	const nameText = __('Member Name', 'team-free');

	const blockStyling = useMemo(
		() => extractGoogleFontImports(attributes) + dynamicCss(attributes),
		[attributes]
	);

	const blockProps = useBlockProps({ className: 'sp-smart-team-wrapper' });

	const Tag = ALLOWED_TAGS.includes(nameTag) ? nameTag : 'h2';

	return (
		<div {...blockProps}>
			<style dangerouslySetInnerHTML={{ __html: blockStyling }} />

			<TogglePanelBodyProvider>
				<BlockInspectorTabs
					attributes={{ ...attributes, blockName: 'member-name' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/member-details/field-blocks#member-name"
					readyPatternsLink="https://shapedplugin.com/plugin/wp-team-pro/#patterns"
					previewLink="https://shapedplugin.com/plugin/wp-team-pro/"
				/>

				{/* Custom CSS ID renders as its own outer div, never replacing
				    #uniqueId — the editor twin of render_block_callback(). */}
				<ExtraIdWrapper id={attributes.additionalId}>
					<div
						id={uniqueId}
						className={`sp-smart-team-member-name ${attributes.additionalCssClass || ''}`.trim()}
					>
						<Tag className="sp-smart-team-member-name__text">{nameText}</Tag>
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
