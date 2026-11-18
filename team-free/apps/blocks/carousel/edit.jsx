/**
 * Carousel — editor render.
 *
 * Mounts a REAL Swiper on the preview markup via useSwiperConfig (port of
 * testimonial-pro's CarouselRender): the markup is the byte-for-byte twin of
 * Carousel::render_block() — swiper container › swiper-wrapper › one
 * MemberCard per slide (or grouped slides for the fade/cube/flip effects),
 * with the nav arrows and pagination as siblings. The single-card renderer,
 * setting bundles and shared card dynamic CSS come from ../shared/.
 */

import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';

import { BlockInspectorTabs, CardDesignPicker } from '../../components';
import { openReadyPatterns } from '../shared/ready-patterns';
import { AIRefineControl, isAIBuilderEnabled, openAIBuilder } from '../shared/ai-builder';
import useUniqueId from '../../hooks/useUniqueId';
import useMembers from '../../hooks/useMembers';
import useSwiperConfig from '../../hooks/useSwiperConfig';
import ExtraIdWrapper from '../../shared/ExtraIdWrapper.jsx';
import DemoMembersNotice from '../shared/DemoMembersNotice.jsx';
import dynamicCss from './dynamicCss';
import { extractGoogleFontImports } from '../../utils/googleFonts.js';
import Inspector from './inspect';
import MemberCard, { MetaIconSprite } from '../shared/MemberCard';
import useCardSettings from '../shared/useCardSettings';
import { CARD_DESIGN_ITEMS, applyCardDesign } from '../shared/cardDesign';
import { TogglePanelBodyProvider, usePanelBodyContext } from '../../hooks/togglePanelBodyContext';
import { NAV_ARROW_ICONS } from './icons';
import {
	isFreeCarouselStyle,
	isFreeSlideEffect,
	isFreeDisplayStyle,
	resolveCardDesign,
	resolveNavArrowStyle,
	resolvePaginationStyle,
} from '../shared/proGate';

// Where the arrow row sits relative to the swiper: 'top' (in flow, before it),
// 'bottom' (in flow, after the pagination) or 'center' (absolute, over it).
// Twin of Carousel::nav_arrow_slot().
const navArrowSlot = (position) => {
	const slot = (position || 'vertical_center').split('_')[0];
	return 'top' === slot || 'bottom' === slot ? slot : 'center';
};

// Clicking the nav arrows / pagination in the canvas opens their inspector
// panel (the sp-panel-data → data-component pattern the cards use). These are
// small components so they can read the panel-body context — they render
// inside TogglePanelBodyProvider, unlike the Edit component itself.
function NavArrows({ navPrevEl, navNextEl, navIcon, navIconPosition }) {
	const { togglePanelBody } = usePanelBodyContext();
	return (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
		<div
			className={`sp-smart-team-swiper-nav-arrows sp-panel-data sp-smart-team-nav-pos-${
				navIconPosition || 'vertical_center'
			}`}
			data-component="navigation"
			onClick={(event) => togglePanelBody(event)}
		>
			<div ref={navPrevEl} className="sp-smart-team-swiper-navigation sp-smart-team-nav-prev">
				{navIcon}
			</div>
			<div ref={navNextEl} className="sp-smart-team-swiper-navigation sp-smart-team-nav-next">
				{navIcon}
			</div>
		</div>
	);
}

function Pagination({ paginationRef, paginationStyle }) {
	const { togglePanelBody } = usePanelBodyContext();
	return (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
		<div
			ref={paginationRef}
			className={`sp-smart-team-swiper-pagination sp-panel-data swiper-pagination ${
				paginationStyle || 'dots'
			}`}
			data-component="pagination"
			onClick={(event) => togglePanelBody(event)}
		/>
	);
}

