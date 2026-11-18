import { __ } from '@wordpress/i18n';
import SpCssCodeEditor from '../../components/cssCodeEditor';
import SaveAndReset from './SaveAndReset';
import useSettingsDraft from '../hooks/useSettingsDraft';

/**
 * Settings → Additional CSS & JS.
 *
 * Edits the classic `custom_css` / `custom_js` keys of `_sptp_settings`, which
 * the frontend already prints (`Frontend.php`, `Helper.php`). This replaces the
 * classic Settings screen's "Additional CSS & JS" section; that screen is gone.
 *
 * Figma node `1292:28862`: a 280px label column beside a dark, full-width editor
 * per field, over the shared Save / Reset bar.
 */

const CustomCodePanel = () => {
	const { draft, isSaving, update, save, reset } = useSettingsDraft({
		selector: 'getCustomCodeSettings',
		action: 'saveCustomCode',
		defaultsKey: 'customCodeDefaults',
	});

	// wp_enqueue_code_editor()'s per-language settings; null when the user turned
	// syntax highlighting off, which leaves the editor's textarea fallback.
	const codeEditor = window.sptpDashboard?.codeEditor || {};

	return (
		<div className="sptp-settings-panel sptp-custom-code">
			<div className="sptp-custom-code__field">
				<p className="sptp-custom-code__label">{__('Custom CSS', 'team-free')}</p>
				<div className="sptp-custom-code__editor">
					<SpCssCodeEditor
						value={draft.custom_css || ''}
						onChange={(value) => update('custom_css', value)}
						height={170}
						resizable
						settings={codeEditor.css}
					/>
				</div>
			</div>

			<div className="sptp-custom-code__field">
				<p className="sptp-custom-code__label">{__('Custom JS', 'team-free')}</p>
				<div className="sptp-custom-code__editor">
					<SpCssCodeEditor
						value={draft.custom_js || ''}
						onChange={(value) => update('custom_js', value)}
						height={170}
						language="javascript"
						resizable
						settings={codeEditor.js}
					/>
				</div>
			</div>

			<SaveAndReset isSaving={isSaving} onSave={save} onReset={reset} />
		</div>
	);
};

export default CustomCodePanel;
