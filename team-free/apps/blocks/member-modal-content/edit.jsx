/**
 * Member Modal Content — editor component.
 *
 * Markup twin of Member_Modal_Content::render_block(), with InnerBlocks in
 * place of the rendered field blocks. The canvas shows the DIALOG only — no
 * fixed overlay and no entrance animation — so the modal is designed in place
 * like any other block instead of covering the editor.
 */

import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { BlockInspectorTabs } from '../../components';
import useUniqueId from '../../hooks/useUniqueId';
import dynamicCss from './dynamicCss';
import { extractGoogleFontImports } from '../../utils/googleFonts.js';
import Inspector from './inspect';
import ExtraIdWrapper from '../../shared/ExtraIdWrapper.jsx';
import { TogglePanelBodyProvider } from '../../hooks/togglePanelBodyContext';
import { CloseIcon } from './icons';
import { NAV_ARROW_ICONS } from '../carousel/icons';

// The member field blocks a details template is built from. Core blocks are
// allowed too (Columns/Group/…), so this is a hint, not a whitelist.
const TEMPLATE = [
	['sptp/member-image'],
	['sptp/member-name'],
	['sptp/member-designation'],
	['sptp/member-bio'],
	['sptp/member-skills'],
	['sptp/social-profile'],
];

export default function Edit({ clientId, attributes, setAttributes }) {
	const {
		uniqueId,
		displayStyle,
		popupAnimation,
		slideInPosition,
		closeIconPosition,
		showCloseIcon,
		showNavigation,
		navigationStyle,
		navigationPosition,
	} = attributes;

	// Both arrows share one glyph (style.scss rotates the prev 180°) — the
	// Carousel block's set, so the canvas matches Carousel::nav_arrow_svg().
	const navIcon = NAV_ARROW_ICONS[navigationStyle] || NAV_ARROW_ICONS['chevron-outline'];

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-member-modal-', 'sptp/');

	const blockStyling = useMemo(
		() => extractGoogleFontImports(attributes) + dynamicCss(attributes),
		[attributes]
	);

	const isPopup = displayStyle !== 'slide-in';

	// Twin of the class list in render_block(), plus `is-editor` — that one
	// class is what keeps the dialog in the flow instead of fixed over the page.
	const classes = [
		'sp-smart-team-member-modal',
		`sp-smart-team-member-modal--${isPopup ? 'popup' : 'slide-in'}`,
		isPopup
			? `sp-smart-team-member-modal--anim-${popupAnimation || 'zoom-out'}`
			: `sp-smart-team-member-modal--side-${slideInPosition || 'right'}`,
		`sp-smart-team-member-modal--icon-${closeIconPosition || 'inside-right'}`,
		showNavigation ? 'sp-smart-team-member-modal--has-nav' : '',
		'is-editor',
		attributes.additionalCssClass || '',
	]
		.filter(Boolean)
		.join(' ');

	const blockProps = useBlockProps({ className: 'sp-smart-team-wrapper' });
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'sp-smart-team-member-modal__content' },
		{ template: TEMPLATE, templateLock: false }
	);

	return (
		<div {...blockProps}>
			<style dangerouslySetInnerHTML={{ __html: blockStyling }} />

			<TogglePanelBodyProvider>
				<BlockInspectorTabs
					attributes={{ ...attributes, blockName: 'member-modal-content' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/member-details/modal#member-modal-content"
					readyPatternsLink="https://shapedplugin.com/plugin/wp-team-pro/#patterns"
					previewLink="https://shapedplugin.com/plugin/wp-team-pro/"
				/>

				<ExtraIdWrapper id={attributes.additionalId}>
					<div id={uniqueId} className={classes}>
						<div className="sp-smart-team-member-modal__dialog" role="document">
							{!!showCloseIcon && (
								<button
									type="button"
									className="sp-smart-team-member-modal__close"
									aria-label={__('Close', 'team-free')}
									onClick={(event) => event.preventDefault()}
								>
									<CloseIcon />
								</button>
							)}

							{!!showNavigation && (
								<div
									className={`sp-smart-team-member-modal__nav-arrows sp-smart-team-member-modal__nav-arrows--${
										navigationPosition || 'vertical_center'
									}`}
								>
									<button
										type="button"
										className="sp-smart-team-member-modal__nav sp-smart-team-member-modal__nav--prev"
										aria-label={__('Previous member', 'team-free')}
										onClick={(event) => event.preventDefault()}
									>
										{navIcon}
									</button>
									<button
										type="button"
										className="sp-smart-team-member-modal__nav sp-smart-team-member-modal__nav--next"
										aria-label={__('Next member', 'team-free')}
										onClick={(event) => event.preventDefault()}
									>
										{navIcon}
									</button>
								</div>
							)}

							<div {...innerBlocksProps} />
						</div>
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
