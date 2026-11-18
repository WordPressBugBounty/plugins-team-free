<?php
/**
 * Single Page settings — the dashboard's read/write layer over the classic keys.
 *
 * Two things live here. The first is the Template Type: Pro's
 * `_sptp_settings → single_page_template_source` (`plugin` = Classic,
 * `block`), which MemberTemplate::use_block_template() reads. The second is
 * the Classic template's own settings, the ones `sptp-single.php` reads:
 * `single_page_view` (Template One / Two) and the `member_fields` groups of
 * show/hide switches. The classic screen is gone, so this page is their only
 * editor.
 *
 * Only the keys Free can act on are written. Templates Three to Six and every
 * other `member_fields` switch are Pro's: they are read as the nearest free
 * value and are never overwritten, so a Pro design survives a round trip.
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

use ShapedPlugin\WPTeam\Blocks\Includes\MemberTemplate;

defined( 'ABSPATH' ) || exit;

/**
 * Class SinglePageSettings
 */
class SinglePageSettings {

	/**
	 * `_sptp_settings` key holding the layout.
	 *
	 * @var string
	 */
	const VIEW_KEY = 'single_page_view';

	/**
	 * `_sptp_settings` key holding the Member Detail switch groups.
	 *
	 * @var string
	 */
	const FIELDS_KEY = 'member_fields';

	/**
	 * The layouts Free renders, first one the default. Three to Six are Pro's.
	 *
	 * @var string[]
	 */
	const FREE_VIEWS = array( 'one', 'two' );

	/**
	 * The Pro-only layouts, shown locked.
	 *
	 * @var string[]
	 */
	const PRO_VIEWS = array( 'three', 'four', 'five', 'six' );

	/**
	 * The free switches, per `member_fields` group, in the classic screen's order.
	 *
	 * @var array<string, string[]>
	 */
	const FREE_FIELDS = array(
		'member_image_fields'          => array( 'image_switch' ),
		'member_basic_fields'          => array( 'name_switch', 'job_position_switch' ),
		'member_skill_bar_fields'      => array( 'section_title', 'skill_bar_switch' ),
		'member_social_profile_fields' => array( 'section_title', 'social_switch' ),
		'member_biography_fields'      => array( 'section_title', 'biography_switch' ),
	);

	/**
	 * Layouts saved by Free before 3.0.9, which the updater maps to Template One / Two.
	 *
	 * @var array<string, string>
	 */
	const LEGACY_VIEWS = array(
		'right_content'  => 'one',
		'bottom_content' => 'two',
	);

	/**
	 * Defaults — the classic section's own: Template One, everything shown.
	 *
	 * @return array{single_page_template_source:string, single_page_view:string, member_fields:array<string, array<string, bool>>}
	 */
	public static function defaults() {
		$fields = array();
		foreach ( self::FREE_FIELDS as $group => $switches ) {
			$fields[ $group ] = array_fill_keys( $switches, true );
		}

		return array(
			MemberTemplate::SOURCE_KEY => MemberTemplate::SOURCES[0],
			self::VIEW_KEY             => self::FREE_VIEWS[0],
			self::FIELDS_KEY           => $fields,
		);
	}

	/**
	 * The layout `sptp-single.php` renders for a stored value: a free layout as
	 * is, a pre-3.0.9 name as its template, and anything else (a Pro layout)
	 * as Template One. The stored value itself is never changed.
	 *
	 * @param mixed $stored Stored `single_page_view`.
	 * @return string
	 */
	public static function resolve_view( $stored ) {
		if ( is_string( $stored ) && isset( self::LEGACY_VIEWS[ $stored ] ) ) {
			return self::LEGACY_VIEWS[ $stored ];
		}

		return is_string( $stored ) && in_array( $stored, self::FREE_VIEWS, true ) ? $stored : self::FREE_VIEWS[0];
	}

