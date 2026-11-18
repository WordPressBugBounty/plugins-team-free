<?php
/**
 * Dispatcher that maps a block name to its per-block style class.
 *
 * Mirrors the Styble Pro DynamicCssGenerator pattern: each block registers a
 * `case` here pointing at a class in Includes\Styles that produces responsive
 * rule arrays. Css_Helpers::filter_responsive_dynamic_css() then flattens the
 * result into the final CSS string.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Utils;

use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Carousel;
use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Ajax_Pagination;
use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Grid;
use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Member_Bio;
use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Member_Description;
use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Member_Designation;
use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Member_Image;
use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Member_Name;
use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Member_Modal_Content;
use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Member_Skills;
use ShapedPlugin\WPTeam\Blocks\Includes\Styles\Social_Profile;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Class DynamicCssGenerator
 */
class DynamicCssGenerator {

	/**
	 * Block attributes including a `blockName` key (short slug, no namespace).
	 *
	 * @var array
	 */
	public $attributes = array();

	/**
	 * Stores the block's attributes for the CSS generation methods to read.
	 *
	 * `uniqueId` is reduced to selector-safe characters here, once, because
	 * every style class prefixes its rules with `#uniqueId`.
	 *
	 * @param array $attributes Block attributes.
	 */
	public function __construct( $attributes ) {
		$attributes['uniqueId'] = Css_Helpers::unique_id( $attributes['uniqueId'] ?? '' );
		$this->attributes       = $attributes;
	}

	/**
	 * Build the responsive CSS string for the current block.
	 *
	 * @return string
	 */
	public function generate_dynamic_css() {
		$block_name = $this->attributes['blockName'] ?? '';

		switch ( $block_name ) {
			case 'grid':
				$grid = new Grid( $this->attributes );
				return $grid->generate();
			case 'carousel-3d':
				// Pro-only block, rendered through Carousel's renderer
				// (Pro_Gate::BLOCK_FALLBACK) — so it takes Carousel's CSS too.
			case 'carousel':
				$carousel = new Carousel( $this->attributes );
				return $carousel->generate();
			case 'ajax-pagination':
				$pagination = new Ajax_Pagination( $this->attributes );
				return $pagination->generate();
			case 'member-bio':
				$member_bio = new Member_Bio( $this->attributes );
				return $member_bio->generate();
			case 'member-description':
				$member_description = new Member_Description( $this->attributes );
				return $member_description->generate();
			case 'member-designation':
				$member_designation = new Member_Designation( $this->attributes );
				return $member_designation->generate();
			case 'member-image':
				$member_image = new Member_Image( $this->attributes );
				return $member_image->generate();
			case 'member-modal-content':
				$member_modal_content = new Member_Modal_Content( $this->attributes );
				return $member_modal_content->generate();
			case 'member-name':
				$member_name = new Member_Name( $this->attributes );
				return $member_name->generate();
			case 'member-skills':
				$member_skills = new Member_Skills( $this->attributes );
				return $member_skills->generate();
			case 'social-profile':
				$social_profile = new Social_Profile( $this->attributes );
				return $social_profile->generate();
			default:
				return '';
		}
	}
}
