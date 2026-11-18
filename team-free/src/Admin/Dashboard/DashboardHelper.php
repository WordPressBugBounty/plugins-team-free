<?php
/**
 * Dashboard settings — the Blocks page's `active_blocks` list and the Modules
 * page's `modules` switches.
 *
 * Reads and writes the same option and the same `{ name, show }` shape as Smart
 * Team Pro (`sptp_dashboard_options` → `active_blocks`), so a visibility choice
 * survives switching between the two plugins. Free only ever writes the
 * entries for blocks it ships; a Pro-only block's stored entry is carried
 * through untouched (CLAUDE.md Rule 3).
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

defined( 'ABSPATH' ) || exit;

/**
 * Class DashboardHelper
 */
class DashboardHelper {

	/**
	 * Option that holds the dashboard settings — Pro's key, shared on purpose.
	 *
	 * @var string
	 */
	const OPTION_KEY = 'sptp_dashboard_options';

	/**
	 * Layout blocks. Switching all of them off hides every child block too.
	 *
	 * @var array<int, string>
	 */
	const PARENT_BLOCKS = array( 'sptp/carousel', 'sptp/carousel-3d', 'sptp/grid' );

	/**
	 * Add-on blocks that need a parent block to host them.
	 *
	 * @var array<int, string>
	 */
	const CHILD_BLOCKS = array( 'sptp/ajax-pagination', 'sptp/ajax-member-search', 'sptp/live-frontend-filter' );

	/**
	 * The legacy shortcode block — outside the parent/child cascade.
	 *
	 * @var array<int, string>
	 */
	const CLASSIC_BLOCKS = array( 'sp-team-pro/shortcode' );

	/**
	 * Modules Free can switch, each with the state it has until it is touched.
	 * Every other module on the Modules page is Pro: listed, but locked and
	 * treated as on here, whatever Pro stored for it.
	 *
	 * @var array<string, bool>
	 */
	const FREE_MODULES = array(
		'member_social'  => true,
		// Member Skills: the Skills repeater on Add New Member is Free's own field, so
		// its block, card row and payload follow this switch (on by default).
		'member_skills'  => true,
		'ready_patterns' => true,
		// Opt-in, like Pro: it changes how a layout block first paints.
		'preloader'       => false,
		// AI Team Builder (blocks/Includes/AI/AIFeature): on, like Pro — it
		// sends nothing until an admin adds a provider key or connector.
		'ai_team_builder' => true,
		// White Label Branding: only the custom labels are Free. Opt-in, like Pro —
		// the 4.0.0 updater switches it on for sites that already renamed labels.
		'white_label'     => false,
	);

	/**
	 * The field block each gated module owns.
	 *
	 * @var array<string, string>
	 */
	const MODULE_BLOCKS = array(
		'member_social' => 'sptp/social-profile',
		'member_skills' => 'sptp/member-skills',
	);

	/**
	 * The Card Content row each gated module owns, by its `cardElements` value.
	 *
	 * @var array<string, string>
	 */
	const MODULE_CARD_ELEMENTS = array(
		'member_social' => 'social',
		'member_skills' => 'skills',
	);

	/**
	 * Default Preloader module settings — Pro's keys and values.
	 *
	 * @var array<string, int|string>
	 */
	const PRELOADER_DEFAULTS = array(
		'minLoadingTime'     => 300,
		'minLoadingTimeUnit' => 'ms',
		'style'              => 'spinner',
		'spinnerStyle'       => '01',
	);

	/**
	 * Allowed units for the Preloader min loading time. `minLoadingTime` is
	 * always stored in milliseconds; the unit only picks what the control shows.
	 *
	 * @var string[]
	 */
	const PRELOADER_TIME_UNITS = array( 'ms', 's' );

