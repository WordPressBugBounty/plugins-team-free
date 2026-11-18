<?php
/**
 * Placements — the Dashboard's "Team Showcase Placements" table.
 *
 * Every page, post, template and widget area that shows a Smart Team layout
 * block, a classic shortcode (`[wpteam]` or the legacy shortcode block) or a
 * saved template, plus the classic shortcodes and saved templates placed
 * nowhere yet. Ported from Logo Carousel Pro's BlockUsage; the scan, the row
 * shape and the cache option are the same in Smart Team Pro, so a report
 * survives a switch between the two plugins.
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

defined( 'ABSPATH' ) || exit;

/**
 * Class Placements
 */
class Placements {

	/**
	 * The legacy block that embeds a classic shortcode by id.
	 */
	const SHORTCODE_BLOCK = 'sp-team-pro/shortcode';

	/**
	 * Shortcode tags that embed something, what they embed, and the
	 * attribute holding its id. WPBakery's element embeds a saved template.
	 *
	 * @var array<string, array{0: string, 1: string}>
	 */
	const SHORTCODE_TAGS = array(
		'wpteam'              => array( 'shortcode', 'id' ),
		'sptp_saved_template' => array( 'template', 'id' ),
		'vc_smart_team'       => array( 'template', 'template_id' ),
	);

	/**
	 * Option holding when widgets were last saved. WordPress keeps widgets
	 * in options, which carry no date, so the plugin records one.
	 */
	const WIDGETS_MODIFIED_OPTION = 'sptp_placements_widgets_modified';

	/**
	 * Widget options whose save counts as "widgets updated".
	 *
	 * @var string[]
	 */
	const WIDGET_OPTIONS = array( 'widget_block', 'widget_text', 'sidebars_widgets' );

	/**
	 * Most posts one scan reads. A site with more still gets a table; the
	 * response says it was capped.
	 */
	const MAX_POSTS = 500;

	/**
	 * Option holding the last scan. An option, not a transient: the table
	 * shows this report until someone syncs, so nothing may expire it.
	 */
	const CACHE_OPTION = 'sptp_placements_report';

	/**
	 * Shape version of the stored report. A report saved in an older shape
	 * is scanned again rather than served. Keep in step with Smart Team Pro.
	 */
	const CACHE_VERSION = 1;

	/**
	 * Statuses a placement is listed under. Anything but "publish" is
	 * flagged in the table (Draft, Scheduled, …).
	 *
	 * @var string[]
	 */
	const STATUSES = array( 'publish', 'future', 'draft', 'pending', 'private' );

	/**
	 * Post types that are never a placement: the plugin's own content and
	 * WordPress internals.
	 *
	 * @var string[]
	 */
	const EXCLUDED_TYPES = array(
		'revision',
		'nav_menu_item',
		'customize_changeset',
		'oembed_cache',
		'user_request',
		'wp_global_styles',
		'wp_font_family',
		'wp_font_face',
		'attachment',
		'sptp_member',
		SavedTemplates::CLASSIC_POST_TYPE,
		SavedTemplates::POST_TYPE,
	);

