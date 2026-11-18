/**
 * SpCssCodeEditor — thin React wrapper over WP core CodeMirror (wp.codeEditor).
 *
 * Zero bundle cost — assets come from `wp_enqueue_code_editor()` (enqueued on
 * the block editor screen by AssetManager). Falls back to a plain textarea when
 * the user has disabled the code editor in their profile, or when CodeMirror is
 * otherwise unavailable.
 *
 * When the attribute is empty, the parent may pass a display-only placeholder
 * (e.g. `value={attr || 'selector {\\n\\n}'}`) and must skip persisting that
 * placeholder so it is never stored.
 *
 * Ported from WP Carousel Pro's components/cssCodeEditor (replaces the former
 * `@monaco-editor/react` editor — no extra chunk, no npm dependency).
 */

/**
 * CodeMirror MIME mode for the languages the call sites use.
 *
 * @param {string} language 'css' or 'javascript'.
 * @return {string} MIME mode.
 */
const getEditorMode = (language) =>
	'javascript' === language || 'js' === language ? 'text/javascript' : 'text/css';

import { useEffect, useRef } from '@wordpress/element';
import './editor.scss';

/**
 * @param {Object}   props
 * @param {string}   props.value        Current CSS string (may be a display placeholder).
 * @param {Function} props.onChange     Called with the new CSS string.
 * @param {number}   [props.height=180] Editor height in px.
 * @param {string}   [props.className]  Extra class on the wrapper.
 * @param {string}   [props.language]   'css' or 'javascript'.
 * @param {Object}   [props.settings]   Full settings from `wp_enqueue_code_editor()`, localized to
 *                                      the page — carries that language's linters and key bindings.
 * @param {boolean}  [props.resizable]  Allow dragging the editor taller with the native CSS grip.
 */
const SpCssCodeEditor = ({
	value = '',
	onChange,
	height = 180,
	className = '',
	language = 'css',
	settings = null,
	resizable = false,
}) => {
	const textareaRef = useRef(null);
	const editorRef = useRef(null);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) {
			return undefined;
		}

		const codeEditorApi = window.wp?.codeEditor;
		if (!codeEditorApi?.initialize) {
			// No CodeMirror (disabled in profile / unavailable) — plain textarea.
			const handleInput = () => {
				if (onChangeRef.current) {
					onChangeRef.current(textarea.value);
				}
			};
			textarea.addEventListener('input', handleInput);
			return () => {
				textarea.removeEventListener('input', handleInput);
			};
		}

		const defaults = codeEditorApi.defaultSettings || {};
		// Without page-supplied settings, don't force lint: core ships CSS mode with
		// lint off and no csslint, and CodeMirror throws when the linter is missing.
		const instanceSettings = settings || {
			...defaults,
			codemirror: {
				...(defaults.codemirror || {}),
				mode: getEditorMode(language),
				lineNumbers: true,
				lint: 'css' === language,
				gutters: ['CodeMirror-lint-markers'],
			},
		};
		const instance = codeEditorApi.initialize(textarea, instanceSettings);

		const codeMirror = instance.codemirror;
		editorRef.current = codeMirror;

		const handleChange = (editor) => {
			if (onChangeRef.current) {
				onChangeRef.current(editor.getValue());
			}
		};
		codeMirror.on('change', handleChange);
		codeMirror.setSize(null, height);

		return () => {
			codeMirror.off('change', handleChange);
			codeMirror.toTextArea();
			editorRef.current = null;
		};
		// Init once per mount; height/onChange synced via refs / separate effect.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Sync external value (inline editor ↔ modal sharing the same attribute).
	useEffect(() => {
		const codeMirror = editorRef.current;
		const next = value || '';
		if (codeMirror) {
			if (next !== codeMirror.getValue()) {
				const cursor = codeMirror.getCursor();
				codeMirror.setValue(next);
				codeMirror.setCursor(cursor);
			}
			return;
		}
		const textarea = textareaRef.current;
		if (textarea && textarea.value !== next) {
			textarea.value = next;
		}
	}, [value]);

	useEffect(() => {
		const codeMirror = editorRef.current;
		if (codeMirror) {
			codeMirror.setSize(null, height);
		}
	}, [height]);

	/**
	 * A CSS-resized CodeMirror needs a nudge: the browser changes the wrapper's
	 * height behind its back, so watch it and repaint. The textarea fallback
	 * reflows on its own.
	 */
	useEffect(() => {
		const codeMirror = editorRef.current;
		const wrapper = codeMirror?.getWrapperElement?.();
		if (!resizable || !wrapper || 'undefined' === typeof ResizeObserver) {
			return undefined;
		}
		const observer = new ResizeObserver(() => codeMirror.refresh());
		observer.observe(wrapper);
		return () => observer.disconnect();
	}, [resizable]);

	return (
		<div
			className={`sp-smart-team-css-code-editor${
				resizable ? ' sp-smart-team-css-code-editor--resizable' : ''
			} ${className}`.trim()}
		>
			<textarea
				ref={textareaRef}
				defaultValue={value || ''}
				className="sp-smart-team-css-code-editor__textarea"
				style={{ height: `${height}px`, width: '100%' }}
				spellCheck={false}
			/>
		</div>
	);
};

export default SpCssCodeEditor;
