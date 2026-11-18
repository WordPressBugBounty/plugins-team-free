<?php
/**
 * Keeps Pro generator settings intact when a classic Team Generator is saved in Free.
 *
 * Free and Pro store a generator's settings in the same post meta,
 * `_sptp_generator` and `_sptp_generator_layout`. The options framework
 * rebuilds that array from an empty one on every save, using only the fields
 * Free declares, so a Free save would lose what Pro stored:
 *
 * - `only_pro` fields, which the framework skips entirely;
 * - fields shown locked (the Pro class, or a `disabled` input the browser
 *   never submits), which come back as '' or not at all;
 * - a Pro choice in an image picker (an Accordion layout is a disabled
 *   radio), which comes back as '';
 * - keys Free has no field for, at the top level or inside a fieldset.
 *
 * This filter turns the rebuild into a merge, one level into fieldsets:
 * Free's editable fields take the submitted value (an empty one included, so a
 * multi-select can still be cleared), everything above keeps what is stored.
 * Re-activating Pro restores the generator byte for byte (CLAUDE.md, Fallback
 * contract). It writes nothing itself — it only shapes the array the framework
 * is about to save. Twin of Member\Member_Meta_Save for the member metabox.
 *
 * @package ShapedPlugin\WPTeam\Admin\Configs\Generator
 */

namespace ShapedPlugin\WPTeam\Admin\Configs\Generator;

use ShapedPlugin\WPTeam\Admin\Configs\Member\Member_Meta_Save;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Generator meta save merge.
 */
class Generator_Meta_Save {

	/**
	 * The two generator metaboxes (Pro's meta keys, shared).
	 */
	const META_KEYS = array( '_sptp_generator', '_sptp_generator_layout' );

	/**
	 * Hook the merge into the framework's pre-save filter of both metaboxes.
	 *
	 * @return void
	 */
	public static function register() {
		foreach ( self::META_KEYS as $meta_key ) {
			add_filter( 'spf_' . $meta_key . '_save', array( __CLASS__, 'preserve' ), 10, 3 );
		}
	}

	/**
	 * Merge the submitted generator settings over what is stored.
	 *
	 * @param array  $data    Data the framework built from the request.
	 * @param int    $post_id Generator post ID.
	 * @param object $metabox The framework metabox (exposes `unique`, `sections`).
	 * @return array Data to save.
	 */
	public static function preserve( $data, $post_id, $metabox = null ) {
		$data     = is_array( $data ) ? $data : array();
		$meta_key = is_object( $metabox ) && ! empty( $metabox->unique ) ? (string) $metabox->unique : self::META_KEYS[0];

		// A revision's own meta is empty while core writes to the parent: read the parent.
		$parent_id = function_exists( 'wp_is_post_revision' ) ? wp_is_post_revision( $post_id ) : false;
		$post_id   = $parent_id ? $parent_id : $post_id;

		$stored = get_post_meta( $post_id, $meta_key, true );
		$stored = is_array( $stored ) ? $stored : array();

		$fields = array();
		if ( is_object( $metabox ) && isset( $metabox->sections ) && is_array( $metabox->sections ) ) {
			foreach ( $metabox->sections as $section ) {
				if ( isset( $section['fields'] ) && is_array( $section['fields'] ) ) {
					$fields = array_merge( $fields, $section['fields'] );
				}
			}
		}

		return self::merge( $data, $stored, $fields, true );
	}

	/**
	 * Merge one level: the top level, or a fieldset's own keys.
	 *
	 * @param array $data      Submitted values at this level.
	 * @param array $stored    Stored values at this level.
	 * @param array $fields    Free's field configs at this level.
	 * @param bool  $top_level Whether this is the top level (fieldsets recurse once).
	 * @return array
	 */
	private static function merge( array $data, array $stored, array $fields, $top_level ) {
		$declared = array();

		foreach ( self::flatten_tabs( $fields ) as $field ) {
			if ( empty( $field['id'] ) ) {
				continue;
			}

			$id         = (string) $field['id'];
			$declared[] = $id;
			$has_stored = array_key_exists( $id, $stored );

			// A locked field is never edited in Free: keep the stored value (or none).
			if ( self::is_locked( $field ) ) {
				if ( $has_stored ) {
					$data[ $id ] = $stored[ $id ];
				} else {
					unset( $data[ $id ] );
				}
				continue;
			}

			// A fieldset or accordion is saved as one sub-array: merge its keys the
			// same way, so a declared sub-field (a cleared multi-select) stays cleared.
			$children = self::child_fields( $field );
			if ( $top_level && $children && isset( $data[ $id ] ) && is_array( $data[ $id ] ) && $has_stored && is_array( $stored[ $id ] ) ) {
				$data[ $id ] = self::merge( $data[ $id ], $stored[ $id ], $children, false );
				continue;
			}

			// A compound value (typography, spacing, border…) is one input per key,
			// each always submitted — a missing key is one Free disables
			// (team-admin.js locks typography's font, size, line height…): keep it.
			if ( ! $children && $has_stored && self::is_map( $stored[ $id ] ) && isset( $data[ $id ] ) && self::is_map( $data[ $id ] ) ) {
				$data[ $id ] = self::in_stored_order( $data[ $id ] + $stored[ $id ], $stored[ $id ] );
				continue;
			}

			// A Pro choice in a picker is a disabled input: it comes back empty.
			if ( $has_stored && self::is_pro_option( $field, $stored[ $id ] ) && ( ! isset( $data[ $id ] ) || '' === $data[ $id ] || array() === $data[ $id ] ) ) {
				$data[ $id ] = $stored[ $id ];
			}
		}

		// Keys Free has no field for (Pro's own) survive as stored.
		foreach ( $stored as $key => $value ) {
			if ( ! in_array( (string) $key, $declared, true ) && ! array_key_exists( $key, $data ) ) {
				$data[ $key ] = $value;
			}
		}

		// Inside a fieldset the key order can be the render order (Pro stores
		// `style_members` as a drag-and-drop sortable), so keep the stored order.
		return $top_level ? $data : self::in_stored_order( $data, $stored );
	}

