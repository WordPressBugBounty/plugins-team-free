<?php
/**
 * Divi 4 builder integration.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Divi;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Assets;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Icon;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the Smart Team module with the Divi 4 builder.
 *
 * Declared inside a function because `ET_Builder_Module` only exists once Divi
 * has booted, and a class extending a missing parent is a fatal at parse time.
 *
 * @return void
 */
function register_module() {
	static $registered = false;

	if ( $registered || ! class_exists( 'ET_Builder_Module' ) || class_exists( __NAMESPACE__ . '\ET_Builder_Module_Smart_Team', false ) ) {
		return;
	}

	/**
	 * Smart Team saved template module.
	 */
	class ET_Builder_Module_Smart_Team extends \ET_Builder_Module {

		/**
		 * Module slug.
		 *
		 * @var string
		 */
		public $slug = Divi_Builder::MODULE_SLUG;

		/**
		 * Visual Builder support level.
		 *
		 * @var string
		 */
		public $vb_support = 'partial';

		/**
		 * Saved-template plumbing.
		 *
		 * @var Divi_Helper
		 */
		private $helper;

		/**
		 * Set the module up.
		 *
		 * @return void
		 */
		public function init() {
			$this->name   = esc_html__( 'Smart Team', 'team-free' );
			$this->helper = new Divi_Helper();

			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_builder_assets' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_builder_assets' ) );
		}

		/**
		 * Module settings fields.
		 *
		 * @return array
		 */
		public function get_fields() {
			return array(
				'template_id' => array(
					'label'           => esc_html__( 'Saved Template', 'team-free' ),
					'type'            => 'select',
					'option_category' => 'basic_option',
					'options'         => $this->helper->get_saved_templates_list(),
					'default'         => '0',
					'description'     => esc_html__( 'Select a saved team template.', 'team-free' ),
					'toggle_slug'     => 'main_content',
				),
			);
		}

		/**
		 * Render the module.
		 *
		 * @param array  $attrs       Module attributes.
		 * @param string $content     Module content.
		 * @param string $render_slug Module render slug.
		 * @return string
		 */
		public function render( $attrs, $content = null, $render_slug = '' ) {
			$template_id = isset( $attrs['template_id'] ) ? $attrs['template_id'] : '';
			if ( '' === $template_id && isset( $this->props['template_id'] ) ) {
				$template_id = $this->props['template_id'];
			}

			$template_id = absint( $template_id );

			return sprintf(
				'<div class="%1$s" data-builder-template-id="%2$s">%3$s</div>',
				esc_attr( Divi_Builder::WRAPPER_CLASS ),
				esc_attr( $template_id ),
				// Markup is assembled by the shared trait, which escapes its own
				// error notices and hands the rest to do_shortcode().
				$this->helper->render_template( $template_id )
			);
		}

		/**
		 * Load the block frontend bundle inside the builder editor.
		 *
		 * Outside the editor `AssetManager` already registers these on the
		 * front end, and the layout blocks enqueue what they need.
		 *
		 * @return void
		 */
		public function enqueue_builder_assets() {
			if ( ! is_builder_editor() ) {
				return;
			}

			Builder_Assets::enqueue();
			Builder_Assets::reinit_script(
				Divi_Builder::WRAPPER_CLASS,
				array( 'divi:module:updated', 'divi:ajax:render:success', 'divi:builder:save' )
			);
		}
	}

	new ET_Builder_Module_Smart_Team();

	$registered = true;
}

/**
 * Whether the current request is the Divi builder editor.
 *
 * Covers the Frontend (Visual) Builder, the Backend Builder, Divi's preview
 * mode and the ajax/JSON requests either of them uses to re-render a module.
 *
 * @return bool
 */
function is_builder_editor() {
	// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Read-only context probe; no state is changed.
	if ( isset( $_GET['et_fb'] ) || isset( $_GET['et_pb_preview'] ) ) {
		return true;
	}

	if ( isset( $_GET['et_bfb'] ) && is_admin() ) {
		return true;
	}

	if ( ! empty( $GLOBALS['et_fb'] ) ) {
		return true;
	}

	if ( wp_doing_ajax() && isset( $_REQUEST['action'] ) && 0 === strpos( sanitize_key( wp_unslash( $_REQUEST['action'] ) ), 'et_' ) ) {
		return true;
	}
	// phpcs:enable WordPress.Security.NonceVerification.Recommended

	$fb_enabled = function_exists( 'et_core_is_fb_enabled' ) && et_core_is_fb_enabled();

	if ( wp_is_json_request() && $fb_enabled ) {
		return true;
	}

	// The Backend Builder leaves no request marker of its own, so an admin
	// request with the builder loaded is the only signal available there.
	if ( is_admin() && function_exists( 'et_builder_is_loaded' ) && et_builder_is_loaded() ) {
		return true;
	}

	return $fb_enabled;
}

/**
 * Divi 4 integration entry point.
 */
class Divi_Builder {

	/**
	 * Module slug, and the `d4Shortcode` the Divi 5 module maps back to.
	 *
	 * Class constants rather than namespace ones so a reference from the Divi 5
	 * integration autoloads this file instead of hitting an undefined constant.
	 *
	 * @var string
	 */
	const MODULE_SLUG = 'et_pb_smart_team';

	/**
	 * Wrapper class the module renders around a saved template.
	 *
	 * @var string
	 */
	const WRAPPER_CLASS = 'sptp-divi-team-wrapper';

	/**
	 * Hook the module into Divi.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'et_builder_ready', __NAMESPACE__ . '\register_module' );
		add_filter( 'et_builder_module_icons', array( __CLASS__, 'register_module_icon' ) );
	}

	/**
	 * Paint the module's tile in the Add Module list with the plugin icon.
	 *
	 * @param array $icons Registered module icons.
	 * @return array
	 */
	public static function register_module_icon( $icons ) {
		return Builder_Icon::divi_module_icons( $icons, self::MODULE_SLUG );
	}
}
