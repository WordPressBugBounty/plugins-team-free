/**
 * Shared editor placeholders.
 *
 * The single-page builder image blocks preview with these instead of a real
 * member's media: they are built on the Member Details Page template, where the
 * member varies per request, so any one member's images are arbitrary — and
 * often missing, which leaves the layout controls impossible to judge. The
 * frontend always renders the queried member's real media.
 *
 * TWO placeholders, because the two subjects are not interchangeable:
 *
 * - `PLACEHOLDER_IMAGE_SRC` — a member PHOTO (square, person motif). Used by
 *   Member Image and by the Member Photo Gallery's tiles.
 * - `VIDEO_PLACEHOLDER_IMAGE_SRC` — a video POSTER (play motif). Used by Member
 *   Video, where the person motif read as a photo block.
 *
 * Both are inlined as data URIs so a preview needs no asset request and no
 * plugin-URL global, and both carry an intrinsic size so they behave like real
 * media under the Aspect Ratio / object-fit rules.
 */

const PLACEHOLDER_SVG = `<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)"><path d="M0 0h300v300H0z" fill="#edf3f7"/><path d="m219.062 102.263.262-8.566c-.099-41.655-24.292-65.879-62.472-68.453-33.272-2.238-58.329 11.075-69.76 33.254-3.845 7.458-6.034 16.795-6.862 26.934a69.3 69.3 0 0 0-2.019 16.459h.135c-.1.136-.198.136-.262.165-4.873.872-7.09 11.339-4.936 23.416 1.954 11.075 6.926 19.676 11.501 20.305 5.836 15.795 15.014 31.145 26.41 42.356 6.43 6.357 13.59 11.376 21.211 14.458 5.233 2.073 10.708 3.246 16.303 3.246s11.069-1.173 16.303-3.246c7.89-3.175 15.276-8.43 21.87-15.122 11.105-11.212 20.085-26.298 25.786-41.82 4.377-1.302 8.98-9.603 10.871-20.177 1.99-11.54.064-21.55-4.341-23.216zm-7.394 24.76c-1.027 5.856-3.314 10.704-5.701 12.784-.963.801-1.955 1.209-2.918 1.037-.531-.064-1.027-.336-1.459-.772-5.269 16.559-15.311 33.09-28.003 43.092-7.556 5.992-16.076 9.667-25.057 9.667-8.781 0-17.131-3.511-24.554-9.266-12.925-9.974-23.165-26.698-28.498-43.493-.432.4-.928.672-1.46.736-1.09.2-2.251-.336-3.349-1.473-2.252-2.273-4.278-6.828-5.27-12.312-.063-.365-.098-.701-.162-1.072q.054-5.628.467-11.24c.496-1.409 1.091-2.51 1.92-3.11a2.4 2.4 0 0 1 1.126-.472c.892-.165 1.855.2 2.783.937v-.236c.333-3.111 4.476-30.48 30.524-28.035 0 0 22.869 8.501 43.676 1q3.216-.096 6.431 0c8.619.337 14.518 4.848 20.715 7.73-.234-2.875-2.422-5.785-2.323-7.73.96.278 1.882.672 2.748 1.173 4.441 4.784 8.747 12.813 12.196 25.933v.165l.099-.101c.892-.7 1.82-1.036 2.719-.872.234.036.432.1.666.2 2.819 1.373 4.044 8.101 2.684 15.73M293 300H7c.56-12.585 2.629-26.126 6.162-38.208l.793-2.674 1.09-3.346a.44.44 0 0 0-.063.2c.063-.136.099-.265.163-.401l.063-.164v-.071c16.275-43.894 41.757-45.638 47.557-47.004 12.359-2.91 27.31-1.673 35.298-4.183.927 7.894 23.725 33.927 38.64 50.221l6.36-25.26c-4.773-2.91-5.8-9.231-5.8-14.522h24.525c0 5.32-1.027 11.712-5.935 14.586l6.466 25.189c14.944-16.295 37.713-42.32 38.641-50.221 7.989 2.51 22.967 1.273 35.29 4.183 5.801 1.373 31.254 3.081 47.522 46.839l1.296 3.611v.035c.035.101.064.165.064.265l.765 2.674c2.917 10.603 5.332 21.75 6.565 32.689.272 1.482.531 5.555.531 5.555z" fill="#a9becd"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h300v300H0z"/></clipPath></defs></svg>`;

// Video poster placeholder — a video/play motif in the same palette and at the
// same square intrinsic size as the photo placeholder above, so the poster reads
// as a VIDEO rather than as a member photo.
const VIDEO_PLACEHOLDER_SVG = `<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)"><path fill="#edf3f7" d="M0 0h300v300H0z"/><path d="M171.05 100c6.305 0 11.417 5.111 11.417 11.417v20.023l30.185-12.771a4.564 4.564 0 0 1 6.348 4.205v55.216a4.56 4.56 0 0 1-3.917 4.52 4.56 4.56 0 0 1-2.143-.205l-30.473-10.559v17.204c0 6.305-5.112 11.417-11.417 11.417H93.417C87.11 200.467 82 195.355 82 189.05v-77.633C82 105.111 87.111 100 93.417 100zm-43.383 30.743a9.13 9.13 0 0 0-7.91 4.566 9.13 9.13 0 0 0-1.224 4.567V160.6a9.13 9.13 0 0 0 4.571 7.902 9.13 9.13 0 0 0 9.129-.002l17.961-10.362a9.13 9.13 0 0 0 3.343-12.476 9.15 9.15 0 0 0-3.343-3.343l-.005.005-17.956-10.357a9.1 9.1 0 0 0-4.566-1.224" fill="#a9becd"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h300v300H0z"/></clipPath></defs></svg>`;

export const PLACEHOLDER_IMAGE_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
	PLACEHOLDER_SVG
)}`;

export const VIDEO_PLACEHOLDER_IMAGE_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
	VIDEO_PLACEHOLDER_SVG
)}`;

export default PLACEHOLDER_IMAGE_SRC;
