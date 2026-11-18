(function ($) {
  "use strict";

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

  function SPTeamCarouselInit() {
    $(".sptp-page-loading-image").css("visibility", "visible");
    if ($(".sptp-carousel").length > 0 && $('.sptp-member').length) {
      $(".sptp-carousel").not(".sptp-carousel-loaded").each(function () {
        var sptpID = $(this)
          .closest(".sptp-section")
          .attr("id");
        var sptpCarousel = $("#" + sptpID + " .sptp-main-carousel").data(
          "carousel"
        );
        
        var teamSlider = sptp_team_swiper("#" + sptpID + " .sptp-main-carousel", {
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

        if (typeof teamSlider.autoplay != 'undefined') {
          if (sptpCarousel.stop_onhover && sptpCarousel.autoplay) {
            $("#" + sptpID + " .sptp-main-carousel").on({
              mouseenter: function () {
                teamSlider.autoplay.stop();
              },
              mouseleave: function () {
                teamSlider.autoplay.start();
              }
            });
          }
        }

        // Add a class for the Gutenberg Block.
        $(this).closest(".sptp-section").addClass("sptp-carousel-loaded");

      });
    }

    $(".sptp-page-loading-image").css("visibility", "hidden");
  }

  /**
   * Expose the initializer globally.
   *
   * The block editor canvas is an iframe since WordPress 6.3, so the editor has
   * to be able to run the initializer on the window that owns the markup instead
   * of re-downloading this file into the wrong document.
   */
  window.SPTeamCarouselInit = SPTeamCarouselInit;

  /**
   * Progress bar animation on loading (skill bars).
   */
  function progressBarAnimation(sectionID) {
    $("#" + sectionID + " .sptp-progress-container").each(function () {
      var percent = $(this).data("title");
      $(this)
        .find(".sptp-progress-bar")
        .animate({ width: percent }, 1000);
      var percentInt = parseInt(percent, 10);
      if (percentInt >= 95) {
        $(this).find(".sptp-top").css("right", 0);
      }
      if (percentInt === 100) {
        $(this).find(".sptp-top").css("width", "40px");
      }
    });
  }

  /**
   * Isotope filter. Run on load: the library is a footer script that another
   * shortcode on the page may have queued after this file.
   */
  function SPTeamIsotopeInit() {
    if (typeof $.fn.isotope === "undefined" || !$(".sptp-isotope").length) {
      return;
    }

    var sptpIsotope = $(".sptp-isotope").isotope({
      itemSelector: ".sp-team-item",
      layoutMode: "fitRows"
    });

    $("#sptp-isotope-filter-buttons").on("click", "button", function () {
      $("#sptp-isotope-filter-buttons button").removeClass("active");
      $(this).addClass("active");
      sptpIsotope.isotope({ filter: $(this).attr("data-filter") });
    });
  }

  // Initialize the carousel when the document is ready
  $(document).ready(function () {
    SPTeamCarouselInit();

    $(".sptp-section, .sptp-single-post").each(function () {
      progressBarAnimation($(this).attr("id"));
    });
  });

  $(window).on("load", SPTeamIsotopeInit);

  // Register the handler with Elementor's frontend event.
  $(window).on('elementor/frontend/init', function () {
    // For General Widget.
    elementorFrontend.hooks.addAction('frontend/element_ready/team_pro_shortcode.default', SPTeamCarouselInit);
    // For Deprecated widget.
    elementorFrontend.hooks.addAction('frontend/element_ready/sp_team_shortcode.default', SPTeamCarouselInit);
  });
})(jQuery);
