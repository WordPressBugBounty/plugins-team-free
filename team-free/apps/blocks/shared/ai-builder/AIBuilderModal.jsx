import { __, sprintf } from '@wordpress/i18n';
import { useState, useEffect, createInterpolateElement } from '@wordpress/element';
import { Modal, Button, Notice } from '@wordpress/components';
import { Icon, closeSmall } from '@wordpress/icons';
import { dispatch, useDispatch, useSelect } from '@wordpress/data';
import { createBlock, getBlockType } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';
import useAIGenerator from './useAIGenerator';
import BrandMarkIcon from './BrandMarkIcon';
import StarterPillsRail from './StarterPillsRail';
import { applyColumnOverride, findLayoutBlock } from './columnOverride';
import { buildAttributeUpdate } from './applyGenerated';
import {
	getAIModelOptions,
	getAIProviders,
	getAISettings,
	getAISettingsUrl,
	getInsertableLayoutBlocks,
} from './constants';
import { insertPattern } from '../ready-patterns/insertPattern';
import './ai-builder.scss';

// Cycled while a request is in flight, purely for perceived progress — the API
// reports no real steps. Holds on the last label rather than completing, so it
// never claims a request finished before it did.
const PROGRESS_STEP_LABELS = [
	__('Reading your prompt', 'team-free'),
	__('Choosing a layout', 'team-free'),
	__('Composing the cards', 'team-free'),
	__('Applying styles', 'team-free'),
];
const PROGRESS_STEP_INTERVAL_MS = 1400;

// Keyed by AIErrorMessages::failure_reason(); shown when another connected provider can take over.
const FAILURE_NOTICES = {
	/* translators: 1: AI provider that failed, 2: AI provider to continue with. */
	limit: __(
		'<strong>%1$s</strong> reached its limit before finishing. Continue with <strong>%2$s</strong> to get your result.',
		'team-free'
	),
	/* translators: 1: AI provider that failed, 2: AI provider to continue with. */
	incomplete: __(
		'<strong>%1$s</strong> returned an incomplete answer. Continue with <strong>%2$s</strong> to get your result.',
		'team-free'
	),
	/* translators: 1: AI provider that failed, 2: AI provider to continue with. */
	timeout: __(
		'<strong>%1$s</strong> took too long to respond. Continue with <strong>%2$s</strong> to get your result.',
		'team-free'
	),
	/* translators: 1: AI provider that failed, 2: AI provider to continue with. */
	auth: __(
		'<strong>%1$s</strong> rejected the saved API key. Continue with <strong>%2$s</strong> to get your result.',
		'team-free'
	),
	/* translators: 1: AI provider that failed, 2: AI provider to continue with. */
	error: __(
		"<strong>%1$s</strong> couldn't finish this request. Continue with <strong>%2$s</strong> to get your result.",
		'team-free'
	),
};

// Suffix on a failed provider's option in the footer select.
const FAILURE_TAGS = {
	limit: __('Limit reached', 'team-free'),
	incomplete: __('Incomplete answer', 'team-free'),
	timeout: __('Timed out', 'team-free'),
	auth: __('Key rejected', 'team-free'),
	error: __('Failed', 'team-free'),
};

// The Columns control's upper bound per layout block.
const columnMax = (name) => ('sptp/carousel' === name ? 8 : 6);

