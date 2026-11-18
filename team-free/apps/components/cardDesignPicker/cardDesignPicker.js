/**
 * CardDesignPicker — the first-insert "Choose Card Design" placeholder
 * (port of testimonial-pro's beforeStart/CardDesignPicker).
 *
 * Shared by every layout block: shown in the canvas in place of the preview +
 * inspector while the block's `cardDesign` attribute is empty (the
 * fresh-insert state). The block supplies its own design catalogue (`items`,
 * [{ value, icon }]) and an `onPick(design)` that applies the design — for
 * the grid that's applyCardDesign() from grid/cardDesign.js, and future
 * blocks (carousel, list, …) pass their own equivalent. "Use a pattern" calls
 * `onUsePattern` (the block opens the Ready Patterns library on its own
 * category); "Build with AI" calls `onBuildWithAI` (the AI Team Builder
 * prompt modal). Without `onBuildWithAI` (AI module off) the second button
 * falls back to "Skip for Now", which picks `skipValue` (the stock design).
 *
 * Gate it in the block's edit(), after all hooks:
 *   if (!cardDesign) return <div {...blockProps}><CardDesignPicker …/></div>;
 */

import { __ } from '@wordpress/i18n';
import { memo } from '@wordpress/element';
import { Tooltip } from '@wordpress/components';
import ProChip from '../proChip/proChip.js';
import BrandMarkIcon from '../../blocks/shared/ai-builder/BrandMarkIcon';
import './editor.scss';

const CardDesignPicker = ({
	items,
	onPick,
	skipValue = 'card-1',
	subtitle = '',
	onUsePattern,
	onBuildWithAI,
}) => {
	// Numbered by position so the overlay presets continue the card sequence
	// (Grid: overlay-1 → "Card 12") instead of showing their slug.
	const designLabel = (index) => `${__('Card', 'team-free')} ${index + 1}`;

	return (
		<div className="sp-smart-team-before-start">
			<div className="sp-smart-team-before-start__header">
				<h3 className="sp-smart-team-before-start__title">
					{__('Choose Card Design', 'team-free')}
				</h3>
				<p className="sp-smart-team-before-start__subtitle">
					{subtitle ||
						__(
							'Select a design to display your team. You can change it anytime.',
							'team-free'
						)}
				</p>
			</div>
			<div className="sp-smart-team-before-start__designs">
				{items.map(({ value, icon, pro }, index) => (
					<Tooltip
						key={value}
						text={
							pro
								? __('Available in Smart Team Pro', 'team-free')
								: designLabel(index)
						}
						placement="top"
					>
						<button
							type="button"
							className={`sp-smart-team-before-start__design${pro ? ' is-pro' : ''}`}
							aria-label={designLabel(index)}
							aria-disabled={pro ? 'true' : undefined}
							onClick={() => {
								// A Pro design is display-only (wp-carousel-free's
								// locked wizard card): no pick, no upgrade link.
								if (!pro) {
									onPick(value);
								}
							}}
						>
							{icon}
							{pro && <ProChip corner />}
						</button>
					</Tooltip>
				))}
			</div>
			<div className="sp-smart-team-before-start__or">
				<span>{__('OR', 'team-free')}</span>
			</div>
			<div className="sp-smart-team-before-start__actions">
				<button
					type="button"
					className="sp-smart-team-before-start__patterns"
					onClick={onUsePattern}
				>
					{__('Use a Pattern', 'team-free')}
				</button>
				{onBuildWithAI ? (
					<button
						type="button"
						className="sp-smart-team-before-start__ai"
						onClick={onBuildWithAI}
					>
						<BrandMarkIcon size={18} color="#6D4FD8" />
						{__('Build with AI', 'team-free')}
					</button>
				) : (
					<button
						type="button"
						className="sp-smart-team-before-start__skip"
						onClick={() => onPick(skipValue)}
					>
						{__('Skip for Now', 'team-free')}
					</button>
				)}
			</div>
		</div>
	);
};

export default memo(CardDesignPicker);
