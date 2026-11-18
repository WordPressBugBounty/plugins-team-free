<?php
/**
 * Pagination template for displaying pagination links.
 *
 * @package Team
 * @subpackage Team\Frontend\templates
 * @since 2.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Pagination links.
$paged_query   = 'generator_id_' . absint( $generator_id );
$paged_format  = '?' . $paged_query . '=%#%';
$current_page  = isset( $_GET[ $paged_query ] ) ? absint( wp_unslash( $_GET[ $paged_query ] ) ) : 1;
$max_num_pages = $filter_members_query->max_num_pages;

// Generate pagination links.
$paginations = paginate_links(
	array(
		'format'    => $paged_format,
		'prev_next' => true,
		'current'   => $current_page,
		'total'     => $max_num_pages,
		'type'      => 'array',
		'prev_text' => '<i class="fa fa-angle-left"></i>',
		'next_text' => '<i class="fa fa-angle-right"></i>',
	)
);

// Display pagination links if available.
if ( ! empty( $paginations ) && $pagination_universal ) {
	?>
	<div class="sptp-col-md-1">
		<div class="sptp-post-pagination" style="text-align: <?php echo esc_attr( $pagination_alignment ); ?>;">			
			<?php
			foreach ( $paginations as $key => $pagination ) :
				echo wp_kses_post( $pagination );
			endforeach;
			?>
		</div>
	</div>
	<?php
}
