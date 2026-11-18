<?php
/**
 * Member query + data shaping for Smart Team Pro blocks.
 *
 * Builds a WP_Query for the `sptp_member` post type, maps block attributes (or
 * REST params) to query args, and normalizes a member post into a flat data
 * array the editor (REST) and the frontend (render_block) both consume.
 *
 * Member fields live in the serialized `_sptp_add_member` post meta
 * (sptp_member_social, sptp_email, sptp_website, …). Groups are the
 * `sptp_group` taxonomy; the job position (designation) and location moved to
 * the `sptp_designation` / `sptp_location` taxonomies in 3.2.6 (the old
 * sptp_job_title / sptp_location meta only remains as a pre-migration
 * fallback — see Admin/updates/update-3.2.6.php). Language and gender are
 * the `sptp_language` / `sptp_gender` taxonomies (never meta).
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Class MemberQuery.
 */
class MemberQuery {

	const POST_TYPE = 'sptp_member';
	const TAXONOMY  = 'sptp_group';
	const META_KEY  = '_sptp_add_member';

	/**
	 * Show Member range (the Query Builder slider, same as Pro: 1–200). A stored
	 * value outside it — hand-edited markup, `-1` for "all" — would turn a
	 * block render into an unbounded query.
	 */
	const MIN_PER_PAGE     = 1;
	const MAX_PER_PAGE     = 200;
	const DEFAULT_PER_PAGE = 6;

	/**
	 * Sort Order options (the Query Builder select, same as Pro). Random order
	 * is its own switch (`enableRandomOrder`), never an `orderBy` value.
	 */
	const ORDERBY_OPTIONS = array( 'date', 'title', 'modified', 'menu_order' );
	const ORDER_OPTIONS   = array( 'asc', 'desc' );

	/**
	 * Query members. Accepts block-attribute-shaped or REST-shaped args.
	 *
	 * @param array $args Query arguments.
	 * @return \WP_Query
	 */
	public static function query( $args = array() ) {
		$defaults = array(
			'per_page'      => 6,
			'page'          => 1,
			'orderby'       => 'date',
			'order'         => 'desc',
			'offset'        => 0,
			'groups'        => array(),
			'include'       => array(),
			'exclude'       => array(),
			'enable_random' => false,
			'post_type'     => self::POST_TYPE,
			'post_status'   => 'publish',
			// Whether $query->found_posts / max_num_pages are needed. Defaults to
			// true (the pre-existing behavior); a caller that never reads the
			// total passes false and saves the extra COUNT query.
			'count_total'   => true,
		);

		$args = wp_parse_args( $args, $defaults );

		// Accept comma-separated strings from the REST layer.
		foreach ( array( 'groups', 'include', 'exclude' ) as $list_key ) {
			if ( ! empty( $args[ $list_key ] ) && is_string( $args[ $list_key ] ) ) {
				$args[ $list_key ] = array_map( 'intval', explode( ',', $args[ $list_key ] ) );
			}
		}

		$query_args = array(
			'post_type'      => $args['post_type'],
			'posts_per_page' => intval( $args['per_page'] ),
			'post_status'    => $args['post_status'],
			'paged'          => intval( $args['page'] ),
			'orderby'        => $args['orderby'],
			'order'          => $args['order'],
			'offset'         => intval( $args['offset'] ),
		);

		if ( empty( $args['count_total'] ) ) {
			$query_args['no_found_rows'] = true;
		}

		if ( ! empty( $args['enable_random'] ) ) {
			$query_args['orderby'] = 'rand';
		}

		// Filter by group (sptp_group taxonomy, term ids).
		if ( ! empty( $args['groups'] ) && is_array( $args['groups'] ) ) {
			$query_args['tax_query'] = array(
				array(
					'taxonomy' => self::TAXONOMY,
					'field'    => 'term_id',
					'terms'    => array_filter( array_map( 'intval', $args['groups'] ) ),
				),
			);
		}

		// Include / exclude specific members.
		if ( ! empty( $args['include'] ) && is_array( $args['include'] ) ) {
			$query_args['post__in']       = array_filter( array_map( 'intval', $args['include'] ) );
			$query_args['posts_per_page'] = count( $query_args['post__in'] );
			$query_args['orderby']        = 'post__in';
		}
		if ( ! empty( $args['exclude'] ) && is_array( $args['exclude'] ) ) {
			$query_args['post__not_in'] = array_filter( array_map( 'intval', $args['exclude'] ) );
		}

		return new \WP_Query( $query_args );
	}

