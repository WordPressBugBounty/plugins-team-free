<?php
/**
 * Base abstract class for registering Gutenberg blocks.
 *
 * This class provides a reusable structure for registering WordPress
 * block editor blocks, handling attributes, assets, and rendering logic.
 * Concrete blocks should extend this class and implement set_block_properties().
 *
 * Inspired by the AbstractBlock pattern used in Styble Pro.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

use ShapedPlugin\WPTeam\Blocks\Attributes\CommonAttributes;

defined( 'ABSPATH' ) || exit;

/**
 * Class AbstractBlock
 *
 * Handles registration, attribute loading, and rendering pipeline
 * for Gutenberg blocks in Team Pro.
 */
abstract class AbstractBlock {

	/**
	 * Block namespace (prefix before slash in block name).
	 *
	 * Example: "sptp" in "sptp/grid".
	 *
	 * @var string
	 */
	protected $namespace = 'sptp';

	/**
	 * Block slug (part after namespace in block name).
	 *
	 * Example: "grid" in "sptp/grid".
	 *
	 * @var string
	 */
	protected $block_name = '';

	/**
	 * Block attributes used for Gutenberg block registration.
	 *
	 * @var array
	 */
	protected $attributes = array();

	/**
	 * Handles for scripts used in the block editor.
	 *
	 * @var array
	 */
	protected $editor_scripts = array();

	/**
	 * Handles for styles used in the block editor.
	 *
	 * @var array
	 */
	protected $editor_styles = array();

	/**
	 * Handles for frontend view scripts.
	 *
	 * @var array
	 */
	protected $scripts = array();

	/**
	 * Handles for frontend styles.
	 *
	 * @var array
	 */
	protected $styles = array();

	/**
	 * Search keywords used in the block editor inserter.
	 *
	 * @var array
	 */
	protected $keywords = array( 'team', 'member', 'staff' );

	/**
	 * Whether the block is dynamically rendered on the server.
	 *
	 * If true, render_block_callback() will be used.
	 *
	 * @var bool
	 */
	protected $is_dynamic = false;

	/**
	 * Whether to skip merging CommonAttributes.
	 *
	 * Useful for inner/child blocks that do not need shared attributes.
	 *
	 * @var bool
	 */
	protected $skip_common_attributes = false;

	/**
	 * Constructor.
	 *
	 * Initializes block properties, loads attributes,
	 * and registers the block with WordPress.
	 */
	public function __construct() {
		$this->set_block_properties();
		$this->load_attributes();
		$this->register_block();
	}

	/**
	 * Set block-specific properties.
	 *
	 * Each concrete block must define:
	 * - $block_name
	 * - scripts/styles
	 * - dynamic rendering flag (if needed)
	 *
	 * @return void
	 */
	abstract protected function set_block_properties();

	/**
	 * Load and merge block attributes.
	 *
	 * Combines:
	 * - CommonAttributes (shared attributes)
	 * - Block-specific attributes file (if exists)
	 * - Filters via 'sptp_block_attributes'
	 *
	 * @return void
	 */
	protected function load_attributes() {
		$this->attributes = $this->skip_common_attributes ? array() : CommonAttributes::get();

		$attribute_file = SPT_BLOCKS_PATH . 'Types/' . self::to_studly_case( $this->block_name ) . '/attributes.php';

		if ( file_exists( $attribute_file ) ) {
			$attrs = require $attribute_file;
			if ( is_array( $attrs ) ) {
				$this->attributes = array_merge( $this->attributes, $attrs );
			}
		}

		$this->attributes = apply_filters( 'sptp_block_attributes', $this->attributes, $this->block_name );
	}

	/**
	 * Get full registered block name.
	 *
	 * Format: namespace/block-name
	 *
	 * @return string
	 */
	protected function get_name() {
		return sprintf( '%1$s/%2$s', $this->namespace, $this->block_name );
	}

