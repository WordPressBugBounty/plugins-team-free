import { __, sprintf } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useEffect, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { STORE_NAME } from '../store';
import { AI_VERIFY_KEY_ROUTE } from '../store/constants';
import AIProviderForm from './AIProviderForm.jsx';
import { InfoCircleIcon } from './AIProviderIcons.jsx';
import {
	AI_PROVIDERS,
	KEY_INVALID,
	KEY_NONE,
	KEY_UNKNOWN,
	KEY_UNVERIFIED,
	isProviderConnected,
	resolvePrimaryProvider,
} from './aiProviders';

/**
 * Settings → AI Configuration (the Create Team with AI module): one card per
 * provider and the connection form of the selected one. Port of
 * testimonial-pro's AI Settings v2. Build with AI selects the Primary first and
 * offers every other connected provider as a backup when it fails, so a lone
 * connected provider gets a nudge to add one.
 */
const AISettingsPanel = () => {
	const ai = useSelect((select) => select(STORE_NAME).getAISettings(), []);
	const { fetchAISettings } = useDispatch(STORE_NAME);

	// The bootstrap skips the WordPress Connectors probe (an outbound
	// model-list call); only this tab asks for it.
	useEffect(() => {
		fetchAISettings();
	}, [fetchAISettings]);

	// Verdicts reached by verify-key since the payload loaded, keyed by provider.
	const [verified, setVerified] = useState({});
	const [checkingProvider, setCheckingProvider] = useState('');

	const statusOf = (slug) => {
		const key = ai?.keys?.[slug];
		return verified[slug] || { state: key?.status || KEY_NONE, message: key?.message || '' };
	};
	const statuses = Object.fromEntries(AI_PROVIDERS.map(({ slug }) => [slug, statusOf(slug)]));
	const isConnected = (slug) => isProviderConnected(ai, statuses, slug);
	const primarySlug = resolvePrimaryProvider(ai, statuses);

	const [activeSlug, setActiveSlug] = useState('');
	const activeProvider =
		AI_PROVIDERS.find(({ slug }) => slug === (activeSlug || primarySlug)) || AI_PROVIDERS[0];

	// A save returns fresh verdicts, which outrank anything verified earlier.
	useEffect(() => {
		setVerified({});
	}, [ai]);

	const verifyStoredKey = useCallback(async (target) => {
		setCheckingProvider(target);
		try {
			const result = await apiFetch({
				path: AI_VERIFY_KEY_ROUTE,
				method: 'POST',
				data: { provider: target },
			});
			const status = result?.status;
			// A reply still "unknown" resolved nothing; recording it would re-arm the check forever.
			const resolved =
				status && KEY_UNKNOWN !== status.state
					? { state: status.state, message: status.message || '' }
					: { state: KEY_UNVERIFIED, message: status?.message || '' };
			setVerified((prev) => ({ ...prev, [target]: resolved }));
		} catch (error) {
			setVerified((prev) => ({ ...prev, [target]: { state: KEY_UNVERIFIED, message: '' } }));
		} finally {
			setCheckingProvider('');
		}
	}, []);

	// A stored key nobody has checked (or whose check went stale) is verified on demand.
	const activeState = statuses[activeProvider.slug].state;
	useEffect(() => {
		if (!ai || KEY_UNKNOWN !== activeState || checkingProvider) {
			return;
		}
		verifyStoredKey(activeProvider.slug);
	}, [ai, activeProvider.slug, activeState, checkingProvider, verifyStoredKey]);

	if (null === ai) {
		return null;
	}

	const connectedCount = AI_PROVIDERS.filter(({ slug }) => isConnected(slug)).length;
	const primaryProvider = AI_PROVIDERS.find(({ slug }) => slug === primarySlug);

	const cardStatus = (slug) => {
		if (isConnected(slug)) {
			return { tone: 'is-connected', label: __('Connected', 'team-free') };
		}
		if (ai.keys?.[slug]?.has_key && KEY_INVALID === statuses[slug].state) {
			return { tone: 'is-invalid', label: __('Invalid key', 'team-free') };
		}
		return { tone: '', label: __('Not set up', 'team-free') };
	};

	return (
		<div className="sptp-settings-panel sptp-ai-config">
			{false === ai.ai_enabled && (
				<div className="sptp-ai-config__notice">
					{__(
						'AI features are disabled on this site, so team layout generation will not run. Re-enable AI support in WordPress to use it.',
						'team-free'
					)}
				</div>
			)}

			<div className="sptp-ai-config__head">
				<div className="sptp-ai-config__heading">
					<h3 className="sptp-ai-config__title">{__('AI Providers', 'team-free')}</h3>
					<p className="sptp-ai-config__desc">
						{__('Configure your AI providers.', 'team-free')}
					</p>
				</div>
				<span className="sptp-ai-config__count">
					{sprintf(
						/* translators: 1: number of connected AI providers, 2: number of AI providers */
						__('%1$d of %2$d ready', 'team-free'),
						connectedCount,
						AI_PROVIDERS.length
					)}
				</span>
			</div>

			<div className="sptp-ai-config__providers">
				{AI_PROVIDERS.map(({ slug, label, Icon }) => {
					const isActive = slug === activeProvider.slug;
					const { tone, label: statusLabel } = cardStatus(slug);
					return (
						<button
							key={slug}
							type="button"
							aria-pressed={isActive}
							className={`sptp-ai-config__provider${isActive ? ' is-active' : ''}`}
							onClick={() => setActiveSlug(slug)}
						>
							<span className="sptp-ai-config__provider-icon">
								<Icon />
							</span>
							<span className="sptp-ai-config__provider-label">{label}</span>
							<span className={`sptp-ai-config__provider-status ${tone}`}>
								{statusLabel}
							</span>
							{slug === primarySlug && (
								<span className="sptp-ai-config__provider-badge">
									{__('Primary', 'team-free')}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{1 === connectedCount && primaryProvider && (
				<p className="sptp-ai-config__backup-hint">
					<InfoCircleIcon />
					{sprintf(
						/* translators: %s: AI provider name */
						__(
							'Add a backup provider so building keeps working if %s reaches its limit.',
							'team-free'
						),
						primaryProvider.name
					)}
				</p>
			)}

			<AIProviderForm
				key={activeProvider.slug}
				provider={activeProvider}
				ai={ai}
				status={statuses[activeProvider.slug]}
				isChecking={activeProvider.slug === checkingProvider}
				isConnected={isConnected(activeProvider.slug)}
				primarySlug={primarySlug}
			/>
		</div>
	);
};

export default AISettingsPanel;
