import { __, sprintf } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef, useState, createInterpolateElement } from '@wordpress/element';
import { toastErrorMsg, toastSuccessMsg } from '../utils/toast';
import { STORE_NAME } from '../store';
import SaveAndReset from './SaveAndReset.jsx';
import { ArrowUpRightIcon } from './SettingsIcons.jsx';
import { NoticeDismissIcon, WordPressLogoIcon } from './AIProviderIcons.jsx';
import {
	KEY_EMPTY,
	KEY_FAILED,
	KEY_INVALID,
	KEY_NONE,
	KEY_UNKNOWN,
	KEY_UNVERIFIED,
	KEY_VALID,
} from './aiProviders';

/**
 * How the key field describes itself. A submission the provider just refused
 * outranks the stored key's verdict — they describe different keys.
 *
 * @param {Object}  status     {state, message} of the stored key.
 * @param {?Object} feedback   {state, message} of a key just refused, or null.
 * @param {boolean} isChecking Whether a verification is in flight.
 * @return {?{tone: string, label: string, message: string}} Badge, or null.
 */
function describeKeyField(status, feedback, isChecking) {
	if (feedback) {
		const retained =
			KEY_VALID === status?.state
				? ' ' + __('Your previously saved key is still in use.', 'team-free')
				: '';
		return {
			tone: 'invalid',
			label: __('Invalid key', 'team-free'),
			message: (feedback.message || __('This API key was rejected.', 'team-free')) + retained,
		};
	}

	const state = status?.state || KEY_NONE;
	if (KEY_NONE === state) {
		return null;
	}
	if (isChecking || KEY_UNKNOWN === state) {
		return { tone: 'checking', label: __('Checking…', 'team-free'), message: '' };
	}
	if (KEY_VALID === state) {
		return { tone: 'valid', label: __('Connected', 'team-free'), message: '' };
	}
	if (KEY_INVALID === state) {
		return {
			tone: 'invalid',
			label: __('Invalid key', 'team-free'),
			message:
				status?.message ||
				__(
					'This API key was rejected by the provider. Replace it with a valid key.',
					'team-free'
				),
		};
	}
	return {
		tone: 'unverified',
		label: __('Not verified', 'team-free'),
		message:
			status?.message ||
			__('This API key could not be verified with the provider yet.', 'team-free'),
	};
}

/**
 * Short toast text for a key the save did not accept — the full explanation
 * stays inline under the field.
 *
 * @param {string} state Key verdict.
 * @param {string} name  Provider name.
 * @return {string} Toast message.
 */
function keyToastMessage(state, name) {
	if (KEY_EMPTY === state) {
		return __('Please enter an API key.', 'team-free');
	}
	if (KEY_FAILED === state) {
		return __('Could not save the API key. Please try again.', 'team-free');
	}
	if (KEY_UNVERIFIED === state) {
		return sprintf(
			/* translators: %s: AI provider name, e.g. "Gemini" */
			__('Could not verify the %s API key. Please try again later.', 'team-free'),
			name
		);
	}
	/* translators: %s: AI provider name, e.g. "Gemini" */
	return sprintf(__('Invalid %s API key. Please check it and try again.', 'team-free'), name);
}

/**
 * Connection form for the provider selected on the AI Configuration tab. Port
 * of testimonial-pro's AiProviderSettings. A saved key is shown masked and
 * read-only; Replace swaps it for an empty field, Remove deletes it at once.
 * Every save sends the Primary along, so editing a backup never moves it —
 * the server promotes the next connected provider when the Primary's key is
 * removed, and makes the first connected provider Primary.
 *
 * @param {Object}  props
 * @param {Object}  props.provider    Entry of AI_PROVIDERS.
 * @param {Object}  props.ai          `apiData.ai`.
 * @param {Object}  props.status      {state, message} of the stored key.
 * @param {boolean} props.isChecking  Whether the stored key is being verified.
 * @param {boolean} props.isConnected Whether the provider can serve requests.
 * @param {string}  props.primarySlug Resolved Primary, or ''.
 */
