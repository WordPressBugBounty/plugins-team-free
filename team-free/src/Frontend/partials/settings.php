<?php
/**
 * All settings of WP_Team.
 *
 * @package WP_Team
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Main settings.
$sptp_settings            = get_option( '_sptp_settings' );
$sptp_google_fonts        = isset( $sptp_settings['enqueue_google_font'] ) ? $sptp_settings['enqueue_google_font'] : true;
$sptp_swiper_js           = isset( $sptp_settings['enqueue_swiper_js'] ) ? $sptp_settings['enqueue_swiper_js'] : true;
$sptp_fontawesome         = isset( $sptp_settings['enqueue_fontawesome'] ) ? $sptp_settings['enqueue_fontawesome'] : true;
$sptp_swiper_css          = isset( $sptp_settings['enqueue_swiper'] ) ? $sptp_settings['enqueue_swiper'] : true;
$sptp_custom_css          = isset( $sptp_settings['custom_css'] ) ? $sptp_settings['custom_css'] : '';
$sptp_custom_js           = isset( $sptp_settings['custom_js'] ) ? $sptp_settings['custom_js'] : '';
$sptp_link_mailto         = isset( $sptp_settings['link_mailto'] ) ? $sptp_settings['link_mailto'] : true;
$sptp_no_follow           = isset( $sptp_settings['no_follow'] ) ? $sptp_settings['no_follow'] : '';
$sptp_link_telephone      = isset( $sptp_settings['link_telephone'] ) ? $sptp_settings['link_telephone'] : true;
$sptp_link_css            = isset( $sptp_settings['link_css'] ) ? $sptp_settings['link_css'] : '';
$sptp_link_rel_attributes = isset( $sptp_settings['link_rel_attributes'] ) ? $sptp_settings['link_rel_attributes'] : '';

$css_load_in_head = apply_filters( 'spteam_free_style_load_in_header', true );
// layout settings.
$group_relation = isset( $layout['group_relation'] ) ? $layout['group_relation'] : '';
$layout_preset  = isset( $layout['layout_preset'] ) ? $layout['layout_preset'] : 'grid';

// General settings.
if ( 'list' === $layout_preset ) {
	$desktop = isset( $settings['responsive_columns_list']['desktop'] ) ? $settings['responsive_columns_list']['desktop'] : '';
	$laptop  = isset( $settings['responsive_columns_list']['laptop'] ) ? $settings['responsive_columns_list']['laptop'] : '';
	$tablet  = isset( $settings['responsive_columns_list']['tablet'] ) ? $settings['responsive_columns_list']['tablet'] : '';
	$mobile  = isset( $settings['responsive_columns_list']['mobile'] ) ? $settings['responsive_columns_list']['mobile'] : '';
} else {
	$desktop = ( isset( $settings['responsive_columns']['desktop'] ) && $settings['responsive_columns']['desktop'] ) ? $settings['responsive_columns']['desktop'] : 4;
	$laptop  = ( isset( $settings['responsive_columns']['laptop'] ) && $settings['responsive_columns']['laptop'] ) ? $settings['responsive_columns']['laptop'] : 3;
	$tablet  = ( isset( $settings['responsive_columns']['tablet'] ) && $settings['responsive_columns']['tablet'] ) ? $settings['responsive_columns']['tablet'] : 2;
	$mobile  = ( isset( $settings['responsive_columns']['mobile'] ) && $settings['responsive_columns']['mobile'] ) ? $settings['responsive_columns']['mobile'] : 1;
}
$responsive_classes = "sptp-col-lg-{$desktop} sptp-col-md-{$laptop} sptp-col-sm-{$tablet} sptp-col-xs-{$mobile}";

$filter_member_number     = isset( $settings['total_member_display'] ) ? $settings['total_member_display'] : -1;
$pagination_show_per_page = isset( $settings['pagination_fields']['pagination_show_per_page'] ) ? $settings['pagination_fields']['pagination_show_per_page'] : 10;
$pagination_alignment     = isset( $settings['pagination_fields']['pagination_alignment'] ) ? $settings['pagination_fields']['pagination_alignment'] : 'center';
// Shortcodes saved before pagination existed have no value and must keep showing every member.
$pagination_universal     = isset( $settings['pagination_fields']['pagination_universal'] )
	? (bool) intval( $settings['pagination_fields']['pagination_universal'] )
	: false;
$max_group_member_display = isset( $settings['max_group_member_display'] ) ? $settings['max_group_member_display'] : -1;
$order_by                 = isset( $settings['order_by'] ) ? $settings['order_by'] : 'date';
$sptp_order               = isset( $settings['order'] ) ? $settings['order'] : 'DESC';
$preloader                = isset( $settings['preloader_switch'] ) ? $settings['preloader_switch'] : true;

// get members of this layout.
$filter_members = isset( $layout['filter_members'] ) ? $layout['filter_members'] : 'newest';

/**
 * Filter members query args.
 */
