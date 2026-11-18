<?php
/**
 * Keeps Pro member data intact when a member is saved in Free.
 *
 * The options framework rebuilds `_sptp_add_member` from an empty array on
 * every save, using only the fields Free declares. Free shows Pro's fields
 * locked — most as `disabled` inputs, which browsers never submit — so a save
 * would store '' over every Pro value and drop any key Free has no field for.
 * This filter turns that rebuild into a merge: Free's editable fields take the
 * submitted values; Pro-only fields and unknown keys keep what is stored, so
 * re-activating Pro restores the member byte for byte (CLAUDE.md, Fallback
 * contract; docs/pro-free-separation.md). It writes nothing itself — it only
 * shapes the array the framework is about to save.
 *
 * @package ShapedPlugin\WPTeam\Admin\Configs\Member
 */

namespace ShapedPlugin\WPTeam\Admin\Configs\Member;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Member meta save merge.
 */
class Member_Meta_Save {

	/**
	 * The member meta key (Pro's, shared).
	 */
	const META_KEY = '_sptp_add_member';

	/**
	 * Class marking a field Free shows locked (Member_Meta.php).
	 */
	const PRO_FIELD_CLASS = 'sptp_pro_only_field';

	/**
	 * Hook the merge into the framework's pre-save filter for the member metabox.
	 *
	 * @return void
	 */
	public static function register() {
		add_filter( 'spf_' . self::META_KEY . '_save', array( __CLASS__, 'preserve' ), 10, 3 );
	}

	/**
	 * Merge the submitted member data over what is stored.
	 *
	 * @param array  $data    Data the framework built from the request.
	 * @param int    $post_id Member post ID.
	 * @param object $metabox The framework metabox (exposes `sections`).
	 * @return array Data to save.
	 */
	public static function preserve( $data, $post_id, $metabox = null ) {
		$data = is_array( $data ) ? $data : array();

		// A revision's own meta is empty while core writes to the parent: read the parent.
		$parent_id = function_exists( 'wp_is_post_revision' ) ? wp_is_post_revision( $post_id ) : false;
		$post_id   = $parent_id ? $parent_id : $post_id;

		$stored = get_post_meta( $post_id, self::META_KEY, true );
		$stored = is_array( $stored ) ? $stored : array();

		$sections = is_object( $metabox ) && isset( $metabox->sections ) && is_array( $metabox->sections ) ? $metabox->sections : array();

		// A locked field is never edited in Free: keep the stored value (or none).
		foreach ( self::locked_field_ids( $sections ) as $field_id ) {
			if ( array_key_exists( $field_id, $stored ) ) {
				$data[ $field_id ] = $stored[ $field_id ];
			} else {
				unset( $data[ $field_id ] );
			}
		}

		$data = self::preserve_social_networks( $data, $stored );

		// Keys Free has no field for (Pro's own) survive as stored.
		return array_merge( $stored, $data );
	}

	/**
	 * Keep a social row's network when Free's select cannot show it.
	 *
	 * Free's network list is shorter than Pro's (GitHub, TikTok, …; Pro's
	 * Pinterest is `pinterest`, Free's `pinterest-p`). A stored network that is
	 * not one of Free's options renders with nothing selected, so the row comes
	 * back with `social_group` ''. Matched by link, not position, so a reordered
	 * or removed row cannot borrow another row's network.
	 *
	 * @param array $data   Data to save.
	 * @param array $stored Stored member data.
	 * @return array
	 */
	private static function preserve_social_networks( array $data, array $stored ) {
		if ( empty( $data['sptp_member_social'] ) || ! is_array( $data['sptp_member_social'] ) || empty( $stored['sptp_member_social'] ) || ! is_array( $stored['sptp_member_social'] ) ) {
			return $data;
		}

		$network_by_link = array();
		foreach ( $stored['sptp_member_social'] as $row ) {
			if ( is_array( $row ) && ! empty( $row['social_link'] ) && ! empty( $row['social_group'] ) ) {
				$network_by_link[ (string) $row['social_link'] ] = $row['social_group'];
			}
		}

		foreach ( $data['sptp_member_social'] as $index => $row ) {
			if ( ! is_array( $row ) || ! empty( $row['social_group'] ) || empty( $row['social_link'] ) ) {
				continue;
			}
			$link = (string) $row['social_link'];
			if ( isset( $network_by_link[ $link ] ) ) {
				$data['sptp_member_social'][ $index ]['social_group'] = $network_by_link[ $link ];
			}
		}

		return $data;
	}

	/**
	 * IDs of the fields Free shows locked: the Pro-only class, or a `disabled`
	 * input (which the browser never submits). Read from the field config, so a
	 * new Pro field is covered without a list to keep in step.
	 *
	 * @param array $sections Metabox sections.
	 * @return string[]
	 */
	public static function locked_field_ids( array $sections ) {
		$ids = array();

		foreach ( $sections as $section ) {
			$fields = isset( $section['fields'] ) && is_array( $section['fields'] ) ? $section['fields'] : array();

			foreach ( $fields as $field ) {
				if ( isset( $field['type'] ) && 'tabbed' === $field['type'] && ! empty( $field['tabs'] ) ) {
					foreach ( $field['tabs'] as $tab ) {
						$ids = array_merge( $ids, self::locked_ids_in( isset( $tab['fields'] ) ? (array) $tab['fields'] : array() ) );
					}
					continue;
				}

				$ids = array_merge( $ids, self::locked_ids_in( array( $field ) ) );
			}
		}

		return array_values( array_unique( $ids ) );
	}

	/**
	 * Locked field IDs in a flat list of fields.
	 *
	 * @param array $fields Fields.
	 * @return string[]
	 */
	private static function locked_ids_in( array $fields ) {
		$ids = array();

		foreach ( $fields as $field ) {
			if ( empty( $field['id'] ) ) {
				continue;
			}

			$classes  = isset( $field['class'] ) ? preg_split( '/\s+/', (string) $field['class'] ) : array();
			$is_pro   = in_array( self::PRO_FIELD_CLASS, $classes, true );
			$disabled = ! empty( $field['attributes']['disabled'] );

			if ( $is_pro || $disabled ) {
				$ids[] = (string) $field['id'];
			}
		}

		return $ids;
	}
}
