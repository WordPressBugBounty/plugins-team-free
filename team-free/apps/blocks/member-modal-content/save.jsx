/**
 * Member Modal Content — save.
 *
 * Dynamic block: the shell is rendered by Member_Modal_Content::render_block().
 * The inner blocks still have to be SAVED, so this returns InnerBlocks.Content
 * rather than null — PHP receives it as the `$content` argument.
 */

import { InnerBlocks } from '@wordpress/block-editor';

export default function save() {
	return <InnerBlocks.Content />;
}
