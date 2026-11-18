<?php
/**
 * Beaver Builder — Smart Team module frontend template.
 *
 * Beaver Builder loads this file automatically when rendering the module.
 * `$module`, `$id`, and `$settings` are supplied by Beaver's rendering engine.
 *
 * @package ShapedPlugin\WPTeam
 *
 * @var SPT_Beaver_Team_Module $module   The module instance.
 * @var string                  $id       The module's unique node id.
 * @var object                  $settings The module's saved settings.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$template_id = isset( $settings->template_id ) ? absint( $settings->template_id ) : 0;
?>
<div class="<?php echo esc_attr( SPT_Beaver_Team_Module::WRAPPER_CLASS ); ?>" data-builder-template-id="<?php echo esc_attr( $template_id ); ?>">
	<?php
	// Markup is assembled by the shared trait, which escapes its own error
	// notices and hands the rest to do_shortcode().
	echo $module->helper->render_template( $template_id ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	?>
</div>
