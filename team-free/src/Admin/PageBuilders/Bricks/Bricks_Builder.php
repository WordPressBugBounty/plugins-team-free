<?php
/**
 * Bricks Builder integration.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Bricks;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Assets;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Icon;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Smart Team saved template element.
 *
 * Declared inside `Bricks_Builder::register()` in `init.php` — see that file
 * for why: `\Bricks\Element` only exists once Bricks has loaded, and Bricks
 * itself requires this file by path rather than autoloading it, so the class
 * has to be reachable without relying on a prior `class_exists()` probe.
 */
class SPT_Bricks_Team_Element extends \Bricks\Element {

	/**
	 * Element category.
	 *
	 * @var string
	 */
	public $category = 'general';

	/**
	 * Element name (slug).
	 *
	 * @var string
	 */
	public $name = 'sptp-bricks-team';

	/**
	 * Element icon — Bricks prints it as `<i class="…">`, so the shared icon
	 * is painted on this class from `Bricks_Builder::register()`.
	 *
	 * @var string
	 */
	public $icon = Builder_Icon::CSS_CLASS;

	/**
	 * CSS selector Bricks scopes the element's own style controls to.
	 *
	 * @var string
	 */
	public $css_selector = '.sptp-bricks-team-wrapper';

	/**
	 * Element search tags.
	 *
	 * @var array
	 */
	public $tags = array( 'team', 'member', 'staff', 'smart team' );

	/**
	 * Saved-template plumbing.
	 *
	 * @var Bricks_Helper
	 */
	private $helper;

	/**
	 * Element label.
	 *
	 * @return string
	 */
	public function get_label() {
		return esc_html__( 'Smart Team', 'team-free' );
	}

	/**
	 * Element settings controls.
	 *
	 * @return void
	 */
	public function set_controls() {
		$this->controls['template_id'] = array(
			'type'        => 'select',
			'label'       => esc_html__( 'Saved Template', 'team-free' ),
			'options'     => $this->get_helper()->get_saved_templates_list(),
			'clearable'   => false,
			'default'     => '0',
			'pasteStyles' => true,
			'inline'      => true,
		);

		$this->controls['help'] = array(
			'type'    => 'info',
			'content' => esc_html__( 'Select a saved team template to display.', 'team-free' ),
		);
	}

	/**
	 * Render the element output.
	 *
	 * @return void
	 */
	public function render() {
		$template_id = isset( $this->settings['template_id'] ) ? absint( $this->settings['template_id'] ) : 0;

		printf(
			'<div %1$s>', // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Attributes are escaped by render_attributes().
			$this->render_attributes( '_root' ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		);

		printf(
			'<div class="sptp-bricks-team-wrapper" data-builder-template-id="%1$s">%2$s</div>',
			esc_attr( $template_id ),
			// Markup is assembled by the shared trait, which escapes its own
			// error notices and hands the rest to do_shortcode().
			$this->get_helper()->render_template( $template_id ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		);

		echo '</div>';
	}

	/**
	 * Load the block frontend bundle inside the Bricks builder editor.
	 *
	 * @return void
	 */
	public function enqueue_scripts() {
		if ( ! self::is_builder_editor() ) {
			return;
		}

		Builder_Assets::enqueue();
		Builder_Assets::reinit_script(
			'sptp-bricks-team-wrapper',
			array(
				'bricksElementsReady',
				'bricks/setup_frontend',
				'bricks/pages/render',
				'bricks/element/after_render',
				'bricksAjaxRender',
			)
		);
	}

	/**
	 * Bricks calls this alongside `enqueue_scripts()`; the shared emitter
	 * covers both, so this only has to fire when Bricks asks for styles first.
	 *
	 * @return void
	 */
	public function enqueue_styles() {
		if ( ! self::is_builder_editor() ) {
			return;
		}

		Builder_Assets::enqueue();
	}

	/**
	 * Saved-template helper, created on demand.
	 *
	 * @return Bricks_Helper
	 */
	private function get_helper() {
		if ( ! $this->helper ) {
			$this->helper = new Bricks_Helper();
		}

		return $this->helper;
	}

	/**
	 * Whether the current request is the Bricks builder editor.
	 *
	 * @return bool
	 */
	public static function is_builder_editor() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only context probe; no state is changed.
		if ( isset( $_GET['bricks'] ) ) {
			return true;
		}

		if ( function_exists( 'bricks_is_builder_main' ) && bricks_is_builder_main() ) {
			return true;
		}

		return function_exists( 'bricks_is_builder_call' ) && bricks_is_builder_call();
	}
}
