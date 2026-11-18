/**
 * Inserter visibility by editor context and by the Pro/Free gate.
 *
 * The single-page builder field blocks (Member Name, Member Image, Additional
 * Information, …) each render ONE field of ONE member, resolved from the current
 * queried post. On an ordinary page or post there is no member in scope, so
 * they render nothing — listing them in that inserter is an invitation to
 * build something blank. They belong to the two screens where a member IS the
 * subject: the Site Editor (the "Single Item: Member" block template), and
 * the details-template editor (Pro-only — that CPT does not exist in Free, so
 * this half of the check is simply never true here, which is the correct
 * degraded behavior).
 *
 * `sptp/member-modal-content` is narrower still: it only makes sense as the
 * root of a details template, so — same reasoning — it is never offered in
 * Free's inserter, only openable from content a Pro user already built.
 *
 * Separately, the Pro-only blocks (Pro_Gate — proGate.js's isFreeBlock())
 * are hidden from the inserter the same non-destructive way: `supports.
 * inserter: false` via the `blocks.registerBlockType` filter, never
 * `unregisterBlockType()`. A page built in Pro keeps opening and editing
 * normally; only the "insert a NEW one" path is closed. The exception is
 * Pro_Gate::PRO_INSERTER_BLOCKS (3D Carousel): those stay in the one Smart Team
 * section — as in WP Carousel Free — with their icon wrapped in
 * `.sp-smart-team-pro-block-icon`, which editor.scss turns into a crown chip on
 * the inserter tile; index.js moves them to the end of the section. They insert
 * as the upsell notice.
 *
 * HOW, and why not the alternatives:
 * - `supports.inserter: false` only hides a block from the inserter — a page
 *   that already contains one keeps rendering and editing it.
 *   `unregisterBlockType()` would instead turn saved content into "block not
 *   supported" recovery prompts (the anti-pattern docs/pro-free-separation.md
 *   §4(b) names with a citation).
 * - It is NOT done with PHP's `allowed_block_types_all`: returning a list
 *   there makes the editor treat it as a WHITELIST, which silently drops
 *   every block registered only in JS (other plugins' included).
 * - The screen is read from core's `pagenow` / `typenow` globals because the
 *   filter runs at REGISTRATION time, when the editor stores are not
 *   populated yet. Unknown context fails OPEN — better a stray inserter entry
 *   than a block nobody can add.
 *
 * CANVAS GATE: hiding a disabled block from the inserter is only half the
 * job. The editor renders an ALREADY-PLACED block from its JS `Edit`, never
 * through PHP, so the frontend's '' output for a Pro-only block would
 * otherwise leave its whole inspector still live in the canvas. `withProGate`
 * (the `editor.BlockEdit` filter below) swaps the Edit for the upsell notice
 * (shared/proBlockNotice.jsx) instead — with a "View Demo" link into the
 * Ready Patterns library for the Pro-section blocks.
 *
 * MUST be imported before the block registrations in index.js: a
 * `blocks.registerBlockType` filter only affects blocks registered after it is
 * added.
 */

import { addFilter } from '@wordpress/hooks';
import { isValidElement } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { isFreeBlock, getProInserterPatternCategory } from './shared/proGate';
import ProBlockNotice from './shared/proBlockNotice';
import { isBlockModuleEnabled } from './shared/moduleGate';
import { isToggleEnabled } from './shared/blockToggle';

// Marker on a Pro block's icon; editor.scss draws the inserter tile's crown
// chip from it (wp-carousel-free's `.wpcp-pro-block-icon`).
export const PRO_BLOCK_ICON_CLASS = 'sp-smart-team-pro-block-icon';

/**
 * Wrap a block icon in the Pro marker span. Accepts the shapes core does — an
 * element, or `{ src, … }` holding one; anything else (a dashicon slug) is
 * returned untouched.
 *
 * @param {*} icon The block's `icon` setting.
 * @return {*} The marked icon.
 */
const markProIcon = (icon) => {
	const src = icon && typeof icon === 'object' && 'src' in icon ? icon.src : icon;
	// Not an element, or already marked (index.js re-registers Pro blocks).
	if (!isValidElement(src) || src.props?.className === PRO_BLOCK_ICON_CLASS) {
		return icon;
	}
	const marked = <span className={PRO_BLOCK_ICON_CLASS}>{src}</span>;
	return src === icon ? marked : { ...icon, src: marked };
};

// The single-page builder field blocks — one member field each.
const FIELD_BLOCKS = [
	'sptp/member-bio',
	'sptp/member-description',
	'sptp/member-designation',
	'sptp/member-image',
	'sptp/member-name',
	'sptp/member-skills',
	'sptp/social-profile',
];

const MODAL_SHELL = 'sptp/member-modal-content';

// Post type of the details-template ("modal") editor — Pro-only, does not
// exist in Free (Includes\DetailsTemplates is not ported). Kept as a named
// constant rather than removed so this stays a one-line diff if it is ever
// ported.
const TEMPLATE_POST_TYPE = 'sptp_member_template';

