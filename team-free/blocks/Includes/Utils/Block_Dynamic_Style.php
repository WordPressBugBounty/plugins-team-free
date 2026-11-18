<?php
/**
 * Frontend dynamic-CSS orchestrator.
 *
 * On every front-end request it parses the current post's content AND — on
 * block themes — the resolved block template (with its template parts expanded),
 * walks every block recursively, and asks DynamicCssGenerator to produce CSS for
 * any block belonging to this plugin. The combined CSS is then attached to the
 * shared `sptp-blocks-style` handle so it lands in the page <head>.
 *
 * A slim port of Styble Pro's Block_Dynamic_Style — file caching and widget
 * support are intentionally omitted; add them here when the plugin needs them.
 * FSE block-template scanning IS supported (get_current_template_blocks()).
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Utils;

use ShapedPlugin\WPTeam\Admin\Dashboard\DashboardHelper;
use ShapedPlugin\WPTeam\Admin\Dashboard\SavedTemplates;
use ShapedPlugin\WPTeam\Blocks\Includes\MemberTemplate;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Block_Dynamic_Style
 */
class Block_Dynamic_Style {

	/**
	 * Block names this plugin owns (with namespace).
	 *
	 * @var array<int, string>
	 */
	public $our_blocks = array(
		'sptp/grid',
		'sptp/carousel-3d',
		'sptp/carousel',
		'sptp/ajax-pagination',
		// Ajax Member Search / Live Frontend Filter / Filter By * and the
		// member-data blocks (resume, video, photo gallery, additional/
		// custom information) are Pro stubs that render '' in Free — no dynamic
		// CSS for them.
		'sptp/member-bio',
		'sptp/member-description',
		'sptp/member-designation',
		'sptp/member-image',
		'sptp/member-modal-content',
		'sptp/member-name',
		'sptp/member-skills',
		'sptp/social-profile',
	);

	/**
	 * Google Font tokens (`Family:weight`) collected while walking the blocks.
	 *
	 * @var array<int, string>
	 */
	private $google_fonts = array();

	/**
	 * Additional CSS waiting for a late block stylesheet (see enqueue_late_custom_css()).
	 *
	 * @var string
	 */
	private $late_custom_css = '';

	/**
	 * Saved template ids whose blocks are already in this request's CSS, keyed by
	 * id. Guards both the shortcode fallback (no double emit) and self/circular
	 * template references (marked before recursing into a template's own blocks).
	 *
	 * @var array<int, bool>
	 */
	private $handled_saved_templates = array();

	/**
	 * The singleton instance.
	 *
	 * @var Block_Dynamic_Style|null
	 */
	private static $instance = null;

	/**
	 * Returns the singleton instance, creating and initializing it on first call.
	 *
	 * @return Block_Dynamic_Style
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
			self::$instance->init();
		}
		return self::$instance;
	}

	/**
	 * Hooks the dynamic-CSS and global-custom-code enqueue methods onto the frontend.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'wp_enqueue_scripts', array( $this, 'collect_blocks_and_generate_css' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_global_custom_code' ) );
	}

	/**
	 * Whether Settings → Performance → Google Fonts is on (the default).
	 *
	 * Turning it off stops the block layer requesting fonts.googleapis.com, for
	 * sites that must not send visitors' IP addresses to Google.
	 *
	 * @return bool
	 */
	public static function google_fonts_enabled() {
		$settings = get_option( '_sptp_settings' );

		return ! is_array( $settings ) || ! array_key_exists( 'enqueue_google_font', $settings ) || (bool) $settings['enqueue_google_font'];
	}

	/**
	 * Print the dashboard's global "Additional CSS & JS" settings.
	 *
	 * `Frontend.php::enqueue_styles()` only does this on pages tracked by the
	 * legacy `wp_team_page_id{$id}` option (i.e. pages using the old shortcode),
	 * so it never runs on pages built purely from Gutenberg blocks. This mirrors
	 * that same read, unconditionally, so the setting works for block-only pages
	 * too.
	 */
	public function enqueue_global_custom_code() {
		$settings   = get_option( '_sptp_settings' );
		$custom_css = isset( $settings['custom_css'] ) ? trim( wp_strip_all_tags( html_entity_decode( $settings['custom_css'] ) ) ) : '';
		// Decoded for output, then stripped again: a decoded `&lt;/script&gt;` would close the inline tag.
		$custom_js = isset( $settings['custom_js'] ) ? trim( DashboardHelper::sanitize_custom_code( html_entity_decode( $settings['custom_js'] ) ) ) : '';

		if ( '' !== $custom_css ) {
			if ( wp_style_is( 'sptp-blocks-style', 'enqueued' ) ) {
				// The page has team blocks: print after the block stylesheet, as before.
				wp_add_inline_style( 'sptp-blocks-style', $custom_css );
			} else {
				// No team block found up front. A src-less handle of its own, so the
				// 53 KB block stylesheet is not pulled onto every page of the site.
				wp_register_style( 'sptp-blocks-custom-css', false, array(), SPT_PLUGIN_VERSION );
				wp_enqueue_style( 'sptp-blocks-custom-css' );
				wp_add_inline_style( 'sptp-blocks-custom-css', $custom_css );

				$this->late_custom_css = $custom_css;
				add_action( 'wp_footer', array( $this, 'enqueue_late_custom_css' ), 1 );
			}
		}

		if ( '' !== $custom_js ) {
			if ( ! wp_script_is( 'sptp-blocks-custom-js', 'registered' ) ) {
				wp_register_script( 'sptp-blocks-custom-js', '', array(), SPT_PLUGIN_VERSION, true );
			}
			wp_enqueue_script( 'sptp-blocks-custom-js' );
			wp_add_inline_script( 'sptp-blocks-custom-js', $custom_js );
		}
	}

