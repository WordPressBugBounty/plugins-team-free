/**
 * AI Team Builder deep link — shared by the dashboard (which builds the link)
 * and the editor (which consumes it).
 *
 * `post-new.php?post_type=page&sptp_ai_builder` opens a new page with the
 * AI Team Builder modal already open. Kept free of editor-only imports so the
 * dashboard bundle can import it.
 */

export const AI_BUILDER_QUERY_PARAM = 'sptp_ai_builder';

export const AI_BUILDER_EDITOR_PATH = 'post-new.php?post_type=page';

/**
 * @param {string} adminUrl Admin base URL as WordPress localizes it (`admin_url()`).
 * @return {string} Editor URL.
 */
export function buildAIBuilderEditorUrl(adminUrl) {
	return `${String(adminUrl || '').replace(/\/+$/, '')}/${AI_BUILDER_EDITOR_PATH}&${AI_BUILDER_QUERY_PARAM}`;
}
