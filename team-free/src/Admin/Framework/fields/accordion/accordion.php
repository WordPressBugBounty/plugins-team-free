<?php
/**
 *
 * Field: accordion
 *
 * @link       https://shapedplugin.com/
 *
 * @package Smart_Post_Show_Pro
 * @subpackage Smart_Post_Show_Pro/admin/views
 */

use ShapedPlugin\WPTeam\Admin\Framework\Classes\SPF_TEAM;

if ( ! defined( 'ABSPATH' ) ) {
	die;
} // Cannot access directly.

if ( ! class_exists( 'TEAMFW_Field_accordion' ) ) {
	/**
	 *
	 * Field: accordion
	 *
	 * @since 2.0
	 * @version 2.0
	 */
	class TEAMFW_Field_accordion extends TEAMFW_Fields {

		/**
		 * The class constructor.
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
		 * The render method.
		 *
		 * @return void
		 */
		public function render() {

			$unallows = array( 'accordion' );

			echo wp_kses_post( $this->field_before() );

			echo '<div class="spf-accordion-items">';

			foreach ( $this->field['accordions'] as $key => $accordion ) {

				echo '<div class="spf-accordion-item">';

				$icon = ( ! empty( $accordion['icon'] ) ) ? 'spf--icon ' . $accordion['icon'] : 'spf-accordion-icon fa fa-angle-right';

				echo '<h4 class="spf-accordion-title">';
				echo '<i class="' . esc_attr( $icon ) . '"></i>';
					echo esc_html( $accordion['title'] );
					echo '</h4>';

				echo '<div class="spf-accordion-content">';

				foreach ( $accordion['fields'] as $field ) {

					if ( in_array( $field['type'], $unallows ) ) {
						$field['_notice'] = true;
					}
					$field_id      = ( isset( $field['id'] ) ) ? $field['id'] : '';
					$field_default = ( isset( $field['default'] ) ) ? $field['default'] : '';
					$field_value   = ( isset( $this->value[ $field_id ] ) ) ? $this->value[ $field_id ] : $field_default;
					$unique_id     = ( ! empty( $this->unique ) ) ? $this->unique . '[' . $this->field['id'] . ']' : $this->field['id'];

					SPF_TEAM::field( $field, $field_value, $unique_id, 'field/accordion' );

				}

				echo '</div>';

				echo '</div>';

			}

			echo '</div>';

			echo wp_kses_post( $this->field_after() );
		}
	}
}