	/**
	 * Size of the block's result set before paging: Show Member (`per_page` as
	 * built from the `limit` attribute), or the selection size for Specific
	 * members, which has always ignored the limit.
	 *
	 * @param array $args Args from build_args_from_attributes().
	 * @return int
	 */
	public static function result_cap( $args ) {
		if ( ! empty( $args['include'] ) && is_array( $args['include'] ) ) {
			return count( array_filter( array_map( 'intval', $args['include'] ) ) );
		}
		return max( 1, intval( $args['per_page'] ?? 6 ) );
	}

	/**
	 * Narrow block query args to one Ajax Pagination page. Show Member caps the
	 * result set and `$per_page` slices it, so page N is offset (N-1)·per_page
	 * and the last page stops at the cap. A page past the cap comes back with
	 * `per_page` 0 — the caller must render nothing for it.
	 *
	 * @param array $args     Args from build_args_from_attributes().
	 * @param int   $page     1-based page.
	 * @param int   $per_page Members per page.
	 * @return array
	 */
	public static function page_args( $args, $page, $per_page ) {
		$cap      = self::result_cap( $args );
		$per_page = max( 1, intval( $per_page ) );
		$offset   = ( max( 1, intval( $page ) ) - 1 ) * $per_page;

		$args['per_page']     = max( 0, min( $per_page, $cap - $offset ) );
		$args['offset']       = $offset;
		$args['paged_window'] = true;
		return $args;
	}

	/**
	 * Members the block can page through — found_posts clipped to the cap, so
	 * the page count never counts members Show Member excludes.
	 *
	 * @param \WP_Query $query Query run with count_total.
	 * @param int       $cap   result_cap() of the unpaged args.
	 * @return int
	 */
	public static function capped_total( $query, $cap ) {
		return min( intval( $query->found_posts ), intval( $cap ) );
	}

	/**
	 * Bound a stored Show Member value to the slider's range.
	 *
	 * Below the range (0, `-1`) falls back to the default rather than the
	 * minimum, so a broken value still shows a usable block. Read-only: the
	 * stored attribute is never rewritten.
	 *
	 * @param mixed $limit Stored `limit` attribute.
	 * @return int
	 */
	private static function clamp_limit( $limit ) {
		$limit = intval( $limit );
		if ( $limit < self::MIN_PER_PAGE ) {
			return self::DEFAULT_PER_PAGE;
		}

		return min( self::MAX_PER_PAGE, $limit );
	}

	/**
	 * A sort value from the allow-list (case-insensitive), else the default.
	 *
	 * @param mixed  $value    Stored or requested value.
	 * @param array  $options  Allowed values, lower case.
	 * @param string $fallback Default.
	 * @return string
	 */
	private static function allowed( $value, $options, $fallback ) {
		$value = is_scalar( $value ) ? strtolower( (string) $value ) : '';

		return in_array( $value, $options, true ) ? $value : $fallback;
	}

	/**
	 * Map block attributes to query args.
	 *
	 * @param array $attributes Block attributes.
	 * @return array
	 */
	public static function build_args_from_attributes( $attributes ) {
		// Filter Members is always Latest in Free: Taxonomies/Specific are Pro
		// (Pro_Gate::FREE_FILTER_BY), so `filterBy`, `selectedGroups` and
		// `includesItems` are ignored on read and never rewritten.
		return array(
			'per_page'      => self::clamp_limit( $attributes['limit'] ?? self::DEFAULT_PER_PAGE ),
			'page'          => isset( $attributes['page'] ) ? intval( $attributes['page'] ) : 1,
			'orderby'       => self::allowed( $attributes['orderBy'] ?? '', self::ORDERBY_OPTIONS, 'date' ),
			'order'         => self::allowed( $attributes['order'] ?? '', self::ORDER_OPTIONS, 'desc' ),
			'groups'        => array(),
			'include'       => array(),
			'exclude'       => isset( $attributes['excludesItems'] ) && is_array( $attributes['excludesItems'] ) ? self::normalize_option_ids( $attributes['excludesItems'] ) : array(),
			'enable_random' => ! empty( $attributes['enableRandomOrder'] ),
		);
	}

