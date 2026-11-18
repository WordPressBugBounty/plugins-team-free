<?php
/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    WP_Team_free
 * @subpackage WP_Team_free/src
 * @author     ShapedPlugin <support@shapedplugin.com>
 */

namespace ShapedPlugin\WPTeam\Frontend;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The Helper class to manage all public facing stuffs.
 *
 * @since 2.1.0
 */
class Helper {
	/**
	 * Custom Template locator.
	 *
	 * @param  mixed $template_name template name.
	 * @param  mixed $template_path template path.
	 * @param  mixed $default_path default path.
	 * @return string
	 */
	public static function sptp_locate_template( $template_name, $template_path = '', $default_path = '' ) {
		if ( ! $template_path ) {
			$template_path = 'team-free/templates';
		}
		if ( ! $default_path ) {
			$default_path = SPT_PLUGIN_PATH . 'src/Frontend/templates/';
		}
		$template = locate_template( trailingslashit( $template_path ) . $template_name );
		// Get default template.
		if ( ! $template ) {
			$template = $default_path . $template_name;
		}
		// Return what we found.
		return $template;
	}

	/**
	 * Member job position
	 *
	 * @param  mixed $member_info member information.
	 * @param  mixed $show_member_position show/hide job position.
	 * @param  mixed $member_id item id.
	 * @return void
	 */
	public static function member_job_title( $member_info, $show_member_position, $member_id ) {
		$member_job_title = \ShapedPlugin\WPTeam\Admin\Taxonomies\Taxonomies::designation( $member_id, isset( $member_info['sptp_job_title'] ) ? $member_info['sptp_job_title'] : '' );
		if ( ( '' !== $member_job_title ) && ( $show_member_position ) ) {
			$cache_key   = 'sptp_member_job_title' . $member_id . SPT_PLUGIN_VERSION;
			$cached_data = self::sptp_get_transient( $cache_key );
			if ( false !== $cached_data ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo $cached_data;
			} else {
				ob_start();
				include self::sptp_locate_template( 'member/job_title.php' );
				$member_job_title = apply_filters( 'sptp_member_job_title', ob_get_clean() );
				self::sptp_set_transient( $cache_key, $member_job_title );
				echo wp_kses_post( $member_job_title );
			}
		}
	}

	/**
	 * View preloader
	 *
	 * @param  mixed $preloader Show/hide preloader.
	 * @return void
	 */
	public static function sptp_preloader( $preloader ) {
		ob_start();
		include self::sptp_locate_template( 'preloader.php' );
		$preloader = apply_filters( 'sptp_preloader', ob_get_clean() );
		echo wp_kses_post( $preloader );
	}

	/**
	 * Section title.
	 *
	 * @param  string $title section title.
	 * @param  mixed  $generator_id shortcode id.
	 * @param  mixed  $settings settings array.
	 * @return void
	 */
	public static function sptp_section_title( $title, $generator_id, $settings ) {
		$title         = apply_filters( 'sptp_section_title_text', $title );
		$section_title = isset( $settings['style_title'] ) ? $settings['style_title'] : true;
		if ( ! empty( $title ) && $section_title ) {
			$cache_key   = 'sptp_section_title_id' . $generator_id . SPT_PLUGIN_VERSION;
			$cached_data = self::sptp_get_transient( $cache_key );
			if ( false !== $cached_data ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo $cached_data;
			} else {
				ob_start();
				include self::sptp_locate_template( 'section-title.php' );
				$main_section_title = apply_filters( 'spteam_section_title', ob_get_clean() );
				self::sptp_set_transient( $cache_key, $main_section_title );
				echo wp_kses_post( $main_section_title );
			}
		}
	}