if ( ! empty( $filter_members ) ) {

	// Get member ids.
	$latest_posts = get_posts(
		array(
			'post_type'      => 'sptp_member',
			'posts_per_page' => ( '' === $filter_member_number ) ? 10000 : $filter_member_number,
			'order'          => $sptp_order,
			'orderby'        => $order_by,
			'fields'         => 'ids',
		)
	);

	if ( 'exclude' === $filter_members && ! empty( $layout['filter_exclude'] ) ) {
		// Remove the excluded members before the query.
		$latest_posts = array_values( array_diff( $latest_posts, array_map( 'absint', (array) $layout['filter_exclude'] ) ) );
	}

	// An empty post__in is ignored by WP_Query and would return every member.
	if ( empty( $latest_posts ) ) {
		$latest_posts = array( 0 );
	}

	// Get the current page number.
	$sptp_paged = isset( $_GET[ 'generator_id_' . $generator_id ] ) ? absint( sanitize_text_field( wp_unslash( $_GET[ 'generator_id_' . $generator_id ] ) ) ) : 1;

	// Define allowed operators.
	$valid_tax_operators = array( 'in', 'not_in', 'exists', 'not_exists' );
	$valid_tax_relations = array( 'AND', 'OR' );

	// Get and sanitize department filter.
	$filter_group_ids_raw   = $layout['sptp_accordion_department_fields']['filter_group'] ?? array();
	$filter_group_ids       = array_filter( array_map( 'absint', (array) $filter_group_ids_raw ) );
	$filter_group_operators = strtolower( $layout['sptp_accordion_department_fields']['group_relation'] ?? 'in' );
	$filter_group_operators = in_array( $filter_group_operators, $valid_tax_operators, true ) ? $filter_group_operators : 'in';

	// Get and sanitize designation filter.
	$filter_designation_ids_raw   = $layout['sptp_accordion_designation_fields']['filter_designation'] ?? array();
	$filter_designation_ids       = array_filter( array_map( 'absint', (array) $filter_designation_ids_raw ) );
	$filter_designation_operators = strtolower( $layout['sptp_accordion_designation_fields']['designation_operators'] ?? 'in' );
	$filter_designation_operators = in_array( $filter_designation_operators, $valid_tax_operators, true ) ? $filter_designation_operators : 'in';

	// Sanitize term relation.
	$term_relation = strtoupper( $layout['sptp_term_relation'] ?? 'AND' );
	$term_relation = in_array( $term_relation, $valid_tax_relations, true ) ? $term_relation : 'AND';

	// Build tax_query dynamically.
	$tax_query_args = array();
	if ( $filter_group_ids ) {
		$tax_query_args[] = array(
			'taxonomy' => 'sptp_group',
			'field'    => 'term_id',
			'terms'    => $filter_group_ids,
			'operator' => $filter_group_operators,
		);
	}

	if ( $filter_designation_ids ) {
		$tax_query_args[] = array(
			'taxonomy' => 'sptp_designation',
			'field'    => 'term_id',
			'terms'    => $filter_designation_ids,
			'operator' => $filter_designation_operators,
		);
	}

	// If any filters added, add relation.
	if ( count( $tax_query_args ) > 1 ) {
		$tax_query_args = array_merge( array( 'relation' => $term_relation ), $tax_query_args );
	}

	// Only the paged layouts split the members into pages; the others show all of them.
	$sptp_paginate = $pagination_universal && in_array( $layout_preset, array( 'grid', 'list', 'filter' ), true );

	// Main query args.
	$sptp_newest_arg = array(
		'post_type'      => 'sptp_member',
		'posts_per_page' => $sptp_paginate && absint( $pagination_show_per_page ) > 0 ? absint( $pagination_show_per_page ) : -1,
		'paged'          => $sptp_paged,
		'post__in'       => $latest_posts,
		'orderby'        => 'post__in',
	);

	// Conditionally merge tax_query.
	if ( ! empty( $tax_query_args ) && 'organization-chart' !== $layout_preset && 'newest' !== $filter_members ) {
		$sptp_newest_arg['tax_query'] = $tax_query_args;
	}

	$filter_members_query = new WP_Query( $sptp_newest_arg );
	$filter_members       = $filter_members_query->posts;
}

