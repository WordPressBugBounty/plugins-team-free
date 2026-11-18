<?php
/**
 * Team Group block — static container.
 *
 * Port of Real Testimonials Pro's testimonial-group block: an InnerBlocks
 * container that pairs a Smart Team grid with its addon child blocks (today
 * sptp/ajax-pagination; ajax search / live filter are Pro stubs in Free). It is
 * never inserted by hand (`inserter: false` in JS) — the grid's Display
 * Settings toggles wrap/unwrap it automatically via the useTeamChildBlocks
 * hook (apps/hooks/useTeamChildBlocks.js). The saved markup comes from
 * Save.jsx; the frontend runtime (blocks/assets/js/script.js) scopes its
 * paging state per `.sp-smart-team-group` element.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Team_Group;

use ShapedPlugin\WPTeam\Blocks\Includes\AbstractBlock;

defined( 'ABSPATH' ) || exit;

/**
 * Class Team_Group
 */
class Team_Group extends AbstractBlock {

	/**
	 * The container carries only uniqueId + align (attributes.php) — the shared
	 * CommonAttributes belong to the blocks inside it.
	 *
	 * @var bool
	 */
	protected $skip_common_attributes = true;

	/**
	 * Set block properties. Static block — markup is saved by Save.jsx and the
	 * children render themselves (the grid dynamically, via its own callback).
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name     = 'team-group';
		$this->editor_scripts = array( 'sptp-blocks-editor' );
		$this->editor_styles  = array( 'sptp-blocks-editor' );
		$this->styles         = array( 'sptp-blocks-style' );
		$this->is_dynamic     = false;
	}
}
