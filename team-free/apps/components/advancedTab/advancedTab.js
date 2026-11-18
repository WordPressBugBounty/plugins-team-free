/**
 * AdvancedTabFields — the shared Advanced Settings → Advanced tab body.
 *
 * Custom CSS Class(es) + Custom CSS ID (validated — a red warning replaces the
 * help note while the value is invalid) and the Custom CSS editor (WP core
 * CodeMirror via the shared SpCssCodeEditor, with an "Edit in Modal" expander —
 * port of WP Carousel Pro's Advanced tab; replaces the former Monaco editor, so
 * no extra bundle chunk / npm dependency). Used by every block's
 * AdvancedSettings (grid/advance.js and ajax-pagination/advance.js, which the
 * other child blocks reuse).
 */

import { __ } from '@wordpress/i18n';
import { useState, createInterpolateElement } from '@wordpress/element';
import { TextControl, BaseControl, Button, Modal } from '@wordpress/components';
import { SpCssCodeEditor } from '../index.js';
import './editor.scss';

// One CSS class / id token: letters, numbers, hyphens and underscores.
const TOKEN = /^[A-Za-z0-9_-]+$/;
const classesValid = (value) =>
	!value ||
	value
		.trim()
		.split(/\s+/)
		.every((token) => TOKEN.test(token));
const idValid = (value) => !value || TOKEN.test(value.trim());

// Display-only placeholder when customCss is empty — shown in the editor but
// never written to the attribute (onChange skips when value === placeholder).
const CUSTOM_CSS_PLACEHOLDER = 'selector {\n\n}';

const AdvancedTabFields = ({ attributes, setAttributes }) => {
	const { additionalCssClass, additionalId, customCss } = attributes;

	const classInvalid = !classesValid(additionalCssClass || '');
	const idInvalid = !idValid(additionalId || '');

	const [isCssModalOpen, setIsCssModalOpen] = useState(false);

	// Empty attr → show the placeholder in the editor; never store it.
	const customCssEditorValue = customCss || CUSTOM_CSS_PLACEHOLDER;
	const onCustomCssChange = (next) => {
		if (CUSTOM_CSS_PLACEHOLDER !== next) {
			setAttributes({ customCss: next ?? '' });
		}
	};

	const customCssHelp = createInterpolateElement(
		__('Use the <code>selector</code> rule to target this block.', 'team-free'),
		{ code: <code /> }
	);

	return (
		<>
			<TextControl
				className={`sp-smart-team-advanced-field${classInvalid ? ' is-invalid' : ''}`}
				label={__('Custom CSS Class(es)', 'team-free')}
				placeholder={__('my-custom-class', 'team-free')}
				help={
					classInvalid
						? __(
								'Enter valid CSS class names without the (.) prefix. Separate multiple classes with spaces, and use only letters, numbers, hyphens (-), and underscores (_).',
								'team-free'
							)
						: __(
								'Add custom CSS class names for additional styling. Separate multiple classes with spaces.',
								'team-free'
							)
				}
				value={additionalCssClass || ''}
				onChange={(value) => setAttributes({ additionalCssClass: value })}
				__nextHasNoMarginBottom
			/>

			<TextControl
				className={`sp-smart-team-advanced-field${idInvalid ? ' is-invalid' : ''}`}
				label={__('Custom CSS ID', 'team-free')}
				placeholder={__('my-custom-id', 'team-free')}
				help={
					idInvalid
						? __(
								"Enter a unique CSS ID without the (#) prefix. Use only letters, numbers, hyphens (-), and underscores (_), and don't include spaces.",
								'team-free'
							)
						: __(
								'Add a unique CSS ID to target this block with custom CSS or JavaScript. The ID must be unique on the page.',
								'team-free'
							)
				}
				value={additionalId || ''}
				onChange={(value) => setAttributes({ additionalId: value })}
				__nextHasNoMarginBottom
			/>

			<div className="sp-smart-team-advanced-field sp-smart-team-advanced-custom-css">
				<BaseControl
					id="sp-smart-team-block-custom-css"
					label={__('Custom CSS', 'team-free')}
					help={customCssHelp}
					__nextHasNoMarginBottom
				>
					<SpCssCodeEditor
						value={customCssEditorValue}
						onChange={onCustomCssChange}
						height={180}
					/>
					<Button
						icon="editor-expand"
						variant="secondary"
						onClick={() => setIsCssModalOpen(true)}
						className="sp-smart-team-advanced-custom-css__modal-button"
					>
						{__('Edit in Modal', 'team-free')}
					</Button>
				</BaseControl>
			</div>

			{isCssModalOpen && (
				<Modal
					title={__('Custom CSS', 'team-free')}
					onRequestClose={() => setIsCssModalOpen(false)}
					className="sp-smart-team-custom-css-modal"
				>
					<SpCssCodeEditor
						value={customCssEditorValue}
						onChange={onCustomCssChange}
						height={400}
					/>
					<Button variant="secondary" onClick={() => setIsCssModalOpen(false)}>
						{__('Close', 'team-free')}
					</Button>
				</Modal>
			)}
		</>
	);
};

export default AdvancedTabFields;