$carousel_speed    = isset( $settings['carousel_speed'] ) ? $settings['carousel_speed'] : 300;
$carousel_autoplay = ( isset( $settings['carousel_autoplay'] ) && $settings['carousel_autoplay'] ) ? 'true' : 'false';
$autoplay_speed    = ( isset( $settings['carousel_autoplay_speed'] ) && $settings['carousel_autoplay_speed'] && ( 'true' === $carousel_autoplay ) ) ? $settings['carousel_autoplay_speed'] : 5000;
// Member per slide.
$member_per_slide = isset( $settings['member_per_slide'] ) ? $settings['member_per_slide'] : array(
	'desktop' => '1',
	'laptop'  => '1',
	'tablet'  => '1',
	'mobile'  => '1',
);

$navigation_position = isset( $settings['carousel_navigation_position'] ) ? $settings['carousel_navigation_position'] : 'top-right';

$loop                     = ( isset( $settings['carousel_loop'] ) && $settings['carousel_loop'] ) ? 'true' : 'false';
$auto_height              = ( isset( $settings['carousel_auto_height'] ) && $settings['carousel_auto_height'] ) ? 'true' : 'false';
$lazy_load                = ( isset( $settings['carousel_lazy_load'] ) && $settings['carousel_lazy_load'] ) ? 'true' : 'false';
$stop_onhover             = ( isset( $settings['carousel_onhover'] ) && $settings['carousel_onhover'] ) ? 'true' : 'false';
$carousel_pagination_type = isset( $settings['carousel_pagination_type'] ) ? $settings['carousel_pagination_type'] : 'bullets';

// Miscellaneous.
$touch_swipe        = isset( $settings['touch_swipe'] ) && $settings['touch_swipe'] ? 'true' : 'false';
$slider_draggable   = isset( $settings['slider_draggable'] ) && $settings['slider_draggable'] ? 'true' : 'false';
$free_mode          = isset( $settings['free_mode'] ) && $settings['free_mode'] ? 'true' : 'false';
$slider_mouse_wheel = isset( $settings['slider_mouse_wheel'] ) && $settings['slider_mouse_wheel'] ? 'true' : 'false';


// Display settings.
$section_title               = isset( $settings['style_title'] ) ? $settings['style_title'] : true;
$section_title_margin_bottom = isset( $settings['typo_team_title']['margin-bottom'] ) && ! empty( $settings['typo_team_title']['margin-bottom'] ) ? $settings['typo_team_title']['margin-bottom'] . 'px' : '25px';
$margin_between_member       = isset( $settings['style_margin_between_member']['top-bottom'] ) ? intval( $settings['style_margin_between_member']['top-bottom'] ) : 24;
$margin_between_member_left  = isset( $settings['style_margin_between_member']['left-right'] ) ? intval( $settings['style_margin_between_member']['left-right'] ) : 24;

if ( 'list' === $layout_preset ) {
	$position = 'left_img_right_content';
} else {
	$position = isset( $settings['style_member_content_position'] ) ? $settings['style_member_content_position'] : 'top_img_bottom_content';
}

