<?php
/**
 * Member layout block base — the shared card renderer.
 *
 * Every layout block (grid, carousel, future list/table/…) extends this class
 * instead of AbstractBlock. It owns the whole member-card render pipeline:
 * prepare_render_settings() → render_cards_html() → render_card() →
 * render_element() plus the image/skill/meta-icon/bio helpers. The card markup
 * uses the layout-neutral `.sp-smart-team-card` BEM block (design + state
 * modifiers ride on the card root), so one stylesheet and one dynamic-CSS rule
 * set style cards in every layout. Layouts contribute only their wrapper
 * markup (render_block()) and the per-card cell wrapper class
 * ($card_cell_class — grid cell, swiper slide, …).
 *
 * The markup is the exact twin of apps/blocks/shared/MemberCard.jsx — keep
 * both in lock-step so dynamic CSS resolves in editor and frontend alike.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Includes
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Class MemberLayoutBlock
 */
abstract class MemberLayoutBlock extends AbstractBlock {

	/**
	 * Class(es) for the wrapper each card is nested in — the layout's cell.
	 * Grid: `sp-smart-team-grid__cell`; carousel: `… swiper-slide`. Empty =
	 * cards render without a cell wrapper.
	 *
	 * @var string
	 */
	protected $card_cell_class = '';

	/**
	 * Member Details link settings of the card currently being rendered — set
	 * by render_card() so the name/image element renderers can wrap their
	 * output without threading another parameter through render_element().
	 *
	 * @var array{link_enabled?: bool, clickable?: string, new_tab?: bool}
	 */
	protected $details = array();

	/**
	 * Whether this render needs `$query->found_posts`. The total is emitted as
	 * `data-total-members` purely for the ajax addons' page math, so with none
	 * of them enabled MemberQuery can set `no_found_rows` and skip the extra
	 * COUNT query. When it does, the layout falls back to the rendered count so
	 * the attribute still matches what is on the page.
	 *
	 * @param array $attributes Block attributes.
	 * @return bool
	 */
	protected function needs_total_count( $attributes ) {
		// Ajax Search / Live Frontend Filter are Pro stubs in Free (they render
		// ''), so a Pro-saved `true` on either needs no count here.
		return ! empty( $attributes['ajaxPagination'] );
	}

	/**
	 * Transient attribute carrying the sibling Ajax Pagination's per-page into
	 * the layout block's render — the grid cannot see its team-group siblings.
	 */
	const AJAX_PER_PAGE_ATTR = 'sptpAjaxPerPage';

	/**
	 * `render_block_data` — stamp AJAX_PER_PAGE_ATTR on a layout block rendered
	 * inside sptp/team-group next to an sptp/ajax-pagination, so its first page
	 * matches what the ajax endpoint serves for page 1. Always overwritten, so a
	 * value smuggled into saved markup never survives.
	 *
	 * @param array          $parsed_block Block being rendered.
	 * @param array          $source_block Unfiltered block.
	 * @param \WP_Block|null $parent_block Parent block instance.
	 * @return array
	 */
	public static function inject_ajax_per_page( $parsed_block, $source_block = array(), $parent_block = null ) {
		if ( 'sptp/grid' !== ( $parsed_block['blockName'] ?? '' ) ) {
			return $parsed_block;
		}
		unset( $parsed_block['attrs'][ self::AJAX_PER_PAGE_ATTR ] );

		// A switched-off Ajax Pagination renders no controls, so the layout must
		// show its whole list rather than a first page nobody can page past.
		if ( ! DashboardHelper::is_block_enabled( 'sptp/ajax-pagination' ) ) {
			return $parsed_block;
		}

		if ( ! $parent_block instanceof \WP_Block || 'sptp/team-group' !== $parent_block->name ) {
			return $parsed_block;
		}
		foreach ( $parent_block->parsed_block['innerBlocks'] ?? array() as $sibling ) {
			if ( 'sptp/ajax-pagination' === ( $sibling['blockName'] ?? '' ) ) {
				$per_page = $sibling['attrs']['itemPerPage']['value'] ?? 12;
				$parsed_block['attrs'][ self::AJAX_PER_PAGE_ATTR ] = max( 1, (int) $per_page );
				break;
			}
		}
		return $parsed_block;
	}

	/**
	 * Run the layout's initial query. With Ajax Pagination active only page 1
	 * of the Show Member–capped set renders; the ajax endpoint serves the rest
	 * with the same MemberQuery::page_args() window.
	 *
	 * @param array $attributes Block attributes.
	 * @return array{0: \WP_Query, 1: int, 2: int} Query, total members, page size (data-limit).
	 */
	protected function query_first_page( $attributes ) {
		$query_args  = MemberQuery::build_args_from_attributes( $attributes );
		$cap         = MemberQuery::result_cap( $query_args );
		$count_total = $this->needs_total_count( $attributes );
		$per_page    = ! empty( $attributes['ajaxPagination'] ) ? (int) ( $attributes[ self::AJAX_PER_PAGE_ATTR ] ?? 0 ) : 0;

		if ( $per_page > 0 ) {
			$query_args = MemberQuery::page_args( $query_args, 1, $per_page );
		}
		$query_args['count_total'] = $count_total;
		$query                     = MemberQuery::query( $query_args );

		$total = $count_total ? MemberQuery::capped_total( $query, $cap ) : (int) $query->post_count;
		return array( $query, $total, $per_page > 0 ? $per_page : $cap );
	}

