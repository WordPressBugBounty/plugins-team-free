<?php
/**
 * Registers the two taxonomies Free ships: Department and Designation.
 *
 * Same as Smart Team Pro. Department (`sptp_group`) has the Team-menu entry,
 * labelled "Taxonomies", and a column in the members list; Designation is reached
 * from the tab bar above the term screens. A member's position is a
 * `sptp_designation` term (Pro 3.2.6+), assigned from the taxonomy meta box. The old
 * Position/Job Title text field is gone; its stored value is copied into a term by
 * update-4.0.0.php and the meta is never removed (Rule 3).
 * Location, Language and Gender are Pro-only and not registered here.
 *
 * @package team-free
 * @subpackage team-free/src/Admin/Taxonomies
 */

namespace ShapedPlugin\WPTeam\Admin\Taxonomies;

use ShapedPlugin\WPTeam\Admin\Dashboard\WhiteLabel;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class Taxonomies
 */
class Taxonomies {

	const DESIGNATION = 'sptp_designation';

	const DEPARTMENT = 'sptp_group';

	/**
	 * Taxonomy definitions, laid out as in Pro: Department owns the one sidebar
	 * entry, Designation is reached from the tab bar above the term screens
	 * (`Admin_Notices::taxonomies_admin_menu()`). Designation has no list column
	 * of its own here: the members list already has a Position column.
	 *
	 * @var array
	 */
	private static $taxonomies = array(
		'sptp_group'       => array(
			'slug'          => 'group',
			'public_filter' => 'sp_wp_team_free_group_public',
			'show_in_menu'  => true,
			'admin_column'  => false,
		),
		'sptp_designation' => array(
			'slug'          => 'designation',
			'public_filter' => 'sp_wp_team_free_designation_public',
			'show_in_menu'  => false,
			'admin_column'  => false,
		),
	);

	/**
	 * Pro's taxonomies, registered as locked placeholders: the term screens open
	 * to a "Pro Feature" notice and nothing can be added, edited or assigned.
	 *
	 * @var string[]
	 */
	private static $placeholders = array( 'sptp_location', 'sptp_language', 'sptp_gender' );

	/**
	 * Screens that keep the Department sidebar entry highlighted.
	 *
	 * @var string[]
	 */
	private static $sub_taxonomies = array( 'sptp_designation', 'sptp_location', 'sptp_language', 'sptp_gender' );

	/**
	 * Translated placeholder names. Kept out of the static definitions because a
	 * property initialiser can't call __().
	 *
	 * @return array Taxonomy => array( singular, plural ).
	 */
	public static function placeholder_names() {
		return array(
			'sptp_location' => array( __( 'Location', 'team-free' ), __( 'Locations', 'team-free' ) ),
			'sptp_language' => array( __( 'Language', 'team-free' ), __( 'Languages', 'team-free' ) ),
			'sptp_gender'   => array( __( 'Gender', 'team-free' ), __( 'Genders', 'team-free' ) ),
		);
	}

	/**
	 * Translated default names. Kept out of the static definitions because a
	 * property initialiser can't call __().
	 *
	 * @return array Taxonomy => array( singular, plural ).
	 */
	private static function default_names() {
		return array(
			'sptp_group'       => array( __( 'Department', 'team-free' ), __( 'Departments', 'team-free' ) ),
			'sptp_designation' => array( __( 'Designation', 'team-free' ), __( 'Designations', 'team-free' ) ),
		);
	}

	/**
	 * Register all taxonomies.
	 *
	 * @return void
	 */
	public function register_taxonomies() {
		$labels  = WhiteLabel::labels();
		$renamed = array(
			// The module's labels already fall back to the defaults while it is off.
			'sptp_group'       => array( $labels['groupSingular'], $labels['groupPlural'] ),
			'sptp_designation' => array( $labels['designationSingular'], $labels['designationPlural'] ),
		);

		$names = self::default_names();

		foreach ( self::$taxonomies as $taxonomy => $config ) {
			$config['singular'] = $names[ $taxonomy ][0];
			$config['plural']   = $names[ $taxonomy ][1];

			if ( isset( $renamed[ $taxonomy ] ) ) {
				if ( '' !== $renamed[ $taxonomy ][0] ) {
					$config['singular'] = $renamed[ $taxonomy ][0];
				}
				if ( '' !== $renamed[ $taxonomy ][1] ) {
					$config['plural'] = $renamed[ $taxonomy ][1];
				}
			}

			$this->register( $taxonomy, $config );
		}
	}

