<?php
/**
 * Member Description block — server-rendered.
 *
 * A single-page builder field block: renders one member's description. On a
 * member single page it resolves the CURRENT queried member automatically; the
 * "Member" control (memberId) can pin a specific member (used for the editor
 * preview and as an explicit override elsewhere). Auto-discovered by
 * Blocks_Register.
 *
 * The description is MemberQuery's `description` field — the member's post
 * content, stripped to plain text (the card's Bio Source → "Full Description").
 * The separate Short Bio field (`_sptp_add_member[sptp_short_bio]`) gets its own
 * block.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Member_Description;

use ShapedPlugin\WPTeam\Blocks\Includes\AbstractBlock;
use ShapedPlugin\WPTeam\Blocks\Includes\MemberQuery;

defined( 'ABSPATH' ) || exit;

/**
 * Class Member_Description
 */
class Member_Description extends AbstractBlock {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name     = 'member-description';
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
	 * Render the Member Description block on the frontend. Markup twin of the
	 * `bio` case in MemberLayoutBlock::render_element() (full-description source,
	 * unlimited length).
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

		// The member's own page asks for the password, like core's Post Content
		// block; anywhere else a protected body is simply left out.
		if ( post_password_required( $post ) ) {
			return ( is_singular( 'sptp_member' ) && get_queried_object_id() === $post->ID )
				? get_the_password_form( $post )
				: '';
		}

		$member = MemberQuery::get_member_data( $post );
		if ( empty( $member['description'] ) ) {
			return '';
		}

		$unique_id   = $attributes['uniqueId'] ?? '';
		$extra_class = $attributes['additionalCssClass'] ?? '';
		$align       = $attributes['align'] ?? '';

		$classes = array_filter(
			array(
				'sp-smart-team-member-description',
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
			<p class="sp-smart-team-member-description__text"><?php echo esc_html( $member['description'] ); ?></p>
		</div>
		<?php
		return ob_get_clean();
	}
}
