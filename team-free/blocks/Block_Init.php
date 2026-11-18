<?php
/**
 * Bootstrap for the Smart Team Pro block system.
 *
 * Registers block categories, initializes blocks, handles
 * dynamic styles, and registers editor/frontend assets.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks;

use ShapedPlugin\WPTeam\Blocks\Includes\AI\ConnectorBridge;
use ShapedPlugin\WPTeam\Blocks\Includes\AI\Controller as AIRestController;
use ShapedPlugin\WPTeam\Blocks\Includes\AssetManager;
use ShapedPlugin\WPTeam\Blocks\Includes\BlockCategories;
use ShapedPlugin\WPTeam\Blocks\Includes\Block_Visibility;
use ShapedPlugin\WPTeam\Blocks\Includes\Blocks_Register;
use ShapedPlugin\WPTeam\Blocks\Includes\Member_Ajax;
use ShapedPlugin\WPTeam\Blocks\Includes\Member_REST;
use ShapedPlugin\WPTeam\Blocks\Includes\MemberLayoutBlock;
use ShapedPlugin\WPTeam\Blocks\Includes\MemberTemplate;
use ShapedPlugin\WPTeam\Blocks\Includes\ReadyPatterns\Controller as ReadyPatternsController;
use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Block_Dynamic_Style;

defined( 'ABSPATH' ) || exit;

/**
 * Main block initialization class.
 */
class Block_Init {

	/**
	 * Class instance.
	 *
	 * @var Block_Init|null
	 */
	protected static $instance = null;

	/**
	 * Get class instance.
	 *
	 * Ensures only one instance of the class is loaded.
	 *
	 * @return Block_Init
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->init_blocks();
	}

	/**
	 * Initialize block-related functionality.
	 *
	 * Registers block categories, block assets, and dynamic styles.
	 *
	 * @return void
	 */
	private function init_blocks() {
		if ( version_compare( $GLOBALS['wp_version'], '5.8', '<' ) ) {
			return;
		}

		BlockCategories::init();

		add_action( 'init', array( $this, 'register_blocks' ), 10 );

		// Frontend dynamic CSS — walks the current post and emits per-block CSS.
		Block_Dynamic_Style::instance();

		// Block-facing REST API (editor previews for dynamic blocks). Pro's
		// ManageAPI also carries the Saved Templates / Member Details ajax
		// endpoints and the dashboard's Parent/Child Blocks toggle — none of
		// which exist in Free; Member_REST is the read-only member-data subset
		// every free layout block's editor preview needs.
		Member_REST::instance();

		// Ajax Pagination: the public `sptp_query_members` paging endpoint, and
		// the sibling pagination's per-page stamped onto the grid so its first
		// page matches what the endpoint serves for page 1.
		Member_Ajax::instance();
		add_filter( 'render_block_data', array( MemberLayoutBlock::class, 'inject_ajax_per_page' ), 10, 3 );

		// Dashboard "Blocks" page switches: a switched-off block renders nothing.
		add_filter( 'pre_render_block', array( Block_Visibility::class, 'filter_pre_render_block' ), 10, 2 );

		// Member single page as a Site Editor block template ("Single Item:
		// Member") — the Member Details panel's "Configure Single Page
		// Template" link opens it. Pro's modal DetailsTemplates stay out.
		MemberTemplate::init();

		// Ready Patterns library — the sptp/v1/patterns* REST routes behind the
		// editor's "Patterns Library" modal. Same pattern server as Pro; Pro-tier
		// patterns are preview-only here (Pro_Gate::is_free_pattern()).
		new ReadyPatternsController();

		// AI Team Builder — sptp/v1/ai-generate and sptp/v1/ai/verify-key, the
		// same routes as Pro. Nothing is sent to a provider until an admin adds
		// a key (or a WordPress Connector) and a user asks for a layout.
		new AIRestController();
		ConnectorBridge::init();

		$asset_manager = AssetManager::instance();
		add_action( 'init', array( $asset_manager, 'register_block_editor_assets' ), 10 );
		add_action( 'init', array( $asset_manager, 'register_frontend_assets' ), 5 );
		// WP core CodeMirror for the Advanced tab's Custom CSS field (SpCssCodeEditor).
		add_action( 'enqueue_block_editor_assets', array( $asset_manager, 'enqueue_code_editor_assets' ) );
		add_action( 'enqueue_block_editor_assets', array( $asset_manager, 'localize_ai_builder' ) );
	}

	/**
	 * Register all blocks.
	 *
	 * Loads and registers all available blocks.
	 *
	 * @return void
	 */
	public function register_blocks() {
		Blocks_Register::instance();
	}
}