	/**
	 * Resolve the render-time setting bundles from the attributes once. Shared
	 * by render_block() and render_members_html() so initial and ajax-rendered
	 * cards can never drift.
	 *
	 * @param array $attributes Block attributes.
	 * @return array Settings keyed card_design/card_classes/ordered/read_more/skills/basic/meta/social/image/details.
	 */
	protected function prepare_render_settings( $attributes ) {
		// Fallback matrix: a Pro-authored card-4…card-11 (or a Pro card
		// element) normalizes to its free equivalent here, at render time —
		// the stored attribute itself is never touched (Pro_Gate::card_design()/
		// card_elements() are read-only and idempotent).
		$card_design = isset( $attributes['cardDesign'] ) && '' !== $attributes['cardDesign'] ? sanitize_html_class( $attributes['cardDesign'] ) : 'card-1';
		$card_design = Pro_Gate::card_design( $card_design );
		$meta_style  = isset( $attributes['metaIconStyle'] ) ? sanitize_html_class( $attributes['metaIconStyle'] ) : 'style-1';

		$elements = isset( $attributes['cardElements'] ) && is_array( $attributes['cardElements'] ) ? $attributes['cardElements'] : array();
		$elements = Pro_Gate::card_elements( $elements );
		$ordered  = $this->ordered_elements( $elements );

		$read_more = array(
			'show'  => Pro_Gate::read_more_button( $attributes['readMoreButton'] ?? false ),
			'label' => isset( $attributes['readMoreLabel'] ) && '' !== $attributes['readMoreLabel'] ? $attributes['readMoreLabel'] : __( 'Read More', 'team-free' ),
		);

		$skills = array(
			'display_style'      => isset( $attributes['skillsDisplayStyle'] ) ? sanitize_html_class( $attributes['skillsDisplayStyle'] ) : 'progress',
			'bar_style'          => isset( $attributes['skillsProgressBarStyle'] ) ? sanitize_html_class( $attributes['skillsProgressBarStyle'] ) : 'style-2',
			'percent_visibility' => isset( $attributes['skillsPercentVisibility'] ) ? sanitize_html_class( $attributes['skillsPercentVisibility'] ) : 'always',
		);

		$set_map       = array(
			'style-1' => 'fill',
			'style-2' => 'bold-line',
			'style-3' => 'thin-line',
		);
		$meta          = array(
			'show_icon' => ! empty( $attributes['displayMetaIcon'] ),
			'icon_set'  => isset( $set_map[ $meta_style ] ) ? $set_map[ $meta_style ] : 'fill',
		);
		$icon_position = isset( $attributes['socialIconPosition'] ) ? $attributes['socialIconPosition'] : 'bottom-right';
		$social        = array(
			'icon_style' => isset( $attributes['socialIconStyle'] ) ? sanitize_html_class( $attributes['socialIconStyle'] ) : 'style-1',
			'position'   => in_array( $icon_position, array( 'top-left', 'top-right', 'bottom-left', 'bottom-right' ), true ) ? $icon_position : 'bottom-right',
		);

		// Card Hover Effect and Card Content → Hover Content are Pro — Free
		// never reads `hoverEffect` or `hoverContent` and has no reveal markup,
		// CSS or runtime, so every element renders at rest (the stored values
		// are left untouched for Pro).

		// Image Flip, Lazy Loading, Special Tag and Image Filter are Pro — Free
		// has no render path for them (their stored attributes are left
		// untouched). A Pro Hover Effect renders as 'none'.
		$image = array(
			'resolution'   => isset( $attributes['imageResolution'] ) ? sanitize_key( $attributes['imageResolution'] ) : 'full',
			'aspect'       => isset( $attributes['imageAspectRatio'] ) ? sanitize_html_class( $attributes['imageAspectRatio'] ) : '1-1',
			'retina'       => ! empty( $attributes['imageRetina'] ),
			'hover_effect' => Pro_Gate::image_hover_effect( $attributes['imageHoverEffect'] ?? 'none' ),
		);

		// Member Details — the elements picked by Make Clickable link to the
		// member's own page. Modal (Pro) renders as Single Page and every Pro
		// Make Clickable target as Only Image; the stored values are untouched.
		$details_mode = Pro_Gate::details_open_as( $attributes['detailsOpenAs'] ?? 'modal' );
		$details      = array(
			'link_enabled' => ! empty( $attributes['showMemberDetails'] ),
			'mode'         => $details_mode,
			'template'     => isset( $attributes['detailsTemplate'] ) ? (string) $attributes['detailsTemplate'] : 'default',
			'clickable'    => Pro_Gate::make_clickable( $attributes['makeClickable'] ?? 'image' ),
			// Link Open In New Tab is a Single Page control — the modal opens in
			// place, so a new tab would defeat it.
			'new_tab'      => 'single' === $details_mode && ! empty( $attributes['detailsOpenInNewTab'] ),
		);

		$name_tag = isset( $attributes['nameHtmlTag'] ) ? strtolower( $attributes['nameHtmlTag'] ) : 'h3';
		$basic    = array(
			'name_tag'   => in_array( $name_tag, array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ), true ) ? $name_tag : 'h3',
			// Auto Fallback and the Limited display style (length/ellipsis) are
			// Pro — Free renders the short bio or full description, untrimmed.
			'bio_source' => Pro_Gate::bio_source( isset( $attributes['bioSource'] ) ? $attributes['bioSource'] : 'short' ),
		);

		// Card-root classes shared by every card of this block instance: the
		// neutral card block + design modifier + the per-design image-position
		// modifiers (twin of cardClasses in MemberCard.jsx).
		$image_position      = isset( $attributes['imagePosition'] ) ? $attributes['imagePosition'] : 'left';
		$image_area_position = isset( $attributes['imageAreaPosition'] ) ? $attributes['imageAreaPosition'] : 'left';
		$card_classes        = array_filter(
			array(
				'sp-smart-team-card',
				'sp-smart-team-card--' . $card_design,
				'card-2' === $card_design && 'left' === $image_position ? 'sp-smart-team-card--image-left' : '',
				'card-5' === $card_design && 'right' === $image_position ? 'sp-smart-team-card--image-right' : '',
				'card-9' === $card_design && 'right' === $image_area_position ? 'sp-smart-team-card--image-right' : '',
			)
		);

