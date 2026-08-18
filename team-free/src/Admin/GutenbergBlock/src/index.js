import icons from './shortcode/blockIcon';
import { escapeAttribute, escapeHTML } from "@wordpress/escape-html";
import DynamicShortcodeInput from './shortcode/dynamicShortcode';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { PanelBody, PanelRow} from '@wordpress/components';
import { createElement, useEffect, useRef } from '@wordpress/element';
import ServerSideRender from '@wordpress/server-side-render';
const el = createElement;

/**
 * `useBlockProps` was introduced with Block API v2 in WordPress 5.6. Older
 * releases still wrap the block themselves, so fall back to empty props there.
 */
const useBlockPropsCompat = 'function' === typeof useBlockProps ? useBlockProps : () => ({});

/**
 * Matches `[wpteam id="123"]` so legacy Shortcode blocks can be converted.
 */
const SHORTCODE_PATTERN = /\[wpteam[^\]]*\bid=["']?(\d+)/;

/**
 * Register: Smart Team Free Gutenberg Block.
 */
registerBlockType(
    'sp-team-pro/shortcode',
    {
        // Block API v3 marks the block as compatible with the iframed editor
        // canvas, which WordPress 7.1 uses for every editor.
        apiVersion: 3,
        title: __( 'Smart Team', 'team-free'),
        description: __( 'Use Smart Team to insert a team in your page', 'team-free'),
		icon: icons.teamFree,
		category: 'common',
		supports: {
			html: false,
		},
		transforms: {
			from: [
				{
					type: 'block',
					blocks: [ 'core/shortcode' ],
					isMatch: ( { text } ) => !! text && SHORTCODE_PATTERN.test( text ),
					transform: ( { text } ) => createBlock( 'sp-team-pro/shortcode', {
						shortcode: SHORTCODE_PATTERN.exec( text )[1],
					} ),
				},
			],
			to: [
				{
					type: 'block',
					blocks: [ 'core/shortcode' ],
					transform: ( { shortcode } ) => createBlock( 'core/shortcode', {
						text: '[wpteam id="' + shortcode + '"]',
					} ),
				},
			],
		},
		edit: props => {
			const { attributes, setAttributes } = props;
			var shortCodeList = TeamFreeGbScript.shortCodeList;
			const isPreview = !! attributes.preview;
			const hasSelection = !! attributes.shortcode && 0 != attributes.shortcode;
			const previewRef = useRef( null );
			const blockProps = useBlockPropsCompat( {} );

			/**
			 * Initialize the team carousel that `ServerSideRender` just rendered.
			 *
			 * Since WordPress 6.3 the block canvas is an iframe, so the rendered
			 * markup, jQuery and Swiper all live in `ownerDocument.defaultView` and
			 * not in the editor window. The canvas document and the server-side
			 * render both settle asynchronously, so wait for this block's own section
			 * and for the canvas scripts, then hand over to the front-end initializer.
			 */
			useEffect( () => {
				if ( isPreview || ! hasSelection ) {
					return;
				}

				// `ServerSideRender` keeps the previous markup on screen while it
				// reloads, so match this block's own section instead of any team.
				const sectionSelector = '#sptp-' + String( attributes.shortcode ).replace( /[^0-9]/g, '' );
				const interval = 150;
				let attempts = 0;
				let waitedForScripts = 0;

				const timer = setInterval( () => {
					attempts++;

					// Bail out rather than polling forever when the render never arrives.
					if ( attempts > 400 ) {
						clearInterval( timer );
						return;
					}

					const node = previewRef.current;
					const view = node && node.ownerDocument ? node.ownerDocument.defaultView : null;

					if ( ! node || ! view || ! view.jQuery || ! node.querySelector( sectionSelector ) ) {
						return;
					}

					// The canvas scripts are parsed while the blocks mount, so make sure
					// they all arrived before initializing. Stop waiting after five
					// seconds and run whatever is available in case a site filtered one
					// of the handles out.
					const scriptsReady = view.Swiper && 'function' === typeof view.SPTeamCarouselInit;

					if ( ! scriptsReady ) {
						waitedForScripts += interval;

						if ( waitedForScripts < 5000 ) {
							return;
						}
					}

					clearInterval( timer );

					if ( 'function' === typeof view.SPTeamCarouselInit ) {
						view.SPTeamCarouselInit();
					}
				}, interval );

				return () => clearInterval( timer );
			}, [ isPreview, hasSelection, attributes.shortcode ] );

			let updateShortcode = ( updateShortcode ) => {
				setAttributes({shortcode: updateShortcode.target.value});
			}

			let shortcodeUpdate = (e) => {
				updateShortcode(e);
			}

			if( isPreview ) {
				return (
				  el('div', blockProps,
					el('img', { src: escapeAttribute( TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block-preview.svg' )})
				  )
				)
			}

			if ( shortCodeList.length === 0 ) {
				return (
				  el('div', blockProps,
					el('div', {className: 'components-placeholder components-placeholder is-large'}, 
					  el('div', {className: 'components-placeholder__label'}, 
						el('img', {className: 'block-editor-block-icon', src: escapeAttribute( TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block.svg' )}),
						escapeHTML( __('Smart Team', 'team-free') )
					  ),
					  el('div', {className: 'components-placeholder__instructions'}, 
						escapeHTML( __("No team found. ", "team-free") ),
						el('a', {href: escapeAttribute( TeamFreeGbScript.url )}, 
						  escapeHTML( __("Create a team now!", "team-free") )
						)
					  )
					)
				  )
				);
			}

			if ( ! hasSelection ) {
				return (
					el('div', blockProps,
						<InspectorControls>
							<PanelBody title="Select a Team">
								<PanelRow>
								<DynamicShortcodeInput
									attributes={attributes}
									shortCodeList={shortCodeList}
									shortcodeUpdate={shortcodeUpdate}
								/>
								</PanelRow>
							</PanelBody>
						</InspectorControls>,
						el('div', {className: 'components-placeholder components-placeholder is-large'}, 
						el('div', {className: 'components-placeholder__label'},
							el('img', { className: 'block-editor-block-icon', src: escapeAttribute( TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block.svg' )}),
							escapeHTML( __("Smart Team", "team-free") )
						),
						el('div', {className: 'components-placeholder__instructions'}, escapeHTML( __("Select a Team", "team-free") ) ),
						<DynamicShortcodeInput
							attributes={attributes}
							shortCodeList={shortCodeList}
							shortcodeUpdate={shortcodeUpdate}
						/>
						)
					)
				);
			}

			return (
				el('div', blockProps,
					<InspectorControls>
						<PanelBody title="Select a Team">
							<PanelRow>
							<DynamicShortcodeInput
								attributes={attributes}
								shortCodeList={shortCodeList}
								shortcodeUpdate={shortcodeUpdate}
							/>
							</PanelRow>
						</PanelBody>
					</InspectorControls>,
					el('div', { ref: previewRef, className: 'sptp-block-preview' },
						<ServerSideRender block="sp-team-pro/shortcode" attributes={attributes} />
					)
				)
			);
		},
        save() {
            // Rendering in PHP
            return null;
        },
} );
