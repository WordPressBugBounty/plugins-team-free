<?php
/**
 * Filter by Department block — Pro-only stub. See Includes\Pro_Stub_Block.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Filter_By_Department;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Stub_Block;

defined( 'ABSPATH' ) || exit;

/**
 * Class Filter_By_Department
 */
class Filter_By_Department extends Pro_Stub_Block {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name = 'filter-by-department';
		$this->is_dynamic = true;
	}
}