	/**
	 * Map REST request params to query args.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array
	 */
	public static function build_args_from_request( $request ) {
		return array(
			// Clamped like the ajax path: the route returns contact fields, so one
			// request must never dump every member.
			'per_page'      => $request->get_param( 'per_page' ) ? min( 100, max( 1, intval( $request->get_param( 'per_page' ) ) ) ) : 6,
			'page'          => $request->get_param( 'page' ) ? intval( $request->get_param( 'page' ) ) : 1,
			'orderby'       => self::allowed( $request->get_param( 'orderby' ), self::ORDERBY_OPTIONS, 'date' ),
			'order'         => self::allowed( $request->get_param( 'order' ), self::ORDER_OPTIONS, 'desc' ),
			'groups'        => $request->get_param( 'groups' ) ? sanitize_text_field( $request->get_param( 'groups' ) ) : '',
			'include'       => $request->get_param( 'include' ) ? sanitize_text_field( $request->get_param( 'include' ) ) : '',
			'exclude'       => $request->get_param( 'exclude' ) ? sanitize_text_field( $request->get_param( 'exclude' ) ) : '',
			'enable_random' => (bool) $request->get_param( 'random' ),
		);
	}

	/**
	 * Normalize a MultipleSelect value (array of {value,id} objects or raw ids)
	 * into a flat array of integer ids.
	 *
	 * @param mixed $items Option objects or ids.
	 * @return array<int, int>
	 */
	public static function normalize_option_ids( $items ) {
		if ( ! is_array( $items ) ) {
			return array();
		}
		$ids = array();
		foreach ( $items as $item ) {
			if ( is_array( $item ) ) {
				$ids[] = intval( $item['value'] ?? ( $item['id'] ?? 0 ) );
			} elseif ( is_object( $item ) ) {
				$ids[] = intval( $item->value ?? ( $item->id ?? 0 ) );
			} else {
				$ids[] = intval( $item );
			}
		}
		return array_values( array_filter( $ids ) );
	}


	// from here it is query for single member data-------------------------------------------------.

	/**
	 * Whether a post may be shown as a member to the current visitor.
	 *
	 * A member block can name any member by ID (`memberId`, block context), so
	 * the ID alone must not reveal a draft, pending, private, scheduled or
	 * trashed member. Published members show to everyone; any other status only
	 * to a user who may read that post (its own preview, the Site Editor).
	 * Password-protected bodies are handled by description() / short_bio().
	 *
	 * @param \WP_Post|null $post Candidate post.
	 * @return bool
	 */
	public static function is_viewable_member( $post ) {
		if ( ! $post instanceof \WP_Post || 'sptp_member' !== $post->post_type ) {
			return false;
		}

		return is_post_publicly_viewable( $post ) || current_user_can( 'read_post', $post->ID );
	}

	/**
	 * The member's full description (post content) as plain text.
	 *
	 * Empty while the member's password is required, as core's the_content()
	 * does: this payload feeds the cards and the Member Description block,
	 * neither of which may print a protected body to a visitor who has not
	 * entered the password.
	 *
	 * @param \WP_Post $post Member post.
	 * @return string
	 */
	public static function description( $post ) {
		if ( post_password_required( $post ) ) {
			return '';
		}

		return wp_strip_all_tags( $post->post_content );
	}

	/**
	 * The member's Short Bio (`sptp_short_bio` meta) as plain text.
	 *
	 * Held back while the member's password is required, like description():
	 * the bio is part of the protected profile, and this payload also feeds the
	 * public `sptp_query_members` ajax response.
	 *
	 * @param \WP_Post $post Member post.
	 * @param array    $meta The member's `_sptp_add_member` meta.
	 * @return string
	 */
	public static function short_bio( $post, $meta ) {
		if ( post_password_required( $post ) || ! isset( $meta['sptp_short_bio'] ) ) {
			return '';
		}

		return wp_strip_all_tags( $meta['sptp_short_bio'] );
	}

	/**
	 * Normalize a single member post into a flat data array.
	 *
	 * @param \WP_Post|int $post Member post or id.
	 * @return array
	 */
	public static function get_member_data( $post ) {
		if ( is_numeric( $post ) ) {
			$post = get_post( $post );
		}
		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return array();
		}

