<?php
/**
 * The changelog shown in the dashboard's version drawer.
 *
 * Read from this plugin's WordPress.org listing (the same text the plugin page
 * shows), as WP Carousel Free and Real Testimonials Free do. Cached for a day;
 * a failed request is not cached. Disclosed in readme.txt and
 * docs/wordpress-org.md §3.
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

defined( 'ABSPATH' ) || exit;

/**
 * Class Changelog
 */
class Changelog {

	/**
	 * Transient holding the cached changelog HTML.
	 *
	 * @var string
	 */
	const TRANSIENT = 'sptp_changelogs';

	/**
	 * The WordPress.org plugin info endpoint for this plugin.
	 *
	 * @var string
	 */
	const API_URL = 'https://api.wordpress.org/plugins/info/1.0/team-free.json';

	/**
	 * The changelog as HTML.
	 *
	 * @return string Empty when WordPress.org is unreachable or lists no changelog.
	 */
	public static function get_html() {
		$cached = get_transient( self::TRANSIENT );
		if ( is_string( $cached ) && '' !== $cached ) {
			return $cached;
		}

		$response = wp_safe_remote_get( self::API_URL, array( 'timeout' => 15 ) );
		if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return '';
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $data ) || empty( $data['sections']['changelog'] ) || ! is_string( $data['sections']['changelog'] ) ) {
			return '';
		}

		$html = wp_kses_post( $data['sections']['changelog'] );
		set_transient( self::TRANSIENT, $html, DAY_IN_SECONDS );

		return $html;
	}
}
