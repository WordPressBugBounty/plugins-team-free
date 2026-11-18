<?php
/**
 * Framework sortable field file.
 *
 * @link https://shapedplugin.com
 * @since 2.0.0
 *
 * @package    Wp_Team_pro
 * @subpackage Wp_Team_pro/Admin/Framework
 */

use ShapedPlugin\WPTeam\Admin\Framework\Classes\SPF_TEAM;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

if ( ! class_exists( 'TEAMFW_Field_sortable' ) ) {
	/**
	 * Class TEAMFW_Field_sortable.
	 * This class handles the sortable field type in the admin panel.
	 * It extends the TEAMFW_Fields class to inherit common field functionalities.
	 *
	 * @since 2.0.0
	 */
	class TEAMFW_Field_sortable extends TEAMFW_Fields {

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
		 * Render sortable field.
		 *
		 * @since 2.0.0
		 *
		 * @return void
		 */
		public function render() {
			echo wp_kses_post( $this->field_before() );

			// Title and subtitle if set.
			if ( ! empty( $this->field['title'] ) || ! empty( $this->field['subtitle'] ) ) {
				echo '<div class="spf-title">';
				if ( ! empty( $this->field['title'] ) ) {
					echo '<h4>' . esc_html( $this->field['title'] ) . '</h4>';
				}
				if ( ! empty( $this->field['subtitle'] ) ) {
					echo '<div class="spf-subtitle-text">' . esc_html( $this->field['subtitle'] ) . '</div>';
				}
				echo '</div>';
			}

			echo '<div class="spf-sortable">';

			$available_fields = array();
			$sorted_fields    = array();

			// Store field index by their id.
			foreach ( $this->field['fields'] as $field ) {
				$sorted_fields[ $field['id'] ] = $field;
			}

			// Store sorted field index in available fields.
			if ( is_array( $this->value ) && ! empty( $this->value ) ) {
				foreach ( $this->value as $key => $val ) {
					if ( isset( $sorted_fields[ $key ] ) ) {
						$available_fields[ $key ] = $sorted_fields[ $key ];
					}
				}
				$diff = array_diff_key( $sorted_fields, $this->value );
				if ( ! empty( $diff ) ) {
					$available_fields = array_merge( $available_fields, $diff );
				}
			} else {
				$available_fields = $sorted_fields;
			}

			// Build the base unique name for this field level
			// e.g. _sptp_settings[parent_fields].
			$base_unique = $this->unique;
			if ( isset( $this->field['id'] ) ) {
				$base_unique .= '[' . $this->field['id'] . ']';
			}

			foreach ( $available_fields as $key => $field ) {
				echo '<div class="spf-sortable-item">';
				echo '<div class="spf-sortable-helper"><img src="' . esc_url( SPF_TEAM::include_plugin_url( 'assets/image/drag-and-drop.svg' ) ) . '" class="icon_preview"></div>';
				echo '<div class="spf-sortable-content">';

				$field_default = isset( $this->field['default'][ $key ] ) ? $this->field['default'][ $key ] : '';
				$field_value   = isset( $this->value[ $key ] ) ? $this->value[ $key ] : $field_default;

				// Build unique name for child field inputs,
				// e.g. _sptp_settings[parent_fields][child_fields].
				$child_unique = $base_unique;

				// Avoid array to string conversion warning.
				if ( is_array( $field_value ) && ! isset( $field['fields'] ) ) {
					$field_value = '';
				}

				// Properly built unique field name for input names.
				SPF_TEAM::field( $field, $field_value, $child_unique, 'field/sortable' );

				echo '</div>';
				echo '</div>';
			}

			echo '</div>';

			echo wp_kses_post( $this->field_after() );
		}

		/**
		 * Enqueue the necessary jQuery UI sortable script.
		 *
		 * Checks if the 'jquery-ui-sortable' script is already enqueued, and if not,
		 * enqueues it.
		 */
		public function enqueue() {
			if ( ! wp_script_is( 'jquery-ui-sortable' ) ) {
				wp_enqueue_script( 'jquery-ui-sortable' );
			}
		}
	}
}
