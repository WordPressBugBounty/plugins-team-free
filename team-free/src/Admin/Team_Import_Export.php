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
							$terms             = get_the_terms( $shortcode->ID, 'sptp_group' );
							$designation_terms = get_the_terms( $shortcode->ID, 'sptp_designation' );
							$shortcode_export  = array(
								'title'       => $shortcode->post_title,
								'original_id' => $shortcode->ID,
								'content'     => $shortcode->post_content,
								'image'       => get_the_post_thumbnail_url( $shortcode->ID, 'single-post-thumbnail' ),
								'category'    => $terms,
								'designation' => $designation_terms,
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
		 * Unserialize one imported meta value.
		 *
		 * Only stdClass is allowed (page builders such as Beaver Builder store their
		 * layout as stdClass objects; it has no magic methods, so it cannot run code).
		 * Any other class would come back as __PHP_Incomplete_Class, which fatals the
		 * moment map_deep() writes to it — such a value is dropped instead.
		 *
		 * @param string $value Serialized meta value.
		 * @return mixed|null The value, or null when it cannot be imported safely.
		 */
		public static function unserialize_meta( $value ) {
			$data = @unserialize( $value, array( 'allowed_classes' => array( 'stdClass' ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_unserialize, WordPress.PHP.NoSilencedErrors.Discouraged -- only stdClass allowed; @ silences a malformed-string notice.
			if ( false === $data && 'b:0;' !== $value ) {
				return null;
			}
			return self::is_unsafe_value( $data ) ? null : $data;
		}

		/**
		 * Whether an unserialized value cannot be imported safely: it holds a class that
		 * was not allowed, refers back to itself (map_deep() and core's slashing would
		 * recurse forever), or nests deeper than any real meta value.
		 *
		 * @param mixed $data  Unserialized value.
		 * @param array $seen  Object ids already visited.
		 * @param int   $depth Current nesting depth.
		 * @return bool
		 */
		private static function is_unsafe_value( $data, &$seen = array(), $depth = 0 ) {
			if ( $data instanceof \__PHP_Incomplete_Class || $depth > 64 ) {
				return true;
			}
			if ( is_object( $data ) ) {
				$id = spl_object_id( $data );
				if ( isset( $seen[ $id ] ) ) {
					return true;
				}
				$seen[ $id ] = true;
			}
			if ( is_array( $data ) || is_object( $data ) ) {
				foreach ( $data as $item ) {
					if ( self::is_unsafe_value( $item, $seen, $depth + 1 ) ) {
						return true;
					}
				}
			}
			return false;
		}

		/**
		 * Insert an attachment from an URL address.
		 *
		 * @param  String $url remote url.
		 * @param  Int    $parent_post_id parent post id.
		 * @return Int    Attachment ID
		 */
		public function insert_attachment_from_url( $url, $parent_post_id = null ) {

			// Only plain http(s) image URLs; anything else is not an export of ours.
			$original_url = (string) $url;
			$url          = esc_url_raw( $original_url, array( 'http', 'https' ) );
			if ( '' === $url ) {
				return false;
			}
			// Title from the URL as exported (as before), so the duplicate check below
			// still finds an image imported earlier.
			$attachment_title = sanitize_file_name( pathinfo( $original_url, PATHINFO_FILENAME ) );
			// Does the attachment already exist ?
			if ( post_exists( $attachment_title, '', '', 'attachment' ) ) {
				$attachment = $this->sp_team_get_page_by_title( $attachment_title, OBJECT, 'attachment' );

				if ( ! empty( $attachment ) ) {
					$attachment_id = absint( $attachment->ID );
					return $attachment_id;
				}
			}
			$remote_type = wp_check_filetype( basename( (string) wp_parse_url( $url, PHP_URL_PATH ) ) );
			if ( empty( $remote_type['type'] ) || 0 !== strpos( $remote_type['type'], 'image/' ) ) {
				return false;
			}
			// wp_safe_remote_get() refuses local, private and reserved hosts, so an
			// imported file cannot point the server at an internal address.
			$response = wp_safe_remote_get( $url, array( 'timeout' => 30 ) );
			if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
				return false;
			}
			$upload = wp_upload_bits( basename( (string) wp_parse_url( $url, PHP_URL_PATH ) ), null, wp_remote_retrieve_body( $response ) );
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
			// Imported text is always run through kses, as in Real Testimonials Free; a site that
			// trusts its import files can opt out with this filter (shared with the other edition).
			$allow_tags = (bool) apply_filters( 'sp_team_allow_import_tags', false );
			foreach ( $shortcodes as $index => $shortcode ) {
				$errors[ $index ] = array();
				$new_shortcode_id = 0;
				$sptp_post_type   = isset( $shortcode['all_members'] ) ? 'sptp_member' : 'sptp_generator';
				try {
					$new_shortcode_id = wp_insert_post(
						array(
							'post_title'   => isset( $shortcode['title'] ) ? wp_slash( sanitize_text_field( (string) $shortcode['title'] ) ) : '',
							'post_content' => isset( $shortcode['content'] ) ? wp_slash( $allow_tags ? (string) $shortcode['content'] : wp_kses_post( (string) $shortcode['content'] ) ) : '',
							'post_status'  => 'publish',
							'post_type'    => $sptp_post_type,
						),
						true
					);
					if ( isset( $shortcode['all_members'] ) ) {

						// Define the taxonomies to import and their shortcode keys.
						$taxonomies_to_import = array(
							'category'    => 'sptp_group',
							'designation' => 'sptp_designation',
						);

						foreach ( $taxonomies_to_import as $shortcode_key => $taxonomy ) {
							$items = isset( $shortcode[ $shortcode_key ] ) ? $shortcode[ $shortcode_key ] : array();
							if ( is_array( $items ) && ! empty( $items ) ) {
								$terms_id = array();
								foreach ( $items as $item ) {
									$name        = isset( $item['name'] ) ? $item['name'] : '';
									$slug        = isset( $item['slug'] ) ? $item['slug'] : '';
									$description = isset( $item['description'] ) ? (string) $item['description'] : '';
									$description = $allow_tags ? $description : wp_kses_post( $description );

									// term_exists() matches the slug or the name and returns that
									// term's ID; a separate slug-only lookup could come back false.
									$existing = '' !== $slug ? term_exists( $slug, $taxonomy ) : null;
									if ( $existing ) {
										$terms_id[] = (int) ( is_array( $existing ) ? $existing['term_id'] : $existing );
									} else {
										$term_data = wp_insert_term(
											$name,
											$taxonomy,
											array(
												'slug' => $slug,
												'description' => $description,
											)
										);
										if ( ! is_wp_error( $term_data ) ) {
											$terms_id[] = $term_data['term_id'];
										}
									}
								}
								if ( ! empty( $terms_id ) ) {
									wp_set_post_terms( $new_shortcode_id, $terms_id, $taxonomy );
								}
							}
						}

						// Insert featured image.
						$url = isset( $shortcode['image'] ) && ! empty( $shortcode['image'] ) ? $shortcode['image'] : '';
						if ( $url ) {
							// Insert attachment ID from sanitized URL.
							$thumb_id = $this->insert_attachment_from_url( $url, absint( $new_shortcode_id ) );

							if ( $thumb_id ) {
								// Always sanitize integer IDs.
								$shortcode['meta']['_thumbnail_id'] = absint( $thumb_id );
							} else {
								// The exported ID belongs to the source site; here it would point
								// at an unrelated attachment.
								unset( $shortcode['meta']['_thumbnail_id'] );
							}
						}
					}
					if ( is_wp_error( $new_shortcode_id ) ) {
						throw new \Exception( $new_shortcode_id->get_error_message() );
					}

					if ( isset( $shortcode['meta'] ) && is_array( $shortcode['meta'] ) ) {
						// Unserialize before sanitizing: kses on a serialized string changes
						// its byte counts and makes it unreadable.
						foreach ( $shortcode['meta'] as $key => $value ) {
							if ( is_string( $value ) && is_serialized( $value ) ) {
								$value = self::unserialize_meta( $value );
								if ( null === $value ) {
									continue;
								}
							}
							$value = map_deep(
								$value,
								static function ( $leaf ) use ( $new_shortcode_id, $allow_tags ) {
									if ( ! is_string( $leaf ) ) {
										return $leaf;
									}
									$leaf = str_replace( '{#ID#}', (string) $new_shortcode_id, $leaf );
									// Slashed here, not with wp_slash(): wp_slash() skips objects but
									// update_post_meta()'s unslash does not, so object strings would lose backslashes.
									return addslashes( $allow_tags ? $leaf : wp_kses_post( $leaf ) );
								}
							);
							// add_post_meta(), not update_post_meta(): for a new key the latter unslashes
							// twice, and objects (unlike arrays) are unslashed in place both times.
							delete_post_meta( $new_shortcode_id, sanitize_key( $key ) );
							add_post_meta( $new_shortcode_id, sanitize_key( $key ), $value, true );
						}
					}
				} catch ( \Throwable $e ) {
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

			// Sanitized per field inside import(): kses here would run on the raw JSON and on
			// still-serialized meta, corrupting its byte counts.
			$data = isset( $_POST['shortcode'] ) ? wp_unslash( $_POST['shortcode'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$data = is_string( $data ) ? $data : '';
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

			$status = $this->import( $decoded_data['shortcode'] );

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
