<?php
/**
 * Template Name: Biography Fields
 *
 * @package wp-team-pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

?>

<?php if ( $biography_switch ) { ?>
<div class="sptp-member-biography-fields">
	<?php if ( $biography_section_title ) { ?>
		<strong class="sptp-member-details-section-title"><?php esc_html_e( 'Biography', 'team-free' ); ?></strong>
	<?php } ?>

	<div class="sptp-content">
		<?php
		the_content();
		?>
	</div>
</div>
<?php } ?>
