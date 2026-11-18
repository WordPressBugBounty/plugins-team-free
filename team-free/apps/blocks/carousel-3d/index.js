/**
 * 3D Carousel — Pro-only block registration.
 *
 * Registered (with its real attribute schema, matched to attributes.php) so
 * a page built in Pro never shows an invalid-block warning once Pro is
 * removed, but carries none of the 3D Carousel's real edit UI — the canvas
 * gate in inserterVisibility.js (editor.BlockEdit) always shows the Pro notice
 * (shared/proBlockNotice.jsx) instead (CLAUDE.md Rule 8; see
 * blocks/Types/Carousel_3d/Carousel_3d.php for the frontend fallback to
 * Carousel). The inserter lists it last in the Smart Team section with a crown
 * chip (Pro_Gate::PRO_INSERTER_BLOCKS); its hover preview is the static image
 * blocks/assets/images/preview/carousel-3d.svg (Figma 765:39413).
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Carousel3dIcon } from './icons';

const PREVIEW_IMAGE = `${window.sptpBlocksEditor?.blocksUrl || ''}assets/images/preview/carousel-3d.svg`;

function PreviewWrapper() {
	const blockProps = useBlockProps();
	return (
		<div {...blockProps}>
			<img
				src={PREVIEW_IMAGE}
				width={236}
				height={158}
				alt=""
				style={{ display: 'block', width: '100%', height: 'auto' }}
			/>
		</div>
	);
}

registerBlockType('sptp/carousel-3d', {
	apiVersion: 3,
	title: __('3D Carousel', 'team-free'),
	description: __(
		'Display team members as overlay cards in a 3D or panorama carousel.',
		'team-free'
	),
	category: 'sptp',
	icon: <Carousel3dIcon />,
	keywords: [
		__('team', 'team-free'),
		__('3d', 'team-free'),
		__('carousel', 'team-free'),
		__('coverflow', 'team-free'),
		__('panorama', 'team-free'),
	],
	supports: {
		align: ['wide', 'full'],
		html: false,
	},
	example: {
		attributes: {
			isPreview: true,
		},
	},
	edit: (props) => (props.attributes.isPreview ? <PreviewWrapper /> : null),
	save: () => null,
});
