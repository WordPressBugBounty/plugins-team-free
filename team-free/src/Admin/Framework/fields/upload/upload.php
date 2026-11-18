<?php
/**
 * The upload field functionality of the plugin.
 *
 * @link       https://shapedplugin.com/
 * @since      3.0.8
 *
 * @package    Team_Free
 * @subpackage Team_Free/Admin/Framework/fields/upload
 */

if ( ! defined( 'ABSPATH' ) ) {
	die;
} // Cannot access directly.


if ( ! class_exists( 'TEAMFW_Field_upload' ) ) {
	/**
	 *
	 * Field: Upload
	 *
	 * @since 2.2.3
	 * @version 2.2.3
	 */
	class TEAMFW_Field_upload extends TEAMFW_Fields {
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
		 * Render
		 *
		 * @return void
		 */
		public function render() {
			$args = wp_parse_args(
				$this->field,
				array(
					'library'        => array(),
					'preview'        => false,
					'preview_width'  => '',
					'preview_height' => '',
					'button_icon'    => '',
					'button_title'   => esc_html__( 'Upload', 'team-free' ),
					'remove_title'   => esc_html__( 'Remove', 'team-free' ),
				)
			);

			echo wp_kses_post( $this->field_before() );
			$library = ( is_array( $args['library'] ) ) ? $args['library'] : array_filter( (array) $args['library'] );

			$library = ( ! empty( $library ) ) ? implode( ',', $library ) : '';
			$hidden  = ( empty( $this->value ) ) ? ' hidden' : '';

			if ( ! empty( $args['preview'] ) ) {
				$preview_type   = ( ! empty( $this->value ) ) ? strtolower( substr( strrchr( $this->value, '.' ), 1 ) ) : '';
				$preview_src    = ( ! empty( $preview_type ) && in_array( $preview_type, array( 'jpg', 'jpeg', 'gif', 'png', 'svg', 'webp' ) ) ) ? $this->value : '';
				$preview_width  = ( ! empty( $args['preview_width'] ) ) ? 'max-width:' . esc_attr( $args['preview_width'] ) . 'px;' : '';
				$preview_height = ( ! empty( $args['preview_height'] ) ) ? 'max-height:' . esc_attr( $args['preview_height'] ) . 'px;' : '';
				$preview_style  = ( ! empty( $preview_width ) || ! empty( $preview_height ) ) ? ' style="' . esc_attr( $preview_width . $preview_height ) . '"' : '';
				$preview_hidden = ( empty( $preview_src ) ) ? ' hidden' : '';

				echo '<div class="spf--preview' . esc_attr( $preview_hidden ) . '">';
				echo '<div class="spf-image-preview"' . $preview_style . '>'; // phpcs:ignore -- already escaped.
				echo '<i class="spf--remove fas fa-times"></i><span><img src="' . esc_url( $preview_src ) . '" class="spf--src" /></span>';
				echo '</div>';
				echo '</div>';
			}

			echo '<div class="spf--wrap">';
			echo '<a href="#" class="button button-primary spf--button" data-library="' . esc_attr( $library ) . '"><i class="' . esc_attr( $args['button_icon'] ) . '"></i> ' . esc_html( $args['button_title'] ) . '</a>';
			echo '<input placeholder="URL" type="text" name="' . esc_attr( $this->field_name() ) . '" value="' . esc_attr( $this->value ) . '"' . wp_kses_post( $this->field_attributes() ) . '/>';
			echo '<a href="#" class="button button-secondary spf-warning-primary spf--remove' . esc_attr( $hidden ) . '">' . esc_html( $args['remove_title'] ) . '</a>';
			echo '</div>';
			echo wp_kses_post( $this->field_after() );
		}
	}
}
