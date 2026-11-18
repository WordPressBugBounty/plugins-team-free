<?php
/**
 * Consent-gated diagnostic data reporting (SDR).
 *
 * Ported from Smart Team Pro's Admin\Dashboard\Diagnostics. Nothing is sent until
 * an administrator opts in — through the wp-admin notice's Accept & Close button or
 * Settings → Advanced Controls → Contribute to Smart Team — and the same Settings
 * row revokes it. The payload carries the admin email and first/last name, so it is never described
 * as anonymous (readme.txt "External services", docs/wordpress-org.md §3).
 *
 * Everything about the feature lives here — the option accessors, the payload,
 * the transport, the weekly cron and the consent notice — so the rest of the
 * plugin only ever calls is_allowed() / record_consent().
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

defined( 'ABSPATH' ) || exit;

/**
 * Class Diagnostics
 */
class Diagnostics {

	/**
	 * Option holding the consent state.
	 *
	 * Pro's key and shape, so a decision made in either plugin carries over to
	 * the other. Its own option rather than a key inside `sptp_dashboard_options`
	 * or `_sptp_settings`, so no unrelated settings save can drop it.
	 *
	 * @var string
	 */
	const OPTION_KEY = 'sptp_diagnostics';

	/**
	 * Shape of the option. Consent defaults to false — opt-in, never opt-out.
	 *
	 * `consent_recorded` separates "said no" from "never asked": both leave
	 * `allow_diagnostic_data` false, but only the first should stop the notice.
	 *
	 * @var array<string, bool|int>
	 */
	const DEFAULTS = array(
		'allow_diagnostic_data' => false,
		'consent_recorded'      => false,
		'notice_dismissed'      => false,
		'notice_start_time'     => 0,
	);

	/**
	 * Days to wait after first sight before the consent notice appears.
	 *
	 * @var int
	 */
	const NOTICE_DELAY_DAYS = 7;

	/**
	 * Nonce action for the notice's Accept & Close / dismiss forms.
	 *
	 * @var string
	 */
	const NOTICE_NONCE = 'sptp_diagnostics_consent';

	/**
	 * Free's own weekly event. Pro rides its license cron; Free has none.
	 *
	 * Repeated by name in WP_Team_Deactivator and uninstall.php.
	 *
	 * @var string
	 */
	const CRON_HOOK = 'spt_diagnostics_weekly';

