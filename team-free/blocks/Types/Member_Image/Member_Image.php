<?php
/**
 * Member Image block — server-rendered.
 *
 * A single-page builder field block: renders one member's photo. On a member
 * single page it resolves the CURRENT queried member automatically; the
 * "Member" control (memberId) can pin a specific member (used for the editor
 * preview and as an explicit override elsewhere). Auto-discovered by
 * Blocks_Register.
 *
 * The markup reuses the shared card avatar classes
 * (`.sp-smart-team-card__avatar` / `__image-wrap` / `__image`) so the globally
 * bundled shared SCSS — aspect-ratio modifiers, hover effects, photo clipping —
 * applies unchanged, while Styles\Member_Image scopes the dynamic values under
 * this block's #uniqueId.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Member_Image;

use ShapedPlugin\WPTeam\Blocks\Includes\AbstractBlock;
use ShapedPlugin\WPTeam\Blocks\Includes\MemberQuery;
use ShapedPlugin\WPTeam\Blocks\Includes\Pro_Gate;

defined( 'ABSPATH' ) || exit;

/**
 * Class Member_Image
 */
class Member_Image extends AbstractBlock {

	/**
	 * Aspect Ratio values offered by the inspector. `original` keeps the photo's
	 * natural height; `custom` drops the ratio so the Width/Height control alone
	 * sizes the box. Both map to a `--ratio-*` modifier class in the shared SCSS.
	 *
	 * @var string[]
	 */
	private $allowed_ratios = array( 'original', '1-1', '4-3', '3-4', '3-2', '2-3', '16-9', '9-16', 'custom' );

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name     = 'member-image';
		$this->editor_scripts = array( 'sptp-blocks-editor' );
		$this->editor_styles  = array( 'sptp-blocks-editor' );
		// Declared as `style` so WP enqueues it in BOTH editor and frontend.
		$this->styles     = array( 'sptp-blocks-style' );
		$this->is_dynamic = true;
	}

	/**
	 * Resolve which member to render.
	 *
	 * Priority: an explicit `memberId` attribute → the `sptp/memberId` block
	 * context (a future Single Member wrapper) → the current queried post (the
	 * member whose single page we are on).
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
	 * Build the 2x `srcset` for the Retina toggle — the next registered size up
	 * from the chosen resolution. Twin of MemberLayoutBlock::render_image().
	 *
	 * @param array  $thumbnails Resolution → URL map from MemberQuery.
	 * @param string $resolution Chosen resolution key.
	 * @param string $src        The 1x URL.
	 * @return string
	 */
	private function retina_srcset( $thumbnails, $resolution, $src ) {
		$retina_map = array(
			'thumbnail'    => 'medium',
			'medium'       => 'large',
			'medium_large' => 'large',
			'large'        => 'full',
			'full'         => 'full',
		);
		$retina_key = $retina_map[ $resolution ] ?? 'full';
		$retina_src = $thumbnails[ $retina_key ] ?? '';

		return $retina_src ? $src . ' 1x, ' . $retina_src . ' 2x' : '';
	}

	/**
	 * Render the Member Image block on the frontend.
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
		if ( empty( $member['avatar'] ) ) {
			return '';
		}

		$thumbnails = ! empty( $member['thumbnails'] ) && is_array( $member['thumbnails'] ) ? $member['thumbnails'] : array();
		$resolution = isset( $attributes['imageResolution'] ) ? sanitize_key( $attributes['imageResolution'] ) : 'full';
		$src        = $thumbnails[ $resolution ] ?? $member['avatar'];

		$srcset = ! empty( $attributes['imageRetina'] ) ? $this->retina_srcset( $thumbnails, $resolution, $src ) : '';

		$aspect = isset( $attributes['imageAspectRatio'] ) ? sanitize_html_class( $attributes['imageAspectRatio'] ) : '1-1';
		$aspect = in_array( $aspect, $this->allowed_ratios, true ) ? $aspect : '1-1';

		// A Pro hover effect renders as none (Pro_Gate::image_hover_effect()).
		$effect = Pro_Gate::image_hover_effect( $attributes['imageHoverEffect'] ?? 'none' );

		$avatar_classes = array(
			'sp-smart-team-card__avatar',
			'sp-smart-team-card__avatar--ratio-' . $aspect,
		);
		if ( 'none' !== $effect ) {
			$avatar_classes[] = 'sp-smart-team-card__avatar--effect-' . $effect;
		}

		$loading = ! empty( $attributes['imageLazyLoad'] ) ? 'lazy' : 'eager';

		$unique_id   = $attributes['uniqueId'] ?? '';
		$extra_class = $attributes['additionalCssClass'] ?? '';
		$align       = $attributes['align'] ?? '';

		$classes = array_filter(
			array(
				'sp-smart-team-member-image',
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
			<div class="<?php echo esc_attr( implode( ' ', $avatar_classes ) ); ?>">
				<div class="sp-smart-team-card__image-wrap">
					<img
						class="sp-smart-team-card__image"
						src="<?php echo esc_url( $src ); ?>"
						<?php
						if ( $srcset ) :
							?>
							srcset="<?php echo esc_attr( $srcset ); ?>"<?php endif; ?>
						alt="<?php echo esc_attr( $member['alt'] ); ?>"
						loading="<?php echo esc_attr( $loading ); ?>"
					/>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}
}