switch ( $position ) {
	case 'top_img_bottom_content':
		$position_class = '';
		break;
	case 'top_content_bottom_img':
		$position_class = ' sptp-top-content';
		break;
	case 'left_img_right_content':
		$position_class = ' sptp-list-item';
		break;
	case 'left_content_right_img':
		$position_class = ' sptp-list-item sptp-left-content';
		break;
	default:
		$position_class = '';
}
$border_bg_around_member       = isset( $settings['border_bg_around_member'] ) ? intval( $settings['border_bg_around_member'] ) : '';
$border_bg_around_member_class = ( $border_bg_around_member ) ? 'border-bg-around-member' : '';

$image_animation = ( 'content_over_image' === $position ) && isset( $settings['image_animation'] ) ? $settings['image_animation'] : '';

$sptp_order_array     = array();
$sptp_order           = 1;
$default_style_arr    = array(
	'image_switch'        => true,
	'name_switch'         => true,
	'job_position_switch' => true,
	'social_switch'       => true,
);
$style_members        = isset( $settings['style_members'] ) ? $settings['style_members'] : $default_style_arr;
$show_member_name     = isset( $style_members['name_switch'] ) ? $style_members['name_switch'] : true;
$show_member_position = isset( $style_members['job_position_switch'] ) ? $style_members['job_position_switch'] : true;

$show_member_bio = isset( $style_members['bio_switch'] ) ? $style_members['bio_switch'] : true;
$biography_type  = isset( $settings['biography_type'] ) ? $settings['biography_type'] : 'short-bio';

$show_member_social = isset( $style_members['social_switch'] ) ? $style_members['social_switch'] : false;
$show_member_skill  = isset( $style_members['skill_switch'] ) ? $style_members['skill_switch'] : false;

// The org chart node shows only Photo, Name and Position; its generator hides the other rows.
if ( 'organization-chart' === $layout_preset ) {
	$show_member_bio    = false;
	$show_member_social = false;
	$show_member_skill  = false;
}

$small_icon      = isset( $settings['icon_switch'] ) ? $settings['icon_switch'] : '';
$social_settings = isset( $settings['social_settings'] ) ? $settings['social_settings'] : '';
$social_position = isset( $social_settings['social_position'] ) ? $social_settings['social_position'] : 'center';

$social_icon_shape = isset( $social_settings['social_icon_shape'] ) ? $social_settings['social_icon_shape'] : '';

$social_icon_bg_color       = ! empty( $social_icon_custom_color ) && isset( $social_settings['icon_bg_color_group'] ) ? $social_settings['icon_bg_color_group'] : '';
$social_icon_bg_main_color  = isset( $social_icon_bg_color['icon_bg'] ) ? $social_icon_bg_color['icon_bg'] : '';
$social_icon_bg_hover_color = isset( $social_icon_bg_color['icon_bg_hover'] ) ? $social_icon_bg_color['icon_bg_hover'] : '';

$social_icon_border = ! empty( $social_icon_custom_color ) && isset( $social_settings['icon_border'] ) ? $social_settings['icon_border'] : '';

// Image settings.
$image_on_off = isset( $settings['image_on_off'] ) ? $settings['image_on_off'] : true;
$image_shape  = isset( $settings['image_shape'] ) ? $settings['image_shape'] : '';
$image_size   = isset( $settings['image_size'] ) ? $settings['image_size'] : '';

$image_zoom = isset( $settings['image_zoom'] ) ? $settings['image_zoom'] : '';

$link_detail    = isset( $settings['link_detail'] ) ? $settings['link_detail'] : true;
$page_link_type = ( isset( $settings['link_detail_fields']['page_link_type'] ) && $link_detail ) ? $settings['link_detail_fields']['page_link_type'] : '';

$new_page_target    = isset( $settings['link_detail_fields']['page_link_open'] ) ? $settings['link_detail_fields']['page_link_open'] : '';
$link_detail_fields = ! empty( $settings['link_detail_fields'] ) ? $settings['link_detail_fields'] : '';
$detail_page_fields = ! empty( $link_detail_fields['detail_page_fields'] ) ? $link_detail_fields['detail_page_fields'] : '';
$nofollow_link      = isset( $settings['link_detail_fields']['nofollow_link'] ) ? $settings['link_detail_fields']['nofollow_link'] : false;
$nofollow_link_text = $nofollow_link ? 'rel=nofollow' : '';
