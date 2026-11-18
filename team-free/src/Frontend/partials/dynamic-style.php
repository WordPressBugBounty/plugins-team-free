<?php
/**
 * Dynamic styles.
 *
 * @package WP_Team
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Dynamic css.
require 'dynamic-css-settings.php';
$css_list          = array();
$css_grid          = array();
$css_carousel      = array();
$css_avatar        = array();
$css_section_title = array();
$css_name          = array();
$css_profession    = array();
$css_bio           = array();
$css_social        = array();
$css_skill         = array();

// $skill_css_single = array();

$layout_preset = isset( $layout['layout_preset'] ) ? $layout['layout_preset'] : 'carousel';

$css_right_content = array();

if ( 'carousel' === $layout_preset ) {
	$css_carousel = array(
		'#sptp-' . $generator_id . ' .sptp-main-carousel .swiper-button-next' => array(
			'color'            => $navigation_color['color'],
			'background-color' => $navigation_color['bg_color'],
			'border'           => $navigation_border_css,
		),
		'#sptp-' . $generator_id . ' .sptp-main-carousel .swiper-button-prev' => array(
			'color'            => $navigation_color['color'],
			'background-color' => $navigation_color['bg_color'],
			'border'           => $navigation_border_css,
		),
		'#sptp-' . $generator_id . ' .sptp-main-carousel .swiper-button-prev:hover' => array(
			'color'            => $navigation_color['hover_color'],
			'background-color' => $navigation_color['bg_hover_color'],
			'border-color'     => $navigation_border_hover_color,
		),
		'#sptp-' . $generator_id . ' .sptp-main-carousel .swiper-button-next:hover' => array(
			'color'            => $navigation_color['hover_color'],
			'background-color' => $navigation_color['bg_hover_color'],
			'border-color'     => $navigation_border_hover_color,
		),
		'#sptp-' . $generator_id . ' .swiper-pagination-bullet' => array(
			'background-color' => $pagination_color['color'],
		),
		'#sptp-' . $generator_id . ' .swiper-pagination-bullet-active' => array(
			'background-color' => $pagination_color['active_color'],
		),
		'#sptp-' . $generator_id . ' .sptp-main-carousel .sptp-member' => array(
			'margin' => 0,
		),
	);
}

if ( 'grid' === $layout_preset ) {
	$css_grid = array(
		'#sptp-' . $generator_id . ' .sptp-grid .sptp-row' => array(
			'margin-right' => '-' . ( (int) $margin_between_member_left / 2 ) . 'px',
			'margin-left'  => '-' . ( (int) $margin_between_member_left / 2 ) . 'px',
		),
	);
}

if ( 'list' === $layout_preset ) {
	$css_list = array(
		'#sptp-' . $generator_id . ' .sptp-member.sptp-list-item' => array(
			'border'           => $border_around_member_border,
			'border-radius'    => $border_radius_around_member,
			'background-color' => $background_around_member,
			'margin-left'      => 0,
			'margin-right'     => $margin_between_member_left . 'px',
			'margin-bottom'    => $margin_between_member_left . 'px',
			'padding'          => $member_padding,
		),
		'#sptp-' . $generator_id . ' .sptp-member.sptp-list-item:hover' => array(
			'border-color' => $border_around_member_hover_color,
		),
		'#sptp-' . $generator_id . ' .sptp-member.sptp-list-item .image' => array(
			'width'     => $list_layout_image_max_width . '%',
			'max-width' => '100%',
		),
	);
}

if ( 'list' === $layout_preset && 'left_img_right_content' === $position ) {
	$css_right_content = array(
		'#sptp-' . $generator_id . ' .swiper-wrapper.left_img_right_content' => array(
			'margin-left' => $margin_between_member_left . 'px',
		),
	);
}

if ( is_array( $style_members ) && $style_members['image_switch'] ) {
	$css_avatar = array(
		'#sptp-' . $generator_id . ' .sptp-member-avatar-img'  => array(
			'border'           => $border,
			'background-color' => $image_bg,
		),
		'#sptp-' . $generator_id . ' .sptp-member-avatar-img:hover'  => array(
			'border-color' => $border_hover,
		),
	);
}

if ( $section_title ) {
	$css_section_title = array(
		'#sptp-' . $generator_id . ' .sptp-section-title' => array(
			'margin-bottom' => $section_title_margin_bottom,
		),
		'#sptp-' . $generator_id . ' .sptp-section-title span' => array(
			'color' => $team_title_color,
		),
	);
}

if ( $show_member_name ) {
	$css_name = array(
		'#sptp-' . $generator_id . ' .sptp-member-name .sptp-member-name-title' => array(
			'color' => $member_name_color,
		),
	);
}

if ( $show_member_position ) {
	$css_profession = array(
		'#sptp-' . $generator_id . ' .sptp-member-profession .sptp-jop-title' => array(
			'color' => $member_position_color,
		),
	);
}

if ( $show_member_bio ) {
	$css_bio = array(
		'#sptp-' . $generator_id . ' .sptp-member-desc' => array(
			'color' => $member_description_color,
		),
	);
}

if ( $show_member_social ) {
	$css_social = array(
		'#sptp-' . $generator_id . ' .sptp-member-social li' => array(
			'margin' => $social_margin_css,
		),
	);
}

/**
 * Member skill style.
 */
$show_member_skill   = isset( $style_members['skill_switch'] ) ? $style_members['skill_switch'] : false;
$skill_border_radius = isset( $settings['skill_settings']['skill_bar_radius']['border_radius'] ) ? $settings['skill_settings']['skill_bar_radius']['border_radius'] : 0;
$skill_bar_height    = isset( $settings['skill_settings']['skill_bar_height']['all'] ) ? $settings['skill_settings']['skill_bar_height']['all'] : 4;