		$post_id = $post->ID;
		$meta    = get_post_meta( $post_id, self::META_KEY, true );
		$meta    = is_array( $meta ) ? $meta : array();

		// The member photo is the post thumbnail when set, otherwise the first
		// attachment id in the `member_image_gallery` meta (comma-separated) —
		// matching the legacy frontend (Helper::member_images_attr_array()). The
		// gallery ids are also used for the "Image Flip" option: the second id
		// becomes the hover image.
		$gallery_ids = ! empty( $meta['member_image_gallery'] )
			? array_filter( array_map( 'absint', explode( ',', $meta['member_image_gallery'] ) ) )
			: array();
		$image_id    = get_post_thumbnail_id( $post_id );
		if ( ! $image_id && $gallery_ids ) {
			$image_id = reset( $gallery_ids );
		}

		// All registered sizes for the primary image, keyed by resolution, so the
		// renderer can honour the "Image Resolution" and "Load 2x for Retina"
		// options without another query. Mirrors testimonial-pro's `thumbnails`.
		$thumbnails = array();
		if ( $image_id ) {
			foreach ( array( 'thumbnail', 'medium', 'medium_large', 'large', 'full' ) as $size ) {
				$url = wp_get_attachment_image_url( $image_id, $size );
				if ( $url ) {
					$thumbnails[ $size ] = $url;
				}
			}
		}

		$avatar = $thumbnails['large'] ?? ( $thumbnails['full'] ?? '' );
		if ( '' === $avatar ) {
			// Same placeholder + filter as the classic shortcode (Helper.php), so a
			// photo-less card keeps its image slot and the row stays aligned.
			$avatar = (string) apply_filters( 'sptp_member_placeholder_image_src', SPT_PLUGIN_ROOT . 'src/Frontend/img/Placeholder-Image.png' );
		}
		$avatar_alt = $image_id ? get_post_meta( $image_id, '_wp_attachment_image_alt', true ) : '';

		// Designation (job position) and location are taxonomy terms since 3.2.6,
		// comma-joined like the legacy frontend (sptp_get_member_terms). The old
		// serialized meta keys back-fill members the DB updater hasn't migrated.
		$role     = sptp_get_member_terms( $post_id, 'sptp_designation' );
		$location = sptp_get_member_terms( $post_id, 'sptp_location' );

		// get_the_terms(), not wp_get_post_terms() — the latter bypasses the
		// object-term cache WP_Query primed and costs one query per member.
		$group_terms = get_the_terms( $post_id, self::TAXONOMY );
		$groups      = ( ! empty( $group_terms ) && ! is_wp_error( $group_terms ) )
			? wp_list_pluck( $group_terms, 'name' )
			: array();

