<?php
/**
 * Template Name: Image Fields
 *
 * @package wp-team-pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<div class="sptp-member-image-fields">
	<?php
	if ( $image_switch && has_post_thumbnail() ) {
		?>
		<div class="sptp-member-avatar-area">
			<?php
				the_post_thumbnail();
			?>
		</div>
		<?php
	}
	?>
</div>