	/**
	 * Get arguments for register_block_type().
	 *
	 * @return array
	 */
	protected function get_args() {
		$args = array(
			'attributes'    => $this->attributes,
			'editor_script' => $this->editor_scripts,
			'editor_style'  => $this->editor_styles,
			'view_script'   => $this->scripts,
			'style'         => $this->styles,
			'keywords'      => $this->keywords,
			'api_version'   => 3,
			'category'      => BlockCategories::SLUG,
		);

		if ( $this->is_dynamic ) {
			$args['render_callback'] = array( $this, 'render_block_callback' );
		}

		return $args;
	}

	/**
	 * Render callback wrapper for dynamic blocks.
	 *
	 * Adds hooks before and after rendering for extensibility.
	 *
	 * @param array          $attributes Block attributes.
	 * @param string         $content    Inner block content.
	 * @param \WP_Block|null $block      Block instance.
	 *
	 * @return string Rendered HTML output.
	 */
	public function render_block_callback( $attributes, $content = '', $block = null ) {
		$attributes = apply_filters( 'sptp_block_render_attributes', $attributes, $this->block_name );

		do_action( 'sptp_before_render', $this->block_name, $attributes, $content, $block );

		$output = $this->render_block( $attributes, $content, $block );

		do_action( 'sptp_after_render', $this->block_name, $attributes, $output, $block );

		// Advanced → Custom CSS ID gets its own outer wrapper — it must never
		// replace the block's #uniqueId, which all dynamic CSS anchors to.
		$additional_id = isset( $attributes['additionalId'] ) ? trim( $attributes['additionalId'] ) : '';
		if ( '' !== $additional_id ) {
			$output = '<div id="' . esc_attr( $additional_id ) . '">' . $output . '</div>';
		}

		return $output;
	}

	/**
	 * Register the block with WordPress.
	 *
	 * Prevents duplicate registration using WP_Block_Type_Registry.
	 *
	 * @return void
	 */
	protected function register_block() {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		$block_name = $this->get_name();

		if ( \WP_Block_Type_Registry::get_instance()->is_registered( $block_name ) ) {
			return;
		}

		register_block_type( $block_name, $this->get_args() );
	}

	/**
	 * Render block output (override in dynamic blocks).
	 *
	 * @param array          $attributes Block attributes.
	 * @param string         $content    Inner content.
	 * @param \WP_Block|null $block      Block instance.
	 *
	 * @return string HTML output.
	 */
	public function render_block( $attributes, $content = '', $block = null ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- part of the override signature every subclass uses.
		return $content;
	}

	/**
	 * JSON for a `data-*` attribute the frontend runtime reads back,
	 * percent-encoded so it carries no character that can terminate the
	 * attribute.
	 *
	 * Plain `wp_json_encode()` + `esc_attr()` is correct for ONE pass of HTML,
	 * but a page builder is not one pass. Divi's Visual Builder decodes the
	 * module markup and re-emits it without re-escaping, so the `&quot;`
	 * entities become literal `"` that close the attribute early: the browser
	 * ends up with `data-swiper-settings="{"` — the whole config truncated to a
	 * single brace. `JSON.parse` then throws, Swiper never initialises and every
	 * slide renders full width. Measured in the Divi 4 Visual Builder, where
	 * EVERY attribute of ours carrying encoded quotes truncated to length 1
	 * while entity-free attributes (`class`, `src`) came through intact.
	 *
	 * `rawurlencode()` leaves only `A-Za-z0-9-_.~` and `%`, so the value
	 * survives any number of entity-decode round trips. The reader
	 * (`parseJsonAttr` in assets/js/script.js) accepts both this and bare JSON,
	 * so markup cached from an older version keeps working.
	 *
	 * The result still has to be passed through `esc_attr()` by the caller.
	 *
	 * @param mixed $data Data to encode.
	 *
	 * @return string Percent-encoded JSON, safe in an HTML attribute.
	 */
	protected function json_attr( $data ) {
		return rawurlencode( (string) wp_json_encode( $data ) );
	}

	/**
	 * Convert kebab-case slug into Studly_Case format.
	 *
	 * Example: "org-chart" => "Org_Chart"
	 *
	 * @param string $slug Block slug.
	 *
	 * @return string Converted string.
	 */
	protected static function to_studly_case( $slug ) {
		$parts = explode( '-', $slug );
		$parts = array_map( 'ucfirst', $parts );
		return implode( '_', $parts );
	}
}
