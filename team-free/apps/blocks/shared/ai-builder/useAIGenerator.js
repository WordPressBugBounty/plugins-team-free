import { useState, useCallback, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { AI_GENERATE_PATH } from './constants';

/**
 * Strip a value down to what `JSON.stringify` can actually serialize.
 *
 * `existingAttributes` on a Refine request is whatever
 * `getBlockAttributes()` currently holds for the block — and a block built up
 * over several editing sessions (media picks, popup saves, undo/redo) can end
 * up carrying a stray non-plain reference an older code path attached to an
 * item (a DOM node, a `window` reference, a class instance). `apiFetch`
 * JSON-stringifies the request body internally, so a single bad leaf anywhere
 * in the tree throws "Converting circular structure to JSON" and Refine never
 * reaches the network — even though every other attribute is fine. Dropping
 * anything that isn't a plain object/array/primitive (and breaking cycles
 * with the seen-set) means a stale bad value degrades to "that one field
 * reverts to its schema default," not a hard crash that makes Refine look
 * AI-generated-only.
 *
 * @param {*}       value Value to clean.
 * @param {WeakSet} seen  Objects already visited on this branch, for cycle detection.
 * @return {*} A value safe to pass to `JSON.stringify`, or `undefined` when
 *             the whole value had to be dropped.
 */
function toSerializable(value, seen = new WeakSet()) {
	if (null === value || 'object' !== typeof value) {
		return 'function' === typeof value ? undefined : value;
	}

	if (('undefined' !== typeof window && value === window) || (value && value.window === value)) {
		return undefined;
	}
	if ('undefined' !== typeof Node && value instanceof Node) {
		return undefined;
	}
	if (seen.has(value)) {
		return undefined;
	}
	seen.add(value);

	if (Array.isArray(value)) {
		return value.map((item) => toSerializable(item, seen));
	}

	// Only plain objects survive; Map/Set/class instances/etc. are dropped
	// rather than guessed at — the AI catalog never expects them anyway.
	const proto = Object.getPrototypeOf(value);
	if (null !== proto && Object.prototype !== proto) {
		return undefined;
	}

	const cleaned = {};
	for (const [key, child] of Object.entries(value)) {
		const childCleaned = toSerializable(child, seen);
		if (undefined !== childCleaned) {
			cleaned[key] = childCleaned;
		}
	}
	return cleaned;
}

/**
 * Turn a failed request into a message an editor can act on.
 *
 * Server errors from the AI route already arrive worded for editors; what is
 * left are WordPress/REST and browser failures, whose raw text is developer-speak.
 *
 * @param {Object} err Error thrown by `apiFetch`.
 * @return {string} Message to show.
 */
function friendlyError(err) {
	const code = err?.code || '';

	if (
		'fetch_error' === code ||
		('undefined' !== typeof navigator && false === navigator.onLine)
	) {
		return __(
			'You appear to be offline. Check your internet connection and try again.',
			'team-free'
		);
	}
	if ('rest_cookie_invalid_nonce' === code) {
		return __('Your session has expired. Please reload the page and try again.', 'team-free');
	}
	if ('rest_forbidden' === code || 'rest_not_logged_in' === code) {
		return __(
			'You do not have permission to use Create Team with AI. Please ask your site administrator.',
			'team-free'
		);
	}
	if ('rest_no_route' === code) {
		return __(
			'Create Team with AI is not available right now. Please reload the page and try again.',
			'team-free'
		);
	}
	if ('invalid_json' === code) {
		return __(
			'The server sent an unexpected response. Please try again in a moment.',
			'team-free'
		);
	}
	if (code.startsWith('sptp_ai_') && err.message) {
		return err.message;
	}

	return __(
		'Something went wrong while creating your team layout. Please try again.',
		'team-free'
	);
}

/**
 * Ask the AI builder what to do with a prompt.
 *
 * The response is mode-tagged: `pattern` names a Ready Pattern the editor should
 * insert, `attributes` carries a generated block configuration. Only the
 * requested provider is asked; a failure is remembered per provider so the
 * modal can offer the next one that has not failed.
 *
 * @return {Object} Generator state and actions.
 */
export default function useAIGenerator() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	// Latest provider failure `{ provider, label, reason }`, and every failed provider → reason until reset().
	const [failure, setFailure] = useState(null);
	const [failures, setFailures] = useState({});
	const controllerRef = useRef(null);

	const generate = useCallback(
		async ({
			prompt,
			blockName,
			existingAttributes = {},
			allowPatterns = true,
			provider = '',
			model = '',
		}) => {
			const controller = new AbortController();
			controllerRef.current = controller;

			setLoading(true);
			setError(null);
			setFailure(null);

			try {
				const response = await apiFetch({
					path: AI_GENERATE_PATH,
					method: 'POST',
					data: {
						prompt,
						blockName,
						existingAttributes: toSerializable(existingAttributes),
						allowPatterns,
						provider,
						model,
					},
					signal: controller.signal,
				});

				if (
					response?.success &&
					('pattern' === response.mode ? response.pattern : response.attributes)
				) {
					setLoading(false);
					return response;
				}

				throw Object.assign(
					new Error(
						__(
							'The AI could not build a layout from that description. Please try again or describe it differently.',
							'team-free'
						)
					),
					{ code: 'sptp_ai_empty_response' }
				);
			} catch (err) {
				setLoading(false);

				// The user hit "Stop" — this isn't a failure worth surfacing.
				if ('AbortError' === err.name) {
					return null;
				}

				const failedProvider = err?.data?.provider || '';
				if (failedProvider) {
					const reason = err.data.reason || 'error';
					setFailures((current) => ({ ...current, [failedProvider]: reason }));
					setFailure({ provider: failedProvider, label: err.data.label || '', reason });
				}

				setError(friendlyError(err));
				return null;
			} finally {
				if (controllerRef.current === controller) {
					controllerRef.current = null;
				}
			}
		},
		[]
	);

	const cancel = useCallback(() => {
		controllerRef.current?.abort();
	}, []);

	const clearFailure = useCallback(() => {
		setFailure(null);
		setError(null);
	}, []);

	const reset = useCallback(() => {
		setError(null);
		setFailure(null);
		setFailures({});
	}, []);

	return { generate, cancel, reset, loading, error, setError, failure, clearFailure, failures };
}
