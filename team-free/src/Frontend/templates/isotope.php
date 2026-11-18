<?php
/**
 * Isotope layout.
 *
 * @package team-free
 * @subpackage team-free\Frontend\templates
 * @since 2.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use ShapedPlugin\WPTeam\Frontend\Helper;

?>
<div id="<?php echo esc_attr( 'sptp-' . $generator_id ); ?>" class="sp-team sptp-section <?php echo 'sptp-' . esc_html( $page_link_type ); ?> <?php echo esc_attr( $position ); ?>">
	<?php
	Helper::sptp_section_title( $main_section_title, $generator_id, $settings );
	if ( ! empty( $filter_members ) ) {
		?>

		<?php Helper::sptp_preloader( $preloader ); ?>
	
		<div id="sptp-isotope-filter-buttons">
			<button data-filter="*" class="active"><?php esc_html_e( 'All', 'team-free' ); ?></button>
			<?php
				$sptp_group_terms = get_terms(
					array(
						'taxonomy'   => 'sptp_group',
						'hide_empty' => false,
					)
				);

			if ( ! empty( $sptp_group_terms ) && ! is_wp_error( $sptp_group_terms ) ) {
				foreach ( $sptp_group_terms as $sptp_group_term ) {
					$slug = esc_attr( $sptp_group_term->slug );
					$name = esc_html( $sptp_group_term->name );
					echo wp_kses_post( "<button data-filter='.sptp-group-{$slug}'>{$name}</button>" );
				}
			}
			?>
		</div>

		<div class="sptp-isotope sptp-row">
			<?php

			// Loop through the members.
			foreach ( $filter_members as $key => $member ) {

				// Get taxonomy terms for this member.
				$sptp_group_terms = get_the_terms( $member->ID, 'sptp_group' );

				// Build classes from term slugs.
				$term_classes = '';
				if ( ! is_wp_error( $sptp_group_terms ) && ! empty( $sptp_group_terms ) ) {
					foreach ( $sptp_group_terms as $sptp_group_term ) {
						$term_classes .= ' sptp-group-' . sanitize_html_class( $sptp_group_term->slug );
					}
				}

				?>

				<div class="sp-team-item <?php echo esc_attr( $responsive_classes . $term_classes ); ?>">
					<?php include Helper::sptp_locate_template( 'member.php' ); ?>
				</div>

				<?php
			}
			?>
		</div> <!-- end row -->

		<?php

		// Pagination links.
		include Helper::sptp_locate_template( 'pagination.php' );

		wp_reset_postdata();

		?>
	<?php } ?>
</div>
