import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { memo, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { CSS } from '@dnd-kit/utilities';
import './dnd-select.scss';

const SortableItem = memo((props) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: props.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};
	const { item, onChange } = props;

	// Delete Icon
	const DeleteIcon = () => {
		return (
			<svg xmlns="http://www.w3.org/2000/svg" width={8} height={8} fill="none">
				<path
					fill="#2F2F2F"
					d="M4 4.778 6.722 7.5l.778-.778L4.778 4 7.5 1.278 6.722.5 4 3.222 1.278.5.5 1.278 3.222 4 .5 6.722l.778.778L4 4.778Z"
				/>
			</svg>
		);
	};

	return (
		<>
			<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
				<div className="sp-selected-option">
					{/* Display the label of the item */}
					<span className="sp-select-label">{item?.label}</span>

					{/* Delete button */}
					<span
						className="sp-select-remove-button"
						role="button"
						aria-label={`Remove ${item?.label}`}
						onClick={() => onChange(item.id)}
					>
						<DeleteIcon />
					</span>
				</div>
			</div>
		</>
	);
});

const MultiSelectDndKit = ({
	label = '',
	items,
	values,
	onChange,
	onInputChange = false,
	searchable = false,
}) => {
	const [allOptions, setAllOptions] = useState([]);
	const [toggleSelectField, setToggleSelectField] = useState(false);
	const [optionOpen, setOptionOpen] = useState(true);
	const [searchFieldData, setSearchFieldData] = useState('');
	const dndRef = useRef(null);
	const containerRef = useRef(null);
	const allValues = useMemo(() => {
		if (!Array.isArray(values) || values.some((item) => !item.value)) {
			return [];
		} // prevents the crash
		return values.map((item) => item.value);
	}, [values]);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		})
	);

	// icons
	const ArrowIconOne = () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			aria-hidden="true"
			className=""
		>
			<path d="M17.5 11.6 12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" />
		</svg>
	);
	const ArrowIconTwo = () => (
		<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} aria-hidden="true">
			<path d="M6.5 12.4 12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z" />
		</svg>
	);

	const containerHeight = values?.length * 34 + 2 + 'px';

	const handleDragEnd = (event) => {
		setToggleSelectField(false);
		const { active, over } = event;
		if (active.id !== over.id) {
			const oldIndex = values.findIndex((i) => `${i.id}` === `${active.id}`);
			const newIndex = values.findIndex((i) => `${i.id}` === `${over.id}`);
			const updateValues = arrayMove(values, oldIndex, newIndex);
			onChange(updateValues);
			setOptionOpen(true);
		}
	};

	const onDragStart = () => {
		setOptionOpen(false);
		setToggleSelectField(false);
	};

	const handleRemoveItems = (id) => {
		const updatedValues = values?.filter((val) => val.id !== id);
		onChange(updatedValues);
	};

	const toggleSelectFieldVal = () => {
		if (optionOpen) {
			setToggleSelectField((prev) => !prev);
		}
	};

	const filterNotSelectedItems = (selectFieldItems) => {
		const result = selectFieldItems?.filter((item) => !allValues.includes(item.value));
		return result;
	};

	const handleSelectField = (data) => {
		// const { id, value, label, slug, order } = data;
		// const newValue = [ ...values, { id, value, label, slug, order } ];
		const newValue = [...values, { ...data }];
		setSearchFieldData('');
		onChange(newValue);
	};

	const handleSearchField = (event) => {
		const value = event.target.value.toLowerCase();
		setSearchFieldData(value);
		const searchableArray = filterNotSelectedItems(items);
		const matchedOption = searchableArray?.filter((i) => i.label.toLowerCase().includes(value));
		if (onInputChange) {
			onInputChange(value);
		} else {
			setAllOptions(matchedOption);
		}
	};

	useEffect(() => {
		let options = [];
		if (toggleSelectField) {
			options = filterNotSelectedItems(items);
		} else {
			options = [items];
		}
		setAllOptions(options);
	}, [items, values, toggleSelectField]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setToggleSelectField(false);
			}
		};

		if (toggleSelectField) {
			document.addEventListener('click', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [toggleSelectField]);

	return (
		<div className="shaped-plugin-multiple-select sp-smart-team-component-mb" ref={dndRef}>
			<div className="sp-multiple-select-dnd-label">
				<p> {label}</p>
			</div>
			<div className="sp-multiple-select-dnd-container" ref={containerRef}>
				<div onClick={toggleSelectFieldVal} className="sp-select-header">
					<div className="sp-selected-options" style={{ height: containerHeight }}>
						<DndContext
							sensors={sensors}
							onDragEnd={handleDragEnd}
							onDragStart={onDragStart}
							modifiers={[restrictToVerticalAxis]}
						>
							<SortableContext
								items={values?.map((item) => `${item.id}`)}
								strategy={verticalListSortingStrategy}
							>
								{values?.map((item, index) => (
									<SortableItem
										key={item.id}
										id={`${item.id}`}
										index={index}
										item={item}
										onChange={handleRemoveItems}
									/>
								))}
							</SortableContext>
						</DndContext>
					</div>
					<span className="custom-select-arrow">
						{toggleSelectField ? <ArrowIconTwo /> : <ArrowIconOne />}
					</span>
				</div>
				{toggleSelectField && (
					<div className="sp-select-options">
						{searchable && (
							<input
								placeholder="Search here for more..."
								value={searchFieldData}
								onChange={(e) => handleSearchField(e)}
								className="sp-select-search-field"
							/>
						)}
						{allOptions?.length > 0 &&
							allOptions?.map((option, i) => {
								return (
									<div key={i}>
										{option?.label && option?.value && (
											<p
												onClick={() => handleSelectField(option)}
												className={`sp-select-option ${values === option.value ? 'selected' : ''}`}
											>
												{option.label}
											</p>
										)}
									</div>
								);
							})}
					</div>
				)}
			</div>
		</div>
	);
};

export default memo(MultiSelectDndKit);