	/**
	 * Preloader styles Free renders. Skeleton is Pro's: a stored `skeleton`
	 * reads as `spinner` and is never overwritten (Pro gate is read-only).
	 *
	 * @var string[]
	 */
	const FREE_PRELOADER_STYLES = array( 'spinner' );

	/**
	 * Allowed Preloader `spinnerStyle` values.
	 *
	 * @var string[]
	 */
	const PRELOADER_SPINNER_STYLES = array( '01', '02', '03', '04', '05', '06', '07', '08', '09' );

	/**
	 * Name => stored `show` map, memoized for the request.
	 *
	 * @var array<string, bool>|null
	 */
	private static $active_block_map = null;

	/**
	 * The toggle-managed blocks, grouped.
	 *
	 * @return array{parent: array<int, string>, child: array<int, string>, classic: array<int, string>}
	 */
	public static function get_all_block_list() {
		return array(
			'parent'  => self::PARENT_BLOCKS,
			'child'   => self::CHILD_BLOCKS,
			'classic' => self::CLASSIC_BLOCKS,
		);
	}

	/**
	 * Every toggle-managed block, in display order.
	 *
	 * @return array<int, string>
	 */
	private static function managed_blocks() {
		return array_merge( self::PARENT_BLOCKS, self::CHILD_BLOCKS, self::CLASSIC_BLOCKS );
	}

	/**
	 * The saved option as an array — never anything else.
	 *
	 * @return array
	 */
	private static function get_saved_options() {
		$saved = get_option( self::OPTION_KEY, array() );

		return is_array( $saved ) ? $saved : array();
	}

	/**
	 * Saved `show` value per block name.
	 *
	 * @return array<string, bool>
	 */
	private static function saved_visibility() {
		$saved   = self::get_saved_options();
		$entries = isset( $saved['active_blocks'] ) && is_array( $saved['active_blocks'] ) ? $saved['active_blocks'] : array();
		$by_name = array();

		foreach ( $entries as $entry ) {
			if ( is_array( $entry ) && ! empty( $entry['name'] ) && is_string( $entry['name'] ) ) {
				$by_name[ $entry['name'] ] = isset( $entry['show'] ) ? (bool) $entry['show'] : true;
			}
		}

		return $by_name;
	}

	/**
	 * The `active_blocks` list: one `{ name, show }` per managed block, newly
	 * registered blocks defaulting to visible without dropping a saved choice.
	 *
	 * @return array<int, array{name: string, show: bool}>
	 */
	public static function get_active_blocks() {
		$by_name = self::saved_visibility();
		$result  = array();

		foreach ( self::managed_blocks() as $name ) {
			$result[] = array(
				'name' => $name,
				'show' => isset( $by_name[ $name ] ) ? $by_name[ $name ] : true,
			);
		}

		return $result;
	}

	/**
	 * Save the visibility the Blocks page submitted.
	 *
	 * Only managed blocks Free ships can change. Anything else — an unknown
	 * name, a Pro-only block — keeps whatever is stored, and every other key in
	 * the option is left exactly as it was.
	 *
	 * @param mixed $submitted Submitted `active_blocks` list.
	 * @return array<int, array{name: string, show: bool}> The list now stored.
	 */
	public static function save_active_blocks( $submitted ) {
		$submitted = is_array( $submitted ) ? $submitted : array();
		$changes   = array();

		foreach ( $submitted as $entry ) {
			if ( ! is_array( $entry ) || empty( $entry['name'] ) || ! is_string( $entry['name'] ) ) {
				continue;
			}

			$name = sanitize_text_field( $entry['name'] );
			if ( ! in_array( $name, self::managed_blocks(), true ) || ! Pro_Gate::is_free_block( $name ) ) {
				continue;
			}

			$changes[ $name ] = isset( $entry['show'] ) ? rest_sanitize_boolean( $entry['show'] ) : true;
		}

		$saved   = self::get_saved_options();
		$entries = isset( $saved['active_blocks'] ) && is_array( $saved['active_blocks'] ) ? $saved['active_blocks'] : array();

		// Keep every stored entry exactly as it is — extra fields included —
		// and only flip `show` where a change was submitted.
		foreach ( $entries as $index => $entry ) {
			if ( is_array( $entry ) && isset( $entry['name'] ) && is_string( $entry['name'] ) && isset( $changes[ $entry['name'] ] ) ) {
				$entries[ $index ]['show'] = $changes[ $entry['name'] ];
				unset( $changes[ $entry['name'] ] );
			}
		}
		foreach ( $changes as $name => $show ) {
			$entries[] = array(
				'name' => $name,
				'show' => $show,
			);
		}

		$saved['active_blocks'] = $entries;
		update_option( self::OPTION_KEY, $saved );

		self::$active_block_map = null;

		return self::get_active_blocks();
	}

