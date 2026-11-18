<?php
/**
 * Auto-discovers block classes under blocks/Types/ and instantiates them.
 *
 * Responsible for scanning available block directories, converting
 * block names into class names, and registering block instances.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes;

defined( 'ABSPATH' ) || exit;

/**
 * Blocks register class.
 */
class Blocks_Register {

	/**
	 * Class instance.
	 *
	 * @var Blocks_Register|null
	 */
	private static $instance;

	/**
	 * Registered block objects, keyed by slug (e.g. 'grid'). Lets other layers
	 * (the sptp_query_members AJAX handler) reuse a block's renderer without
	 * instantiating it again — a second `new` would re-register the block type.
	 *
	 * @var array<string, object>
	 */
	protected $blocks = array();

	/**
	 * Get class instance.
	 *
	 * Ensures only one instance of the class is loaded.
	 *
	 * @return Blocks_Register
	 */
	public static function instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}
		return self::$instance;
	}

	/**
	 * Initialize block registration.
	 *
	 * @return void
	 */
	public function init() {
		$this->register_blocks();
	}

	/**
	 * Register all discovered blocks.
	 *
	 * Scans block directories, resolves block class names,
	 * and instantiates block classes.
	 *
	 * @return void
	 */
	protected function register_blocks() {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		foreach ( $this->get_block_slugs() as $block_slug ) {
			$class_name = sprintf(
				'\\ShapedPlugin\\WPTeam\\Blocks\\Types\\%1$s\\%1$s',
				self::to_studly_case( $block_slug )
			);

			if ( class_exists( $class_name ) ) {
				$this->blocks[ $block_slug ] = new $class_name();
			}
		}
	}

	/**
	 * Get a registered block object by slug.
	 *
	 * @param string $block_slug Block slug (e.g. 'grid').
	 * @return object|null
	 */
	public function get_block( $block_slug ) {
		return isset( $this->blocks[ $block_slug ] ) ? $this->blocks[ $block_slug ] : null;
	}

	/**
	 * Get all block slugs from block directories.
	 *
	 * Scans the Types directory and returns available block slugs.
	 *
	 * @return array
	 */
	protected function get_block_slugs() {
		$blocks = array();
		$path   = SPT_BLOCKS_PATH . 'Types/';

		if ( ! is_dir( $path ) ) {
			return $blocks;
		}

		foreach ( scandir( $path ) as $folder ) {
			if ( '.' === $folder || '..' === $folder ) {
				continue;
			}
			if ( is_dir( $path . $folder ) ) {
				$blocks[] = strtolower( str_replace( '_', '-', $folder ) );
			}
		}

		// Layout blocks lead the inserter in this order; the rest keep folder order.
		$priority = array( 'carousel', 'grid', 'carousel-3d' );
		$blocks   = array_merge( array_intersect( $priority, $blocks ), array_diff( $blocks, $priority ) );

		return $blocks;
	}

	/**
	 * Convert block slug to StudlyCase format.
	 *
	 * Example:
	 * org-chart => Org_Chart
	 *
	 * @param string $slug Block slug.
	 * @return string
	 */
	protected static function to_studly_case( $slug ) {
		$parts = explode( '-', $slug );
		$parts = array_map( 'ucfirst', $parts );
		return implode( '_', $parts );
	}
}