	/**
	 * Keep Additional CSS after a block stylesheet that a render enqueued late.
	 *
	 * A block the page scan cannot see (widget area, page-builder module) enqueues
	 * `sptp-blocks-style` while it renders, so the stylesheet prints in the footer,
	 * after the head copy of the custom CSS. Print the CSS once more after it, so it
	 * still wins on equal specificity.
	 *
	 * @return void
	 */
	public function enqueue_late_custom_css() {
		if ( '' === $this->late_custom_css || ! wp_style_is( 'sptp-blocks-style', 'enqueued' ) || wp_style_is( 'sptp-blocks-style', 'done' ) ) {
			return;
		}
		wp_register_style( 'sptp-blocks-custom-css-late', false, array( 'sptp-blocks-style' ), SPT_PLUGIN_VERSION );
		wp_enqueue_style( 'sptp-blocks-custom-css-late' );
		wp_add_inline_style( 'sptp-blocks-custom-css-late', $this->late_custom_css );
	}

	/**
	 * Inspect the current post, build CSS for every owned block, attach inline.
	 */
	public function collect_blocks_and_generate_css() {
		$blocks = array();

		// The queried post's own content (classic themes, singular views, and
		// blocks placed inside post content on any theme).
		global $post;
		if ( ! empty( $post ) && ! empty( $post->post_content ) ) {
			$blocks = array_merge( $blocks, parse_blocks( $post->post_content ) );
		}

		// Block themes render the page from a block template whose blocks are
		// NOT in $post->post_content — scan the resolved template (and its
		// template parts) too, else dynamic CSS for blocks placed in the Site
		// Editor never prints.
		$blocks = array_merge( $blocks, $this->get_current_template_blocks() );

		if ( empty( $blocks ) ) {
			return;
		}

		// `[sptp_saved_template id="N"]` renders another post's blocks into this
		// page, so a parse_blocks() of the page never sees them — pull them in.
		// (Member Details → Modal's ajax fetch is Pro-only; Free has no such path.)
		$blocks = array_merge( $blocks, $this->saved_template_blocks( $blocks ) );

		$css = $this->extract_css_from_blocks( $blocks );

		if ( ! empty( $this->google_fonts ) && self::google_fonts_enabled() ) {
			$fonts = array_unique( $this->google_fonts );
			// `display=swap` keeps the text visible while the font loads instead
			// of blocking the first paint on it (FOIT).
			wp_enqueue_style( 'sptp-google-fonts', 'https://fonts.googleapis.com/css?family=' . implode( '|', $fonts ) . '&display=swap', array(), SPT_PLUGIN_VERSION );
		}

		if ( empty( $css ) ) {
			return;
		}

		// `sptp-blocks-style` is registered by AssetManager once the build output exists.
		// Fall back to a synthetic handle so inline CSS still ships in dev.
		if ( ! wp_style_is( 'sptp-blocks-style', 'registered' ) ) {
			wp_register_style( 'sptp-blocks-style', false, array(), SPT_PLUGIN_VERSION );
		}

		// The handle is registered on `init` (editor + frontend), but the block
		// declares no frontend `style`, so WordPress never enqueues it on its own.
		// Enqueue it here — otherwise wp_add_inline_style() attaches to a dormant
		// handle and the dynamic CSS never prints.
		if ( ! wp_style_is( 'sptp-blocks-style', 'enqueued' ) ) {
			wp_enqueue_style( 'sptp-blocks-style' );
		}

		// Tags stripped as Template_Css does: nothing generated may close <style>.
		wp_add_inline_style( 'sptp-blocks-style', wp_strip_all_tags( $this->minify_css( $css ) ) );
	}

