/**
 * Swiper loop-capacity math (port of WP Carousel Pro's shared/utils/swiperLoop).
 *
 * Mirrors the capacity check in Swiper's `loopFix()`: an infinite loop needs
 * enough slides to rebalance around the active one, and below that count Swiper
 * renders a broken partial loop (gaps / no wrap) instead. Centered and partial
 * layouts need slides available in BOTH directions; grouped navigation rounds
 * the loop buffer up to a complete group.
 *
 * Used by the editor hook (useSwiperConfig.js) to gate `loop`; the PHP twin
 * `SwiperConfig::loop_minimum_slides()` computes the same value server-side and
 * ships it as `loopMinimum` in `data-swiper-settings`, which the frontend
 * runtime (initCarousel) compares against the real rendered slide count.
 */

/**
 * Minimum rendered slide count Swiper needs before it can loop.
 *
 * @param {Object}  options
 * @param {number}  options.slidesPerView          slidesPerView (may be fractional).
 * @param {number}  [options.slidesPerGroup=1]     slidesPerGroup.
 * @param {boolean} [options.bothDirections=false] Centered / partial-left layouts.
 * @return {number} Minimum slide count.
 */
export function getSwiperLoopMinimumSlides({
	slidesPerView,
	slidesPerGroup = 1,
	bothDirections = false,
}) {
	let perView = Math.max(1, Math.ceil(Number(slidesPerView) || 1));
	const group = Math.max(1, Math.ceil(Number(slidesPerGroup) || 1));

	if (bothDirections && perView % 2 === 0) {
		perView += 1;
	}

	let looped = bothDirections ? Math.max(group, Math.ceil(perView / 2)) : group;
	if (looped % group !== 0) {
		looped += group - (looped % group);
	}

	return perView + looped;
}

/**
 * @param {number} renderedSlideCount Number of rendered slides.
 * @param {Object} options            See getSwiperLoopMinimumSlides.
 * @return {boolean} Whether Swiper can safely enable loop mode.
 */
export function hasEnoughSlidesForSwiperLoop(renderedSlideCount, options) {
	return Math.max(0, Number(renderedSlideCount) || 0) >= getSwiperLoopMinimumSlides(options);
}

/**
 * Smallest member count that still loops — more slides than are visible.
 * Between this and the strict minimum both renderers repeat whole member sets.
 * Twin of SwiperConfig::cloned_loop_minimum_slides() (PHP), shipped as
 * `loopPadMinimum`.
 *
 * @param {number} slidesPerView slidesPerView (may be fractional).
 * @return {number} Minimum slide count.
 */
export function getSwiperClonedLoopMinimumSlides(slidesPerView) {
	return Math.max(1, Math.floor(Number(slidesPerView) || 1)) + 1;
}

/**
 * Slide count after repeating whole member sets until Swiper 12's strict loop
 * minimum is met (the frontend runtime pads its DOM the same way).
 *
 * @param {number} count         Real member count.
 * @param {number} strictMinimum getSwiperLoopMinimumSlides() result.
 * @return {number} Padded slide count (a multiple of count).
 */
export function getLoopPaddedSlideCount(count, strictMinimum) {
	if (count <= 0) {
		return 0;
	}
	return Math.ceil(Math.max(count, strictMinimum) / count) * count;
}
