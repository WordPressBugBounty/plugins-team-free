/**
 * Grid — editor render.
 *
 * The single-card renderer (MemberCard), the setting bundles and the shared
 * card dynamic CSS live in ../shared/; this file contributes the grid wrapper
 * (the `__items` track + `__cell` per-card wrappers). Markup twin of
 * Grid::render_block().
 */

import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';

import { BlockInspectorTabs, CardDesignPicker } from '../../components';
import { openReadyPatterns } from '../shared/ready-patterns';
import { AIRefineControl, isAIBuilderEnabled, openAIBuilder } from '../shared/ai-builder';
import useUniqueId from '../../hooks/useUniqueId';
import useTeamChildBlocks from '../../hooks/useTeamChildBlocks';
import useMembers from '../../hooks/useMembers';
import ExtraIdWrapper from '../../shared/ExtraIdWrapper.jsx';
import DemoMembersNotice from '../shared/DemoMembersNotice.jsx';
import dynamicCss from './dynamicCss';
import { extractGoogleFontImports } from '../../utils/googleFonts.js';
import Inspector from './inspect';
import MemberCard, { MetaIconSprite } from '../shared/MemberCard';
import useCardSettings from '../shared/useCardSettings';
import { CARD_DESIGN_ITEMS, applyCardDesign } from '../shared/cardDesign';
import { resolveCardDesign } from '../shared/proGate';
import { TogglePanelBodyProvider } from '../../hooks/togglePanelBodyContext';

export default function Edit({ clientId, attributes, setAttributes }) {
	const { uniqueId, cardDesign, imagePosition, imageAreaPosition } = attributes;
	// The design the frontend renders (Pro designs → card-1, as in Pro_Gate).
	const renderDesign = resolveCardDesign(cardDesign);

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-grid-', 'sptp/');

	// Wrap with team-group + manage the addon child blocks (Ajax Pagination)
	// from the Display Settings toggles — port of testimonial-pro's pattern.
	useTeamChildBlocks(clientId, attributes);

	const blockStyling = useMemo(
		() => extractGoogleFontImports(attributes) + dynamicCss(attributes),
		[attributes]
	);

	const { members, loading, error, isDemoMembers } = useMembers(attributes);

	// useBlockProps wraps the block's editor chrome; the styled element is the
	// inner `#uniqueId` div so the dynamicCss / commonDynamicCss selectors
	// (`#uniqueId`, `#uniqueId .…__items`) match here exactly as they do on the
	// frontend, where Grid::render_block() outputs the same id + class.
	const blockProps = useBlockProps({ className: 'sp-smart-team-wrapper' });

	// The MemberCard setting bundles (twin of prepare_render_settings()).
	const settings = useCardSettings(attributes);
	const { meta } = settings;

	// Fresh insert — `cardDesign` is empty until a design is chosen. Show the
	// picker placeholder instead of the preview + inspector (port of
	// testimonial-pro's EditorWrapper gate).
	if (!cardDesign) {
		return (
			<div {...blockProps}>
				<AIRefineControl
					clientId={clientId}
					blockName="sptp/grid"
					isConfigured={!!cardDesign}
				/>
				<CardDesignPicker
					onUsePattern={() => openReadyPatterns({ clientId, blockName: 'sptp/grid' })}
					onBuildWithAI={
						isAIBuilderEnabled()
							? () => openAIBuilder({ clientId, blockName: 'sptp/grid' })
							: undefined
					}
					items={CARD_DESIGN_ITEMS}
					onPick={(design) => applyCardDesign(design, attributes, setAttributes)}
				/>
			</div>
		);
	}

	return (
		<div {...blockProps}>
			<AIRefineControl
				clientId={clientId}
				blockName="sptp/grid"
				isConfigured={!!cardDesign}
			/>
			<style dangerouslySetInnerHTML={{ __html: blockStyling }} />

			<TogglePanelBodyProvider>
				<BlockInspectorTabs
					attributes={{ ...attributes, blockName: 'grid' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/blocks/grid"
					readyPatternsLink="https://shapedplugin.com/plugin/wp-team-pro/#patterns"
					previewLink="https://shapedplugin.com/plugin/wp-team-pro/"
				/>

				{isDemoMembers && <DemoMembersNotice />}

				{/* Custom CSS ID renders as its own outer div, never replacing
				    #uniqueId — the editor twin of render_block_callback(). */}
				<ExtraIdWrapper id={attributes.additionalId}>
					<div
						id={uniqueId}
						className={[
							'sp-smart-team-grid',
							// Advanced → Custom CSS Class(es), mirrored from the
							// frontend wrapper so user CSS previews in the editor.
							attributes.additionalCssClass || '',
							`sp-smart-team-grid--${renderDesign}`,
							// Image Position — the split designs' photo side: card-2 flips
							// via --image-left, card-5 (photo left by default) via --image-right.
							renderDesign === 'card-2' && imagePosition === 'left'
								? 'sp-smart-team-grid--image-left'
								: '',
							renderDesign === 'card-5' && imagePosition === 'right'
								? 'sp-smart-team-grid--image-right'
								: '',
							// Image Area Position — card-9's __side column defaults to the
							// left edge; Right flips the split.
							renderDesign === 'card-9' && imageAreaPosition === 'right'
								? 'sp-smart-team-grid--image-right'
								: '',
						]
							.filter(Boolean)
							.join(' ')}
					>
						{loading ? (
							<div className="sp-smart-team-grid__loading">
								<Spinner />
								{__('Loading team members…', 'team-free')}
							</div>
						) : error ? (
							<p className="sp-smart-team-grid__empty">{error}</p>
						) : members.length === 0 ? (
							<p className="sp-smart-team-grid__empty">
								{__('No team members found.', 'team-free')}
							</p>
						) : (
							<div className="sp-smart-team-grid__items">
								<MetaIconSprite iconSet={meta.iconSet} />
								{members.map((member) => (
									<div key={member.id} className="sp-smart-team-grid__cell">
										<MemberCard
											member={member}
											{...settings}
											cardDesign={renderDesign}
											imagePosition={imagePosition}
											imageAreaPosition={imageAreaPosition}
										/>
									</div>
								))}
							</div>
						)}
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