	/**
	 * Copy the pre-3.0.9 Member Detail switches (`detail_page_fields`) into the
	 * `member_fields` groups `sptp-single.php` reads now.
	 *
	 * Add-only: a switch that already has a value (Pro's, or an earlier run) is
	 * kept, and the legacy key is left where it is so a downgrade still reads it.
	 * Without this, a field hidden before the update would show again.
	 *
	 * @return void
	 */
	public static function migrate_legacy_fields() {
		$saved  = DashboardHelper::raw_classic_settings();
		$legacy = isset( $saved['detail_page_fields'] ) && is_array( $saved['detail_page_fields'] ) ? $saved['detail_page_fields'] : array();

		if ( empty( $legacy ) ) {
			return;
		}

		$map    = array(
			'image_switch'        => array( 'member_image_fields', 'image_switch' ),
			'name_switch'         => array( 'member_basic_fields', 'name_switch' ),
			'job_position_switch' => array( 'member_basic_fields', 'job_position_switch' ),
			'bio_switch'          => array( 'member_biography_fields', 'biography_switch' ),
			'social_switch'       => array( 'member_social_profile_fields', 'social_switch' ),
		);
		$fields = isset( $saved[ self::FIELDS_KEY ] ) && is_array( $saved[ self::FIELDS_KEY ] ) ? $saved[ self::FIELDS_KEY ] : array();
		$dirty  = false;

		foreach ( $map as $old => $target ) {
			list( $group, $switch ) = $target;

			if ( ! array_key_exists( $old, $legacy ) || isset( $fields[ $group ][ $switch ] ) ) {
				continue;
			}

			$fields[ $group ][ $switch ] = rest_sanitize_boolean( $legacy[ $old ] ) ? '1' : '0';
			$dirty                       = true;
		}

		if ( $dirty ) {
			$saved[ self::FIELDS_KEY ] = $fields;
			update_option( DashboardHelper::CLASSIC_OPTION_KEY, $saved );
		}
	}

	/**
	 * The stored values, coerced to the shape of the defaults.
	 *
	 * @return array{single_page_template_source:string, single_page_view:string, member_fields:array<string, array<string, bool>>}
	 */
	public static function get_settings() {
		$saved  = DashboardHelper::raw_classic_settings();
		$stored = isset( $saved[ self::FIELDS_KEY ] ) && is_array( $saved[ self::FIELDS_KEY ] ) ? $saved[ self::FIELDS_KEY ] : array();

		$fields = array();
		foreach ( self::FREE_FIELDS as $group => $switches ) {
			$group_values = isset( $stored[ $group ] ) && is_array( $stored[ $group ] ) ? $stored[ $group ] : array();

			foreach ( $switches as $switch ) {
				// `sptp-single.php` treats a missing switch as on.
				$fields[ $group ][ $switch ] = array_key_exists( $switch, $group_values ) ? rest_sanitize_boolean( $group_values[ $switch ] ) : true;
			}
		}

		return array(
			MemberTemplate::SOURCE_KEY => MemberTemplate::template_source(),
			self::VIEW_KEY             => self::resolve_view( isset( $saved[ self::VIEW_KEY ] ) ? $saved[ self::VIEW_KEY ] : '' ),
			self::FIELDS_KEY           => $fields,
		);
	}

