<?php
/**
 * The plugin export import page.
 *
 * @link       https://shapedplugin.com/
 * @since      3.2.4
 *
 * @package    WP_Team_free
 * @subpackage WP_Team_free/Admin
 * @author     ShapedPlugin <support@shapedplugin.com>
 */

namespace ShapedPlugin\WPTeam\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( ! class_exists( 'Team_Import_Export' ) ) {

	/**
	 * Custom import export.
	 */
	class Team_Import_Export {

		/**
		 * Export
		 *
		 * @param  mixed $shortcode_ids Export member and shortcode ids.
		 * @return object
		 */
		public function export( $shortcode_ids ) {
			$export = array();
			if ( ! empty( $shortcode_ids ) ) {
				$post_type  = 'all_members' === $shortcode_ids ? 'sptp_member' : 'sptp_generator';
				$post_in    = 'all_members' === $shortcode_ids || 'all_shortcodes' === $shortcode_ids ? '' : $shortcode_ids;
				$args       = array(
					'post_type'        => $post_type,
					'post_status'      => array( 'inherit', 'publish' ),
					'orderby'          => 'modified',
					'suppress_filters' => 1, // wpml, ignore language filter.
					'posts_per_page'   => -1,
					'post__in'         => $post_in,
				);
				$shortcodes = get_posts( $args );
				if ( ! empty( $shortcodes ) ) {
					foreach ( $shortcodes as $shortcode ) {
						if ( 'all_members' !== $shortcode_ids ) {
							$shortcode_export = array(
								'title'       => sanitize_text_field( $shortcode->post_title ),
								'original_id' => absint( $shortcode->ID ),
								'meta'        => array(),
							);
						}
						if ( 'all_members' === $shortcode_ids ) {
							$terms            = get_the_terms( $shortcode->ID, 'sptp_group' );
							$shortcode_export = array(
								'title'       => sanitize_text_field( $shortcode->post_title ),
								'original_id' => absint( $shortcode->ID ),
								'content'     => wp_kses_post( $shortcode->post_content ),
								'image'       => esc_url_raw( get_the_post_thumbnail_url( $shortcode->ID, 'single-post-thumbnail' ) ),
								'all_members' => 'all_members',
								'meta'        => array(),
							);
						}

						foreach ( get_post_meta( $shortcode->ID ) as $metakey => $value ) {
							$meta_key                              = sanitize_key( $metakey );
							$meta_value                            = is_serialized( $value[0] ) ? $value[0] : sanitize_text_field( $value[0] );
							$shortcode_export['meta'][ $meta_key ] = $meta_value;
						}
						$export['shortcode'][] = $shortcode_export;
						unset( $shortcode_export );
					}
					$export['metadata'] = array(
						'version' => SPT_PLUGIN_VERSION,
						'date'    => sanitize_text_field( gmdate( 'Y/m/d' ) ),
					);
				}
				return $export;
			}
			return false;
		}

		/**
		 * Export Team by ajax.
		 *
		 * @return void
		 */
		public function export_shortcodes() {
			$nonce = ( ! empty( $_POST['nonce'] ) ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
			if ( ! wp_verify_nonce( $nonce, 'spf_options_nonce' ) ) {
				wp_send_json_error( array( 'error' => esc_html__( 'Invalid nonce', 'team-free' ) ) );
			}

			$_capability = apply_filters( 'sp_team_import_export_capabilities', 'manage_options' );
			if ( ! current_user_can( $_capability ) ) {
				wp_send_json_error( array( 'error' => esc_html__( 'You do not have permission to export.', 'team-free' ) ) );
			}

			$shortcode_ids = isset( $_POST['sptp_ids'] ) ? wp_unslash( $_POST['sptp_ids'] ) : ''; // phpcs:ignore

			$export = $this->export( $shortcode_ids );

			if ( is_wp_error( $export ) ) {
				wp_send_json_error(
					array(
						'message' => esc_html( $export->get_error_message() ),
					),
					400
				);
			}

			if ( false === $export ) {
				wp_send_json_error(
					array(
						'message' => esc_html__( 'No data to export.', 'team-free' ),
					),
					400
				);
			}

			if ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) {
				// @codingStandardsIgnoreLine
				echo wp_json_encode($export, JSON_PRETTY_PRINT);
				die;
			}

			wp_send_json( $export, 200 );
		}

