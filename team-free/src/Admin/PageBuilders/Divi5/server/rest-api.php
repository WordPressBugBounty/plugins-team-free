<?php
/**
 * Divi 5 module REST endpoints.
 *
 * @package ShapedPlugin\WPTeam
 */

namespace ShapedPlugin\WPTeam\Admin\PageBuilders\Divi5;

use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Template_Css;
use ShapedPlugin\WPTeam\Admin\PageBuilders\Base\Template_List;
use ShapedPlugin\WPTeam\Admin\Dashboard\SavedTemplates;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST namespace the Divi 5 visual builder module talks to.
 *
 * Separate from the plugin's own `sptp/v1`: these two routes exist only to feed
 * a builder editor and are shaped for Divi's controls, not for the dashboard.
 *
 * @var string
 */
const REST_NAMESPACE = 'sptp/divi5/v1';

/**
 * Whether the caller may use the builder.
 *
 * @return bool
 */
function can_edit() {
	return current_user_can( 'edit_posts' );
}

/**
 * Register the module's REST routes.
 *
 * @return void
 */
function register_rest_routes() {
	register_rest_route(
		REST_NAMESPACE,
		'/team-html',
		array(
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => __NAMESPACE__ . '\get_team_html',
				'permission_callback' => __NAMESPACE__ . '\can_edit',
				'args'                => array(
					'template_id' => array(
						'required'          => true,
						'sanitize_callback' => 'absint',
						'description'       => 'Saved template post id.',
					),
				),
			),
		)
	);

	register_rest_route(
		REST_NAMESPACE,
		'/saved-templates',
		array(
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => __NAMESPACE__ . '\get_saved_templates',
				'permission_callback' => __NAMESPACE__ . '\can_edit',
			),
		)
	);
}

/**
 * Rendered saved template markup for the visual builder preview.
 *
 * @param \WP_REST_Request $request REST request.
 * @return \WP_REST_Response
 */
function get_team_html( $request ) {
	$template_id = absint( $request->get_param( 'template_id' ) );

	if ( ! $template_id ) {
		return new \WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Invalid template id.', 'team-free' ),
			),
			400
		);
	}

	$template = get_post( $template_id );
	if ( ! $template || SavedTemplates::POST_TYPE !== $template->post_type || 'publish' !== $template->post_status ) {
		return new \WP_REST_Response(
			array(
				'success' => false,
				'message' => __( 'Template not found or not published.', 'team-free' ),
			),
			404
		);
	}

	return new \WP_REST_Response(
		array(
			'success' => true,
			'html'    => Template_Css::get( $template_id ) . do_shortcode( SavedTemplates::shortcode_for( $template_id ) ),
		),
		200
	);
}

/**
 * Saved templates for the module's select control.
 *
 * Divi's select keys its options by string, so the ids are cast on the way out.
 *
 * @return \WP_REST_Response
 */
function get_saved_templates() {
	$options = array();

	foreach ( Template_List::options( '0' ) as $id => $title ) {
		$options[ (string) $id ] = $title;
	}

	return new \WP_REST_Response( $options, 200 );
}
