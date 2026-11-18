<?php
/**
 * Shared member-card dynamic CSS (frontend).
 *
 * PHP twin of apps/blocks/shared/cardDynamicCss.js. Base class for every
 * layout block's Styles\* renderer: card_responsive_css() builds the rules
 * for the shared `.sp-smart-team-card` markup; subclasses contribute their
 * layout-only rules via layout_responsive_css() (grid track, swiper nav, …).
 * generate() joins both per device, wraps tablet/mobile in media queries and
 * appends the shared section/box styles via CommonDynamicCss — producing a
 * CSS string identical to the editor output.
 *
 * @package ShapedPlugin\WPTeam\Blocks
 */

namespace ShapedPlugin\WPTeam\Blocks\Includes\Styles;

use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;
use ShapedPlugin\WPTeam\Blocks\Includes\Utils\Css_Helpers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class CardCss
 */
abstract class CardCss {

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
	 * Stores the block's attributes and derives its unique id.
	 *
	 * @param array $attributes Block attributes.
	 */
	public function __construct( $attributes ) {
		// Same design the markup renders (a Pro card-4…11 / overlay-N is card-1
		// here too) and no leftover overlay white text — Pro_Gate is read-only.
		$attributes       = Pro_Gate::style_attributes( $attributes );
		$this->attributes = $attributes;
		$this->unique_id  = $attributes['uniqueId'] ?? '';
	}