	/**
	 * Whether a block is effectively on right now.
	 *
	 * A Pro-only block is always on here: Free cannot change its switch, so a
	 * `show` stored by Pro must not blank its fallback render. A child block is
	 * on only when its own switch is on AND at least one parent Free can switch
	 * is on; the child's stored value is never rewritten, so turning a parent
	 * back on restores it. A block that is not toggle-managed is always on.
	 *
	 * @param string $name Full block name, e.g. 'sptp/carousel'.
	 * @return bool
	 */
	public static function is_block_enabled( $name ) {
		if ( null === self::$active_block_map ) {
			self::$active_block_map = self::saved_visibility();
		}

		if ( ! Pro_Gate::is_free_block( $name ) ) {
			return true;
		}

		$map      = self::$active_block_map;
		$own_show = isset( $map[ $name ] ) ? $map[ $name ] : true;

		if ( ! in_array( $name, self::CHILD_BLOCKS, true ) ) {
			return $own_show;
		}

		foreach ( self::PARENT_BLOCKS as $parent ) {
			if ( Pro_Gate::is_free_block( $parent ) && ( ! isset( $map[ $parent ] ) || $map[ $parent ] ) ) {
				return $own_show;
			}
		}

		return false;
	}

	/**
	 * The toggle-managed block names — the editor reads this so it never keeps
	 * its own copy of the list.
	 *
	 * @return array<int, string>
	 */
	public static function get_toggle_managed_block_names() {
		return self::managed_blocks();
	}

	/**
	 * The toggle-managed blocks that are effectively on, cascade included.
	 *
	 * @return array<int, string>
	 */
	public static function get_enabled_block_names() {
		return array_values( array_filter( self::managed_blocks(), array( __CLASS__, 'is_block_enabled' ) ) );
	}

	/**
	 * The module switches Free manages: one bool per FREE_MODULES key.
	 *
	 * @return array<string, bool>
	 */
	public static function get_modules() {
		$saved   = self::get_saved_options();
		$stored  = isset( $saved['modules'] ) && is_array( $saved['modules'] ) ? $saved['modules'] : array();
		$modules = array();

		foreach ( self::FREE_MODULES as $key => $default ) {
			$modules[ $key ] = isset( $stored[ $key ] ) ? (bool) $stored[ $key ] : $default;
		}

		return $modules;
	}

	/**
	 * Save the module switches the Modules page submitted.
	 *
	 * Only FREE_MODULES keys can change; every other key under `modules` (what
	 * Pro stored) and every other key in the option stays as it was.
	 *
	 * @param mixed $submitted Submitted `modules` map.
	 * @return array<string, bool> The switches now stored.
	 */
	public static function save_modules( $submitted ) {
		$submitted = is_array( $submitted ) ? $submitted : array();
		$saved     = self::get_saved_options();
		$modules   = isset( $saved['modules'] ) && is_array( $saved['modules'] ) ? $saved['modules'] : array();

		foreach ( self::FREE_MODULES as $key => $default ) {
			if ( array_key_exists( $key, $submitted ) ) {
				$modules[ $key ] = rest_sanitize_boolean( $submitted[ $key ] );
			}
		}

		$saved['modules'] = $modules;
		update_option( self::OPTION_KEY, $saved );

		self::$module_map = null;

		return self::get_modules();
	}

