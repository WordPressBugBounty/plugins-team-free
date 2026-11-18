<?php
/**
 * Ready Patterns source resolution, caching, and payload lookup.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes\ReadyPatterns
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\ReadyPatterns;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;
use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

defined( 'ABSPATH' ) || exit;

/**
 * Loads manifests and single-pattern payloads from the pattern server
 * (`wp-team-pro-demo-site-core`'s `wp-team-pro/v1` REST manifest), cached in
 * uploads. Nothing ships inside the plugin: an unreachable server means an
 * empty library, not a stale one.
 *
 * Port of Smart Team Pro's PatternRepository — same pattern server, same
 * manifest, same cache contract. Free differs in three places: no dashboard
 * module gates the header launcher (Free has no Modules page), no `requires`
 * block is kept (Free has no modules to require, and a pattern's
 * `minPluginVersion` counts Pro releases), and `get_pattern_content()` never
 * fetches a Pro-tier pattern — Free only previews those (see Pro_Gate::is_free_pattern()).
 */
class PatternRepository {

	/**
	 * Default remote manifest URL (Smart Team pattern server).
	 *
	 * Hosted `wp-team-pro-demo-site-core` instance running Pro — the pattern
	 * server this library always reads from, so previews show the real Pro
	 * design (see `default_remote_manifest_url()`).
	 */
	private const REMOTE_MANIFEST_URL = 'https://demo.getwpteam.com/wp-json/wp-team-pro/v1/pattern-list';

	/**
	 * Manifest cache TTL in seconds (24 hours).
	 */
	private const CACHE_TTL = DAY_IN_SECONDS;

	/**
	 * Single-payload cache TTL in seconds. Short on purpose: patterns are edited
	 * server-side and a stale payload is worse than a slow insert.
	 */
	private const PAYLOAD_TTL = 6 * HOUR_IN_SECONDS;

	/**
	 * Transient cache key (fallback when uploads is unwritable). Not Pro's
	 * `sptp_ready_patterns_manifest`: Free caches items without `requires`, and
	 * Pro reading that copy after an upgrade would skip its requirements check.
	 */
	private const TRANSIENT_KEY = 'spt_ready_patterns_manifest';

	/**
	 * Per-payload transient key prefix.
	 */
	private const PAYLOAD_TRANSIENT_PREFIX = 'sptp_rp_payload_';

	/**
	 * Option holding the payload cache generation. Payload keys are salted with it,
	 * so bumping the number retires every cached payload at once — transient names
	 * are hashed per pattern ID and cannot be enumerated for deletion.
	 */
	private const PAYLOAD_GENERATION_OPTION = 'sptp_rp_payload_generation';

	/**
	 * Uploads sub-directory for cache files.
	 */
	private const UPLOADS_SUBDIR = 'team-free';

	/**
	 * Cache filename inside the uploads sub-directory.
	 */
	private const CACHE_FILENAME = 'ready-patterns.json';

	/**
	 * Hard ceiling on a single pattern payload. Bounds what a buggy or compromised
	 * server can hand to `parse()` in an editor session.
	 */
	public const MAX_PAYLOAD_BYTES = 262144;

	/**
	 * Hard ceiling on the manifest download. It is cached whole (uploads file, or
	 * a transient when uploads is unwritable), so an oversized list is refused.
	 */
	private const MAX_MANIFEST_BYTES = 2097152;

	/**
	 * Whether the last get_manifest() call came back empty because the pattern server
	 * could not be read and no cached copy stood in.
	 *
	 * @var bool
	 */
	private $unreachable = false;