	/**
	 * Member social icon.
	 *
	 * @param  mixed $member_info member information.
	 * @param  mixed $show_member_social show/hide social.
	 * @param  mixed $social_icon_shape icon shape.
	 * @param  mixed $sptp_no_follow add nofollow rel to link.
	 * @param  mixed $member_id item id.
	 * @return void
	 */
	public static function member_social( $member_info, $show_member_social, $social_icon_shape, $sptp_no_follow, $member_id ) {
		if ( isset( $member_info['sptp_member_social'] ) && ! empty( $member_info['sptp_member_social'][0]['social_group'] ) && ( $show_member_social ) ) {
			// The key carries every input that changes the markup: icon shape and
			// the nofollow flag, else one cached version would serve both.
			$cache_key   = 'sptp_member_social' . $member_id . $social_icon_shape . ( $sptp_no_follow ? '_nf' : '' ) . SPT_PLUGIN_VERSION;
			$cached_data = self::sptp_get_transient( $cache_key );
			if ( false !== $cached_data ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo $cached_data;
			} else {
				$no_follow_text = $sptp_no_follow ? ' rel="nofollow"' : '';
				ob_start();
				include self::sptp_locate_template( 'member/social.php' );
				$member_social = apply_filters( 'spteam_member_social', ob_get_clean() );
				self::sptp_set_transient( $cache_key, $member_social );
				echo wp_kses_post( $member_social );
			}
		}
	}

	/**
	 * Member skill-bar.
	 *
	 * @param  mixed $member_info member information.
	 * @param  mixed $show_member_skill show/hide skill-bar.
	 * @param  mixed $member_id item id.
	 * @return void
	 */
	public static function member_skill( $member_info, $show_member_skill, $member_id ) {
		if ( isset( $member_info['sptp_skills'] ) && ! empty( $member_info['sptp_skills'][0]['sptp_skill_name'] ) && ( $show_member_skill ) ) {
			$cache_key   = 'sptp_member_skill' . $member_id . SPT_PLUGIN_VERSION;
			$cached_data = self::sptp_get_transient( $cache_key );
			if ( ! $cached_data ) {
				ob_start();
				include self::sptp_locate_template( 'member/skill.php' );
				$cached_data = apply_filters( 'sptp_member_skill', ob_get_clean() );
				self::sptp_set_transient( $cache_key, $cached_data );
			}
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $cached_data;
		}
	}

	/**
	 * Member description.
	 *
	 * @param  mixed  $member_info member information.
	 * @param  mixed  $show_member_bio show/hide description.
	 * @param  mixed  $member member object.
	 * @param  string $biography_type member biography type.
	 * @return void
	 */
	public static function member_description( $member_info, $show_member_bio, $member, $biography_type ) {

		if ( $show_member_bio ) {
			// One cached text per bio type (Short / Full / Any is a per-shortcode
			// setting), so a Short grid and a Full one on the same site never
			// serve each other's text.
			$cache_key = 'sptp_member_description' . $member->ID . '_' . sanitize_key( (string) $biography_type ) . SPT_PLUGIN_VERSION;

			// A password-protected body stays behind the password, as core's
			// the_content() does: only the short bio shows, and nothing is read
			// from or written to the cache, so a cached full body never leaks.
			$is_protected = post_password_required( $member );
			if ( $is_protected ) {
				$biography_type = 'short-bio';
			}

			$cached_data = $is_protected ? false : self::sptp_get_transient( $cache_key );

			if ( ! $cached_data ) {
				$short_bio = isset( $member_info['sptp_short_bio'] ) ? $member_info['sptp_short_bio'] : '';
				switch ( $biography_type ) {
					case 'short-bio':
						$cached_data = $short_bio;
						break;
					case 'full-bio':
						$full_bio    = get_post_field( 'post_content', $member->ID );
						$cached_data = $full_bio;
						break;
					case 'any-bio':
						$full_bio    = get_post_field( 'post_content', $member->ID );
						$cached_data = empty( $short_bio ) ? $full_bio : $short_bio;
						break;
				}
				if ( ! $is_protected ) {
					self::sptp_set_transient( $cache_key, $cached_data );
				}
			}
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			$description  = $cached_data;
			$description  = apply_filters( 'sptp_member_content', $description );
			$allowed_html = self::sptp_allowed_html();
			ob_start();
			include self::sptp_locate_template( 'member/description.php' );
			$member_description = apply_filters( 'spteam_member_description', ob_get_clean() );
			echo wp_kses_post( $member_description );
		}
	}

