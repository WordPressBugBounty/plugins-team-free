/**
 * Team Group — saved markup (static block).
 *
 * Twin of testimonial-pro's group Save: an outer align wrapper + the
 * `.sp-smart-team-group` element the frontend runtime scopes to. Changing
 * this markup invalidates saved content — keep it stable.
 */

import { InnerBlocks } from '@wordpress/block-editor';

const Save = ({ attributes }) => {
	const { uniqueId, align } = attributes;

	return (
		<div className={`sp-smart-team-block align${align}`}>
			<div id={uniqueId} className="sp-smart-team-group">
				<InnerBlocks.Content />
			</div>
		</div>
	);
};

export default Save;