	/**
	 * Return the flat manifest.
	 *
	 * @param bool $force When true, bypass the cache and re-download the manifest.
	 * @return array<int, array<string, mixed>>
	 */
	public function get_manifest( bool $force = false ): array {
		$this->unreachable = false;

		// Remote fetching switched off: there is no local catalog to fall back to, and a
		// cache written before the filter was added must not resurrect remote items.
		if ( '' === $this->get_remote_manifest_url() ) {
			return array();
		}

		// An expired cache is still worth reading: its validators turn the daily refetch into
		// a 304, and its items stand in when the pattern server cannot be reached at all.
		$cached = $this->read_cache( true );
		$fresh  = null !== $cached && isset( $cached['expires'] ) && (int) $cached['expires'] > time();

		if ( null !== $cached && ! $this->cache_matches_source( $cached ) ) {
			// The pattern server moved. Items cached from the previous host are foreign —
			// their IDs address posts that do not exist here — so neither the manifest nor
			// the payloads keyed by those IDs may survive the switch.
			$this->bump_payload_generation();
			$cached = null;
			$fresh  = false;
		}

		if ( ! $force && $fresh && isset( $cached['items'] ) && is_array( $cached['items'] ) ) {
			return $cached['items'];
		}

		if ( $force ) {
			// Refresh has to reach the payloads too: a pattern edited server-side keeps
			// inserting its old markup for the rest of the payload TTL otherwise.
			$this->bump_payload_generation();
		}

		$fetched = $this->fetch_source( $cached, $force );

		if ( 'not_modified' === $fetched['status'] && null !== $cached && isset( $cached['items'] ) && is_array( $cached['items'] ) ) {
			// Nothing changed upstream: extend the expiry and reuse the stored items.
			$cached['expires'] = time() + self::CACHE_TTL;
			$this->write_cache( $cached );

			return $cached['items'];
		}

		$source = $fetched['data'];
		$items  = is_array( $source ) && isset( $source['items'] ) && is_array( $source['items'] )
			? $this->sanitize_items( $source['items'] )
			: null;

		// An unreadable/failed source must not poison the cache for a full TTL.
		if ( null !== $items ) {
			$this->write_cache(
				array(
					'items'         => $items,
					'etag'          => $fetched['etag'],
					'last_modified' => $fetched['last_modified'],
					'expires'       => time() + self::CACHE_TTL,
				)
			);
		} elseif ( null !== $cached && isset( $cached['items'] ) && is_array( $cached['items'] ) ) {
			// Failed refresh with a readable cache: keep serving what we have.
			$items = $cached['items'];
		} else {
			// Nothing downloaded and nothing to fall back on. The empty list is not the
			// server's answer, and the editor must not present it as an empty catalog.
			$this->unreachable = true;
			$items             = array();
		}

		return $items;
	}

	/**
	 * Keep only well-formed items, without their `requires` block.
	 *
	 * Pro's editor reads `requires` to block an insert until a dashboard module
	 * is on or the plugin is new enough. Free has no modules, and a pattern's
	 * `minPluginVersion` is a Pro version, so nothing in Free reads it.
	 *
	 * @param array<int, mixed> $raw_items Raw manifest items from the source.
	 * @return array<int, array<string, mixed>>
	 */
	private function sanitize_items( array $raw_items ): array {
		$items = array();

		foreach ( $raw_items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			unset( $item['requires'] );

			$items[] = $item;
		}

		return $items;
	}

	/**
	 * Whether the last get_manifest() call failed to reach the pattern server with no
	 * cache to fall back on — as opposed to the server listing no patterns.
	 *
	 * @return bool
	 */
	public function manifest_unreachable(): bool {
		return $this->unreachable;
	}

	/**
	 * Return serialized block markup for a pattern ID.
	 *
	 * @param string|int $pattern_id Pattern identifier.
	 * @return string|null Content string or null when unknown.
	 */
	public function get_pattern_content( $pattern_id ): ?string {
		$pattern_id = self::normalize_id( $pattern_id );
		if ( '' === $pattern_id ) {
			return null;
		}

		// Free never fetches a Pro pattern's markup — it only previews those.
		$item = $this->find_cached_item( $pattern_id );
		if ( null === $item || ! Pro_Gate::is_free_pattern( $item ) ) {
			return null;
		}

		$cache_key = $this->payload_cache_key( $pattern_id );
		$cached    = get_transient( $cache_key );
		if ( is_string( $cached ) && '' !== $cached ) {
			return $this->within_size_limit( $cached ) ? $cached : null;
		}

		$remote_url = $this->get_remote_manifest_url();
		if ( '' === $remote_url ) {
			return null;
		}

		$content = $this->fetch_remote_pattern_content( $pattern_id, $remote_url );
		if ( ! is_string( $content ) || '' === $content ) {
			return null;
		}

		if ( ! $this->within_size_limit( $content ) ) {
			// Oversized payloads are rejected like any invalid payload — and not cached.
			return null;
		}

		set_transient( $cache_key, $content, self::PAYLOAD_TTL );

		return $content;
	}

