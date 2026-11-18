/**
 * Team Group — editor component.
 *
 * A plain InnerBlocks shell (twin of testimonial-pro's TestimonialGroupEdit):
 * only this plugin's blocks are allowed inside and the appender is hidden —
 * children are managed by the grid's Display Settings toggles via
 * useTeamChildBlocks, not by hand.
 */

import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import useUniqueId from '../../hooks/useUniqueId';

const ALLOWED_BLOCKS = ['sptp/grid', 'sptp/ajax-pagination', 'sptp/ajax-member-search'];

export default function Edit({ clientId, attributes, setAttributes }) {
	const { uniqueId } = attributes;

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-group-', 'sptp/');

	const blockProps = useBlockProps({ className: 'sp-smart-team-wrapper' });

	return (
		<div {...blockProps}>
			<div id={uniqueId} className="sp-smart-team-group">
				<InnerBlocks
					allowedBlocks={ALLOWED_BLOCKS}
					orientation="vertical"
					renderAppender={false}
				/>
			</div>
		</div>
	);
}
