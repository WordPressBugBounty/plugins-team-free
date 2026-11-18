<?php
/**
 * ShapedPlugin's other free plugins — the Our Plugins page's install cards.
 *
 * Reads the plugin cards from WordPress.org's own plugin directory (`plugins_api()`, cached for 24h) and works
 * out each one's install state. Installing and activating are left to core: the returned links point at
 * `update.php?action=install-plugin` and `plugins.php?action=activate`, which do their own nonce and
 * capability checks, so this class never installs anything itself.
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

defined( 'ABSPATH' ) || exit;

/**
 * Class OurPlugins
 */
class OurPlugins {

	/**
	 * Transient holding the directory data (never the per-site install state).
	 *
	 * @var string
	 */
	const TRANSIENT = 'sptp_our_plugins_list';

	/**
	 * This plugin's own directory slug — left out of its own list.
	 *
	 * @var string
	 */
	const OWN_SLUG = 'team-free';

	/**
	 * The cards, with the install state of the current site.
	 *
	 * @return array[] One entry per plugin; empty when the directory could not be reached.
	 */
	public static function get() {
		$cards = array();

		foreach ( self::directory_data() as $plugin ) {
			$cards[] = self::with_state( $plugin );
		}

		return $cards;
	}

	/**
	 * Every plugin ShapedPlugin lists on WordPress.org except this one, most installed first — from the transient or a single `query_plugins` request.
	 *
	 * A failed request is remembered for 15 minutes so a flaky connection does not retry on every page view.
	 *
	 * @return array[]
	 */
	private static function directory_data() {
		$cached = get_transient( self::TRANSIENT );

		if ( is_array( $cached ) ) {
			return $cached;
		}

		if ( ! function_exists( 'plugins_api' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
		}

		$response = plugins_api(
			'query_plugins',
			array(
				'author'   => 'shapedplugin',
				'per_page' => 120,
				'page'     => 1,
				'fields'   => array(
					'short_description' => true,
					'icons'             => true,
					'active_installs'   => true,
					'last_updated'      => true,
					'rating'            => true,
					'num_ratings'       => true,
					'version'           => true,
				),
			)
		);

		if ( is_wp_error( $response ) || empty( $response->plugins ) ) {
			set_transient( self::TRANSIENT, array(), 15 * MINUTE_IN_SECONDS );
			return array();
		}

		$data = array();
		foreach ( (array) $response->plugins as $plugin ) {
			$plugin = (array) $plugin;
			if ( empty( $plugin['slug'] ) || self::OWN_SLUG === $plugin['slug'] ) {
				continue;
			}
			$data[] = self::normalize( $plugin );
		}

		usort(
			$data,
			static function ( $a, $b ) {
				return $b['activeInstalls'] <=> $a['activeInstalls'];
			}
		);

		set_transient( self::TRANSIENT, $data, DAY_IN_SECONDS );

		return $data;
	}

	/**
	 * Keep only the fields a card shows.
	 *
	 * @param array $plugin One `query_plugins` entry.
	 * @return array
	 */
	private static function normalize( $plugin ) {
		$icons = isset( $plugin['icons'] ) ? (array) $plugin['icons'] : array();
		$icon  = '';
		foreach ( array( '2x', '1x', 'default' ) as $size ) {
			if ( ! empty( $icons[ $size ] ) ) {
				$icon = $icons[ $size ];
				break;
			}
		}

		return array(
			'slug'             => sanitize_key( $plugin['slug'] ),
			'name'             => sanitize_text_field( wp_specialchars_decode( isset( $plugin['name'] ) ? $plugin['name'] : '' ) ),
			'description'      => sanitize_text_field( wp_specialchars_decode( isset( $plugin['short_description'] ) ? $plugin['short_description'] : '' ) ),
			'icon'             => esc_url_raw( $icon ),
			'version'          => sanitize_text_field( isset( $plugin['version'] ) ? $plugin['version'] : '' ),
			'rating'           => isset( $plugin['rating'] ) ? (int) $plugin['rating'] : 0,
			'numRatings'       => isset( $plugin['num_ratings'] ) ? (int) $plugin['num_ratings'] : 0,
			'activeInstalls'   => isset( $plugin['active_installs'] ) ? (int) $plugin['active_installs'] : 0,
			'lastUpdated'      => isset( $plugin['last_updated'] ) ? (int) strtotime( $plugin['last_updated'] ) : 0,
		);
	}

	/**
	 * Add the display strings and the install / activate state for the current site and user.
	 *
	 * @param array $plugin A normalized directory entry.
	 * @return array
	 */
	private static function with_state( $plugin ) {
		$slug = $plugin['slug'];
		$file = self::plugin_file( $slug );

		$status = 'not_installed';
		if ( '' !== $file ) {
			$status = is_plugin_active( $file ) ? 'active' : 'installed';
		}

		$install_url  = '';
		$activate_url = '';
		if ( 'not_installed' === $status && current_user_can( 'install_plugins' ) ) {
			$install_url = add_query_arg(
				array(
					'action'   => 'install-plugin',
					'plugin'   => $slug,
					'_wpnonce' => wp_create_nonce( 'install-plugin_' . $slug ),
				),
				self_admin_url( 'update.php' )
			);
		}
		if ( 'installed' === $status && current_user_can( 'activate_plugins' ) ) {
			$activate_url = add_query_arg(
				array(
					'action'   => 'activate',
					'plugin'   => $file,
					'_wpnonce' => wp_create_nonce( 'activate-plugin_' . $file ),
				),
				self_admin_url( 'plugins.php' )
			);
		}

		return array_merge(
			$plugin,
			array(
				'status'              => $status,
				'installUrl'          => $install_url,
				'activateUrl'         => $activate_url,
				'detailsUrl'          => 'https://wordpress.org/plugins/' . $slug . '/',
				'activeInstallsLabel' => self::installs_label( $plugin['activeInstalls'] ),
				'lastUpdatedLabel'    => self::updated_label( $plugin['lastUpdated'] ),
			)
		);
	}

	/**
	 * The `folder/main-file.php` of an installed plugin, or '' when it is not installed.
	 *
	 * @param string $slug Directory slug.
	 * @return string
	 */
	private static function plugin_file( $slug ) {
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		foreach ( array_keys( get_plugins() ) as $file ) {
			if ( 0 === strpos( $file, $slug . '/' ) ) {
				return $file;
			}
		}

		return '';
	}

	/**
	 * "70,000+ Active Installations".
	 *
	 * @param int $installs Active installs as the directory buckets them.
	 * @return string
	 */
	private static function installs_label( $installs ) {
		if ( $installs <= 0 ) {
			return '';
		}

		/* translators: %s: number of active installations, e.g. 70,000 */
		return sprintf( __( '%s+ Active Installations', 'team-free' ), number_format_i18n( $installs ) );
	}

	/**
	 * "2 months ago".
	 *
	 * @param int $timestamp Last-updated time.
	 * @return string
	 */
	private static function updated_label( $timestamp ) {
		if ( $timestamp <= 0 ) {
			return '';
		}

		/* translators: %s: time since the last update, e.g. 2 months */
		return sprintf( __( '%s ago', 'team-free' ), human_time_diff( $timestamp ) );
	}
}