	/**
	 * The sub-fields a field saves as keys of its own value: a fieldset's
	 * `fields`, or every accordion section's `fields` (an accordion stores them
	 * flat, e.g. `sptp_accordion_department_fields['filter_group']`).
	 *
	 * @param array $field Field config.
	 * @return array
	 */
	private static function child_fields( array $field ) {
		if ( ! empty( $field['fields'] ) && is_array( $field['fields'] ) ) {
			return $field['fields'];
		}

		$children = array();
		if ( ! empty( $field['accordions'] ) && is_array( $field['accordions'] ) ) {
			foreach ( $field['accordions'] as $section ) {
				if ( isset( $section['fields'] ) && is_array( $section['fields'] ) ) {
					$children = array_merge( $children, $section['fields'] );
				}
			}
		}

		return $children;
	}

	/**
	 * Reorder `$data` to the stored key order; keys new to the store follow.
	 *
	 * @param array $data   Merged values.
	 * @param array $stored Stored values.
	 * @return array
	 */
	private static function in_stored_order( array $data, array $stored ) {
		$ordered = array();

		foreach ( array_keys( $stored ) as $key ) {
			if ( array_key_exists( $key, $data ) ) {
				$ordered[ $key ] = $data[ $key ];
			}
		}

		return $ordered + $data;
	}

	/**
	 * Whether a value is a key → value map (not a list such as a multi-select).
	 *
	 * @param mixed $value Value.
	 * @return bool
	 */
	private static function is_map( $value ) {
		if ( ! is_array( $value ) || array() === $value ) {
			return false;
		}

		return array_keys( $value ) !== range( 0, count( $value ) - 1 );
	}

	/**
	 * Fields of a level, with a tabbed field's tabs inlined (they save flat).
	 *
	 * @param array $fields Field configs.
	 * @return array
	 */
	private static function flatten_tabs( array $fields ) {
		$flat = array();

		foreach ( $fields as $field ) {
			if ( ! is_array( $field ) ) {
				continue;
			}
			if ( isset( $field['type'] ) && 'tabbed' === $field['type'] && empty( $field['id'] ) && ! empty( $field['tabs'] ) ) {
				foreach ( (array) $field['tabs'] as $tab ) {
					$flat = array_merge( $flat, self::flatten_tabs( isset( $tab['fields'] ) ? (array) $tab['fields'] : array() ) );
				}
				continue;
			}
			$flat[] = $field;
		}

		return $flat;
	}

	/**
	 * Whether Free shows a field locked: `only_pro`, the Pro class, or disabled.
	 *
	 * @param array $field Field config.
	 * @return bool
	 */
	private static function is_locked( array $field ) {
		if ( isset( $field['only_pro'] ) ) {
			return true;
		}

		$classes = isset( $field['class'] ) ? preg_split( '/\s+/', (string) $field['class'] ) : array();

		return in_array( Member_Meta_Save::PRO_FIELD_CLASS, $classes, true ) || ! empty( $field['attributes']['disabled'] );
	}

	/**
	 * Whether a stored value is one of the field's Pro-only options: an
	 * image_select option flagged `pro_only`, or a select option whose label
	 * says "Pro" — the same test team-admin.js uses to disable it.
	 *
	 * @param array $field Field config.
	 * @param mixed $value Stored value.
	 * @return bool
	 */
	private static function is_pro_option( array $field, $value ) {
		if ( ! is_scalar( $value ) || '' === (string) $value || empty( $field['options'] ) || ! is_array( $field['options'] ) ) {
			return false;
		}

		$option = isset( $field['options'][ (string) $value ] ) ? $field['options'][ (string) $value ] : null;

		if ( is_array( $option ) ) {
			return ! empty( $option['pro_only'] );
		}

		return is_string( $option ) && 1 === preg_match( '/\bPro\b/', $option );
	}
}
