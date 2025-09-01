import icons from './shortcode/blockIcon';
import { escapeAttribute, escapeHTML } from "@wordpress/escape-html";
import DynamicShortcodeInput from './shortcode/dynamicShortcode';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { PanelBody, PanelRow} from '@wordpress/components';
import { Fragment, createElement } from '@wordpress/element';
const { serverSideRender: ServerSideRender } = wp; 
const el = createElement;

/**
 * Register: SmartTeam Free Gutenberg Block.
 */
registerBlockType(
    'sp-team-pro/shortcode',
    {
        title: __( 'SmartTeam', 'team-free'),
        description: __( 'Use SmartTeam to insert a team in your page', 'team-free'),
		icon: icons.teamFree,
		category: 'common',
		supports: {
			html: false,
		},
		edit: props => {
			const { attributes, setAttributes } = props;
			var shortCodeList = TeamFreeGbScript.shortCodeList;

			let scriptLoad = ( shortcodeId ) => {
				let spspBlockLoaded = false;
				let spspBlockLoadedInterval = setInterval(function () {
					let uniqId = jQuery("#sptp-" + shortcodeId).parents().attr('id');
					if (document.getElementById(uniqId)) {
						//Actual functions goes here
						jQuery.getScript(TeamFreeGbScript.loodScript);
						spspBlockLoaded = true;
						uniqId = '';
					}
					if (spspBlockLoaded) {
						clearInterval(spspBlockLoadedInterval);
					}
					if ( 0 == shortcodeId ) {
						clearInterval(spspBlockLoadedInterval);
					}
				}, 100);
			}

			let updateShortcode = ( updateShortcode ) => {
				setAttributes({shortcode: updateShortcode.target.value});
			}

			let shortcodeUpdate = (e) => {
				updateShortcode(e);
				let shortcodeId = e.target.value;
				scriptLoad(shortcodeId);	
			}

			if (jQuery('.sptp-section:not(.sptp-carousel-loaded)').length > 0 ) {
				let shortcodeId = escapeAttribute( attributes.shortcode );
				scriptLoad(shortcodeId);
			  }

			if( attributes.preview ) {
				return (
				  el('div', {},
					el('img', { src: escapeAttribute( TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block-preview.svg' )})
				  )
				)
			}

			if ( shortCodeList.length === 0 ) {
				return (
				  <Fragment>
					{
					  el('div', {className: 'components-placeholder components-placeholder is-large'}, 
						el('div', {className: 'components-placeholder__label'}, 
						  el('img', {className: 'block-editor-block-icon', src: escapeAttribute( TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block.svg' )}),
						  escapeHTML( __('SmartTeam', 'team-free') )
						),
						el('div', {className: 'components-placeholder__instructions'}, 
						  escapeHTML( __("No team found. ", "team-free") ),
						  el('a', {href: escapeAttribute( TeamFreeGbScript.url )}, 
							escapeHTML( __("Create a team now!", "team-free") )
						  )
						)
					  )
					}
				  </Fragment>
				);
			}

			if ( ! attributes.shortcode || attributes.shortcode == 0 ) {
				return (
					<Fragment>
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
						</InspectorControls>
						{
							el('div', {className: 'components-placeholder components-placeholder is-large'}, 
							el('div', {className: 'components-placeholder__label'},
								el('img', { className: 'block-editor-block-icon', src: escapeAttribute( TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block.svg' )}),
								escapeHTML( __("SmartTeam", "team-free") )
							),
							el('div', {className: 'components-placeholder__instructions'}, escapeHTML( __("Select a Team", "team-free") ) ),
							<DynamicShortcodeInput
								attributes={attributes}
								shortCodeList={shortCodeList}
								shortcodeUpdate={shortcodeUpdate}
							/>
							)
						}
					</Fragment>
				);
			}

			return (
				<Fragment>
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
					</InspectorControls>
					<ServerSideRender block="sp-team-pro/shortcode" attributes={attributes} />
				</Fragment>
			);
		},
        save() {
            // Rendering in PHP
            return null;
        },
} );

