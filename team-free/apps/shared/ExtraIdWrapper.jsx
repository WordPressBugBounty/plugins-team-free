/**
 * ExtraIdWrapper — the editor twin of AbstractBlock::render_block_callback()'s
 * Advanced → Custom CSS ID wrapper. When set, the id renders on its own plain
 * outer div around the block's `#uniqueId` element — it must never replace
 * #uniqueId, which all dynamic CSS anchors to. Unset, the children render
 * unwrapped, exactly like the frontend.
 *
 * @param {Object}  props          Component props.
 * @param {string}  props.id       The Custom CSS ID (additionalId attribute).
 * @param {Element} props.children The block's `#uniqueId` preview element.
 */
const ExtraIdWrapper = ({ id, children }) => (id ? <div id={id}>{children}</div> : children);

export default ExtraIdWrapper;