	/**
	 * Name => on/off map of the Free modules, memoized for the request.
	 *
	 * @var array<string, bool>|null
	 */
	private static $module_map = null;

	/**
	 * Whether a module is on right now. A module Free cannot switch is always
	 * on, so a value Pro stored for it never hides anything here.
	 *
	 * @param string $key Module key, e.g. 'member_social'.
	 * @return bool
	 */
	public static function is_module_enabled( $key ) {
		if ( ! isset( self::FREE_MODULES[ $key ] ) ) {
			return true;
		}

		if ( null === self::$module_map ) {
			self::$module_map = self::get_modules();
		}

		return self::$module_map[ $key ];
	}

	/**
	 * The module that owns a field block, or '' when the block is not gated.
	 *
	 * @param string $block_name Full block name.
	 * @return string
	 */
	public static function module_for_block( $block_name ) {
		$key = array_search( $block_name, self::MODULE_BLOCKS, true );

		return false === $key ? '' : $key;
	}

	/**
	 * Field blocks whose module is off — localized to the editor.
	 *
	 * @return array<int, string>
	 */
	public static function get_module_disabled_block_names() {
		$names = array();
		foreach ( self::MODULE_BLOCKS as $key => $block_name ) {
			if ( ! self::is_module_enabled( $key ) ) {
				$names[] = $block_name;
			}
		}

		return $names;
	}

	/**
	 * Card Content rows whose module is off — localized to the editor.
	 *
	 * @return array<int, string>
	 */
	public static function get_module_disabled_card_elements() {
		$values = array();
		foreach ( self::MODULE_CARD_ELEMENTS as $key => $element ) {
			if ( ! self::is_module_enabled( $key ) ) {
				$values[] = $element;
			}
		}

		return $values;
	}

	/**
	 * Page builder integrations on Settings → Integrations (`PageBuilders\Manager`).
	 * Every one defaults to on, as in Pro.
	 *
	 * @var array<int, string>
	 */
	const INTEGRATIONS = array( 'elementor', 'divi', 'wpbakery', 'beaver', 'oxygen', 'bricks' );

	/**
	 * The integration switches: one bool per INTEGRATIONS key.
	 *
	 * Reads the raw option: `PageBuilders\Manager` asks on early `init`.
	 *
	 * @return array<string, bool>
	 */
	public static function get_integrations() {
		$saved        = self::get_saved_options();
		$stored       = isset( $saved['integrations'] ) && is_array( $saved['integrations'] ) ? $saved['integrations'] : array();
		$integrations = array();

		foreach ( self::INTEGRATIONS as $key ) {
			$integrations[ $key ] = isset( $stored[ $key ] ) ? (bool) $stored[ $key ] : true;
		}

		return $integrations;
	}

	/**
	 * Save the integration switches the Integrations panel submitted.
	 *
	 * Only INTEGRATIONS keys can change; every other key in the option stays.
	 *
	 * @param mixed $submitted Submitted `integrations` map.
	 * @return array<string, bool> The switches now stored.
	 */
	public static function save_integrations( $submitted ) {
		$submitted    = is_array( $submitted ) ? $submitted : array();
		$saved        = self::get_saved_options();
		$integrations = isset( $saved['integrations'] ) && is_array( $saved['integrations'] ) ? $saved['integrations'] : array();

		foreach ( self::INTEGRATIONS as $key ) {
			if ( array_key_exists( $key, $submitted ) ) {
				$integrations[ $key ] = rest_sanitize_boolean( $submitted[ $key ] );
			}
		}

		$saved['integrations'] = $integrations;
		update_option( self::OPTION_KEY, $saved );

		return self::get_integrations();
	}

