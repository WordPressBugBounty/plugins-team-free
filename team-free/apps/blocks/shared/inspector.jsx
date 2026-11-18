/**
 * Shared General-tab inspector orchestrator for every member layout block.
 *
 * Lays out the PanelBody sections in the Figma order: the block's own Display
 * Settings panel first (passed in as `DisplaySettings`), then the shared card
 * panels from panels.jsx, then Advanced Settings. Open/close is
 * accordion-style via the panel-body context; element-dependent panels are
 * hidden until their Card Content element is enabled. Pro-only panels
 * (`isPro`) are always shown with a crown title and a Pro Features teaser
 * body — see proPanels.jsx.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { ProPanelTitle } from '../../components';
import { usePanelBodyContext } from '../../hooks/togglePanelBodyContext';
import { moduleOffElements } from './moduleGate';
import {
	QueryBuilder,
	CardElements,
	MemberImage,
	BasicInformation,
	Skills,
	SocialProfiles,
	ReadMore,
	MemberDetails,
} from './panels';
import { AdvancedSettings } from './advance';
import { AdditionalInformationPro } from './proPanels';

// Panels that only style a specific Card Content element are hidden until that
// element is enabled — e.g. the Social Profiles panel appears only when
// "Social Profiles" is on. A panel maps to one or more cardElements `value`s;
// it shows when ANY is on. Panels not listed here (Display, Query, Card
// Content, Member Details, the Pro teasers, Advanced) are always shown.
const PANEL_ELEMENT_DEPS = {
	image: ['image'],
	basic: ['name', 'role', 'bio'],
	skills: ['skills'],
	social: ['social'],
};

// Panels gated by a boolean attribute rather than a Card Content element — the
// Read More panel only shows when the Read More button is turned on.
const PANEL_ATTR_DEPS = {
	readmore: 'readMoreButton',
};

const LayoutInspector = ({ attributes, setAttributes, DisplaySettings, extraPanels = [] }) => {
	const { openPanel, togglePanelBody } = usePanelBodyContext();

	const PANELS = [
		// key 'general' = the panel-context default, so this opens on load.
		{ key: 'general', title: __('Display Settings', 'team-free'), Body: DisplaySettings },
		// Blocks may splice extra panels (e.g. the carousel's Navigation Arrow /
		// Pagination Dots) — each entry: { key, title, Body, after?, visible?, isPro? }.
		...extraPanels.filter((p) => !p.after || p.after === 'general'),
		{ key: 'query', title: __('Query Builder', 'team-free'), Body: QueryBuilder },
		...extraPanels.filter((p) => p.after === 'query'),
		{ key: 'elements', title: __('Card Content', 'team-free'), Body: CardElements },
		{ key: 'image', title: __('Member Image', 'team-free'), Body: MemberImage },
		{ key: 'basic', title: __('Basic Information', 'team-free'), Body: BasicInformation },
		{
			key: 'additional',
			title: __('Additional Information', 'team-free'),
			Body: AdditionalInformationPro,
			isPro: true,
		},
		{ key: 'skills', title: __('Skills', 'team-free'), Body: Skills },
		{ key: 'social', title: __('Social Profiles', 'team-free'), Body: SocialProfiles },
		// The Read More button is Pro-only (Pro_Gate::read_more_button), so its
		// style panel never applies in Free — even on a block Pro saved with it on.
		{
			key: 'readmore',
			title: __('Read More', 'team-free'),
			Body: ReadMore,
			visible: () => false,
		},
		{ key: 'details', title: __('Member Details', 'team-free'), Body: MemberDetails },
		...extraPanels.filter((p) => p.after === 'details'),
		{ key: 'advanced', title: __('Advanced Settings', 'team-free'), Body: AdvancedSettings },
	];

	// Set of enabled Card Content element values. Legacy content with no list
	// falls back to showing every panel (no gating).
	const cardElements = Array.isArray(attributes.cardElements) ? attributes.cardElements : [];
	// A row whose module is off keeps its stored `show` (so nothing is lost when
	// the module comes back), so it must be excluded HERE too — otherwise the
	// Skills / Social Profiles panels would go on styling an element the card no longer
	// renders.
	const hiddenValues = moduleOffElements();
	const enabledElements = new Set(
		cardElements
			.filter((c) => c && c.show && !hiddenValues.includes(c.value))
			.map((c) => c.value)
	);
	const isPanelVisible = (key, visible) => {
		// Per-panel visibility callback (extra panels, e.g. nav arrows toggle).
		if (typeof visible === 'function' && !visible(attributes)) {
			return false;
		}
		// Boolean-attribute gate (e.g. Read More button toggle).
		const attrDep = PANEL_ATTR_DEPS[key];
		if (attrDep && !attributes[attrDep]) {
			return false;
		}
		// Card Content element gate.
		const deps = PANEL_ELEMENT_DEPS[key];
		if (!deps || cardElements.length === 0) {
			return true;
		}
		return deps.some((value) => enabledElements.has(value));
	};

	const visiblePanels = PANELS.filter(({ key, visible }) => isPanelVisible(key, visible));

	return (
		<>
			{visiblePanels.map(({ key, title, Body, isPro }, index) => (
				<PanelBody
					key={key}
					title={isPro ? <ProPanelTitle label={title} /> : title}
					initialOpen={index === 0}
					className="sp-smart-team-grid-panel-body"
					opened={openPanel === key}
					onToggle={() => togglePanelBody(key)}
				>
					{openPanel === key && (
						<Body attributes={attributes} setAttributes={setAttributes} />
					)}
				</PanelBody>
			))}
		</>
	);
};

export default LayoutInspector;
