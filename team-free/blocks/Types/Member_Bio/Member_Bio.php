<?php
/**
 * Member Bio block — server-rendered.
 *
 * A single-page builder field block: renders one member's short bio. On a
 * member single page it resolves the CURRENT queried member automatically; the
 * "Member" control (memberId) can pin a specific member (used for the editor
 * preview and as an explicit override elsewhere). Auto-discovered by
 * Blocks_Register.
 *
 * The bio is MemberQuery's `bio` field — the Short Bio member meta
 * (`_sptp_add_member[sptp_short_bio]`), stripped to plain text. The member's
 * post content is the separate Member Description block.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Member_Bio;

use ShapedPlugin\WPTeam\Blocks\Includes\AbstractBlock;
use ShapedPlugin\WPTeam\Blocks\Includes\MemberQuery;

defined( 'ABSPATH' ) || exit;

/**
 * Class Member_Bio
 */
class Member_Bio extends AbstractBlock {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name     = 'member-bio';
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
	 * Render the Member Bio block on the frontend. Markup twin of the `bio` case
	 * in MemberLayoutBlock::render_element() (short-bio source, unlimited length).
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
		if ( empty( $member['bio'] ) ) {
			return '';
		}

		$unique_id   = $attributes['uniqueId'] ?? '';
		$extra_class = $attributes['additionalCssClass'] ?? '';
		$align       = $attributes['align'] ?? '';

		$classes = array_filter(
			array(
				'sp-smart-team-member-bio',
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
			<p class="sp-smart-team-member-bio__text"><?php echo esc_html( $member['bio'] ); ?></p>
		</div>
		<?php
		return ob_get_clean();
	}
}
