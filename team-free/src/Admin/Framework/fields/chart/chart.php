<?php
/**
 * Framework Organization Chart field file.
 *
 * @link https://shapedplugin.com
 * @since 3.1.0
 *
 * @package    Wp_Team_pro
 * @subpackage Wp_Team_pro/Admin/Framework
 */

if ( ! defined( 'ABSPATH' ) ) {
	die;
} // Cannot access directly.

use ShapedPlugin\WPTeam\Admin\Framework\Classes\SPF_TEAM;

if ( ! class_exists( 'TEAMFW_Field_chart' ) ) {

	/**
	 *
	 * Field: text
	 *
	 * @since 1.0.0
	 * @version 1.0.0
	 */
	class TEAMFW_Field_chart extends TEAMFW_Fields {
		/**
		 * Field constructor.
		 *
		 * @param array  $field The field type.
		 * @param string $value The values of the field.
		 * @param string $unique The unique ID for the field.
		 * @param string $where To where show the output CSS.
		 * @param string $parent The parent args.
		 */
		public function __construct( $field, $value = '', $unique = '', $where = '', $parent = '' ) {
			parent::__construct( $field, $value, $unique, $where, $parent );
		}
		/**
		 * Render field
		 *
		 * @return void
		 */
		public function render() {

			$type   = ( ! empty( $this->field['attributes']['type'] ) ) ? $this->field['attributes']['type'] : 'chart';
			$layout = get_post_meta( get_the_ID(), '_sptp_generator_layout', true );

			$selected_chart_member = isset( $layout['sptp_chart_node'] ) ? $layout['sptp_chart_node'] : '';
			// Decode the JSON string into a PHP array.
			$selected_chart_member = json_decode( $selected_chart_member, true );

			echo wp_kses_post( $this->field_before() );
			?> 
			<div class="sp-team-org-chart-container" data-id="<?php echo esc_attr( get_the_ID() ); ?>">
			<div id="sp-team-member-tree<?php echo esc_attr( get_the_ID() ); ?>" class="tree">
					<ul>
						<?php if ( ! is_array( $selected_chart_member ) ) : ?>
						<li>
							<div class="sp-team-member-tree-node">
								<?php
									$new_tab = isset( $this->value['sptp_chart_member_ids'] ) ? $this->value['sptp_chart_member_ids'] : '';
									echo '<div class="splcp-link-field">';
									SPF_TEAM::field(
										array(
											'id'          => 'sptp_chart_member_ids',
											'class'       => 'sptp_chart_member_ids',
											'type'        => 'select',
											'title'       => ' ',
											'options'     => 'sptp_member',
											'chosen'      => false,
											'sortable'    => false,
											'multiple'    => false,
											'placeholder' => __( 'Select Member', 'team-free' ),
											'default'     => '514',
											'query_args'  => array(
												'posts_per_page' => -1,
											),
										),
										$new_tab,
										$this->field_name(),
										'field/select'
									);
									echo '</div>';
								?>
								<button type="button" class="add_child_button"></button>
								<button class="add_bro_right" type="button"></button>
								<button class="add_bro_left" type="button"></button>
							</div>
						</li>
						<?php endif; ?>
						<?php
						if ( is_array( $selected_chart_member ) ) {
							foreach ( $selected_chart_member as $node ) {
								$this->render_tree_node( $node );
							}
						}
						?>
					</ul>
				</div>
			</div>
			<?php
			echo wp_kses_post( $this->field_after() );
		}

		/**
		 * Render one saved chart node and, recursively, its children.
		 *
		 * A method rather than a function declared inside render(): a nested
		 * declaration is global, so a second render in one request would be a
		 * fatal "Cannot redeclare" error.
		 *
		 * @param array $node Node data (`id`, optional `children`).
		 * @return void
		 */
		private function render_tree_node( $node ) {
			$selected_id = isset( $node['id'] ) ? $node['id'] : '';
			echo '<li>';
			echo '<div class="sp-team-member-tree-node">';
			echo '<div class="splcp-link-field">';
			SPF_TEAM::field(
				array(
					'id'          => 'sptp_chart_member_ids',
					'class'       => 'sptp_chart_member_ids',
					'type'        => 'select',
					'title'       => ' ',
					'options'     => 'sptp_member',
					'chosen'      => false,
					'sortable'    => false,
					'multiple'    => false,
					'placeholder' => __( 'Select Member', 'team-free' ),
					'default'     => $selected_id, // Set the default to the node's ID.
					'query_args'  => array(
						'posts_per_page' => -1,
					),
				),
				$selected_id,
				'sptp_chart_member_ids',
				'field/select'
			);
			echo '</div>';
			echo '<button type="button" class="add_child_button"></button>';
			echo '<button class="add_bro_right" type="button"></button>';
			echo '<button class="add_bro_left" type="button"></button>';
			echo '<span class="dashicons dashicons-trash remove_tree_node"></span>';
			echo '</div>';

			// If the node has children, recursively render them.
			if ( ! empty( $node['children'] ) && is_array( $node['children'] ) ) {
				echo '<ul>';
				foreach ( $node['children'] as $child ) {
					$this->render_tree_node( $child );
				}
				echo '</ul>';
			}
			echo '</li>';
		}
	}
}
