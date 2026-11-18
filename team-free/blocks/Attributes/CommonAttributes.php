<?php
/**
 * Shared block attributes merged into every block via AbstractBlock::load_attributes().
 *
 * Uses Att_Utils factories so attribute definitions stay declarative and consistent
 * with the Styble Pro architecture. Add new shared fields here as the system grows.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Attributes;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Att_Utils;

defined( 'ABSPATH' ) || exit;

/**
 * Class CommonAttributes
 */
class CommonAttributes {

	/**
	 * Identity / accessibility attributes every block needs.
	 *
	 * @return array
	 */
	public static function get_required(): array {
		return array(
			'uniqueId'           => Att_Utils::string( '' ),
			'align'              => Att_Utils::string( '' ),
			'additionalCssClass' => Att_Utils::string( '' ),
			'additionalId'       => Att_Utils::string( '' ),
			'customCss'          => Att_Utils::string( '' ),
			'hideOnDesktop'      => Att_Utils::boolean(),
			'hideOnTablet'       => Att_Utils::boolean(),
			'hideOnMobile'       => Att_Utils::boolean(),
		);
	}

	/**
	 * Section-level layout / box attributes (spacing, border, background).
	 *
	 * @return array
	 */
	public static function get_section_preferences(): array {
		return array(
			// Padding/margin/radius default EMPTY (not zeros) so the dynamic CSS
			// emits them only once the user customizes the control — a zero
			// default would print an ID-scoped `margin/padding: 0` reset on every
			// block that beats class-level SCSS (e.g. a child block's default
			// spacing) by specificity.
			'sectionPadding'      => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
			'sectionMargin'       => Att_Utils::responsive_spacing( '', '', '', '', 'px', true ),
			'sectionBorder'       => Att_Utils::border( 'none', '#CCCCCC' ),
			'sectionBorderWidth'  => Att_Utils::spacing( 1, 1, 1, 1, 'px', true ),
			'sectionBorderRadius' => Att_Utils::spacing( '', '', '', '', 'px', true ),
			'sectionBg'           => Att_Utils::background( 'bgColor', '' ),
			'sectionBoxShadow'    => Att_Utils::box_shadow( false, 0, 0, 0, 0, '#4E4F521A', 'Outset' ),
		);
	}

	/**
	 * All shared attributes, merged in one call.
	 *
	 * @return array
	 */
	public static function get(): array {
		return array_merge(
			self::get_required(),
			self::get_section_preferences(),
		);
	}
}