		return compact( 'card_design', 'card_classes', 'ordered', 'read_more', 'skills', 'basic', 'meta', 'social', 'image', 'details' );
	}

	/**
	 * Public entry point for the sptp_query_members AJAX handler — renders a
	 * query's cards with the exact markup of the initial render.
	 *
	 * @param array     $attributes Block attributes (saved + defaults).
	 * @param \WP_Query $query      Member query for the requested page.
	 * @return string Cards HTML (escaped in render_card()).
	 */
	public function render_members_html( $attributes, $query ) {
		return $this->render_cards_html( $this->prepare_render_settings( $attributes ), $query );
	}

	/**
	 * Loop a member query through render_card() with prepared settings.
	 *
	 * @param array     $settings Prepared settings from prepare_render_settings().
	 * @param \WP_Query $query    Member query.
	 * @return string Cards HTML.
	 */
	protected function render_cards_html( $settings, $query ) {
		ob_start();
		while ( $query->have_posts() ) {
			$query->the_post();
			$member = MemberQuery::get_member_data( get_post() );
			if ( empty( $member ) ) {
				continue;
			}
			$this->render_card( $member, $settings );
		}
		wp_reset_postdata();
		return ob_get_clean();
	}

	/**
	 * Ordered keys of shown elements from the sortable `cardElements` list;
	 * falls back to the core elements when the list is absent (legacy content).
	 *
	 * @param array $elements The cardElements list.
	 * @return array<int, string> Element keys, in order, for shown elements only.
	 */
	protected function ordered_elements( $elements ) {
		if ( empty( $elements ) ) {
			return array( 'image', 'name', 'role', 'bio', 'social' );
		}
		$ordered = array();
		foreach ( $elements as $element ) {
			if ( ! empty( $element['show'] ) && isset( $element['value'] ) ) {
				$ordered[] = $element['value'];
			}
		}
		return $ordered;
	}

	/**
	 * Whether a Member Details link applies to the given target (twin of
	 * linksTo() in MemberCard.jsx).
	 *
	 * @param string $target `image` | `name` | `full`.
	 * @return bool
	 */
	protected function details_links( $target ) {
		if ( empty( $this->details['link_enabled'] ) ) {
			return false;
		}
		$clickable = isset( $this->details['clickable'] ) ? $this->details['clickable'] : 'image';
		if ( 'image' === $target ) {
			return in_array( $clickable, array( 'image', 'image-name' ), true );
		}
		if ( 'name' === $target ) {
			return in_array( $clickable, array( 'name', 'image-name' ), true );
		}
		return 'full' === $clickable;
	}

	/**
	 * Escaped anchor attributes for a member-details link — href plus the
	 * new-tab target/rel pair when Link Open In New Tab is on.
	 *
	 * @param array $member Normalized member data.
	 * @return string Escaped attribute string, safe to print.
	 */
	protected function details_link_attrs( $member ) {
		$attrs = 'href="' . esc_url( ! empty( $member['link'] ) ? $member['link'] : '#' ) . '"';
		if ( ! empty( $this->details['new_tab'] ) ) {
			$attrs .= ' target="_blank" rel="noopener noreferrer"';
		}

		// Modal: the runtime opens the member in place. The href above stays as
		// the no-JS fallback (and keeps the link crawlable).
		if ( 'modal' === ( $this->details['mode'] ?? 'single' ) && ! empty( $member['id'] ) ) {
			$attrs .= ' data-sptp-member="' . esc_attr( (int) $member['id'] ) . '" aria-haspopup="dialog"';
		}

		return $attrs;
	}

	/**
	 * Wrapper attributes carrying the Member Details open behavior (read by
	 * Pro's modal runtime; Free ships none, see Pro_Gate::details_open_as()). Printed on the layout
	 * block's root, so ajax-appended cards inherit it for free.
	 *
	 * Also enqueues what the details template needs: the runtime itself, plus
	 * the icon fonts its contact-row / social blocks use — those blocks declare
	 * them, but they render inside the ajax response, long after the page's own
	 * assets were resolved.
	 *
	 * @param array $settings Prepared settings from prepare_render_settings().
	 * @return string Escaped attribute string (leading space), '' when not applicable.
	 */
	protected function details_root_attrs( $settings ) {
		$details = isset( $settings['details'] ) && is_array( $settings['details'] ) ? $settings['details'] : array();
		$mode    = isset( $details['mode'] ) ? $details['mode'] : 'single';

		if ( empty( $details['link_enabled'] ) || 'modal' !== $mode ) {
			return '';
		}

		wp_enqueue_script( 'sptp-blocks-frontend' );
		foreach ( array( 'sp_team_fontawesome', 'sp_team_fontello' ) as $font ) {
			if ( wp_style_is( $font, 'registered' ) ) {
				wp_enqueue_style( $font );
			}
		}

		$config = array(
			'mode'     => $mode,
			'template' => isset( $details['template'] ) ? $details['template'] : 'default',
		);

		return ' data-details-settings="' . esc_attr( $this->json_attr( $config ) ) . '"';
	}

	/**
	 * Render a single member card. Markup mirrors MemberCard.jsx; elements are
	 * emitted in the order of the sortable Member Information list.
	 *
	 * @param array $member   Normalized member data.
	 * @param array $settings Prepared settings from prepare_render_settings().
	 * @return void
	 */
	protected function render_card( $member, $settings ) {
		$this->details = isset( $settings['details'] ) && is_array( $settings['details'] ) ? $settings['details'] : array();
		$card_design   = $settings['card_design'];
		$ordered       = $settings['ordered'];
		$read_more     = $settings['read_more'];
		$skills        = $settings['skills'];
		$basic         = $settings['basic'];
		$meta          = $settings['meta'];
		$social        = $settings['social'];
		$image         = $settings['image'];

		// The overlay presets (overlay-1…overlay-5) are Pro and normalize to
		// card-1 before this point (Pro_Gate::card_design()), so no overlay
		// branch ships here.
		$split_image      = in_array( $card_design, array( 'card-2', 'card-3', 'card-4', 'card-5' ), true );
		$image_first      = in_array( $card_design, array( 'card-3', 'card-4', 'card-5' ), true );
		$social_in_image  = in_array( $card_design, array( 'card-6', 'card-8' ), true );
		$caption_in_image = ( 'card-8' === $card_design );
		$side_column      = in_array( $card_design, array( 'card-9', 'card-10' ), true );
		$side_keys        = array( 'image', 'name', 'role' );

		$image_flyout = '';
		if ( $social_in_image && ! empty( $member['socials'] ) && in_array( 'social', (array) $ordered, true ) ) {
			$flyout_position = ! empty( $social['position'] ) ? $social['position'] : 'bottom-right';
			ob_start();
			echo '<div class="sp-smart-team-card__social-flyout sp-smart-team-card__social-flyout--' . esc_attr( $flyout_position ) . '">';
			$this->render_element( 'social', $member, $skills, $basic, $meta, $social, $image );
			if ( 'card-6' === $card_design ) {
				echo '<span class="sp-smart-team-card__social-toggle" aria-hidden="true"></span>';
			}
			echo '</div>';
			$image_flyout = ob_get_clean();
		}

		if ( $caption_in_image && ( '' !== $member['name'] || '' !== $member['role'] ) ) {
			ob_start();
			echo '<div class="sp-smart-team-card__image-caption">';
			foreach ( array( 'name', 'role' ) as $caption_key ) {
				if ( ! in_array( $caption_key, (array) $ordered, true ) ) {
					continue;
				}
				$this->render_element( $caption_key, $member, $skills, $basic, $meta, $social, $image );
			}
			echo '</div>';
			$image_flyout .= ob_get_clean();
		}

		$item_classes = ! empty( $settings['card_classes'] ) ? $settings['card_classes'] : array( 'sp-smart-team-card', 'sp-smart-team-card--' . $card_design );

		// Member Details → Make Clickable: Full Card — a stretched invisible
		// overlay link covers the card; real links inside (social, read more)
		// stay clickable above it (see --linkable in style.scss).
		$full_card_link = $this->details_links( 'full' );
		if ( $full_card_link ) {
			$item_classes[] = 'sp-smart-team-card--linkable';
		}

		// Preloader: the whole card waits under a spinner / skeleton, not just the image.
		$preloader = $this->item_preloader();
		if ( '' !== $preloader['class'] ) {
			$item_classes[] = $preloader['class'];
		}
		?>
		<?php if ( '' !== $this->card_cell_class ) : ?>
		<div class="<?php echo esc_attr( $this->card_cell_class ); ?>">
		<?php endif; ?>
		<div class="<?php echo esc_attr( implode( ' ', $item_classes ) ); ?>"<?php echo $preloader['style'] ? ' style="' . esc_attr( $preloader['style'] ) . '"' : ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inline. ?>>
			<?php if ( $full_card_link ) : ?>
				<a class="sp-smart-team-card__card-link" <?php echo $this->details_link_attrs( $member ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in details_link_attrs(). ?> aria-label="<?php echo esc_attr( $member['name'] ); ?>"></a>
			<?php endif; ?>
			<?php if ( $split_image && $image_first && in_array( 'image', (array) $ordered, true ) ) : ?>
				<?php $this->render_element( 'image', $member, $skills, $basic, $meta, $social, $image, $image_flyout ); ?>
			<?php endif; ?>

			<?php if ( $side_column ) : ?>
				<div class="sp-smart-team-card__side">
					<?php
					foreach ( (array) $ordered as $key ) {
						if ( in_array( $key, $side_keys, true ) ) {
							$this->render_element( $key, $member, $skills, $basic, $meta, $social, $image );
						}
					}
					?>
				</div>
			<?php endif; ?>

			<div class="sp-smart-team-card__content">
				<?php
				foreach ( (array) $ordered as $key ) {
					if (
						( $split_image && 'image' === $key )
						|| ( $social_in_image && 'social' === $key )
						|| ( $caption_in_image && in_array( $key, array( 'name', 'role' ), true ) )
						|| ( $side_column && in_array( $key, $side_keys, true ) )
					) {
						continue;
					}

					$this->render_element( $key, $member, $skills, $basic, $meta, $social, $image, $image_flyout );
				}
				?>

				<?php if ( ! empty( $read_more['show'] ) ) : ?>
					<div class="sp-smart-team-card__read-more">
						<a class="sp-smart-team-card__read-more-btn" href="<?php echo esc_url( ! empty( $member['link'] ) ? $member['link'] : '#' ); ?>">
							<span><?php echo esc_html( $read_more['label'] ); ?></span>
						</a>
					</div>
				<?php endif; ?>
			</div>

			<?php if ( $split_image && ! $image_first && in_array( 'image', (array) $ordered, true ) ) : ?>
				<?php $this->render_element( 'image', $member, $skills, $basic, $meta, $social, $image, $image_flyout ); ?>
			<?php endif; ?>
			<?php echo $preloader['html']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built in item_preloader(). ?>
		</div>
		<?php if ( '' !== $this->card_cell_class ) : ?>
		</div>
		<?php endif; ?>
		<?php
	}

	/**
	 * Render the meta icon before an additional-information value. Built-in
	 * fields use the fontello `sp-team-icon-{name}-{set}` glyphs (as the classic
	 * shortcode); language/gender have no glyph and render inline SVGs instead
	 * (twin of META_ICON_PATHS in MemberCard.jsx). Filterable per field.
	 *
	 * @param string $key       Field key (email/mobile/phone/location/website/experience/language/gender).
	 * @param bool   $show_icon Whether the "Display Meta Icon" toggle is on.
	 * @param string $icon_set  Icon set suffix (fill|bold-line|thin-line).
	 * @return void
	 */
	protected function render_meta_icon( $key, $show_icon, $icon_set = 'fill' ) {
		if ( ! $show_icon ) {
			return;
		}
		$bases     = array(
			'email'      => 'mail',
			'phone'      => 'telephone',
			'mobile'     => 'mobile',
			'location'   => 'location',
			'website'    => 'website',
			'experience' => 'experience',
		);
		$svg_paths = self::meta_icon_svg_paths();
		$sprite    = '';
		if ( ! empty( $bases[ $key ] ) ) {
			$icon_markup = '<i class="sp-team-icon-' . esc_attr( $bases[ $key ] . '-' . $icon_set ) . '"></i>';
		} elseif ( ! empty( $svg_paths[ $key ] ) ) {

			$set         = isset( $svg_paths[ $key ][ $icon_set ] ) ? $icon_set : 'fill';
			$sprite      = $this->meta_icon_sprite( $set );
			$icon_markup = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><use href="#sptp-meta-icon-' . esc_attr( $key . '-' . $set ) . '"></use></svg>';
		} else {
			return;
		}
		$icon    = apply_filters(
			'sp_team_pro_member_' . $key . '_icon',
			$icon_markup,
			$icon_set
		);
		$allowed = array(
			'i'    => array( 'class' => array() ),
			'svg'  => array(
				'viewbox'     => array(),
				'fill'        => array(),
				'aria-hidden' => array(),
				'xmlns'       => array(),
				'width'       => array(),
				'height'      => array(),
			),
			'use'  => array( 'href' => array() ),
			'path' => array(
				'd'    => array(),
				'fill' => array(),
			),
		);
		echo '<span class="sp-smart-team-card__meta-icon">' . $sprite . wp_kses( $icon, $allowed ) . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $sprite is static markup built with esc_attr in meta_icon_sprite().
	}

	/**
	 * Hidden <symbol> sprite for the SVG meta icons, emitted once per request
	 * per icon set (twin of MetaIconSprite in MemberCard.jsx). Riding with the
	 * cards keeps ajax-rendered pages self-sufficient; duplicate ids from
	 * append-mode are harmless (<use> resolves to the first, identical, match).
	 *
	 * @param string $set Icon set suffix (fill|bold-line|thin-line).
	 * @return string
	 */
	protected function meta_icon_sprite( $set ) {
		static $printed_sets = array();
		if ( isset( $printed_sets[ $set ] ) ) {
			return '';
		}
		$printed_sets[ $set ] = true;

		$symbols = '';
		foreach ( self::meta_icon_svg_paths() as $key => $sets ) {
			$path     = $sets[ $set ] ?? $sets['fill'];
			$symbols .= '<symbol id="sptp-meta-icon-' . esc_attr( $key . '-' . $set ) . '" viewBox="0 0 24 24"><path d="' . esc_attr( $path ) . '"></path></symbol>';
		}
		return '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">' . $symbols . '</svg>';
	}

	/**
	 * A `tel:` / `fax:` href for a phone number — what makes the Mobile and
	 * Phone rows tappable, like the classic shortcode templates
	 * (`templates/member/mobile.php` wraps the number in `tel:`).
	 *
	 * WHITESPACE is stripped from the HREF only; the row still DISPLAYS the
	 * number exactly as the author typed it. Dialers ignore visual separators
	 * (`-`, `.`, `()` are legal in a tel URI per RFC 3966) so those are kept —
	 * stripping to digits would break vanity numbers and extensions — but a
	 * space is not valid in an href and would be percent-encoded.
	 *
	 * Public + static because the card (this class) and the standalone
	 * Additional Information / Custom Information field blocks (which extend
	 * AbstractBlock) all need it — the same sharing as meta_icon_svg_paths().
	 *
	 * NOTE: unlike the classic templates this is NOT gated on the legacy
	 * Settings → Link Settings → Telephone checkbox. The block family already
	 * links email and website unconditionally, so gating phones alone would be
	 * inconsistent; both `tel` and `fax` are in `wp_allowed_protocols()`.
	 *
	 * @param string $value  Phone number as entered.
	 * @param string $scheme `tel` (default) or `fax`.
	 * @return string Escaped href, '' when the value can't make one.
	 */
	public static function tel_href( $value, $scheme = 'tel' ) {
		$number = preg_replace( '/\s+/', '', (string) $value );
		$scheme = 'fax' === $scheme ? 'fax' : 'tel';

		if ( '' === $number ) {
			return '';
		}

		return esc_url( $scheme . ':' . $number, array( $scheme ) );
	}

	/**
	 * SVG path data for the glyph-less meta icons, keyed by field then icon
	 * set. Twin of META_ICON_PATHS in MemberCard.jsx — keep both in lock-step.
	 * Public so the standalone Additional Information field block (which extends
	 * AbstractBlock, not this class) reuses the geometry instead of copying it.
	 *
	 * @return array<string, array<string, string>>
	 */
	public static function meta_icon_svg_paths() {
		return array(
			'language' => array(
				'fill'      => 'M7.11 2.2C7.8 2.2 8.34 2.73 8.34 3.42V4.65H13.23C13.92 4.65 14.45 5.18 14.45 5.87C14.45 6.56 13.92 7.09 13.23 7.09H12.85L12.54 7.97C11.93 9.69 10.97 11.29 9.79 12.63C10.32 12.98 10.9 13.28 11.47 13.55L13.42 14.39L15.79 9.04C15.98 8.58 16.4 8.31 16.9 8.31C17.39 8.31 17.81 8.58 18.01 9.04L22.9 20.05C23.16 20.66 22.9 21.38 22.29 21.65C21.67 21.92 20.95 21.65 20.68 21.04L19.92 19.32H13.88L13.11 21.04C12.85 21.65 12.12 21.92 11.51 21.65C10.9 21.38 10.63 20.66 10.9 20.05L12.43 16.64L10.48 15.77C9.6 15.38 8.76 14.93 7.99 14.39C7.15 15.04 6.27 15.61 5.32 16.07L3.98 16.76C3.41 17.07 2.64 16.8 2.34 16.19C2.07 15.61 2.3 14.85 2.91 14.54L4.21 13.89C4.86 13.59 5.43 13.21 6.01 12.82C5.47 12.33 4.97 11.79 4.52 11.26L4.13 10.8C3.67 10.26 3.75 9.5 4.29 9.08C4.78 8.62 5.59 8.7 6.01 9.23L6.39 9.69C6.85 10.22 7.31 10.72 7.8 11.18C8.87 10 9.71 8.66 10.25 7.13V7.09H2.22C1.53 7.09 1 6.56 1 5.87C1 5.18 1.53 4.65 2.22 4.65H5.89V3.42C5.89 2.73 6.43 2.2 7.11 2.2ZM16.9 12.56L14.99 16.87H18.81L16.9 12.56Z',
				'bold-line' => 'M7.42 2.2C7.91 2.2 8.33 2.62 8.33 3.12V5.26H13.53C14.03 5.26 14.45 5.68 14.45 6.17C14.45 6.67 14.03 7.09 13.53 7.09H12.92L12.27 8.54C11.58 10.22 10.55 11.71 9.29 12.97C9.82 13.35 10.4 13.66 10.97 13.93L13.3 15L16.05 8.85C16.2 8.54 16.55 8.31 16.89 8.31C17.27 8.31 17.58 8.54 17.73 8.85L22.93 20.46C23.12 20.92 22.93 21.49 22.47 21.68C22.01 21.87 21.47 21.68 21.25 21.22L20.14 18.7H13.64L12.54 21.22C12.35 21.68 11.77 21.87 11.31 21.68C10.86 21.49 10.66 20.92 10.86 20.46L12.57 16.68L10.24 15.57C9.4 15.23 8.64 14.77 7.91 14.23C7.23 14.77 6.5 15.23 5.74 15.61L3.56 16.75C3.1 17.02 2.57 16.83 2.34 16.37C2.11 15.95 2.26 15.38 2.72 15.15L4.9 14C5.43 13.74 5.93 13.39 6.42 13.05C5.39 12.05 4.48 10.95 3.75 9.69C3.52 9.27 3.64 8.69 4.09 8.43C4.51 8.2 5.09 8.35 5.35 8.77C6 9.92 6.84 10.99 7.84 11.86C9.02 10.72 9.94 9.34 10.59 7.81L10.93 7.09H1.92C1.42 7.09 1 6.67 1 6.17C1 5.68 1.42 5.26 1.92 5.26H6.5V3.12C6.5 2.62 6.92 2.2 7.42 2.2ZM19.3 16.87L16.89 11.48L14.48 16.87H19.3Z',
				'thin-line' => 'M6.5 2.2C6.84 2.2 7.11 2.47 7.11 2.81V5.86H13.83C14.17 5.86 14.44 6.13 14.44 6.48C14.44 6.82 14.17 7.09 13.83 7.09H13.03L12.42 8.5C11.58 10.45 10.32 12.17 8.71 13.54C9.25 13.92 9.82 14.23 10.39 14.53H10.43L13.1 15.83L16.31 8.69C16.43 8.46 16.66 8.31 16.89 8.31C17.11 8.31 17.34 8.46 17.46 8.69L22.96 20.91C23.07 21.22 22.96 21.56 22.65 21.71C22.35 21.83 21.96 21.71 21.81 21.41L20.32 18.08H13.45L11.96 21.41C11.81 21.71 11.42 21.83 11.12 21.71C10.81 21.56 10.7 21.22 10.81 20.91L12.61 16.94L9.86 15.64C9.13 15.26 8.41 14.84 7.72 14.34C7.03 14.84 6.31 15.26 5.54 15.64L3.1 16.79C2.79 16.94 2.41 16.82 2.3 16.52C2.15 16.21 2.26 15.83 2.57 15.72L5.05 14.53C5.62 14.23 6.19 13.92 6.73 13.54C5.51 12.51 4.47 11.25 3.71 9.84C3.52 9.53 3.63 9.15 3.94 9C4.21 8.84 4.59 8.92 4.74 9.23C5.51 10.6 6.54 11.78 7.72 12.78C9.25 11.52 10.51 9.87 11.31 8L11.69 7.09H1.61C1.27 7.09 1 6.82 1 6.48C1 6.13 1.27 5.86 1.61 5.86H5.89V2.81C5.89 2.47 6.15 2.2 6.5 2.2ZM19.79 16.86L16.89 10.41L13.98 16.86H19.79Z',
			),
			'gender'   => array(
				'fill'      => 'M12 11.48C9.12 11.48 6.76 9.12 6.76 6.24C6.76 3.36 9.12 1 12 1C14.88 1 17.24 3.36 17.24 6.24C17.24 9.12 14.88 11.48 12 11.48ZM10.69 13.92H13.31C17.59 13.92 21.08 17.41 21.08 21.69C21.08 22.43 20.51 23 19.77 23H4.23C3.49 23 2.92 22.43 2.92 21.69C2.92 17.41 6.41 13.92 10.69 13.92Z',
				'bold-line' => 'M8.56 6.5C8.56 8.39 10.11 9.94 12 9.94C13.89 9.94 15.44 8.39 15.44 6.5C15.44 4.61 13.89 3.06 12 3.06C10.11 3.06 8.56 4.61 8.56 6.5ZM17.5 6.5C17.5 9.55 15.05 12 12 12C8.95 12 6.5 9.55 6.5 6.5C6.5 3.45 8.95 1 12 1C15.05 1 17.5 3.45 17.5 6.5ZM4.44 21.63V21.97C4.44 22.53 3.96 23 3.41 23C2.85 23 2.38 22.53 2.38 21.97V21.63C2.38 17.46 5.77 14.06 9.94 14.06H14.06C18.23 14.06 21.63 17.46 21.63 21.63V21.97C21.63 22.53 21.15 23 20.59 23C20.04 23 19.56 22.53 19.56 21.97V21.63C19.56 18.57 17.11 16.13 14.06 16.13H9.94C6.89 16.13 4.44 18.57 4.44 21.63Z',
				'thin-line' => 'M7.88 6.5C7.88 8.78 9.72 10.63 12 10.63C14.28 10.63 16.13 8.78 16.13 6.5C16.13 4.22 14.28 2.38 12 2.38C9.72 2.38 7.88 4.22 7.88 6.5ZM17.5 6.5C17.5 9.55 15.05 12 12 12C8.95 12 6.5 9.55 6.5 6.5C6.5 3.45 8.95 1 12 1C15.05 1 17.5 3.45 17.5 6.5ZM3.75 21.63V22.31C3.75 22.7 3.45 23 3.06 23C2.68 23 2.38 22.7 2.38 22.31V21.63C2.38 17.46 5.77 14.06 9.94 14.06H14.06C18.23 14.06 21.63 17.46 21.63 21.63V22.31C21.63 22.7 21.32 23 20.94 23C20.55 23 20.25 22.7 20.25 22.31V21.63C20.25 18.23 17.5 15.44 14.06 15.44H9.94C6.54 15.44 3.75 18.23 3.75 21.63Z',
			),
		);
	}

	/**
	 * Render a single skill: name, then track › fill › percentage (or a chip
	 * for the button display style). The markup is identical for every bar
	 * style — the styles differ purely in CSS (twin of SkillItem in MemberCard.jsx).
	 *
	 * @param array  $skill         Normalized skill `{ name, percentage }`.
	 * @param string $display_style 'progress' | 'button'.
	 * @param string $bar_style     'style-1' | 'style-2' | 'style-3' (CSS only).
	 * @return void
	 */
	protected function render_skill( $skill, $display_style, $bar_style ) {
		$width   = '' === $skill['percentage'] ? 0 : (float) $skill['percentage'];
		$has_pct = '' !== $skill['percentage'];
		$percent = $has_pct ? '<span class="sp-smart-team-card__skill-percentage">' . esc_html( $skill['percentage'] . '%' ) . '</span>' : '';

		if ( 'progress' !== $display_style ) {
			echo '<div class="sp-smart-team-card__skill sp-smart-team-card__skill--chip">'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo '<span class="sp-smart-team-card__skill-name">' . esc_html( $skill['name'] ) . '</span>';
			echo '</div>';
			return;
		}

		// The target width rides a CUSTOM PROPERTY, not `width` — style.scss reads
		// `width: var(--sptp-skill-width, 0)`, so the bar is full without any JS,
		// while the `--animate` gate below can hold it at 0 until the list scrolls
		// into view (an inline `width` would outrank that rule).
		printf(
			'<div class="sp-smart-team-card__skill"><div class="sp-smart-team-card__skill-name">%1$s</div><div class="sp-smart-team-card__skill-track" data-title="%2$s%%"><div class="sp-smart-team-card__skill-fill" style="--sptp-skill-width:%2$s%%">%3$s</div></div></div>',
			esc_html( $skill['name'] ),
			esc_attr( $width ),
			$percent // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		);
	}

	/**
	 * Render the member photo per the Member Image settings (resolution,
	 * aspect/hover modifier classes, retina srcset, lazy loading, special tag,
	 * hover-flip second image).
	 *
	 * @param array  $member Normalized member data.
	 * @param array  $image  Member Image settings.
	 * @param string $flyout Pre-rendered (escaped) social-flyout HTML to nest
	 *                       inside the avatar, or ''.
	 * @return void
	 */
	protected function render_image( $member, $image = array(), $flyout = '' ) {
		if ( empty( $member['avatar'] ) ) {
			return;
		}

		$thumbnails = ! empty( $member['thumbnails'] ) && is_array( $member['thumbnails'] ) ? $member['thumbnails'] : array();
		$resolution = ! empty( $image['resolution'] ) ? $image['resolution'] : 'full';
		$src        = $thumbnails[ $resolution ] ?? $member['avatar'];

		$srcset = '';
		if ( ! empty( $image['retina'] ) ) {
			$retina_map = array(
				'thumbnail'    => 'medium',
				'medium'       => 'large',
				'medium_large' => 'large',
				'large'        => 'full',
				'full'         => 'full',
			);
			$retina_key = $retina_map[ $resolution ] ?? 'full';
			$retina_src = $thumbnails[ $retina_key ] ?? '';
			if ( $retina_src ) {
				$srcset = $src . ' 1x, ' . $retina_src . ' 2x';
			}
		}

		$aspect       = ! empty( $image['aspect'] ) ? $image['aspect'] : 'original';
		$hover_effect = ! empty( $image['hover_effect'] ) ? $image['hover_effect'] : 'none';

		$avatar_classes = array( 'sp-smart-team-card__avatar' );
		if ( 'original' !== $aspect ) {
			$avatar_classes[] = 'sp-smart-team-card__avatar--ratio-' . $aspect;
		}
		if ( 'none' !== $hover_effect ) {
			$avatar_classes[] = 'sp-smart-team-card__avatar--effect-' . $hover_effect;
		}

		$alt = esc_attr( $member['alt'] );
		// Member Details → Make Clickable: Only Image / Image and Name. The
		// anchor wraps __image-wrap (a 100%×100% block, see __image-link in
		// style.scss) so the avatar geometry is unchanged and the on-photo
		// social flyout stays outside the link.
		$image_link = $this->details_links( 'image' );
		?>
		<div class="<?php echo esc_attr( implode( ' ', $avatar_classes ) ); ?>">
			<?php if ( $image_link ) : ?>
				<a class="sp-smart-team-card__image-link" <?php echo $this->details_link_attrs( $member ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in details_link_attrs(). ?>>
			<?php endif; ?>
			<div class="sp-smart-team-card__image-wrap">
				<img
					class="sp-smart-team-card__image"
					src="<?php echo esc_url( $src ); ?>"
					<?php
					if ( $srcset ) :
						?>
						srcset="<?php echo esc_attr( $srcset ); ?>"<?php endif; ?>
					alt="<?php echo $alt; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- esc_attr'd above. ?>"
					loading="eager"
				/>
			</div>
			<?php if ( $image_link ) : ?>
				</a>
			<?php endif; ?>
			<?php echo $flyout; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from render_element()/static markup, already escaped. ?>
		</div>
		<?php
	}

	/**
	 * Render one card element by key. Emits nothing when the member has no
	 * data for it, so empty rows never appear.
	 *
	 * @param string $key    Element key (image/name/role/bio/email/…/social).
	 * @param array  $member Normalized member data.
	 * @param array  $skills Skills settings.
	 * @param array  $basic  Basic Information settings.
	 * @param array  $meta   Additional Information settings.
	 * @param array  $social Social Profiles settings.
	 * @param array  $image  Member Image settings.
	 * @param string $flyout Pre-rendered social-flyout HTML for the image element, or ''.
	 * @return void
	 */
	protected function render_element( $key, $member, $skills, $basic = array(), $meta = array(), $social = array(), $image = array(), $flyout = '' ) {
		$show_meta_icon = ! empty( $meta['show_icon'] );
		$meta_icon_set  = isset( $meta['icon_set'] ) ? $meta['icon_set'] : 'fill';
		switch ( $key ) {
			case 'image':
				$this->render_image( $member, $image, $flyout );
				break;

			case 'name':
				if ( '' === $member['name'] ) {
					return;
				}
				$name_tag  = ! empty( $basic['name_tag'] ) ? $basic['name_tag'] : 'h3';
				$name_html = esc_html( $member['name'] );
				// Member Details → Make Clickable: Only Name / Image and Name.
				if ( $this->details_links( 'name' ) ) {
					$name_html = '<a class="sp-smart-team-card__name-link" ' . $this->details_link_attrs( $member ) . '>' . $name_html . '</a>';
				}
				printf(
					'<%1$s class="sp-smart-team-card__name">%2$s</%1$s>',
					tag_escape( $name_tag ),
					$name_html // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
				);
				break;

			case 'role':
				if ( '' === $member['role'] ) {
					return;
				}
				?>
				<div class="sp-smart-team-card__role"><?php echo esc_html( $member['role'] ); ?></div>
				<?php
				break;

			case 'bio':
				$bio_text = 'full' === $basic['bio_source'] ? $member['description'] : $member['bio'];
				if ( '' === $bio_text ) {
					return;
				}
				?>
				<div class="sp-smart-team-card__bio"><?php echo esc_html( trim( $bio_text ) ); ?></div>
				<?php
				break;

			case 'email':
				if ( '' === $member['email'] ) {
					return;
				}
				?>
				<div class="sp-smart-team-card__detail sp-smart-team-card__detail--email">
					<?php $this->render_meta_icon( 'email', $show_meta_icon, $meta_icon_set ); ?>
					<span class="sp-smart-team-card__detail-text"><a href="<?php echo esc_attr( 'mailto:' . sanitize_email( $member['email'] ) ); ?>"><?php echo esc_html( $member['email'] ); ?></a></span>
				</div>
				<?php
				break;

			case 'website':
				if ( '' === $member['website'] ) {
					return;
				}
				?>
				<div class="sp-smart-team-card__detail sp-smart-team-card__detail--website">
					<?php $this->render_meta_icon( 'website', $show_meta_icon, $meta_icon_set ); ?>
					<span class="sp-smart-team-card__detail-text"><a href="<?php echo esc_url( $member['website'] ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $member['website'] ); ?></a></span>
				</div>
				<?php
				break;

			case 'mobile':
			case 'phone':
				if ( '' === $member[ $key ] ) {
					return;
				}
				// Tappable, like the classic templates — see tel_href().
				$tel = self::tel_href( $member[ $key ] );
				?>
				<div class="sp-smart-team-card__detail sp-smart-team-card__detail--<?php echo esc_attr( $key ); ?>">
					<?php $this->render_meta_icon( $key, $show_meta_icon, $meta_icon_set ); ?>
					<span class="sp-smart-team-card__detail-text">
						<?php if ( '' !== $tel ) : ?>
							<a href="<?php echo esc_attr( $tel ); ?>"><?php echo esc_html( $member[ $key ] ); ?></a>
						<?php else : ?>
							<?php echo esc_html( $member[ $key ] ); ?>
						<?php endif; ?>
					</span>
				</div>
				<?php
				break;

			case 'location':
			case 'experience':
			case 'language':
			case 'gender':
				if ( '' === $member[ $key ] ) {
					return;
				}
				?>
				<div class="sp-smart-team-card__detail sp-smart-team-card__detail--<?php echo esc_attr( $key ); ?>">
					<?php $this->render_meta_icon( $key, $show_meta_icon, $meta_icon_set ); ?>
					<span class="sp-smart-team-card__detail-text"><?php echo esc_html( $member[ $key ] ); ?></span>
				</div>
				<?php
				break;

			case 'skills':
				if ( empty( $member['skills'] ) ) {
					return;
				}
				$display_style = ! empty( $skills['display_style'] ) ? $skills['display_style'] : 'progress';
				$bar_style     = ! empty( $skills['bar_style'] ) ? $skills['bar_style'] : 'style-1';
				$percent_vis   = ! empty( $skills['percent_visibility'] ) ? $skills['percent_visibility'] : 'always';
				$skills_class  = array(
					'sp-smart-team-card__skills',
					'sp-smart-team-card__skills--' . $display_style,
					'sp-smart-team-card__skills--percent-' . $percent_vis,
				);
				// The bar-style variant only applies to progress bars.
				if ( 'progress' === $display_style ) {
					$skills_class[] = 'sp-smart-team-card__skills--' . $bar_style;
				}
				// Progress bars animate 0 → target when the list scrolls into view
				// (classic parity: the legacy shortcode's CSS starts the bar at 0 and
				// jQuery animates it to `data-title`). The gate class is stamped ONLY
				// here, next to the enqueue of the runtime that reveals it, so a page
				// without the script never renders bars stuck at 0 — and the editor
				// preview (MemberCard.jsx), which has no runtime, shows them full.
				if ( 'progress' === $display_style ) {
					$skills_class[] = 'sp-smart-team-card__skills--animate';
					wp_enqueue_script( 'sptp-blocks-frontend' );
				}
				$skills_class = implode( ' ', $skills_class );
				?>
				<div class="<?php echo esc_attr( $skills_class ); ?>">
					<?php
					foreach ( $member['skills'] as $skill ) {
						$this->render_skill( $skill, $display_style, $bar_style );
					}
					?>
				</div>
				<?php
				break;

			case 'custom':
				if ( empty( $member['custom'] ) ) {
					return;
				}
				?>
				<ul class="sp-smart-team-card__custom">
					<?php foreach ( $member['custom'] as $field ) : ?>
						<li class="sp-smart-team-card__custom-item sp-smart-team-card__detail">
							<?php if ( $show_meta_icon && '' !== $field['icon'] ) : ?>
								<span class="sp-smart-team-card__meta-icon"><i class="<?php echo esc_attr( $field['icon'] ); ?>"></i></span>
							<?php endif; ?>
							<span class="sp-smart-team-card__detail-text"><?php echo esc_html( $field['value'] ); ?></span>
						</li>
					<?php endforeach; ?>
				</ul>
				<?php
				break;

			case 'social':
				if ( empty( $member['socials'] ) ) {
					return;
				}
				$social_style = ! empty( $social['icon_style'] ) ? $social['icon_style'] : 'style-1';
				?>
				<ul class="sp-smart-team-card__social sp-smart-team-card__social--<?php echo esc_attr( $social_style ); ?>">
					<?php foreach ( $member['socials'] as $social_item ) : ?>
						<li>
							<a
								class="sptp-<?php echo esc_attr( $social_item['group'] ); ?>"
								href="<?php echo esc_url( $social_item['link'] ); ?>"
								title="<?php echo esc_attr( ucfirst( str_replace( 'icon-', '', $social_item['group'] ) ) ); ?>"
								target="_blank"
								rel="noopener noreferrer"
							>
								<i class="<?php echo esc_attr( $social_item['icon'] ); ?>"></i>
							</a>
						</li>
					<?php endforeach; ?>
				</ul>
				<?php
				break;
		}
	}

	/**
	 * Whether the Preloader feature module is currently enabled.
	 *
	 * @return bool
	 */
	protected function is_preloader_enabled() {
		return DashboardHelper::is_module_enabled( 'preloader' );
	}

	/**
	 * Per-item preloader, WP Carousel style: every member card carries its
	 * own spinner and is revealed once the minimum loading time has passed.
	 * Pure CSS (the reveal is an animation delayed by the setting), so it also
	 * covers ajax-appended cards and needs no script or noscript fallback.
	 *
	 * @return array{class:string, style:string, html:string} Empty strings when the module is off.
	 */
	protected function item_preloader() {
		if ( ! $this->is_preloader_enabled() ) {
			return array(
				'class' => '',
				'style' => '',
				'html'  => '',
			);
		}

		$settings = DashboardHelper::get_preloader_settings();
		$icon_url = SPT_BLOCKS_URL . 'assets/images/preloader/spinner-' . $settings['spinnerStyle'] . '.svg';

		return array(
			'class' => 'sp-smart-team-card--preloading',
			'style' => '--sptp-preloader-delay:' . (int) $settings['minLoadingTime'] . 'ms',
			'html'  => '<span class="sp-smart-team-card__loader" aria-hidden="true"><span class="sp-smart-team-card__spinner" style="--sptp-spinner-icon:url(\'' . esc_url( $icon_url ) . '\')"></span></span>',
		);
	}
}
