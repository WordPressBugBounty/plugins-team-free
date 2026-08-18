(function ($) {
  "use strict";

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
        
        var teamSlider = new Swiper("#" + sptpID + " .sptp-main-carousel", {
          speed: sptpCarousel.speed,
          slidesPerView: sptpCarousel.items,
          spaceBetween: sptpCarousel.spaceBetween,
          autoplay: sptpCarousel.autoplay ? ({ delay: sptpCarousel.autoplay_speed }) : false,
          preloadImages: false,
          mousewheel: sptpCarousel.mouse_wheel,
          loop: sptpCarousel.loop,
          lazy: sptpCarousel.lazy,
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

  // Initialize the carousel when the document is ready
  $(document).ready(function () {
    SPTeamCarouselInit();
  });

  // Register the handler with Elementor's frontend event.
  $(window).on('elementor/frontend/init', function () {
    // For General Widget.
    elementorFrontend.hooks.addAction('frontend/element_ready/team_pro_shortcode.default', SPTeamCarouselInit);
    // For Deprecated widget.
    elementorFrontend.hooks.addAction('frontend/element_ready/sp_team_shortcode.default', SPTeamCarouselInit);
  });
})(jQuery);
