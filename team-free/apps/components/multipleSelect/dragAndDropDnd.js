import { memo, useState } from '@wordpress/element';
import Toggle from '../toggle/toggle';
import ProTag from '../proTag/proTag.js';
import { DndTitleIcon } from '../../icons/icons';
import './dnd-select.scss';

// Member Information toggle list. Pro's version is drag & drop sortable; in
// Free, reordering is a Pro feature, so this port ships no sorting code at all
// (Rule 8): rows render in their stored order, only the show/hide switches
// work. The stored order is never rewritten, so a Pro-saved order survives a Free save.
const DragAndDropDnd = ({
	label = '',
	items,
	toggleBtn = false,
	onChange,
	// Item `value`s whose show/hide toggle is locked — the layout requires them
	// (the Overlay block's Photo/Image, whose card IS the photo). The switch is
	// read-only, and a toggle attempt is ignored so a click on the label cannot
	// flip it either.
	lockedValues = [],
	// Pro-only rows (Real Testimonials Free's PRO_CARD_CONTENTS pattern): shown
	// below the free rows as locked rows — switch always off, label tagged
	// "(Pro)". Display only: the caller keeps them out of `items` and splices
	// them back into what it saves, so Pro's stored data survives.
	proItems = [],
}) => {
	const [allOptions, setAllOptions] = useState(items);

	const onToggleControl = (item) => {
		if (lockedValues.includes(item.value)) {
			return;
		}
		const updatedValues = allOptions?.map((val) => {
			if (val.id === item.id) {
				return { ...val, show: !val.show };
			}
			return val;
		});
		setAllOptions(updatedValues);
		onChange(updatedValues);
	};

	return (
		<div className="shaped-plugin-multiple-select sp-smart-team-component-mb">
			{label && (
				<div className="sp-multiple-select-dnd-label">
					<p> {label}</p>
				</div>
			)}
			<div className="sp-drag-and-drop-dnd-container">
				<div className="sp-selected-options">
					{allOptions?.map((item) => (
						<div key={item.id} className="sp-sort-locked">
							<div className="sp-selected-option">
								<span className="sp-select-label">
									<DndTitleIcon /> {item?.label}
								</span>
								{toggleBtn && (
									<span className="sp-select-toggle-button">
										<Toggle
											attributes={item.show}
											disabled={lockedValues.includes(item.value)}
											onChange={() => onToggleControl(item)}
										/>
									</span>
								)}
							</div>
						</div>
					))}
					{proItems.map((item) => (
						<div key={item.id} className="sp-pro-locked">
							<div className="sp-selected-option">
								<span className="sp-select-label">
									<DndTitleIcon />
									<span>
										{item.label}
										<ProTag />
									</span>
								</span>
								{toggleBtn && (
									<span className="sp-select-toggle-button">
										{/* Same look as a locked `Toggle isPro` (plain off
										    switch, not core's faded `disabled`); clicks are
										    blocked in CSS and the no-op never writes. */}
										<Toggle attributes={false} onChange={() => {}} />
									</span>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default memo(DragAndDropDnd);