	/**
	 * Merge the submitted values back into `_sptp_settings`.
	 *
	 * Only the keys this page owns are written. Inside `member_fields`, the
	 * other groups and the Pro switches an earlier save stored are kept as they
	 * are.
	 *
	 * @param array $values Raw values from the request.
	 * @return void
	 */
	public static function save_settings( $values ) {
		if ( ! is_array( $values ) ) {
			return;
		}

		$saved = DashboardHelper::raw_classic_settings();

		if ( isset( $values[ MemberTemplate::SOURCE_KEY ] ) ) {
			$source = sanitize_key( $values[ MemberTemplate::SOURCE_KEY ] );
			if ( in_array( $source, MemberTemplate::SOURCES, true ) ) {
				$saved[ MemberTemplate::SOURCE_KEY ] = $source;
			}
		}

		if ( isset( $values[ self::VIEW_KEY ] ) && is_string( $values[ self::VIEW_KEY ] ) ) {
			$view    = sanitize_key( $values[ self::VIEW_KEY ] );
			$current = isset( $saved[ self::VIEW_KEY ] ) ? $saved[ self::VIEW_KEY ] : '';

			// The page is sent the resolved layout, so a stored Pro template arrives as Template One:
			// write only when that actually changes what renders, so a Save never overwrites it.
			if ( in_array( $view, self::FREE_VIEWS, true ) && self::resolve_view( $current ) !== $view ) {
				$saved[ self::VIEW_KEY ] = $view;
			}
		}

		if ( isset( $values[ self::FIELDS_KEY ] ) && is_array( $values[ self::FIELDS_KEY ] ) ) {
			$fields = isset( $saved[ self::FIELDS_KEY ] ) && is_array( $saved[ self::FIELDS_KEY ] ) ? $saved[ self::FIELDS_KEY ] : array();

			foreach ( self::FREE_FIELDS as $group => $switches ) {
				if ( ! isset( $values[ self::FIELDS_KEY ][ $group ] ) || ! is_array( $values[ self::FIELDS_KEY ][ $group ] ) ) {
					continue;
				}

				$group_values = isset( $fields[ $group ] ) && is_array( $fields[ $group ] ) ? $fields[ $group ] : array();

				foreach ( $switches as $switch ) {
					if ( array_key_exists( $switch, $values[ self::FIELDS_KEY ][ $group ] ) ) {
						// The classic switcher's own representation.
						$group_values[ $switch ] = rest_sanitize_boolean( $values[ self::FIELDS_KEY ][ $group ][ $switch ] ) ? '1' : '0';
					}
				}

				$fields[ $group ] = $group_values;
			}

			$saved[ self::FIELDS_KEY ] = $fields;
		}

		update_option( DashboardHelper::CLASSIC_OPTION_KEY, $saved );
	}

	/**
	 * What the page needs beyond the values themselves.
	 *
	 * `editorUrl` is empty on a classic theme (no Site Editor) or without
	 * `edit_theme_options` — the page explains instead of linking. `layouts`
	 * carries the template previews (the classic screen's own images), Pro's
	 * four last and locked.
	 *
	 * @return array{editorUrl:string, isBlockTheme:bool, themeName:string, layouts:array<int, array{value:string, label:string, image:string, isPro:bool}>, dragIcon:string}
	 */
	public static function get_meta() {
		$labels = array(
			'one'   => __( 'Template One', 'team-free' ),
			'two'   => __( 'Template Two', 'team-free' ),
			'three' => __( 'Template Three', 'team-free' ),
			'four'  => __( 'Template Four', 'team-free' ),
			'five'  => __( 'Template Five', 'team-free' ),
			'six'   => __( 'Template Six', 'team-free' ),
		);

		$layouts = array();
		foreach ( array_merge( self::FREE_VIEWS, self::PRO_VIEWS ) as $view ) {
			$layouts[] = array(
				'value' => $view,
				'label' => $labels[ $view ],
				'image' => SPT_PLUGIN_ROOT . 'src/Admin/img/single-page-layout/' . $view . '.svg',
				'isPro' => in_array( $view, self::PRO_VIEWS, true ),
			);
		}

		return array(
			'editorUrl'    => MemberTemplate::single_page_edit_url(),
			'isBlockTheme' => function_exists( 'wp_is_block_theme' ) && wp_is_block_theme(),
			'themeName'    => wp_get_theme()->get( 'Name' ),
			'layouts'      => $layouts,
			'dragIcon'     => SPT_PLUGIN_ROOT . 'src/Admin/Framework/assets/image/drag-and-drop.svg',
		);
	}
}
