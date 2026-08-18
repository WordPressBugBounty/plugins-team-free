<?php
/**
 * The plugin gutenberg block Initializer.
 *
 * @link       https://shapedplugin.com/
 * @since      2.1.8
 *
 * @package    WP_Team
 * @subpackage WP_Team/Admin
 * @author     ShapedPlugin <support@shapedplugin.com>
 */

namespace ShapedPlugin\WPTeam\Admin\GutenbergBlock;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WP_Team_Gutenberg_Block_Init' ) ) {
	/**
	 * Team_Pro_Gutenberg_Block_Init class.
	 */
	class WP_Team_Gutenberg_Block_Init {
		/**
		 * Custom Gutenberg Block Initializer.
		 */
		public function __construct() {
			add_action( 'init', array( $this, 'sptf_gutenberg_shortcode_block' ) );
			add_action( 'enqueue_block_editor_assets', array( $this, 'sptf_block_editor_assets' ) );
			add_action( 'enqueue_block_assets', array( $this, 'sptf_block_canvas_assets' ) );
		}

		/**
		 * Register block editor script for backend.
		 *
		 * This only runs for the outer editor document. Since WordPress 6.3 the block
		 * canvas is an iframe and WordPress 7.1 iframes it unconditionally, so anything
		 * the rendered team needs is enqueued in `sptf_block_canvas_assets()` instead.
		 */
		public function sptf_block_editor_assets() {
			$asset_file = plugin_dir_path( __FILE__ ) . 'build/index.asset.php';
			$asset      = file_exists( $asset_file ) ? require $asset_file : array();

			$dependencies = isset( $asset['dependencies'] ) ? $asset['dependencies'] : array(
				'wp-block-editor',
				'wp-blocks',
				'wp-components',
				'wp-element',
				'wp-escape-html',
				'wp-i18n',
				'wp-server-side-render',
			);
			$version      = isset( $asset['version'] ) ? $asset['version'] : SPT_PLUGIN_VERSION;

			wp_enqueue_script(
				'team-free-shortcode-block',
				plugins_url( '/GutenbergBlock/build/index.js', __DIR__ ),
				$dependencies,
				$version,
				true
			);

			wp_localize_script(
				'team-free-shortcode-block',
				'TeamFreeGbScript',
				array(
					'loodScript'    => SPT_PLUGIN_ROOT . 'src/Frontend/js/script.js',
					'path'          => SPT_PLUGIN_ROOT,
					'url'           => admin_url( 'post-new.php?post_type=sptp_generator' ),
					'shortCodeList' => $this->sptf_post_list(),
				)
			);

			/**
			 * Register block editor css file enqueue for backend.
			 *
			 * Kept for WordPress versions that still render the canvas in the same
			 * document as the editor chrome.
			 */
			wp_enqueue_style( 'team-free-swiper' );
			wp_enqueue_style( 'team-free-fontawesome' );
			wp_enqueue_style( 'sptp-fontello-icon' );
			wp_enqueue_style( SPT_PLUGIN_SLUG );
		}

		/**
		 * Enqueue the team front-end assets for the block editor canvas.
		 *
		 * `enqueue_block_editor_assets` only reaches the outer editor document, while
		 * WordPress collects `enqueue_block_assets` output for the iframed canvas in
		 * `_wp_get_iframed_editor_assets()`. Registering them here is what puts the
		 * team CSS and Swiper in the same document as the markup `ServerSideRender`
		 * renders.
		 *
		 * The front end is untouched: there the shortcode keeps enqueueing assets on
		 * demand.
		 *
		 * @since 3.0.15
		 */
		public function sptf_block_canvas_assets() {
			if ( ! is_admin() ) {
				return;
			}

			wp_enqueue_style( 'team-free-swiper' );
			wp_enqueue_style( 'team-free-fontawesome' );
			wp_enqueue_style( 'sptp-fontello-icon' );
			wp_enqueue_style( SPT_PLUGIN_SLUG );

			wp_enqueue_script( 'team-free-swiper' );
			wp_enqueue_script( SPT_PLUGIN_SLUG );

			// The admin stylesheet is not loaded inside the canvas, so the block
			// placeholder select needs its own rules there.
			wp_add_inline_style(
				SPT_PLUGIN_SLUG,
				'.sptp-gutenberg-shortcode{padding:0;line-height:24px}.sptp-gutenberg-shortcode select.sptp-shortcode-selector{width:250px;padding:5px 24px 5px 5px;border:1px solid #ccc;font-size:13px}'
			);
		}

		/**
		 * Shortcode list.
		 *
		 * @return array
		 */
		public function sptf_post_list() {
			if ( ! is_admin() ) {
				return array();
			}
			$shortcodes = get_posts(
				array(
					'post_type'      => 'sptp_generator',
					'post_status'    => 'publish',
					'posts_per_page' => 9999,
				)
			);

			if ( count( $shortcodes ) < 1 ) {
				return array();
			}

			return array_map(
				function ( $shortcode ) {
						return (object) array(
							'id'    => absint( $shortcode->ID ),
							'title' => esc_html( $shortcode->post_title ),
						);
				},
				$shortcodes
			);
		}

		/**
		 * Register Gutenberg shortcode block.
		 */
		public function sptf_gutenberg_shortcode_block() {
			/**
			 * Register Gutenberg block on server-side.
			 */
			register_block_type(
				'sp-team-pro/shortcode',
				array(
					// Block API v3 tells WordPress the block is safe to render inside the
					// iframed editor canvas. See the Block API versions handbook page.
					'api_version'     => 3,
					'attributes'      => array(
						'shortcode'          => array(
							'type'    => 'string',
							'default' => '',
						),
						'showInputShortcode' => array(
							'type'    => 'boolean',
							'default' => true,
						),
						'is_admin'           => array(
							'type'    => 'boolean',
							'default' => is_admin(),
						),
						'preview'            => array(
							'type'    => 'boolean',
							'default' => false,
						),
					),
					'example'         => array(
						'attributes' => array(
							'preview' => true,
						),
					),
					// Enqueue blocks.editor.build.css in the editor only.
					'editor_style'    => array(),
					'render_callback' => array( $this, 'sp_team_free_render_shortcode' ),
				)
			);
		}

		/**
		 * Render callback.
		 *
		 * @param string $attributes Shortcode.
		 * @return string
		 */
		public function sp_team_free_render_shortcode( $attributes ) {
			if ( is_null( $attributes['shortcode'] ) || '' === $attributes['shortcode'] ) {
				return '<i></i>';
			}
			$class_name = '';
			if ( ! empty( $attributes['className'] ) ) {
				$class_name = 'class="' . esc_attr( $attributes['className'] ) . '"';
			}
			if ( empty( $attributes['is_admin'] ) ) {
				return '<div ' . $class_name . ' >' . do_shortcode( '[wpteam id="' . sanitize_text_field( $attributes['shortcode'] ) . '"]' ) . '</div>';
			}
			$edit_page_link = get_edit_post_link( sanitize_text_field( $attributes['shortcode'] ) );

			return '<div id="' . uniqid() . '"><a href="' . esc_url( $edit_page_link ) . '" target="_blank" class="sp_wp_team_block_edit_button">Edit View</a>' . do_shortcode( '[wpteam id="' . sanitize_text_field( $attributes['shortcode'] ) . '"]' ) . '</div>';
		}
	}
}
