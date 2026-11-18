import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

import buildBlockTransforms from '../shared/transforms/blockTransforms';
import Edit from './edit.jsx';
import save from './save.jsx';
import './editor.scss';
import './style.scss';
import { GridIcon, GridPreviewIcon } from './icons';

function PreviewWrapper() {
	const blockProps = useBlockProps();
	return (
		<div {...blockProps}>
			<GridPreviewIcon />
		</div>
	);
}

registerBlockType('sptp/grid', {
	apiVersion: 3,
	title: __('Grid', 'team-free'),
	description: __('Display team members in a responsive multi-column grid layout.', 'team-free'),
	category: 'sptp',
	icon: <GridIcon />,
	keywords: [__('team', 'team-free'), __('grid', 'team-free'), __('members', 'team-free')],
	supports: {
		align: ['wide', 'full'],
		html: false,
	},
	example: {
		attributes: {
			isPreview: true,
		},
	},
	transforms: buildBlockTransforms('sptp/grid'),
	edit: (props) => (props.attributes.isPreview ? <PreviewWrapper /> : <Edit {...props} />),
	save,
});
