/**
 * Resolve image URL from a WP media attachment-shaped object.
 *
 * Ported from styble-pro so the shared MediaPicker component can resolve
 * preview URLs without depending on the styble plugin.
 *
 * @param {Object} image
 * @return {string}
 */
export function resolveLightboxIconImageUrl(image = {}) {
	if (!image || typeof image !== 'object') {
		return '';
	}

	if (typeof image.url === 'string' && image.url) {
		return image.url;
	}

	if (typeof image.source_url === 'string' && image.source_url) {
		return image.source_url;
	}

	const full = image.sizes?.full;
	if (full && typeof full.url === 'string' && full.url) {
		return full.url;
	}

	if (full && typeof full.source_url === 'string' && full.source_url) {
		return full.source_url;
	}

	return '';
}