		return array(
			'id'          => $post_id,
			'link'        => get_permalink( $post_id ),
			'name'        => get_the_title( $post ),
			'role'        => '' !== $role ? $role : ( $meta['sptp_job_title'] ?? '' ),
			// "Short Bio" is the dedicated sptp_short_bio meta field (HTML-supported);
			// "Description" is the post content. Both are stripped to plain text for
			// the card. Bio Source in the inspector picks between them.
			'bio'         => self::short_bio( $post, $meta ),
			'description' => self::description( $post ),
			'avatar'      => $avatar ? $avatar : '',
			'thumbnails'  => $thumbnails,
			'alt'         => $avatar_alt ? $avatar_alt : get_the_title( $post ),
			'email'       => isset( $meta['sptp_email'] ) ? $meta['sptp_email'] : '',
			'mobile'      => isset( $meta['sptp_mobile'] ) ? $meta['sptp_mobile'] : '',
			'phone'       => isset( $meta['sptp_phone'] ) ? $meta['sptp_phone'] : '',
			'location'    => '' !== $location ? $location : ( $meta['sptp_location'] ?? '' ),
			'language'    => sptp_get_member_terms( $post_id, 'sptp_language' ),
			'gender'      => sptp_get_member_terms( $post_id, 'sptp_gender' ),
			'website'     => isset( $meta['sptp_website'] ) ? $meta['sptp_website'] : '',
			'experience'  => isset( $meta['sptp_experience'] ) ? $meta['sptp_experience'] : '',
			// Custom Fields is a Pro module (always on here). Member Skills and
			// Member Social Profiles are Free's switches: emptied rather than
			// omitted when off, because this payload also feeds the cards, REST
			// /members and the details modal — none of which pass the field
			// block's `pre_render_block` gate.
			'skills'      => DashboardHelper::is_module_enabled( 'member_skills' )
				? self::normalize_skills( $meta['sptp_skills'] ?? array() )
				: array(),
			'custom'      => self::normalize_extra_fields( $meta['sptp_extra_fields'] ?? array() ),
			'socials'     => DashboardHelper::is_module_enabled( 'member_social' )
				? self::normalize_socials( $meta['sptp_member_social'] ?? array() )
				: array(),
			'groups'      => $groups,
		);
	}

	/**
	 * Normalize the `sptp_skills` repeater meta to `{ name, percentage }[]`.
	 *
	 * @param mixed $skills Raw repeater value.
	 * @return array
	 */
	private static function normalize_skills( $skills ) {
		if ( ! is_array( $skills ) ) {
			return array();
		}
		$out = array();
		foreach ( $skills as $skill ) {
			if ( ! is_array( $skill ) ) {
				continue;
			}
			$name = isset( $skill['sptp_skill_name'] ) ? $skill['sptp_skill_name'] : '';
			if ( '' === $name ) {
				continue;
			}
			$out[] = array(
				'name'       => $name,
				'percentage' => isset( $skill['sptp_skill_percentage'] ) ? $skill['sptp_skill_percentage'] : '',
			);
		}
		return $out;
	}

	/**
	 * Normalize the `sptp_extra_fields` repeater meta to `{ icon, type, value }[]`.
	 *
	 * @param mixed $fields Raw repeater value.
	 * @return array
	 */
	private static function normalize_extra_fields( $fields ) {
		if ( ! is_array( $fields ) ) {
			return array();
		}
		$out = array();
		foreach ( $fields as $field ) {
			if ( ! is_array( $field ) ) {
				continue;
			}
			$value = isset( $field['sptp_extra_fields_value'] ) ? $field['sptp_extra_fields_value'] : '';
			if ( '' === $value ) {
				continue;
			}
			$out[] = array(
				'icon'  => isset( $field['sptp_extra_fields_icon'] ) ? $field['sptp_extra_fields_icon'] : '',
				'type'  => isset( $field['sptp_extra_fields_type'] ) ? $field['sptp_extra_fields_type'] : '',
				'value' => $value,
			);
		}
		return $out;
	}

	/**
	 * Normalize the raw social-profiles meta into a clean list of
	 * { group, link, icon } entries.
	 *
	 * @param mixed $raw Raw `sptp_member_social` value.
	 * @return array<int, array{group:string,link:string,icon:string}>
	 */
	public static function normalize_socials( $raw ) {
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$socials = array();
		foreach ( $raw as $social ) {
			if ( empty( $social['social_group'] ) ) {
				continue;
			}
			$group     = sanitize_html_class( $social['social_group'] );
			$socials[] = array(
				'group' => $group,
				'link'  => isset( $social['social_link'] ) ? self::normalize_link( $social['social_link'] ) : '',
				'icon'  => self::icon_class( $group ),
			);
		}
		return $socials;
	}

	/**
	 * Resolve the icon class for a social group. Fontello groups (prefixed
	 * `icon-`) use the fontello font; everything else uses Font Awesome —
	 * matching the legacy member/social.php template.
	 *
	 * @param string $group Social group slug.
	 * @return string
	 */
	public static function icon_class( $group ) {
		// Twitter is X now; Font Awesome 4's `fa-twitter` is still the old bird.
		if ( 'twitter' === $group ) {
			$group = 'sp-team-icon-x-twitter';
		}
		if ( false !== strpos( $group, 'icon' ) ) {
			return 'icon-fontello ' . $group;
		}
		return 'fa fa-' . $group;
	}

	/**
	 * Normalize a social link into a safe, absolute URL (or mailto:).
	 *
	 * @param string $link Raw link.
	 * @return string
	 */
	private static function normalize_link( $link ) {
		$link = trim( (string) $link );
		if ( '' === $link ) {
			return '';
		}
		if ( preg_match( '#^https?://#i', $link ) ) {
			return $link;
		}
		if ( preg_match( '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $link ) ) {
			return 'mailto:' . $link;
		}
		return 'http://' . $link;
	}
}