	/**
	 * Whether a page builder integration is on.
	 *
	 * @param string $key Integration key, e.g. 'elementor'.
	 * @return bool
	 */
	public static function is_integration_enabled( $key ) {
		$integrations = self::get_integrations();

		return ! isset( $integrations[ $key ] ) || $integrations[ $key ];
	}

	/**
	 * The classic option the Settings page edits — shared with the classic
	 * Settings screen and read by the frontend, so there is one source of truth.
	 *
	 * @var string
	 */
	const CLASSIC_OPTION_KEY = '_sptp_settings';

	/**
	 * Performance options, with the defaults the frontend already assumes.
	 *
	 * @var array<string, bool>
	 */
	const PERFORMANCE_DEFAULTS = array(
		'enqueue_google_font' => true,
		'sptp_use_cache'      => true,
	);

	/**
	 * Advanced Controls options, keyed by the classic `_sptp_settings` key each
	 * one already owns.
	 *
	 * `sptp_gb_block` is surfaced as the "New Member Editor" choice: on = the
	 * block editor opens on the member edit screen, off = the classic editor.
	 *
	 * @var array<string, bool>
	 */
	const ADVANCED_DEFAULTS = array(
		'sptp_gb_block'       => false,
		'delete_on_remove'    => false,
		'enqueue_swiper_js'   => true,
		'enqueue_swiper'      => true,
		'enqueue_fontawesome' => true,
	);

	/**
	 * Additional CSS & JS, keyed by the classic `_sptp_settings` keys the
	 * frontend already reads.
	 *
	 * @var array<string, string>
	 */
	const CUSTOM_CODE_DEFAULTS = array(
		'custom_css' => '',
		'custom_js'  => '',
	);

	/**
	 * Capability needed to write each Additional CSS & JS key.
	 *
	 * @var array<string, string>
	 */
	const CUSTOM_CODE_CAPABILITIES = array(
		'custom_css' => 'edit_css',
		'custom_js'  => 'unfiltered_html',
	);

	/**
	 * Keys the React Settings page owns inside the classic option.
	 *
	 * The classic Settings screen is gone, so these live only on the React
	 * Settings page; every other key in the option is left as it is stored.
	 *
	 * @return array<string, bool|string> Key => default.
	 */
	public static function dashboard_owned_defaults() {
		return array_merge( self::PERFORMANCE_DEFAULTS, self::ADVANCED_DEFAULTS, self::CUSTOM_CODE_DEFAULTS );
	}

	/**
	 * Current Preloader module settings, merged over defaults.
	 *
	 * Pro's flat `_sptp_settings` keys, so a choice carries across both plugins.
	 *
	 * @return array{minLoadingTime:int, minLoadingTimeUnit:string, style:string, spinnerStyle:string}
	 */
	public static function get_preloader_settings() {
		$saved = self::raw_classic_settings();

		return array(
			'minLoadingTime'     => isset( $saved['minLoadingTime'] )
				? self::clamp_min_loading_time( $saved['minLoadingTime'] )
				: self::PRELOADER_DEFAULTS['minLoadingTime'],
			'minLoadingTimeUnit' => isset( $saved['minLoadingTimeUnit'] ) && in_array( $saved['minLoadingTimeUnit'], self::PRELOADER_TIME_UNITS, true )
				? $saved['minLoadingTimeUnit']
				: self::PRELOADER_DEFAULTS['minLoadingTimeUnit'],
			'style'              => isset( $saved['style'] ) && in_array( $saved['style'], self::FREE_PRELOADER_STYLES, true )
				? $saved['style']
				: self::PRELOADER_DEFAULTS['style'],
			'spinnerStyle'       => isset( $saved['spinnerStyle'] ) && in_array( (string) $saved['spinnerStyle'], self::PRELOADER_SPINNER_STYLES, true )
				? (string) $saved['spinnerStyle']
				: self::PRELOADER_DEFAULTS['spinnerStyle'],
		);
	}

