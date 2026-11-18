/**
 * Smart Team (free) — frontend runtime.
 *
 * Powers the sptp/ajax-pagination block (port of testimonial-pro's script.js
 * runtime, adapted to the sp-smart-team markup): pages a Smart Team grid via
 * the public `sptp_query_members` admin-ajax action. Enqueued raw (no transpile) — keep this file
 * browser-native JS. Loaded only when a block needs it (the child blocks'
 * render_block() enqueues it).
 */
(() => {
	'use strict';

	// ------------------------------------------------------------------
	// Shared helpers
	// ------------------------------------------------------------------

	const toInt = (value, fallback = 0) => parseInt(value, 10) || fallback;

	/* Read a settings payload out of a `data-*` attribute.
	 *
	 * PHP writes these percent-encoded (AbstractBlock::json_attr) because page
	 * builders re-emit our markup after decoding HTML entities: a value holding
	 * `&quot;` becomes a literal `"` that closes the attribute, leaving the
	 * browser with `data-swiper-settings="{"`. Percent-encoding has no character
	 * that can do that.
	 *
	 * Bare JSON is still accepted, so markup cached or saved from an older
	 * version keeps working — hence the sniff on the first character rather than
	 * decoding unconditionally. */
	const parseJsonAttr = (raw, fallback = null) => {
		const value = (raw || '').trim();
		if (!value) {
			return fallback;
		}
		try {
			const first = value.charAt(0);
			return JSON.parse(
				first === '{' || first === '[' ? value : decodeURIComponent(value)
			);
		} catch (error) {
			return fallback;
		}
	};

	const onReady = (callback) => {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', callback);
		} else {
			callback();
		}
	};

	const ajaxPost = async (body) => {
		// eslint-disable-next-line no-undef
		const response = await fetch(sptp_localize_data.ajaxUrl, {
			method: 'POST',
			body,
		});
		return response.json();
	};

	// ------------------------------------------------------------------
	// Ajax query — shared fetch for pagination
	// ------------------------------------------------------------------

	/**
	 * Query members via admin-ajax and render into the grid's items wrapper.
	 *
	 * @param {Object}   queryData           Query params merged into the request
	 * @param {Element}  grid                The .sp-smart-team-grid element
	 * @param {Object}   [options]
	 * @param {string}   [options.mode]      'replace' (default) or 'append'
	 * @param {Function} [options.onSuccess] Called with res.data on success
	 * @return {Promise<Object|undefined>} Parsed ajax response
	 */
	const queryMembers = async (queryData, grid, options = {}) => {
		const { mode = 'replace', onSuccess } = options;
		const itemsWrapper = grid.querySelector('.sp-smart-team-grid__items');

		try {
			const res = await ajaxPost(
				new URLSearchParams({
					action: 'sptp_query_members',
					// eslint-disable-next-line no-undef
					nonce: sptp_localize_data.nonce,
					...queryData,
				})
			);
			if (!res?.success || !itemsWrapper) {
				return res;
			}
			const html = res.data?.html ?? '';
			if (mode === 'append') {
				if (html) {
					itemsWrapper.insertAdjacentHTML('beforeend', html);
				}
			} else {
				itemsWrapper.innerHTML = html;
			}
			// Paged cards are fresh DOM — their skill bars
			// carry the `--animate` gate and need observing too.
			initSkillBars(itemsWrapper);
			onSuccess?.(res.data || {});
			return res;
		} catch {
			// Swallow — UI keeps prior state.
		}
	};

	// ------------------------------------------------------------------
	// Group block child blocks — ajax pagination. Ajax Member Search and
	// Live Frontend Filter are Pro (their blocks render '' in Free), so their
	// runtime does not ship here.
	// ------------------------------------------------------------------

	const initAjaxPagination = (qs, state) => {
		const paginationBlock = qs('.sp-smart-team-ajax-pagination');
		if (!paginationBlock) {
			return;
		}
		const { grid } = state;
		const paginationWrapper = paginationBlock.querySelector(
			'.sp-smart-team-ajax-pagination__wrapper'
		);
		const itemsWrapper = grid.querySelector('.sp-smart-team-grid__items');
		if (!paginationWrapper || !itemsWrapper) {
			return;
		}

		// Members the block can page through — already capped at Show Member.
		const totalItems = toInt(grid.dataset.totalMembers);

		const paginationData = parseJsonAttr(paginationWrapper.dataset.pagination, {});
		const itemsPerPage = toInt(paginationData?.itemsPerPage, 12);
		const numberOfLinks = toInt(paginationData?.numberOfLinks, 2);
		const { paginationButtonType, paginationNumberType } = paginationData;

		let currentPage = 1;
		let isLoading = false;
		// Every page — the server-rendered first one included — holds
		// `itemsPerPage` of the capped set, matching MemberQuery::page_args().
		const computeTotalPages = (total) => (total > 0 ? Math.ceil(total / itemsPerPage) : 0);
		const totalPages = computeTotalPages(totalItems);
		state.query = { ...state.query, per_page: itemsPerPage };

		const goToPage = (page, mode = 'replace') => {
			if (isLoading) {
				return;
			}
			isLoading = true;
			paginationWrapper.classList.add('is-loading');
			return queryMembers(
				{ ...state.query, per_page: itemsPerPage, current_page: page },
				grid,
				{ mode }
			).finally(() => {
				isLoading = false;
				paginationWrapper.classList.remove('is-loading');
			});
		};

		// A page swap leaves the reader at the strip below the new cards — bring
		// them back to the block top, as a classic full-page reload would.
		const scrollToGroupTop = () => {
			const target = grid.closest('.sp-smart-team-group') || grid;
			const adminBar = document.getElementById('wpadminbar');
			const offset = (adminBar ? adminBar.offsetHeight : 0) + 20;
			const top = target.getBoundingClientRect().top - offset;
			if (top >= 0) {
				return;
			}
			window.scrollTo({
				top: window.scrollY + top,
				behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
			});
		};

		// Load More — a button, or with Infinite Scroll a sentinel that replaces it
		// (WP Carousel Pro's model); both append.
		if (paginationButtonType === 'load-more') {
			const loadMoreWrap = paginationWrapper.querySelector(
				'.sp-smart-team-ajax-pagination__load-more'
			);
			const loadMoreBtn = loadMoreWrap?.querySelector('a.sp-smart-team-ajax-pagination__item');
			const sentinel = loadMoreWrap?.querySelector('.sp-smart-team-ajax-pagination__sentinel');
			const endMessage = paginationWrapper.querySelector('.sp-smart-team-ajax-pagination__ending');
			const trigger = loadMoreBtn || sentinel;

			const showEndState = () => {
				if (trigger) {
					trigger.style.display = 'none';
				}
				if (endMessage) {
					// An empty grid shows its own "No team members found." instead.
					endMessage.hidden = totalItems <= 0;
				}
			};

			// Hide the trigger when already on the last page (or no extra pages).
			const syncLoadMoreState = () => {
				// A single page never had more to load, so "No more members" would mislead.
				if (totalPages <= 1) {
					if (trigger) {
						trigger.style.display = 'none';
					}
					if (endMessage) {
						endMessage.hidden = true;
					}
					return;
				}
				if (trigger) {
					trigger.style.display = '';
				}
				if (endMessage) {
					endMessage.hidden = true;
				}
			};
			syncLoadMoreState();

			// Measured, not the observer's last entry — right after an append the
			// observer hasn't yet reported the sentinel scrolling out of view.
			const autoLoad = () => {
				const rect = sentinel?.getBoundingClientRect();
				if (rect && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0 && currentPage < totalPages) {
					loadNextPage();
				}
			};

			const loadNextPage = () => {
				if (isLoading) {
					return;
				}
				const nextPage = currentPage + 1;
				if (nextPage > totalPages) {
					showEndState();
					return;
				}
				currentPage = nextPage;
				goToPage(nextPage, 'append')?.then(() => {
					if (currentPage >= totalPages) {
						showEndState();
					} else if (sentinel) {
						// The observer only fires on visibility CHANGES — a sentinel
						// still in view after the append would otherwise stall.
						autoLoad();
					}
				});
			};

			loadMoreBtn?.addEventListener('click', (e) => {
				e.preventDefault();
				loadNextPage();
			});

			if (sentinel && 'IntersectionObserver' in window) {
				new IntersectionObserver((entries) => {
					if (entries.some((entry) => entry.isIntersecting)) {
						autoLoad();
					}
				}).observe(sentinel);
			}
		}

		// Numbered pagination.
		if (paginationButtonType === 'number') {
			const buttonsWrapper = paginationWrapper.querySelector(
				'.sp-smart-team-ajax-pagination__buttons'
			);
			if (!buttonsWrapper) {
				return;
			}
			// PHP renders prev/next stubs — keep them, manage numbered between.
			const prevBtn = buttonsWrapper.querySelector('.sp-smart-team-ajax-pagination__item--prev');
			const nextBtn = buttonsWrapper.querySelector('.sp-smart-team-ajax-pagination__item--next');

			// Windowed page list: `numberOfLinks` = how many numbered buttons the
			// sliding window shows (the window follows the current page); the
			// first/last pages stay visible as anchors with "…" where pages
			// collapse.
			const pagesToRender = () => {
				if (totalPages <= numberOfLinks) {
					return Array.from({ length: totalPages }, (_, i) => i + 1);
				}
				// (numberOfLinks - 1) so an even window leans forward — with 2
				// links, page 2 shows [2, 3] instead of sticking at [1, 2].
				const start = Math.min(
					Math.max(1, currentPage - Math.floor((numberOfLinks - 1) / 2)),
					totalPages - numberOfLinks + 1
				);
				const end = start + numberOfLinks - 1;
				// Anchors are always fenced off with "…" — even when adjacent to
				// the window — so the strip never shows more than `numberOfLinks`
				// contiguous window numbers.
				const pages = [];
				if (start > 1) {
					pages.push(1, 'dots');
				}
				for (let p = start; p <= end; p++) {
					pages.push(p);
				}
				if (end < totalPages) {
					pages.push('dots', totalPages);
				}
				return pages;
			};

			// Rebuilt on every page change — the window shifts with the current page.
			const renderPageButtons = () => {
				// Drop stale numbered buttons (keep the prev/next stubs).
				buttonsWrapper
					.querySelectorAll('.sp-smart-team-ajax-pagination__item')
					.forEach((b) => {
						if (b !== prevBtn && b !== nextBtn) {
							b.remove();
						}
					});

				if (totalPages <= 1 || paginationNumberType === 'prev-next') {
					return;
				}
				pagesToRender().forEach((p) => {
					let btn;
					if (p === 'dots') {
						btn = document.createElement('span');
						btn.className =
							'sp-smart-team-ajax-pagination__item sp-smart-team-ajax-pagination__dots';
						btn.textContent = '…';
					} else {
						btn = document.createElement('a');
						btn.href = '#';
						btn.className =
							'sp-smart-team-ajax-pagination__item' + (p === currentPage ? ' is-current' : '');
						btn.dataset.value = p;
						// Zero-padded display (01, 02, …); dataset keeps the raw number.
						btn.textContent = String(p).padStart(2, '0');
					}
					if (nextBtn) {
						buttonsWrapper.insertBefore(btn, nextBtn);
					} else {
						buttonsWrapper.appendChild(btn);
					}
				});
			};

			const syncNavState = () => {
				// One page or none → no pagination UI.
				buttonsWrapper.style.display = totalPages > 1 ? '' : 'none';
				prevBtn?.classList.toggle('is-disabled', currentPage <= 1);
				nextBtn?.classList.toggle('is-disabled', totalPages > 0 && currentPage >= totalPages);
				buttonsWrapper.querySelectorAll('.sp-smart-team-ajax-pagination__item').forEach((b) => {
					if (b === prevBtn || b === nextBtn) {
						return;
					}
					b.classList.toggle('is-current', toInt(b.dataset.value) === currentPage);
				});
				buttonsWrapper.dataset.page = currentPage;
			};
			renderPageButtons();
			syncNavState();

			buttonsWrapper.addEventListener('click', (e) => {
				const btn = e.target.closest('.sp-smart-team-ajax-pagination__item');
				if (!btn) {
					return;
				}
				e.preventDefault();
				if (btn.classList.contains('is-disabled')) {
					return;
				}
				let page = currentPage;
				if (btn === prevBtn) {
					page = Math.max(1, currentPage - 1);
				} else if (btn === nextBtn) {
					page = totalPages ? Math.min(totalPages, currentPage + 1) : currentPage + 1;
				} else if (btn.dataset.value) {
					page = toInt(btn.dataset.value, 1);
				}
				if (page === currentPage) {
					return;
				}
				currentPage = page;
				goToPage(currentPage, 'replace')?.then(scrollToGroupTop);
				// Rebuild — the "…" window follows the current page.
				renderPageButtons();
				syncNavState();
			});
		}
	};

	// ------------------------------------------------------------------
	// Carousel (Swiper) — port of testimonial-pro's initSlider. The block's
	// PHP render serializes the conflict-resolved options (SwiperConfig.php)
	// into data-swiper-settings; this runtime hydrates nav/pagination elements
	// and news up the vendored Swiper (sptp-swiper handle, enqueued only when
	// a carousel is on the page). Mirrors apps/hooks/useSwiperConfig.js.
	// ------------------------------------------------------------------

	const EFFECT_CONFIGS = {
		coverflow: {
			rotate: 50,
			stretch: 0,
			depth: 100,
			modifier: 1,
			slideShadows: true,
		},
		fade: {
			crossFade: true,
		},
		cube: {
			slideShadows: true,
			shadow: true,
			shadowOffset: 20,
			shadowScale: 0.94,
		},
		flip: {
			slideShadows: true,
			limitRotation: true,
		},
		creative: {
			limitProgress: 100,
			prev: { translate: ['calc(-100% - var(--sptp-spring-gap, 0px))', 0, 0] },
			next: { translate: ['calc(100% + var(--sptp-spring-gap, 0px))', 0, 0] },
		},
	};

	// Spring (creative effect) helpers — setSpringGap feeds the column gap
	// into the creative translate; the stagger fans per-slide transitionDelay
	// out from the leading edge so slides trail one another.
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

	// Effects that render one slide at a time — multi-column layouts are
	// emulated by grouping cards into a single slide.
	const GROUPED_EFFECTS = ['fade', 'cube', 'flip'];

	// Resolve a swiper setting for the current viewport (base value overridden
	// by the largest matching breakpoint).
	const getBreakpointSetting = (settings, key) => {
		const width = window.innerWidth || 0;
		const breakpoints = settings.breakpoints || {};

		return Object.keys(breakpoints)
			.map(Number)
			.sort((a, b) => a - b)
			.reduce(
				(value, breakpoint) =>
					width >= breakpoint && breakpoints[breakpoint]?.[key] !== undefined
						? breakpoints[breakpoint][key]
						: value,
				settings[key]
			);
	};

	const groupEffectSlides = (sliderEl, settings) => {
		if (!GROUPED_EFFECTS.includes(settings.effect)) {
			return;
		}

		const wrapper = sliderEl.querySelector('.swiper-wrapper');
		const groupSize = Math.max(
			1,
			Math.floor(Number(getBreakpointSetting(settings, 'slidesPerView')) || 1)
		);

		// Bail if single-column, or already grouped — the dataset flag guards
		// against a second init (e.g. resize) re-wrapping the cards.
		if (!wrapper || groupSize <= 1 || wrapper.dataset.sptpEffectGrouped) {
			return;
		}

		const groupGap = Number(getBreakpointSetting(settings, 'spaceBetween')) || 0;
		// The hidden meta-icon sprite <svg> rides inside the first slide's card
		// markup, so every wrapper child here is a real slide.
		const slides = Array.from(wrapper.children).filter((el) =>
			el.classList.contains('swiper-slide')
		);
		wrapper.dataset.sptpEffectGrouped = 'true';

		slides.forEach((slide) => {
			slide.classList.remove(
				'swiper-slide',
				'sp-smart-team-swiper-slide',
				'sp-smart-team-carousel__slide'
			);
			slide.classList.add('sp-smart-team-swiper-effect-group-item');
			slide.style.width = '';
		});

		const groups = [];
		for (let index = 0; index < slides.length; index += groupSize) {
			const group = document.createElement('div');
			group.className =
				'sp-smart-team-carousel__slide sp-smart-team-swiper-slide swiper-slide sp-smart-team-swiper-effect-group';
			group.style.setProperty('--sptp-carousel-effect-columns', groupSize);
			group.style.setProperty('--sptp-carousel-effect-gap', `${groupGap}px`);

			slides.slice(index, index + groupSize).forEach((slide) => group.appendChild(slide));
			wrapper.appendChild(group);
			groups.push(group);
		}

		// A looping stack must not close on a short row — fill the last group with
		// members from the start so the ring has no gap (twin of useSwiperConfig).
		const lastGroup = groups[groups.length - 1];
		if (settings.loop && groups.length > 1 && lastGroup.children.length < groupSize) {
			for (let i = 0; lastGroup.children.length < groupSize; i++) {
				const clone = slides[i % slides.length].cloneNode(true);
				clone
					.querySelectorAll('[data-sptp-skill-init]')
					.forEach((el) => delete el.dataset.sptpSkillInit);
				lastGroup.appendChild(clone);
			}
			initSkillBars(sliderEl);
		}

		// Grouped cards travel as one slide — collapse per-view settings.
		const collapse = (target) => {
			target.slidesPerView = 1;
			target.slidesPerGroup = 1;
			target.spaceBetween = 0;
		};
		collapse(settings);
		Object.values(settings.breakpoints || {}).forEach(collapse);
	};

	const buildPaginationConfig = (paginationEl, paginationStyle) => {
		if (!paginationEl) {
			return false;
		}

		if (paginationStyle === 'number') {
			return {
				el: paginationEl,
				clickable: true,
				type: 'bullets',
				renderBullet: (index, className) => `<span class="${className}">${index + 1}</span>`,
			};
		}

		// Dots.
		return {
			el: paginationEl,
			clickable: true,
			type: 'bullets',
		};
	};

	// Repeated slides: hide the repeat bullets and mark the real member's
	// bullet active (twin of syncCappedBullets in useSwiperConfig.js).
	const syncCappedBullets = (swiper, paginationEl, bulletCap) => {
		if (!bulletCap || !paginationEl) {
			return;
		}
		const active = (((swiper.realIndex || 0) % bulletCap) + bulletCap) % bulletCap;
		paginationEl.querySelectorAll('.swiper-pagination-bullet').forEach((bullet, index) => {
			bullet.style.display = index < bulletCap ? '' : 'none';
			bullet.classList.toggle('swiper-pagination-bullet-active', index === active);
		});
	};

	// Vertical Swiper has no intrinsic height — without one the wrapper grows
	// to stack every slide. Swiper also forces each slide's height to
	// containerHeight / slidesPerView, so size the container to fit
	// slidesPerView cards (plus the fractional peek for partial view) at the
	// tallest card's natural height.
	const applyVerticalHeight = (sliderEl, settings) => {
		if (settings.direction !== 'vertical') {
			return;
		}
		const spv = Number(getBreakpointSetting(settings, 'slidesPerView')) || 1;
		const gap = Number(getBreakpointSetting(settings, 'spaceBetween')) || 0;
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
		// container = spv cards + the gaps between the whole cards shown.
		const height = maxH * spv + gap * (Math.ceil(spv) - 1);
		sliderEl.style.height = `${Math.round(height)}px`;
	};

	// Our vendored bundle exports SPTPSwiper so another plugin's window.Swiper
	// (e.g. an older v8 build) never replaces it; Swiper is the dequeued fallback.
	const getSwiper = () => window.SPTPSwiper || (typeof Swiper === 'undefined' ? undefined : Swiper); // eslint-disable-line no-undef

	const initCarousel = (block) => {
		const sliderEl = block.querySelector('.sp-smart-team-swiper[data-swiper-settings]');
		const SwiperClass = getSwiper();
		if (!sliderEl || !SwiperClass) {
			return;
		}

		let settings;
		try {
			settings = parseJsonAttr(sliderEl.dataset.swiperSettings);
			if (!settings) {
				throw new Error('missing or malformed data-swiper-settings');
			}
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('Invalid swiper settings:', e);
			return;
		}

		const parent = sliderEl.parentElement;
		const paginationEl =
			sliderEl.querySelector('.sp-smart-team-swiper-pagination') ||
			parent?.querySelector('.sp-smart-team-swiper-pagination');
		const paginationStyle = settings?.paginationStyle;
		const nextEl = parent?.querySelector('.sp-smart-team-nav-next');
		const prevEl = parent?.querySelector('.sp-smart-team-nav-prev');
		const hasNav = settings.navigation && nextEl && prevEl;
		const isSpring = settings.effect === 'creative';
		const springSpeed = Number(settings.speed) || 600;

		groupEffectSlides(sliderEl, settings);

		// Loop capacity gate (twin of useSwiperConfig / WP Carousel Pro): Swiper
		// needs enough slides to rebalance an infinite loop; below the
		// server-computed minimum it renders a broken partial loop, so disable the
		// loop instead. Counted AFTER groupEffectSlides so grouped effects compare
		// their group-slide count. `loopMinimum` comes from SwiperConfig.php.
		// Swiper 12 moves real slides instead of cloning them, so from
		// `loopPadMinimum` up repeat whole member sets to reach the minimum —
		// twin of padForLoop in useSwiperConfig.js.
		let bulletCap = 0;
		if (settings.loop && settings.loopMinimum && settings.loopPadMinimum > 0) {
			const realSlides = Array.from(sliderEl.querySelectorAll('.swiper-slide'));
			const wrapper = sliderEl.querySelector('.swiper-wrapper');
			if (wrapper && realSlides.length >= settings.loopPadMinimum && realSlides.length < settings.loopMinimum) {
				bulletCap = realSlides.length;
				const target = Math.ceil(settings.loopMinimum / realSlides.length) * realSlides.length;
				for (let i = realSlides.length; i < target; i++) {
					const clone = realSlides[i % realSlides.length].cloneNode(true);
					// A copied init flag would leave the clone's skill bars unobserved.
					clone.querySelectorAll('[data-sptp-skill-init]').forEach((el) => delete el.dataset.sptpSkillInit);
					wrapper.appendChild(clone);
				}
				initSkillBars(sliderEl);
			}
		}
		if (settings.loop && settings.loopMinimum) {
			const slideCount = sliderEl.querySelectorAll('.swiper-slide').length;
			if (slideCount < settings.loopMinimum) {
				settings.loop = false;
			}
		}

		const swiperConfig = {
			...settings,
			navigation: hasNav ? { nextEl, prevEl } : false,
			pagination: buildPaginationConfig(paginationEl, paginationStyle),
			on: {
				init(swiper) {
					if (settings.autoHeight) {
						swiper.updateAutoHeight(300);
					}
					if (settings.direction === 'vertical') {
						requestAnimationFrame(() => {
							applyVerticalHeight(sliderEl, settings);
							swiper.update();
						});
					}
					if (isSpring) {
						setSpringGap(swiper);
					}
				},
				// No slideChange → updateAutoHeight(): Swiper re-measures in
				// slideTo()/transitionStart() itself, and a manual call on the loop
				// rebalance leaves `animating` stuck, freezing the loop. Twin:
				// useSwiperConfig.js.
				// undefined → Swiper skips binding the handler entirely.
				// Spring: fan slide transitionDelay out from the leading edge.
				progress: isSpring ? (swiper) => applySpringStagger(swiper, springSpeed) : undefined,
				touchStart: isSpring ? (swiper) => clearSpringStagger(swiper) : undefined,
				transitionEnd: isSpring ? (swiper) => clearSpringStagger(swiper) : undefined,
				breakpoint: isSpring ? (swiper) => setSpringGap(swiper) : undefined,
				// After the pagination module redraws, so the cap is not overwritten.
				paginationRender: bulletCap ? (swiper) => syncCappedBullets(swiper, paginationEl, bulletCap) : undefined,
				paginationUpdate: bulletCap ? (swiper) => syncCappedBullets(swiper, paginationEl, bulletCap) : undefined,
				resize(swiper) {
					if (settings.direction === 'vertical') {
						applyVerticalHeight(sliderEl, settings);
					}
					swiper.update();
					if (isSpring) {
						setSpringGap(swiper);
					}
				},
			},
		};

		const effectConfig = EFFECT_CONFIGS[settings.effect];
		if (effectConfig) {
			swiperConfig[`${settings.effect}Effect`] = effectConfig;
		}
		new SwiperClass(sliderEl, swiperConfig);
	};

	// ------------------------------------------------------------------
	// Init — one shared query state per group (twin of testimonial-pro's
	// initGroupBlock): child blocks scope to the grid inside the same
	// .sp-smart-team-group container.
	// ------------------------------------------------------------------

	const initGroupBlock = (group) => {
		const qs = (selector) => group.querySelector(selector);
		const grid = qs('.sp-smart-team-grid');
		if (!grid) {
			return;
		}
		// Shared mutable query state across the group's child blocks.
		const state = {
			grid,
			query: {
				// The grid wrapper id can be overridden by the Additional ID
				// control — the ajax attribute lookup needs the real uniqueId.
				unique_id: grid.dataset?.uniqueId || grid.id,
				post_id: grid.dataset?.postId,
			},
		};
		initAjaxPagination(qs, state);
	};

	// ------------------------------------------------------------------
	// Shared feature-detection helpers (preloader, skill bars).
	// ------------------------------------------------------------------

	const hasIntersectionObserver = () => typeof window.IntersectionObserver === 'function';

	const prefersReducedMotion = () =>
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------------------------------------------------------------------- */
	/* Skill progress bars — grow 0 → target on becoming visible               */
	/* ---------------------------------------------------------------------- */

	// Classic parity: the legacy shortcode paints the bar at `width: 0` and jQuery
	// animates it to `data-title`. Here the target rides the inline
	// `--sptp-skill-width` custom property, style.scss holds the bar at 0 while the
	// list carries `--animate` without `is-visible`, and this reveal flips it so the
	// CSS `transition: width 1s ease` does the animating. The gate class is only
	// ever printed by PHP alongside the enqueue of THIS script, so bars can never
	// be stranded at 0.
	const SKILLS_ANIMATE_SELECTOR = '.sp-smart-team-card__skills--animate';
	const SKILLS_OBSERVER_THRESHOLD = 0.2;

	const revealSkillBars = (list) => {
		list.classList.add('is-visible');
	};

	/**
	 * Observe every not-yet-revealed skills list inside a scope.
	 *
	 * @param {Element|Document} [scope] Container to search (default: document).
	 *                                   Ajax-injected cards and details templates
	 *                                   pass their own container.
	 */
	const initSkillBars = (scope) => {
		const root = scope || document;
		root.querySelectorAll(SKILLS_ANIMATE_SELECTOR).forEach((list) => {
			if (list.dataset.sptpSkillInit) {
				return;
			}
			list.dataset.sptpSkillInit = '1';

			// No IntersectionObserver (or reduced motion) — show the bars at once
			// rather than animate or, worse, leave them empty.
			if (!hasIntersectionObserver() || prefersReducedMotion()) {
				revealSkillBars(list);
				return;
			}

			const observer = new window.IntersectionObserver(
				(entries, obs) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							revealSkillBars(entry.target);
							obs.unobserve(entry.target);
						}
					});
				},
				{ threshold: SKILLS_OBSERVER_THRESHOLD }
			);
			observer.observe(list);
		});
	};

	// initSkillBars already guards itself; the rest bind
	// listeners unconditionally, so a second run over the same element would
	// double-bind. Page builders re-run the whole init after swapping module
	// markup in, so every entry point has to be one-shot per element.
	const once = (element, flag, init) => {
		if (element.dataset[flag]) {
			return;
		}
		element.dataset[flag] = '1';
		init(element);
	};

	// Member Details → Open as Modal is Pro (Pro_Gate::details_open_as() renders
	// it as the member's Single Page), so Free ships no modal runtime: a card
	// link is a plain link to the member page.
	const init = () => {
		initSkillBars();
		document
			.querySelectorAll('.sp-smart-team-group')
			.forEach((el) => once(el, 'sptpGroupInit', initGroupBlock));
		document
			.querySelectorAll('.sp-smart-team-carousel')
			.forEach((el) => once(el, 'sptpCarouselInit', initCarousel));
	};

	// The preloader is a CSS animation, so any DOM move (Swiper's loop shuffles
	// real slides) replays it. Retire it once its first reveal has finished.
	document.addEventListener(
		'animationend',
		(event) => {
			if (event.animationName !== 'sp-smart-team-preloader-hide') {
				return;
			}
			const card = event.target.closest('.sp-smart-team-card--preloading');
			if (!card) {
				return;
			}
			card.classList.remove('sp-smart-team-card--preloading', 'sp-smart-team-card--skeleton');
			event.target.remove();
		},
		true
	);

	// Page builders (Divi, …) swap module markup in over ajax with no page load,
	// so they need a way back into this IIFE. See Base\Builder_Assets.
	window.sptpTeamInit = init;

	onReady(init);
})();