export default function AIBuilderModal({
	isOpen,
	onClose,
	targetClientId = null,
	requestedBlockName = null,
	isRefining = false,
}) {
	const [prompt, setPrompt] = useState('');
	const [blockName, setBlockName] = useState(requestedBlockName || 'sptp/grid');
	const [provider, setProvider] = useState('');
	const [model, setModel] = useState('');
	const [applying, setApplying] = useState(false);
	const [progressStep, setProgressStep] = useState(0);
	const { generate, cancel, reset, loading, error, setError, failure, clearFailure, failures } =
		useAIGenerator();

	useEffect(() => {
		if (!loading) {
			setProgressStep(0);
			return undefined;
		}

		const timer = setInterval(() => {
			setProgressStep((step) => Math.min(step + 1, PROGRESS_STEP_LABELS.length - 1));
		}, PROGRESS_STEP_INTERVAL_MS);

		return () => clearInterval(timer);
	}, [loading]);

	// The host keeps the modal mounted, so each open starts from a clean slate.
	useEffect(() => {
		if (!isOpen) {
			return;
		}
		setPrompt('');
		reset();
		const firstProvider = getAIProviders()[0];
		setProvider(firstProvider?.slug || '');
		setModel(firstProvider?.model || '');
		const insertable = getInsertableLayoutBlocks();
		setBlockName(
			requestedBlockName && (targetClientId || insertable.includes(requestedBlockName))
				? requestedBlockName
				: insertable[0] || 'sptp/grid'
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, requestedBlockName, targetClientId]);

	const { insertBlock, updateBlockAttributes, selectBlock, clearSelectedBlock } =
		useDispatch(blockEditorStore);
	const { getBlockAttributes, getBlock } = useSelect((select) => select(blockEditorStore), []);

	if (!isOpen) {
		return null;
	}

	const aiSettings = getAISettings();
	const providers = getAIProviders();
	const activeProvider = providers.find(({ slug }) => slug === provider);
	const modelOptions = getAIModelOptions(activeProvider);
	// The next connected provider, Primary first, that has not failed yet.
	const fallbackProvider = failure ? providers.find(({ slug }) => !failures[slug]) : null;
	const failedLabel =
		providers.find(({ slug }) => slug === failure?.provider)?.label || failure?.label || '';
	const fallbackNotice = FAILURE_NOTICES[failure?.reason] || FAILURE_NOTICES.error;

	const handleSelectProvider = (slug) => {
		setProvider(slug);
		setModel(providers.find((item) => item.slug === slug)?.model || '');
		clearFailure();
	};

	/**
	 * Fill the prompt from a starter, steering the target block toward the one
	 * the starter was written for — unless a block is already open for editing.
	 *
	 * @param {Object} item Starter entry.
	 */
	const handleSelectPrompt = (item) => {
		setPrompt(item.prompt);
		if (!targetClientId && item.blockName) {
			setBlockName(item.blockName);
		}
	};

	/**
	 * Insert the Ready Pattern the AI matched. Resolves false — rather than
	 * reporting an error — when the pattern cannot be used here, so the caller
	 * can still answer the prompt with generated attributes.
	 *
	 * @param {Object} pattern Manifest item from the AI response.
	 * @return {Promise<boolean>} True when the pattern reached the canvas.
	 */
	const applyMatchedPattern = async (pattern) => {
		// With no target, insertPattern() falls back to the selected Smart Team
		// block and would replace it — "Create" must add a new one instead.
		if (!targetClientId) {
			clearSelectedBlock();
		}

		try {
			const result = await insertPattern({
				patternId: pattern.id,
				patternName: pattern.name,
				requestedClientId: targetClientId,
			});

			if (!result?.success) {
				return false;
			}

			const layout = findLayoutBlock(getBlock(result.focusClientId));
			if (layout) {
				const patched = applyColumnOverride(layout.attributes, prompt, {
					max: columnMax(layout.name),
				});
				if (patched !== layout.attributes) {
					updateBlockAttributes(layout.clientId, { columns: patched.columns });
				}
			}

			dispatch('core/notices').createSuccessNotice(
				sprintf(
					/* translators: %s: pattern name */
					__('AI matched a ready-made layout: “%s”.', 'team-free'),
					pattern.name
				),
				{ type: 'snackbar' }
			);

			return true;
		} catch (insertError) {
			return false;
		}
	};

	/**
	 * Apply a generated configuration to the target block, or insert a new one.
	 *
	 * The server may answer on a different block than the modal opened with
	 * (a prompt asking for a slider is built on the carousel); a fresh insert
	 * follows it, since every generated value was validated for that block.
	 *
	 * @param {Object} response Attribute-mode response.
	 */
	const applyGeneratedAttributes = (response) => {
		const current = targetClientId ? getBlockAttributes(targetClientId) : null;
		const targetName = targetClientId ? getBlock(targetClientId)?.name || blockName : null;
		const insertable = getInsertableLayoutBlocks();
		let resolvedName = blockName;
		if (
			response.blockName &&
			insertable.includes(response.blockName) &&
			getBlockType(response.blockName)
		) {
			resolvedName = response.blockName;
		} else if (!insertable.includes(resolvedName)) {
			resolvedName = insertable[0] || resolvedName;
		}
		const effectiveName = targetName || resolvedName;

		const update = applyColumnOverride(
			buildAttributeUpdate({
				blockName: effectiveName,
				attributes: response.attributes || {},
				changed: response.changed || [],
				current,
			}),
			prompt,
			{
				fallback:
					current?.columns || getBlockType(effectiveName)?.attributes?.columns?.default,
				max: columnMax(effectiveName),
			}
		);

		if (targetClientId) {
			updateBlockAttributes(targetClientId, update);
			selectBlock(targetClientId);
			return;
		}

		const newBlock = createBlock(resolvedName, update);
		insertBlock(newBlock);
		selectBlock(newBlock.clientId);
	};

	/**
	 * Tell the user when a request fell back to generated settings because the
	 * model declined every shortlisted pattern.
	 *
	 * @param {string} [reason] The model's stated reason, or empty.
	 */
	const announcePatternDecline = (reason) => {
		if (!reason) {
			return;
		}

		const noticeId = `sptp-ai-pattern-decline-${Date.now()}`;
		dispatch('core/notices').createInfoNotice(
			sprintf(
				/* translators: %s: the model's reason for not picking a ready-made layout */
				__(
					'No ready-made layout covered everything you asked for (%s), so this block was configured from scratch instead.',
					'team-free'
				),
				reason
			),
			{ id: noticeId, isDismissible: true }
		);
		setTimeout(() => dispatch('core/notices').removeNotice(noticeId), 4500);
	};

	/**
	 * Send the prompt, to the footer's provider unless another is named.
	 *
	 * @param {Object} [override]          Provider to use instead of the footer's.
	 * @param {string} [override.provider] Provider slug.
	 * @param {string} [override.model]    Model of that provider.
	 */
	const handleGenerate = async (override = {}) => {
		const target = {
			provider: override.provider ?? provider,
			model: override.model ?? model,
		};

		if (!prompt.trim()) {
			setError(__('Describe the team layout you want to create.', 'team-free'));
			return;
		}

		const existingAttributes = targetClientId ? getBlockAttributes(targetClientId) || {} : {};
		// "Refine" adjusts what is there: a pattern would replace the block
		// wholesale, so a refine never lets pattern matching run.
		const response = await generate({
			prompt,
			blockName,
			existingAttributes,
			allowPatterns: !isRefining,
			...target,
		});

		if (!response) {
			return;
		}

		setApplying(true);

		try {
			if ('pattern' === response.mode) {
				if (await applyMatchedPattern(response.pattern)) {
					onClose();
					return;
				}

				// The matched pattern is unusable here — build from attributes instead.
				const fallback = await generate({
					prompt,
					blockName,
					existingAttributes,
					allowPatterns: false,
					...target,
				});
				if (!fallback) {
					setError(
						__(
							'The matched layout could not be applied, and generating a configuration failed too. Please try again or rephrase your prompt.',
							'team-free'
						)
					);
					return;
				}

				applyGeneratedAttributes(fallback);
				onClose();
				return;
			}

			applyGeneratedAttributes(response);
			announcePatternDecline(response.patternDeclineReason);
			onClose();
		} finally {
			setApplying(false);
		}
	};

	const handleContinue = () => {
		setProvider(fallbackProvider.slug);
		setModel(fallbackProvider.model || '');
		handleGenerate({ provider: fallbackProvider.slug, model: fallbackProvider.model || '' });
	};

	const hasProvider = providers.length > 0;
	const isAiEnabled = false !== aiSettings.ai_enabled;
	const isBusy = loading || applying;

	let generateButtonLabel = __('Build Team Showcase', 'team-free');
	if (loading) {
		generateButtonLabel = PROGRESS_STEP_LABELS[progressStep] + '…';
	} else if (applying) {
		generateButtonLabel = __('Applying…', 'team-free');
	} else if (targetClientId && isRefining) {
		generateButtonLabel = __('Update Block with AI', 'team-free');
	}

	let progressPct = 0;
	if (loading) {
		progressPct = Math.round((progressStep / PROGRESS_STEP_LABELS.length) * 100);
	} else if (applying) {
		progressPct = 100;
	}

	const handleClose = () => {
		cancel();
		onClose();
	};

	const connectNotice = createInterpolateElement(
		aiSettings.connectors_url
			? __(
					'Connect an AI provider to start building. Set it up in <strong>Smart Team › Settings ›</strong> <link>AI Configuration</link> or use <connectors>WordPress Connectors</connectors>.',
					'team-free'
				)
			: __(
					'Connect an AI provider to start building. Set it up in <strong>Smart Team › Settings ›</strong> <link>AI Configuration</link>.',
					'team-free'
				),
		{
			strong: <strong />,
			/* eslint-disable jsx-a11y/anchor-has-content -- content supplied by createInterpolateElement */
			link: <a href={getAISettingsUrl()} target="_blank" rel="noopener noreferrer" />,
			connectors: (
				<a href={aiSettings.connectors_url} target="_blank" rel="noopener noreferrer" />
			),
			/* eslint-enable jsx-a11y/anchor-has-content */
		}
	);

	const title = isRefining
		? __('Refine Team Showcase with AI', 'team-free')
		: __('Build Your Team Showcase with AI', 'team-free');

	return (
		<Modal
			title={title}
			onRequestClose={handleClose}
			className="sptp-ai-builder-modal"
			overlayClassName="sptp-ai-builder-modal-overlay"
			__experimentalHideHeader
		>
			<div className="sptp-ai-builder-modal__header">
				<BrandMarkIcon />
				<h1 className="sptp-ai-builder-modal__title">{title}</h1>
				<button
					type="button"
					className="sptp-ai-builder-modal__close"
					aria-label={__('Close', 'team-free')}
					onClick={handleClose}
				>
					<Icon icon={closeSmall} size={24} />
				</button>
			</div>

			<div className="sptp-ai-builder-modal__body">
				{!isAiEnabled && (
					<Notice
						status="warning"
						isDismissible={false}
						className="sptp-ai-builder-modal__notice"
					>
						{__(
							'AI features are disabled on this site, so layout generation is unavailable.',
							'team-free'
						)}
					</Notice>
				)}

				{isAiEnabled && !hasProvider && (
					<div className="sptp-ai-builder-modal__connect">{connectNotice}</div>
				)}

				{fallbackProvider && (
					<div className="sptp-ai-builder-modal__fallback" role="alert">
						<p className="sptp-ai-builder-modal__fallback-text">
							{createInterpolateElement(
								sprintf(fallbackNotice, failedLabel, fallbackProvider.label),
								{
									strong: <strong />,
								}
							)}
						</p>
						<Button
							variant="primary"
							className="sptp-ai-builder-modal__fallback-btn"
							onClick={handleContinue}
						>
							{__('Continue', 'team-free')}
						</Button>
					</div>
				)}

				{error && !fallbackProvider && (
					<Notice
						status="error"
						onRemove={() => setError(null)}
						className="sptp-ai-builder-modal__notice"
					>
						{error}
					</Notice>
				)}

				<label htmlFor="sptp-ai-prompt" className="sptp-ai-heading">
					{isRefining
						? __('What should change?', 'team-free')
						: __('What do you want to create?', 'team-free')}
				</label>

				<div className="sptp-ai-textarea-card">
					<textarea
						id="sptp-ai-prompt"
						className="sptp-ai-textarea"
						value={prompt}
						maxLength={1000}
						onChange={(event) => setPrompt(event.target.value)}
						placeholder={
							isRefining
								? __(
										'Make the photos round, show email and phone, and use 4 columns',
										'team-free'
									)
								: __(
										'A team member grid with profile photos, names, roles and social links.',
										'team-free'
									)
						}
					/>
					<div className="sptp-ai-textarea-hint">
						{__('Mention layout, content, motion and styling.', 'team-free')}
					</div>
				</div>

				{!isRefining && <StarterPillsRail onSelectPrompt={handleSelectPrompt} />}
			</div>

			<div className="sptp-ai-builder-modal__footer">
				<div className="sptp-ai-builder-modal__provider">
					{hasProvider && (
						<>
							<select
								className="sptp-ai-inline-select"
								aria-label={__('AI provider', 'team-free')}
								value={provider}
								onChange={(event) => handleSelectProvider(event.target.value)}
								disabled={isBusy}
							>
								{providers.map(({ slug, label }) => (
									<option key={slug} value={slug}>
										{failures[slug]
											? sprintf(
													/* translators: 1: AI provider label, 2: why its last request failed. */
													__('%1$s (%2$s)', 'team-free'),
													label,
													FAILURE_TAGS[failures[slug]] ||
														FAILURE_TAGS.error
												)
											: label}
									</option>
								))}
							</select>
							{modelOptions.length > 0 && (
								<>
									<span
										className="sptp-ai-builder-modal__provider-sep"
										aria-hidden="true"
									>
										·
									</span>
									<select
										className="sptp-ai-inline-select"
										aria-label={__('AI model', 'team-free')}
										value={model}
										onChange={(event) => setModel(event.target.value)}
										disabled={isBusy}
									>
										{modelOptions.map(({ label, value }) => (
											<option key={value} value={value}>
												{label}
											</option>
										))}
									</select>
								</>
							)}
						</>
					)}
				</div>
				<div className="sptp-ai-builder-modal__actions">
					{loading && (
						<button
							type="button"
							aria-label={__('Stop generating', 'team-free')}
							onClick={cancel}
							className="sptp-ai-stop-btn"
						>
							<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
								<rect
									x="2"
									y="2"
									width="8"
									height="8"
									rx="1.5"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
								/>
							</svg>
						</button>
					)}
					<Button
						variant="primary"
						className="sptp-ai-generate-btn"
						onClick={() => handleGenerate()}
						aria-busy={isBusy}
						disabled={isBusy || !hasProvider || !isAiEnabled || !prompt.trim()}
					>
						<span
							className="sptp-ai-generate-btn__fill"
							style={{ width: `${progressPct}%` }}
						/>
						<span className="sptp-ai-generate-btn__label">
							{loading && (
								<span className="sptp-ai-generate-btn__dots">
									<span />
									<span />
									<span />
								</span>
							)}
							{generateButtonLabel}
						</span>
					</Button>
				</div>
			</div>
		</Modal>
	);
}
