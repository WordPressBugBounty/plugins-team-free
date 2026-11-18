<?php
/**
 * Elementor widget for Smart Team saved templates.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Elementor;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;
use ShapedPlugin\WPTeam\Admin\Dashboard\SavedTemplates;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Base_Page_Builder;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Builder_Icon;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Smart Team saved template widget.
 */
class Elementor_Widget extends Widget_Base {

	use Base_Page_Builder;

	/**
	 * Get widget name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'sptp_saved_template';
	}

	/**
	 * Get widget title.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Smart Team Saved Template', 'team-free' );
	}

	/**
	 * Get widget icon.
	 *
	 * The CSS class, matching the selector `Builder_Icon::enqueue_css()`
	 * paints in `Elementor_Builder::enqueue_admin_icon()` — Elementor renders
	 * this string verbatim as `<i class="…">`.
	 *
	 * @return string
	 */
	public function get_icon() {
		return Builder_Icon::CSS_CLASS;
	}

	/**
	 * Get widget categories.
	 *
	 * @return array
	 */
	public function get_categories() {
		return array( 'basic' );
	}

	/**
	 * Get widget keywords.
	 *
	 * @return array
	 */
	public function get_keywords() {
		return array( 'team', 'member', 'staff', 'grid', 'carousel' );
	}

	/**
	 * Style handles the widget needs, wherever it renders.
	 *
	 * Elementor parses these during its own early `wp_enqueue_scripts`-time
	 * pass over the page's Elementor data — well before `wp_head()` prints —
	 * so the handles are already in `<head>` by the time the widget itself
	 * renders in the body. Without this, the styles are only ever registered
	 * from inside `render_template()`'s own `do_shortcode()` call, too late
	 * for the theme's already-printed `<head>` to pick them up, and the card
	 * renders raw and unstyled. Same list the sibling Real Testimonials Pro
	 * widget declares for the same reason.
	 *
	 * @return array
	 */
	public function get_style_depends() {
		return array( 'sptp-blocks-style', 'sptp-swiper' );
	}

	/**
	 * Script handles the widget needs, wherever it renders.
	 *
	 * @return array
	 */
	public function get_script_depends() {
		return array( 'sptp-blocks-frontend' );
	}

	/**
	 * Controls register.
	 *
	 * @return void
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'content_section',
			array(
				'label' => __( 'Content', 'team-free' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'template_id',
			array(
				'label'       => __( 'Saved Template', 'team-free' ),
				'type'        => Controls_Manager::SELECT2,
				'label_block' => true,
				'default'     => '0',
				'options'     => $this->get_saved_templates_list(),
			)
		);

		$this->add_control(
			'sptp_template_actions',
			array(
				'type'            => Controls_Manager::RAW_HTML,
				'raw'             => $this->get_template_action_links(),
				'content_classes' => 'sptp-elementor-template-actions',
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render widget output.
	 *
	 * Wrapped unconditionally, like every other builder in this layer — not
	 * only when `\Elementor\Plugin::$instance->editor->is_edit_mode()` is true
	 * (which Elementor only sets on the ajax re-render, never in the preview
	 * iframe or on the frontend) — so `Elementor_Builder::enqueue_preview_scripts()`'s
	 * `reinit_script()` MutationObserver has the same wrapper to match against
	 * on every render.
	 *
	 * @return void
	 */
	protected function render() {
		$settings    = $this->get_settings_for_display();
		$template_id = isset( $settings['template_id'] ) ? absint( $settings['template_id'] ) : 0;

		printf(
			'<div class="%1$s" data-builder-template-id="%2$s">%3$s</div>',
			esc_attr( Elementor_Builder::WRAPPER_CLASS ),
			esc_attr( $template_id ),
			$this->render_template( $template_id ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		);
	}

	/**
	 * Edit / Add New saved template links shown under the control.
	 *
	 * @return string
	 */
	protected function get_template_action_links() {
		$edit_url = SavedTemplates::dashboard_url();
		$new_url  = admin_url( 'post-new.php?post_type=' . SavedTemplates::POST_TYPE . '&sptpblock_inserter=true' );

		ob_start();
		?>
		<div class="sptp-elementor-template-buttons">
			<a class="sptp-edit-template-btn" href="<?php echo esc_url( $edit_url ); ?>" target="_blank" rel="noopener noreferrer" style="color:#fff; background-color:#3e3e40; padding:12px 24px; border-radius:4px; display:inline-block; font-size:14px" onmouseover="this.style.backgroundColor='#4b4b4d'" onmouseout="this.style.backgroundColor='#3e3e40'">
				<span style="display:inline-block; transform:rotate(70deg); margin-right:4px">✎</span>
				<span><?php echo esc_html__( 'Edit Saved Templates', 'team-free' ); ?></span>
			</a>
			<a class="sptp-add-template-btn" href="<?php echo esc_url( $new_url ); ?>" target="_blank" rel="noopener noreferrer" style="color:#fff; background-color:#2b5f47; padding:10px 23px; border-radius:4px; display:inline-block; margin-top:15px; font-size:14px" onmouseover="this.style.backgroundColor='#20432f'" onmouseout="this.style.backgroundColor='#2b5f47'">
				<span style="display:inline-block; font-size:18px; margin-right:4px;">+</span>
				<span><?php echo esc_html__( 'Add New Template', 'team-free' ); ?></span>
			</a>
		</div>
		<?php
		return ob_get_clean();
	}
}
