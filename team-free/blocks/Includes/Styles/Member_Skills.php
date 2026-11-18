<?php
/**
 * Member Skills dynamic CSS renderer (frontend).
 *
 * PHP twin of apps/blocks/member-skills/dynamicCss.js. Emits the skill rules
 * (colors, radius, height, gap, typography, chip, tooltip, style-3 specifics
 * and the multi-color nth-child overrides) — a scoped copy of the skill block
 * in Styles\CardCss, anchored to this block's #uniqueId. The base look (3 bar
 * styles / percent visibility / chip) comes from the globally-bundled shared
 * card SCSS; this only paints the customizable values.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Styles;

use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Css_Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Member_Skills
 */
class Member_Skills {

	/**
	 * Block attributes (saved + defaults merged).
	 *
	 * @var array
	 */
	public $attributes = array();

	/**
	 * Stable unique id for the block instance.
	 *
	 * @var string
	 */
	public $unique_id = '';

	/**
	 * @param array $attributes Block attributes.
	 */
	public function __construct( $attributes ) {
		$this->attributes = $attributes;
		$this->unique_id  = $attributes['uniqueId'] ?? '';
	}

	/**
	 * Skill rules for one device. Colors / radius / chip / tooltip / multi-color
	 * are non-responsive (Desktop pass); height / gap / margin / typography are
	 * per device. Mirrors the skill block of Styles\CardCss::card_responsive_css.
	 *
	 * @param string $device Device key (Desktop|Tablet|Mobile).
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	private function archive_responsive_css( $device ) {
		$base  = '#' . $this->unique_id;
		$rules = array();

		if ( 'Desktop' === $device ) {
			// In style-3 the radius rounds the clipping .skill (below) and the
			// inner track/fill stay square; every other style rounds them directly.
			$skill_radius    = Css_Helpers::spacing_shorthand_value( $this->attributes['skillBarRadius'] ?? array() );
			$is_skill_style3 = ( $this->attributes['skillsProgressBarStyle'] ?? 'style-2' ) === 'style-3';
			$track_radius    = $is_skill_style3 ? '0' : $skill_radius;

			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skill-name',
				'styles'   => array( 'color' => $this->attributes['skillLabelColor'] ?? '' ),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skill-percentage',
				'styles'   => array( 'color' => $this->attributes['skillPercentColor'] ?? '' ),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skill-track',
				'styles'   => array(
					'background-color' => $this->attributes['skillBarTrackColor'] ?? '',
					'border-radius'    => $track_radius,
				),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skill-fill',
				'styles'   => array(
					'background-color' => $this->attributes['skillBarFillColor'] ?? '',
					'border-radius'    => $track_radius,
				),
			);
			// Button display (chip) — background, border and radius.
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skill--chip',
				'styles'   => array_merge(
					array(
						'background-color' => $this->attributes['skillButtonBg'] ?? '',
						'border-radius'    => Css_Helpers::spacing_shorthand_value( $this->attributes['skillButtonRadius'] ?? array() ),
					),
					Css_Helpers::border_styles( $this->attributes['skillButtonBorder'] ?? array(), $this->attributes['skillButtonBorderWidth'] ?? array() )
				),
			);
			// Chip text color — also targets name/percentage so it beats the
			// progress skillLabel/skillPercent color rules' ID specificity.
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skill--chip, ' . $base . ' .sp-smart-team-card__skill--chip .sp-smart-team-card__skill-name, ' . $base . ' .sp-smart-team-card__skill--chip .sp-smart-team-card__skill-percentage',
				'styles'   => array( 'color' => $this->attributes['skillButtonColor'] ?? '' ),
			);
			// Style-1 tooltip bubble background (+ its caret).
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skills--style-1 .sp-smart-team-card__skill-percentage',
				'styles'   => array( 'background-color' => $this->attributes['skillTooltipBgColor'] ?? '' ),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skills--style-1 .sp-smart-team-card__skill-percentage::after',
				'styles'   => array( 'border-top-color' => $this->attributes['skillTooltipBgColor'] ?? '' ),
			);
			// Style-3 — the name block sits on the bar, so it takes the fill color.
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skills--style-3 .sp-smart-team-card__skill-name',
				'styles'   => array( 'background-color' => $this->attributes['skillBarFillColor'] ?? '' ),
			);
			// Style-3 — the skill clips to the bar radius so both ends round.
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skills--style-3 .sp-smart-team-card__skill',
				'styles'   => array( 'border-radius' => $skill_radius ),
			);

			// Multi Color Skill Bar — pair N colors the Nth bar (exact position, no
			// cycling); bars beyond the list keep the common fill/track colors.
			$skill_bar_colors = $this->attributes['skillBarColors'] ?? array();
			if ( ! empty( $this->attributes['skillMultiColor'] ) && is_array( $skill_bar_colors ) && count( $skill_bar_colors ) ) {
				foreach ( array_values( $skill_bar_colors ) as $i => $pair ) {
					$nth     = '.sp-smart-team-card__skill:nth-child(' . ( $i + 1 ) . ')';
					$rules[] = array(
						'selector' => $base . ' ' . $nth . ' .sp-smart-team-card__skill-fill',
						'styles'   => array( 'background-color' => $pair['fill'] ?? '' ),
					);
					$rules[] = array(
						'selector' => $base . ' ' . $nth . ' .sp-smart-team-card__skill-track',
						'styles'   => array( 'background-color' => $pair['track'] ?? '' ),
					);
					$rules[] = array(
						'selector' => $base . ' .sp-smart-team-card__skills--style-3 ' . $nth . ' .sp-smart-team-card__skill-name',
						'styles'   => array( 'background-color' => $pair['fill'] ?? '' ),
					);
				}
			}
		}

		// Responsive: bar height (track only), skills wrapper margin + gap.
		$bar_height = Css_Helpers::single_responsive_value( $this->attributes['skillsBarHeight'] ?? array(), $device );
		$rules[]    = array(
			'selector' => $base . ' .sp-smart-team-card__skill-track',
			'styles'   => array( 'height' => $bar_height ),
		);
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__skills',
			'styles'   => array(
				'margin' => Css_Helpers::responsive_spacing_value( $this->attributes['skillMargin'] ?? array(), $device ),
				'gap'    => Css_Helpers::single_responsive_value( $this->attributes['skillsItemGap'] ?? array(), $device ),
			),
		);
		// Label typography — on the bar-style skill name (the chip styles its own text below).
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__skill-name',
			'styles'   => Css_Helpers::typography_styles( $this->typo_bundle( 'skillLabel' ), $device ),
		);
		// Button display (chip) — responsive typography + padding, and the wrapper margin.
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__skill--chip',
			'styles'   => array_merge(
				Css_Helpers::typography_styles( $this->typo_bundle( 'skillButton' ), $device ),
				array( 'padding' => Css_Helpers::responsive_spacing_value( $this->attributes['skillButtonPadding'] ?? array(), $device ) )
			),
		);
		// Alignment value → flexbox keyword (twin of FLEX_ALIGN in dynamicCss.js).
		// Empty Tablet/Mobile emit no rule, so they inherit the Desktop value. The
		// `--button` class gates it to the chip row: the progress bars are a column
		// flex, where justify-content would shift the bars vertically instead.
		$flex_align = array(
			'left'   => 'flex-start',
			'center' => 'center',
			'right'  => 'flex-end',
		);
		$alignment  = $this->attributes['skillsAlignment']['device'][ $device ] ?? '';

		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__skills--button',
			'styles'   => array(
				'margin'          => Css_Helpers::responsive_spacing_value( $this->attributes['skillButtonMargin'] ?? array(), $device ),
				'justify-content' => $flex_align[ $alignment ] ?? '',
			),
		);

		return $rules;
	}

	/**
	 * Build the full responsive CSS string for the block instance.
	 *
	 * @return string
	 */
	public function generate() {
		if ( '' === $this->unique_id ) {
			return '';
		}

		$desktop_css = $this->archive_responsive_css( 'Desktop' );

		$tablet_media_query_css = Css_Helpers::wrap_in_media_query(
			Css_Helpers::object_to_css_string( $this->archive_responsive_css( 'Tablet' ) ),
			'only screen and (max-width: 1023px)'
		);
		$mobile_media_query_css = Css_Helpers::wrap_in_media_query(
			Css_Helpers::object_to_css_string( $this->archive_responsive_css( 'Mobile' ) ),
			'only screen and (max-width: 599px)'
		);

		return Css_Helpers::object_to_css_string( $desktop_css )
			. ' ' . $tablet_media_query_css
			. ' ' . $mobile_media_query_css
			. ' ' . CommonDynamicCss::generate( $this->attributes );
	}

	/**
	 * Assemble a Typography control bundle for an attribute prefix. Twin of
	 * typoBundle() in dynamicCss.js.
	 *
	 * @param string $prefix Attribute prefix.
	 * @return array
	 */
	private function typo_bundle( $prefix ) {
		return array(
			'family'        => $this->attributes[ $prefix . 'Typography' ] ?? array(),
			'fontSize'      => $this->attributes[ $prefix . 'FontSize' ] ?? array(),
			'lineHeight'    => $this->attributes[ $prefix . 'LineHeight' ] ?? array(),
			'letterSpacing' => $this->attributes[ $prefix . 'LetterSpacing' ] ?? array(),
			'wordSpacing'   => $this->attributes[ $prefix . 'WordSpacing' ] ?? array(),
		);
	}
}