const AIProviderForm = ({ provider, ai, status, isChecking, isConnected, primarySlug }) => {
	const { slug, name, keyUrl } = provider;
	const { saveAISettings } = useDispatch(STORE_NAME);

	const stored = ai?.keys?.[slug] || {};
	const savedKey = stored.has_key ? stored.masked_key || '' : '';
	const connector = ai?.connectors?.[slug] || {};
	const connectorsUrl = ai?.connectors_url || '';
	const isPrimary = slug === primarySlug;

	const [apiKey, setApiKey] = useState('');
	const [isReplacing, setIsReplacing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	// A refused key is not stored, so the stored verdict alone cannot say why the save did not take.
	const [feedback, setFeedback] = useState(null);
	const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);
	const keyInputRef = useRef(null);
	const replaceButtonRef = useRef(null);
	const isFirstRender = useRef(true);

	// Keep focus with the control that replaced the one just clicked.
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		if (isReplacing) {
			keyInputRef.current?.focus();
		} else {
			replaceButtonRef.current?.focus();
		}
	}, [isReplacing]);

	const isKeyLocked = '' !== savedKey && !isReplacing;
	const badge = describeKeyField(isKeyLocked ? status : null, feedback, isChecking);
	const showConnectorNotice =
		connector.registered &&
		connectorsUrl &&
		!isNoticeDismissed &&
		!ai?.connector_notice_dismissed;

	const persist = async (values) => {
		setIsSaving(true);
		try {
			return await saveAISettings({ provider: slug, primary: primarySlug, ...values });
		} catch (error) {
			toastErrorMsg(__('Could not save the AI configuration.', 'team-free'));
			return null;
		} finally {
			setIsSaving(false);
		}
	};

	const startReplacing = () => {
		setApiKey('');
		setFeedback(null);
		setIsReplacing(true);
	};

	const cancelReplacing = () => {
		setApiKey('');
		setFeedback(null);
		setIsReplacing(false);
	};

	const handleSave = async () => {
		setFeedback(null);
		const hasKey = '' !== apiKey.trim();
		setIsVerifying(hasKey);
		const data = await persist(hasKey ? { api_key: apiKey } : {});
		setIsVerifying(false);
		if (!data) {
			return;
		}

		const keyResult = data.aiKeyResult;
		if (keyResult && !keyResult.stored && !['unchanged', 'removed'].includes(keyResult.state)) {
			setFeedback({ state: keyResult.state, message: keyResult.message });
			toastErrorMsg(keyToastMessage(keyResult.state, name));
			return;
		}

		setApiKey('');
		setIsReplacing(false);
		if (KEY_UNVERIFIED === keyResult?.state) {
			toastErrorMsg(keyToastMessage(KEY_UNVERIFIED, name));
		} else {
			toastSuccessMsg(
				keyResult?.stored
					? __('API key verified and saved.', 'team-free')
					: __('AI configuration saved successfully.', 'team-free')
			);
		}
	};

	const removeKey = async (successMessage) => {
		setFeedback(null);
		const data = await persist({ remove_key: true });
		if (!data) {
			return;
		}
		setApiKey('');
		setIsReplacing(false);
		toastSuccessMsg(successMessage);
	};

	const handleRemoveKey = () => {
		/* translators: %s: AI provider name */
		const message = sprintf(__('Remove the saved %s API key?', 'team-free'), name);
		// eslint-disable-next-line no-alert
		if (window.confirm(message)) {
			removeKey(__('API key removed.', 'team-free'));
		}
	};

	const handleReset = () => {
		if (savedKey) {
			removeKey(__('Settings reset.', 'team-free'));
			return;
		}
		cancelReplacing();
	};

	const handleMakePrimary = async () => {
		setFeedback(null);
		const data = await persist({ primary: slug });
		if (data) {
			/* translators: %s: AI provider name */
			toastSuccessMsg(sprintf(__('%s is now the primary provider.', 'team-free'), name));
		}
	};

	const dismissConnectorNotice = async () => {
		setIsNoticeDismissed(true);
		const data = await persist({ dismiss_connector_notice: true });
		if (!data) {
			setIsNoticeDismissed(false);
		}
	};

	return (
		<div className="sptp-ai-config__form">
			{showConnectorNotice && (
				<div className="sptp-ai-config__connector">
					<span className="sptp-ai-config__connector-icon">
						<WordPressLogoIcon />
					</span>
					<p className="sptp-ai-config__connector-text">
						{createInterpolateElement(
							connector.connected
								? __(
										'Connected through WordPress <link>Settings → Connectors</link>. That key is used first; an API key saved here is the fallback.',
										'team-free'
									)
								: __(
										'Already use this provider elsewhere on your site? Add its key once under WordPress <link>Settings → Connectors</link> instead of here.',
										'team-free'
									),
							{
								// eslint-disable-next-line jsx-a11y/anchor-has-content -- content supplied by createInterpolateElement
								link: (
									<a
										href={connectorsUrl}
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							}
						)}
					</p>
					<button
						type="button"
						className="sptp-ai-config__connector-dismiss"
						onClick={dismissConnectorNotice}
						aria-label={__('Dismiss this notice', 'team-free')}
					>
						<NoticeDismissIcon />
					</button>
				</div>
			)}

			<div className="sptp-ai-config__field">
				{isKeyLocked ? (
					<span className="sptp-ai-config__label">{__('API Key', 'team-free')}</span>
				) : (
					<label className="sptp-ai-config__label" htmlFor={`sptp-ai-key-${slug}`}>
						{__('API Key', 'team-free')}
					</label>
				)}

				{isKeyLocked ? (
					<div className="sptp-ai-config__key-locked">
						<span className="sptp-ai-config__key-masked" aria-hidden="true">
							{savedKey}
						</span>
						<span className="screen-reader-text">
							{__('A saved API key is hidden.', 'team-free')}
						</span>
						{badge && (
							<span className={`sptp-ai-config__key-status is-${badge.tone}`}>
								{badge.label}
							</span>
						)}
					</div>
				) : (
					<div className="sptp-ai-config__input-row">
						<input
							ref={keyInputRef}
							id={`sptp-ai-key-${slug}`}
							className={`sptp-ai-config__input${feedback ? ' is-error' : ''}`}
							type="password"
							placeholder={sprintf(
								/* translators: %s: AI provider name, e.g. "Gemini" */
								__('Enter your %s API key', 'team-free'),
								name
							)}
							value={apiKey}
							onChange={(event) => {
								setApiKey(event.target.value);
								setFeedback(null);
							}}
							aria-invalid={Boolean(feedback)}
							autoComplete="off"
							spellCheck="false"
						/>
						{isReplacing && (
							<button
								type="button"
								className="sptp-ai-config__key-btn"
								onClick={cancelReplacing}
							>
								{__('Cancel', 'team-free')}
							</button>
						)}
					</div>
				)}

				{badge?.message && (
					<span className={`sptp-ai-config__message is-${badge.tone}`} role="alert">
						{badge.message}
					</span>
				)}

				<div className="sptp-ai-config__key-meta">
					<a
						className="sptp-ai-config__key-link"
						href={keyUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						{sprintf(
							/* translators: %s: AI provider name */
							__('Get your %s API key', 'team-free'),
							name
						)}
						<ArrowUpRightIcon />
					</a>
					{(isKeyLocked || (isConnected && !isPrimary)) && (
						<div className="sptp-ai-config__key-actions">
							{isConnected && !isPrimary && (
								<button
									type="button"
									className="sptp-ai-config__action"
									onClick={handleMakePrimary}
									disabled={isSaving}
								>
									{__('Make primary', 'team-free')}
								</button>
							)}
							{isKeyLocked && (
								<>
									<button
										ref={replaceButtonRef}
										type="button"
										className="sptp-ai-config__action"
										onClick={startReplacing}
										disabled={isSaving}
										aria-label={__('Replace API key', 'team-free')}
									>
										{__('Replace key', 'team-free')}
									</button>
									<button
										type="button"
										className="sptp-ai-config__action is-danger"
										onClick={handleRemoveKey}
										disabled={isSaving}
									>
										{__('Remove key', 'team-free')}
									</button>
								</>
							)}
						</div>
					)}
				</div>
			</div>

			<SaveAndReset
				isSaving={isSaving}
				onSave={handleSave}
				onReset={handleReset}
				busyLabel={isVerifying ? __('Verifying…', 'team-free') : ''}
				resetLabel={__('Reset to Default', 'team-free')}
			/>
		</div>
	);
};

export default AIProviderForm;