	/**
	 * Renders a hierarchical team member tree node in HTML.
	 *
	 * Recursively generates an organizational chart node, including member details and nested children.
	 *
	 * @param array  $node                   Node data with at least 'id' and optional 'children'.
	 * @param array  $filter_members       Array of team members, each an object with member details.
	 * @param string $generator_id           shortcode id for the current chart.
	 * @param array  $layout         Layout meta field data.
	 * @param array  $settings               Configuration settings for chart rendering.
	 * @param array  $sptp_settings               Configuration settings for global options.
	 * @param int    $rendered_count         Members rendered so far in this chart, shared by the recursive calls.
	 * @return void
	 */
	public static function render_tree_node( $node, $filter_members, $generator_id, $layout, $settings, $sptp_settings, &$rendered_count = 0 ) {

		if ( $rendered_count >= 9 ) {
			return;
		}

		include 'partials/settings.php';
		$selected_id = isset( $node['id'] ) ? (int) $node['id'] : 0;
		$children    = ! empty( $node['children'] ) && is_array( $node['children'] ) ? $node['children'] : array();

		$member = $selected_id ? get_post( $selected_id ) : null;
		// A chart keeps the IDs it was saved with: a member drafted, made
		// private or trashed since then must drop out, as from the grid query.
		$has_member = $member && 'sptp_member' === $member->post_type && ( is_post_publicly_viewable( $member ) || current_user_can( 'read_post', $member->ID ) );

		// A node saved without a member would render an empty box: lift its children to this level instead.
		if ( ! $has_member ) {
			foreach ( $children as $child ) {
				self::render_tree_node( $child, $filter_members, $generator_id, $layout, $settings, $sptp_settings, $rendered_count );
			}
			return;
		}

		echo '<li>';
		echo '<div class="sp-team-member-tree-node">';
		echo '<div class="sp-team-pro-item" data-member="' . esc_attr( $member->ID ) . '">';
		include self::sptp_locate_template( 'member.php' );
		echo '</div>';
		echo '</div>';

		// Count only a member actually rendered: the Free cap is 9 members per chart.
		++$rendered_count;
		if ( $rendered_count >= 9 ) {
			echo '</li>';
			return;
		}

		ob_start();
		foreach ( $children as $child ) {
			self::render_tree_node( $child, $filter_members, $generator_id, $layout, $settings, $sptp_settings, $rendered_count );
		}
		$children_html = ob_get_clean();
		if ( '' !== trim( $children_html ) ) {
			echo '<ul>' . $children_html . '</ul>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the recursive render.
		}
		echo '</li>';
	}

	/**
	 * Member name.
	 *
	 * @param  mixed $member member object.
	 * @param  mixed $show_member_name show/hide name.
	 * @return void
	 */
	public static function member_name( $member, $show_member_name ) {
		$cache_key   = 'sptp_member_name' . $member->ID . SPT_PLUGIN_VERSION;
		$cached_data = self::sptp_get_transient( $cache_key );
		if ( ( ! empty( $member->post_title ) ) && $show_member_name ) {
			if ( false !== $cached_data ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo $cached_data;
			} else {
				ob_start();
				include self::sptp_locate_template( 'member/name.php' );
				$member_name = apply_filters( 'spteam_member_name', ob_get_clean() );
				self::sptp_set_transient( $cache_key, $member_name );
				echo wp_kses_post( $member_name );
			}
		}
	}

	/**
	 * Custom set transient
	 *
	 * @param  mixed $cache_key Key.
	 * @param  mixed $cache_data data.
	 * @return void
	 */
	private static function sptp_set_transient( $cache_key, $cache_data ) {
		$sptp_settings  = get_option( '_sptp_settings' );
		$sptp_use_cache = isset( $sptp_settings['sptp_use_cache'] ) ? $sptp_settings['sptp_use_cache'] : true;
		if ( $sptp_use_cache && ! is_admin() ) {
			if ( is_multisite() ) {
				set_site_transient( $cache_key, $cache_data, SPT_TRANSIENT_EXPIRATION );
			} else {
				set_transient( $cache_key, $cache_data, SPT_TRANSIENT_EXPIRATION );
			}
		}
	}

