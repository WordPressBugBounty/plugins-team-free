<?php
/**
 * Member Video block — Pro-only stub. See Includes\Pro_Stub_Block.
 *
 * Free's Add New Member screen has no field for this data, so the block is
 * Pro-only: it stays registered with its real `attributes.php` (Rule 2) so
 * saved Pro content never shows an invalid-block warning, and renders nothing.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Member_Video;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Stub_Block;

defined( 'ABSPATH' ) || exit;

/**
 * Class Member_Video
 */
class Member_Video extends Pro_Stub_Block {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name = 'member-video';
		$this->is_dynamic = true;
	}
}
