<?php
/**
 * AI Schema Validator
 *
 * Sanitizes AI-generated block attributes and merges them onto the block's
 * defaults and current values.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\AI
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\AI;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

defined( 'ABSPATH' ) || exit;

/**
 * AISchemaValidator class.
 */
class AISchemaValidator {

	/**
	 * Sanitize and merge raw AI generated attributes.
	 *
	 * Layered defaults → existing attributes → AI output, so a refinement only
	 * overwrites what the AI decided to change. A partial object from the model
	 * (a `columns` with only `device.Desktop`) is completed from that base.
	 *
	 * `changed` lists the top-level keys the model actually set. The editor
	 * applies only those, and needs to know whether `cardDesign` is among them:
	 * picking a design runs that block's design-swap logic client-side, which
	 * a plain attribute write would skip.
	 *
	 * @param array  $ai_attributes       Raw parsed JSON attributes from AI.
	 * @param string $block_name          Target block name.
	 * @param array  $existing_attributes Block's current attributes when refining.
	 * @return array{attributes: array, changed: string[]}
	 */
	public static function sanitize_and_merge( array $ai_attributes, string $block_name, array $existing_attributes = array() ): array {
		$defaults = AIValueValidator::schema_defaults( $block_name );
		$existing = array_intersect_key( $existing_attributes, $defaults );
		$base     = self::deep_merge( $defaults, $existing );

		$element_toggles = isset( $ai_attributes['elements'] ) && is_array( $ai_attributes['elements'] ) ? $ai_attributes['elements'] : array();
		unset( $ai_attributes['elements'] );

		$filtered = AIValueValidator::validate( $ai_attributes, $block_name );
		$merged   = self::deep_merge( $base, $filtered );
		$changed  = array_keys( $filtered );

		$card_elements = self::apply_element_toggles( $merged['cardElements'] ?? array(), $element_toggles );
		if ( null !== $card_elements ) {
			$merged['cardElements'] = $card_elements;
			$changed[]              = 'cardElements';
		}

		return array(
			'attributes' => $merged,
			'changed'    => array_values( array_unique( $changed ) ),
		);
	}

	/**
	 * Flip the `show` flag of Member Information rows the model named.
	 *
	 * The rows keep their order and labels — only visibility is an AI decision,
	 * and only for the free rows: a Pro row (contact details, skills …) is
	 * never switched, so a Pro-saved block keeps it exactly as stored.
	 *
	 * @param mixed $rows    Current `cardElements` rows.
	 * @param array $toggles Element slug → bool.
	 * @return array|null Updated rows, or null when nothing changed.
	 */
	private static function apply_element_toggles( $rows, array $toggles ) {
		if ( ! is_array( $rows ) || empty( $rows ) || empty( $toggles ) ) {
			return null;
		}

		$changed = false;
		foreach ( $rows as $index => $row ) {
			$slug = is_array( $row ) && isset( $row['value'] ) ? (string) $row['value'] : '';
			if ( '' === $slug || ! in_array( $slug, Pro_Gate::FREE_CARD_ELEMENTS, true ) || ! array_key_exists( $slug, $toggles ) || ! is_scalar( $toggles[ $slug ] ) ) {
				continue;
			}

			$show = filter_var( $toggles[ $slug ], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );
			if ( null === $show || ( ! empty( $row['show'] ) ) === $show ) {
				continue;
			}

			$rows[ $index ]['show'] = $show;
			$changed                = true;
		}

		return $changed ? $rows : null;
	}

	/**
	 * Recursive merge: associative arrays merge key by key, lists and scalars
	 * are replaced wholesale.
	 *
	 * @param array $base  Base values.
	 * @param array $patch Values layered on top.
	 * @return array
	 */
	public static function deep_merge( array $base, array $patch ): array {
		foreach ( $patch as $key => $value ) {
			if ( is_array( $value ) && isset( $base[ $key ] ) && is_array( $base[ $key ] ) && self::is_assoc( $value ) && self::is_assoc( $base[ $key ] ) ) {
				$base[ $key ] = self::deep_merge( $base[ $key ], $value );
				continue;
			}

			$base[ $key ] = $value;
		}

		return $base;
	}

	/**
	 * True when a non-empty array is keyed by strings.
	 *
	 * @param array $candidate Array to test.
	 * @return bool
	 */
	private static function is_assoc( array $candidate ): bool {
		return ! empty( $candidate ) && array_keys( $candidate ) !== range( 0, count( $candidate ) - 1 );
	}
}
