<?php
/**
 * Dashboard REST API — the bootstrap payload for the React dashboard.
 *
 * GET returns the bootstrap payload; POST saves the Blocks page's `active_blocks`, the Modules page's `modules`, Settings → Integrations' `integrations`
 * and the Settings page's `performance` / `advanced` / `customCode` groups and the Single Page page's `singlePage` (all in the classic `_sptp_settings` option),
 * plus Advanced Controls' opt-in `diagnostics` consent (its own `sptp_diagnostics` option, via Diagnostics::record_consent())
 * and Settings → AI Configuration's `ai` keys (`sptp_ai_settings`, via AIKeyManager::save()).
 * The route name matches Smart Team Pro's so later pages port without changes. The `/saved-templates`
 * routes back the Saved Templates table: the list (block-editor `sptp_saved_template` posts plus the
 * legacy `sptp_generator` ones) and its bulk / duplicate mutations. `/placements` backs the
 * Dashboard's Team Showcase Placements table (Placements::report()).
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

use ShapedPlugin\WPTeam\Blocks\Includes\AI\AIFeature;
use ShapedPlugin\WPTeam\Blocks\Includes\AI\AIKeyManager;
use ShapedPlugin\WPTeam\Blocks\Includes\AI\ConnectorBridge;
use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

defined( 'ABSPATH' ) || exit;

/**
 * Class ManageAPI
 */
class ManageAPI {