	/**
	 * Register Pro's Location, Language and Gender as locked placeholders, so
	 * their term screens exist to carry the upgrade notice and their meta boxes
	 * show, dimmed, on Add New Member (`#sptp_locationdiv` and the others, locked
	 * by `Admin/css/style.css`). No list column, no REST, and every write
	 * capability denied: nothing can be added, edited or assigned, and any terms
	 * Pro stored stay untouched.
	 *
	 * @return void
	 */
	public function register_placeholders() {
		foreach ( self::placeholder_names() as $taxonomy => $names ) {
			if ( taxonomy_exists( $taxonomy ) ) {
				continue;
			}

			register_taxonomy(
				$taxonomy,
				'sptp_member',
				array(
					'hierarchical'      => true,
					'label'             => $names[1],
					'public'            => false,
					'show_ui'           => current_user_can( self::ui_capability() ),
					'show_in_menu'      => false,
					'show_in_rest'      => false,
					'show_admin_column' => false,
					'capabilities'      => array(
						'edit_terms'   => 'do_not_allow',
						'delete_terms' => 'do_not_allow',
						'assign_terms' => 'do_not_allow',
					),
				)
			);
		}
	}

	/**
	 * Mark each placeholder's meta box title "(Pro)". Done on the box, not the
	 * taxonomy label, because core reuses the label for the box's inner tab.
	 *
	 * @return void
	 */
	public function label_placeholder_boxes() {
		global $wp_meta_boxes;

		foreach ( self::placeholder_names() as $taxonomy => $names ) {
			foreach ( array( 'side', 'normal', 'advanced' ) as $context ) {
				foreach ( array( 'core', 'default', 'high', 'low' ) as $priority ) {
					if ( empty( $wp_meta_boxes['sptp_member'][ $context ][ $priority ][ $taxonomy . 'div' ] ) ) {
						continue;
					}

					/* translators: %s: Pro-only taxonomy name, e.g. Locations. */
					$wp_meta_boxes['sptp_member'][ $context ][ $priority ][ $taxonomy . 'div' ]['title'] = sprintf( __( '%s (Pro)', 'team-free' ), $names[1] );
				}
			}
		}
	}

