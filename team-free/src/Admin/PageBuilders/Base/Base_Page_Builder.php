<?php
/**
 * Base page builder trait.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Base;

use ShapedPlugin\WPTeam\Admin\Dashboard\SavedTemplates;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared saved-template rendering for page builder integrations.
 *
 * Every builder module boils down to the same three steps — offer the template
 * list, validate the chosen id, print the template CSS next to its markup — so
 * they live here and each builder only supplies its own field/render plumbing.
 */
trait Base_Page_Builder {

	/**
	 * Saved templates for a builder select control.
	 *
	 * @return array Id => title, with a leading placeholder entry.
	 */
	public function get_saved_templates_list() {
		return Template_List::options( '0' );
	}

	/**
	 * Render a saved template, CSS first.
	 *
	 * @param int $template_id Saved template post id.
	 * @return string Rendered markup, or an error notice.
	 */
	public function render_template( $template_id ) {
		$template_id = absint( $template_id );

		if ( ! $template_id ) {
			return $this->error_message( __( 'Please select a saved template.', 'team-free' ) );
		}

		$template = get_post( $template_id );
		if ( ! $template || SavedTemplates::POST_TYPE !== $template->post_type || 'publish' !== $template->post_status ) {
			return $this->error_message( __( 'Template not found or not published.', 'team-free' ) );
		}

		if ( '' === trim( (string) $template->post_content ) ) {
			return $this->error_message( __( 'Template content is empty.', 'team-free' ) );
		}

		return Template_Css::get( $template_id ) . do_shortcode( SavedTemplates::shortcode_for( $template_id ) );
	}

	/**
	 * Error notice shown in place of a template.
	 *
	 * @param string $message Message to show.
	 * @return string
	 */
	protected function error_message( $message ) {
		return sprintf(
			'<div class="sptp-builder-notice" style="text-align:center;padding:20px;border:2px dashed #ccc;color:#999;font-size:14px;">%s</div>',
			esc_html( $message )
		);
	}
}