	/**
	 * The cached manifest item with a given ID, or null when none is listed.
	 *
	 * Reads the cache only — never downloads, refreshes or writes — so the Pro
	 * gate's lookup (Controller::get_pattern(), get_pattern_content()) stays
	 * read-only. The library has already loaded the manifest by the time
	 * anything is inserted; with no cache at all, nothing is listed.
	 *
	 * @param string $pattern_id Sanitized pattern identifier.
	 * @return array<string, mixed>|null
	 */
	public function find_cached_item( string $pattern_id ): ?array {
		$cached = $this->read_cache( true );
		if ( null === $cached || ! isset( $cached['items'] ) || ! is_array( $cached['items'] ) || ! $this->cache_matches_source( $cached ) ) {
			return null;
		}

		foreach ( $cached['items'] as $item ) {
			if ( is_array( $item ) && isset( $item['id'] ) && (string) $item['id'] === $pattern_id ) {
				return $item;
			}
		}

		return null;
	}

	/**
	 * Normalize a requested pattern ID the way every lookup and fetch uses it.
	 *
	 * @param mixed $pattern_id Raw pattern identifier.
	 * @return string
	 */
	public static function normalize_id( $pattern_id ): string {
		return is_numeric( $pattern_id ) ? (string) (int) $pattern_id : sanitize_text_field( (string) $pattern_id );
	}

	/**
	 * Transient key for a pattern payload in the current cache generation.
	 *
	 * @param string $pattern_id Sanitized pattern identifier.
	 * @return string
	 */
	private function payload_cache_key( string $pattern_id ): string {
		return self::PAYLOAD_TRANSIENT_PREFIX . $this->payload_generation() . '_' . md5( $pattern_id );
	}

	/**
	 * Current payload cache generation.
	 *
	 * @return int
	 */
	private function payload_generation(): int {
		return absint( get_option( self::PAYLOAD_GENERATION_OPTION, 0 ) );
	}

	/**
	 * Retire every cached payload by moving to the next generation. Superseded
	 * transients are left to expire on their own TTL.
	 *
	 * @return void
	 */
	private function bump_payload_generation(): void {
		update_option( self::PAYLOAD_GENERATION_OPTION, $this->payload_generation() + 1, false );
	}

	/**
	 * Whether Ready Patterns is available on this site at all.
	 *
	 * The filter is the only way to refuse. Everything that serves patterns —
	 * the REST routes — gates on this.
	 *
	 * @return bool
	 */
	public static function is_enabled(): bool {
		/**
		 * Filter whether the Ready Patterns library is available on this site.
		 *
		 * @param bool $enabled Default enabled state.
		 */
		return (bool) apply_filters( 'sptp_ready_patterns_enabled', true );
	}

	/**
	 * Whether the Ready Patterns shortcut belongs in the editor header toolbar.
	 *
	 * This is what the dashboard's Ready Patterns module switches, and the only
	 * thing it switches — the library stays reachable from the block.
	 *
	 * @return bool
	 */
	public static function is_header_launcher_enabled(): bool {
		if ( ! self::is_enabled() ) {
			return false;
		}

		return DashboardHelper::is_module_enabled( 'ready_patterns' );
	}

	/**
	 * REST route path for apiFetch (no /wp-json prefix).
	 *
	 * @return string
	 */
	public static function rest_base(): string {
		return '/sptp/v1/patterns';
	}

	/**
	 * Fetch the remote source: a plain read revalidates with the stored ETag /
	 * Last-Modified, a forced one asks for the list outright.
	 *
	 * @param array<string, mixed>|null $cached Existing cache payload, when readable.
	 * @param bool                      $force  When true, ask for the full list instead of revalidating.
	 * @return array{status: string, data: array<string, mixed>|null, etag: string, last_modified: string}
	 */
	private function fetch_source( ?array $cached, bool $force = false ): array {
		$result = array(
			'status'        => 'failed',
			'data'          => null,
			'etag'          => '',
			'last_modified' => '',
		);

		$remote_url = $this->get_remote_manifest_url();
		if ( '' === $remote_url ) {
			return $result;
		}

		$headers = array();

		if ( $force ) {
			// Someone pressed refresh because the library looked wrong, so a 304 is useless
			// here: the validators are dropped to make the server send its current list, and
			// the directives plus the unique argument stop a proxy answering from its own copy.
			$headers['Cache-Control'] = 'no-cache, no-store, max-age=0';
			$headers['Pragma']        = 'no-cache';
			$remote_url               = add_query_arg( 'sptp_refresh', (string) time(), $remote_url );
		} elseif ( is_array( $cached ) ) {
			if ( ! empty( $cached['etag'] ) && is_string( $cached['etag'] ) ) {
				$headers['If-None-Match'] = $cached['etag'];
			}
			if ( ! empty( $cached['last_modified'] ) && is_string( $cached['last_modified'] ) ) {
				$headers['If-Modified-Since'] = $cached['last_modified'];
			}
		}

		$response = wp_safe_remote_get(
			$remote_url,
			array(
				'timeout'             => 15,
				'headers'             => $headers,
				'limit_response_size' => self::MAX_MANIFEST_BYTES,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $result;
		}

		$code = (int) wp_remote_retrieve_response_code( $response );

		if ( 304 === $code ) {
			$result['status'] = 'not_modified';

			return $result;
		}

		if ( 200 !== $code ) {
			return $result;
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $data ) ) {
			return $result;
		}

		$result['status']        = 'ok';
		$result['data']          = $data;
		$result['etag']          = (string) wp_remote_retrieve_header( $response, 'etag' );
		$result['last_modified'] = (string) wp_remote_retrieve_header( $response, 'last-modified' );

		return $result;
	}