	/**
	 * Clamp the minimum loading time to the window the frontend honours.
	 *
	 * @param mixed $ms Raw milliseconds.
	 * @return int
	 */
	private static function clamp_min_loading_time( $ms ) {
		return max( 0, min( 5000, (int) $ms ) );
	}

	/**
	 * Merge the submitted Preloader values into `_sptp_settings`.
	 *
	 * Only the four preloader keys are written; every other key is kept.
	 *
	 * @param array $values Raw values from the request.
	 * @return void
	 */
	public static function save_preloader_settings( $values ) {
		if ( ! is_array( $values ) ) {
			return;
		}

		$saved = self::raw_classic_settings();

		if ( array_key_exists( 'minLoadingTime', $values ) ) {
			$saved['minLoadingTime'] = self::clamp_min_loading_time( $values['minLoadingTime'] );
		}
		if ( isset( $values['minLoadingTimeUnit'] ) && in_array( $values['minLoadingTimeUnit'], self::PRELOADER_TIME_UNITS, true ) ) {
			$saved['minLoadingTimeUnit'] = $values['minLoadingTimeUnit'];
		}
		// Only a Free style that differs from what the site currently renders is
		// written, so a Pro `skeleton` read back as `spinner` is not clobbered.
		if (
			isset( $values['style'] )
			&& in_array( $values['style'], self::FREE_PRELOADER_STYLES, true )
			&& self::get_preloader_settings()['style'] !== $values['style']
		) {
			$saved['style'] = $values['style'];
		}
		if ( isset( $values['spinnerStyle'] ) && in_array( (string) $values['spinnerStyle'], self::PRELOADER_SPINNER_STYLES, true ) ) {
			$saved['spinnerStyle'] = (string) $values['spinnerStyle'];
		}

		update_option( self::CLASSIC_OPTION_KEY, $saved );
	}

	/**
	 * The raw classic `_sptp_settings` option — never anything but an array.
	 *
	 * @return array
	 */
	public static function raw_classic_settings() {
		$saved = get_option( self::CLASSIC_OPTION_KEY, array() );

		return is_array( $saved ) ? $saved : array();
	}

	/**
	 * Read one group of boolean classic keys, coerced to the shape of its defaults.
	 *
	 * @param array<string, bool> $defaults Key => default.
	 * @return array<string, bool>
	 */
	private static function get_group( $defaults ) {
		$saved  = self::raw_classic_settings();
		$values = array();

		foreach ( $defaults as $key => $default ) {
			$values[ $key ] = array_key_exists( $key, $saved ) ? (bool) $saved[ $key ] : $default;
		}

		return $values;
	}

	/**
	 * Merge one group of boolean classic keys back into `_sptp_settings`.
	 *
	 * Only the keys of `$defaults` are touched — the classic screen owns
	 * everything else in that option and must survive a dashboard save.
	 *
	 * @param array<string, bool> $defaults Key => default.
	 * @param array               $values   Raw values from the request.
	 * @return void
	 */
	private static function save_group( $defaults, $values ) {
		$values = is_array( $values ) ? $values : array();
		$saved  = self::raw_classic_settings();

		foreach ( array_keys( $defaults ) as $key ) {
			if ( ! array_key_exists( $key, $values ) ) {
				continue;
			}

			$saved[ $key ] = rest_sanitize_boolean( $values[ $key ] );
		}

		update_option( self::CLASSIC_OPTION_KEY, $saved );
	}

	/**
	 * Performance settings, read from the classic option.
	 *
	 * @return array<string, bool>
	 */
	public static function get_performance_settings() {
		return self::get_group( self::PERFORMANCE_DEFAULTS );
	}

