<?php
/**
 * Ajax Member Search block — Pro-only stub. See Includes\Pro_Stub_Block.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Ajax_Member_Search;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Stub_Block;

defined( 'ABSPATH' ) || exit;

/**
 * Class Ajax_Member_Search
 */
class Ajax_Member_Search extends Pro_Stub_Block {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name = 'ajax-member-search';
		$this->is_dynamic = true;
	}
}