	/**
	 * Default remote manifest URL before the `sptp_patterns_remote_url` filter runs.
	 *
	 * Always the remote pattern server, like Real Testimonials Free
	 * (`src/Blocks/Includes/ReadyPatterns.php`, demo.realtestimonials.io).
	 * Pro switches to `home_url()` when `wp-team-pro-demo-site-core` is active on
	 * the same install; Free must not. Every manifest item's `previewUrl` points
	 * at the site that served the manifest, and the preview drawer frames that
	 * page, so it has to be a site running Pro. On a Free install, framing its
	 * own site would render every Pro pattern through Free's fallbacks (Pro_Gate)
	 * instead of how it really looks. Use the filter to point a dev site at
	 * another server that runs Pro.
	 *
	 * @return string
	 */
	private function default_remote_manifest_url(): string {
		return self::REMOTE_MANIFEST_URL;
	}

	/**
	 * Remote manifest URL after filter (empty string disables remote fetching).
	 *
	 * @return string
	 */
	private function get_remote_manifest_url(): string {
		/**
		 * Filter the remote Ready Patterns manifest URL.
		 *
		 * Return an empty string to disable remote fetching.
		 *
		 * @param string $url Default remote manifest URL.
		 */
		$url = apply_filters( 'sptp_patterns_remote_url', $this->default_remote_manifest_url() );

		if ( ! is_string( $url ) ) {
			return '';
		}

		$url = esc_url_raw( $url );

		return is_string( $url ) ? $url : '';
	}

	/**
	 * Whether a payload is within the ingest size limit.
	 *
	 * @param string|null $content Payload markup.
	 * @return bool
	 */
	private function within_size_limit( ?string $content ): bool {
		if ( null === $content ) {
			return false;
		}

		return strlen( $content ) <= self::MAX_PAYLOAD_BYTES;
	}

