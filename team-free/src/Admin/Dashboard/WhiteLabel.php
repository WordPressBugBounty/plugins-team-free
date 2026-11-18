<?php
/**
 * White Label Branding module — the custom labels (Member, Teams, Departments, Designations),
 * edited from the dashboard's Modules drawer.
 *
 * Every value lives in `_sptp_settings` under the keys the classic Settings →
 * Custom Menu section owned (`rename_*`) and Smart Team Pro's White Label module
 * reuses, so a rename survives a switch in either direction. Nothing here takes
 * effect while the `white_label` module is off — the labels fall back to their
 * defaults but stay stored for re-enabling. The plugin name, logos and the hide
 * switches are Pro-only and have no code in Free.
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

defined( 'ABSPATH' ) || exit;

/**
 * Class WhiteLabel
 */
class WhiteLabel {

	/**
	 * Feature module key.
	 *
	 * @var string
	 */
	const MODULE = 'white_label';

	/**
	 * Dashboard key => classic `_sptp_settings` key for every text label.
	 *
	 * @var array<string, string>
	 */
	const LABEL_KEYS = array(
		'memberSingular'      => 'rename_member_singular',
		'memberPlural'        => 'rename_member_plural',
		'teamLabel'           => 'rename_team',
		'groupSingular'       => 'rename_group_singular',
		'groupPlural'         => 'rename_group_plural',
		'designationSingular' => 'rename_designation_singular',
		'designationPlural'   => 'rename_designation_plural',
	);

	/**
	 * Memoized `_sptp_settings` read for the getters below.
	 *
	 * @var array|null
	 */
	private static $option = null;

	/**
	 * Default label values, keyed like LABEL_KEYS.
	 *
	 * Translated, so call it after `after_setup_theme` — not from a constructor.
	 *
	 * @return array<string, string>
	 */
	public static function label_defaults() {
		return array(
			'memberSingular'      => __( 'Member', 'team-free' ),
			'memberPlural'        => __( 'Members', 'team-free' ),
			'teamLabel'           => __( 'Teams', 'team-free' ),
			'groupSingular'       => __( 'Department', 'team-free' ),
			'groupPlural'         => __( 'Departments', 'team-free' ),
			'designationSingular' => __( 'Designation', 'team-free' ),
			'designationPlural'   => __( 'Designations', 'team-free' ),
		);
	}

	/**
	 * Every classic key this module owns.
	 *
	 * @return string[]
	 */
	public static function owned_keys() {
		return array_values( self::LABEL_KEYS );
	}

	/**
	 * The raw option, read once per request.
	 *
	 * @return array
	 */
	private static function option() {
		if ( null === self::$option ) {
			self::$option = DashboardHelper::raw_classic_settings();
		}

		return self::$option;
	}

	/**
	 * Whether the module is switched on.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		return DashboardHelper::is_module_enabled( self::MODULE );
	}

	/**
	 * The labels in effect — the defaults while the module is off.
	 *
	 * @return array<string, string>
	 */
	public static function labels() {
		return self::is_enabled() ? self::saved_labels() : self::label_defaults();
	}

	/**
	 * The stored labels over their defaults, whatever the module state — what the drawer edits.
	 *
	 * @return array<string, string>
	 */
	public static function saved_labels() {
		$saved  = self::option();
		$labels = array();

		foreach ( self::label_defaults() as $key => $default ) {
			$classic        = self::LABEL_KEYS[ $key ];
			$labels[ $key ] = ! empty( $saved[ $classic ] ) ? (string) $saved[ $classic ] : $default;
		}

		return $labels;
	}

	/**
	 * Dashboard payload: the values the drawer edits.
	 *
	 * @return array<string, string>
	 */
	public static function get_settings() {
		return self::saved_labels();
	}

	/**
	 * Editable defaults — what the drawer's Reset Changes restores.
	 *
	 * @return array<string, string>
	 */
	public static function defaults() {
		return self::label_defaults();
	}

	/**
	 * Merge the drawer's values into `_sptp_settings`.
	 *
	 * Only the label keys are written; every other key in the option — including
	 * the Pro-only ones Pro stored (plugin name, logos, hide switches) — is kept.
	 *
	 * @param array $values Raw values from the request.
	 * @return void
	 */
	public static function save_settings( $values ) {
		if ( ! is_array( $values ) ) {
			return;
		}

		$saved = DashboardHelper::raw_classic_settings();

		// An emptied label falls back to its default rather than an empty menu entry.
		foreach ( self::label_defaults() as $key => $default ) {
			if ( ! array_key_exists( $key, $values ) ) {
				continue;
			}

			$classic = self::LABEL_KEYS[ $key ];
			$label   = sanitize_text_field( (string) $values[ $key ] );
			$label   = '' !== $label ? $label : $default;

			// The drawer sends every field. Writing an untouched default would
			// mask Pro's own fallback (e.g. a singular Team label built from `rename_team`).
			if ( empty( $saved[ $classic ] ) && $label === $default ) {
				continue;
			}

			$saved[ $classic ] = $label;
		}

		update_option( DashboardHelper::CLASSIC_OPTION_KEY, $saved );

		self::$option = null;
	}
}
