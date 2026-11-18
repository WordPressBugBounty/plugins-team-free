/**
 * Save — kept byte-for-byte identical to Pro's (a plain InnerBlocks wrapper,
 * no interactive logic) purely so a page saved under Pro keeps validating in
 * Free's editor (Rule 2). The PHP side registers this block as dynamic with a
 * render_callback returning '' regardless of this markup (Includes\
 * Pro_Stub_Block), so nothing here reaches the frontend.
 */

import { InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const { uniqueId, additionalId, additionalCssClass, multiFilterRelation } = attributes;

	const classes = ['sp-smart-team-live-frontend-filter', additionalCssClass]
		.filter(Boolean)
		.join(' ');

	const inner = (
		<div id={uniqueId} className={classes} data-relation={multiFilterRelation || 'and'}>
			<div className="sp-smart-team-live-frontend-filter__items">
				<InnerBlocks.Content />
			</div>
		</div>
	);

	return additionalId ? <div id={additionalId}>{inner}</div> : inner;
}