	/**
	 * Persist the Performance group.
	 *
	 * @param array $values Raw values from the request.
	 * @return array<string, bool> The stored performance settings.
	 */
	public static function save_performance_settings( $values ) {
		self::save_group( self::PERFORMANCE_DEFAULTS, $values );

		return self::get_performance_settings();
	}

	/**
	 * Advanced Controls settings, read from the classic option.
	 *
	 * @return array<string, bool>
	 */
	public static function get_advanced_settings() {
		$settings = self::get_group( self::ADVANCED_DEFAULTS );
		$state    = Diagnostics::get_state();

		// Lives in the `sptp_diagnostics` option, not `_sptp_settings`. Opt-in: an
		// unanswered consent reads as off, like the setup wizard's checkbox.
		$settings['allow_diagnostic_data'] = $state['consent_recorded'] ? $state['allow_diagnostic_data'] : false;

		return $settings;
	}

	/**
	 * Persist the Advanced Controls group.
	 *
	 * `delete_on_remove` arms `uninstall.php`'s irreversible data wipe, so it
	 * needs more than the dashboard capability: only a user who could delete the
	 * plugin in the first place may arm it.
	 *
	 * @param array $values Raw values from the request.
	 * @return array<string, bool> The stored advanced settings.
	 */
	public static function save_advanced_settings( $values ) {
		$values = is_array( $values ) ? $values : array();

		if ( array_key_exists( 'delete_on_remove', $values ) && ! current_user_can( 'delete_plugins' ) ) {
			unset( $values['delete_on_remove'] );
		}

		if ( array_key_exists( 'allow_diagnostic_data', $values ) ) {
			$allowed = rest_sanitize_boolean( $values['allow_diagnostic_data'] );
			$state   = Diagnostics::get_state();
			$shown   = $state['consent_recorded'] ? $state['allow_diagnostic_data'] : false;

			// Only a changed checkbox records consent (a yes reports immediately), so
			// saving another row or pressing Reset never opts a site in.
			if ( $allowed !== $shown ) {
				Diagnostics::record_consent( $allowed );
			}
		}

		self::save_group( self::ADVANCED_DEFAULTS, $values );

		return self::get_advanced_settings();
	}

	/**
	 * Additional CSS & JS, read from the classic option.
	 *
	 * Decoded on the way out: the classic screen saved through `wp_kses_post()`,
	 * which entity-encodes the `<`, `>` and `&` of real CSS/JS (hence the
	 * `html_entity_decode()` on the frontend CSS path). Without this the editor
	 * would show `.a &gt; .b`. A save from here stores the code as authored.
	 *
	 * @return array<string, string>
	 */
	public static function get_custom_code_settings() {
		$saved  = self::raw_classic_settings();
		$values = array();

		foreach ( self::CUSTOM_CODE_DEFAULTS as $key => $default ) {
			$values[ $key ] = isset( $saved[ $key ] ) && is_string( $saved[ $key ] )
				? html_entity_decode( $saved[ $key ], ENT_QUOTES )
				: $default;
		}

		return $values;
	}

	/**
	 * Persist the Additional CSS & JS group.
	 *
	 * @param array $values Raw values from the request.
	 * @return array<string, string> The stored values.
	 */
	public static function save_custom_code_settings( $values ) {
		$values = is_array( $values ) ? $values : array();
		$saved  = self::raw_classic_settings();

		foreach ( self::CUSTOM_CODE_CAPABILITIES as $key => $capability ) {
			if ( ! array_key_exists( $key, $values ) ) {
				continue;
			}

			// Printed site-wide, so `manage_options` is not enough: a multisite
			// sub-site admin has no `unfiltered_html`. Clearing is always allowed,
			// so such an admin can still remove code stored before this check.
			$is_clear = is_scalar( $values[ $key ] ) && '' === trim( (string) $values[ $key ] );
			if ( ! $is_clear && ! current_user_can( $capability ) ) {
				continue;
			}

			$saved[ $key ] = self::sanitize_custom_code( $values[ $key ] );
		}

		update_option( self::CLASSIC_OPTION_KEY, $saved );

		return self::get_custom_code_settings();
	}

