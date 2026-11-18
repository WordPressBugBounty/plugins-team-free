/**
 * AI Team Builder availability in the block editor.
 *
 * PHP localizes one flag (`AssetManager::localize_ai_builder`) that folds the
 * "Create Team with AI" module toggle and the site's own AI support together,
 * so every entry point reads the answer `sptp/v1/ai-generate` enforces.
 */

import { __, sprintf } from '@wordpress/i18n';

export const AI_GENERATE_PATH = '/sptp/v1/ai-generate';

// Model catalog per provider — mirrors AIKeyManager::PROVIDER_MODELS; the first entry is the default.
const AI_MODELS = {
	openai: [
		{ value: 'gpt-5.6-terra', label: 'GPT-5.6 Terra' },
		{ value: 'gpt-5.6-sol', label: 'GPT-5.6 Sol' },
		{ value: 'gpt-5.6-luna', label: 'GPT-5.6 Luna' },
	],
	anthropic: [
		{ value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
		{ value: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
	],
	gemini: [
		{ value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
		{ value: 'gemini-pro-latest', label: 'Gemini Pro' },
	],
	groq: [
		{ value: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B' },
		{ value: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B' },
		{ value: 'qwen/qwen3.8-27b', label: 'Qwen3.8 27B' },
	],
};

/**
 * Connected providers the modal offers, Primary first — `{ slug, label, model }`.
 *
 * @return {Array} Providers.
 */
export function getAIProviders() {
	return window.sptpAIBuilder?.settings?.providers || [];
}

/**
 * Model options for a provider row, the default one marked; a stored model
 * missing from the catalog is kept so the select never drops it.
 *
 * @param {?Object} provider Row of getAIProviders().
 * @return {Array} `{ value, label }` options.
 */
export function getAIModelOptions(provider) {
	if (!provider) {
		return [];
	}
	const catalog = AI_MODELS[provider.slug] || [];
	const options = catalog.map(({ value, label }, index) => ({
		value,
		/* translators: %s: AI model name */
		label: 0 === index ? sprintf(__('%s (Recommended)', 'team-free'), label) : label,
	}));
	if (provider.model && !options.some(({ value }) => value === provider.model)) {
		options.unshift({ value: provider.model, label: provider.model });
	}
	return options;
}

/**
 * Whether the AI Team Builder may be offered. A missing payload means off —
 * the flag always ships when the feature is live.
 *
 * @return {boolean} True when the module is on and the site allows AI.
 */
export function isAIBuilderEnabled() {
	return typeof window !== 'undefined' && Boolean(window.sptpAIBuilder?.enabled);
}

/**
 * Public AI settings (provider, whether a usable key exists) — never a key.
 *
 * @return {Object} Settings.
 */
export function getAISettings() {
	return window.sptpAIBuilder?.settings || {};
}

/**
 * Dashboard deep link to the AI settings tab.
 *
 * @return {string} URL.
 */
export function getAISettingsUrl() {
	return window.sptpAIBuilder?.settingsUrl || '';
}

/**
 * Layout blocks the builder may target on this site: the free Grid and
 * Carousel (3D Carousel is Pro), minus any the dashboard Blocks page switched off.
 *
 * @return {string[]} Block names.
 */
export function getInsertableLayoutBlocks() {
	const managed = window.sptpBlocksEditor?.toggleManagedBlocks || [];
	const active = window.sptpBlocksEditor?.activeBlockList || [];

	return ['sptp/carousel', 'sptp/grid'].filter(
		(name) => !managed.includes(name) || active.includes(name)
	);
}