	/**
	 * Fetch a single pattern payload from the remote server.
	 *
	 * @param string $pattern_id      Pattern ID.
	 * @param string $remote_manifest Remote manifest URL.
	 * @return string|null
	 */
	private function fetch_remote_pattern_content( string $pattern_id, string $remote_manifest ): ?string {
		/**
		 * Filter the remote single-pattern URL.
		 *
		 * @param string $url             Default derived URL (may be empty).
		 * @param string $pattern_id      Requested pattern ID.
		 * @param string $remote_manifest Remote manifest URL.
		 */
		$url = apply_filters( 'sptp_patterns_single_remote_url', '', $pattern_id, $remote_manifest );

		if ( '' === $url ) {
			$url = preg_replace( '#/pattern-list/?$#', '/single-pattern/' . rawurlencode( $pattern_id ), $remote_manifest );
			if ( ! is_string( $url ) || $url === $remote_manifest ) {
				return null;
			}
		}

		$url = esc_url_raw( $url );
		if ( ! is_string( $url ) || '' === $url ) {
			return null;
		}

		$response = wp_safe_remote_get(
			$url,
			array(
				'timeout'             => 15,
				'limit_response_size' => self::MAX_PAYLOAD_BYTES + 1024,
			)
		);

		if ( is_wp_error( $response ) ) {
			return null;
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		if ( 200 !== $code ) {
			return null;
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( is_array( $data ) && ! empty( $data['content'] ) && is_string( $data['content'] ) ) {
			return $data['content'];
		}

		if ( is_string( $body ) && false !== strpos( $body, '<!-- wp:' ) ) {
			return $body;
		}

		return null;
	}

	/**
	 * Read manifest cache from uploads file or transient.
	 *
	 * @param bool $allow_expired When true, return a payload whose TTL has run out.
	 * @return array<string, mixed>|null
	 */
	private function read_cache( bool $allow_expired = false ): ?array {
		$file_cache = $this->read_file_cache( $allow_expired );
		if ( null !== $file_cache ) {
			return $file_cache;
		}

		$transient = get_transient( self::TRANSIENT_KEY );
		if ( ! is_array( $transient ) || ! isset( $transient['expires'] ) ) {
			return null;
		}

		if ( $allow_expired || (int) $transient['expires'] > time() ) {
			return $transient;
		}

		return null;
	}

	/**
	 * Read cache JSON from uploads directory.
	 *
	 * @param bool $allow_expired When true, return a payload whose TTL has run out.
	 * @return array<string, mixed>|null
	 */
	private function read_file_cache( bool $allow_expired = false ): ?array {
		$path = $this->get_cache_file_path();
		if ( ! is_readable( $path ) ) {
			return null;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$contents = file_get_contents( $path );
		if ( false === $contents ) {
			return null;
		}

		$data = json_decode( $contents, true );
		if ( ! is_array( $data ) || empty( $data['expires'] ) ) {
			return null;
		}

		if ( ! $allow_expired && (int) $data['expires'] <= time() ) {
			return null;
		}

		return $data;
	}

	/**
	 * Whether a cache payload was written against the pattern server in use now.
	 * A cache from before the stamp existed counts as foreign.
	 *
	 * @param array<string, mixed> $cache Cache payload.
	 * @return bool
	 */
	private function cache_matches_source( array $cache ): bool {
		$source = isset( $cache['source'] ) && is_string( $cache['source'] ) ? $cache['source'] : '';

		return '' !== $source && $source === $this->get_remote_manifest_url();
	}

	/**
	 * Persist manifest cache to uploads file with transient fallback.
	 *
	 * @param array<string, mixed> $payload Cache payload.
	 */
	private function write_cache( array $payload ): void {
		$payload['source'] = $this->get_remote_manifest_url();

		$path = $this->get_cache_file_path();
		$dir  = dirname( $path );

		$filesystem = wp_mkdir_p( $dir ) ? $this->get_filesystem() : null;

		if ( $filesystem ) {
			$written = $filesystem->put_contents( $path, wp_json_encode( $payload ), FS_CHMOD_FILE );
			if ( $written ) {
				// A transient left over from a spell of unwritable uploads would outlive the
				// items it shadows, so the file becomes the only copy again.
				delete_transient( self::TRANSIENT_KEY );

				return;
			}
		}

		set_transient( self::TRANSIENT_KEY, $payload, self::CACHE_TTL );
	}

	/**
	 * The direct WP_Filesystem handle, or null when it cannot be initialised.
	 *
	 * Only the direct method is used: the cache lives in uploads and must never
	 * prompt for FTP credentials.
	 *
	 * @return \WP_Filesystem_Base|null
	 */
	private function get_filesystem() {
		global $wp_filesystem;

		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		if ( ! $wp_filesystem || ! ( $wp_filesystem instanceof \WP_Filesystem_Direct ) ) {
			add_filter( 'filesystem_method', array( $this, 'force_direct_filesystem' ) );
			WP_Filesystem();
			remove_filter( 'filesystem_method', array( $this, 'force_direct_filesystem' ) );
		}

		return $wp_filesystem instanceof \WP_Filesystem_Direct ? $wp_filesystem : null;
	}

	/**
	 * `filesystem_method` callback for get_filesystem().
	 *
	 * @return string
	 */
	public function force_direct_filesystem(): string {
		return 'direct';
	}

	/**
	 * Absolute path to the uploads cache file.
	 *
	 * @return string
	 */
	private function get_cache_file_path(): string {
		$upload_dir = wp_upload_dir();
		$base       = isset( $upload_dir['basedir'] ) ? $upload_dir['basedir'] : WP_CONTENT_DIR . '/uploads';

		return trailingslashit( $base ) . self::UPLOADS_SUBDIR . '/' . self::CACHE_FILENAME;
	}
}