	/**
	 * Parsed blocks of every saved template the page renders through
	 * `[sptp_saved_template id="N"]`.
	 *
	 * @param array $blocks Parsed blocks of the page.
	 * @return array<int, array>
	 */
	private function saved_template_blocks( $blocks ) {
		$ids = array();
		$this->collect_saved_template_ids( $blocks, $ids );

		return $this->blocks_for_saved_templates( $ids );
	}

	/**
	 * Scan every block's raw HTML for the saved-template shortcode.
	 *
	 * The shortcode can sit anywhere: a core/shortcode block, a classic
	 * (freeform) block, or inline in a paragraph — all of which carry it in
	 * `innerHTML`.
	 *
	 * @param array $blocks Parsed blocks.
	 * @param array $ids    Collected ids, by reference.
	 * @return void
	 */
	private function collect_saved_template_ids( $blocks, &$ids ) {
		foreach ( $blocks as $block ) {
			if ( ! empty( $block['innerHTML'] ) ) {
				foreach ( SavedTemplates::template_ids_in_content( $block['innerHTML'] ) as $id ) {
					$ids[] = $id;
				}
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$this->collect_saved_template_ids( $block['innerBlocks'], $ids );
			}
		}
	}

	/**
	 * Parsed blocks of the given saved templates, plus those of any saved
	 * template they reference in turn.
	 *
	 * Ids are marked handled BEFORE recursing, so a template referencing itself
	 * (or a cycle between two) terminates instead of looping.
	 *
	 * @param array<int, int> $ids Saved template post ids.
	 * @return array<int, array>
	 */
	private function blocks_for_saved_templates( $ids ) {
		$out = array();

		foreach ( array_unique( $ids ) as $id ) {
			if ( isset( $this->handled_saved_templates[ $id ] ) ) {
				continue;
			}
			$this->handled_saved_templates[ $id ] = true;

			$post = get_post( $id );
			// Same gate as the shortcode: a draft/private template renders nothing, so it
			// must not leak its generated CSS or font list either.
			if ( ! $post || SavedTemplates::POST_TYPE !== $post->post_type || 'publish' !== $post->post_status || empty( $post->post_content ) ) {
				continue;
			}

			$parsed = parse_blocks( $post->post_content );
			$out    = array_merge( $out, $parsed, $this->saved_template_blocks( $parsed ) );
		}

		return $out;
	}

	/**
	 * Emit a saved template's CSS from the shortcode itself.
	 *
	 * The `wp_enqueue_scripts` pass above covers a shortcode living in the post
	 * content or the block template. This is the fallback for everywhere else —
	 * widgets, page builders, a shortcode built at render time — and no-ops when
	 * the id was already handled. Styles enqueued this late print in the footer.
	 *
	 * @param int $id Saved template post id.
	 * @return void
	 */
	public function ensure_saved_template_css( $id ) {
		list( $css, $fonts ) = $this->saved_template_css( $id );

		if ( ! empty( $fonts ) && self::google_fonts_enabled() ) {
			wp_enqueue_style( 'sptp-google-fonts-' . (int) $id, 'https://fonts.googleapis.com/css?family=' . implode( '|', $fonts ) . '&display=swap', array(), SPT_PLUGIN_VERSION );
		}

		if ( '' === $css ) {
			return;
		}

		if ( ! wp_style_is( 'sptp-blocks-style', 'registered' ) ) {
			wp_register_style( 'sptp-blocks-style', false, array(), SPT_PLUGIN_VERSION );
		}
		if ( ! wp_style_is( 'sptp-blocks-style', 'enqueued' ) ) {
			wp_enqueue_style( 'sptp-blocks-style' );
		}

		wp_add_inline_style( 'sptp-blocks-style', wp_strip_all_tags( $css ) );
	}

	/**
	 * A saved template's minified CSS and the Google font tokens it needs.
	 *
	 * Page builders render past `wp_head`, where an enqueued style is dropped or
	 * printed after the markup it styles, so they print this next to the markup
	 * instead of going through `ensure_saved_template_css()`. Marks the id
	 * handled, so whichever of the two runs first wins and the other no-ops.
	 *
	 * @param int $id Saved template post id.
	 * @return array{0:string,1:array<int,string>} Minified CSS, `Family:weight` tokens.
	 */
	public function saved_template_css( $id ) {
		$id = (int) $id;
		if ( ! $id || isset( $this->handled_saved_templates[ $id ] ) ) {
			return array( '', array() );
		}

		$blocks = $this->blocks_for_saved_templates( array( $id ) );
		if ( empty( $blocks ) ) {
			return array( '', array() );
		}

		$fonts_before = $this->google_fonts;
		$css          = $this->extract_css_from_blocks( $blocks );
		$new_fonts    = array_values( array_unique( array_diff( $this->google_fonts, $fonts_before ) ) );

		return array( empty( $css ) ? '' : $this->minify_css( $css ), $new_fonts );
	}

