import { memo, cloneElement, isValidElement, useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { RightSymbolIcon } from '../../icons/icons';
import ProChip from '../proChip/proChip.js';
import './editor.scss';

// Pro/Free gate (docs/pro-free-separation.md §5): an item flagged `pro: true`
// in its catalogue renders locked here — one shared control, never a
// per-call-site `if`. As in wp-carousel-free's Layouts (`.wpcp-pro-locked` +
// `ProBadge iconOnly` `.wpcp-pro-badge--corner`) the tile is dimmed with a
// crown chip pinned to its corner, always visible, and clicking it does
// nothing — only a Pro notice's Upgrade button links to pricing.
const Layout = ({ layout, handleActive, activeLayout, displayActive }) => {
	const { icon, value, label, pro } = layout;
	const isActive = value === activeLayout;

	// Pass `active` into the icon so SVGs can render their own active state
	// (e.g. a brand-colored frame). Icons that ignore the prop are unaffected.
	const renderedIcon = isValidElement(icon) ? cloneElement(icon, { active: isActive }) : icon;

	const onClick = () => {
		if (pro) {
			return;
		}
		handleActive(value);
	};

	return (
		<div
			onClick={onClick}
			className={`sp-smart-team-layout-card ${isActive && !pro ? 'active' : 'inactive'}${
				pro ? ' is-pro' : ''
			}`}
			title={pro ? __('Available in Smart Team Pro', 'team-free') : undefined}
		>
			{isActive && displayActive && !pro && (
				<span className="active-symbol">
					<RightSymbolIcon />
				</span>
			)}
			<div className="sp-smart-layout-img">{renderedIcon}</div>
			{pro && <ProChip corner />}
			{label && <p className="sp-smart-team-layout-title">{label}</p>}
		</div>
	);
};

const chunk = (items, size) =>
	Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
		items.slice(i * size, (i + 1) * size)
	);

// Pages of `perPage` tiles in a Swiper; arrows sit inside and show on hover.
const LayoutSlider = ({ pages, grid, activeLayout, renderLayout }) => {
	const swiperRef = useRef();
	const prevRef = useRef();
	const nextRef = useRef();
	const paginationRef = useRef();
	const activePage = Math.max(
		0,
		pages.findIndex((page) => page.some(({ value }) => value === activeLayout))
	);

	useEffect(() => {
		const swiper = new Swiper(swiperRef.current, {
			modules: [Navigation, Pagination],
			slidesPerView: 1,
			// A short last page (one row) must not keep the full pages' height.
			autoHeight: true,
			spaceBetween: 16,
			initialSlide: activePage,
			navigation: { prevEl: prevRef.current, nextEl: nextRef.current },
			pagination: { el: paginationRef.current, clickable: true },
		});
		return () => swiper.destroy(true, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pages.length]);

	return (
		<div className="sp-smart-team-layouts-slider">
			<div className="sp-smart-team-layouts-slider__viewport">
				<div className="swiper" ref={swiperRef}>
					<div className="swiper-wrapper">
						{pages.map((page, pageIndex) => (
							<div className="swiper-slide" key={pageIndex}>
								<div className={`sp-smart-team-layouts grid-${grid}`}>
									{page.map(renderLayout)}
								</div>
							</div>
						))}
					</div>
				</div>
				<button
					type="button"
					ref={prevRef}
					className="sp-smart-team-layouts-slider__nav is-prev"
					aria-label={__('Previous', 'team-free')}
				>
					<Icon icon={chevronLeft} size={18} />
				</button>
				<button
					type="button"
					ref={nextRef}
					className="sp-smart-team-layouts-slider__nav is-next"
					aria-label={__('Next', 'team-free')}
				>
					<Icon icon={chevronRight} size={18} />
				</button>
			</div>
			<div className="sp-smart-team-layouts-slider__pagination" ref={paginationRef} />
		</div>
	);
};

const Layouts = ({
	attributes,
	setAttributes,
	attributesKey,
	displayActive = false,
	label = '',
	grid = 2,
	items,
	onChange = false,
	// Show the active item's `name` on the label row, right-aligned (WP
	// Carousel Pro's Layouts head). Items without a `name` show nothing extra.
	showActiveName = false,
	perPage = 0,
}) => {
	const handleActive = (value) => {
		if (value === attributes) {
			return;
		}
		if (onChange) {
			onChange(value);
		}
		setAttributes({ [attributesKey]: value });
	};

	const activeName = showActiveName ? items?.find((item) => item.value === attributes)?.name : '';

	const renderLayout = (layout) => (
		<Layout
			key={layout.value}
			layout={layout}
			displayActive={displayActive}
			handleActive={handleActive}
			activeLayout={attributes}
		/>
	);

	return (
		<div className="sp-smart-team-layout-picker sp-smart-team-panel-pb">
			{label && activeName && (
				<div className="sp-smart-team-layout-picker__head">
					<p className="sp-smart-team-component-title">{label}</p>
					<p className="sp-smart-team-layout-picker__active-name">{activeName}</p>
				</div>
			)}
			{label && !activeName && <p className="sp-smart-team-component-title">{label}</p>}
			{perPage && items?.length > perPage ? (
				<LayoutSlider
					pages={chunk(items, perPage)}
					grid={grid}
					activeLayout={attributes}
					renderLayout={renderLayout}
				/>
			) : (
				<div className={`sp-smart-team-layouts grid-${grid}`}>
					{items?.map(renderLayout)}
				</div>
			)}
		</div>
	);
};

export default memo(Layouts);