$progress_bg_color = isset( $settings['skill_settings']['progressbar_color_group']['progress_bg_color'] ) ? $settings['skill_settings']['progressbar_color_group']['progress_bg_color'] : '#c9dfd1';
$progress_color    = isset( $settings['skill_settings']['progressbar_color_group']['progress_color'] ) ? $settings['skill_settings']['progressbar_color_group']['progress_color'] : '#559173';

$skill_percentage_text_color = isset( $settings['skill_settings']['skill_percentage_text_color'] ) ? $settings['skill_settings']['skill_percentage_text_color'] : '#ffffff';
$tooltip_bg_color            = isset( $settings['skill_settings']['tooltip_bg_color'] ) ? $settings['skill_settings']['tooltip_bg_color'] : '#559173';

$skill_percentage_text_visibility = isset( $settings['skill_settings']['skill_percentage_text_visibility'] ) ? $settings['skill_settings']['skill_percentage_text_visibility'] : 'visible';

// Define selectors to avoid duplication.
$tooltip_selector = sprintf(
	'#sptp-%1$s .sptp-info .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar.sptp-tooltip .sptp-top, 
	#sptp-%1$s .sptp-member .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar.sptp-tooltip .sptp-top',
	$generator_id
);

$tooltip_hover_selector = sprintf(
	'#sptp-%1$s .sptp-info .sptp-member-skill-progress .sptp-progress-container:hover .sptp-progress-bar.sptp-tooltip .sptp-top, 
	#sptp-%1$s .sptp-member .sptp-member-skill-progress .sptp-progress-container:hover .sptp-progress-bar.sptp-tooltip .sptp-top',
	$generator_id
);

// Base styles.
if ( $show_member_skill ) {
	$css_skill = array(
		sprintf(
			'#sptp-%1$s .sptp-info .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar,
			 #sptp-%1$s .sptp-member .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar,
			 #sptp-%1$s .sptp-info .sptp-member-skill-progress .sptp-progress-container,
			 #sptp-%1$s .sptp-member .sptp-member-skill-progress .sptp-progress-container',
			$generator_id
		)                 => array(
			'height'           => (int) $skill_bar_height . 'px',
			'border-radius'    => (int) $skill_border_radius . 'px',
			'background-color' => $progress_bg_color,
		),
		sprintf(
			'#sptp-%1$s .sptp-info .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar,
			 #sptp-%1$s .sptp-member .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar',
			$generator_id
		)                 => array(
			'background-color' => $progress_color,
		),
		$tooltip_selector => array(
			'color'            => $skill_percentage_text_color,
			'background-color' => $tooltip_bg_color,
			// visibility styles will be merged below.
		),
	);
}

// Set visibility behavior.
switch ( $skill_percentage_text_visibility ) {
	case 'on_hover':
		$css_skill[ $tooltip_hover_selector ] = array(
			'display' => 'inline-block',
			'opacity' => 1,
		);
		break;

	case 'hide':
		$css_skill[ $tooltip_selector ]['display'] = 'none';
		$css_skill[ $tooltip_selector ]['opacity'] = 1;
		break;

	default:
		$css_skill[ $tooltip_selector ]['display'] = 'inline-block';
		$css_skill[ $tooltip_selector ]['opacity'] = 1;
		break;
}

$css = array(
	'#sptp-' . $generator_id . ' .border-bg-around-member:not(.sptp-content-on-image)' => array(
		'border'           => $border_around_member_border,
		'border-radius'    => $border_radius_around_member,
		'background-color' => $background_around_member,
	),
	'#sptp-' . $generator_id . ' .border-bg-around-member:not(.sptp-content-on-image):hover' => array(
		'border-color' => $border_around_member_hover_color,
	),
	'#sptp-' . $generator_id . ' .sp-team-item .sptp-member' => array(
		'margin'  => (int) $margin_between_member / 2 . 'px ' . (int) $margin_between_member_left / 2 . 'px',
		'padding' => $member_padding,
	),
	'#sptp-' . $generator_id . ' .swiper-slide .sptp-member' => array(
		'padding' => $member_padding,
	),
	// Member Box-Shadow.
	'#sptp-' . $generator_id . ' .sptp-list-item.sptp-member,#sptp-' . $generator_id . '.sptp-section .sptp-member' => array(
		'box-shadow' => $box_shadow_css,
	),
	'#sptp-' . $generator_id . ' .sptp-list-item.sptp-member,#sptp-' . $generator_id . '.sptp-carousel .sptp-member' => array(
		'margin-left' => $member_box_shadow['blur'] / 2 . 'px ',
	),
	'#sptp-' . $generator_id . ' .sptp-list-item.sptp-member:hover,#sptp-' . $generator_id . '.sptp-section .sptp-member:hover' => array(
		'box-shadow' => $box_shadow_css_hover,
	),
);

$css = array_merge( $css_carousel, $css_grid, $css_list, $css_avatar, $css_section_title, $css_name, $css_profession, $css_bio, $css_social, $css_skill, $css_right_content, $css );
foreach ( $css as $style => $style_array ) {
	$final_css .= $style . '{';
	foreach ( $style_array as $property => $value ) {
		if ( isset( $value ) && '' !== $value ) {
			$final_css .= $property . ':' . $value . ';';
		}
	}
	$final_css .= '}';
}
if ( 'carousel' === $layout_preset ) {
	$final_css .= "@media screen and (max-width: 480px) {
		'#sptp-' . $generator_id . ' .sptp_nav_hide_on_mobile,
		'#sptp-' . $generator_id . ' .sptp-pagination.sptp_pagination_hide_on_mobile {
			display: none;
		}
	}";
}