	/**
	 * Custom get transient.
	 *
	 * @param  mixed $cache_key Cache key.
	 * @return content
	 */
	private static function sptp_get_transient( $cache_key ) {

		$sptp_settings  = get_option( '_sptp_settings' );
		$sptp_use_cache = isset( $sptp_settings['sptp_use_cache'] ) ? $sptp_settings['sptp_use_cache'] : true;
		if ( ! $sptp_use_cache || is_admin() ) {
			return false;
		}
		if ( is_multisite() ) {
			$cached_data = get_site_transient( $cache_key );
		} else {
			$cached_data = get_transient( $cache_key );
		}
		return $cached_data;
	}

	/**
	 * Member Image
	 *
	 * @param  mixed $member_image_attr image attr.
	 * @param  mixed $settings shortcode array.
	 * @param  mixed $member member object.
	 * @param  mixed $generator_id shortcode id.
	 * @param  mixed $layout_preset layout.
	 * @param  mixed $image_alt image alter text.
	 * @return void
	 */
	public static function member_image( $member_image_attr, $settings, $member, $generator_id, $layout_preset, $image_alt ) {
		$style_members = isset( $settings['style_members'] ) ? $settings['style_members'] : '';
		$image_on_off  = isset( $settings['image_on_off'] ) ? $settings['image_on_off'] : '';
		$cache_key     = 'sptp_member_image' . $member->ID . $generator_id . $layout_preset . SPT_PLUGIN_VERSION;
		$cached_data   = self::sptp_get_transient( $cache_key );
		if ( ! empty( $member_image_attr['src'] ) && ( is_array( $style_members ) && $style_members['image_switch'] ) && $image_on_off ) {
			if ( false !== $cached_data && ! is_multisite() ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo $cached_data;
			} else {
				$page_link_type     = isset( $settings['link_detail_fields']['page_link_type'] ) ? $settings['link_detail_fields']['page_link_type'] : '';
				$nofollow_link      = isset( $settings['link_detail_fields']['nofollow_link'] ) ? $settings['link_detail_fields']['nofollow_link'] : false;
				$nofollow_link_text = $nofollow_link ? 'rel=nofollow' : '';
				$new_page_target    = isset( $settings['link_detail_fields']['page_link_open'] ) ? $settings['link_detail_fields']['page_link_open'] : '';
				$image_shape        = isset( $settings['image_shape'] ) ? $settings['image_shape'] : '';
				$link_detail        = $settings['link_detail'] ? 'target="' . $new_page_target . '"' : '';
				$image_zoom         = isset( $settings['image_zoom'] ) ? $settings['image_zoom'] : '';
				$anchor_tag_param   = self::member_image_anchor_tag_parameter( $page_link_type, $member, $generator_id, $settings );
				ob_start();
				include self::sptp_locate_template( 'member/image.php' );
				$member_image = apply_filters( 'spteam_member_image', ob_get_clean() );
				self::sptp_set_transient( $cache_key, $member_image );
				echo wp_kses_post( $member_image );
			}
		}
	}

	/**
	 * Member image anchor tag_params
	 *
	 * @param  mixed $page_link_type details show type.
	 * @param  mixed $member member object.
	 * @param  mixed $generator_id Shortcode id.
	 * @param  mixed $settings shortcode settings.
	 * @return Array
	 */
	public static function member_image_anchor_tag_parameter( $page_link_type, $member, $generator_id, $settings ) {
		$member_avatar_class = '';
		$href                = 'javascript:void(0)';
		if ( $settings['link_detail'] && ( 'new_page' === $page_link_type ) ) {
			// $href = get_permalink( $member->ID ) . '?' . $rename_team_id . '=' . $generator_id;
			$href = get_permalink( $member->ID );
		}
		return array(
			'href'  => $href,
			'class' => $member_avatar_class,
		);
	}

