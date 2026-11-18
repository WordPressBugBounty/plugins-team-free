<?php
/**
 * Admin dashboard — menu, asset enqueue and React mount point.
 *
 * Mirrors Smart Team Pro's Dashboard class, reduced to what Free ships today:
 * one page that hosts the React app (Dashboard, Blocks, Modules, Saved Templates
 * and Settings). It is booted from
 * Team::define_admin_hooks(), so it never runs while Pro is active.
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

defined( 'ABSPATH' ) || exit;

/**
 * Class Dashboard
 */
class Dashboard {

	/**
	 * Parent menu slug — the team member CPT list.
	 *
	 * @var string
	 */
	private $parent_slug = 'edit.php?post_type=sptp_member';

	/**
	 * Dashboard page slug.
	 *
	 * @var string
	 */
	private $page_slug = 'sptp_dashboard';

	/**
	 * The retired classic Settings screen's slug. The sidebar "Settings" entry
	 * still registers under it (move_to_front() repoints the link), and old
	 * links to it are redirected to Settings → Accessibility.
	 *
	 * @var string
	 */
	private $classic_settings_slug = 'team_settings';

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'admin_menu', array( $this, 'register_menu' ), 20 );
		// After every other submenu is registered, so Getting Started can be moved first.
		add_action( 'admin_menu', array( $this, 'move_to_front' ), 999 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'in_admin_header', array( $this, 'hide_admin_notices' ), 1000 );
		add_filter( 'submenu_file', array( $this, 'highlight_submenu' ) );
		// Late enough to win over the review / version text Admin.php prints on
		// the member screens: the dashboard carries its own footer.
		add_filter( 'admin_footer_text', array( $this, 'remove_admin_footer_text' ), 99 );
		add_filter( 'update_footer', array( $this, 'remove_admin_footer_text' ), 99 );
		add_action( 'admin_head', array( $this, 'hide_admin_footer' ), 999 );
		// The classic Tools screen moved into Settings → Tools; keep old links alive.
		// `admin_menu`, not `admin_init`: core's "not allowed to access this page"
		// check runs right after `admin_menu`, before `admin_init` ever fires.
		add_action( 'admin_menu', array( $this, 'redirect_classic_tools' ), 1000 );
		// The classic Settings screen (its only section, Accessibility, moved into the dashboard).
		add_action( 'admin_menu', array( $this, 'register_settings_entry' ) );
		add_action( 'admin_menu', array( $this, 'redirect_classic_settings' ), 1000 );
	}

	/**
	 * Send the retired classic Tools URL to Settings → Tools.
	 *
	 * @return void
	 */
	public function redirect_classic_tools() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET['post_type'], $_GET['page'] ) || 'sptp_member' !== sanitize_key( wp_unslash( $_GET['post_type'] ) ) || 'team_tools' !== sanitize_key( wp_unslash( $_GET['page'] ) ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		wp_safe_redirect( admin_url( 'edit.php?post_type=sptp_member&page=' . $this->page_slug . '#settings=tools' ) );
		exit;
	}

	/**
	 * Keep the sidebar "Settings" entry the classic screen used to provide.
	 *
	 * Nothing renders under this slug any more: move_to_front() repoints the
	 * link at the dashboard's Settings page, and redirect_classic_settings()
	 * catches a request for the old URL. Registered at the framework's own
	 * priority, so the entry keeps its place in the submenu.
	 *
	 * @return void
	 */
	public function register_settings_entry() {
		// Same filter the classic screen used, so a site that widened it keeps its entry.
		$capability = apply_filters( 'sp_wp_team_ui_permission', 'manage_options' );

		add_submenu_page(
			$this->parent_slug,
			__( 'Settings', 'team-free' ),
			__( 'Settings', 'team-free' ),
			$capability,
			$this->classic_settings_slug,
			'__return_null'
		);
	}

	/**
	 * Send the retired classic Settings URL to Settings → Accessibility.
	 *
	 * @return void
	 */
	public function redirect_classic_settings() {
		if ( ! $this->is_screen( $this->classic_settings_slug ) || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		wp_safe_redirect( admin_url( 'edit.php?post_type=sptp_member&page=' . $this->page_slug . '#settings=accessibility' ) );
		exit;
	}

	/**
	 * Mark Getting Started as the current submenu entry on its own screen.
	 *
	 * move_to_front() swaps the item's slug for the full CPT URL, so core's usual
	 * `$plugin_page === $slug` match no longer finds it; `$submenu_file` is the
	 * other way core decides which entry is current.
	 *
	 * @param string|null $submenu_file The submenu file core resolved.
	 * @return string|null
	 */
	public function highlight_submenu( $submenu_file ) {
		if ( ! $this->is_dashboard_screen() ) {
			return $submenu_file;
		}

		return $this->parent_slug . '&page=' . $this->page_slug;
	}

	/**
	 * The sidebar "Settings" entry's slug: the dashboard's Settings page, opened
	 * on its first tab (Integrations).
	 *
	 * @return string
	 */
	private function settings_menu_slug() {
		return $this->parent_slug . '&page=' . $this->page_slug . '#settings=integrations';
	}

	/**
	 * Register the dashboard submenu page.
	 *
	 * @return void
	 */
	public function register_menu() {
		add_submenu_page(
			$this->parent_slug,
			__( 'Smart Team Dashboard', 'team-free' ),
			__( 'Getting Started', 'team-free' ),
			'manage_options',
			$this->page_slug,
			array( $this, 'render_wrapper' )
		);
	}

	/**
	 * Move Getting Started to the top of the Smart Team submenu.
	 *
	 * The page registers with its bare slug, which WordPress turns into a broken
	 * `admin.php?page=` link when it builds the top-level "Smart Team" link from
	 * the first submenu item. Swapping in the full CPT URL makes the top-level
	 * link open the dashboard directly.
	 *
	 * @return void
	 */
	public function move_to_front() {
		global $submenu;

		if ( empty( $submenu[ $this->parent_slug ] ) ) {
			return;
		}

		$dashboard_item = null;

		foreach ( $submenu[ $this->parent_slug ] as $key => $item ) {
			if ( ! isset( $item[2] ) ) {
				continue;
			}

			// Settings lives on the dashboard: only the entry's link points there.
			if ( $this->classic_settings_slug === $item[2] ) {
				$this->keep_page_title( $item );
				$submenu[ $this->parent_slug ][ $key ][2] = $this->settings_menu_slug();
				continue;
			}

			if ( $this->page_slug === $item[2] ) {
				$this->keep_page_title( $item );
				$dashboard_item = $item;
				unset( $submenu[ $this->parent_slug ][ $key ] );
			}
		}

		if ( null !== $dashboard_item ) {
			$dashboard_item[2] = $this->parent_slug . '&page=' . $this->page_slug;
			array_unshift( $submenu[ $this->parent_slug ], $dashboard_item );
		}
	}

	/**
	 * Set the screen title before move_to_front() rewrites the item's slug.
	 *
	 * Core's get_admin_page_title() finds a plugin page's title by matching
	 * `$plugin_page` against the submenu slugs; once the slug is rewritten that
	 * match fails, `$title` stays null and admin-header.php passes it to
	 * strip_tags() (a deprecation notice on PHP 8.1+).
	 *
	 * @param array $item Submenu item: menu title, capability, slug, page title.
	 * @return void
	 */
	private function keep_page_title( $item ) {
		global $title;

		if ( ! $this->is_screen( $item[2] ) ) {
			return;
		}

		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- core reads $title for the screen's <title>.
		$title = isset( $item[3] ) ? $item[3] : $item[0];
	}

	/**
	 * React mount point.
	 *
	 * @return void
	 */
	public function render_wrapper() {
		?>
		<div id="sptp-admin-dashboard-wrapper" class="sptp-admin-dashboard-wrapper"></div>
		<?php
	}

	/**
	 * Blank core's footer text on the dashboard screen only.
	 *
	 * @param string $text The footer text.
	 * @return string
	 */
	public function remove_admin_footer_text( $text ) {
		return $this->is_dashboard_screen() ? '' : $text;
	}

	/**
	 * Hide core's now-empty #wpfooter on the dashboard screen, so blanking the
	 * text does not leave a bare strip under the dashboard's own footer.
	 *
	 * @return void
	 */
	public function hide_admin_footer() {
		if ( ! $this->is_dashboard_screen() ) {
			return;
		}

		// !important: this prints before the admin stylesheets on the same hook.
		echo '<style id="sptp-hide-wp-footer">#wpfooter{display:none !important}#wpbody-content{padding-bottom:0}</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static CSS literal.
	}

	/**
	 * Remove all admin notices on the dashboard screen only.
	 *
	 * `in_admin_header` fires before the notice hooks are output, so removing
	 * their callbacks here hides every notice on this page and no other.
	 *
	 * @return void
	 */
	public function hide_admin_notices() {
		if ( ! $this->is_dashboard_screen() ) {
			return;
		}

		remove_all_actions( 'user_admin_notices' );
		remove_all_actions( 'admin_notices' );
		remove_all_actions( 'all_admin_notices' );
		remove_all_actions( 'network_admin_notices' );
	}

	/**
	 * Whether the current admin screen is the dashboard page.
	 *
	 * @return bool
	 */
	private function is_dashboard_screen() {
		return $this->is_screen( $this->page_slug );
	}

	/**
	 * Whether the current admin screen is the given page of the member menu.
	 *
	 * @param string $slug Submenu page slug.
	 * @return bool
	 */
	private function is_screen( $slug ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return isset( $_GET['post_type'], $_GET['page'] )
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			&& 'sptp_member' === sanitize_key( wp_unslash( $_GET['post_type'] ) )
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			&& $slug === sanitize_key( wp_unslash( $_GET['page'] ) );
	}

	/**
	 * Enqueue the built dashboard bundle on the dashboard screen only.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		if ( ! $this->is_dashboard_screen() ) {
			return;
		}

		$dist_path = SPT_PLUGIN_PATH . 'dist/dashboard/';
		$dist_url  = SPT_PLUGIN_ROOT . 'dist/dashboard/';
		$asset     = $dist_path . 'index.asset.php';

		$deps    = array( 'wp-element', 'wp-data', 'wp-api-fetch', 'wp-i18n' );
		$version = SPT_PLUGIN_VERSION;

		if ( file_exists( $asset ) ) {
			$asset_data = require $asset;
			if ( ! empty( $asset_data['dependencies'] ) ) {
				$deps = $asset_data['dependencies'];
			}
			if ( ! empty( $asset_data['version'] ) ) {
				$version = $asset_data['version'];
			}
		}

		/*
		 * Settings → Additional CSS & JS mounts WordPress' bundled CodeMirror. Both
		 * calls are false when the user switched syntax highlighting off in their
		 * profile — only claim the dependency when the editor is really loading, so
		 * that preference keeps the plain-textarea fallback. `lint` on the CSS
		 * editor is what makes wp_enqueue_code_editor() load csslint.
		 */
		$css_editor_settings = wp_enqueue_code_editor(
			array(
				'type'       => 'text/css',
				'codemirror' => array(
					'mode' => 'css',
					'lint' => true,
				),
			)
		);
		$js_editor_settings  = wp_enqueue_code_editor( array( 'type' => 'text/javascript' ) );

		if ( false !== $css_editor_settings || false !== $js_editor_settings ) {
			$deps = array_merge( $deps, array( 'wp-codemirror', 'code-editor' ) );
		}

		wp_enqueue_script( 'sptp-dashboard', $dist_url . 'index.js', $deps, $version, true );

		wp_localize_script(
			'sptp-dashboard',
			'sptpDashboard',
			array(
				'ajaxUrl'    => admin_url( 'admin-ajax.php' ),
				'adminUrl'   => admin_url(),
				// Settings → Tools posts to the classic import/export ajax actions,
				// which verify this nonce.
				'toolsNonce' => wp_create_nonce( 'spf_options_nonce' ),
				// Produced by an enqueue-time core function, so it cannot ride the
				// REST payload: the editor field needs it synchronously on mount.
				'codeEditor' => array(
					'css' => false !== $css_editor_settings ? $css_editor_settings : null,
					'js'  => false !== $js_editor_settings ? $js_editor_settings : null,
				),
			)
		);

		if ( file_exists( $dist_path . 'index.css' ) ) {
			wp_enqueue_style( 'sptp-dashboard', $dist_url . 'index.css', array(), $version );
		}
		// Emitted when SCSS imported by the entry resolves to its own stylesheet.
		if ( file_exists( $dist_path . 'style-index.css' ) ) {
			wp_enqueue_style( 'sptp-dashboard-style', $dist_url . 'style-index.css', array(), $version );
		}

		wp_set_script_translations( 'sptp-dashboard', 'team-free' );
	}
}
