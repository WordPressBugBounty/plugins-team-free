<?php
/**
 * Carousel block — server-rendered.
 *
 * Displays `sptp_member` members in a Swiper carousel (port of Real
 * Testimonials Pro's carousel block). The card render pipeline is the shared
 * MemberLayoutBlock base — every slide is the same `.sp-smart-team-card` the
 * grid renders; this class contributes only the swiper shell: the
 * `.sp-smart-team-swiper` container carrying the conflict-resolved
 * `data-swiper-settings` JSON (built by SwiperConfig, mirrored by the editor
 * useSwiperConfig hook), the nav-arrow + pagination siblings, and the
 * on-demand enqueue of the vendored Swiper + frontend runtime.
 * The wrapper markup is the twin of apps/blocks/carousel/edit.jsx.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Carousel;

use ShapedPlugin\WPTeam\Blocks\Includes\MemberLayoutBlock;
use ShapedPlugin\WPTeam\Blocks\Includes\MemberQuery;
use ShapedPlugin\WPTeam\Blocks\Includes\SwiperConfig;
use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

defined( 'ABSPATH' ) || exit;

/**
 * Class Carousel
 */
class Carousel extends MemberLayoutBlock {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name      = 'carousel';
		$this->editor_scripts  = array( 'sptp-blocks-editor' );
		$this->editor_styles   = array( 'sptp-blocks-editor' );
		$this->styles          = array( 'sptp-blocks-style', 'sp_team_fontawesome', 'sp_team_fontello' );
		$this->is_dynamic      = true;
		$this->card_cell_class = 'sp-smart-team-carousel__slide sp-smart-team-swiper-slide swiper-slide';
	}

	/**
	 * Inline SVG markup for a navigation-arrow icon (port of testimonial-pro's
	 * BlocksHelper::get_navigation_arrow_svg_icon). Self-contained `<svg>`
	 * strings painted via currentColor; unknown keys fall back to
	 * chevron-outline. Twin of NAV_ARROW_ICONS in apps/blocks/carousel/icons.js.
	 *
	 * @param string $arrow_style Arrow icon slug.
	 * @return string
	 */
	public static function nav_arrow_svg( $arrow_style ) {
		$svgs = array(
			'chevron-solid'          => '<svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.49995 6.40003L1.89995 0.700024C1.49995 0.300024 0.899951 0.300024 0.499951 0.700024C0.0999514 1.10002 0.0999514 1.70002 0.499951 2.10002L5.39995 7.00003L0.499951 11.9C0.299951 12.1 0.199951 12.3 0.199951 12.6C0.199951 13.2 0.599951 13.6 1.19995 13.6C1.49995 13.6 1.69995 13.5 1.89995 13.3L7.59995 7.60003C7.89995 7.40003 7.89995 6.80002 7.49995 6.40003Z"/></svg>',
			'chevron-outline'        => '<svg width="10" height="18" viewBox="0 0 10 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M1.25005 17.25C1.05823 17.25 0.866234 17.1767 0.719797 17.0302C0.426734 16.7372 0.426734 16.2626 0.719797 15.9697L7.68955 8.99998L0.719797 2.03023C0.426734 1.73716 0.426734 1.2626 0.719797 0.969727C1.01286 0.676852 1.48742 0.676664 1.7803 0.969727L9.2803 8.46973C9.57336 8.76279 9.57336 9.23735 9.2803 9.53023L1.7803 17.0302C1.63386 17.1767 1.44186 17.25 1.25005 17.25Z"/></svg>',
			'chevron-bold'           => '<svg width="10" height="15" viewBox="0 0 10 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.35391 8.29922L2.97891 14.6742C2.53828 15.1148 1.82578 15.1148 1.38984 14.6742L0.330469 13.6148C-0.110156 13.1742 -0.110156 12.4617 0.330469 12.0258L4.84922 7.50703L0.330469 2.98828C-0.110156 2.54766 -0.110156 1.83516 0.330469 1.39922L1.38516 0.330469C1.82578 -0.110156 2.53828 -0.110156 2.97422 0.330469L9.34922 6.70547C9.79453 7.14609 9.79453 7.85859 9.35391 8.29922Z"/></svg>',
			'double-chevron'         => '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.34237 13.3157C5.97377 12.9471 5.97377 12.3607 6.34237 11.992L11.3271 7.00727L6.34237 2.0225C5.97377 1.6539 5.97377 1.06746 6.34237 0.698816C6.71097 0.330212 7.29741 0.330212 7.66605 0.698816L13.3126 6.34541C13.6813 6.71401 13.6813 7.30045 13.3126 7.66909L7.66609 13.3157C7.29749 13.676 6.71105 13.676 6.34237 13.3157Z"/><path d="M0.687342 13.3158C0.318738 12.9471 0.318738 12.3607 0.687342 11.9921L5.67211 7.0073L0.687342 2.01421C0.318738 1.64561 0.318738 1.05917 0.687342 0.690529C1.05595 0.321888 1.64238 0.321925 2.01103 0.690529L7.65765 6.33708C8.02626 6.70569 8.02626 7.29213 7.65765 7.66077L2.01103 13.3074C1.65078 13.676 1.05598 13.676 0.687342 13.3158Z"/></svg>',
			'arrow-solid'            => '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M1.5387 9.5107H11.016L7.83315 12.9702C7.27005 13.5773 7.31411 14.5371 7.92618 15.1002C8.53337 15.6633 9.50048 15.6266 10.0562 15.0194L15.577 9.0212C15.8414 8.7323 15.9712 8.36993 15.9712 8.00024C15.9712 7.63055 15.839 7.26577 15.577 6.97928L10.0562 0.981084C9.49797 0.373899 8.53337 0.334726 7.92618 0.900287C7.31163 1.46339 7.2676 2.42313 7.83315 3.03032L11.016 6.48978H1.5387C0.706242 6.48978 0.0280762 7.16063 0.0280762 8.0004C0.0280762 8.84017 0.70384 9.51102 1.5387 9.51102V9.5107Z"/></svg>',
			'arrow-outline'          => '<svg width="18" height="16" viewBox="0 0 18 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.489 9.73014H2.05357C0.0195797 9.73014 0.0195797 6.28366 2.05357 6.28366H11.489L8.60752 3.40218C7.19503 1.98969 9.62451 -0.496291 11.037 0.972699L17.026 6.96166C17.6475 7.52665 17.6475 8.48715 17.026 9.10864C15.0485 11.0861 13.0145 13.0636 11.037 15.0976C9.62451 16.5101 7.13853 14.0806 8.60752 12.6116L11.489 9.73014ZM13.636 8.82614L9.22902 13.2896C8.60752 13.8546 9.79401 15.0411 10.4155 14.4196C12.393 12.4421 14.427 10.4646 16.4045 8.43065C16.6305 8.20465 16.6305 7.80915 16.4045 7.58315L10.4155 1.59419C9.85051 0.972699 8.66402 2.15919 9.22902 2.78069L13.636 7.18766H2.05357C1.20607 7.18766 1.20607 8.82614 2.05357 8.82614H13.636Z"/></svg>',
			'arrow-minimal'          => '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 21.4993C14.372 21.4993 14.244 21.4503 14.146 21.3533C13.951 21.1583 13.951 20.8412 14.146 20.6462L22.793 11.9992L14.147 3.35325C13.952 3.15825 13.952 2.84125 14.147 2.64625C14.342 2.45125 14.659 2.45125 14.854 2.64625L23.854 11.6462C24.049 11.8412 24.049 12.1582 23.854 12.3532L14.854 21.3533C14.756 21.4503 14.628 21.4993 14.5 21.4993Z"/><path d="M23.5 12.4993H0.5C0.224 12.4993 0 12.2753 0 11.9993C0 11.7233 0.224 11.4993 0.5 11.4993H23.5C23.776 11.4993 24 11.7233 24 11.9993C24 12.2753 23.776 12.4993 23.5 12.4993Z"/></svg>',
			'chevron-border-line'    => '<svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.10076 6.80249L3.29436 0.996084C2.63187 0.334234 1.56115 0.334718 0.899298 0.996084C0.238376 1.65701 0.236804 2.7293 0.899771 3.39114L5.5082 7.99998L0.899367 12.6088C0.238445 13.2688 0.236873 14.3425 0.89984 15.0034C1.55931 15.6639 2.6312 15.6669 3.29446 15.0034L9.10086 9.19703C9.42123 8.87775 9.59686 8.4528 9.59686 7.99994C9.59686 7.54756 9.42124 7.12212 9.10086 6.80241L9.10076 6.80249ZM8.41654 8.51336L2.61013 14.3198C2.32662 14.6033 1.86683 14.6033 1.58332 14.3198C1.29981 14.0372 1.29981 13.5769 1.58332 13.2934L6.87683 7.99994L1.58332 2.70684C1.29981 2.42379 1.29981 1.96354 1.58332 1.68051C1.86637 1.39652 2.32755 1.39747 2.61013 1.68004L8.41654 7.48644C8.69973 7.77012 8.69973 8.22975 8.41654 8.51325V8.51336Z"/></svg>',
			'double-chevron-outline' => '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4.68926 7.33426C4.95939 7.74031 4.95939 8.26528 4.68926 8.66963L0.897206 14.3696C0.747699 14.5939 0.734108 14.8793 0.861528 15.1171C0.98895 15.355 1.2353 15.5011 1.50373 15.5011L3.69877 15.5011C4.3002 15.5011 4.85745 15.2021 5.19044 14.7026L9.01647 8.95166C9.40043 8.37402 9.40043 7.62818 9.01647 7.05054L5.19045 1.2996C4.85745 0.800113 4.3002 0.501098 3.69877 0.501098L1.50373 0.501098C1.2353 0.501098 0.988951 0.648907 0.86153 0.88506C0.734109 1.12121 0.7477 1.40834 0.897208 1.6326L4.68926 7.33426ZM1.31175 1.12631C1.33044 1.09233 1.3865 1.01078 1.50543 1.01078L3.69877 1.01078C4.1286 1.01078 4.52786 1.22485 4.76571 1.58163L8.59174 7.33426C8.86187 7.74031 8.86187 8.26528 8.59174 8.66963L4.76571 14.4206C4.52785 14.779 4.1286 14.9914 3.69877 14.9914L1.50373 14.9914C1.3848 14.9914 1.32874 14.9099 1.31005 14.8759C1.29136 14.8419 1.25568 14.7502 1.32024 14.6516L5.11399 8.95166C5.49795 8.37402 5.49795 7.62818 5.11399 7.05054L1.32194 1.35057C1.25738 1.25203 1.29306 1.16199 1.31175 1.12631Z"/><path d="M10.6204 7.33426C10.8905 7.74031 10.8905 8.26528 10.6204 8.66963L6.82835 14.3696C6.67884 14.5939 6.66525 14.8793 6.79267 15.1171C6.92009 15.355 7.16644 15.5011 7.43487 15.5011L9.62991 15.5011C10.2313 15.5011 10.7886 15.2021 11.1216 14.7026L14.9459 8.95166C15.3299 8.37402 15.3299 7.62818 14.9459 7.05054L11.1199 1.2996C10.7869 0.800113 10.2296 0.501098 9.62821 0.501098L7.43317 0.501098C7.16474 0.501098 6.91839 0.648907 6.79097 0.88506C6.66355 1.12291 6.67714 1.40834 6.82665 1.6326L10.6204 7.33426ZM7.24289 1.12631C7.26158 1.09233 7.31765 1.01078 7.43657 1.01078L9.62991 1.01078C10.0597 1.01078 10.459 1.22485 10.6969 1.58163L14.5229 7.33426C14.793 7.74031 14.793 8.26528 14.5229 8.66963L10.6968 14.4206C10.459 14.779 10.0597 14.9914 9.62991 14.9914L7.43487 14.9914C7.31595 14.9914 7.25988 14.9099 7.24119 14.8759C7.2225 14.8419 7.18683 14.7502 7.25139 14.6516L11.0451 8.95166C11.4291 8.37402 11.4291 7.62818 11.0451 7.05054L7.25309 1.35057C7.18683 1.25203 7.2242 1.16199 7.24289 1.12631Z"/></svg>',
			'triangle-outline'       => '<svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.49388 5.55745L1.14605 0.340058C0.985044 0.239429 0.782513 0.233825 0.616667 0.326556C0.450567 0.418268 0.3479 0.592775 0.3479 0.782568V11.2174C0.3479 11.4071 0.450567 11.5817 0.616667 11.6739C0.695896 11.7172 0.782513 11.7391 0.86964 11.7391C0.965682 11.7391 1.06173 11.7126 1.14605 11.6599L9.49388 6.44247C9.64622 6.34694 9.73921 6.18007 9.73921 5.99996C9.73921 5.81985 9.64622 5.65298 9.49388 5.55745ZM1.39138 10.276V1.72389L8.23284 5.99996L1.39138 10.276Z"/></svg>',
			'arrow-line'             => '<svg width="11" height="9" viewBox="0 0 11 9" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10.2911 3.72177L6.79413 0.224809C6.49438 -0.0749362 5.99482 -0.0749362 5.69507 0.224809C5.39533 0.524553 5.39533 1.02412 5.69507 1.32386L7.89318 3.52197H0.799311C0.299745 3.52197 0 3.82172 0 4.22136C0 4.621 0.299745 5.02067 0.799311 5.02067H7.99308L5.69507 7.21878C5.39533 7.51853 5.39533 8.01809 5.69507 8.31784C5.79499 8.41776 5.99482 8.51766 6.19464 8.51766C6.39446 8.51766 6.59428 8.41773 6.6942 8.31784L10.1912 4.82085C10.5908 4.42118 10.5908 4.02151 10.2911 3.72177Z"/></svg>',
			'arrow-send'             => '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M15.7508 9.52841L4.89386 2.09998C4.67615 1.95084 4.3853 1.97026 4.18931 2.14683C3.99331 2.32283 3.94359 2.6114 4.06816 2.84282L7.92238 9.99983L4.06816 17.1574C4.02245 17.2426 4.00017 17.3357 4.00017 17.4283C4.00017 17.5865 4.06531 17.742 4.1893 17.8534C4.38587 18.03 4.67672 18.0488 4.89386 17.9003L15.7508 10.4718C16.0622 10.2581 16.0622 9.74155 15.7508 9.52841ZM9.07493 10.2707C9.12007 10.1861 9.14293 10.093 9.14293 9.99983C9.14293 9.90669 9.12007 9.81355 9.07493 9.72898L6.18927 4.37079L14.4165 9.99983L6.18927 15.6289L9.07493 10.2707Z"/></svg>',
		);

		$key = sanitize_key( (string) $arrow_style );
		if ( ! isset( $svgs[ $key ] ) ) {
			$key = 'chevron-outline';
		}

		return $svgs[ $key ];
	}

	/**
	 * Where the arrow row renders: 'top' (before the swiper), 'bottom' (after
	 * the pagination) or 'center' (floating over the swiper). Twin of
	 * navArrowSlot() in apps/blocks/carousel/edit.jsx.
	 *
	 * @param string $position navIconPosition value.
	 * @return string
	 */
	public static function nav_arrow_slot( $position ) {
		$slot = strtok( (string) $position, '_' );
		return ( 'top' === $slot || 'bottom' === $slot ) ? $slot : 'center';
	}

	/**
	 * Navigation-arrow row markup. A SIBLING of the swiper: its overflow:hidden
	 * would clip arrows that hang outside it, and initCarousel finds them in the
	 * swiper's parent subtree.
	 *
	 * @param array $attributes Block attributes.
	 * @return string
	 */
	public static function nav_arrows_html( $attributes ) {
		$nav_icon = self::nav_arrow_svg( Pro_Gate::nav_arrow_style( $attributes['navIconName'] ?? 'chevron-outline' ) );
		$position = $attributes['navIconPosition'] ?? 'vertical_center';
		return sprintf(
			'<div class="sp-smart-team-swiper-nav-arrows sp-smart-team-nav-pos-%1$s"><div class="sp-smart-team-swiper-navigation sp-smart-team-nav-prev">%2$s</div><div class="sp-smart-team-swiper-navigation sp-smart-team-nav-next">%2$s</div></div>',
			esc_attr( sanitize_html_class( $position ) ),
			$nav_icon
		);
	}

	/**
	 * Per-breakpoint slidesPerView / spaceBetween as CSS variables for the
	 * pre-init layout in carousel/style.scss. Swiper (footer script) sizes the
	 * slides only once it initializes; until then every `.swiper-slide` would
	 * stretch to 100% width, so on a slow connection the first card flashes
	 * full-width. Read from the same resolved breakpoints Swiper receives, so
	 * the pre-init row matches the initialized one.
	 *
	 * @param array $swiper_settings Resolved SwiperConfig::make() output.
	 * @return string Inline style declarations (unescaped).
	 */
	private static function preinit_style_vars( $swiper_settings ) {
		$devices = array(
			0    => 'm',
			768  => 't',
			1024 => 'd',
		);
		$vars    = array();
		foreach ( $devices as $breakpoint => $suffix ) {
			$bp     = $swiper_settings['breakpoints'][ $breakpoint ] ?? array();
			$spv    = (float) ( $bp['slidesPerView'] ?? 1 );
			$gap    = (int) ( $bp['spaceBetween'] ?? 0 );
			$vars[] = '--sptp-preinit-spv-' . $suffix . ':' . ( $spv > 0 ? $spv : 1 );
			$vars[] = '--sptp-preinit-gap-' . $suffix . ':' . max( 0, $gap ) . 'px';
		}

		return implode( ';', $vars );
	}

	/**
	 * Render the carousel on the frontend (markup twin of edit.jsx).
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Inner block content.
	 * @param mixed  $block      Block instance.
	 * @return string Rendered HTML output.
	 */
	public function render_block( $attributes, $content = '', $block = null ) {
		$unique_id   = isset( $attributes['uniqueId'] ) ? $attributes['uniqueId'] : '';
		$extra_class = isset( $attributes['additionalCssClass'] ) ? $attributes['additionalCssClass'] : '';
		$align       = isset( $attributes['align'] ) ? $attributes['align'] : '';

		// Normalize Pro-only carousel attributes to their free fallback before
		// anything below reads them — a Pro-authored value is left in the
		// database untouched (Pro_Gate is read-only) but never rendered here.
		$attributes['carouselStyle']        = Pro_Gate::carousel_style( $attributes['carouselStyle'] ?? 'default' );
		$attributes['carouselDisplayStyle'] = Pro_Gate::display_style( $attributes['carouselDisplayStyle'] ?? 'horizontal' );
		$attributes['slidingEffect']        = Pro_Gate::slide_effect( $attributes['slidingEffect'] ?? 'slide' );
		$attributes['partialSlideView']     = Pro_Gate::partial_view( $attributes['partialSlideView'] ?? false );

		$settings    = $this->prepare_render_settings( $attributes );
		$card_design = $settings['card_design'];

		// A carousel has no ajax addons, so nothing reads found_posts — skip the
		// COUNT query.
		$query = MemberQuery::query(
			array_merge(
				MemberQuery::build_args_from_attributes( $attributes ),
				array( 'count_total' => false )
			)
		);

		$carousel_style    = $attributes['carouselStyle'] ?? 'default';
		$display_style     = $attributes['carouselDisplayStyle'] ?? 'horizontal';
		$enable_navigation = ! empty( $attributes['enableNavigationArrow'] );
		$enable_pagination = ! empty( $attributes['enablePaginationDots'] );
		$pagination_style  = Pro_Gate::pagination_style( $attributes['paginationStyle'] ?? 'dots' );
		$nav_slot          = self::nav_arrow_slot( $attributes['navIconPosition'] ?? 'vertical_center' );
		$nav_html          = $enable_navigation ? self::nav_arrows_html( $attributes ) : '';

		// Ticker style — a CSS-only marquee (port of testimonial-pro's marquee):
		// no Swiper at all, the track animates with pure CSS.
		$is_ticker = ( 'ticker' === $carousel_style );

		// Conflict-resolved swiper settings (mirrors the editor hook).
		$swiper_settings = $is_ticker ? array() : SwiperConfig::make( $attributes );

		if ( ! $is_ticker ) {
			// The vendored Swiper + the frontend runtime (initCarousel) load
			// only when a swiper-driven carousel is actually on the page.
			wp_enqueue_style( 'sptp-swiper' );
			wp_enqueue_script( 'sptp-swiper' );
			wp_enqueue_script( 'sptp-blocks-frontend' );
		} else {
			// Marquee cells replace the swiper-slide cells.
			$this->card_cell_class = 'sp-smart-team-carousel__slide sp-smart-team-marquee-item';
		}

		$classes = array_filter(
			array(
				'sp-smart-team-carousel',
				'sp-smart-team-carousel--' . $card_design,
				'card-2' === $card_design && 'left' === ( $attributes['imagePosition'] ?? 'left' ) ? 'sp-smart-team-carousel--image-left' : '',
				'card-5' === $card_design && 'right' === ( $attributes['imagePosition'] ?? 'left' ) ? 'sp-smart-team-carousel--image-right' : '',
				'card-9' === $card_design && 'right' === ( $attributes['imageAreaPosition'] ?? 'left' ) ? 'sp-smart-team-carousel--image-right' : '',
				'' !== $align ? 'align' . $align : '',
				$extra_class,
			)
		);

		$swiper_classes = array_filter(
			array(
				'sp-smart-team-swiper',
				'swiper',
				'sp-smart-team-carousel-style-' . sanitize_html_class( $carousel_style ),
				'creative' === ( $swiper_settings['effect'] ?? '' ) ? 'sp-smart-team-carousel-spring' : '',
				// Multi-row grid is horizontal only — never vertical.
				'vertical' === $display_style && 'multi-row' !== $carousel_style ? 'swiper-vertical' : '',
			)
		);

		// Always the uniqueId — dynamic CSS anchors to it; the Advanced Custom
		// CSS ID is added as an outer wrapper by render_block_callback().
		$html_id = $unique_id;

		ob_start();
		?>
		<div
			<?php
			if ( $html_id ) :
				?>
				id="<?php echo esc_attr( $html_id ); ?>"<?php endif; ?>
			class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
			<?php echo $this->details_root_attrs( $settings ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in details_root_attrs(). ?>
		>
			<?php if ( ! $query->have_posts() ) : ?>
				<p class="sp-smart-team-carousel__empty"><?php echo esc_html__( 'No team members found.', 'team-free' ); ?></p>
			<?php elseif ( $is_ticker ) : ?>
				<?php
				// Ticker (marquee): viewport › track › the SAME group twice (the
				// duplicate is aria-hidden) — the track animates -50% for a
				// seamless loop. Twin of the ticker branch in edit.jsx.
				$cards_html       = $this->render_cards_html( $settings, $query );
				$is_vertical      = 'vertical' === $display_style;
				$viewport_classes = implode(
					' ',
					array_filter(
						array(
							'sp-smart-team-marquee-viewport',
							! empty( $attributes['pauseOnHover'] ) ? 'sp-smart-team-marquee--pause-hover' : '',
							$is_vertical ? 'sp-smart-team-marquee--vertical' : 'sp-smart-team-marquee--horizontal',
						)
					)
				);
				?>
				<div class="<?php echo esc_attr( $viewport_classes ); ?>">
					<div class="sp-smart-team-marquee-track">
						<div class="sp-smart-team-marquee-group sp-smart-team-carousel__items">
							<?php echo $cards_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in render_card(). ?>
						</div>
						<div class="sp-smart-team-marquee-group sp-smart-team-carousel__items" aria-hidden="true">
							<?php echo $cards_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in render_card(). ?>
						</div>
					</div>
				</div>
			<?php else : ?>
				<?php if ( 'top' === $nav_slot ) : ?>
					<?php echo $nav_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in nav_arrows_html(). ?>
				<?php endif; ?>
				<div
					class="<?php echo esc_attr( implode( ' ', $swiper_classes ) ); ?>"
					data-swiper-settings="<?php echo esc_attr( $this->json_attr( $swiper_settings ) ); ?>"
					style="<?php echo esc_attr( self::preinit_style_vars( $swiper_settings ) ); ?>"
					dir="<?php echo esc_attr( $swiper_settings['swiperDir'] ?? 'ltr' ); ?>"
				>
					<div class="sp-smart-team-swiper-wrapper swiper-wrapper sp-smart-team-carousel__items">
						<?php echo $this->render_cards_html( $settings, $query ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in render_card(). ?>
					</div>
				</div>
				<?php if ( 'center' === $nav_slot ) : ?>
					<?php echo $nav_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in nav_arrows_html(). ?>
				<?php endif; ?>
				<?php if ( $enable_pagination && ! $is_ticker ) : ?>
					<div class="sp-smart-team-swiper-pagination swiper-pagination <?php echo esc_attr( sanitize_html_class( $pagination_style ) ); ?>"></div>
				<?php endif; ?>
				<?php if ( 'bottom' === $nav_slot ) : ?>
					<?php echo $nav_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in nav_arrows_html(). ?>
				<?php endif; ?>
			<?php endif; ?>
		</div>
		<?php
		return ob_get_clean();
	}
}
