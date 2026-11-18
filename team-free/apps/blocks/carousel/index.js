/**
 * Carousel block registration (sptp/carousel).
 *
 * Dynamic block — the frontend renders via Carousel::render_block(); the
 * editor mounts a real Swiper preview (edit.jsx + useSwiperConfig).
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

import buildBlockTransforms from '../shared/transforms/blockTransforms';
import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { CarouselIcon, CarouselPreviewIcon } from './icons';

function PreviewWrapper() {
	const blockProps = useBlockProps();
	return (
		<div {...blockProps}>
			<CarouselPreviewIcon />
		</div>
	);
}

registerBlockType('sptp/carousel', {
	apiVersion: 3,
	title: __('Carousel', 'team-free'),
	description: __(
		'Display team members in a rotating carousel with smooth transitions.',
		'team-free'
	),
	category: 'sptp',
	icon: <CarouselIcon />,
	keywords: [__('team', 'team-free'), __('carousel', 'team-free'), __('slider', 'team-free')],
	supports: { align: ['wide', 'full'], html: false },
	example: { attributes: { isPreview: true } },
	transforms: buildBlockTransforms('sptp/carousel'),
	edit: (props) => (props.attributes.isPreview ? <PreviewWrapper /> : <Edit {...props} />),
	save,
});
