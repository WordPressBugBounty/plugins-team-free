<?php
/**
 * Grid dynamic CSS renderer (frontend).
 *
 * PHP twin of apps/blocks/grid/dynamicCss.js. The shared card rules live in
 * the CardCss base; this class contributes only the grid-track rules
 * (columns / gaps / align-items on the `__items` grid).
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Grid
 */
class Grid extends CardCss {

	/**
	 * Grid-track rules for a single device. Columns are responsive (one value
	 * per device); the gaps and alignment are non-responsive so they only emit
	 * on the Desktop pass (mirrors archiveResponsiveCss in dynamicCss.js).
	 *
	 * @param string $device Device key (Desktop|Tablet|Mobile).
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	protected function layout_responsive_css( $device ) {
		$base  = '#' . $this->unique_id;
		$rules = array();

		// Responsive: column count.
		$columns     = $this->attributes['columns']['device'][ $device ] ?? '';
		$grid_styles = array();
		if ( '' !== $columns ) {
			$grid_styles['grid-template-columns'] = 'repeat(' . absint( $columns ) . ', 1fr)';
		}

		// Non-responsive: gaps + alignment.
		if ( 'Desktop' === $device ) {
			$h_gap      = $this->attributes['horizontalGap']['value'] ?? '';
			$h_gap_unit = $this->attributes['horizontalGap']['unit'] ?? 'px';
			if ( '' !== $h_gap ) {
				$grid_styles['column-gap'] = $h_gap . $h_gap_unit;
			}

			$v_gap      = $this->attributes['verticalGap']['value'] ?? '';
			$v_gap_unit = $this->attributes['verticalGap']['unit'] ?? 'px';
			if ( '' !== $v_gap ) {
				$grid_styles['row-gap'] = $v_gap . $v_gap_unit;
			}

			$align = $this->attributes['alignItems'] ?? '';
			if ( '' !== $align ) {
				$grid_styles['align-items'] = $align;
			}
		}

		if ( ! empty( $grid_styles ) ) {
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-grid__items',
				'styles'   => $grid_styles,
			);
		}

		return $rules;
	}
}