const screenId = () => (typeof window.pagenow === 'string' ? window.pagenow : '');
const screenPostType = () => (typeof window.typenow === 'string' ? window.typenow : '');

/**
 * Whether this block may appear in the current editor's inserter, ignoring
 * the Pro/Free gate.
 *
 * @param {string} name Block name.
 * @return {boolean} True to leave the block's own supports alone.
 */
const isContextAllowed = (name) => {
	const id = screenId();
	const postType = screenPostType();

	// Neither global present — an editor we don't recognise (or a test harness).
	// Leave every block insertable rather than hiding things unexpectedly.
	if (!id && !postType) {
		return true;
	}

	const isTemplateEditor = postType === TEMPLATE_POST_TYPE;
	const isSiteEditor = id === 'site-editor';

	if (name === MODAL_SHELL) {
		return isTemplateEditor;
	}

	if (FIELD_BLOCKS.includes(name)) {
		return isTemplateEditor || isSiteEditor;
	}

	return true;
};

/**
 * Whether a block falls under these gates — our namespace, plus the legacy
 * classic shortcode block the Blocks page also toggles.
 *
 * @param {string} name Block name.
 * @return {boolean} True for a block this file gates.
 */
const isGatedBlock = (name) =>
	typeof name === 'string' &&
	(name.startsWith('sptp/') || !!window.sptpBlocksEditor?.toggleManagedBlocks?.includes(name));

addFilter('blocks.registerBlockType', 'sptp/inserter-visibility', (settings, name) => {
	if (!isGatedBlock(name)) {
		return settings;
	}

	if (
		isContextAllowed(name) &&
		isFreeBlock(name) &&
		isToggleEnabled(name) &&
		isBlockModuleEnabled(name)
	) {
		return settings;
	}

	// A listed Pro-only block stays insertable, crown-marked — it inserts as
	// the upsell notice below, never as a working block.
	if (isContextAllowed(name) && getProInserterPatternCategory(name)) {
		return {
			...settings,
			icon: markProIcon(settings.icon),
		};
	}

	return {
		...settings,
		supports: {
			...(settings.supports || {}),
			inserter: false,
		},
	};
});

/**
 * Canvas stand-in for a free block that is switched off: the frontend renders
 * nothing for it, so the editor says so instead of showing a live preview.
 * `useBlockProps` keeps the block selectable so the author can still delete it.
 *
 * @param {Object} props
 * @param {string} props.message  Why the block is off.
 * @param {string} props.url      Dashboard page where it can be turned back on.
 * @param {string} props.linkText Label of that link.
 */
const OffNotice = ({ message, url, linkText }) => {
	const blockProps = useBlockProps({ className: 'sptp-block-off-notice' });

	return (
		<div {...blockProps}>
			<span>{message}</span>
			{url && (
				<a
					className="sptp-block-off-notice__link"
					href={url}
					target="_blank"
					rel="noopener noreferrer"
				>
					{linkText}
				</a>
			)}
		</div>
	);
};

/**
 * Why a free block is switched off, or null when it is on. The module check
 * comes first: it is the screen that turned the block off when both apply.
 *
 * @param {string} name Block name.
 * @return {?Object} `{ message, url, linkText }`, or null.
 */
const offReason = (name) => {
	if (!isBlockModuleEnabled(name)) {
		return {
			message: __(
				'This block’s module is turned off under Smart Team → Modules, so it renders nothing on the front end.',
				'team-free'
			),
			url: window.sptpBlocksEditor?.modulesPageUrl,
			linkText: __('Go to Modules', 'team-free'),
		};
	}
	if (!isToggleEnabled(name)) {
		return {
			message: __(
				'This block is turned off under Smart Team → Blocks, so it renders nothing on the front end.',
				'team-free'
			),
			url: window.sptpBlocksEditor?.blocksPageUrl,
			linkText: __('Go to Blocks', 'team-free'),
		};
	}
	return null;
};

const withProGate = (BlockEdit) => (props) => {
	const offInfo =
		isGatedBlock(props.name) && isFreeBlock(props.name) && !props.attributes?.isPreview
			? offReason(props.name)
			: null;
	if (offInfo) {
		return <OffNotice {...offInfo} />;
	}

	if (
		typeof props.name === 'string' &&
		props.name.startsWith('sptp/') &&
		!isFreeBlock(props.name)
	) {
		// The inserter's hover preview (`example.attributes.isPreview`) keeps
		// the block's own static preview image.
		if (props.attributes?.isPreview) {
			return <BlockEdit {...props} />;
		}
		return <ProBlockNotice name={props.name} clientId={props.clientId} />;
	}

	return <BlockEdit {...props} />;
};

addFilter('editor.BlockEdit', 'sptp/pro-gate-canvas', withProGate);