	/**
	 * Recursive walker — generates CSS for owned blocks and dives into innerBlocks.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return string
	 */
	private function extract_css_from_blocks( $blocks ) {
		$css = '';

		foreach ( $blocks as $block ) {
			if ( ! empty( $block['blockName'] ) && in_array( $block['blockName'], $this->our_blocks, true ) ) {
				$css .= $this->generate_css_from_attributes( $block );
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$css .= $this->extract_css_from_blocks( $block['innerBlocks'] );
			}
		}

		return $css;
	}

	/**
	 * Parsed blocks of the block template used to render the current request,
	 * with every template part expanded inline. Empty on classic themes (whose
	 * pages render from $post->post_content / PHP templates instead).
	 *
	 * Reads $_wp_current_template_content, which WordPress populates while
	 * resolving the block template — before wp_head (hence before this runs on
	 * wp_enqueue_scripts).
	 *
	 * @return array<int, array>
	 */
	private function get_current_template_blocks() {
		if ( is_singular( 'sptp_member' ) && MemberTemplate::use_block_layout_on_classic_theme( get_queried_object() ) ) {
			return MemberTemplate::member_blocks();
		}

		if ( ! function_exists( 'wp_is_block_theme' ) || ! wp_is_block_theme() ) {
			return array();
		}

		$content = isset( $GLOBALS['_wp_current_template_content'] ) ? $GLOBALS['_wp_current_template_content'] : '';
		if ( empty( $content ) ) {
			return array();
		}

		return $this->expand_template_parts( parse_blocks( $content ) );
	}

	/**
	 * Replace every core/template-part reference with the parsed blocks of the
	 * part it points at (recursively), so blocks living in header/footer/other
	 * template parts are scanned too. Non-part blocks pass through with their
	 * innerBlocks expanded the same way.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return array<int, array>
	 */
	private function expand_template_parts( $blocks ) {
		$out = array();

		foreach ( $blocks as $block ) {
			$name = $block['blockName'] ?? '';

			if ( 'core/template-part' === $name ) {
				$slug  = $block['attrs']['slug'] ?? '';
				$theme = $block['attrs']['theme'] ?? get_stylesheet();
				if ( '' !== $slug && function_exists( 'get_block_template' ) ) {
					$part = get_block_template( $theme . '//' . $slug, 'wp_template_part' );
					if ( $part && ! empty( $part->content ) ) {
						$out = array_merge( $out, $this->expand_template_parts( parse_blocks( $part->content ) ) );
					}
				}
				continue;
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$block['innerBlocks'] = $this->expand_template_parts( $block['innerBlocks'] );
			}

			$out[] = $block;
		}

		return $out;
	}

	/**
	 * Resolve attributes for a block (saved + defaults), then run the generator.
	 *
	 * @param array $block Parsed block.
	 * @return string
	 */
	private function generate_css_from_attributes( $block ) {
		$block_name = $block['blockName'] ?? '';
		if ( empty( $block_name ) ) {
			return '';
		}

		$saved      = $block['attrs'] ?? array();
		$defaults   = array();
		$block_type = \WP_Block_Type_Registry::get_instance()->get_registered( $block_name );

		if ( $block_type ) {
			foreach ( $block_type->get_attributes() as $key => $attr ) {
				if ( isset( $attr['default'] ) ) {
					$defaults[ $key ] = $attr['default'];
				}
			}
		}

		$attributes = wp_parse_args( $saved, $defaults );

		$this->google_fonts = array_merge(
			$this->google_fonts,
			Att_Utils::extract_font_families_from_attributes( $attributes )
		);

		// Short slug (no namespace) — DynamicCssGenerator's switch matches on this.
		$parts                   = explode( '/', $block_name );
		$attributes['blockName'] = end( $parts );

		$generator = new DynamicCssGenerator( $attributes );
		return $generator->generate_dynamic_css();
	}

	/**
	 * Strip comments / whitespace / empty media query blocks.
	 *
	 * @param string $css CSS source.
	 * @return string
	 */
	private function minify_css( $css ) {
		$css = preg_replace( '!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css );
		$css = str_replace( array( "\r\n", "\n", "\t", '  ', '    ' ), '', $css );
		$css = str_replace( array( ' {', '{ ' ), '{', $css );
		$css = str_replace( array( ' }', '} ' ), '}', $css );
		$css = str_replace( array( ' ;', '; ' ), ';', $css );
		$css = str_replace(
			array(
				'@media only screen and (max-width: 599px){}',
				'@media only screen and (min-width: 600px) and (max-width: 1023px){}',
			),
			'',
			$css
		);
		return trim( $css );
	}
}
