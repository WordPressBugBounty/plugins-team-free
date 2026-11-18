/**
 * Multi Color Skill Bar — sortable list of per-skill color pairs (Figma).
 *
 * Row N ("Skill N", positional — labels renumber on reorder) opens a popover
 * with the Progress Bar Active/Base colors applied to the Nth rendered bar.
 * Pairs start empty — an unset color inherits the block's common bar colors,
 * so a pair only overrides what the user actually sets (resetting a picker
 * returns to "inherit"). Rows reuse the sortable-list look from
 * dnd-select.scss so every consumer matches the Member Information list.
 *
 * Shared control: any block that renders member skill bars (grid today,
 * carousel/list later) pairs this with nth-child color rules in its dynamic
 * CSS — see the skillBarColors block in grid/dynamicCss.js / Styles/Grid.php.
 */

import { __, sprintf } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SpColorPicker from '../color/color.js';
import Popover from '../popover/index.js';
import { DndTitleIcon } from '../../icons/icons';
import '../multipleSelect/dnd-select.scss';
import './editor.scss';

export const DEFAULT_SKILL_COLORS = { fill: '', track: '' };

function Row({ id, index, pair, onColors, onRemove }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
	});
	const style = { transform: CSS.Transform.toString(transform), transition };

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={isDragging ? 'sp-grabbing' : 'sp-grab'}
		>
			<div className="sp-selected-option">
				<span className="sp-select-label">
					<DndTitleIcon />{' '}
					{sprintf(
						/* translators: %d: skill bar position in the card. */
						__('Skill %d', 'team-free'),
						index + 1
					)}
				</span>
				<span className="sp-smart-team-skill-colors__actions">
					<button
						type="button"
						className="sp-smart-team-skill-colors__remove"
						aria-label={__('Remove', 'team-free')}
						onClick={onRemove}
					>
						&times;
					</button>
					<Popover toggleOnly>
						<div className="sp-smart-team-skill-colors__popover">
							<SpColorPicker
								label={__('Progress Bar Active Color', 'team-free')}
								value={pair.fill || ''}
								onChange={(value) => onColors({ fill: value })}
								defaultColor={DEFAULT_SKILL_COLORS.fill}
							/>
							<SpColorPicker
								label={__('Progress Bar Base Color', 'team-free')}
								value={pair.track || ''}
								onChange={(value) => onColors({ track: value })}
								defaultColor={DEFAULT_SKILL_COLORS.track}
							/>
						</div>
					</Popover>
				</span>
			</div>
		</div>
	);
}

export default function SkillColorList({ colors, onChange }) {
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
	// Positional ids are stable for the duration of a drag (the order only
	// changes at drag end, when the reordered array is written back).
	const ids = colors.map((_, index) => `skill-${index}`);

	const setPair = (index, patch) =>
		onChange(colors.map((pair, i) => (i === index ? { ...pair, ...patch } : pair)));

	const handleDragEnd = ({ active, over }) => {
		if (over && active.id !== over.id) {
			onChange(arrayMove(colors, ids.indexOf(active.id), ids.indexOf(over.id)));
		}
	};

	return (
		<div className="sp-smart-team-skill-colors sp-smart-team-component-mb">
			<div className="sp-drag-and-drop-dnd-container">
				<div className="sp-selected-options">
					<DndContext
						sensors={sensors}
						onDragEnd={handleDragEnd}
						modifiers={[restrictToVerticalAxis, restrictToParentElement]}
					>
						<SortableContext items={ids} strategy={verticalListSortingStrategy}>
							{colors.map((pair, index) => (
								<Row
									key={ids[index]}
									id={ids[index]}
									index={index}
									pair={pair}
									onColors={(patch) => setPair(index, patch)}
									onRemove={() => onChange(colors.filter((_, i) => i !== index))}
								/>
							))}
						</SortableContext>
					</DndContext>
				</div>
			</div>
			<Button
				variant="primary"
				className="sp-smart-team-skill-colors__add"
				onClick={() => onChange([...colors, { ...DEFAULT_SKILL_COLORS }])}
			>
				{__('Add New', 'team-free')}
			</Button>
		</div>
	);
}