	/**
	 * Most published posts scanned for used block names (Placements::MAX_POSTS).
	 *
	 * @var int
	 */
	const MAX_POSTS = 500;

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( self::CRON_HOOK, array( $this, 'maybe_send_weekly' ) );
		add_action( 'admin_init', array( $this, 'handle_notice_submit' ) );
		add_action( 'admin_init', array( $this, 'maybe_schedule' ) );
		add_action( 'admin_notices', array( $this, 'render_notice' ) );
	}

	/*
	---------------------------------------------------------------------
	 * State
	 * ------------------------------------------------------------------ */

	/**
	 * Read the whole option, coerced to the shape of DEFAULTS.
	 *
	 * @return array<string, bool|int>
	 */
	public static function get_state() {
		$saved = get_option( self::OPTION_KEY, array() );
		$saved = is_array( $saved ) ? $saved : array();
		$state = array();

		foreach ( self::DEFAULTS as $key => $default ) {
			$raw = array_key_exists( $key, $saved ) ? $saved[ $key ] : $default;

			$state[ $key ] = is_int( $default ) ? absint( $raw ) : (bool) $raw;
		}

		return $state;
	}

	/**
	 * Merge a partial update into the option.
	 *
	 * @param array<string, bool|int> $values Keys from DEFAULTS only.
	 * @return array<string, bool|int> The stored state.
	 */
	public static function update_state( $values ) {
		$state = self::get_state();

		foreach ( self::DEFAULTS as $key => $default ) {
			if ( ! array_key_exists( $key, (array) $values ) ) {
				continue;
			}

			$state[ $key ] = is_int( $default )
				? absint( $values[ $key ] )
				: rest_sanitize_boolean( $values[ $key ] );
		}

		update_option( self::OPTION_KEY, $state, false );

		return $state;
	}

	/**
	 * Is the site currently consenting to diagnostic reporting?
	 *
	 * @return bool
	 */
	public static function is_allowed() {
		$state = self::get_state();

		return $state['allow_diagnostic_data'];
	}

	/**
	 * Store the admin's decision, and send the first report on a yes.
	 *
	 * @param bool $allowed The admin's choice.
	 * @return array<string, bool|int> The stored state.
	 */
	public static function record_consent( $allowed ) {
		$allowed     = rest_sanitize_boolean( $allowed );
		$was_allowed = self::is_allowed();

		$state = self::update_state(
			array(
				'allow_diagnostic_data' => $allowed,
				'consent_recorded'      => true,
			)
		);

		// Only a new "yes" reports at once (readme: "once when you agree, then
		// weekly"); repeating a standing yes leaves it to the weekly cron.
		if ( $allowed && ! $was_allowed ) {
			self::send();
		}

		return $state;
	}

	/*
	---------------------------------------------------------------------
	 * Collection and transport
	 * ------------------------------------------------------------------ */

	/**
	 * Build the payload.
	 *
	 * Returns an empty array for local and private-network hosts so development
	 * sites never pollute the dataset — callers treat empty as "do not send".
	 * No member content of any kind is read: only block names leave the site.
	 *
	 * @return array
	 */
	public static function collect() {
		$host = wp_parse_url( home_url(), PHP_URL_HOST );
		$host = is_string( $host ) ? $host : '';

		if ( self::is_local_host( $host ) ) {
			return array();
		}

		// Cron and REST requests do not load the admin plugin API.
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$theme   = wp_get_theme();
		$plugins = get_plugins();

		$active_plugins = array();
		foreach ( (array) get_option( 'active_plugins', array() ) as $plugin_path ) {
			if ( isset( $plugins[ $plugin_path ] ) ) {
				$active_plugins[] = array(
					'name'    => $plugins[ $plugin_path ]['Name'],
					'version' => $plugins[ $plugin_path ]['Version'],
				);
			}
		}

		// The name belongs to the account that owns the admin email (cron has no current user).
		$admin_email = get_option( 'admin_email' );
		$admin_user  = get_user_by( 'email', $admin_email );

		return array(
			'user_email'     => $admin_email,
			'first_name'     => $admin_user ? (string) $admin_user->first_name : '',
			'last_name'      => $admin_user ? (string) $admin_user->last_name : '',
			'site_url'       => get_option( 'siteurl' ),
			'site_language'  => get_locale(),
			'theme_name'     => $theme->get( 'Name' ),
			'plugin_version' => SPT_PLUGIN_VERSION,
			'wp_version'     => get_bloginfo( 'version' ),
			'php_version'    => phpversion(),
			'db_version'     => get_option( 'sp_wp_team_db_version', SPT_PLUGIN_VERSION ),
			'active_plugins' => $active_plugins,
			'used_blocks'    => self::collect_used_blocks(),
		);
	}

	/**
	 * Which Smart Team blocks the site actually uses — names only.
	 *
	 * @return array<int, string>
	 */
	private static function collect_used_blocks() {
		global $wpdb;

		$used = array();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Weekly, consent-gated, bounded read.
		$contents = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT post_content FROM {$wpdb->posts} WHERE post_status = 'publish' AND post_content LIKE %s ORDER BY post_modified_gmt DESC LIMIT %d",
				'%' . $wpdb->esc_like( '<!-- wp:sptp/' ) . '%',
				self::MAX_POSTS
			)
		);

		$widgets = get_option( 'widget_block' );
		if ( is_array( $widgets ) ) {
			foreach ( $widgets as $widget ) {
				if ( is_array( $widget ) && isset( $widget['content'] ) ) {
					$contents[] = $widget['content'];
				}
			}
		}

		foreach ( (array) $contents as $content ) {
			if ( has_blocks( $content ) ) {
				self::find_blocks_recursive( parse_blocks( $content ), $used );
			}
		}

		return array_values( array_unique( $used ) );
	}

	/**
	 * Walk a parsed block tree, collecting `sptp/*` block names.
	 *
	 * @param array $blocks Parsed blocks.
	 * @param array $found  Accumulator, by reference.
	 * @return void
	 */
	private static function find_blocks_recursive( $blocks, &$found ) {
		foreach ( (array) $blocks as $block ) {
			if ( ! empty( $block['blockName'] ) && 0 === strpos( $block['blockName'], 'sptp/' ) ) {
				$found[] = $block['blockName'];
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				self::find_blocks_recursive( $block['innerBlocks'], $found );
			}
		}
	}

	/**
	 * Is this a local, test or private-network host?
	 *
	 * @param string $host Hostname from home_url().
	 * @return bool
	 */
	private static function is_local_host( $host ) {
		if ( in_array( $host, array( '', 'localhost', '127.0.0.1', '::1' ), true ) ) {
			return true;
		}

		foreach ( array( '.local', '.test', '.dev', '.localhost' ) as $suffix ) {
			if ( substr( $host, -strlen( $suffix ) ) === $suffix ) {
				return true;
			}
		}

		// RFC1918 private ranges.
		return 1 === preg_match( '/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/', $host );
	}

	/**
	 * Collect and POST, if consent stands and there is anything to send.
	 *
	 * Fire and forget: a collector that is down must never slow an admin
	 * request or a cron run, so the response is not inspected.
	 *
	 * @return void
	 */
	public static function send() {
		if ( ! self::is_allowed() ) {
			return;
		}

		$data = self::collect();

		if ( empty( $data ) ) {
			return;
		}

		wp_remote_post(
			SPT_SDR_ENDPOINT,
			array(
				'timeout'  => 10,
				'blocking' => false,
				'headers'  => array(
					'Content-Type' => 'application/json',
					'x-api-key'    => SPT_SDR_KEY,
					'User-Agent'   => 'spt-sdr-collector/' . home_url(),
				),
				'body'     => wp_json_encode( $data ),
			)
		);
	}

	/**
	 * Keep the weekly event in step with consent.
	 *
	 * Scheduled only while consent stands, so a site that never opted in has no
	 * event at all; revoking clears it on the next admin request.
	 *
	 * @return void
	 */
	public function maybe_schedule() {
		$scheduled = wp_next_scheduled( self::CRON_HOOK );

		if ( self::is_allowed() ) {
			if ( ! $scheduled ) {
				wp_schedule_event( time() + WEEK_IN_SECONDS, 'weekly', self::CRON_HOOK );
			}
			return;
		}

		if ( $scheduled ) {
			wp_clear_scheduled_hook( self::CRON_HOOK );
		}
	}

	/**
	 * Weekly cron callback — report only while consent stands.
	 *
	 * @return void
	 */
	public function maybe_send_weekly() {
		self::send();
	}

	/*
	---------------------------------------------------------------------
	 * Consent notice
	 * ------------------------------------------------------------------ */

	/**
	 * Should the consent notice be shown on this request?
	 *
	 * @return bool
	 */
	private function should_show_notice() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		$state = self::get_state();

		// Already answered, either way, or dismissed for good.
		if ( $state['consent_recorded'] || $state['notice_dismissed'] ) {
			return false;
		}

		// A site that has not published a member yet is still mid-setup.
		$members = wp_count_posts( 'sptp_member' );
		if ( empty( $members->publish ) ) {
			return false;
		}

		// Start the clock on first sight, then wait it out.
		if ( ! $state['notice_start_time'] ) {
			self::update_state( array( 'notice_start_time' => time() ) );

			return false;
		}

		return ( time() - $state['notice_start_time'] ) >= ( self::NOTICE_DELAY_DAYS * DAY_IN_SECONDS );
	}

	/**
	 * Handle the notice's Accept & Close / dismiss submissions.
	 *
	 * @return void
	 */
	public function handle_notice_submit() {
		if ( ! isset( $_POST['sptp_diagnostics_action'] ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		check_admin_referer( self::NOTICE_NONCE, 'sptp_diagnostics_nonce' );

		$action = sanitize_text_field( wp_unslash( $_POST['sptp_diagnostics_action'] ) );

		if ( 'allow' === $action ) {
			self::record_consent( true );
		} else {
			// A dismissal is not a recorded "no" — it only silences the notice.
			self::update_state( array( 'notice_dismissed' => true ) );
		}

		// Back to the screen the admin was on, without a resubmit on refresh.
		$redirect = wp_get_referer();
		wp_safe_redirect( $redirect ? $redirect : admin_url() );
		exit;
	}

	/**
	 * Notice styles, printed beside the notice as WP Carousel's consent notice
	 * does, so the markup can never show without them.
	 *
	 * @return void
	 */
	private function print_notice_style() {
		?>
		<style>
			.sptp-diagnostic-notice {
				background-color: #ffffff;
				border: 1px solid rgba( 204, 204, 204, 1 );
				border-left: 4px solid #2271b1;
				border-radius: 4px;
				box-shadow: 0 16px 32px -4px rgba( 12, 12, 13, 0.05 ), 0 4px 4px -4px rgba( 12, 12, 13, 0.02 );
				margin-bottom: 20px;
				padding: 14px;
				position: relative;
			}
			.sptp-diagnostic-notice form {
				align-items: flex-start;
				display: flex;
				gap: 16px;
			}
			.sptp-diagnostic-notice img {
				border-radius: 4px;
				flex-shrink: 0;
				height: auto;
				width: 52px;
			}
			.sptp-diagnostic-notice h3 {
				color: #2c2d2f;
				font-size: 18px;
				font-weight: 600;
				margin: 0 0 8px 0;
			}
			.sptp-diagnostic-notice p,
			.sptp-diagnostic-notice a {
				color: #6e6f72;
				font-size: 14px;
				margin: 0 0 2px 0;
			}
			.sptp-diagnostic-notice a {
				text-decoration: underline;
			}
			.sptp-diagnostic-notice .button {
				background-color: rgba( 30, 30, 30, 1 );
				border: none;
				border-radius: 4px;
				color: #ffffff;
				font-size: 13px;
				font-weight: 500;
				line-height: 14px;
				margin-top: 8px;
			}
			.sptp-diagnostic-notice .button:hover,
			.sptp-diagnostic-notice .button:focus {
				background-color: rgba( 30, 30, 30, 1 );
				border: none;
				box-shadow: none;
				color: #ffffff;
				outline: none;
			}
			.sptp-diagnostic-notice button.sptp-diagnostic-dismiss {
				background: transparent;
				border: none;
				color: #b6b6b6;
				cursor: pointer;
				font-size: 16px;
				position: absolute;
				right: 7px;
				top: 0;
			}
		</style>
		<?php
	}

	/**
	 * Render the consent notice.
	 *
	 * Dashboard::hide_admin_notices() strips every notice on the plugin's own
	 * dashboard screen, so this shows elsewhere in wp-admin.
	 *
	 * @return void
	 */
	public function render_notice() {
		if ( ! $this->should_show_notice() ) {
			return;
		}

		$this->print_notice_style();
		?>
		<div class="notice notice-info sptp-diagnostic-notice">
			<form method="post">
				<?php wp_nonce_field( self::NOTICE_NONCE, 'sptp_diagnostics_nonce' ); ?>
				<img src="<?php echo esc_url( SPT_PLUGIN_ROOT . 'src/Admin/PageBuilders/assets/icon.svg' ); ?>" width="52" height="52" alt="<?php esc_attr_e( 'Smart Team', 'team-free' ); ?>" />
				<div>
					<h3><?php esc_html_e( 'Help us improve Smart Team even more awesome?', 'team-free' ); ?></h3>
					<p>
						<?php esc_html_e( 'Allow us to collect diagnostic data to resolve problems faster and improve performance.', 'team-free' ); ?>
						<a href="https://shapedplugin.com/information-we-collect/" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Learn More', 'team-free' ); ?></a>.
					</p>
				</div>
				<button type="submit" class="button" name="sptp_diagnostics_action" value="allow"><?php esc_html_e( 'Accept', 'team-free' ); ?></button>
				<button type="submit" class="sptp-diagnostic-dismiss dashicons dashicons-dismiss" name="sptp_diagnostics_action" value="dismiss" aria-label="<?php esc_attr_e( 'Dismiss', 'team-free' ); ?>"></button>
			</form>
		</div>
		<?php
	}
}