	/**
	 * Count Smart Team layout blocks in parsed blocks, nested ones included.
	 *
	 * Only the layouts (Grid, Carousel, Overlay) are counted — the member
	 * field and add-on blocks inside them would only repeat the layout.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return array<string, int> Block name → count.
	 */
	public static function count_blocks( array $blocks ) {
		$counts = array();

		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			$name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
			if ( in_array( $name, DashboardHelper::PARENT_BLOCKS, true ) ) {
				$counts[ $name ] = ( isset( $counts[ $name ] ) ? $counts[ $name ] : 0 ) + 1;
			}

			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				foreach ( self::count_blocks( $block['innerBlocks'] ) as $inner => $count ) {
					$counts[ $inner ] = ( isset( $counts[ $inner ] ) ? $counts[ $inner ] : 0 ) + $count;
				}
			}
		}

		return $counts;
	}

	/**
	 * Classic shortcode ids embedded through the legacy shortcode block.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return int[] Shortcode ids, in page order, repeats kept.
	 */
	public static function find_block_shortcode_ids( array $blocks ) {
		$ids = array();

		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			$name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
			if ( self::SHORTCODE_BLOCK === $name && ! empty( $block['attrs']['shortcode'] ) ) {
				$id = absint( $block['attrs']['shortcode'] );
				if ( $id ) {
					$ids[] = $id;
				}
			}

			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$ids = array_merge( $ids, self::find_block_shortcode_ids( $block['innerBlocks'] ) );
			}
		}

		return $ids;
	}

	/**
	 * Classic shortcode and saved template ids a piece of content embeds.
	 *
	 * An escaped shortcode (`[[wpteam id="1"]]`) prints as text, so it is not
	 * counted.
	 *
	 * @param string $content Raw content.
	 * @return array{shortcode: int[], template: int[]} Unique ids per source.
	 */
	public static function find_shortcode_ids( $content ) {
		$found = array(
			'shortcode' => array(),
			'template'  => array(),
		);

		$content = (string) $content;
		if ( false === strpos( $content, '[' ) ) {
			return $found;
		}

		$tags = implode( '|', array_map( 'preg_quote', array_keys( self::SHORTCODE_TAGS ) ) );

		if ( ! preg_match_all( '/(?<!\[)\[(' . $tags . ')(?=[\s\]\/])([^\]]*)\](?!\])/i', $content, $matches, PREG_SET_ORDER ) ) {
			return $found;
		}

		foreach ( $matches as $match ) {
			list( $source, $attribute ) = self::SHORTCODE_TAGS[ strtolower( $match[1] ) ];

			if ( preg_match( '/(?:^|\s)' . $attribute . '\s*=\s*(["\']?)(\d+)\1/i', $match[2], $id_match ) ) {
				$id = absint( $id_match[2] );
				if ( $id && ! in_array( $id, $found[ $source ], true ) ) {
					$found[ $source ][] = $id;
				}
			}
		}

		return $found;
	}

	/**
	 * Display name of a classic shortcode's layout.
	 *
	 * Read-only: a layout Pro saved is named as Pro names it, even where Free
	 * renders it through a fallback. A shortcode saved before a layout was
	 * picked is the default carousel.
	 *
	 * @param mixed $layout_options The shortcode's `_sptp_generator_layout` meta.
	 * @return string Layout name.
	 */
	public static function shortcode_layout_label( $layout_options ) {
		$options = is_array( $layout_options ) ? $layout_options : array();
		$layout  = ! empty( $options['layout_preset'] ) ? (string) $options['layout_preset'] : 'carousel';

		// The names the shortcode editor's Layout Preset field shows.
		$names = array(
			'carousel'           => __( 'Carousel', 'team-free' ),
			'grid'               => __( 'Grid', 'team-free' ),
			'list'               => __( 'List', 'team-free' ),
			'filter'             => __( 'Isotope', 'team-free' ),
			'mosaic'             => __( 'Mosaic', 'team-free' ),
			'inline'             => __( 'Inline', 'team-free' ),
			'table'              => __( 'Table', 'team-free' ),
			'accordion'          => __( 'Accordion', 'team-free' ),
			'thumbnail-pager'    => __( 'Thumbs Pager', 'team-free' ),
			'organization-chart' => __( 'Org Chart', 'team-free' ),
		);

		if ( isset( $names[ $layout ] ) ) {
			return $names[ $layout ];
		}

		return ucwords( str_replace( array( '-', '_' ), ' ', $layout ) );
	}

	/**
	 * Display names of counted blocks, most used first.
	 *
	 * @param array<string, int> $blocks Block name → count.
	 * @return string[] Names.
	 */
	public static function block_layouts( array $blocks ) {
		arsort( $blocks );

		$labels  = ManageAPI::layout_block_titles();
		$layouts = array();
		foreach ( array_keys( $blocks ) as $name ) {
			$layouts[] = isset( $labels[ $name ] ) ? (string) $labels[ $name ] : ucwords( str_replace( array( 'sptp/', '-' ), array( '', ' ' ), (string) $name ) );
		}

		return $layouts;
	}

	/**
	 * Turn scanned locations and sources into table rows.
	 *
	 * A location gets one row per kind of placement it holds (its blocks, its
	 * classic shortcodes, its saved templates), listing the layouts shown
	 * there. A classic shortcode or saved template placed nowhere gets a row
	 * with no location. Newest first.
	 *
	 * @param array $locations  Locations: key, title, type, status, statusLabel,
	 *                          editUrl, viewUrl, modified, blocks (name → count),
	 *                          shortcodes (ids), templates (ids).
	 * @param array $shortcodes Shortcode id → title, layouts, editUrl, modified.
	 * @param array $templates  Template id → title, layouts, editUrl, modified.
	 * @return array<int, array<string, mixed>> Rows.
	 */
	public static function build_rows( array $locations, array $shortcodes, array $templates ) {
		$rows    = array();
		$sources = array(
			'shortcode' => $shortcodes,
			'template'  => $templates,
		);
		$placed  = array(
			'shortcode' => array(),
			'template'  => array(),
		);

		foreach ( $locations as $location ) {
			$place    = array(
				'title'       => isset( $location['title'] ) ? (string) $location['title'] : '',
				'type'        => isset( $location['type'] ) ? (string) $location['type'] : '',
				'status'      => isset( $location['status'] ) ? (string) $location['status'] : 'publish',
				'statusLabel' => isset( $location['statusLabel'] ) ? (string) $location['statusLabel'] : '',
				'editUrl'     => isset( $location['editUrl'] ) ? (string) $location['editUrl'] : '',
				'viewUrl'     => isset( $location['viewUrl'] ) ? (string) $location['viewUrl'] : '',
			);
			$key      = isset( $location['key'] ) ? (string) $location['key'] : '';
			$modified = isset( $location['modified'] ) ? (int) $location['modified'] : 0;

			$blocks = isset( $location['blocks'] ) && is_array( $location['blocks'] ) ? $location['blocks'] : array();
			if ( ! empty( $blocks ) ) {
				$rows[] = array(
					'key'      => $key . ':block',
					'source'   => 'block',
					'location' => $place,
					'layouts'  => self::block_layouts( $blocks ),
					'names'    => array(),
					'modified' => $modified,
					'editUrl'  => $place['editUrl'],
				);
			}

			foreach ( array(
				'shortcode' => 'shortcodes',
				'template'  => 'templates',
			) as $source => $field ) {
				$ids     = isset( $location[ $field ] ) && is_array( $location[ $field ] ) ? $location[ $field ] : array();
				$layouts = array();
				$names   = array();

				foreach ( array_unique( array_map( 'intval', $ids ) ) as $id ) {
					if ( ! isset( $sources[ $source ][ $id ] ) ) {
						continue;
					}

					$item                     = $sources[ $source ][ $id ];
					$placed[ $source ][ $id ] = true;
					$names[]                  = isset( $item['title'] ) ? (string) $item['title'] : '';
					$layouts                  = array_merge( $layouts, isset( $item['layouts'] ) ? (array) $item['layouts'] : array() );
				}

				if ( empty( $names ) ) {
					continue;
				}

				$rows[] = array(
					'key'      => $key . ':' . $source,
					'source'   => $source,
					'location' => $place,
					'layouts'  => array_values( array_unique( $layouts ) ),
					'names'    => $names,
					'modified' => $modified,
					'editUrl'  => $place['editUrl'],
				);
			}
		}

		foreach ( $sources as $source => $items ) {
			foreach ( $items as $id => $item ) {
				if ( isset( $placed[ $source ][ $id ] ) ) {
					continue;
				}

				$rows[] = array(
					'key'      => $source . '-' . $id . ':unused',
					'source'   => $source,
					'location' => null,
					'layouts'  => array_values( array_unique( isset( $item['layouts'] ) ? (array) $item['layouts'] : array() ) ),
					'names'    => array( isset( $item['title'] ) ? (string) $item['title'] : '' ),
					'modified' => isset( $item['modified'] ) ? (int) $item['modified'] : 0,
					'editUrl'  => isset( $item['editUrl'] ) ? (string) $item['editUrl'] : '',
				);
			}
		}

		// Stable newest-first: equal dates keep scan order.
		$order = array_keys( $rows );
		array_multisort( array_column( $rows, 'modified' ), SORT_DESC, $order, SORT_ASC, $rows );

		return $rows;
	}

	/**
	 * Record the time whenever widgets are saved, from any screen: the block
	 * widget editor (REST), the classic Widgets screen or the Customizer.
	 *
	 * @return void
	 */
	public static function register_hooks() {
		foreach ( self::WIDGET_OPTIONS as $option ) {
			add_action( 'add_option_' . $option, array( __CLASS__, 'touch_widgets' ) );
			add_action( 'update_option_' . $option, array( __CLASS__, 'touch_widgets' ) );
		}
	}

	/**
	 * Stamp the widgets as updated now. WordPress fires the update hook only
	 * when the stored value really changed.
	 *
	 * @return void
	 */
	public static function touch_widgets() {
		update_option( self::WIDGETS_MODIFIED_OPTION, time(), false );
	}

	/**
	 * The placements report.
	 *
	 * Served from the stored report whenever there is one. The site is scanned
	 * only when nothing is stored yet (the first visit) or when `$force` asks
	 * for it (the dashboard's Sync button).
	 *
	 * @param bool $force Scan the site again and replace the stored report.
	 * @return array<string, mixed> Report: rows, capped, scannedAt.
	 */
	public static function report( $force = false ) {
		$cached = get_option( self::CACHE_OPTION );

		if ( ! $force && self::is_current_cache( $cached ) ) {
			return $cached['report'];
		}

		$report = self::scan();
		update_option(
			self::CACHE_OPTION,
			array(
				'version' => self::CACHE_VERSION,
				'report'  => $report,
			),
			false
		);

		return $report;
	}

	/**
	 * Whether the stored report lists any team showcase. Never scans, so the
	 * dashboard bootstrap stays cheap; a site never scanned reads as none.
	 *
	 * @return bool
	 */
	public static function has_stored_rows() {
		$cached = get_option( self::CACHE_OPTION );

		return self::is_current_cache( $cached ) && ! empty( $cached['report']['rows'] );
	}

	/**
	 * Whether a stored value is a report this version can serve.
	 *
	 * @param mixed $cached What the cache option holds.
	 * @return bool
	 */
	public static function is_current_cache( $cached ) {
		return is_array( $cached )
			&& isset( $cached['version'], $cached['report'] )
			&& self::CACHE_VERSION === $cached['version']
			&& is_array( $cached['report'] )
			&& isset( $cached['report']['rows'] )
			&& is_array( $cached['report']['rows'] );
	}

	/**
	 * Read every place that shows a team, and what it shows.
	 *
	 * The LIKE narrows the read to posts whose content mentions a block or
	 * shortcode at all; parse_blocks() and the shortcode matcher then read
	 * what is really there.
	 *
	 * @return array<string, mixed>
	 */
	private static function scan() {
		global $wpdb;

		$types = array_values( array_diff( get_post_types( array(), 'names' ), self::EXCLUDED_TYPES ) );

		if ( empty( $types ) ) {
			return self::empty_report();
		}

		$markers = array( '<!-- wp:sptp/', '<!-- wp:' . self::SHORTCODE_BLOCK );
		foreach ( array_keys( self::SHORTCODE_TAGS ) as $tag ) {
			$markers[] = '[' . $tag;
		}

		$likes = array();
		foreach ( $markers as $marker ) {
			$likes[] = '%' . $wpdb->esc_like( $marker ) . '%';
		}

		$type_placeholders   = implode( ', ', array_fill( 0, count( $types ), '%s' ) );
		$status_placeholders = implode( ', ', array_fill( 0, count( self::STATUSES ), '%s' ) );
		$like_clauses        = implode( ' OR ', array_fill( 0, count( $likes ), 'post_content LIKE %s' ) );

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- one bounded read, cached in an option; placeholders are built from counted arrays.
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT ID FROM {$wpdb->posts} WHERE post_type IN ( {$type_placeholders} ) AND post_status IN ( {$status_placeholders} ) AND ( {$like_clauses} ) ORDER BY post_modified_gmt DESC LIMIT %d",
				array_merge( $types, self::STATUSES, $likes, array( self::MAX_POSTS + 1 ) )
			)
		);
		// phpcs:enable

		$capped    = count( $ids ) > self::MAX_POSTS;
		$ids       = array_slice( array_map( 'absint', (array) $ids ), 0, self::MAX_POSTS );
		$locations = array();

		// One batched read for every post (and its terms, for permalinks) instead of one per get_post().
		_prime_post_caches( $ids, true, false );

		foreach ( $ids as $id ) {
			$post = get_post( $id );
			if ( ! $post ) {
				continue;
			}

			$location = self::post_location( $post );
			if ( $location ) {
				$locations[] = $location;
			}
		}

		$widgets = self::widget_location();
		if ( $widgets ) {
			$locations[] = $widgets;
		}

		return array(
			'rows'      => self::build_rows( $locations, self::sources( SavedTemplates::CLASSIC_POST_TYPE ), self::sources( SavedTemplates::POST_TYPE ) ),
			'capped'    => $capped,
			'scannedAt' => time(),
		);
	}

	/**
	 * What one post shows, or null when it shows nothing.
	 *
	 * @param \WP_Post $post Post.
	 * @return array<string, mixed>|null
	 */
	private static function post_location( \WP_Post $post ) {
		$parsed     = parse_blocks( $post->post_content );
		$blocks     = self::count_blocks( $parsed );
		$found      = self::find_shortcode_ids( $post->post_content );
		$shortcodes = array_values( array_unique( array_merge( self::find_block_shortcode_ids( $parsed ), $found['shortcode'] ) ) );
		$templates  = $found['template'];

		if ( empty( $blocks ) && empty( $shortcodes ) && empty( $templates ) ) {
			return null;
		}

		$type_object = get_post_type_object( $post->post_type );
		$is_public   = $type_object && ( $type_object->public || $type_object->publicly_queryable );
		$status      = get_post_status_object( $post->post_status );
		$view_url    = '';

		if ( $is_public ) {
			$view_url = in_array( $post->post_status, array( 'publish', 'private' ), true )
				? (string) get_permalink( $post )
				: (string) get_preview_post_link( $post );
		}

		return array(
			'key'         => 'post-' . $post->ID,
			'title'       => self::title( $post ),
			'type'        => $type_object ? $type_object->labels->singular_name : $post->post_type,
			'status'      => $post->post_status,
			'statusLabel' => 'publish' === $post->post_status ? '' : ( $status ? $status->label : $post->post_status ),
			'editUrl'     => current_user_can( 'edit_post', $post->ID ) ? (string) get_edit_post_link( $post->ID, 'raw' ) : '',
			'viewUrl'     => $view_url,
			'modified'    => (int) get_post_modified_time( 'U', true, $post ),
			'blocks'      => $blocks,
			'shortcodes'  => $shortcodes,
			'templates'   => $templates,
		);
	}

	/**
	 * The active widget areas, as one location, or null when no active widget
	 * shows anything. Block and Text widgets are read; a widget parked under
	 * "Inactive widgets" is not on the site.
	 *
	 * @return array<string, mixed>|null
	 */
	private static function widget_location() {
		$sidebars = get_option( 'sidebars_widgets' );
		if ( ! is_array( $sidebars ) ) {
			return null;
		}

		$active = array();
		foreach ( $sidebars as $sidebar => $widget_ids ) {
			if ( 'wp_inactive_widgets' === $sidebar || ! is_array( $widget_ids ) ) {
				continue;
			}
			foreach ( $widget_ids as $widget_id ) {
				$active[ (string) $widget_id ] = true;
			}
		}

		$content = '';
		foreach ( array(
			'block' => 'content',
			'text'  => 'text',
		) as $base => $field ) {
			$instances = get_option( 'widget_' . $base );
			if ( ! is_array( $instances ) ) {
				continue;
			}
			foreach ( $instances as $number => $instance ) {
				if ( isset( $active[ $base . '-' . $number ] ) && is_array( $instance ) && ! empty( $instance[ $field ] ) ) {
					$content .= "\n" . (string) $instance[ $field ];
				}
			}
		}

		if ( '' === $content ) {
			return null;
		}

		$parsed     = parse_blocks( $content );
		$found      = self::find_shortcode_ids( $content );
		$blocks     = self::count_blocks( $parsed );
		$shortcodes = array_values( array_unique( array_merge( self::find_block_shortcode_ids( $parsed ), $found['shortcode'] ) ) );

		if ( empty( $blocks ) && empty( $shortcodes ) && empty( $found['template'] ) ) {
			return null;
		}

		return array(
			'key'         => 'widgets',
			'title'       => __( 'Widgets', 'team-free' ),
			'type'        => __( 'Widget', 'team-free' ),
			'status'      => 'publish',
			'statusLabel' => '',
			'editUrl'     => current_user_can( 'edit_theme_options' ) ? admin_url( 'widgets.php' ) : '',
			'viewUrl'     => home_url( '/' ),
			// 0 (shown as a dash) until widgets are next saved.
			'modified'    => absint( get_option( self::WIDGETS_MODIFIED_OPTION, 0 ) ),
			'blocks'      => $blocks,
			'shortcodes'  => $shortcodes,
			'templates'   => $found['template'],
		);
	}

	/**
	 * Classic shortcodes or saved templates, keyed by id.
	 *
	 * @param string $post_type Source post type.
	 * @return array<int, array<string, mixed>>
	 */
	private static function sources( $post_type ) {
		$posts = get_posts(
			array(
				'post_type'              => $post_type,
				'post_status'            => self::STATUSES,
				'numberposts'            => self::MAX_POSTS,
				'orderby'                => 'modified',
				'order'                  => 'DESC',
				'update_post_term_cache' => false,
				// Only classic shortcodes read meta (their layout).
				'update_post_meta_cache' => SavedTemplates::CLASSIC_POST_TYPE === $post_type,
			)
		);

		$sources = array();

		foreach ( $posts as $post ) {
			if ( SavedTemplates::CLASSIC_POST_TYPE === $post_type ) {
				$layouts = array( self::shortcode_layout_label( get_post_meta( $post->ID, '_sptp_generator_layout', true ) ) );
			} else {
				$layouts = self::block_layouts( self::count_blocks( parse_blocks( $post->post_content ) ) );
			}

			$sources[ (int) $post->ID ] = array(
				'title'    => self::title( $post ),
				'layouts'  => $layouts,
				'editUrl'  => current_user_can( 'edit_post', $post->ID ) ? (string) get_edit_post_link( $post->ID, 'raw' ) : '',
				'modified' => (int) get_post_modified_time( 'U', true, $post ),
			);
		}

		return $sources;
	}

	/**
	 * A post's title as plain text, or a placeholder for an untitled one.
	 *
	 * @param \WP_Post $post Post.
	 * @return string
	 */
	private static function title( \WP_Post $post ) {
		$title = get_the_title( $post );

		return '' !== trim( $title ) ? wp_strip_all_tags( html_entity_decode( $title, ENT_QUOTES, 'UTF-8' ) ) : __( '(no title)', 'team-free' );
	}

	/**
	 * A report for a site with nothing to scan.
	 *
	 * @return array<string, mixed>
	 */
	private static function empty_report() {
		return array(
			'rows'      => array(),
			'capped'    => false,
			'scannedAt' => time(),
		);
	}
}
