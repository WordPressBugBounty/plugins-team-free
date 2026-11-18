/**
 * Editor Swiper initializer for the Carousel block (port of testimonial-pro's
 * useSwiperConfig). Mounts a REAL Swiper instance (npm `swiper`) on the editor
 * preview markup and re-initializes it whenever a carousel attribute changes,
 * so the canvas behaves exactly like the frontend. The option builder mirrors
 * blocks/Includes/SwiperConfig.php — keep both in lock-step.
 *
 * Touch/drag is disabled in the editor (allowTouchMove/simulateTouch false)
 * so selecting the block doesn't fight the slider; the frontend runtime
 * (initCarousel in blocks/assets/js/script.js) leaves them on.
 */

import { useEffect, useRef, useState } from '@wordpress/element';
import Swiper from 'swiper';
import {
	Navigation,
	Pagination,
	Autoplay,
	Keyboard,
	Grid,
	EffectCoverflow,
	EffectFade,
	EffectCube,
	EffectFlip,
	EffectCreative,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/grid';
// Each effect's own CSS — without it the editor preview misses e.g. the cube's
// blurred floor shadow and backface rules (the frontend loads the full bundle).
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-cube';
import 'swiper/css/effect-flip';
import 'swiper/css/effect-creative';

import { useDeviceType } from '../controls/controls';
import {
	getSwiperLoopMinimumSlides,
	getSwiperClonedLoopMinimumSlides,
	getLoopPaddedSlideCount,
} from '../utils/swiperLoop';

const EFFECT_MODULES = {
	coverflow: EffectCoverflow,
	fade: EffectFade,
	cube: EffectCube,
	flip: EffectFlip,
	creative: EffectCreative,
};

const EFFECT_CONFIGS = {
	coverflow: { rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true },
	fade: { crossFade: true },
	cube: { slideShadows: true, shadow: true, shadowOffset: 20, shadowScale: 0.94 },
	flip: { slideShadows: true, limitRotation: true },
	creative: {
		limitProgress: 100,
		prev: { translate: ['calc(-100% - var(--sptp-spring-gap, 0px))', 0, 0] },
		next: { translate: ['calc(100% + var(--sptp-spring-gap, 0px))', 0, 0] },
	},
};

const setSpringGap = (swiper) => {
	if (!swiper?.el) {
		return;
	}
	const gap = Number(swiper.params?.spaceBetween) || 0;
	swiper.el.style.setProperty('--sptp-spring-gap', `${gap}px`);
};

const applySpringStagger = (swiper, speed) => {
	if (!swiper?.visibleSlidesIndexes) {
		return;
	}
	const dir = swiper.progress > (swiper._sptpSpringProgress ?? 0) ? 'next' : 'prev';
	swiper._sptpSpringProgress = swiper.progress;
	const delayStep = (Number(speed) || 600) / 16;
	const first = swiper.visibleSlidesIndexes[0];
	const last = swiper.visibleSlidesIndexes[swiper.visibleSlidesIndexes.length - 1];
	swiper.slides.forEach((slide, idx) => {
		if (dir === 'next' && idx >= first) {
			slide.style.transitionDelay = `${(idx - first + 1) * delayStep}ms`;
		} else if (dir === 'prev' && idx <= last + 1) {
			slide.style.transitionDelay = `${(last - idx + 1) * delayStep}ms`;
		} else {
			slide.style.transitionDelay = '0ms';
		}
	});
};

const clearSpringStagger = (swiper) => {
	swiper?.slides?.forEach((slide) => {
		slide.style.transitionDelay = '0ms';
	});
};

// Coerce the sliding effect against the carousel style (twin of
// SwiperConfig::resolve_effect): the center style locks the slide effect (the
// ticker style never reaches Swiper at all); "none" and "ken-burns" ride on a
// plain slide transition; the Figma "Spring" effect is Swiper's creative
// effect; legacy coverflow still resolves.
export const resolveEffect = (carouselStyle, slidingEffect, partialLeft = false) => {
	// Legacy saves — the coverflow style was removed.
	if (carouselStyle === 'coverflow') {
		return 'coverflow';
	}
	// Center + ticker lock the slide effect; multi-row uses Swiper's grid module,
	// which is incompatible with fade/cube/flip/creative — lock it too.
	if (carouselStyle === 'center' || carouselStyle === 'ticker' || carouselStyle === 'multi-row') {
		return 'slide';
	}
	if (slidingEffect === 'ken-burns' || slidingEffect === 'none') {
		return 'slide';
	}
	if (slidingEffect === 'spring') {
		// Swiper's creative effect has no RTL support (the editor's v12 and
		// the frontend's v8 both place slides with LTR math), so the
		// partial-left dir=rtl flip would scatter the slides — lock spring to
		// the plain slide transition there, like the center style does.
		return partialLeft ? 'slide' : 'creative';
	}
	return slidingEffect || 'slide';
};

// clampOffset — partial-view fraction validated to the open interval (0, 1); null otherwise.
const clampOffset = (value) => {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 && number < 1 ? number : null;
};

// layoutFor — per-device slidesPerView / slidesPerGroup / spaceBetween. When
// partial view is active, slidesPerView gains a single fractional peek
// (per-device, with a Tablet→Desktop, Mobile→Tablet→Desktop fallback cascade).
// "both" surfaces the peek symmetrically via centeredSlides; "left"/"right"
// via the flipped/natural swiper direction. Twin of SwiperConfig.php.
const layoutFor = (
	device,
	{ columns, slideToScroll, columnGap, partial, partialViewOffset },
	groupedEffect
) => {
	if (groupedEffect) {
		return { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 0 };
	}
	const baseColumns = Number(columns?.device?.[device]);
	let perView = Number.isFinite(baseColumns) ? baseColumns : 1;
	if (partial) {
		const byDevice = partialViewOffset?.device ?? {};
		const desktop = clampOffset(byDevice.Desktop) ?? 0.3;
		const tablet = clampOffset(byDevice.Tablet) ?? desktop;
		let offset = desktop;
		if (device === 'Tablet') {
			offset = tablet;
		} else if (device === 'Mobile') {
			offset = clampOffset(byDevice.Mobile) ?? tablet;
		}
		perView += offset;
	}
	const group = Number(slideToScroll?.device?.[device]);
	const gap = Number(columnGap?.device?.[device]);
	return {
		slidesPerView: perView,
		slidesPerGroup: Number.isFinite(group) ? Math.max(1, Math.trunc(group)) : 1,
		spaceBetween: Number.isFinite(gap) ? Math.trunc(gap) : 0,
	};
};

// Vertical Swiper has no intrinsic height and forces each slide to
// containerHeight / slidesPerView. Size the container to fit slidesPerView
// cards (plus the fractional peek for partial view) at the tallest card's
// natural height.
const applyVerticalHeight = (sliderEl, perView, gapBetween) => {
	if (!sliderEl) {
		return;
	}
	const spv = Number(perView) || 1;
	const gap = Number(gapBetween) || 0;
	const slides = Array.from(sliderEl.querySelectorAll('.swiper-slide'));
	if (!slides.length) {
		return;
	}
	// Drop any Swiper-forced height so we read the card's natural height.
	let maxH = 0;
	slides.forEach((slide) => {
		slide.style.height = '';
		maxH = Math.max(maxH, slide.offsetHeight);
	});
	if (maxH <= 0) {
		return;
	}
	const height = maxH * spv + gap * (Math.ceil(spv) - 1);
	sliderEl.style.height = `${Math.round(height)}px`;
};

// Swiper's `breakpoints` read the global window — in the editor that is the
// admin page, not the (iframed) canvas, so device previews and a narrow canvas
// would all get the Desktop layout. Resolve the device from the canvas
// window's width instead, with the frontend's breakpoints (SwiperConfig.php:
// 0 → Mobile, 768 → Tablet, 1024 → Desktop).
const canvasDeviceFor = (el) => {
	const width = el?.ownerDocument?.defaultView?.innerWidth ?? 0;
	if (width >= 1024) {
		return 'Desktop';
	}
	return width >= 768 ? 'Tablet' : 'Mobile';
};

const useSwiperConfig = (attributes, members = [], loading = false) => {
	const {
		uniqueId,
		cardDesign,
		cardElements,
		slidingEffect,
		carouselStyle,
		carouselDisplayStyle,
		enableNavigationArrow,
		navIconPosition,
		enablePaginationDots,
		paginationStyle,
		sliderAutoPlay,
		adaptiveHeight,
		tabAndKeyNavigation,
		carouselDirection,
		partialSlideView,
		partialViewSide,
		partialViewOffset,
		pauseOnHover,
		infiniteLoop,
		freeScrollMode,
		carouselAutoplayDelay,
		carouselSpeed,
		slideToScroll,
		columnGap,
		columns,
		carouselRows,
		align,
	} = attributes;

	const swiperRef = useRef(null);
	const swiperInstanceRef = useRef(null);
	const navNextEl = useRef(null);
	const navPrevEl = useRef(null);
	const paginationRef = useRef(null);
	const currentDevice = useDeviceType();
	const [canvasDevice, setCanvasDevice] = useState('Desktop');

	// Partial peek applies only to the default horizontal carousel.
	const partial =
		!!partialSlideView && carouselStyle === 'default' && carouselDisplayStyle === 'horizontal';
	const side = ['left', 'right', 'both'].includes(partialViewSide) ? partialViewSide : 'right';
	// Coerce effect against carousel style (SwiperConfig::resolve_effect twin);
	// partial-left locks spring to slide (Swiper creative has no RTL support).
	const effect = resolveEffect(carouselStyle, slidingEffect, partial && side === 'left');
	const groupedEffect = ['fade', 'cube', 'flip'].includes(effect);
	// Multi-row (Swiper grid module): rows of slides. Grid can't coexist with
	// loop (mis-lays the rows) and is horizontal only. Twin: SwiperConfig.php.
	const isMultiRow = carouselStyle === 'multi-row';
	const multiRowGrid = isMultiRow
		? { rows: Math.max(1, Math.trunc(Number(carouselRows) || 2)), fill: 'row' }
		: null;
	// Spring effect — Swiper creative effect with the staggered-delay trail.
	const isSpring = effect === 'creative';
	// "None" sliding effect = a slide transition with zero duration.
	const isInstant = slidingEffect === 'none' && carouselStyle === 'default';
	// carouselDirection names the way the cards MOVE: 'rtl' = right → left (the
	// default), 'ltr' = left → right via a mirrored RTL Swiper. Twin of
	// SwiperConfig::make() — see the comment there.
	const movesLeftToRight = (carouselDirection || 'rtl') === 'ltr';
	const isVerticalSwiper = carouselDisplayStyle === 'vertical' && carouselStyle !== 'multi-row';
	let swiperDir = 'ltr';
	if (partial) {
		swiperDir = side === 'left' ? 'rtl' : 'ltr';
	} else if (movesLeftToRight && effect !== 'creative' && !isVerticalSwiper) {
		swiperDir = 'rtl';
	}
	const layoutOptions = { columns, slideToScroll, columnGap, partial, partialViewOffset };
	const swiperSpeed = isInstant ? 0 : (carouselSpeed?.value ?? 600);
	const columnsValue = Number(columns?.device?.[canvasDevice]);
	const groupSize = groupedEffect
		? Math.max(1, Math.floor(Number.isFinite(columnsValue) ? columnsValue : 1))
		: 1;
	const groupGap = groupedEffect ? layoutFor(canvasDevice, layoutOptions, false).spaceBetween : 0;
	const shouldGroupSlides = groupedEffect && groupSize > 1;
	const membersCount = members.length;
	const membersKey = members.map((m) => m?.id ?? '').join(',');
	// Toggling a card element on/off (or reordering) changes the slide markup —
	// re-init so Swiper re-measures.
	const cardElementsKey = Array.isArray(cardElements)
		? cardElements.map((c) => `${c?.value}:${c?.show ? 1 : 0}`).join(',')
		: '';

	// centeredSlides: center/coverflow styles center their slides; partial
	// view with side "both" reuses centering so the fractional peek splits
	// evenly across both edges.
	const wantsCentered =
		['center', 'coverflow'].includes(carouselStyle) ||
		effect === 'coverflow' ||
		(partial && side === 'both');
	const centered = !groupedEffect && wantsCentered;

	// Loop capacity — Swiper needs enough slides to rebalance an infinite loop;
	// below the minimum it renders a broken partial loop (gaps / no wrap) instead
	// of looping. Like WP Carousel Pro, GATE the loop on that minimum rather than
	// duplicating slides to force it: compute the MAX minimum across all three
	// breakpoints (so the loop-enabled state is device-independent and matches
	// the frontend runtime, which reads the server-computed `loopMinimum`).
	// Grouped effects render one slide per group, so their capacity is the
	// single-slide minimum. Twin: SwiperConfig::loop_minimum_slides() (PHP).
	const loopBoth = centered || (partial && side === 'left');
	const loopMinimum = groupedEffect
		? getSwiperLoopMinimumSlides({
				slidesPerView: 1,
				slidesPerGroup: 1,
				bothDirections: loopBoth,
			})
		: Math.max(
				...['Desktop', 'Tablet', 'Mobile'].map((device) => {
					const layout = layoutFor(device, layoutOptions, false);
					return getSwiperLoopMinimumSlides({
						slidesPerView: layout.slidesPerView,
						slidesPerGroup: layout.slidesPerGroup,
						bothDirections: loopBoth,
					});
				})
			);
	const wantsLoop =
		!!infiniteLoop && carouselStyle !== 'ticker' && !isMultiRow && membersCount > 0;
	// Swiper 12 rebalances real slides and needs loopMinimum, so from
	// floor(spv) + 1 members repeat whole member sets to reach it and cap the
	// bullets back to the real count (twin of initCarousel's loopPadMinimum).
	const clonedLoopMinimum = Math.max(
		...['Desktop', 'Tablet', 'Mobile'].map((device) =>
			getSwiperClonedLoopMinimumSlides(layoutFor(device, layoutOptions, false).slidesPerView)
		)
	);
	const padForLoop =
		!groupedEffect &&
		wantsLoop &&
		membersCount >= clonedLoopMinimum &&
		membersCount < loopMinimum;
	const slideMembers = padForLoop
		? Array.from(
				{ length: getLoopPaddedSlideCount(membersCount, loopMinimum) },
				(_, i) => members[i % membersCount]
			)
		: members;
	const bulletCap = padForLoop ? membersCount : 0;

	const memberGroups = [];
	if (shouldGroupSlides) {
		for (let index = 0; index < slideMembers.length; index += groupSize) {
			memberGroups.push(slideMembers.slice(index, index + groupSize));
		}
		// A looping stack must not close on a short row — fill the last group with
		// members from the start so the ring has no gap (twin of groupEffectSlides).
		const lastGroup = memberGroups[memberGroups.length - 1];
		if (wantsLoop && memberGroups.length > 1 && lastGroup.length < groupSize) {
			for (let i = 0; lastGroup.length < groupSize; i++) {
				lastGroup.push(slideMembers[i % slideMembers.length]);
			}
		}
	}
	const slideCount = shouldGroupSlides ? memberGroups.length : slideMembers.length;
	const canLoop = wantsLoop && slideCount >= loopMinimum;

	// Track the canvas width — the iframe's own window fires `resize` when the
	// device preview or the canvas width changes.
	useEffect(() => {
		const win = swiperRef.current?.ownerDocument?.defaultView;
		if (!win) {
			return;
		}
		const sync = () => setCanvasDevice(canvasDeviceFor(swiperRef.current));
		sync();
		win.addEventListener('resize', sync);
		return () => win.removeEventListener('resize', sync);
	}, [membersCount, carouselStyle, currentDevice]);

	useEffect(() => {
		// The ticker style is a CSS-only marquee — no Swiper instance at all.
		if (!swiperRef.current || membersCount === 0 || carouselStyle === 'ticker') {
			return;
		}

		// Multi-row grid is horizontal only.
		const isVertical = carouselDisplayStyle === 'vertical' && !isMultiRow;
		// Clear any height left by a previous vertical init so horizontal
		// re-inits start clean.
		swiperRef.current.style.height = '';

		const modules = [Navigation];
		if (enablePaginationDots) {
			modules.push(Pagination);
		}
		if (sliderAutoPlay) {
			modules.push(Autoplay);
		}
		if (tabAndKeyNavigation) {
			modules.push(Keyboard);
		}
		if (EFFECT_MODULES[effect]) {
			modules.push(EFFECT_MODULES[effect]);
		}
		if (isMultiRow) {
			modules.push(Grid);
		}

		const paginationEl = paginationRef?.current;
		let pagination = false;

		// Duplicated-slide loop: while the duplicate half is active, Swiper's
		// own active class sits on a bullet the nth-child cap hides — mirror it
		// onto the matching real bullet so the dots track like the frontend.
		const syncCappedBullets = (swiper) => {
			if (!bulletCap || !paginationEl) {
				return;
			}
			const bullets = paginationEl.querySelectorAll('.swiper-pagination-bullet');
			const active = (((swiper.realIndex ?? 0) % bulletCap) + bulletCap) % bulletCap;
			bullets.forEach((bullet, index) => {
				bullet.classList.toggle('swiper-pagination-bullet-active', index === active);
			});
		};

		if (enablePaginationDots) {
			if (paginationStyle === 'number') {
				pagination = {
					el: paginationEl,
					clickable: true,
					type: 'bullets',
					renderBullet(index, className) {
						return `<span class="${className}">${index + 1}</span>`;
					},
				};
			} else {
				pagination = {
					el: paginationEl,
					clickable: true,
					type: 'bullets',
				};
			}
		}

		const swiperParams = {
			effect,
			direction: isVertical ? 'vertical' : 'horizontal',
			rtl: swiperDir === 'rtl',
			// Gated on loopMinimum above — enabled only with enough slides, so
			// Swiper never renders a broken partial loop (twin of the frontend).
			loop: canLoop,
			grabCursor: true,
			// Spring (creative): slides snap on release instead of tracking the finger.
			followFinger: !isSpring,
			autoHeight: adaptiveHeight && !isVertical,
			watchOverflow: true,
			// Twin of SwiperConfig.php: whole-pixel slide widths/offsets, so card edges
			// never land between pixels.
			roundLengths: true,
			a11y: { scrollOnFocus: false },
			centeredSlides: centered,
			watchSlidesProgress: effect !== 'slide',
			allowTouchMove: false,
			simulateTouch: false,
			resistance: true,
			resistanceRatio: 0.85,
			speed: swiperSpeed,
			// No stopOnLastSlide (Swiper default false, like WP Carousel Pro):
			// loop OFF -> autoplay rewinds to the first slide at the end; loop ON
			// -> seamless, never jumps back. Twin of SwiperConfig.php.
			autoplay: sliderAutoPlay
				? {
						reverseDirection: movesLeftToRight && swiperDir !== 'rtl',
						delay: carouselAutoplayDelay?.value ?? 3000,
						pauseOnMouseEnter: !!pauseOnHover,
						disableOnInteraction: false,
					}
				: false,
			keyboard: tabAndKeyNavigation ? { enabled: true, onlyInViewport: true } : false,
			// Mousewheel Control is frontend-only: in the canvas a captured wheel
			// would stop the editor itself from scrolling past the block.
			mousewheel: false,
			// Fade/flip/cube show one slide at a time: no free position to rest at, and
			// free mode would leave `animating` stuck (virtualTranslate has no wrapper
			// transition). The wheel and swipe step slide by slide instead.
			freeMode:
				freeScrollMode && !groupedEffect
					? { enabled: true, sticky: false, momentum: true, momentumBounce: true }
					: false,
			// No `breakpoints` — they would measure the admin window (see
			// canvasDeviceFor). The layout for the canvas's breakpoint is set
			// directly; crossing a breakpoint re-inits via `canvasDevice`.
			...layoutFor(canvasDevice, layoutOptions, groupedEffect),
			...(multiRowGrid ? { grid: multiRowGrid } : {}),
			modules,
			navigation: enableNavigationArrow
				? { nextEl: navNextEl?.current, prevEl: navPrevEl?.current }
				: false,
			pagination,
			on: {
				init(swiper) {
					if (adaptiveHeight && swiper) {
						// Defer so cards reflect freshly toggled content before measuring.
						requestAnimationFrame(() => swiper.updateAutoHeight(0));
					}
					if (isVertical && swiper) {
						requestAnimationFrame(() => {
							const layout = layoutFor(canvasDevice, layoutOptions, groupedEffect);
							applyVerticalHeight(
								swiper.el,
								layout.slidesPerView,
								layout.spaceBetween
							);
							swiper.update();
						});
					}
					if (isSpring) {
						setSpringGap(swiper);
					}
				},
				// No slideChange → updateAutoHeight(): Swiper already re-measures in
				// slideTo()/transitionStart(). A manual call also fires on the loop
				// rebalance's instant jump, which leaves `swiper.animating` stuck
				// and loopPreventsSliding then blocks every further slide (the
				// carousel freezes near the last member). Twin: script.js.
				// Fires after the pagination module refreshes the bullets — the
				// capped-bullet mirror must run after it, not race it.
				paginationUpdate(swiper) {
					syncCappedBullets(swiper);
				},
				// Spring: fan slide transitionDelay out from the leading edge so slides trail.
				progress(swiper) {
					if (isSpring) {
						applySpringStagger(swiper, swiperSpeed);
					}
				},
				touchStart(swiper) {
					if (isSpring) {
						clearSpringStagger(swiper);
					}
				},
				transitionEnd(swiper) {
					if (isSpring) {
						clearSpringStagger(swiper);
					}
				},
				resize(swiper) {
					if (swiper) {
						if (isVertical) {
							const layout = layoutFor(canvasDevice, layoutOptions, groupedEffect);
							applyVerticalHeight(
								swiper.el,
								layout.slidesPerView,
								layout.spaceBetween
							);
						}
						swiper.update();
						if (isSpring) {
							setSpringGap(swiper);
						}
					}
				},
				breakpoint(swiper) {
					if (isSpring) {
						setSpringGap(swiper);
					}
				},
			},
		};

		if (EFFECT_CONFIGS[effect]) {
			swiperParams[`${effect}Effect`] = EFFECT_CONFIGS[effect];
		}

		swiperInstanceRef.current = new Swiper(swiperRef.current, swiperParams);

		return () => {
			if (swiperInstanceRef.current) {
				swiperInstanceRef.current.destroy(true, true);
				swiperInstanceRef.current = null;
			}
		};
		// Derived values (layoutOptions, partial, swiperDir, …) are fully covered
		// by their source attributes below — mirroring testimonial-pro's hook.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		membersCount,
		membersKey,
		// The loading spinner unmounts the swiper element; a refetch returning the
		// same members (limit above the total) must still bind the fresh element.
		loading,
		uniqueId,
		cardDesign,
		cardElementsKey,
		effect,
		isInstant,
		carouselStyle,
		carouselDisplayStyle,
		enableNavigationArrow,
		// The arrow row moves before/after the swiper with the position, which
		// remounts it — Swiper must rebind to the new elements.
		navIconPosition,
		enablePaginationDots,
		paginationStyle,
		sliderAutoPlay,
		adaptiveHeight,
		tabAndKeyNavigation,
		carouselDirection,
		partialSlideView,
		pauseOnHover,
		infiniteLoop,
		freeScrollMode,
		partialViewSide,
		partialViewOffset?.device?.Desktop,
		partialViewOffset?.device?.Tablet,
		partialViewOffset?.device?.Mobile,
		carouselAutoplayDelay?.value,
		carouselSpeed?.value,
		slideToScroll?.device?.Desktop,
		slideToScroll?.device?.Tablet,
		slideToScroll?.device?.Mobile,
		columnGap?.device?.Desktop,
		columnGap?.device?.Tablet,
		columnGap?.device?.Mobile,
		columns?.device?.Desktop,
		columns?.device?.Tablet,
		columns?.device?.Mobile,
		carouselRows,
		groupSize,
		align,
		canvasDevice,
	]);

	return {
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
	};
};

export default useSwiperConfig;