	/**
	 * Layout-specific rules for one device (grid track, carousel nav, …).
	 * Overridden per block; the base contributes nothing.
	 *
	 * @param string $device Device key (Desktop|Tablet|Mobile), read by overrides.
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	protected function layout_responsive_css( $device ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- part of the override signature every subclass uses.
		return array();
	}

	/**
	 * Shared card rules for a single device. Colors, image radius and social
	 * colors are non-responsive so they only emit on the Desktop pass (mirrors
	 * cardResponsiveCss in cardDynamicCss.js).
	 *
	 * @param string $device Device key (Desktop|Tablet|Mobile).
	 * @return array<int, array{selector:string,styles:array<string,string>}>
	 */
	protected function card_responsive_css( $device ) {
		$base  = '#' . $this->unique_id;
		$rules = array();

		// Card box (Card Elements → Style tab) — background, border, radius,
		// shadow are non-responsive (Desktop pass); padding is per device. On
		// the overlap/panel designs (card-3/4/5) and the overlay-2 preset the
		// visible card is the __content box (overlap box / mint panel / overlay-2's
		// floating bottom panel), so the WHOLE box styling retargets there (values
		// emit only when set, so the SCSS panel look holds by default); card-6 has
		// no box, so only its background moves. overlay-2 is the only overlay
		// design whose __content reads as a discrete box, so it alone gets the
		// box retarget; the other
		// overlays keep border/radius/padding on the full-bleed card. Twin of
		// dynamicCss.js.
		$card_design       = $this->attributes['cardDesign'] ?? 'card-1';
		$is_overlay_design = is_string( $card_design ) && 0 === strpos( $card_design, 'overlay-' );
		$box_on_content    = in_array( $card_design, array( 'card-3', 'card-4', 'card-5', 'overlay-2' ), true );
		$card_padding      = Css_Helpers::responsive_spacing_value( $this->attributes['cardPadding'] ?? array(), $device );
		$card_styles       = $box_on_content ? array() : array( 'padding' => $card_padding );
		$content_styles    = $box_on_content && $this->spacing_has_value( $this->attributes['cardPadding'] ?? array() )
			? array( 'padding' => $card_padding )
			: array();
		if ( 'Desktop' === $device ) {
			// Image To Content Gap — the photo-to-text flex gap on card-2's split
			// row. Image Area Gap is card-9's equivalent for its __side column.
			$image_gap      = $this->attributes['imageContentGap']['value'] ?? '';
			$image_gap_unit = $this->attributes['imageContentGap']['unit'] ?? 'px';
			$area_gap       = $this->attributes['imageAreaGap']['value'] ?? '';
			$area_gap_unit  = $this->attributes['imageAreaGap']['unit'] ?? 'px';
			$split_gap      = '';
			if ( 'card-2' === $card_design && '' !== $image_gap ) {
				$split_gap = $image_gap . $image_gap_unit;
			} elseif ( 'card-9' === $card_design && '' !== $area_gap ) {
				$split_gap = $area_gap . $area_gap_unit;
			}
			// On these designs the visible card is the __content box (card-3's
			// overlap box, card-4/5's mint panel; card-6 has
			// no box and content spans the card) while the item stays transparent —
			// paint the card background there instead.
			// Overlay: the Card Content Background is the overlay scrim, so it
			// paints __content (not the transparent item) — same as the panels
			// ($is_overlay_design is computed above with $box_on_content).
			// UNLESS Image Masking is on: the photo is then a shape and the
			// background belongs INSIDE it, so it moves to a layer within the
			// masked wrap (the $bg_in_mask rules further down) and is emitted
			// neither on __content nor on the item — a card-wide scrim would spill
			// across the bare card around the shape. Twin of cardDynamicCss.js.
			$bg_in_mask    = $is_overlay_design
				&& ! empty( $this->attributes['imageMasking'] )
				&& ! empty( $this->attributes['imageMaskShape'] );
			$bg_on_content = ( $is_overlay_design && ! $bg_in_mask )
				|| in_array( $card_design, array( 'card-3', 'card-4', 'card-5', 'card-6' ), true );

			$card_bg       = Css_Helpers::background_styles( $this->attributes['cardBg'] ?? array() );
			$card_hover_bg = Css_Helpers::background_styles( array( 'color' => $this->attributes['cardBg']['hover'] ?? array() ) );

			$card_radius      = Css_Helpers::spacing_shorthand_value( $this->attributes['cardBorderRadius'] ?? array() );
			$box_styles       = array_merge(
				array(
					'border-radius' => $box_on_content && ! $this->spacing_has_value( $this->attributes['cardBorderRadius'] ?? array() ) ? '' : $card_radius,
					'box-shadow'    => Css_Helpers::box_shadow_css( $this->attributes['cardBoxShadow'] ?? array() ),
				),
				Css_Helpers::border_styles( $this->attributes['cardBorder'] ?? array(), $this->attributes['cardBorderWidth'] ?? array() )
			);
			$hover_box_styles = array_merge(
				array(
					'box-shadow' => Css_Helpers::box_shadow_css( $this->attributes['cardBoxShadowHover'] ?? array() ),
				),
				Css_Helpers::border_styles( $this->attributes['cardBorderHover'] ?? array(), $this->attributes['cardBorderWidthHover'] ?? array() )
			);

			$card_styles = array_merge(
				$card_styles,
				array( 'gap' => $split_gap ),
				$box_on_content ? array() : $box_styles,
				$bg_on_content || $bg_in_mask ? array() : $card_bg
			);
			// card-5's photo-to-text clearance lives inside the panel's padding
			// calc — feed the Image To Content Gap in via the CSS var instead of
			// a flex gap (the photo overlaps the panel, so a gap would split
			// them). Set on the item; the panel inherits it.
			if ( 'card-5' === $card_design && '' !== $image_gap ) {
				$card_styles['--sptp-image-content-gap'] = $image_gap . $image_gap_unit;
			}

			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card:hover',
				'styles'   => array_merge(
					$box_on_content ? array() : $hover_box_styles,
					$bg_on_content || $bg_in_mask ? array() : $card_hover_bg
				),
			);

			if ( $bg_on_content || $box_on_content ) {
				$content_styles = array_merge(
					$content_styles,
					$box_on_content ? $box_styles : array(),
					$bg_on_content ? $card_bg : array()
				);
				$rules[]        = array(
					'selector' => $base . ' .sp-smart-team-card:hover .sp-smart-team-card__content',
					'styles'   => array_merge(
						$box_on_content ? $hover_box_styles : array(),
						$bg_on_content ? $card_hover_bg : array()
					),
				);
			}

			// A set Background REPLACES the preset's SCSS scrim — unmasked that
			// happens by itself (both are `background` on __content, and #uniqueId
			// wins). With the color moved inside the shape the replacement has to be
			// explicit, or the scrim keeps painting over the whole card AND over the
			// shape (it is z-index 2, the masked layer is inside the z-index 1
			// avatar), leaving the control looking dead. Twin of cardDynamicCss.js.
			if ( $bg_in_mask ) {
				$clear_bg = array(
					'background-color' => 'transparent',
					'background-image' => 'none',
				);
				if ( ! empty( $card_bg ) ) {
					$content_styles = array_merge( $content_styles, $clear_bg );
				}
				if ( ! empty( $card_bg ) || ! empty( $card_hover_bg ) ) {
					$rules[] = array(
						'selector' => $base . ' .sp-smart-team-card:hover .sp-smart-team-card__content',
						'styles'   => $clear_bg,
					);
				}
			}
		}
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card',
			'styles'   => $card_styles,
		);
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__content',
			'styles'   => $content_styles,
		);

		// card-3 Content Box (Display Settings) — the overlap box's width and how
		// far it climbs over the photo (offset → negative top margin) are
		// responsive; the horizontal alignment is not.
		if ( 'card-3' === ( $this->attributes['cardDesign'] ?? 'card-1' ) ) {
			$content_box = array(
				'width' => Css_Helpers::single_responsive_value( $this->attributes['contentBoxWidth'] ?? array(), $device ),
			);
			$box_offset  = Css_Helpers::single_responsive_value( $this->attributes['contentBoxOffset'] ?? array(), $device );
			if ( '' !== $box_offset ) {
				$content_box['margin-top'] = '-' . $box_offset;
			}
			if ( 'Desktop' === $device ) {
				$box_align_map             = array(
					'left'   => 'flex-start',
					'center' => 'center',
					'right'  => 'flex-end',
				);
				$content_box['align-self'] = $box_align_map[ $this->attributes['contentBoxAlignment'] ?? 'center' ] ?? 'center';
			}
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__content',
				'styles'   => $content_box,
			);
		}

		// Member Image → size (width/height) + margin, per device. Margin only
		// emits when the user set a non-zero value so the full-bleed default holds.
		// Width 100% (the default) means "full bleed": the SCSS stretch +
		// negative side margins already span the card edge-to-edge, while an
		// explicit width:100% would resolve against __content's padded box and
		// leave the photo short on the right — emit custom sizes only. Overlay
		// designs have NO image Width/Height and NO image margin at all (the panel
		// hides both controls): the avatar is absolutely positioned to fill the
		// card, so a width would win over the right inset and a margin would shrink
		// the full-bleed photo — skip them even if older values are saved. Twin of
		// dynamicCss.js.
		$avatar_width  = $this->size_dim_value( $this->attributes['imageSize'] ?? array(), 'width', $device );
		$avatar_styles = $is_overlay_design ? array() : array(
			'width'  => '100%' === $avatar_width ? '' : $avatar_width,
			'height' => $this->size_dim_value( $this->attributes['imageSize'] ?? array(), 'height', $device ),
		);
		if ( ! $is_overlay_design && $this->spacing_has_value( $this->attributes['imageMargin'] ?? array() ) ) {
			$avatar_styles['margin'] = Css_Helpers::responsive_spacing_value( $this->attributes['imageMargin'] ?? array(), $device );
		}
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__avatar',
			'styles'   => $avatar_styles,
		);

		// Responsive: Basic Information typography + margin (name/role/bio).
		// Margin only emits when the user set a non-zero value, so card-design
		// structural margins (e.g. card-2's tight name/role pair) hold by default.
		// On card-8 the name/role caption chips also take a Padding (empty by
		// default so the SCSS caption padding holds). Twin of dynamicCss.js.
		$is_card_8 = 'card-8' === ( $this->attributes['cardDesign'] ?? 'card-1' );
		foreach ( array( 'name', 'role', 'bio' ) as $part ) {
			$part_margin = $this->attributes[ $part . 'Margin' ] ?? array();
			$part_styles = array_merge(
				Css_Helpers::typography_styles( $this->typo_bundle( $part ), $device ),
				array( 'margin' => $this->spacing_has_value( $part_margin ) ? Css_Helpers::responsive_spacing_value( $part_margin, $device ) : '' )
			);
			if ( $is_card_8 && 'bio' !== $part ) {
				$part_styles['padding'] = Css_Helpers::responsive_spacing_value( $this->attributes[ $part . 'Padding' ] ?? array(), $device );
			}
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__' . $part,
				'styles'   => $part_styles,
			);
		}

		// Responsive: Additional Information meta rows (contact details + custom
		// info, both carry __detail) — typography + icon-to-label gap; meta-icon
		// size; gap between custom-info items.
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__detail',
			'styles'   => array_merge(
				Css_Helpers::typography_styles( $this->typo_bundle( 'meta' ), $device ),
				array( 'gap' => Css_Helpers::single_responsive_value( $this->attributes['metaIconGap'] ?? array(), $device ) )
			),
		);
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__meta-icon :is(i, svg)',
			'styles'   => array( 'font-size' => Css_Helpers::single_responsive_value( $this->attributes['metaIconSize'] ?? array(), $device ) ),
		);
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__custom',
			'styles'   => array( 'gap' => Css_Helpers::single_responsive_value( $this->attributes['metaItemGap'] ?? array(), $device ) ),
		);

		// Responsive: Social icons — area (box) size, icon (glyph) size, gap.
		$social_area = Css_Helpers::single_responsive_value( $this->attributes['socialIconAreaSize'] ?? array(), $device );
		// Margin belongs to the whole row, not each chip. !important: the
		// `ul[class*='sp-smart-team-']` reset in style.scss sets margin with !important.
		$social_row_margin = Css_Helpers::responsive_spacing_value( $this->attributes['socialMargin'] ?? array(), $device );
		$rules[]           = array(
			'selector' => $base . ' .sp-smart-team-card__social',
			'styles'   => array(
				'gap'    => Css_Helpers::single_responsive_value( $this->attributes['socialItemGap'] ?? array(), $device ),
				'margin' => '' !== $social_row_margin ? $social_row_margin . ' !important' : '',
			),
		);
		$rules[]           = array(
			'selector' => $base . ' .sp-smart-team-card__social a',
			'styles'   => array(
				'width'     => $social_area,
				'height'    => $social_area,
				'font-size' => Css_Helpers::single_responsive_value( $this->attributes['socialIconSize'] ?? array(), $device ),
			),
		);
		// card-6 flyout — the "+"/"×" toggle chip matches the icon area size,
		// and the Offset control feeds the corner inset via a CSS variable
		// consumed by the position variants in style.scss. Twin of dynamicCss.js.
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__social-toggle',
			'styles'   => array(
				'width'  => $social_area,
				'height' => $social_area,
			),
		);
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__social-flyout',
			'styles'   => array(
				'--sptp-social-flyout-offset' => Css_Helpers::single_responsive_value( $this->attributes['socialIconOffset'] ?? array(), $device ),
			),
		);

		// Non-responsive: colors, image radius, social colors.
		if ( 'Desktop' === $device ) {
			// card-8 caption chips — the name/role Background Color controls only
			// apply on that design (the chips are its on-photo caption boxes).
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__name',
				'styles'   => array(
					'color'            => $this->attributes['nameColor'] ?? '',
					'background-color' => $is_card_8 ? ( $this->attributes['nameBgColor'] ?? '' ) : '',
				),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__name:hover',
				'styles'   => array(
					'color'            => $this->attributes['nameColorHover'] ?? '',
					'background-color' => $is_card_8 ? ( $this->attributes['nameBgColorHover'] ?? '' ) : '',
				),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__role',
				'styles'   => array(
					'color'            => $this->attributes['roleColor'] ?? '',
					'background-color' => $is_card_8 ? ( $this->attributes['roleBgColor'] ?? '' ) : '',
				),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__bio',
				'styles'   => array( 'color' => $this->attributes['bioColor'] ?? '' ),
			);

			// Non-responsive: Additional Information colors (Normal/Hover). Text color
			// cascades to the value links (a { color: inherit }); icon color drives
			// the glyph fill and (for outline/light styles) the stroke via currentColor.
			//
			// The HOVER state is scoped to LINKED rows — `:has(a)`. Email, mobile,
			// phone and website render an anchor; Location, Experience, Language,
			// Gender do not, and recolouring those on hover promised a click that does
			// nothing. Gated on the ROW being hovered (not `a:hover`) so icon + value
			// respond together. Twin of cardDynamicCss.js.
			$detail_link_hover = $base . ' .sp-smart-team-card__detail:has(a):hover';

			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__detail',
				'styles'   => array( 'color' => $this->attributes['metaTextColor'] ?? '' ),
			);
			$rules[] = array(
				'selector' => $detail_link_hover,
				'styles'   => array( 'color' => $this->attributes['metaTextColorHover'] ?? '' ),
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__meta-icon :is(i, svg)',
				'styles'   => array( 'color' => $this->attributes['metaIconColor'] ?? '' ),
			);
			$rules[] = array(
				'selector' => $detail_link_hover . ' .sp-smart-team-card__meta-icon :is(i, svg)',
				'styles'   => array( 'color' => $this->attributes['metaIconColorHover'] ?? '' ),
			);

			$radius      = $this->attributes['imageRadius']['value'] ?? '';
			$radius_unit = $this->attributes['imageRadius']['unit'] ?? 'px';
			if ( '' !== $radius ) {
				$rules[] = array(
					'selector' => $base . ' .sp-smart-team-card__avatar',
					'styles'   => array( 'border-radius' => $radius . $radius_unit ),
				);
			}

			// Member Image → Border Radius (the live Style-tab control) — emitted
			// after imageRadius so it is authoritative for the avatar corners.
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__avatar',
				'styles'   => array( 'border-radius' => Css_Helpers::spacing_shorthand_value( $this->attributes['imageBorderRadius'] ?? array() ) ),
			);

			// Member Image → Image Masking (ported from Styble Pro) — the chosen
			// preset SVG masks the photo box. Fixed contain/center/no-repeat per the
			// Figma panel (no size/position controls). Twin of dynamicCss.js.
			// A Pro shape renders as the diamond (Pro_Gate::mask_shape()); the
			// stored value is left untouched.
			$mask_shape = Pro_Gate::mask_shape( sanitize_key( $this->attributes['imageMaskShape'] ?? '' ) );
			if ( ! empty( $this->attributes['imageMasking'] ) && $mask_shape ) {
				$mask_url = 'url(' . SPT_BLOCKS_URL . 'assets/images/mask/' . $mask_shape . '.svg)';
				$rules[]  = array(
					'selector' => $base . ' .sp-smart-team-card__image-wrap',
					'styles'   => array(
						'-webkit-mask-image'    => $mask_url,
						'mask-image'            => $mask_url,
						'-webkit-mask-size'     => 'contain',
						'mask-size'             => 'contain',
						'-webkit-mask-repeat'   => 'no-repeat',
						'mask-repeat'           => 'no-repeat',
						'-webkit-mask-position' => 'center center',
						'mask-position'         => 'center center',
					),
				);
				// The avatar's gray placeholder background sits behind the masked
				// wrap and would show around the shape — clear it while masking.
				$rules[] = array(
					'selector' => $base . ' .sp-smart-team-card__avatar',
					'styles'   => array( 'background' => 'transparent' ),
				);

				// Overlay + masking: the Card Content Background paints INSIDE THE
				// SHAPE ONLY. It normally paints __content — an absolute layer over
				// the whole card — which with a mask spills across the bare card
				// around the shape. So on these designs it moves to a layer INSIDE
				// the masked wrap (::after over the photo), which the mask clips for
				// free, and $bg_on_content skips __content (see the card-box block
				// above). Emitted only when a background is actually set, so an
				// empty control leaves no stray layer. pointer-events: none keeps
				// the photo link / social flyout clickable underneath. Twin of
				// cardDynamicCss.js.
				if ( $is_overlay_design ) {
					if ( ! empty( $card_bg ) ) {
						$rules[] = array(
							'selector' => $base . ' .sp-smart-team-card__image-wrap::after',
							'styles'   => array_merge(
								array(
									'content'        => '""',
									'position'       => 'absolute',
									'inset'          => '0',
									'pointer-events' => 'none',
								),
								$card_bg
							),
						);
					}
					if ( ! empty( $card_hover_bg ) ) {
						$rules[] = array(
							'selector' => $base . ' .sp-smart-team-card:hover .sp-smart-team-card__image-wrap::after',
							'styles'   => $card_hover_bg,
						);
					}
				}
			}

			// Member Image → Image Filter is Pro — Free emits no filter CSS
			// (the stored imageBlur/… attributes are left untouched).

			// Social icons — border radius only. Custom Styling (per-state color /
			// background / border / box-shadow) is Pro — Free emits no CSS for it
			// (the stored socialCustomStyling / socialIconColor… are left untouched).
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__social a',
				'styles'   => array(
					'border-radius' => Css_Helpers::spacing_shorthand_value( $this->attributes['socialBorderRadius'] ?? array() ),
				),
			);

			// Non-responsive: card content alignment (text + flex children).
			$content_alignment = $this->attributes['contentAlignment'] ?? '';
			if ( '' !== $content_alignment ) {
				$flex_map   = array(
					'left'   => 'flex-start',
					'center' => 'center',
					'right'  => 'flex-end',
				);
				$flex_align = $flex_map[ $content_alignment ] ?? 'center';

				$rules[] = array(
					'selector' => $base . ' .sp-smart-team-card__content',
					'styles'   => array(
						'text-align'  => $content_alignment,
						'align-items' => $flex_align,
					),
				);
				// Skills only in the button (chip) display — bar styles are a
				// column flex where justify-content would shift bars vertically.
				$rules[] = array(
					'selector' => $base . ' .sp-smart-team-card__detail, ' . $base . ' .sp-smart-team-card__social, ' . $base . ' .sp-smart-team-card__skills--button',
					'styles'   => array( 'justify-content' => $flex_align ),
				);
			}

			// Non-responsive: skill bar colors + radius. In style-3 the radius
			// rounds the clipping .skill (below) and the inner track/fill stay
			// square; every other style rounds the track + fill directly.
			$skill_radius    = Css_Helpers::spacing_shorthand_value( $this->attributes['skillBarRadius'] ?? array() );
			$is_skill_style3 = ( $this->attributes['skillsProgressBarStyle'] ?? 'style-1' ) === 'style-3';
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
			// Button display (chip) — background, border and radius from the Button
			// style controls (typography/padding/margin below, per device).
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
			// Chip text color — also targets name/percentage so it beats the progress
			// skillLabel/skillPercent color rules' ID specificity.
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skill--chip, ' . $base . ' .sp-smart-team-card__skill--chip .sp-smart-team-card__skill-name, ' . $base . ' .sp-smart-team-card__skill--chip .sp-smart-team-card__skill-percentage',
				'styles'   => array( 'color' => $this->attributes['skillButtonColor'] ?? '' ),
			);
			// Style-1 tooltip bubble background (+ its caret) — the "Tooltip
			// Background Color" control only affects the style-1 bubble.
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
			// Style-3 — the skill clips to the bar radius so both ends round
			// (the name block on the left and the track on the right).
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__skills--style-3 .sp-smart-team-card__skill',
				'styles'   => array( 'border-radius' => $skill_radius ),
			);

			// Multi Color Skill Bar — pair N colors the Nth bar (exact position,
			// no cycling); bars beyond the list keep the common fill/track
			// colors above. The nth-child selectors are more specific than the
			// global rules, so only background-color is overridden per pair
			// (twin of the skillBarColors block in dynamicCss.js).
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
					// Style-3 — the name block rides the fill color (same as the
					// global rule above).
					$rules[] = array(
						'selector' => $base . ' .sp-smart-team-card__skills--style-3 ' . $nth . ' .sp-smart-team-card__skill-name',
						'styles'   => array( 'background-color' => $pair['fill'] ?? '' ),
					);
				}
			}
		}

		// Responsive: skill bar height + skills block margin. Height is set on the
		// track only; the fill keeps its base height:100% so style-3's taller bar
		// (min-height) is filled without fighting an explicit fill height.
		$bar_height = Css_Helpers::single_responsive_value( $this->attributes['skillsBarHeight'] ?? array(), $device );
		$rules[]    = array(
			'selector' => $base . ' .sp-smart-team-card__skill-track',
			'styles'   => array( 'height' => $bar_height ),
		);
		$rules[]    = array(
			'selector' => $base . ' .sp-smart-team-card__skills',
			'styles'   => array(
				'margin' => Css_Helpers::responsive_spacing_value( $this->attributes['skillMargin'] ?? array(), $device ),
				'gap'    => Css_Helpers::single_responsive_value( $this->attributes['skillsItemGap'] ?? array(), $device ),
			),
		);
		// Label typography (Skills → Style → Label Typography) — responsive,
		// on the bar-style skill name (the chip styles its own text below).
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__skill-name',
			'styles'   => Css_Helpers::typography_styles( $this->typo_bundle( 'skillLabel' ), $device ),
		);
		// Button display (chip) — responsive typography and padding per chip;
		// the Margin control spaces the whole skills wrapper, not each chip.
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__skill--chip',
			'styles'   => array_merge(
				Css_Helpers::typography_styles( $this->typo_bundle( 'skillButton' ), $device ),
				array(
					'padding' => Css_Helpers::responsive_spacing_value( $this->attributes['skillButtonPadding'] ?? array(), $device ),
				)
			),
		);
		$rules[] = array(
			'selector' => $base . ' .sp-smart-team-card__skills--button',
			'styles'   => array( 'margin' => Css_Helpers::responsive_spacing_value( $this->attributes['skillButtonMargin'] ?? array(), $device ) ),
		);

		// Read More button — only when enabled. Color/background/border/radius/
		// shadow are non-responsive (Desktop pass); typography, padding and margin
		// are emitted per device. Mirrors dynamicCss.js.
		if ( ! empty( $this->attributes['readMoreButton'] ) ) {
			$btn_styles = array_merge(
				array(
					'padding' => Css_Helpers::responsive_spacing_value( $this->attributes['readMorePadding'] ?? array(), $device ),
				),
				Css_Helpers::typography_styles( $this->typo_bundle( 'readMore' ), $device )
			);

			if ( 'Desktop' === $device ) {
				$btn_styles = array_merge(
					$btn_styles,
					array(
						'color'         => $this->attributes['readMoreColor'] ?? '',
						'border-radius' => Css_Helpers::spacing_shorthand_value( $this->attributes['readMoreRadius'] ?? array() ),
						'box-shadow'    => Css_Helpers::box_shadow_css( $this->attributes['readMoreBoxShadow'] ?? array() ),
					),
					Css_Helpers::background_styles( $this->attributes['readMoreBg'] ?? array() ),
					Css_Helpers::border_styles( $this->attributes['readMoreBorder'] ?? array(), $this->attributes['readMoreBorderWidth'] ?? array() )
				);

				$hover_bg = array( 'color' => $this->attributes['readMoreBg']['hover'] ?? array() );
				$rules[]  = array(
					'selector' => $base . ' .sp-smart-team-card__read-more-btn:hover',
					'styles'   => array_merge(
						array(
							'color'      => $this->attributes['readMoreColorHover'] ?? '',
							'box-shadow' => Css_Helpers::box_shadow_css( $this->attributes['readMoreBoxShadowHover'] ?? array() ),
						),
						Css_Helpers::background_styles( $hover_bg ),
						Css_Helpers::border_styles( $this->attributes['readMoreBorderHover'] ?? array(), $this->attributes['readMoreBorderWidthHover'] ?? array() )
					),
				);
			}

			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__read-more-btn',
				'styles'   => $btn_styles,
			);
			$rules[] = array(
				'selector' => $base . ' .sp-smart-team-card__read-more',
				// Gated like every other margin control so the default (all-zero)
				// is not emitted — otherwise a `margin:0` at ID specificity would
				// clobber layout margins the card CSS sets on __read-more (e.g. the
				// overlay-2 collapse margin that hides the Read More until hover).
				'styles'   => array( 'margin' => $this->spacing_has_value( $this->attributes['readMoreMargin'] ?? array() ) ? Css_Helpers::responsive_spacing_value( $this->attributes['readMoreMargin'] ?? array(), $device ) : '' ),
			);
		}

		return $rules;
	}

	/**
	 * Assemble a Typography control bundle for an element prefix (name/role/bio)
	 * to feed Css_Helpers::typography_styles(). Twin of typoBundle() in dynamicCss.js.
	 *
	 * @param string $prefix Attribute prefix.
	 * @return array
	 */
	protected function typo_bundle( $prefix ) {
		return array(
			'family'        => $this->attributes[ $prefix . 'Typography' ] ?? array(),
			'fontSize'      => $this->attributes[ $prefix . 'FontSize' ] ?? array(),
			'lineHeight'    => $this->attributes[ $prefix . 'LineHeight' ] ?? array(),
			'letterSpacing' => $this->attributes[ $prefix . 'LetterSpacing' ] ?? array(),
			'wordSpacing'   => $this->attributes[ $prefix . 'WordSpacing' ] ?? array(),
		);
	}

	/**
	 * Extract a width/height dimension (value+unit) from a width_height attribute
	 * for a device, or '' when unset. Twin of sizeDimValue() in dynamicCss.js.
	 *
	 * @param array  $size   width_height attribute.
	 * @param string $dim    'width' | 'height'.
	 * @param string $device Device key.
	 * @return string
	 */
	protected function size_dim_value( $size, $dim, $device ) {
		$value = $size['device'][ $device ][ $dim ] ?? '';
		if ( '' === $value || null === $value ) {
			return '';
		}
		$unit = $size['unit'][ $device ][ $dim ] ?? 'px';
		return $value . $unit;
	}

	/**
	 * True when a spacing attribute has any side filled on any device. Only an
	 * empty side is unset — 0 is a real value. Twin of spacingHasValue().
	 *
	 * @param array $spacing responsive_spacing attribute.
	 * @return bool
	 */
	protected function spacing_has_value( $spacing ) {
		// Plain spacing shape ({ value: { top, … }, unit }) — one side set is enough.
		if ( empty( $spacing['device'] ) || ! is_array( $spacing['device'] ) ) {
			foreach ( (array) ( $spacing['value'] ?? array() ) as $v ) {
				if ( '' !== $v && null !== $v ) {
					return true;
				}
			}
			return false;
		}
		foreach ( $spacing['device'] as $sides ) {
			foreach ( (array) $sides as $v ) {
				if ( '' !== $v && null !== $v ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Build the full responsive CSS string for this block instance.
	 *
	 * @return string
	 */
	public function generate() {
		if ( '' === $this->unique_id ) {
			return '';
		}

		$desktop_css = array_merge( $this->layout_responsive_css( 'Desktop' ), $this->card_responsive_css( 'Desktop' ) );
		$tablet_css  = array_merge( $this->layout_responsive_css( 'Tablet' ), $this->card_responsive_css( 'Tablet' ) );
		$mobile_css  = array_merge( $this->layout_responsive_css( 'Mobile' ), $this->card_responsive_css( 'Mobile' ) );

		$tablet_media_query_css = Css_Helpers::wrap_in_media_query(
			Css_Helpers::object_to_css_string( $tablet_css ),
			'only screen and (max-width: 1023px)'
		);
		$mobile_media_query_css = Css_Helpers::wrap_in_media_query(
			Css_Helpers::object_to_css_string( $mobile_css ),
			'only screen and (max-width: 599px)'
		);

		return Css_Helpers::object_to_css_string( $desktop_css )
			. ' ' . $tablet_media_query_css
			. ' ' . $mobile_media_query_css
			. ' ' . CommonDynamicCss::generate( $this->attributes );
	}
}