	/**
	 * Strip what would break out of the tag this code is printed inside.
	 *
	 * Both values are emitted inline — CSS in a `<style>`, JS through
	 * `wp_add_inline_script()` — so a closing tag in the author's code would end
	 * that block early and turn the rest into markup. Every output site runs
	 * `html_entity_decode()` first, so an entity-encoded closing tag
	 * (`&lt;/style&gt;`) would survive a plain strip and come out real: the code
	 * is fully decoded before the strip when decoding would reveal one, and the
	 * strip repeats until nothing is left to remove (`</</stylestyle` collapses
	 * to `</style` after one pass).
	 *
	 * Runs on save and again at every output site: the stored option can also
	 * arrive by import, migration or another plugin, so output never trusts it.
	 *
	 * @param mixed $code Raw code from the request or the stored option.
	 * @return string
	 */
	public static function sanitize_custom_code( $code ) {
		$code    = is_scalar( $code ) ? (string) $code : '';
		$pattern = '#</\s*(style|script)#i';

		$decoded = $code;
		for ( $i = 0; $i < 5; $i++ ) {
			$next = html_entity_decode( $decoded, ENT_QUOTES );
			if ( $next === $decoded ) {
				break;
			}
			$decoded = $next;
		}
		if ( $decoded !== $code && preg_match( $pattern, $decoded ) ) {
			$code = $decoded;
		}

		do {
			$previous = $code;
			$code     = (string) preg_replace( $pattern, '', $code );
		} while ( $code !== $previous );

		return $code;
	}

	/**
	 * Delete every `sptp_` transient — what Performance → Flush Cache runs.
	 *
	 * Twin of the classic `sptp_clean_transient` ajax action. The names are looked
	 * up and removed through `delete_transient()` / `delete_site_transient()`, so a
	 * persistent object cache drops exactly those entries and nothing else — a
	 * full `wp_cache_flush()` would empty every other plugin's cache too.
	 *
	 * @return int Transients removed.
	 */
	public static function flush_transients() {
		global $wpdb;

		$removed = 0;

		if ( is_multisite() ) {
			$names = $wpdb->get_col(
				$wpdb->prepare(
					"SELECT `meta_key` FROM {$wpdb->sitemeta} WHERE `meta_key` LIKE %s AND `site_id` = %d",
					$wpdb->esc_like( '_site_transient_sptp_' ) . '%',
					get_current_network_id()
				)
			); // phpcs:ignore WordPress.DB.DirectDatabaseQuery

			foreach ( $names as $name ) {
				$removed += delete_site_transient( substr( $name, strlen( '_site_transient_' ) ) ) ? 1 : 0;
			}

			return $removed;
		}

		$names = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT `option_name` FROM {$wpdb->options} WHERE `option_name` LIKE %s",
				$wpdb->esc_like( '_transient_sptp_' ) . '%'
			)
		); // phpcs:ignore WordPress.DB.DirectDatabaseQuery

		foreach ( $names as $name ) {
			$removed += delete_transient( substr( $name, strlen( '_transient_' ) ) ) ? 1 : 0;
		}

		return $removed;
	}

	/**
	 * Published teams (`sptp_generator`) for Tools → Export → Selected Team.
	 *
	 * @return array<int, array{id:int,value:int,label:string}>
	 */
	public static function get_generator_list() {
		$posts = get_posts(
			array(
				'post_type'      => 'sptp_generator',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);

		$list = array();
		foreach ( $posts as $post ) {
			$list[] = array(
				'id'    => $post->ID,
				'value' => $post->ID,
				/* translators: %d: team (shortcode) post ID. */
				'label' => $post->post_title ? $post->post_title : sprintf( __( '#%d', 'team-free' ), $post->ID ),
			);
		}

		return $list;
	}
}
