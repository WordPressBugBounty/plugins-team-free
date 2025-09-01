<?php
/**
 * General tab.
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
 * This class is responsible for General tab in Team page.
 *
 * @since      2.0.0
 */
class SPTP_General {

	/**
	 * General settings.
	 *
	 * @since 2.0.0
	 * @param string $prefix _sptp_generator.
	 */
	public static function section( $prefix ) {
		SPF_TEAM::createSection(
			$prefix,
			array(
				'title'  => __( 'General Settings', 'team-free' ),
				'icon'   => 'fa fa-gear',
				'fields' => array(
					array(
						'id'         => 'responsive_columns',
						'class'      => 'sptp_responsive_columns',
						'type'       => 'column',
						'title'      => __( 'Columns', 'team-free' ),
						'subtitle'   => __( 'Set number of columns in different responsive devices.', 'team-free' ),
						'dependency' => array( 'layout_preset', '!=', 'list', true ),
						'default'    => array(
							'desktop' => '4',
							'laptop'  => '3',
							'tablet'  => '2',
							'mobile'  => '1',
						),
						'title_info' => '<i class="fa fa-desktop"></i> <strong>' . __( 'DESKTOP', 'team-free' ) . '</strong> ' . __( '- Screens larger than 1024px.', 'team-free' ) . '<br/>
						<i class="fa fa-laptop"></i> <strong>' . __( 'LAPTOP', 'team-free' ) . '</strong> ' . __( '- Screens smaller than 1024px.', 'team-free' ) . '<br/>
						<i class="fa fa-tablet"></i> <strong>' . __( 'TABLET', 'team-free' ) . '</strong> ' . __( '- Screens smaller than 768px.', 'team-free' ) . '<br/>
						<i class="fa fa-mobile"></i> <strong>' . __( 'MOBILE', 'team-free' ) . '</strong> ' . __( '- Screens smaller than 414px.', 'team-free' ) . '<br/>',
					),
					array(
						'id'         => 'responsive_columns_list',
						'class'      => 'sptp_responsive_columns_list',
						'type'       => 'column',
						'title'      => __( 'Columns', 'team-free' ),
						'subtitle'   => __( 'Set number of columns in different responsive devices.', 'team-free' ),
						'dependency' => array( 'layout_preset', '==', 'list', true ),
						'default'    => array(
							'desktop' => '1',
							'laptop'  => '1',
							'tablet'  => '1',
							'mobile'  => '1',
						),
						'title_info' => '<i class="fa fa-desktop"></i> <strong>' . __( 'DESKTOP', 'team-free' ) . '</strong> ' . __( '- Screens larger than 1024px.', 'team-free' ) . '<br/>
						<i class="fa fa-laptop"></i> <strong>' . __( 'LAPTOP', 'team-free' ) . '</strong> ' . __( '- Screens smaller than 1024px.', 'team-free' ) . '<br/>
						<i class="fa fa-tablet"></i> <strong>' . __( 'TABLET', 'team-free' ) . '</strong> ' . __( '- Screens smaller than 768px.', 'team-free' ) . '<br/>
						<i class="fa fa-mobile"></i> <strong>' . __( 'MOBILE', 'team-free' ) . '</strong> ' . __( '- Screens smaller than 414px.', 'team-free' ) . '<br/>',
					),
					array(
						'id'          => 'style_margin_between_member',
						'class'       => 'sptp_style_margin_between_member',
						'type'        => 'spacing',
						'title'       => __( 'Space', 'team-free' ),
						'subtitle'    => __( 'Set a space or margin between members.', 'team-free' ),
						'gap_between' => true,
						'units'       => array( 'px' ),
						'all_icon'    => '<i class="fa fa-arrows"></i>',
						'default'     => array(
							'top-bottom' => 24,
							'left-right' => 24,
						),
						'title_info'  => '<div class="spf-img-tag"><img src="' . SPT_PLUGIN_ROOT . 'src/Admin/img/visual/space.svg" alt="' . __( 'Space Between', 'team-free' ) . '"></div><div class="spf-info-label img">' . __( 'Space Between', 'team-free' ) . '</div>',
					),
					array(
						'id'       => 'total_member_display',
						'class'    => 'sptp_total_member_display',
						'type'     => 'spinner',
						'title'    => __( 'Limit', 'team-free' ),
						'default'  => '12',
						'subtitle' => __( 'Number of total members to display.  For all leave it empty.', 'team-free' ),
						'min'      => 1,
					),
					array(
						'id'       => 'order_by',
						'type'     => 'select',
						'title'    => __( 'Order By', 'team-free' ),
						'options'  => array(
							'title'    => __( 'Name', 'team-free' ),
							'id'       => __( 'ID', 'team-free' ),
							'date'     => __( 'Date', 'team-free' ),
							'rand'     => __( 'Random', 'team-free' ),
							'modified' => __( 'Modified', 'team-free' ),
						),
						'default'  => 'date',
						'subtitle' => __( 'Select an order by option.', 'team-free' ),
					),
					array(
						'id'       => 'order',
						'type'     => 'select',
						'title'    => __( 'Order', 'team-free' ),
						'options'  => array(
							'ASC'  => __( 'Ascending', 'team-free' ),
							'DESC' => __( 'Descending', 'team-free' ),
						),
						'default'  => 'DESC',
						'subtitle' => __( 'Select an order option.', 'team-free' ),
					),
					array(
						'id'         => 'preloader_switch',
						'type'       => 'switcher',
						'title'      => __( 'Preloader', 'team-free' ),
						'subtitle'   => __( 'Team members will be hidden until page load completed.', 'team-free' ),
						'text_on'    => __( 'Enabled', 'team-free' ),
						'text_off'   => __( 'Disabled', 'team-free' ),
						'text_width' => 100,
						'default'    => true,
					),
					array(
						'id'         => 'member_search',
						'class'      => 'sptp_pro_only_field',
						'type'       => 'switcher',
						'title'      => __( 'Ajax Member Search', 'team-free' ),
						'subtitle'   => __( 'Enable/Disable ajax search for member.', 'team-free' ),
						'text_on'    => __( 'Enabled', 'team-free' ),
						'text_off'   => __( 'Disabled', 'team-free' ),
						'default'    => false,
						'text_width' => 100,
						'dependency' => array( 'layout_preset', 'not-any', 'filter,thumbnail-pager', true ),
					),
					array(
						'id'         => 'member_live_filter',
						'class'      => 'member_live_filter sptp_pro_only_field',
						'type'       => 'switcher',
						'title'      => __( 'Ajax Live Filters', 'team-free' ),
						'subtitle'   => __( 'Ajax live filtering for member groups.', 'team-free' ),
						'text_on'    => __( 'Enabled', 'team-free' ),
						'text_off'   => __( 'Disabled', 'team-free' ),
						'default'    => false,
						'text_width' => 100,
						'title_info' => '<div class="spf-info-label">' . __( 'Ajax Member Live Filters', 'team-free' ) . '</div> <div class="spf-short-content">' . __( 'Make your visitor\'s member search easier by enabling the Ajax live filter. This powerful feature allows effortless navigation through member categories,they can easily find exactly what they\'re looking for.', 'team-free' ) . '</div><div class="info-button"><a class="spf-open-docs" href="https://getwpteam.com/docs/how-to-enable-ajax-live-filter-and-member-search/" target="_blank">' . __( 'Open Docs', 'team-free' ) . '</a><a class="spf-open-live-demo" href="https://getwpteam.com/advanced-ajax-live-filtering-and-ajax-member-search/" target="_blank">' . __( 'Live Demo', 'team-free' ) . '</a></div>',
						'dependency' => array( 'layout_preset', 'not-any', 'filter,thumbnail-pager', true ),
					),

					array(
						'type'       => 'notice',
						'class'      => 'ajax-notice',
						'content'    => sprintf(
						/* translators: 1: start link tag, 2: close tag. */
							__( 'To allow your visitors to filter members by %3$sGroups%2$s, and Ajax Search on the frontend, %1$sUpgrade to Pro!%2$s', 'team-free' ),
							'<a target="_blank" href="https://getwpteam.com/pricing/?ref=1"><b>',
							'</b></a>',
							'<a target="_blank" href="https://getwpteam.com/advanced-ajax-live-filtering-and-ajax-member-search/"><b>',
						),
						'dependency' => array( 'layout_preset|member_live_filter', 'not-any|==', 'filter,thumbnail-pager|true', true ),
					),
					array(
						'id'         => 'pagination_fields',
						'type'       => 'fieldset',
						'class'      => 'sptp-pagination-group sptp_pro_only_field',
						'dependency' => array( 'layout_preset', 'not-any', 'thumbnail-pager,filter,carousel', true ),
						'fields'     => array(
							array(
								'id'         => 'pagination_universal',
								'type'       => 'switcher',
								'title'      => __( 'Ajax Pagination', 'team-free' ),
								'subtitle'   => __( 'Enabled/Disabled pagination', 'team-free' ),
								'text_on'    => __( 'Enabled', 'team-free' ),
								'text_off'   => __( 'Disabled', 'team-free' ),
								'text_width' => 100,
								'default'    => false,
								'class'      => 'sptp-pagination',
							),
						),
					), // End of the Pagination Settings Fieldset.
					array(
						'type'       => 'notice',
						'content'    => sprintf(
							/* translators: 1: start link and bold tag, 2: close link and bold tag. */
							__( 'Unleash Ajax Search, Live Filters, Load More, and more — take your team page to the next level. %1$sUpgrade to Pro!%2$s', 'team-free' ),
							'<a href="https://getwpteam.com/pricing/?ref=1" target="_blank"><b>',
							'</b></a>'
						),
						'dependency' => array( 'layout_preset', 'not-any', 'thumbnail-pager,filter,carousel', true ),
					),
				),
			)
		);
	}
}
