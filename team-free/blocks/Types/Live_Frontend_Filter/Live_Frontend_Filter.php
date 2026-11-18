<?php
/**
 * Live Frontend Filter block — Pro-only stub. See Includes\Pro_Stub_Block.
 *
 * Pro registers this as a static block (its own save() serializes the
 * container markup; no PHP render_callback). Free instead registers it as
 * dynamic — the JS save() is kept byte-for-byte identical to Pro's (see
 * apps/blocks/live-frontend-filter/save.jsx) purely so a page saved under Pro
 * keeps validating in the editor (Rule 2); adding a render_callback here is
 * what turns its frontend output into '' regardless of that saved markup.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Live_Frontend_Filter;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Stub_Block;

defined( 'ABSPATH' ) || exit;

/**
 * Class Live_Frontend_Filter
 */
class Live_Frontend_Filter extends Pro_Stub_Block {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name = 'live-frontend-filter';
		$this->is_dynamic = true;
	}
}
