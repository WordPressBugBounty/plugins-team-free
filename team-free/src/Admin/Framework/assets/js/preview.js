jQuery(document).ready(function ($) {
	/**
	 * The fewest slides Swiper 12's loop runs on at every breakpoint — its own
	 * formula: the slides in view plus the slides it moves across the seam,
	 * rounded up to whole groups.
	 *
	 * @param {Object} config Swiper options.
	 * @return {number} Minimum slide count.
	 */
	function sptp_swiper_loop_minimum(config) {
		var entries = [config];
		$.each(config.breakpoints || {}, function (key, entry) {
			entries.push($.extend({}, config, entry));
		});
		return Math.max.apply(
			null,
			entries.map(function (entry) {
				var perGroup = Math.max(1, Math.ceil(Number(entry.slidesPerGroup) || 1));
				var perView = Math.max(1, Math.ceil(Number(entry.slidesPerView) || 1));
				return perView + perGroup;
			})
		);
	}

	/**
	 * The most slides any breakpoint shows at once.
	 *
	 * @param {Object} config Swiper options.
	 * @return {number} Slides in view.
	 */
	function sptp_swiper_max_per_view(config) {
		var views = [Number(config.slidesPerView) || 1];
		$.each(config.breakpoints || {}, function (key, entry) {
			views.push(Number(entry.slidesPerView) || 1);
		});
		return Math.max.apply(null, views);
	}

	/**
	 * Copied slides: hide their bullets and light the real member's one.
	 *
	 * @param {Object} swiper Swiper instance.
	 * @param {number} cap    Real member count.
	 */
	function sptp_cap_bullets(swiper, cap) {
		var perGroup = Math.max(1, parseInt(swiper.params.slidesPerGroup, 10) || 1);
		var shown = Math.ceil(cap / perGroup);
		var active = Math.floor((swiper.realIndex % cap) / perGroup);
		$(swiper.pagination.el)
			.find('.swiper-pagination-bullet')
			.each(function (index, bullet) {
				bullet.style.display = index < shown ? '' : 'none';
				$(bullet).toggleClass('swiper-pagination-bullet-active', index === active);
			});
	}

	/**
	 * Build a carousel on our vendored Swiper 12 (SPTPSwiper), or on the theme's
	 * Swiper when Swiper JS is dequeued, with the options written for Swiper 8
	 * fitted to it.
	 *
	 * @param {string} selector Carousel selector.
	 * @param {Object} options  Swiper options.
	 * @return {Object} Swiper instance.
	 */
	function sptp_team_swiper(selector, options) {
		var TeamSwiper = window.SPTPSwiper || window.Swiper;
		var wrapper = $(selector).first().children('.swiper-wrapper');
		var slides = wrapper.children('.swiper-slide');
		var minimum = sptp_swiper_loop_minimum(options);
		// Swiper 8 cloned slides to loop; repeat the members once there are more than fit in view.
		if (options.loop && slides.length > sptp_swiper_max_per_view(options)) {
			while (wrapper.children('.swiper-slide').length < minimum) {
				wrapper.append(slides.clone());
			}
		}
		var slideCount = wrapper.children('.swiper-slide').length;
		var bulletCap = slideCount > slides.length ? slides.length : 0;
		// Swiper 12 loops by re-ordering the real slides and only warns and jams
		// below its minimum; rewind instead.
		if (options.loop && slideCount < minimum) {
			options.loop = false;
			options.rewind = true;
		}
		// Our arrows carry their own icon; Swiper 12 would inject an SVG.
		if (options.navigation) {
			options.navigation.addIcons = false;
		}
		// Swiper 8's default; 12 changed it to false.
		if (options.autoplay) {
			options.autoplay.disableOnInteraction = true;
		}
		options.on = {
			// slideToLoop() slides on the next frame with no reflow; without one a
			// re-order the slide cancelled out leaves `animating` stuck.
			loopFix: function (swiper) {
				swiper._clientLeft = swiper.wrapperEl.clientLeft;
			},
		};
		if (bulletCap && options.pagination) {
			options.on.paginationRender = options.on.paginationUpdate = function (swiper) {
				sptp_cap_bullets(swiper, bulletCap);
			};
		}
		return new TeamSwiper(selector, options);
	}

	$(".sptp-page-loading-image").css("visibility", "visible");

	if ($(".sptp-carousel").length > 0 && $('.sptp-member').length) {
		$(".sptp-carousel").each(function () {
			var sptpID = $(this)
				.closest(".sptp-section")
				.attr("id");
			var sptpCarousel = $("#" + sptpID + " .sptp-main-carousel").data(
				"carousel"
			);
			var swiper = sptp_team_swiper("#" + sptpID + " .sptp-main-carousel", {
				speed: sptpCarousel.speed,
				slidesPerView: sptpCarousel.items,
				spaceBetween: sptpCarousel.spaceBetween,
				autoplay: sptpCarousel.autoplay ? ({ delay: sptpCarousel.autoplay_speed }) : false,
				mousewheel: sptpCarousel.mouse_wheel,
				loop: sptpCarousel.loop,
				autoHeight: sptpCarousel.autoHeight,
				allowTouchMove: sptpCarousel.allowTouchMove,
				simulateTouch: sptpCarousel.simulateTouch,
				freeMode: sptpCarousel.freeMode,
				grabCursor: true,
				pagination: {
					el: "#" + sptpID + " .sptp-main-carousel .swiper-pagination",
					dynamicBullets: 'dynamic' == sptpCarousel.pagination_type ? true : false,
					clickable: true
				},
				navigation: {
					nextEl: "#" + sptpID + " .sptp-main-carousel .sptp-button-next",
					prevEl: "#" + sptpID + " .sptp-main-carousel .sptp-button-prev"
				},
				breakpoints: {
					0: {
						slidesPerView: sptpCarousel.breakpoints.mobile,
						slidesPerGroup: sptpCarousel.breakpoints.mobile_pSlide
					},
					414: {
						slidesPerView: sptpCarousel.breakpoints.tablet,
						slidesPerGroup: sptpCarousel.breakpoints.tablet_pSlide
					},
					768: {
						slidesPerView: sptpCarousel.breakpoints.laptop,
						slidesPerGroup: sptpCarousel.breakpoints.laptop_pSlide
					},
					1024: {
						slidesPerView: sptpCarousel.breakpoints.desktop,
						slidesPerGroup: sptpCarousel.breakpoints.desktop_pSlide
					}
				},
				ally: {
					enabled: sptpCarousel.enabled,
					prevSlideMessage: sptpCarousel.prevSlideMessage,
					nextSlideMessage: sptpCarousel.nextSlideMessage,
					firstSlideMessage: sptpCarousel.firstSlideMessage,
					lastSlideMessage: sptpCarousel.lastSlideMessage,
					paginationBulletMessage: sptpCarousel.paginationBulletMessage
				},
				keyboard: {
					enabled: true
				}
			});

			if (sptpCarousel.stop_onhover && sptpCarousel.autoplay) {
				$("#" + sptpID + " .sptp-main-carousel").on({
					mouseenter: function () {
						swiper.autoplay.stop();
					},
					mouseleave: function () {
						swiper.autoplay.start();
					}
				});
			}

			// Progress bar animation.
			progressBarAnimation(sptpID);
		});
	}

	$(".sptp-page-loading-image").css("visibility", "hidden");

	/**
     * Grid layout.
     */
    if ($(".sptp-section").length > 0 && $('.sptp-member').length) {
        $(".sptp-section").each(function () {
            let sectionID = $(this).attr("id");

            // Progress bar animation.
            progressBarAnimation(sectionID);
        });
    }

	/**
     * Progress bar animation on loading.
     */
    function progressBarAnimation( sectionID ) {
        $("#"+sectionID + " .sptp-progress-container").each(function () {
            let percent = $(this).data("title");
            $(this)
                .find(".sptp-progress-bar")
                .animate({
                    width: percent
                },
                    1000
                );
            let percentInt = parseInt(percent);
            if (percentInt >= 95) {
                $(this)
                    .find(".sptp-top")
                    .css("right", 0);
            }
            if (percentInt === 100) {
                $(this)
                    .find(".sptp-top")
                    .css("width", "40px");
            }
        });
    }

	// Accordion toggle functionality
	$('.sptp-filter-by-taxonomies .spf-field-checkbox').on('change', function (event) {
		$(".pcp-opened-accordion").each(function () {
			if ($(this).hasClass('hidden')) {
				$(this).removeClass('pcp_saved_filter');
			} else {
				$(this).addClass('pcp_saved_filter');
			}
			if (!$(this).hasClass('pcp_saved_filter')) {
				if ($(this).find('.spf-accordion-title').siblings('.spf-accordion-content').hasClass('spf-accordion-open')) {
					$(this).find('.spf-accordion-title');
				} else {
					$(this).find('.spf-accordion-title').trigger('click');
					$(this).find('.spf-accordion-content').find('.spf-cloneable-add').trigger('click');
				}
			}
		});
	});

});