	/**
	 * Minify output
	 *
	 * @param  string $html output minifier.
	 * @return statement
	 */
	public static function minify_output( $html ) {
		$html = preg_replace( '/<!--(?!s*(?:[if [^]]+]|!|>))(?:(?!-->).)*-->/s', '', $html );
		$html = str_replace( array( "\r\n", "\r", "\n", "\t" ), '', $html );
		while ( stristr( $html, '  ' ) ) {
			$html = str_replace( '  ', ' ', $html );
		}
		return $html;
	}

	/**
	 * Allowed html.
	 *
	 * @since 2.0
	 */
	public static function sptp_allowed_html() {
		$allowed_tags = array(
			'a'          => array(
				'class' => array(),
				'href'  => array(),
				'rel'   => array(),
				'title' => array(),
			),
			'abbr'       => array(
				'title' => array(),
			),
			'b'          => array(),
			'blockquote' => array(
				'cite' => array(),
			),
			'cite'       => array(
				'title' => array(),
			),
			'code'       => array(),
			'del'        => array(
				'datetime' => array(),
				'title'    => array(),
			),
			'dd'         => array(),
			'div'        => array(
				'class' => array(),
				'title' => array(),
				'style' => array(),
			),
			'br'         => array(),
			'dl'         => array(),
			'dt'         => array(),
			'em'         => array(),
			'h1'         => array(),
			'h2'         => array(),
			'h3'         => array(),
			'h4'         => array(),
			'h5'         => array(),
			'h6'         => array(),
			'i'          => array(),
			'img'        => array(
				'alt'    => array(),
				'class'  => array(),
				'height' => array(),
				'src'    => array(),
				'width'  => array(),
			),
			'li'         => array(
				'class' => array(),
			),
			'ol'         => array(
				'class' => array(),
			),
			'p'          => array(
				'class' => array(),
			),
			'q'          => array(
				'cite'  => array(),
				'title' => array(),
			),
			'span'       => array(
				'class' => array(),
				'title' => array(),
				'style' => array(),
			),
			'strike'     => array(),
			'strong'     => array(),
			'ul'         => array(
				'class' => array(),
			),
		);
		return $allowed_tags;
	}

	/**
	 * Get comma-separated designation names for a member post.
	 *
	 * @param int $post_id Post ID of the sptp_member.
	 * @return string Comma-separated term names or empty string.
	 */
	public static function get_designation_names( $post_id ) {
		$taxonomy = 'sptp_designation';

		// Get terms.
		$terms = wp_get_post_terms( $post_id, $taxonomy );

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return '';
		}

