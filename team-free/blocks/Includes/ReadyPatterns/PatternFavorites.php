<?php
/**
 * Ready Patterns favorites ("My Patterns" hearts) storage.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\ReadyPatterns
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\ReadyPatterns;

defined( 'ABSPATH' ) || exit;

/**
 * Per-user favorited patterns, keyed by the pattern's durable slug.
 *
 * Slugs rather than IDs: an ID changes when a pattern is edited, re-imported, or
 * republished on the server, which would silently empty the heart. Entries stored
 * as IDs before this change are kept as-is until the next toggle rewrites them,
 * and the editor matches them against the manifest.
 */
class PatternFavorites {

	/**
	 * User meta key holding this user's favorites.
	 */
	private const META_KEY = 'sptp_ready_patterns_favorites';

	/**
	 * Most favorites kept per user, and the longest key stored — bounds what a
	 * user can write to their own meta row.
	 */
	private const MAX_ENTRIES    = 200;
	private const MAX_KEY_LENGTH = 100;

	/**
	 * Return the current user's favorited pattern keys.
	 *
	 * @return array<int, int|string>
	 */
	public static function get_all(): array {
		$user_id = get_current_user_id();
		if ( 0 === $user_id ) {
			return array();
		}

		$favorites = get_user_meta( $user_id, self::META_KEY, true );

		return is_array( $favorites ) ? self::normalize_list( $favorites ) : array();
	}

	/**
	 * Add a pattern to the current user's favorites.
	 *
	 * @param string|int      $pattern_key Pattern slug (preferred) or ID.
	 * @param string|int|null $legacy_id   Pattern ID, when a slug was supplied.
	 * @return array<int, int|string> Updated favorites list.
	 */
	public static function add( $pattern_key, $legacy_id = null ): array {
		$key       = self::normalize_key( $pattern_key );
		$favorites = self::get_all();

		if ( '' === $key || 0 === $key || count( $favorites ) >= self::MAX_ENTRIES ) {
			return $favorites;
		}

		// A pre-slug entry for the same pattern is rewritten rather than duplicated.
		$favorites = self::without( $favorites, $legacy_id );

		if ( ! in_array( $key, $favorites, true ) ) {
			$favorites[] = $key;
		}

		return self::persist( $favorites );
	}

	/**
	 * Remove a pattern from the current user's favorites.
	 *
	 * @param string|int      $pattern_key Pattern slug (preferred) or ID.
	 * @param string|int|null $legacy_id   Pattern ID, when a slug was supplied.
	 * @return array<int, int|string> Updated favorites list.
	 */
	public static function remove( $pattern_key, $legacy_id = null ): array {
		$favorites = self::without( self::get_all(), $pattern_key );
		$favorites = self::without( $favorites, $legacy_id );

		return self::persist( $favorites );
	}

	/**
	 * Persist the list to the current user's meta.
	 *
	 * @param array<int, int|string> $favorites Favorites list.
	 * @return array<int, int|string>
	 */
	private static function persist( array $favorites ): array {
		$favorites = array_values( $favorites );
		$user_id   = get_current_user_id();

		if ( 0 !== $user_id ) {
			update_user_meta( $user_id, self::META_KEY, $favorites );
		}

		return $favorites;
	}

	/**
	 * Return the list without a given key (matching across id/slug types).
	 *
	 * @param array<int, int|string> $favorites Favorites list.
	 * @param string|int|null        $candidate Key to drop.
	 * @return array<int, int|string>
	 */
	private static function without( array $favorites, $candidate ): array {
		if ( null === $candidate ) {
			return $favorites;
		}

		$candidate = (string) self::normalize_key( $candidate );
		if ( '' === $candidate ) {
			return $favorites;
		}

		return array_values(
			array_filter(
				$favorites,
				static function ( $entry ) use ( $candidate ) {
					return (string) $entry !== $candidate;
				}
			)
		);
	}

	/**
	 * Normalize a stored list.
	 *
	 * @param array<int, mixed> $favorites Raw list.
	 * @return array<int, int|string>
	 */
	private static function normalize_list( array $favorites ): array {
		$normalized = array();
		foreach ( $favorites as $entry ) {
			if ( ! is_scalar( $entry ) ) {
				continue;
			}
			$key = self::normalize_key( $entry );
			if ( '' !== $key && 0 !== $key && ! in_array( $key, $normalized, true ) ) {
				$normalized[] = $key;
			}
		}

		return $normalized;
	}

	/**
	 * Normalize a key (numeric → int, else sanitized slug-safe string).
	 *
	 * @param mixed $pattern_key Raw key.
	 * @return int|string
	 */
	private static function normalize_key( $pattern_key ) {
		if ( is_numeric( $pattern_key ) ) {
			return (int) $pattern_key;
		}

		return substr( sanitize_text_field( (string) $pattern_key ), 0, self::MAX_KEY_LENGTH );
	}
}