		/**
		 * Get page by title
		 *
		 * @param string $page_title Page title.
		 * @param string $output Optional.
		 * @param string $post_type Post type.
		 * @return obj.
		 */
		public function sp_team_get_page_by_title( $page_title, $output = OBJECT, $post_type = 'page' ) {
			global $wpdb;
			$sql  = $wpdb->prepare(
				"
			SELECT ID
			FROM $wpdb->posts
			WHERE post_title = %s
			AND post_type = %s
		",
				$page_title,
				$post_type
			);
			$page = $wpdb->get_var( $sql ); // phpcs:ignore -- WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			if ( $page ) {
				return get_post( $page, $output );
			}
			return null;
		}

		/**
		 * Insert an attachment from an URL address.
		 *
		 * @param  String $url remote url.
		 * @param  Int    $parent_post_id parent post id.
		 * @return Int    Attachment ID
		 */
		public function insert_attachment_from_url( $url, $parent_post_id = null ) {

			if ( ! class_exists( 'WP_Http' ) ) {
				include_once ABSPATH . WPINC . '/class-http.php';
			}
			$attachment_title = sanitize_file_name( pathinfo( $url, PATHINFO_FILENAME ) );
			// Does the attachment already exist ?
			if ( post_exists( $attachment_title, '', '', 'attachment' ) ) {
				$attachment = $this->sp_team_get_page_by_title( $attachment_title, OBJECT, 'attachment' );

				if ( ! empty( $attachment ) ) {
					$attachment_id = absint( $attachment->ID );
					return $attachment_id;
				}
			}
			$http     = new \WP_Http();
			$response = $http->request( $url );
			if ( is_wp_error( $response ) || 200 !== $response['response']['code'] ) {
				return false;
			}
			$upload = wp_upload_bits( basename( $url ), null, $response['body'] );
			if ( ! empty( $upload['error'] ) ) {
				return false;
			}

			$file_path     = $upload['file'];
			$file_name     = basename( $file_path );
			$file_type     = wp_check_filetype( $file_name, null );
			$wp_upload_dir = wp_upload_dir();

			$post_info = array(
				'guid'           => $wp_upload_dir['url'] . '/' . $file_name,
				'post_mime_type' => sanitize_mime_type( $file_type['type'] ),
				'post_title'     => sanitize_text_field( $attachment_title ),
				'post_content'   => '',
				'post_status'    => 'inherit',
			);

			// Create the attachment.
			$attach_id = wp_insert_attachment( $post_info, $file_path, $parent_post_id );

			// Include image.php.
			require_once ABSPATH . 'wp-admin/includes/image.php';

			// Define attachment metadata.
			$attach_data = wp_generate_attachment_metadata( $attach_id, $file_path );

			// Assign metadata to attachment.
			wp_update_attachment_metadata( $attach_id, $attach_data );

			return $attach_id;
		}