	/**
	 * REST namespace shared with the block layer's routes.
	 *
	 * @var string
	 */
	const REST_NAMESPACE = 'sptp/v1';

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register the REST routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			self::REST_NAMESPACE,
			'/settings',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
					'args'                => array(
						// Only Settings → AI Configuration asks for it: probing a
						// WordPress Connector lists the provider's models over HTTP.
						'ai_probe' => array(
							'type'              => 'boolean',
							'default'           => false,
							'sanitize_callback' => 'rest_sanitize_boolean',
						),
					),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);

		// Our Plugins → ShapedPlugin's other free plugins (install cards).
		register_rest_route(
			self::REST_NAMESPACE,
			'/our-plugins',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_our_plugins' ),
				'permission_callback' => array( $this, 'check_install_permission' ),
			)
		);

		// Settings → Performance → Flush Cache.
		register_rest_route(
			self::REST_NAMESPACE,
			'/clear-cache',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'clear_cache' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);

		register_rest_route(
			self::REST_NAMESPACE,
			'/changelog',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_changelog' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);

		register_rest_route(
			self::REST_NAMESPACE,
			'/saved-templates',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_saved_templates' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'search'   => array(
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'page'     => array(
						'type'              => 'integer',
						'default'           => 1,
						'sanitize_callback' => 'absint',
					),
					'per_page' => array(
						'type'              => 'integer',
						'default'           => 10,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		// Bulk publish / draft / delete from the Saved Templates table.
		register_rest_route(
			self::REST_NAMESPACE,
			'/saved-templates/bulk',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'bulk_saved_templates' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'ids'    => array(
						'type'     => 'array',
						'required' => true,
						'items'    => array( 'type' => 'integer' ),
					),
					'action' => array(
						'type'     => 'string',
						'required' => true,
						'enum'     => array( 'publish', 'draft', 'delete' ),
					),
				),
			)
		);

		// Duplicate one row of the Saved Templates table.
		register_rest_route(
			self::REST_NAMESPACE,
			'/saved-templates/duplicate',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'duplicate_saved_template' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'id' => array(
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		// Dashboard → Team Showcase Placements. `refresh` is the Sync button.
		register_rest_route(
			self::REST_NAMESPACE,
			'/placements',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_placements' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'refresh' => array(
						'type'    => 'boolean',
						'default' => false,
					),
				),
			)
		);
	}

	/**
	 * GET /placements — the stored placements report, rescanned on `refresh`.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_placements( \WP_REST_Request $request ) {
		return rest_ensure_response( Placements::report( (bool) $request->get_param( 'refresh' ) ) );
	}

	/**
	 * GET /changelog — the drawer's release notes.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_changelog() {
		return rest_ensure_response( array( 'changelog' => Changelog::get_html() ) );
	}

	/**
	 * GET /our-plugins — the Our Plugins install cards.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_our_plugins() {
		return rest_ensure_response( array( 'plugins' => OurPlugins::get() ) );
	}

	/**
	 * POST /clear-cache — drop every `sptp_` transient.
	 *
	 * @return \WP_REST_Response
	 */
	public function clear_cache() {
		return rest_ensure_response(
			array(
				'success' => true,
				'removed' => DashboardHelper::flush_transients(),
			)
		);
	}

	/**
	 * Only administrators may read or change the dashboard settings.
	 *
	 * @return bool
	 */
	public function check_permission() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Only users who may install plugins can see the install cards.
	 *
	 * @return bool
	 */
	public function check_install_permission() {
		return current_user_can( 'install_plugins' );
	}

	/**
	 * The payload the React store bootstraps from.
	 *
	 * @param bool $probe_ai Whether to probe WordPress Connectors for the `ai`
	 *                       group (an outbound model-list call; AI tab only).
	 * @return array
	 */
	private function response_data( $probe_ai = false ) {
		return array(
			'dashboardInfo' => array(
				'pluginUrl'      => SPT_PLUGIN_ROOT,
				'pluginVersion'  => SPT_PLUGIN_VERSION,
				'adminUrl'       => admin_url(),
				'homeUrl'        => home_url( '/' ),
				'userName'       => wp_get_current_user()->display_name,
				// Picks the Getting Started greeting: first-run welcome vs returning user.
				'hasShowcases'   => Placements::has_stored_rows(),
				// Our Plugins tab: GET /our-plugins needs install_plugins (off on multisite sub-sites / DISALLOW_FILE_MODS).
				'canInstallPlugins' => current_user_can( 'install_plugins' ),
				'productHomeUrl' => 'https://getwpteam.com/',
				'allBlockList'   => DashboardHelper::get_all_block_list(),
				'freeBlocks'     => Pro_Gate::FREE_BLOCKS,
				'freeModules'    => array_keys( DashboardHelper::FREE_MODULES ),
				'upgradeUrl'     => 'https://getwpteam.com/pricing/?utm_source=free-plugin&utm_medium=pro-modules',
				// The module half of AIFeature::is_available() is read live from settings.modules.
				'siteAllowsAI'   => ConnectorBridge::site_allows_ai(),
			),
			'settings'      => array(
				'active_blocks' => DashboardHelper::get_active_blocks(),
				'modules'       => DashboardHelper::get_modules(),
				'integrations'  => DashboardHelper::get_integrations(),
			),
			'performance'   => DashboardHelper::get_performance_settings(),
			'advanced'      => DashboardHelper::get_advanced_settings(),
			'customCode'    => DashboardHelper::get_custom_code_settings(),
			'singlePage'    => SinglePageSettings::get_settings(),
			'whiteLabel'    => WhiteLabel::get_settings(),
			'accessibility' => AccessibilitySettings::get_settings(),
			'preloader'     => DashboardHelper::get_preloader_settings(),
			'diagnostics'   => Diagnostics::get_state(),
			'ai'            => AIFeature::is_module_enabled() ? AIKeyManager::get_public_settings( (bool) $probe_ai ) : null,
			// Defaults ride the payload so each panel's Reset uses them instead of
			// a second hand-kept copy in JS.
			'settingsMeta'  => array(
				'performanceDefaults' => DashboardHelper::PERFORMANCE_DEFAULTS,
				// No `allow_diagnostic_data`: Reset restores settings, it never
				// changes the diagnostic-data consent (useSettingsDraft keeps it).
				'advancedDefaults'    => DashboardHelper::ADVANCED_DEFAULTS,
				'customCodeDefaults'  => DashboardHelper::CUSTOM_CODE_DEFAULTS,
				'singlePageDefaults'  => SinglePageSettings::defaults(),
				'whiteLabelDefaults'  => WhiteLabel::defaults(),
				'preloaderDefaults'   => DashboardHelper::PRELOADER_DEFAULTS,
				'accessibilityDefaults' => AccessibilitySettings::defaults(),
				'singlePage'          => SinglePageSettings::get_meta(),
			),
			'generators'    => DashboardHelper::get_generator_list(),
		);
	}

	/**
	 * GET /settings. `?ai_probe=1` (Settings → AI Configuration) also probes
	 * WordPress Connectors; every other screen skips that outbound call.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_settings( $request ) {
		return rest_ensure_response( $this->response_data( (bool) $request->get_param( 'ai_probe' ) ) );
	}

	/**
	 * POST /settings — saves the submitted `settings.active_blocks`, `settings.modules`, `settings.integrations`, `performance`, `advanced`, `customCode`, `singlePage`, `whiteLabel`, `accessibility`, `preloader`, `diagnostics` and `ai`.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function update_settings( $request ) {
		$params = $request->get_json_params();

		if ( isset( $params['settings']['active_blocks'] ) ) {
			DashboardHelper::save_active_blocks( $params['settings']['active_blocks'] );
		}

		if ( isset( $params['settings']['modules'] ) ) {
			DashboardHelper::save_modules( $params['settings']['modules'] );
		}

		if ( isset( $params['settings']['integrations'] ) ) {
			DashboardHelper::save_integrations( $params['settings']['integrations'] );
		}

		if ( isset( $params['performance'] ) && is_array( $params['performance'] ) ) {
			DashboardHelper::save_performance_settings( $params['performance'] );
		}

		if ( isset( $params['advanced'] ) && is_array( $params['advanced'] ) ) {
			DashboardHelper::save_advanced_settings( $params['advanced'] );
		}

		if ( isset( $params['customCode'] ) && is_array( $params['customCode'] ) ) {
			DashboardHelper::save_custom_code_settings( $params['customCode'] );
		}

		if ( isset( $params['singlePage'] ) && is_array( $params['singlePage'] ) ) {
			SinglePageSettings::save_settings( $params['singlePage'] );
		}

		if ( isset( $params['whiteLabel'] ) && is_array( $params['whiteLabel'] ) ) {
			WhiteLabel::save_settings( $params['whiteLabel'] );
		}

		if ( isset( $params['preloader'] ) && is_array( $params['preloader'] ) ) {
			DashboardHelper::save_preloader_settings( $params['preloader'] );
		}

		if ( isset( $params['accessibility'] ) && is_array( $params['accessibility'] ) ) {
			AccessibilitySettings::save_settings( $params['accessibility'] );
		}

		// Through record_consent() rather than a plain setter, so opting in sends
		// the first report and consent_recorded silences the notice either way.
		if ( isset( $params['diagnostics']['allow_diagnostic_data'] ) ) {
			Diagnostics::record_consent( $params['diagnostics']['allow_diagnostic_data'] );
		}

		$ai_key_result = null;
		// is_available(): saving a key verifies it with the provider, which a site
		// that turned AI off (wp_supports_ai) must not do.
		if ( isset( $params['ai'] ) && is_array( $params['ai'] ) && AIFeature::is_available() ) {
			$ai_save       = AIKeyManager::save( $params['ai'] );
			$ai_key_result = array_merge( $ai_save['key'], array( 'provider' => $ai_save['provider'] ) );
		}

		$data = $this->response_data();

		// What happened to a submitted API key: a key the provider refused is
		// not stored, and the panel has to say so rather than report a save.
		if ( null !== $ai_key_result ) {
			$data['aiKeyResult'] = $ai_key_result;
		}

		return rest_ensure_response( $data );
	}

	/**
	 * GET /saved-templates — paginated list of saved templates.
	 *
	 * Two post types share the list, exactly like testimonial-pro's: the
	 * block-editor `sptp_saved_template` posts and the legacy `sptp_generator`
	 * ("classic") shortcodes. `library_count` tells the dashboard whether to show
	 * the first-run banner instead of the table chrome.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_saved_templates( $request ) {
		$search   = (string) $request->get_param( 'search' );
		$page     = max( 1, (int) $request->get_param( 'page' ) );
		$per_page = min( 100, max( 1, (int) $request->get_param( 'per_page' ) ) );

		$query = new \WP_Query(
			array(
				'post_type'      => array( SavedTemplates::POST_TYPE, SavedTemplates::CLASSIC_POST_TYPE ),
				'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
				'posts_per_page' => $per_page,
				'paged'          => $page,
				's'              => $search,
				'orderby'        => 'modified',
				'order'          => 'DESC',
			)
		);

		$templates = array();
		foreach ( $query->posts as $post ) {
			$is_block = SavedTemplates::POST_TYPE === $post->post_type;

			$templates[] = array(
				'id'          => $post->ID,
				'title'       => array(
					'rendered' => esc_html( get_the_title( $post ) ),
					'raw'      => $post->post_title,
				),
				'status'      => $post->post_status,
				'postType'    => $post->post_type,
				'editorType'  => $is_block ? 'block' : 'classic',
				'blockTitle'  => $is_block ? $this->template_block_title( $post->post_content ) : '',
				'shortcode'   => $is_block ? SavedTemplates::shortcode_for( $post->ID ) : SavedTemplates::classic_shortcode_for( $post->ID ),
				'editUrl'     => admin_url( 'post.php?post=' . $post->ID . '&action=edit' ),
				'modified'    => $post->post_modified,
				'modifiedGmt' => $post->post_modified_gmt,
			);
		}

		return rest_ensure_response(
			array(
				'templates'     => $templates,
				'total_items'   => (int) $query->found_posts,
				'total_pages'   => (int) $query->max_num_pages,
				// Deliberately unfiltered by the search term: an unmatched search must
				// not read as an empty library and bring the first-run banner back.
				'library_count' => '' === $search ? (int) $query->found_posts : $this->count_templates( SavedTemplates::POST_TYPE ) + $this->count_templates( SavedTemplates::CLASSIC_POST_TYPE ),
			)
		);
	}

	/**
	 * POST /saved-templates/bulk — publish / draft / delete the given rows.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function bulk_saved_templates( $request ) {
		$ids    = array_filter( array_map( 'absint', (array) $request->get_param( 'ids' ) ) );
		$action = (string) $request->get_param( 'action' );

		$done   = array();
		$failed = array();

		foreach ( array_unique( $ids ) as $id ) {
			if ( ! $this->is_manageable_template( $id ) ) {
				$failed[] = $id;
				continue;
			}

			if ( 'delete' === $action ) {
				if ( ! current_user_can( 'delete_post', $id ) || ! wp_delete_post( $id, true ) ) {
					$failed[] = $id;
					continue;
				}
			} else {
				if ( ! current_user_can( 'edit_post', $id ) ) {
					$failed[] = $id;
					continue;
				}
				$updated = wp_update_post(
					array(
						'ID'          => $id,
						'post_status' => 'publish' === $action ? 'publish' : 'draft',
					),
					true
				);
				if ( is_wp_error( $updated ) ) {
					$failed[] = $id;
					continue;
				}
			}

			$done[] = $id;
		}

		return rest_ensure_response(
			array(
				'action'  => $action,
				'updated' => $done,
				'failed'  => $failed,
			)
		);
	}

	/**
	 * POST /saved-templates/duplicate — copy a row as a draft.
	 *
	 * Runs server-side (rather than through the core data store, as
	 * testimonial-pro does) because the legacy generator keeps every setting in
	 * post meta that is not exposed over REST — a client-side copy would create
	 * an empty team.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function duplicate_saved_template( $request ) {
		$id = absint( $request->get_param( 'id' ) );

		if ( ! $this->is_manageable_template( $id ) || ! current_user_can( 'edit_post', $id ) ) {
			return new \WP_Error( 'sptp_invalid_template', __( 'Template not found.', 'team-free' ), array( 'status' => 404 ) );
		}

		$post   = get_post( $id );
		$new_id = wp_insert_post(
			array(
				'post_type'      => $post->post_type,
				'post_status'    => 'draft',
				'post_author'    => get_current_user_id(),
				/* translators: %s: original template title. */
				'post_title'     => wp_slash( sprintf( __( '%s (Copy)', 'team-free' ), $post->post_title ) ),
				'post_content'   => wp_slash( $post->post_content ),
				'post_excerpt'   => wp_slash( $post->post_excerpt ),
				'comment_status' => $post->comment_status,
				'ping_status'    => $post->ping_status,
				'menu_order'     => $post->menu_order,
			),
			true
		);

		if ( is_wp_error( $new_id ) ) {
			return $new_id;
		}

		// Copy every meta row — the generator's whole configuration lives there.
		foreach ( get_post_custom( $id ) as $key => $values ) {
			if ( '_edit_lock' === $key || '_edit_last' === $key ) {
				continue;
			}
			foreach ( $values as $value ) {
				if ( is_serialized( $value ) ) {
					$value = maybe_unserialize( $value );
				}
				add_post_meta( $new_id, $key, wp_slash( $value ) );
			}
		}

		foreach ( get_object_taxonomies( $post->post_type ) as $taxonomy ) {
			$terms = get_the_terms( $id, $taxonomy );
			if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
				wp_set_object_terms( $new_id, wp_list_pluck( $terms, 'slug' ), $taxonomy, false );
			}
		}

		return rest_ensure_response(
			array(
				'id'      => (int) $new_id,
				'editUrl' => admin_url( 'post.php?post=' . $new_id . '&action=edit' ),
			)
		);
	}

	/**
	 * Whether the id is one of the two post types this table manages.
	 *
	 * @param int $id Post id.
	 * @return bool
	 */
	private function is_manageable_template( $id ) {
		$type = get_post_type( $id );

		return in_array( $type, array( SavedTemplates::POST_TYPE, SavedTemplates::CLASSIC_POST_TYPE ), true );
	}

	/**
	 * Count a template post type across the statuses the list shows.
	 *
	 * @param string $post_type Post type.
	 * @return int
	 */
	private function count_templates( $post_type ) {
		$counts = wp_count_posts( $post_type );
		if ( empty( $counts ) ) {
			return 0;
		}

		$total = 0;
		foreach ( array( 'publish', 'draft', 'pending', 'private' ) as $status ) {
			$total += isset( $counts->$status ) ? (int) $counts->$status : 0;
		}

		return $total;
	}

	/**
	 * Title of the layout block a template holds, for the Block column.
	 *
	 * @param string $content Template post content.
	 * @return string Block title, or an empty string when there is none.
	 */
	private function template_block_title( $content ) {
		$block_name = $content ? $this->find_team_block_name( parse_blocks( $content ) ) : '';

		return '' === $block_name ? '' : self::layout_block_titles()[ $block_name ];
	}

	/**
	 * The layout blocks that name a template, keyed by block name. Also the
	 * layout names of the Dashboard's placements table.
	 *
	 * @return array<string, string>
	 */
	public static function layout_block_titles() {
		return array(
			'sptp/carousel'    => __( 'Carousel', 'team-free' ),
			'sptp/carousel-3d' => __( '3D Carousel', 'team-free' ),
			'sptp/grid'        => __( 'Grid', 'team-free' ),
		);
	}

	/**
	 * Depth-first search for the first layout block — templates may wrap it in a
	 * group or columns block, and the ajax addons nest it in `sptp/team-group`
	 * after the search/filter children, so only the layouts name a template.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return string Block name, or an empty string.
	 */
	private function find_team_block_name( $blocks ) {
		foreach ( $blocks as $block ) {
			if ( ! empty( $block['blockName'] ) && isset( self::layout_block_titles()[ $block['blockName'] ] ) ) {
				return $block['blockName'];
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$nested = $this->find_team_block_name( $block['innerBlocks'] );
				if ( '' !== $nested ) {
					return $nested;
				}
			}
		}

		return '';
	}
}
