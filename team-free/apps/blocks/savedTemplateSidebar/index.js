/**
 * Saved Template editor sidebar — the shortcode chip.
 *
 * Port of Smart Team Pro's `savedTemplateSidebar`: while editing a
 * `sptp_saved_template` post it pins a copyable `[sptp_saved_template id="N"]`
 * chip to the top of the document sidebar, above the panels.
 *
 * It portals into `.interface-complementary-area__fill` rather than using
 * PluginDocumentSettingPanel so the blocks bundle needs no `wp-editor` /
 * `wp-edit-post` dependency — the shortcode is the first thing the sidebar
 * shows, not one more collapsed panel.
 */
import { createPortal, useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import './editor.scss';

const POST_TYPE = 'sptp_saved_template';
const PORTAL_CLASSNAME = 'sptp-shortcode-portal';

const CopyIcon = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 18 18"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		focusable="false"
	>
		<path
			d="M6 6V3.75A.75.75 0 0 1 6.75 3h7.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H12M3.75 6.75h7.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 0 1 .75-.75Z"
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const copyText = async (text) => {
	if (window.navigator?.clipboard?.writeText) {
		try {
			await window.navigator.clipboard.writeText(text);
			return true;
		} catch (error) {
			// Fall through to the textarea fallback.
		}
	}

	try {
		const textarea = window.document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		textarea.style.pointerEvents = 'none';
		window.document.body.appendChild(textarea);
		textarea.select();
		const ok = window.document.execCommand('copy');
		window.document.body.removeChild(textarea);
		return ok;
	} catch (error) {
		return false;
	}
};

const SavedTemplateSidebar = () => {
	const { postType, postId } = useSelect(
		(select) => ({
			postType: select('core/editor')?.getCurrentPostType(),
			postId: select('core/editor')?.getCurrentPostId(),
		}),
		[]
	);

	const [copied, setCopied] = useState(false);
	const [portalTarget, setPortalTarget] = useState(null);

	// The sidebar is mounted and unmounted as the user toggles it, so the portal
	// host is (re)created from a MutationObserver instead of once on mount.
	useEffect(() => {
		if (POST_TYPE !== postType) {
			setPortalTarget(null);
			return undefined;
		}

		let container = null;

		const ensureContainer = () => {
			const fill = window.document.querySelector('.interface-complementary-area__fill');
			if (!fill) {
				return;
			}

			let existing = fill.querySelector(`:scope > .${PORTAL_CLASSNAME}`);
			if (!existing) {
				existing = window.document.createElement('div');
				existing.className = PORTAL_CLASSNAME;
				fill.insertBefore(existing, fill.firstChild);
			} else if (fill.firstElementChild !== existing) {
				fill.insertBefore(existing, fill.firstChild);
			}

			if (existing !== container) {
				container = existing;
				setPortalTarget(existing);
			}
		};

		ensureContainer();

		const observer = new window.MutationObserver(ensureContainer);
		observer.observe(window.document.body, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
			if (container?.parentNode) {
				container.parentNode.removeChild(container);
			}
			setPortalTarget(null);
		};
	}, [postType]);

	if (POST_TYPE !== postType || !portalTarget) {
		return null;
	}

	const shortcode = `[sptp_saved_template id="${postId || 0}"]`;
	// Relative to the current screen (always .../wp-admin/post.php) — no
	// localized admin URL needed.
	const savedTemplatesUrl = 'edit.php?post_type=sptp_member&page=sptp_dashboard#saved_templates';

	const handleCopy = async () => {
		if (!(await copyText(shortcode))) {
			return;
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1500);
	};

	return createPortal(
		<div className="sptp-shortcode-panel">
			<p className="sptp-shortcode-panel__intro">
				{__('You can use this shortcode anywhere and manage it from', 'team-free')}{' '}
				<a
					className="sptp-shortcode-panel__link"
					href={savedTemplatesUrl}
					rel="noopener noreferrer"
				>
					{__('Saved Templates.', 'team-free')}
				</a>
			</p>
			<button type="button" className="sptp-shortcode-panel__chip" onClick={handleCopy}>
				<span className="sptp-shortcode-panel__code">{shortcode}</span>
				<span className="sptp-shortcode-panel__copy">
					{copied ? (
						<span className="sptp-shortcode-panel__copy-text">
							{__('Copied!', 'team-free')}
						</span>
					) : (
						<CopyIcon />
					)}
				</span>
			</button>
		</div>,
		portalTarget
	);
};

registerPlugin('sptp-saved-template-sidebar', {
	render: SavedTemplateSidebar,
});
