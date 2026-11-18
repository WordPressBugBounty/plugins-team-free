/**
 * Shared hook — resolve a layout block's attributes into the setting bundles
 * MemberCard consumes ({ elements, readMore, skills, meta, social, image,
 * basic, details }). The editor twin of
 * MemberLayoutBlock::prepare_render_settings(); keep both in lock-step.
 */

import { META_ICON_SET, orderedElements } from './MemberCard';
import {
	isFreeCardElement,
	resolveBioSource,
	resolveDetailsOpenAs,
	resolveImageHoverEffect,
	resolveMakeClickable,
} from './proGate';

// The on-photo flyout corner (Icon Position control), whitelisted like the
// server side.
const FLYOUT_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export default function useCardSettings(attributes) {
	const {
		cardElements,
		readMoreLabel,
		skillsDisplayStyle,
		skillsProgressBarStyle,
		skillsPercentVisibility,
		nameHtmlTag,
		bioSource,
		displayMetaIcon,
		metaIconStyle,
		socialIconStyle,
		socialIconPosition,
		imageResolution,
		imageAspectRatio,
		imageRetina,
		imageHoverEffect,
		showMemberDetails,
		detailsOpenAs,
		makeClickable,
		detailsOpenInNewTab,
	} = attributes;

	// Pro-only elements are skipped, like Pro_Gate::card_elements() on the
	// server — the stored list itself is left untouched.
	const elements = orderedElements(cardElements).filter(isFreeCardElement);

	// The Read More button is Pro-only in its entirety — twin of
	// Pro_Gate::read_more_button(), which always renders it off.
	const readMore = {
		show: false,
		label: readMoreLabel,
	};

	const skills = {
		displayStyle: skillsDisplayStyle || 'progress',
		barStyle: skillsProgressBarStyle || 'style-2',
		percentVisibility: skillsPercentVisibility || 'always',
	};

	const meta = {
		showIcon: !!displayMetaIcon,
		iconSet: META_ICON_SET[metaIconStyle] || 'fill',
	};

	const social = {
		iconStyle: socialIconStyle || 'style-1',
		position: FLYOUT_POSITIONS.includes(socialIconPosition)
			? socialIconPosition
			: 'bottom-right',
	};

	// Card Hover Effect and Card Content → Hover Content are Pro — Free never
	// reads `hoverEffect` or `hoverContent` (twin of prepare_render_settings()),
	// so every element renders at rest.

	// Image Flip, Lazy Loading, Special Tag and Image Filter are Pro — Free
	// has no render path for them (their stored attributes are left
	// untouched). A Pro Hover Effect renders as 'none'.
	const image = {
		resolution: imageResolution || 'full',
		aspect: imageAspectRatio || '1-1',
		retina: !!imageRetina,
		hoverEffect: resolveImageHoverEffect(imageHoverEffect),
	};

	// Member Details — the Make Clickable targets link to the member's page.
	// Modal (Pro) resolves to Single Page and the Pro Make Clickable targets to
	// Only Image (Pro_Gate::details_open_as() / make_clickable()). Twin of the
	// `details` bundle in prepare_render_settings().
	const details = {
		linkEnabled: !!showMemberDetails,
		clickable: resolveMakeClickable(makeClickable),
		// A modal opens in place — Link Open In New Tab is Single Page only.
		newTab: resolveDetailsOpenAs(detailsOpenAs) === 'single' && !!detailsOpenInNewTab,
	};

	// Auto Fallback and the Limited display style are Pro (Pro_Gate::bio_source();
	// Free has no truncation) — the preview shows the short bio or full description.
	const basic = {
		nameTag: nameHtmlTag || 'h3',
		bioSource: resolveBioSource(bioSource),
	};

	return { elements, readMore, skills, meta, social, image, basic, details };
}
