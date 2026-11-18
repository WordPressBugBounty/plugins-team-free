import { __ } from '@wordpress/i18n';
import { AnthropicIcon, GeminiIcon, GroqIcon, OpenAIIcon } from './AIProviderIcons.jsx';

/**
 * Provider cards on Settings → AI Configuration, in display order. Slugs match
 * AIKeyManager::PROVIDERS.
 */
export const AI_PROVIDERS = [
	{
		slug: 'anthropic',
		label: __('Anthropic (Claude)', 'team-free'),
		name: 'Anthropic',
		Icon: AnthropicIcon,
		keyUrl: 'https://console.anthropic.com/settings/keys',
	},
	{
		slug: 'gemini',
		label: __('Google Gemini', 'team-free'),
		name: 'Gemini',
		Icon: GeminiIcon,
		keyUrl: 'https://aistudio.google.com/apikey',
	},
	{
		slug: 'openai',
		label: __('OpenAI (ChatGPT)', 'team-free'),
		name: 'OpenAI',
		Icon: OpenAIIcon,
		keyUrl: 'https://platform.openai.com/api-keys',
	},
	{
		slug: 'groq',
		label: __('Groq', 'team-free'),
		name: 'Groq',
		Icon: GroqIcon,
		keyUrl: 'https://console.groq.com/keys',
	},
];

// Verdicts, as AIKeyValidator reports them.
export const KEY_VALID = 'valid';
export const KEY_INVALID = 'invalid';
export const KEY_UNVERIFIED = 'unverified';
export const KEY_UNKNOWN = 'unknown';
export const KEY_NONE = 'none';
export const KEY_EMPTY = 'empty';
export const KEY_FAILED = 'failed';

/**
 * Whether a provider can serve a request the way
 * AIKeyManager::connected_providers_in_order() decides it: WordPress Connectors
 * serves it, or a stored key the provider has not refused.
 *
 * @param {Object} ai       `apiData.ai`.
 * @param {Object} statuses Provider → {state} verdicts, overriding `ai.keys`.
 * @param {string} slug     Provider slug.
 * @return {boolean} Connected.
 */
export const isProviderConnected = (ai, statuses, slug) => {
	const key = ai?.keys?.[slug];
	const state = statuses?.[slug]?.state || key?.status;
	return (
		Boolean(ai?.connectors?.[slug]?.connected) ||
		(Boolean(key?.has_key) && KEY_INVALID !== state)
	);
};

/**
 * The provider a request tries first: the stored Primary while it is
 * connected, else the first connected one in the server's order.
 *
 * @param {Object} ai       `apiData.ai`.
 * @param {Object} statuses Provider → {state} verdicts, overriding `ai.keys`.
 * @return {string} Provider slug, or '' when nothing is connected.
 */
export const resolvePrimaryProvider = (ai, statuses) => {
	const isConnected = (slug) => isProviderConnected(ai, statuses, slug);
	if (ai?.provider && isConnected(ai.provider)) {
		return ai.provider;
	}
	return (ai?.provider_order || AI_PROVIDERS.map(({ slug }) => slug)).find(isConnected) || '';
};
