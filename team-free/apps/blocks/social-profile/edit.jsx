/**
 * Social Profile — editor component.
 *
 * Renders DUMMY social icons inside the styled `#uniqueId` div, using the same
 * `.sp-smart-team-card__social` markup as the frontend so the shared card SCSS +
 * dynamic CSS resolve in both views. Like Member Name / Member Skills /
 * Additional Information it deliberately does NOT fetch a member (no
 * `useMembers`): the block is built on the Member Details Page template where
 * the member varies per request, and a member with no socials would leave the
 * canvas empty with nothing to style. The frontend renders the CURRENT queried
 * member's real profiles (see Social_Profile::render_block()).
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

const label = (group) => (group || '').replace('icon-', '').replace(/^\w/, (c) => c.toUpperCase());

// Placeholder profiles for the editor preview — the shape MemberQuery's
// normalize_socials() returns (`{ group, link, icon }`). The groups are real
// slugs from the plugin's own social list, and the icon classes are what
// MemberQuery::icon_class() derives from them (Font Awesome for non-fontello
// groups), so the glyphs resolve exactly as on the frontend. Four icons give
// the Icon Style / size / gap / alignment controls something to act on; the
// links are empty because the canvas anchors never navigate anyway.
const PREVIEW_SOCIALS = [
	{ group: 'facebook', link: '', icon: 'fa fa-facebook' },
	{ group: 'twitter', link: '', icon: 'icon-fontello sp-team-icon-x-twitter' },
	{ group: 'linkedin', link: '', icon: 'fa fa-linkedin' },
	{ group: 'instagram', link: '', icon: 'fa fa-instagram' },
];

export default function Edit({ clientId, attributes, setAttributes }) {
	const { uniqueId, socialIconStyle } = attributes;

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-social-profile-', 'sptp/');

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
					attributes={{ ...attributes, blockName: 'social-profile' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/member-details/field-blocks#social-profile"
					readyPatternsLink="https://shapedplugin.com/plugin/wp-team-pro/#patterns"
					previewLink="https://shapedplugin.com/plugin/wp-team-pro/"
				/>

				<ExtraIdWrapper id={attributes.additionalId}>
					<div
						id={uniqueId}
						className={`sp-smart-team-social-profile ${attributes.additionalCssClass || ''}`.trim()}
					>
						<ul
							className={`sp-smart-team-card__social sp-smart-team-card__social--${
								socialIconStyle || 'style-3'
							}`}
						>
							{PREVIEW_SOCIALS.map((social, index) => (
								<li key={index}>
									<a
										className={`sptp-${social.group}`}
										href={social.link || '#'}
										title={label(social.group)}
										onClick={(event) => event.preventDefault()}
									>
										<i className={social.icon}></i>
									</a>
								</li>
							))}
						</ul>
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
