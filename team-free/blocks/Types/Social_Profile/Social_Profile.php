<?php
/**
 * Social Profile block — server-rendered.
 *
 * A single-page builder field block: renders one member's social-profile icons.
 * Reuses the shared card social markup (`.sp-smart-team-card__social`) so the
 * globally-bundled shared SCSS (the four icon styles) applies, and the social
 * dynamic-CSS twin (Styles\Social_Profile) styles it under this block's
 * #uniqueId. Declares the Font Awesome + fontello style handles (like the
 * grid/carousel) so the icon glyphs load in the editor and on the frontend.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Social_Profile;

use ShapedPlugin\WPTeam\Blocks\Includes\AbstractBlock;
use ShapedPlugin\WPTeam\Blocks\Includes\MemberQuery;

defined( 'ABSPATH' ) || exit;

/**
 * Class Social_Profile
 */
class Social_Profile extends AbstractBlock {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name     = 'social-profile';
		$this->editor_scripts = array( 'sptp-blocks-editor' );
		$this->editor_styles  = array( 'sptp-blocks-editor' );
		// FA + fontello ship the icon glyphs; declared as `style` so WP enqueues
		// them in BOTH the editor and the frontend when this block is present.
		$this->styles     = array( 'sptp-blocks-style', 'sp_team_fontawesome', 'sp_team_fontello' );
		$this->is_dynamic = true;
	}

	/**
	 * Resolve which member to render (explicit id → block context → queried post).
	 *
	 * @param array          $attributes Block attributes.
	 * @param \WP_Block|null $block      Block instance.
	 * @return \WP_Post|null
	 */
	private function resolve_member( $attributes, $block ) {
		$member_id = isset( $attributes['memberId'] ) ? (int) $attributes['memberId'] : 0;

		if ( ! $member_id && $block && ! empty( $block->context['sptp/memberId'] ) ) {
			$member_id = (int) $block->context['sptp/memberId'];
		}

		if ( ! $member_id ) {
			$member_id = (int) get_the_ID();
		}

		if ( ! $member_id ) {
			return null;
		}

		$post = get_post( $member_id );

		return MemberQuery::is_viewable_member( $post ) ? $post : null;
	}

	/**
	 * Render the Social Profile block on the frontend. Markup twin of the
	 * `social` case in MemberLayoutBlock::render_element().
	 *
	 * @param array          $attributes Block attributes.
	 * @param string         $content    Inner block content.
	 * @param \WP_Block|null $block      Block instance.
	 * @return string Rendered HTML output.
	 */
	public function render_block( $attributes, $content = '', $block = null ) {
		$post = $this->resolve_member( $attributes, $block );
		if ( ! $post ) {
			return '';
		}

		$member = MemberQuery::get_member_data( $post );
		if ( empty( $member['socials'] ) ) {
			return '';
		}

		$social_style = ! empty( $attributes['socialIconStyle'] ) ? sanitize_html_class( $attributes['socialIconStyle'] ) : 'style-3';

		$unique_id   = $attributes['uniqueId'] ?? '';
		$extra_class = $attributes['additionalCssClass'] ?? '';
		$align       = $attributes['align'] ?? '';

		$classes = array_filter(
			array(
				'sp-smart-team-social-profile',
				'' !== $align ? 'align' . $align : '',
				$extra_class,
			)
		);

		ob_start();
		?>
		<div
			<?php
			if ( $unique_id ) :
				?>
				id="<?php echo esc_attr( $unique_id ); ?>"<?php endif; ?>
			class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
		>
			<ul class="sp-smart-team-card__social sp-smart-team-card__social--<?php echo esc_attr( $social_style ); ?>">
				<?php foreach ( $member['socials'] as $social_item ) : ?>
					<li>
						<a
							class="sptp-<?php echo esc_attr( $social_item['group'] ); ?>"
							href="<?php echo esc_url( $social_item['link'] ); ?>"
							title="<?php echo esc_attr( ucfirst( str_replace( 'icon-', '', $social_item['group'] ) ) ); ?>"
							target="_blank"
							rel="noopener noreferrer"
						>
							<i class="<?php echo esc_attr( $social_item['icon'] ); ?>"></i>
						</a>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
		<?php
		return ob_get_clean();
	}
}
