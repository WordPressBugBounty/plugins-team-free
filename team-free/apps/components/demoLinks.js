/**
 * Where a layout's "View Demo" link goes: the live patterns page on the
 * product site, filtered to the layout's pattern slug (the same slug as its
 * Ready Patterns category).
 * Shared by the editor's Pro upgrade dialog and the dashboard Blocks page.
 */

export const DEMO_BASE_URL = 'https://getwpteam.com/patterns/';

/**
 * @param {string} [slug] Pattern slug: 'grid' | 'carousel' | 'carousel-3d'.
 * @return {string} Demo URL (the patterns page itself when there is no slug).
 */
export const generateDemoLink = (slug) =>
	slug ? `${DEMO_BASE_URL}?layout=${encodeURIComponent(slug)}` : DEMO_BASE_URL;
