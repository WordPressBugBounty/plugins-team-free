<?php
/**
 * Oxygen Builder integration.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Oxygen;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Assets;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Icon;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the Smart Team element with Oxygen Builder.
 *
 * Declared inside a function because `OxyEl` only exists once Oxygen has
 * loaded, and a class extending a missing parent is a fatal at parse time.
 *
 * @return void
 */
function register_element() {
	static $registered = false;

	if ( $registered || ! class_exists( 'OxyEl' ) || class_exists( __NAMESPACE__ . '\\SPT_Oxygen_Team_Element', false ) ) {
		return;
	}

	/**
	 * Smart Team saved template element.
	 */
	class SPT_Oxygen_Team_Element extends \OxyEl {

		/**
		 * Element name.
		 *
		 * @return string
		 */
		public function name() {
			return esc_html__( 'Smart Team', 'team-free' );
		}

		/**
		 * Element slug.
		 *
		 * @return string
		 */
		public function slug() {
			return 'sptp-team-template';
		}

		/**
		 * Element icon.
		 *
		 * @return string
		 */
		public function icon() {
			return Builder_Icon::url();
		}

		/**
		 * Button priority in the elements panel.
		 *
		 * @return int
		 */
		public function button_priority() {
			return 9;
		}

		/**
		 * Wrapping HTML tag.
		 *
		 * @return string
		 */
		public function tag() {
			return 'div';
		}

		/**
		 * Whether the element gets Oxygen's full CSS controls.
		 *
		 * @return bool
		 */
		public function enableFullCSS() {
			return true;
		}

		/**
		 * Wire up the builder-editor asset reload.
		 *
		 * @return void
		 */
		public function afterInit() {
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_builder_assets' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_builder_assets' ) );
		}

		/**
		 * Element settings controls.
		 *
		 * @return void
		 */
		public function controls() {
			$this->addOptionControl(
				array(
					'type'    => 'dropdown',
					'name'    => esc_html__( 'Saved Template', 'team-free' ),
					'slug'    => 'template_id',
					'default' => 0,
				)
			)->setValue( ( new Oxygen_Helper() )->get_saved_templates_list() )->rebuildElementOnChange();
		}

		/**
		 * Render the element.
		 *
		 * @param array  $options  Element options.
		 * @param array  $defaults Default values.
		 * @param string $content  Inner content.
		 * @return void
		 */
		public function render( $options, $defaults, $content ) {
			$template_id = isset( $options['template_id'] ) ? absint( $options['template_id'] ) : 0;

			printf(
				'<div class="%1$s" data-builder-template-id="%2$s">%3$s</div>',
				esc_attr( Oxygen_Builder::WRAPPER_CLASS ),
				esc_attr( $template_id ),
				// Markup is assembled by the shared trait, which escapes its own
				// error notices and hands the rest to do_shortcode().
				( new Oxygen_Helper() )->render_template( $template_id ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			);
		}

		/**
		 * Load the block frontend bundle inside the builder editor.
		 *
		 * @return void
		 */
		public function enqueue_builder_assets() {
			if ( ! is_builder_editor() ) {
				return;
			}

			Builder_Assets::enqueue();
			Builder_Assets::reinit_script(
				Oxygen_Builder::WRAPPER_CLASS,
				array( 'oxygen-ajax-element-loaded' )
			);
		}
	}

	new SPT_Oxygen_Team_Element();

	$registered = true;
}

/**
 * Whether the current request is the Oxygen builder editor.
 *
 * Covers the iframed visual editor and the ajax requests it uses to
 * re-render an element after a settings change.
 *
 * @return bool
 */
function is_builder_editor() {
	if ( function_exists( 'ct_get_current_screen' ) && 'oxy_settings_iframe' === ct_get_current_screen() ) {
		return true;
	}

	// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Read-only context probe; no state is changed.
	if ( isset( $_GET['oxygen_iframe'] ) ) {
		return true;
	}

	if ( isset( $_GET['action'] ) && false !== strpos( sanitize_key( wp_unslash( $_GET['action'] ) ), 'oxy_render_oxy' ) ) {
		return true;
	}
	// phpcs:enable WordPress.Security.NonceVerification.Recommended

	return false;
}

/**
 * Oxygen Builder integration entry point.
 */
class Oxygen_Builder {

	/**
	 * Wrapper class the element renders around a saved template.
	 *
	 * @var string
	 */
	const WRAPPER_CLASS = 'sptp-oxygen-team-wrapper';

	/**
	 * Register the element with Oxygen.
	 *
	 * Called from `Manager::load_oxygen()`, which has already confirmed Oxygen
	 * is active and the integration is enabled.
	 *
	 * @return void
	 */
	public static function register() {
		register_element();
	}
}
