<?php
/**
 * All functions that are used in the plugin.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'sptp_get_meta_icon_set' ) ) {
	/**
	 * Returns a test string.
	 *
	 * @param string $meta_icon_set The icon set to use.
	 * @return string
	 */
	function sptp_get_meta_icon_set( $meta_icon_set = 'fill' ) {

		// Determine the icon set to use based on the settings.
		switch ( $meta_icon_set ) {
			case 'thin':
				$meta_icon = 'thin-line';
				break;
			case 'line':
				$meta_icon = 'bold-line';
				break;
			default:
				$meta_icon = 'fill';
				break;
		}

		return $meta_icon;
	}
}

if ( ! function_exists( 'sptp_get_member_terms' ) ) {
	/**
	 * Get member terms for a specific taxonomy.
	 *
	 * @param int    $user_id User ID.
	 * @param string $taxonomy Taxonomy name.
	 * @return string
	 */
	function sptp_get_member_terms( $user_id, $taxonomy ) {
		if ( ! $user_id ) {
			return '';
		}

		// get_the_terms() reads the object-term cache, which WP_Query already
		// primes for the whole result set (one query covering every member and
		// every taxonomy of the post type). wp_get_object_terms() bypasses that
		// cache and re-queries on each call — with four taxonomies per member
		// that was five wasted queries per card on a grid.
		$terms = get_the_terms( $user_id, $taxonomy );

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			// Until the 4.0.0 DB updater has copied it, the designation is the legacy meta.
			if ( 'sptp_designation' === $taxonomy ) {
				$member_data = get_post_meta( $user_id, '_sptp_add_member', true );

				return ( is_array( $member_data ) && isset( $member_data['sptp_job_title'] ) ) ? (string) $member_data['sptp_job_title'] : '';
			}

			return '';
		}

		return implode( ', ', wp_list_pluck( $terms, 'name' ) );
	}
}