export default function Edit({ clientId, attributes, setAttributes }) {
	const {
		uniqueId,
		cardDesign,
		imagePosition,
		imageAreaPosition,
		carouselStyle,
		carouselDisplayStyle,
		slidingEffect,
		enableNavigationArrow,
		enablePaginationDots,
		paginationStyle,
		navIconName,
		navIconPosition,
	} = attributes;
	// The design the frontend renders (Pro designs → card-1, as in Pro_Gate).
	const renderDesign = resolveCardDesign(cardDesign);

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-carousel-', 'sptp/');

	// Normalize Pro-only carousel attributes to their free fallback before the
	// canvas preview reads them — a Pro-authored value (e.g. carouselStyle:
	// 'center') is left in the attribute untouched, but the editor preview
	// renders the same free fallback the frontend does (Carousel::render_block
	// / SwiperConfig's and Styles\Carousel's own normalization), so the canvas
	// never shows Free users a Pro-only carousel behavior.
	const normalizedAttributes = useMemo(
		() => ({
			...attributes,
			carouselStyle: isFreeCarouselStyle(carouselStyle || 'default')
				? carouselStyle || 'default'
				: 'default',
			carouselDisplayStyle: isFreeDisplayStyle(carouselDisplayStyle || 'horizontal')
				? carouselDisplayStyle || 'horizontal'
				: 'horizontal',
			slidingEffect: isFreeSlideEffect(slidingEffect || 'slide')
				? slidingEffect || 'slide'
				: 'slide',
			partialSlideView: false,
			paginationStyle: resolvePaginationStyle(paginationStyle),
		}),
		[attributes, carouselStyle, carouselDisplayStyle, slidingEffect, paginationStyle]
	);

	// dynamicCss gets the stored paginationStyle: paginationCss() resolves it
	// itself and compares the two to drop a Pro style's bullet size (e.g.
	// Fraction's 60×25), exactly as Styles\Carousel::pagination_css() does on
	// the frontend. A pre-resolved value made that comparison always equal.
	const blockStyling = useMemo(
		() =>
			extractGoogleFontImports(normalizedAttributes) +
			dynamicCss({ ...normalizedAttributes, paginationStyle }),
		[normalizedAttributes, paginationStyle]
	);

	const { members, loading, error, isDemoMembers } = useMembers(attributes);

	// Real Swiper in the canvas — re-inits whenever a carousel attribute
	// changes (see the hook's dependency list).
	const {
		effect,
		swiperDir,
		swiperRef,
		navNextEl,
		navPrevEl,
		paginationRef,
		shouldGroupSlides,
		memberGroups,
		groupSize,
		groupGap,
		slideMembers,
		bulletCap,
	} = useSwiperConfig(normalizedAttributes, members, loading);

	const blockProps = useBlockProps({ className: 'sp-smart-team-wrapper' });

	// The MemberCard setting bundles (twin of prepare_render_settings()).
	const settings = useCardSettings(attributes);
	const { meta } = settings;

	// Fresh insert — `cardDesign` is empty until a design is chosen (the same
	// first-insert gate every layout block uses).
	if (!cardDesign) {
		return (
			<div {...blockProps}>
				<AIRefineControl
					clientId={clientId}
					blockName="sptp/carousel"
					isConfigured={!!cardDesign}
				/>
				<CardDesignPicker
					onUsePattern={() => openReadyPatterns({ clientId, blockName: 'sptp/carousel' })}
					onBuildWithAI={
						isAIBuilderEnabled()
							? () => openAIBuilder({ clientId, blockName: 'sptp/carousel' })
							: undefined
					}
					items={CARD_DESIGN_ITEMS}
					onPick={(design) => applyCardDesign(design, attributes, setAttributes)}
				/>
			</div>
		);
	}

	const style = normalizedAttributes.carouselStyle;
	const isTicker = style === 'ticker';
	// Multi-row grid is horizontal only (matches useSwiperConfig / SwiperConfig).
	const isVertical =
		normalizedAttributes.carouselDisplayStyle === 'vertical' && style !== 'multi-row';
	const navIcon =
		NAV_ARROW_ICONS[resolveNavArrowStyle(navIconName)] || NAV_ARROW_ICONS['chevron-outline'];
	// Top rows render before the swiper, bottom rows after the pagination,
	// Vertical Center floats over it (twin of the PHP render's $nav_slot).
	const navSlot = navArrowSlot(navIconPosition);
	const navArrows = !!enableNavigationArrow && !isTicker && (
		<NavArrows
			navPrevEl={navPrevEl}
			navNextEl={navNextEl}
			navIcon={navIcon}
			navIconPosition={navIconPosition}
		/>
	);

	const renderCard = (member) => (
		<MemberCard
			member={member}
			{...settings}
			cardDesign={renderDesign}
			imagePosition={imagePosition}
			imageAreaPosition={imageAreaPosition}
		/>
	);

	const swiperClasses = [
		'sp-smart-team-swiper',
		'swiper',
		`sp-smart-team-carousel-style-${style}`,
		effect === 'creative' ? 'sp-smart-team-carousel-spring' : '',
		normalizedAttributes.slidingEffect === 'ken-burns' && style === 'default'
			? 'sp-smart-team-carousel-ken-burns'
			: '',
		isVertical ? 'swiper-vertical' : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div {...blockProps}>
			<AIRefineControl
				clientId={clientId}
				blockName="sptp/carousel"
				isConfigured={!!cardDesign}
			/>
			<style
				dangerouslySetInnerHTML={{
					__html:
						blockStyling +
						// Duplicated-slide loop (low member counts): hide the duplicate
						// half of the bullets so the dot count matches the frontend.
						(bulletCap
							? `#${uniqueId} .sp-smart-team-swiper-pagination .swiper-pagination-bullet:nth-child(n+${
									bulletCap + 1
								}){display:none;}`
							: ''),
				}}
			/>

			<TogglePanelBodyProvider>
				<BlockInspectorTabs
					attributes={{ ...attributes, blockName: 'carousel' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/blocks/carousel"
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
							'sp-smart-team-carousel',
							attributes.additionalCssClass || '',
							`sp-smart-team-carousel--${renderDesign}`,
							renderDesign === 'card-2' && imagePosition === 'left'
								? 'sp-smart-team-carousel--image-left'
								: '',
							renderDesign === 'card-5' && imagePosition === 'right'
								? 'sp-smart-team-carousel--image-right'
								: '',
							renderDesign === 'card-9' && imageAreaPosition === 'right'
								? 'sp-smart-team-carousel--image-right'
								: '',
						]
							.filter(Boolean)
							.join(' ')}
					>
						{loading ? (
							<div className="sp-smart-team-carousel__loading">
								<Spinner />
								{__('Loading team members…', 'team-free')}
							</div>
						) : error ? (
							<p className="sp-smart-team-carousel__empty">{error}</p>
						) : members.length === 0 ? (
							<p className="sp-smart-team-carousel__empty">
								{__('No team members found.', 'team-free')}
							</p>
						) : isTicker ? (
							/* Ticker (marquee): viewport › track › the same group twice
							   (the duplicate aria-hidden) — the track animates -50% for
							   a seamless CSS-only loop. Twin of the ticker branch in
							   Carousel::render_block(). */
							<div
								className={[
									'sp-smart-team-marquee-viewport',
									attributes.pauseOnHover
										? 'sp-smart-team-marquee--pause-hover'
										: '',
									isVertical
										? 'sp-smart-team-marquee--vertical'
										: 'sp-smart-team-marquee--horizontal',
								]
									.filter(Boolean)
									.join(' ')}
							>
								<div className="sp-smart-team-marquee-track">
									{[false, true].map((hidden) => (
										<div
											key={hidden ? 'dup' : 'main'}
											className="sp-smart-team-marquee-group sp-smart-team-carousel__items"
											aria-hidden={hidden || undefined}
										>
											{!hidden && <MetaIconSprite iconSet={meta.iconSet} />}
											{members.map((member) => (
												<div
													key={member.id}
													className="sp-smart-team-carousel__slide sp-smart-team-marquee-item"
												>
													{renderCard(member)}
												</div>
											))}
										</div>
									))}
								</div>
							</div>
						) : (
							<>
								{navSlot === 'top' && navArrows}
								<div
									key={`${uniqueId}-${effect}-${swiperDir}-${shouldGroupSlides ? groupSize : 1}-${
										slideMembers.length
									}`}
									ref={swiperRef}
									className={swiperClasses}
									dir={swiperDir}
								>
									<div className="sp-smart-team-swiper-wrapper swiper-wrapper sp-smart-team-carousel__items">
										<MetaIconSprite iconSet={meta.iconSet} />
										{shouldGroupSlides
											? memberGroups.map((group, index) => (
													<div
														key={`group-${index}`}
														className="sp-smart-team-carousel__slide sp-smart-team-swiper-slide swiper-slide sp-smart-team-swiper-effect-group"
														style={{
															'--sptp-carousel-effect-columns':
																groupSize,
															'--sptp-carousel-effect-gap': `${groupGap}px`,
														}}
													>
														{group.map((member, memberIndex) => (
															<div
																key={`${member.id}-${memberIndex}`}
																className="sp-smart-team-swiper-effect-group-item"
															>
																{renderCard(member)}
															</div>
														))}
													</div>
												))
											: slideMembers.map((member, index) => (
													<div
														key={`${member.id}-${index}`}
														className="sp-smart-team-carousel__slide sp-smart-team-swiper-slide swiper-slide"
													>
														{renderCard(member)}
													</div>
												))}
									</div>
								</div>
								{navSlot === 'center' && navArrows}
								{/* Key by style so switching pagination type gives Swiper a
								    fresh element (no stale dynamic-bullet DOM) — matches
								    testimonial-pro's `sp-pag-${paginationStyle}` key. */}
								{!!enablePaginationDots && !isTicker && (
									<Pagination
										key={`sp-pag-${normalizedAttributes.paginationStyle}`}
										paginationRef={paginationRef}
										paginationStyle={normalizedAttributes.paginationStyle}
									/>
								)}
								{navSlot === 'bottom' && navArrows}
							</>
						)}
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
