<?php
/**
 * Member Skills block — server-rendered.
 *
 * A single-page builder field block: renders one member's skills as progress
 * bars or button/chips. Reuses the shared card skill markup
 * (`.sp-smart-team-card__skill*`) so the globally-bundled shared SCSS (3 bar
 * styles + percent visibility + chip) applies, and the skill dynamic-CSS twin
 * (Styles\Member_Skills) styles it under this block's #uniqueId.
 *
 * @package ShapedPlugin\WPTeam\Blocks\Types
 */

namespace ShapedPlugin\WPTeam\Blocks\Types\Member_Skills;

use ShapedPlugin\WPTeam\Blocks\Includes\AbstractBlock;
use ShapedPlugin\WPTeam\Blocks\Includes\MemberQuery;

defined( 'ABSPATH' ) || exit;

/**
 * Class Member_Skills
 */
class Member_Skills extends AbstractBlock {

	/**
	 * Set block properties.
	 *
	 * @return void
	 */
	protected function set_block_properties() {
		$this->block_name     = 'member-skills';
		$this->editor_scripts = array( 'sptp-blocks-editor' );
		$this->editor_styles  = array( 'sptp-blocks-editor' );
		// Declared as `style` so WP enqueues it in BOTH editor and frontend.
		$this->styles     = array( 'sptp-blocks-style' );
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
	 * Render a single skill: name, then track › fill › percentage (progress),
	 * or a name-only chip (button display). Markup twin of
	 * MemberLayoutBlock::render_skill().
	 *
	 * @param array  $skill         Normalized skill `{ name, percentage }`.
	 * @param string $display_style 'progress' | 'button'.
	 * @return void
	 */
	private function render_skill( $skill, $display_style ) {
		$width   = '' === $skill['percentage'] ? 0 : (float) $skill['percentage'];
		$has_pct = '' !== $skill['percentage'];
		$percent = $has_pct ? '<span class="sp-smart-team-card__skill-percentage">' . esc_html( $skill['percentage'] . '%' ) . '</span>' : '';

		if ( 'progress' !== $display_style ) {
			echo '<div class="sp-smart-team-card__skill sp-smart-team-card__skill--chip">'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo '<span class="sp-smart-team-card__skill-name">' . esc_html( $skill['name'] ) . '</span>';
			echo '</div>';
			return;
		}

		printf(
			'<div class="sp-smart-team-card__skill"><div class="sp-smart-team-card__skill-name">%1$s</div><div class="sp-smart-team-card__skill-track" data-title="%2$s%%"><div class="sp-smart-team-card__skill-fill" style="--sptp-skill-width:%2$s%%">%3$s</div></div></div>',
			esc_html( $skill['name'] ),
			esc_attr( $width ),
			$percent // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		);
	}

	/**
	 * Render the Member Skills block on the frontend.
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
		if ( empty( $member['skills'] ) ) {
			return '';
		}

		$display_style = ! empty( $attributes['skillsDisplayStyle'] ) ? sanitize_html_class( $attributes['skillsDisplayStyle'] ) : 'progress';
		$bar_style     = ! empty( $attributes['skillsProgressBarStyle'] ) ? sanitize_html_class( $attributes['skillsProgressBarStyle'] ) : 'style-2';
		$percent_vis   = ! empty( $attributes['skillsPercentVisibility'] ) ? sanitize_html_class( $attributes['skillsPercentVisibility'] ) : 'always';

		$skills_class = array(
			'sp-smart-team-card__skills',
			'sp-smart-team-card__skills--' . $display_style,
			'sp-smart-team-card__skills--percent-' . $percent_vis,
		);
		// The bar-style variant only applies to progress bars.
		if ( 'progress' === $display_style ) {
			$skills_class[] = 'sp-smart-team-card__skills--' . $bar_style;
			// Bars animate 0 → target when the list scrolls into view (classic
			// parity). The gate class is stamped next to the enqueue of the runtime
			// that reveals it, so a page without the script never shows bars stuck at
			// 0 — and the editor preview, which has no runtime, renders them full.
			$skills_class[] = 'sp-smart-team-card__skills--animate';
			wp_enqueue_script( 'sptp-blocks-frontend' );
		}

		$unique_id   = $attributes['uniqueId'] ?? '';
		$extra_class = $attributes['additionalCssClass'] ?? '';
		$align       = $attributes['align'] ?? '';

		$classes = array_filter(
			array(
				'sp-smart-team-member-skills',
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
			<div class="<?php echo esc_attr( implode( ' ', $skills_class ) ); ?>">
				<?php
				foreach ( $member['skills'] as $skill ) {
					$this->render_skill( $skill, $display_style );
				}
				?>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}
}
