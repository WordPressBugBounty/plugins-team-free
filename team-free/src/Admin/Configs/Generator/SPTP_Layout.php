<?php
/**
 * Layout section in team page.
 *
 * @since      2.0.0
 * @version    2.0.0
 *
 * @package    WP_Team
 * @subpackage WP_Team/admin
 * @author     ShapedPlugin<support@shapedplugin.com>
 */

namespace ShapedPlugin\WPTeam\Admin\Configs\Generator;

use ShapedPlugin\WPTeam\Admin\Framework\Classes\SPF_TEAM;

// Cannot access directly.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * This class is responsible for layout section in Team page.
 *
 * @since      2.0.0
 */
class SPTP_Layout {

	/**
	 * Team layout settings.
	 *
	 * @since 2.0.0
	 * @param string $prefix _sptp_generator_layout.
	 */
	public static function section( $prefix ) {
		SPF_TEAM::createSection(
			$prefix,
			array(
				'fields' => array(
					array(
						'type'  => 'subheading',
						'image' => SPT_PLUGIN_ROOT . 'src/Admin/img/logo-white.svg',
						'after' => '<i class="fa fa-life-ring"></i> Support',
						'link'  => 'https://shapedplugin.com/support/?user=lite',
						'class' => 'sptp-admin-bg',
					),
					array(
						'id'      => 'layout_preset',
						'type'    => 'image_select',
						'class'   => 'sptp-layout-preset layout_preset',
						'title'   => __( 'Layout Preset', 'team-free' ),
						'options' => array(
							'carousel'           => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/carousel.svg',
								'option_name'     => __( 'Carousel', 'team-free' ),
								'option_demo_url' => 'https://getwpteam.com/carousel/',
							),
							'grid'               => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/grid.svg',
								'option_name'     => __( 'Grid', 'team-free' ),
								'option_demo_url' => 'https://getwpteam.com/grid/',
							),
							'list'               => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/list.svg',
								'option_name'     => __( 'List', 'team-free' ),
								'option_demo_url' => 'https://getwpteam.com/list/',
							),
							'filter'             => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/isotope.svg',
								'option_name'     => __( 'Isotope', 'team-free' ),
								'option_demo_url' => 'https://getwpteam.com/isotope/',
							),
							'organization-chart' => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/org_chart.svg',
								'option_name'     => __( 'Org Chart', 'team-free' ),
								'option_demo_url' => 'https://getwpteam.com/organization-chart/',
							),
							'mosaic'             => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/mosaic.svg',
								'option_name'     => __( 'Mosaic', 'team-free' ),
								'pro_only'        => true,
								'option_demo_url' => 'https://getwpteam.com/mosaic/',
							),
							'inline'             => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/inline.svg',
								'option_name'     => __( 'Inline', 'team-free' ),
								'pro_only'        => true,
								'option_demo_url' => 'https://getwpteam.com/inline/',
							),
							'table'              => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/table.svg',
								'option_name'     => __( 'Table', 'team-free' ),
								'pro_only'        => true,
								'option_demo_url' => 'https://getwpteam.com/table/',
							),
							'accordion'          => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/accordion.svg',
								'option_name'     => __( 'Accordion', 'team-free' ),
								'pro_only'        => true,
								'option_demo_url' => 'https://getwpteam.com/accordion/',
							),
							'thumbnail-pager'    => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/thumbnail_pager.svg',
								'option_name'     => __( 'Thumbs Pager', 'team-free' ),
								'pro_only'        => true,
								'option_demo_url' => 'https://getwpteam.com/thumbnails-pager/',
							),
						),
						'default' => 'carousel',
					),
					array(
						'id'         => 'sptp_chart',
						'class'      => 'sptp_chart',
						'type'       => 'chart',
						'dependency' => array( 'layout_preset', '==', 'organization-chart', true ),
					),
					array(
						'id'         => 'sptp_chart_node',
						'class'      => 'sptp_chart_node hidden',
						'type'       => 'text',
						'dependency' => array( 'layout_preset', '==', 'organization-chart', true ),
					),
					array(
						'id'         => 'carousel_mode',
						'type'       => 'image_select',
						'class'      => 'sptp-layout-preset image hide-active-sign carousel_style',
						'title'      => __( 'Carousel Style', 'team-free' ),
						'options'    => array(
							'standard'          => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/standard.svg',
								'option_name' => __( 'Standard', 'team-free' ),
							),
							'center'            => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/center.svg',
								'option_name' => __( 'Center', 'team-free' ),
								'pro_only'    => true,
							),
							'ticker'            => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/ticker-mode.svg',
								'option_name' => __( 'Ticker', 'team-free' ),
								'pro_only'    => true,
							),
							'thumbnails-slider' => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/thumbnails.svg',
								'option_name' => __( 'Thumbnails', 'team-free' ),
								'pro_only'    => true,
							),
							'multi-rows'        => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/multi_rows.svg',
								'option_name' => __( 'Multi Rows', 'team-free' ),
								'pro_only'    => true,
							),
						),
						'default'    => 'standard',
						'dependency' => array( 'layout_preset', '==', 'carousel', true ),
					),
					array(
						'id'         => 'layout_mode',
						'type'       => 'image_select',
						'class'      => 'sptp-layout-preset image hide-active-sign carousel_style sptp-grid-style',
						'title'      => __( 'Grid Style', 'team-free' ),
						'inline'     => true,
						'only_pro'   => true,
						'options'    => array(
							'even'    => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/even.svg',
								'option_name' => __( 'Even', 'team-free' ),
							),
							'masonry' => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/masonry.svg',
								'option_name' => __( 'Masonry', 'team-free' ),
								'pro_only'    => true,
							),
						),
						'default'    => 'even',
						'dependency' => array( 'layout_preset', 'any', 'grid,filter', true ),
					),
					array(
						'id'         => 'style_member_content_position_list',
						'class'      => 'member_content_position_list sptp-layout-preset hide-active-sign image',
						'type'       => 'image_select',
						'title'      => __( 'List Style', 'team-free' ),
						'options'    => array(
							'left_img_right_content' => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/right.svg',
								'option_name' => __( 'Right Content', 'team-free' ),
							),
							'left_content_right_img' => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/left.svg',
								'option_name' => __( 'Left Content', 'team-free' ),
								'pro_only'    => true,
							),
						),
						'default'    => 'left_img_right_content',
						'dependency' => array( 'layout_preset', '==', 'list', true ),
					),
					array(
						'id'         => 'thumbnail_layout_style',
						'type'       => 'image_select',
						'class'      => 'sptp_custom_image_width-2  sptp-layout-preset hide-active-sign image',
						'title'      => __( 'Thumbnails Pager Style', 'team-free' ),
						'inline'     => true,
						'options'    => array(
							'right' => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/thubmnails-pager/right.svg',
								'option_name' => __( 'Right', 'team-free' ),
								'pro_only'    => true,
							),
							'top'   => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/thubmnails-pager/top.svg',
								'option_name' => __( 'Top', 'team-free' ),
								'pro_only'    => true,
							),
							'left'  => array(
								'image'       => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-style/thubmnails-pager/left.svg',
								'option_name' => __( 'Left', 'team-free' ),
								'pro_only'    => true,
							),
						),
						'default'    => 'right',
						'dependency' => array( 'layout_preset', '==', 'thumbnail-pager', true ),
					),
					array(
						'id'          => 'filter_members',
						'class'       => 'sptp_filter_members',
						'type'        => 'select',
						'title'       => __( 'Filter Members', 'team-free' ),
						'placeholder' => '',
						'options'     => array(
							'newest'   => __( 'Newest', 'team-free' ),
							'exclude'  => __( 'Exclude', 'team-free' ), // phpcs:ignore
							'group'    => __( 'Taxonomies', 'team-free' ),
							'specific' => __( 'Specific (Pro)', 'team-free' ),
						),
						'default'     => array( 'newest' ),
						'dependency'  => array( 'layout_preset', '!=', 'organization-chart', true ),
					),
					array(
						'id'          => 'filter_exclude',
						'type'        => 'select',
						'title'       => __( 'Exclude Members', 'team-free' ),
						'placeholder' => __( 'Exclude Members', 'team-free' ),
						'multiple'    => true,
						'chosen'      => true,
						'class'       => 'sptp-layout-group',
						'options'     => 'posts',
						'query_args'  => array(
							'post_type'      => 'sptp_member',
							'post_status'    => 'publish',
							'posts_per_page' => -1,
						),
						'dependency'  => array( 'filter_members', '==', 'exclude', true ),
					),
					array(
						'id'          => 'filter_by_taxonomies',
						'class'       => 'sptp-filter-by-taxonomies',
						'type'        => 'checkbox',
						'title'       => __( 'Taxonomies', 'team-free' ),
						'placeholder' => '',
						'options'     => array(
							'departments'  => __( 'Departments', 'team-free' ),
							'designations' => __( 'Designations', 'team-free' ),
							'locations'    => __( 'Locations', 'team-free' ),
							'languages'    => __( 'Languages', 'team-free' ),
							'genders'      => __( 'Genders', 'team-free' ),
						),
						'default'     => array( 'newest' ),
						'dependency'  => array( 'layout_preset|filter_members', '!=|==', 'organization-chart|group', true ),
					),

					/**
					 * Accordion for Department Fields
					 */
					array(
						'id'         => 'sptp_accordion_department_fields',
						'type'       => 'accordion',
						'title'      => ' ',
						'accordions' => array(
							array(
								'id'     => 'sptp_department_fields',
								'type'   => 'group',
								'title'  => 'Departments',
								'fields' => array(
									array(
										'id'            => 'filter_group',
										'type'          => 'select',
										'title'         => __( 'Select Department', 'team-free' ),
										'placeholder'   => __( 'Select Department', 'team-free' ),
										'options'       => 'categories',
										'multiple'      => true,
										'chosen'        => true,
										'sortable'      => true,
										'class'         => 'sptp-layout-group',
										'query_args'    => array(
											'type'     => 'sptp_member',
											'taxonomy' => 'sptp_group',
										),
										'empty_message' => __( 'There are no department', 'team-free' ),
									),
									array(
										'id'         => 'group_relation',
										'type'       => 'select',
										'title'      => __( 'Term Operators', 'team-free' ),
										'options'    => array(
											'in'         => __( 'IN', 'team-free' ),
											'and'        => __( 'AND', 'team-free' ),
											'exists'     => __( 'EXISTS', 'team-free' ),
											'not_in'     => __( 'NOT IN', 'team-free' ),
											'not_exists' => __( 'NOT EXISTS', 'team-free' ),
										),
										'default'    => 'in',
										'title_info' => sprintf(
											'
											%s<br>%s<br/>%s<br/>%s<br/>%s',
											__( 'IN - Matches any of the given terms', 'team-free' ),
											__( 'AND - Must match all given terms', 'team-free' ),
											__( 'NOT IN - Excludes members with these terms', 'team-free' ),
											__( 'EXISTS - Has any term in that taxonomy', 'team-free' ),
											__( 'NOT EXISTS - Has no term in that taxonomy', 'team-free' ),
										),
										'class'      => 'sptp-help-select',
									),
								),
							),
						),
						'dependency' => array( 'layout_preset|filter_members|filter_by_taxonomies', '!=|==|any', 'organization-chart|group|departments', true ),
					),

					/**
					 * Accordion for Designation Fields
					 */
					array(
						'id'         => 'sptp_accordion_designation_fields',
						'type'       => 'accordion',
						'title'      => ' ',
						'accordions' => array(
							array(
								'id'     => 'sptp_designation_fields',
								'type'   => 'group',
								'title'  => 'Designations',
								'fields' => array(
									array(
										'id'            => 'filter_designation',
										'type'          => 'select',
										'title'         => __( 'Select Designation', 'team-free' ),
										'placeholder'   => __( 'Select Designation', 'team-free' ),
										'options'       => 'categories',
										'multiple'      => true,
										'chosen'        => true,
										'sortable'      => true,
										'class'         => 'sptp-filter-designation',
										'query_args'    => array(
											'type'     => 'sptp_member',
											'taxonomy' => 'sptp_designation',
										),
										'empty_message' => __( 'There are no designations', 'team-free' ),
									),
									array(
										'id'         => 'designation_operators',
										'type'       => 'select',
										'title'      => __( 'Term Operators', 'team-free' ),
										'options'    => array(
											'in'         => __( 'IN', 'team-free' ),
											'and'        => __( 'AND', 'team-free' ),
											'exists'     => __( 'EXISTS', 'team-free' ),
											'not_in'     => __( 'NOT IN', 'team-free' ),
											'not_exists' => __( 'NOT EXISTS', 'team-free' ),
										),
										'default'    => 'in',
										'title_info' => sprintf(
											'
											%s<br>%s<br/>%s<br/>%s<br/>%s',
											__( 'IN - Matches any of the given terms', 'team-free' ),
											__( 'AND - Must match all given terms', 'team-free' ),
											__( 'NOT IN - Excludes members with these terms', 'team-free' ),
											__( 'EXISTS - Has any term in that taxonomy', 'team-free' ),
											__( 'NOT EXISTS - Has no term in that taxonomy', 'team-free' ),
										),
										'class'      => 'sptp-help-select',
									),
								),
							),
						),
						'dependency' => array( 'layout_preset|filter_members|filter_by_taxonomies', '!=|==|any', 'organization-chart|group|designations', true ),
					),

					array(
						'id'         => 'sptp_term_relation',
						'type'       => 'select',
						'title'      => __( 'Term Relation', 'team-free' ),
						'options'    => array(
							'and' => __( 'AND', 'team-free' ),
							'or'  => __( 'OR', 'team-free' ),
						),
						'default'    => 'and',
						'title_info' => sprintf(
							'
							%s<br/>%s',
							__( 'AND - Show members which match all terms', 'team-free' ),
							__( 'NOT IN - Show members which don\'t match the terms', 'team-free' ),
						),
						'class'      => 'sptp-help-select',
						'dependency' => array( 'layout_preset|filter_members|filter_by_taxonomies', '!=|==|any', 'organization-chart|group|departments,designations', true ),
					),

					array(
						'type'       => 'notice',
						'content'    => sprintf(
							/* translators: 1: start link and bold tag, 2: close link and bold tag. */
							__( 'To create eye-catching team layout designs and access to advanced customizations, %1$sUpgrade to Pro!%2$s', 'team-free' ),
							'<a href="https://getwpteam.com/pricing/?ref=1" target="_blank"><b>',
							'</b></a>'
						),
						'dependency' => array( 'layout_preset', '!=', 'organization-chart', true ),
					),

					array(
						'type'       => 'notice',
						'content'    => sprintf(
							/* translators: 1: start link and bold tag, 2: close link and bold tag. */
							__( 'To display members beyond the third level of your organization chart and unlock more advanced chart options, %1$sUpgrade to Pro!%2$s', 'team-free' ),
							'<a href="https://getwpteam.com/pricing/?ref=1" target="_blank"><b>',
							'</b></a>'
						),
						'dependency' => array( 'layout_preset', '==', 'organization-chart', true ),
					),
				),
			)
		);
	}
}
