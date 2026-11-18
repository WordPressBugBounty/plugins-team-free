<?php
/**
 * Member Name block — server-rendered.
 *
 * A single-page builder field block: renders one member's name. On a member
 * single page it resolves the CURRENT queried member automatically; the
 * "Member" control (memberId) can pin a specific member (used for the editor
 * preview and as an explicit override anywhere else). Auto-discovered by
 * Blocks_Register.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Member_Name;

use ShapedPlugin\WPTeam\Blocks\Includes\AbstractBlock;
use ShapedPlugin\WPTeam\Blocks\Includes\MemberQuery;

defined( 'ABSPATH' ) || exit;

/**
 * Class Member_Name
 */
class Member_Name extends AbstractBlock {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name     = 'member-name';
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
	 * Render the Member Name block on the frontend.
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
		if ( empty( $member['name'] ) ) {
			return '';
		}

		// HTML tag for the name — whitelisted.
		$tag          = $attributes['nameTag'] ?? 'h2';
		$allowed_tags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span' );
		$tag          = in_array( $tag, $allowed_tags, true ) ? $tag : 'h2';

		$unique_id   = $attributes['uniqueId'] ?? '';
		$extra_class = $attributes['additionalCssClass'] ?? '';
		$align       = $attributes['align'] ?? '';

		$classes = array_filter(
			array(
				'sp-smart-team-member-name',
				'' !== $align ? 'align' . $align : '',
				$extra_class,
			)
		);
		// Always the uniqueId — dynamic CSS anchors to it; the Advanced Custom
		// CSS ID is added as an outer wrapper by render_block_callback().
		$html_id = $unique_id;

		ob_start();
		?>
		<div
			<?php
			if ( $html_id ) :
				?>
				id="<?php echo esc_attr( $html_id ); ?>"<?php endif; ?>
			class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
		>
			<?php
			printf(
				'<%1$s class="sp-smart-team-member-name__text">%2$s</%1$s>',
				tag_escape( $tag ),
				esc_html( $member['name'] )
			);
			?>
		</div>
		<?php
		return ob_get_clean();
	}
}