		/**
		 * Import logo ans shortcode.
		 *
		 * @param  array $shortcodes Import team-free shortcode array.
		 * @throws \Exception Get errors message.
		 * @return object
		 */
		public function import( $shortcodes ) {
			$errors = array();

			$sptp_post_type = 'sptp_member';
			foreach ( $shortcodes as $index => $shortcode ) {
				$errors[ $index ] = array();
				$new_shortcode_id = 0;
				$sptp_post_type   = isset( $shortcode['all_members'] ) ? 'sptp_member' : 'sptp_generator';
				try {
					$new_shortcode_id = wp_insert_post(
						array(
							'post_title'   => isset( $shortcode['title'] ) ? sanitize_text_field( $shortcode['title'] ) : '',
							'post_content' => isset( $shortcode['content'] ) ? wp_kses_post( $shortcode['content'] ) : '',
							'post_status'  => 'publish',
							'post_type'    => $sptp_post_type,
						),
						true
					);
					if ( isset( $shortcode['all_members'] ) ) {
						// Sanitize URL safely.
						$url = ! empty( $shortcode['image'] ) ? esc_url_raw( $shortcode['image'] ) : '';

						if ( $url ) {
							// Insert attachment ID from sanitized URL.
							$thumb_id = $this->insert_attachment_from_url( $url, absint( $new_shortcode_id ) );

							if ( $thumb_id ) {
								// Always sanitize integer IDs.
								$shortcode['meta']['_thumbnail_id'] = absint( $thumb_id );
							}
						}
					}
					if ( is_wp_error( $new_shortcode_id ) ) {
						throw new \Exception( $new_shortcode_id->get_error_message() );
					}

					if ( isset( $shortcode['meta'] ) && is_array( $shortcode['meta'] ) ) {
						foreach ( $shortcode['meta'] as $key => $value ) {
							// meta key.
							$meta_key = sanitize_key( $key );
							// meta value.
							$meta_value = maybe_unserialize( str_replace( '{#ID#}', $new_shortcode_id, $value ) );
							// update post meta.
							update_post_meta( $new_shortcode_id, $meta_key, $meta_value );
						}
					}
				} catch ( \Exception $e ) {
					array_push( $errors[ $index ], $e->getMessage() );

					// If there was a failure somewhere, clean up.
					if ( $new_shortcode_id > 0 ) {
						wp_trash_post( $new_shortcode_id );
					}
				}

				// If no errors, remove the index.
				if ( ! count( $errors[ $index ] ) ) {
					unset( $errors[ $index ] );
				}

				// External modules manipulate data here.
				do_action( 'sp_wp_team_shortcode_imported', $new_shortcode_id );
			}

			$errors = reset( $errors );
			return isset( $errors[0] ) ? new \WP_Error( 'import_shortcode_error', $errors[0] ) : $sptp_post_type;
		}

		/**
		 * Import Accordions by ajax.
		 *
		 * @return void
		 */
		public function import_shortcodes() {
			$nonce = ( ! empty( $_POST['nonce'] ) ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
			if ( ! wp_verify_nonce( $nonce, 'spf_options_nonce' ) ) {
				wp_send_json_error( array( 'error' => esc_html__( 'Invalid nonce', 'team-free' ) ) );
			}

			$_capability = apply_filters( 'sp_team_import_export_capabilities', 'manage_options' );
			if ( ! current_user_can( $_capability ) ) {
				wp_send_json_error( array( 'error' => esc_html__( 'You do not have permission to import.', 'team-free' ) ) );
			}

			// Get and validate input data.
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$data = isset( $_POST['shortcode'] ) ? wp_kses_post_deep( wp_unslash( $_POST['shortcode'] ) ) : '';
			if ( ! $data ) {
				wp_send_json_error( array( 'message' => esc_html__( 'Nothing to import.', 'team-free' ) ), 400 );
			}

			// Decode JSON with error checking.
			$decoded_data = json_decode( $data, true );
			if ( is_string( $decoded_data ) ) {
				$decoded_data = json_decode( $decoded_data, true );
			}

			if ( json_last_error() !== JSON_ERROR_NONE ) {
				wp_send_json_error(
					array(
						'message' => esc_html__( 'Invalid JSON data.', 'team-free' ),
					),
					400
				);
			}

			// Validate expected structure.
			if ( ! isset( $decoded_data['shortcode'] ) || ! is_array( $decoded_data['shortcode'] ) ) {
				wp_send_json_error(
					array(
						'message' => esc_html__( 'Invalid shortcode data structure.', 'team-free' ),
					),
					400
				);
			}

			$shortcodes = map_deep(
				$decoded_data['shortcode'],
				function ( $value ) {
					return is_string( $value ) ? wp_kses_post( $value ) : $value;
				}
			);

			// Import.
			$status = $this->import( $shortcodes );

			if ( is_wp_error( $status ) ) {
				wp_send_json_error(
					array(
						'message' => esc_html( $status->get_error_message() ),
					),
					400
				);
			}

			wp_send_json_success( $status, 200 );
		}
	}
}
