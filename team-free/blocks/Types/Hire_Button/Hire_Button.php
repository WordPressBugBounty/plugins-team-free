<?php
/**
 * Hire Button block — Pro-only stub. See Includes\Pro_Stub_Block.
 *
 * Free's Add New Member screen has the Hire URL field disabled as Pro-only, so
 * a Free user can never fill it: the block stays registered with its real
 * `attributes.php` (Rule 2) so saved Pro content never shows an invalid-block
 * warning, and renders nothing.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Hire_Button;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Stub_Block;

defined( 'ABSPATH' ) || exit;

/**
 * Class Hire_Button
 */
class Hire_Button extends Pro_Stub_Block {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name = 'hire-button';
		$this->is_dynamic = true;
	}
}