		// Extract term names and join with comma.
		$term_names = wp_list_pluck( $terms, 'name' );
		return implode( ', ', $term_names );
	}

	/**
	 * Member Image attrs
	 *
	 * @param  mixed $member member object.
	 * @param  mixed $image_size Image size.
	 * @param  mixed $image_id image id.
	 * @return void
	 */
	public static function get_sptp_member_image_attr( $member, $image_size, $image_id = '' ) {
		$image_size = ( 'custom' === $image_size ) ? 'full' : $image_size;
		$image      = '';
		if ( empty( $image_id ) ) {
			$image_id = '';
			if ( has_post_thumbnail( $member->ID ) ) {
				$image_id = get_post_thumbnail_id( $member->ID );
			}
			$member_placeholder_image_src = SPT_PLUGIN_ROOT . 'src/Frontend/img/Placeholder-Image.png';
			$member_placeholder_image_src = apply_filters( 'sptp_member_placeholder_image_src', $member_placeholder_image_src );
			// Get placeholder image.
			if ( ! $image_id && $member_placeholder_image_src ) {
				$image        = $member_placeholder_image_src;
				$image_width  = apply_filters( 'sptp_placeholder_image_width', 600 );
				$image_height = apply_filters( 'sptp_placeholder_image_height', 450 );
			}
		}
		// Get Featured or Gallery image.
		if ( $image_id ) {
				$image_src    = wp_get_attachment_image_src( $image_id, $image_size );
				$image_src    = is_array( $image_src ) ? $image_src : array( '', '', '' );
				$image        = $image_src[0];
				$image_width  = $image_src[1];
				$image_height = $image_src[2];
		}
		if ( ! $image ) {
			return;
		}
		return array(
			'src'    => $image,
			'width'  => $image_width,
			'height' => $image_height,
		);
	}

	/**
	 * Member single page css
	 *
	 * @return void
	 */
	public static function sp_team_free_single_css() {
		?>
		<style> .sptp-single-post{ max-width: 1000px; margin: auto; padding: 20px; } .sptp-list-style{ display: -ms-flexbox; display: -webkit-box; display: flex; -ms-flex-align: start; -webkit-box-align: start; align-items: flex-start; margin: 15px auto; } .sptp-list-style .sptp-member-avatar-area { margin-right: 25px; max-width: 400px; } .sptp-list-style .sptp-info { -ms-flex: 1; -webkit-box-flex: 1; flex: 1; }  /* Skill bars — Pro's single page defaults. */ .sptp-single-post .sptp-member-skill-bar-fields{ text-align: left; } .sptp-single-post .sptp-member-skill-progress{ padding-top: 6px; margin-top: 6px; margin-bottom: 12px; } .sptp-single-post .sptp-member-skill-progress .sptp-progress-text{ display: block; text-align: left; font-size: 13px; line-height: 24px; letter-spacing: 0; text-transform: none; } .sptp-single-post .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar.sptp-tooltip .sptp-top{ z-index: 99999999; } .sptp-single-post .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar.sptp-tooltip .sptp-top:before, .sptp-single-post .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar.sptp-tooltip .sptp-top:after{ top: 100%; left: 50%; border: solid transparent; content: ""; height: 0; position: absolute; pointer-events: none; } .sptp-single-post .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar.sptp-tooltip .sptp-top:before{ border-color: transparent; border-top-color: transparent; border-width: 8px; margin-left: -8px; } .sptp-single-post .sptp-member-skill-progress .sptp-progress-container .sptp-progress-bar.sptp-tooltip .sptp-top:after{ border-color: transparent; border-top-color: #559173; border-width: 6px; margin-left: -6px; } @media only screen and (max-width: 767px) { .sptp-list-style{ display: block; } .sptp-list-style .sptp-member-avatar-area { margin-bottom: 20px; margin-right: 0px; } } </style>
		<?php
	}

	/**
	 * Full html show.
	 *
	 * @param array $generator_id Shortcode ID.
	 * @param array $layout shows layout.
	 * @param array $settings get all options.
	 * @param array $main_section_title shows section title.
	 * @param array $is_not_preview preview or not.
	 */
	public static function sptp_html_show( $generator_id, $layout, $settings, $main_section_title, $is_not_preview = true ) {

		$page_link_type = isset( $settings['page_link_type'] ) ? $settings['page_link_type'] : '';
		$layout_preset  = isset( $layout['layout_preset'] ) ? $layout['layout_preset'] : 'carousel';

		include 'partials/settings.php';

		if ( ! empty( $layout_preset ) ) {
			switch ( $layout_preset ) {
				case 'carousel':
					if ( $sptp_swiper_js && $is_not_preview ) {
						wp_enqueue_script( 'team-free-swiper' );
					}
					include self::sptp_locate_template( 'carousel.php' );
					break;
				case 'list':
					include self::sptp_locate_template( 'list.php' );
					break;
				case 'filter':
					include self::sptp_locate_template( 'isotope.php' );
					break;
				case 'organization-chart':
					include self::sptp_locate_template( 'org-chart.php' );
					break;
				case 'grid':
				default:
					// A layout Free does not know (a Pro one) renders as the grid, never blank.
					include self::sptp_locate_template( 'grid.php' );
			}
		}
		if ( 'filter' === $layout_preset ) {
			wp_enqueue_script( 'team-free-isotope' );
		}
		wp_enqueue_script( SPT_PLUGIN_SLUG );
		// Same strip as on save: a stored `</script` must not close the inline tag.
		wp_add_inline_script( SPT_PLUGIN_SLUG, DashboardHelper::sanitize_custom_code( $sptp_custom_js ) );
	}
}