	/**
	 * Swap a placeholder's term screen for the Pro notice (hooked on
	 * `load-edit-tags.php`, so it only ever runs on a term screen).
	 *
	 * @return void
	 */
	public function lock_placeholder_screen() {
		$taxonomy = isset( $_GET['taxonomy'] ) ? sanitize_key( wp_unslash( $_GET['taxonomy'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- reading the screen, not acting on it.

		if ( ! in_array( $taxonomy, self::$placeholders, true ) ) {
			return;
		}

		add_action( 'admin_enqueue_scripts', array( $this, 'hide_placeholder_screen' ) );
		add_action( 'admin_notices', array( $this, 'show_placeholder_notice' ) );
	}

	/**
	 * Hide the empty term screen under the notice.
	 *
	 * @return void
	 */
	public function hide_placeholder_screen() {
		wp_register_style( 'sptp-taxonomy-locked', false, array(), SPT_PLUGIN_VERSION );
		wp_enqueue_style( 'sptp-taxonomy-locked' );
		wp_add_inline_style( 'sptp-taxonomy-locked', '#wpbody-content .wrap { display: none; }' );
	}

	/**
	 * The "Pro Feature" notice that takes the place of the term screen.
	 *
	 * @return void
	 */
	public function show_placeholder_notice() {
		$taxonomy = isset( $_GET['taxonomy'] ) ? sanitize_key( wp_unslash( $_GET['taxonomy'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- reading the screen, not acting on it.
		$names    = self::placeholder_names();

		if ( ! isset( $names[ $taxonomy ] ) ) {
			return;
		}

		?>
		<div class="sptp-taxonomies-admin-content">
			<h2><?php esc_html_e( 'Pro Feature', 'team-free' ); ?></h2>
			<p>
				<?php
				printf(
					/* translators: 1: taxonomy name, 2: line break. */
					esc_html__( 'Unlock %1$s even more powerful and dynamic features by upgrading to the premium version. %2$sTake your workflow to the next level and get the most out of Team Pro!', 'team-free' ),
					'<b>' . esc_html( $names[ $taxonomy ][1] ) . '</b>',
					'<br>'
				);
				?>
			</p>
			<a class="button button-primary" href="<?php echo esc_url( 'https://getwpteam.com/pricing/?ref=1' ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Upgrade to Pro', 'team-free' ); ?></a>
		</div>
		<?php
	}

	/**
	 * Register one taxonomy with the shared args and label set.
	 *
	 * @param string $taxonomy Taxonomy name.
	 * @param array  $config   singular, plural, slug, public_filter, show_in_menu, admin_column.
	 * @return void
	 */
	private function register( $taxonomy, $config ) {
		$singular = $config['singular'];
		$plural   = $config['plural'];
		$lower    = strtolower( $singular );

		$labels = array(
			'name'                       => $plural,
			'singular_name'              => $singular,
			/* translators: %s: singular name. */
			'popular_items'              => sprintf( __( 'Popular %s', 'team-free' ), $singular ),
			/* translators: %s: plural name. */
			'all_items'                  => sprintf( __( 'All %s', 'team-free' ), $plural ),
			/* translators: %s: singular name. */
			'edit_item'                  => sprintf( __( 'Edit %s', 'team-free' ), $singular ),
			/* translators: %s: singular name. */
			'update_item'                => sprintf( __( 'Update %s', 'team-free' ), $singular ),
			/* translators: %s: singular name. */
			'add_new_item'               => sprintf( __( 'Add New %s', 'team-free' ), $singular ),
			/* translators: %s: lowercase singular name. */
			'new_item_name'              => sprintf( __( 'New %s', 'team-free' ), $lower ),
			/* translators: %s: lowercase singular name. */
			'choose_from_most_used'      => sprintf( __( 'Choose from the most selected %s', 'team-free' ), $lower ),
			/* translators: %s: lowercase singular name. */
			'not_found'                  => sprintf( __( 'No %s found', 'team-free' ), $lower ),
			/* translators: %s: singular name. */
			'parent_item'                => sprintf( __( 'Parent %s', 'team-free' ), $singular ),
			/* translators: %s: lowercase singular name. */
			'add_or_remove_items'        => sprintf( __( 'Add or remove %s', 'team-free' ), $lower ),
			/* translators: %s: lowercase singular name. */
			'view_item'                  => sprintf( __( 'View %s', 'team-free' ), $lower ),
			/* translators: %s: singular name. */
			'search_items'               => sprintf( __( 'Search %s', 'team-free' ), $singular ),
			'menu_name'                  => $plural,
			/* translators: %s: lowercase singular name. */
			'separate_items_with_commas' => sprintf( __( 'Separate %s with commas', 'team-free' ), $lower ),
		);

		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'public'            => apply_filters( $config['public_filter'], false ),
			'show_admin_column' => $config['admin_column'],
			'query_var'         => true,
			'rewrite'           => array( 'slug' => $config['slug'] ),
			'show_ui'           => current_user_can( self::ui_capability() ),
			'show_in_menu'      => $config['show_in_menu'],
			'show_in_rest'      => true,
			// Own capabilities: `show_ui` does not stop XML-RPC or REST (grant_term_capabilities()).
			'capabilities'      => self::term_capabilities(),
		);

		register_taxonomy( $taxonomy, 'sptp_member', $args );
	}

	/**
	 * Label the Departments sidebar entry "Taxonomies", as Pro does; the screen
	 * it opens is still the Departments list.
	 *
	 * @return void
	 */
	public function relabel_menu() {
		global $submenu;

		$parent = 'edit.php?post_type=sptp_member';

		if ( empty( $submenu[ $parent ] ) ) {
			return;
		}

		foreach ( $submenu[ $parent ] as $key => $item ) {
			// Matched on a substring: core builds this slug with an encoded ampersand.
			if ( isset( $item[2] ) && false !== strpos( $item[2], 'taxonomy=' . self::DEPARTMENT ) ) {
				$submenu[ $parent ][ $key ][0] = __( 'Taxonomies', 'team-free' ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- relabelling our own submenu entry.
			}
		}
	}

	/**
	 * Put the Taxonomies sidebar entry right before "Manage Teams" (the shortcode
	 * generator), as Pro does, whatever order core registered them in.
	 *
	 * @return void
	 */
	public function place_taxonomies_before_manage_team() {
		global $submenu;

		$parent = 'edit.php?post_type=sptp_member';

		if ( empty( $submenu[ $parent ] ) ) {
			return;
		}

		$items         = array_values( $submenu[ $parent ] );
		$manage_index  = null;
		$taxonomy_index = null;

		foreach ( $items as $index => $item ) {
			if ( ! isset( $item[2] ) ) {
				continue;
			}

			if ( 'edit.php?post_type=sptp_generator' === $item[2] ) {
				$manage_index = $index;
			} elseif ( null === $taxonomy_index && false !== strpos( $item[2], 'taxonomy=' . self::DEPARTMENT ) ) {
				$taxonomy_index = $index;
			}
		}

		if ( null === $manage_index || null === $taxonomy_index || $taxonomy_index < $manage_index ) {
			return;
		}

		$taxonomy_item = $items[ $taxonomy_index ];
		unset( $items[ $taxonomy_index ] );
		array_splice( $items, $manage_index, 0, array( $taxonomy_item ) );

		$submenu[ $parent ] = $items; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- reordering our own submenu entries.
	}

	/**
	 * Keep the Departments sidebar entry highlighted on the other taxonomy
	 * screens, which have no entry of their own.
	 *
	 * @return void
	 */
	public function highlight_department_submenu() {
		global $submenu;

		$parent = 'edit.php?post_type=sptp_member';

		if ( empty( $submenu[ $parent ] ) ) {
			return;
		}

		$taxonomy = isset( $_GET['taxonomy'] ) ? sanitize_key( wp_unslash( $_GET['taxonomy'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- reading the screen, not acting on it.

		if ( ! in_array( $taxonomy, self::$sub_taxonomies, true ) ) {
			return;
		}

		foreach ( $submenu[ $parent ] as $key => $item ) {
			if ( isset( $item[2] ) && false !== strpos( $item[2], 'taxonomy=' . self::DEPARTMENT ) ) {
				$submenu[ $parent ][ $key ][4] = isset( $item[4] ) ? $item[4] . ' current' : 'current'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- marking our own submenu entry.
			}
		}
	}

	/**
	 * A member's designation as text: the term names (comma-joined, like Pro),
	 * or the pre-4.0.0 `sptp_job_title` meta until the DB updater has copied it.
	 *
	 * @param int    $post_id       Member post ID.
	 * @param string $meta_fallback Legacy meta value.
	 * @return string
	 */
	public static function designation( $post_id, $meta_fallback = '' ) {
		$terms = get_the_terms( $post_id, self::DESIGNATION );

		if ( is_array( $terms ) && ! empty( $terms ) ) {
			return implode( ', ', wp_list_pluck( $terms, 'name' ) );
		}

		return (string) $meta_fallback;
	}

	/**
	 * Make `$name` the member's only designation term (creating it if needed);
	 * an empty name clears the member's designation.
	 *
	 * @param int    $post_id Member post ID.
	 * @param string $name    Designation name.
	 * @return void
	 */
	public static function set_term( $post_id, $name ) {
		if ( ! $post_id || ! taxonomy_exists( self::DESIGNATION ) ) {
			return;
		}

		if ( '' === $name ) {
			wp_set_object_terms( $post_id, array(), self::DESIGNATION );
			return;
		}

		$term = term_exists( $name, self::DESIGNATION );

		if ( ! $term ) {
			$term = wp_insert_term( $name, self::DESIGNATION );
		}

		if ( is_wp_error( $term ) ) {
			return;
		}

		$term_id = is_array( $term ) ? (int) $term['term_id'] : (int) $term;

		wp_set_object_terms( $post_id, array( $term_id ), self::DESIGNATION );
	}

	/**
	 * The term capabilities of Department and Designation, each under a
	 * dedicated name no role holds.
	 *
	 * Core's defaults (`manage_categories` to manage, `edit_posts` to assign)
	 * let an Editor create, rename and delete these terms over XML-RPC
	 * (`wp.newTerm`…) and the `wp/v2/sptp_group` / `wp/v2/sptp_designation`
	 * routes: `show_ui` only hides the screens. Reading terms is unaffected.
	 *
	 * @return array<string, string> Capability key => capability name.
	 */
	public static function term_capabilities() {
		return array(
			'manage_terms' => 'manage_sptp_member_terms',
			'edit_terms'   => 'edit_sptp_member_terms',
			'delete_terms' => 'delete_sptp_member_terms',
			'assign_terms' => 'assign_sptp_member_terms',
		);
	}

	/**
	 * Give the term capabilities to users who hold the UI permission, each one
	 * only where they hold the core capability it replaced — so this narrows
	 * access and never widens it. Nothing is written to the roles.
	 *
	 * Reads the already-resolved `$allcaps` — no current_user_can() here, which
	 * would re-enter this filter (hooked on `user_has_cap`).
	 *
	 * @param array $allcaps Capabilities the user holds.
	 * @return array
	 */
	public function grant_term_capabilities( $allcaps ) {
		if ( empty( $allcaps[ self::ui_capability() ] ) ) {
			return $allcaps;
		}

		foreach ( self::term_capabilities() as $key => $name ) {
			$core = 'assign_terms' === $key ? 'edit_posts' : 'manage_categories';

			if ( ! empty( $allcaps[ $core ] ) ) {
				$allcaps[ $name ] = true;
			}
		}

		return $allcaps;
	}

	/**
	 * Capability that shows the taxonomy screens.
	 *
	 * The plugin-wide `sp_wp_team_ui_permission` filter (Admin, Dashboard,
	 * Saved Templates…) applies here too; the older
	 * `sp_wp_team_free_ui_permission` (Pro uses the same name) still runs on
	 * top of it, so code filtering either name keeps working.
	 *
	 * @return string
	 */
	private static function ui_capability() {
		$capability = apply_filters( 'sp_wp_team_ui_permission', 'manage_options' );

		return apply_filters( 'sp_wp_team_free_ui_permission', $capability );
	}
}
