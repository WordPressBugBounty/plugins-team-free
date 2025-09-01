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
								'pro_only'        => true,
								'option_demo_url' => 'https://getwpteam.com/isotope/',
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
							'organization-chart' => array(
								'image'           => SPT_PLUGIN_ROOT . 'src/Admin/img/layout-preset/org_chart.svg',
								'option_name'     => __( 'Org Chart', 'team-free' ),
								'pro_only'        => true,
								'option_demo_url' => 'https://getwpteam.com/organization-chart/',
							),
						),
						'default' => 'carousel',
					),
					array(
						'id'         => 'sptp_chart',
						'type'       => 'text',
						'chart'      => true,
						'only_pro'   => true,
						'dependency' => array( 'layout_preset', '==', 'organization-chart', true ),
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
							'group'    => __( 'Groups (Pro)', 'team-free' ),
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
						'type'    => 'notice',
						'content' => sprintf(
							/* translators: 1: start link and bold tag, 2: close link and bold tag. */
							__( 'To create eye-catching team layout designs and access to advanced customizations, %1$sUpgrade to Pro!%2$s', 'team-free' ),
							'<a href="https://getwpteam.com/pricing/?ref=1" target="_blank"><b>',
							'</b></a>'
						),
					),
				),
			)
		);
	}
}
