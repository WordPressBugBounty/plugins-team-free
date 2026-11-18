<?php
/**
 * List layout.
 * This template can be overridden by copying it to yourtheme/wp-team-pro/templates/list.php
 *
 * @package WP_Team_Pro
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use ShapedPlugin\WPTeam\Frontend\Helper;

$selected_chart_member = isset( $layout['sptp_chart_node'] ) ? $layout['sptp_chart_node'] : '';

// Decode the JSON string into a PHP array.
$selected_chart_member = json_decode( $selected_chart_member, true );
?>

<div class="sp-wp-team-pro-wrapper">
	<div id="<?php echo esc_attr( 'sptp-' . $generator_id ); ?>"
		class="sp-team-pro sptp-section <?php echo 'sptp-' . esc_html( $page_link_type ); ?>">
		<?php
		Helper::sptp_preloader( $preloader );
		if ( ! empty( $filter_members ) ) {
			?>
			<div class="sptp-organization-chart sptp-chart">
				<div class="sptp-row">
					<div class="sp-team-org-chart-container">
						<div id="sp-team-member-tree" class="tree">
							<ul>
								<?php
								if ( is_array( $selected_chart_member ) ) {
									// One counter for the whole chart: the 9-member cap spans every root node.
									$rendered_count = 0;
									foreach ( $selected_chart_member as $node ) {
										Helper::render_tree_node( $node, $filter_members, $generator_id, $layout, $settings, $sptp_settings, $rendered_count );
									}
								}
								?>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<?php
		}
		?>
	</div>
</div>
