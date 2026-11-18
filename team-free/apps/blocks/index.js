/**
 * Entry point for the Smart Team (free) block bundle.
 *
 * Webpack bundles every block imported here into dist/editor/index.js. Only
 * the free blocks get their real edit/save; the Pro-only blocks register
 * with a canvas upsell notice and no inserter entry — except 3D Carousel, listed
 * last in the Smart Team section with a crown chip, as in WP Carousel Free (see
 * inserterVisibility.js and blocks/Includes/Pro_Gate.php) — CLAUDE.md Rule 8.
 */
import {
	updateCategory,
	getBlockType,
	getBlockVariations,
	registerBlockType,
	unregisterBlockType,
	registerBlockVariation,
} from '@wordpress/blocks';
import domReady from '@wordpress/dom-ready';
import { TeamCategoryIcon } from '../icons/icons';
import { getProInserterBlockNames } from './shared/proGate';
import { registerReadyPatternsLauncher } from './shared/ready-patterns/toolbarButton';
import { registerAIBuilderLauncher } from './shared/ai-builder';
import { registerProUpgradeDialog } from './shared/pro-upgrade/host';

// Hides the single-page field blocks (and the modal shell) from the inserter
// outside the editors where a member is the subject, and hides the 7
// Pro-only blocks everywhere. MUST come before the block imports below — its
// filter only affects later registrations.
import './inserterVisibility';

import './editor.scss';
// Shared member-card styles (the .sp-smart-team-card block every layout
// block's cards use) — imported once, before the blocks that build on it.
import './shared/style.scss';

// Free — real edit/save.
import './carousel';
// Pro-only (canvas upsell notice, crown-marked) — sits with the free carousel so
// every carousel precedes Grid in the Smart Team section.
import './carousel-3d';
import './grid';
import './team-group';
import './additional-information';
import './custom-information';
import './member-bio';
import './member-description';
import './member-designation';
import './member-image';
import './member-name';
import './member-photo-gallery';
import './member-resume';
import './hire-button';
import './member-modal-content';
import './member-video';
import './member-skills';
import './social-profile';

import './ajax-pagination';

// Pro-only — registered, canvas upsell notice.
import './shared/canvasDefaultProbes';
import './ajax-member-search';
import './live-frontend-filter';
import './filter-by-department';
import './filter-by-location';
import './filter-by-designation';
import './filter-by-gender';

// Editor UI that is not a block: the shortcode chip shown while editing a
// Saved Template post (it self-gates on that post type).
import './savedTemplateSidebar';

// Opens the inserter on `?sptpblock_inserter=true` (Saved Templates → Create).
import './redirect';

// Opens the AI Team Builder on `?sptp_ai_builder` (Dashboard → Build with AI).
import './aiBuilderRedirect';

// Ready Patterns library — the "Patterns Library" header button and its
// modal host. Pro-tier patterns are preview-only in Free.
registerReadyPatternsLauncher();

// AI Team Builder — the "Build with AI" header button and its modal host.
// Self-gates on window.sptpAIBuilder.enabled (module on, site allows AI).
registerAIBuilderLauncher();

// "Do more with Smart Team Pro" dialog host — picking an insertable Pro block
// (3D Carousel) opens it instead of leaving the block on the canvas.
registerProUpgradeDialog();

// Add an icon to the Smart Team block category in the inserter.
updateCategory('sptp', {
	icon: <TeamCategoryIcon />,
});

// The inserter lists a category's blocks in registration order. Re-register the
// insertable Pro blocks after every editor script (the classic shortcode block
// loads from its own bundle) so they close the Smart Team section — WP Carousel
// Free's moveProBlocksLast. Variations are carried over by hand: core drops
// them on unregister.
const moveProBlocksLast = () =>
	getProInserterBlockNames().forEach((blockName) => {
		const blockType = getBlockType(blockName);
		if (!blockType) {
			return;
		}

		const variations = getBlockVariations(blockName) ?? [];
		unregisterBlockType(blockName);
		registerBlockType(blockName, blockType);

		const restored = (getBlockVariations(blockName) ?? []).map(({ name }) => name);
		variations
			.filter(({ name }) => !restored.includes(name))
			.forEach((variation) => registerBlockVariation(blockName, variation));
	});
domReady(moveProBlocksLast);
