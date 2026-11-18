<?php
/**
 * Accessibility settings — the dashboard's read/write layer over the classic
 * `_sptp_settings → carousel_accessibility` fieldset.
 *
 * The key and its shape are the classic screen's own (a switcher plus five
 * slide messages), which `src/Frontend/templates/carousel.php` still reads, so
 * nothing stored has to move. The classic Settings screen is gone: Settings →
 * Accessibility is the only editor.
 *
 * @package ShapedPlugin\WPTeam\Admin\Dashboard
 */

namespace ShapedPlugin\WPTeam\Admin\Dashboard;

defined( 'ABSPATH' ) || exit;

/**
 * Class AccessibilitySettings
 */
class AccessibilitySettings {

	/**
	 * `_sptp_settings` key holding the fieldset.
	 *
	 * @var string
	 */
	const KEY = 'carousel_accessibility';

	/**
	 * The message fields, in the classic screen's order.
	 *
	 * @var string[]
	 */
	const MESSAGE_FIELDS = array(
		'prev_slide_message',
		'next_slide_message',
		'first_slide_message',
		'last_slide_message',
		'pagination_bullet_message',
	);

	/**
	 * Defaults — the classic fieldset's own. Translated, so call after `after_setup_theme`.
	 *
	 * @return array<string, bool|string>
	 */
	public static function defaults() {
		return array(
			'accessibility'             => true,
			'prev_slide_message'        => __( 'Previous slide', 'team-free' ),
			'next_slide_message'        => __( 'Next slide', 'team-free' ),
			'first_slide_message'       => __( 'This is the first slide', 'team-free' ),
			'last_slide_message'        => __( 'This is the last slide', 'team-free' ),
			'pagination_bullet_message' => __( 'Go to slide {{index}}', 'team-free' ),
		);
	}

	/**
	 * The stored values. A site that never saved the fieldset is off with empty
	 * messages — exactly what the carousel template renders — so the panel never
	 * claims a state the frontend is not in.
	 *
	 * @return array<string, bool|string>
	 */
	public static function get_settings() {
		$saved  = DashboardHelper::raw_classic_settings();
		$stored = isset( $saved[ self::KEY ] ) && is_array( $saved[ self::KEY ] ) ? $saved[ self::KEY ] : array();

		$values = array( 'accessibility' => ! empty( $stored['accessibility'] ) );

		foreach ( self::MESSAGE_FIELDS as $field ) {
			$values[ $field ] = isset( $stored[ $field ] ) ? (string) $stored[ $field ] : '';
		}

		return $values;
	}

	/**
	 * Merge the submitted values back into `_sptp_settings`.
	 *
	 * An emptied message falls back to its default rather than a silent slider.
	 * Every other key in the option is kept.
	 *
	 * @param array $values Raw values from the request.
	 * @return void
	 */
	public static function save_settings( $values ) {
		if ( ! is_array( $values ) ) {
			return;
		}

		$saved  = DashboardHelper::raw_classic_settings();
		$stored = isset( $saved[ self::KEY ] ) && is_array( $saved[ self::KEY ] ) ? $saved[ self::KEY ] : array();

		if ( array_key_exists( 'accessibility', $values ) ) {
			$stored['accessibility'] = rest_sanitize_boolean( $values['accessibility'] );
		}

		$defaults = self::defaults();

		foreach ( self::MESSAGE_FIELDS as $field ) {
			if ( ! array_key_exists( $field, $values ) ) {
				continue;
			}

			$message         = sanitize_text_field( (string) $values[ $field ] );
			$stored[ $field ] = '' !== $message ? $message : $defaults[ $field ];
		}

		$saved[ self::KEY ] = $stored;

		update_option( DashboardHelper::CLASSIC_OPTION_KEY, $saved );
	}
}
