/**
 * Member Image — editor component.
 *
 * Renders a PLACEHOLDER photo inside the styled `#uniqueId` div, using the same
 * shared card avatar markup as the frontend so the shared SCSS (ratio +
 * hover-effect modifiers) and the dynamic CSS resolve in both views.
 *
 * The preview deliberately does NOT pull a real member's photo — see
 * shared/placeholderImage.js. The frontend renders the CURRENT queried member's
 * photo (see Member_Image::render_block()).
 */

import { useMemo } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

import { BlockInspectorTabs } from '../../components';
import useUniqueId from '../../hooks/useUniqueId';
import dynamicCss from './dynamicCss';
import { extractGoogleFontImports } from '../../utils/googleFonts.js';
import Inspector from './inspect';
import ExtraIdWrapper from '../../shared/ExtraIdWrapper.jsx';
import { PLACEHOLDER_IMAGE_SRC } from '../../shared/placeholderImage';
import { TogglePanelBodyProvider } from '../../hooks/togglePanelBodyContext';
import { resolveImageHoverEffect } from '../shared/proGate';

export default function Edit({ clientId, attributes, setAttributes }) {
	const { uniqueId, imageAspectRatio, imageHoverEffect, imageLazyLoad } = attributes;

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-member-image-', 'sptp/');

	// A Pro hover effect previews as none (twin of Pro_Gate::image_hover_effect()).
	const effect = resolveImageHoverEffect(imageHoverEffect);

	const avatarClass = [
		'sp-smart-team-card__avatar',
		`sp-smart-team-card__avatar--ratio-${imageAspectRatio || '1-1'}`,
		effect !== 'none' ? `sp-smart-team-card__avatar--effect-${effect}` : '',
	]
		.filter(Boolean)
		.join(' ');

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
					attributes={{ ...attributes, blockName: 'member-image' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/member-details/field-blocks#member-image"
					readyPatternsLink="https://shapedplugin.com/plugin/wp-team-pro/#patterns"
					previewLink="https://shapedplugin.com/plugin/wp-team-pro/"
				/>

				{/* Custom CSS ID renders as its own outer div, never replacing
				    #uniqueId — the editor twin of render_block_callback(). */}
				<ExtraIdWrapper id={attributes.additionalId}>
					<div
						id={uniqueId}
						className={`sp-smart-team-member-image ${attributes.additionalCssClass || ''}`.trim()}
					>
						<div className={avatarClass}>
							<div className="sp-smart-team-card__image-wrap">
								<img
									className="sp-smart-team-card__image"
									src={PLACEHOLDER_IMAGE_SRC}
									alt=""
									loading={imageLazyLoad ? 'lazy' : 'eager'}
								/>
							</div>
						</div>
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
