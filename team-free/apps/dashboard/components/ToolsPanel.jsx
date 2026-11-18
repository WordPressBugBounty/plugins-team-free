import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useMemo, useState } from '@wordpress/element';
import { toast } from 'react-hot-toast';
import MultipleSelect from '../../components/multipleSelect/multipleSelect';
import { STORE_NAME } from '../store';

/**
 * Settings → Tools — the classic Tools screen's Export / Import sections on one
 * page, each a 280px label column beside its controls (Smart Team Pro's layout).
 *
 * It drives the same `SPT_export_shortcodes` / `SPT_import_shortcodes` admin-ajax
 * actions the classic screen used (nonce `spf_options_nonce`, localized as
 * `sptpDashboard.toolsNonce`), so the file format is unchanged. Free exports and
 * imports JSON only. The classic Tools page itself is gone: `Dashboard`
 * redirects its old URL here.
 */

const EXPORT_TYPES = [
	{ value: 'all_members', label: __('All Members', 'team-free') },
	{ value: 'all_shortcodes', label: __('All Team (Shortcodes)', 'team-free') },
	{ value: 'selected_shortcodes', label: __('Selected Team (Shortcodes)', 'team-free') },
];

/** Where each imported post type lands, mirroring the classic screen. */
const IMPORT_REDIRECT = {
	sptp_member: 'edit.php?post_type=sptp_member',
	sptp_generator: 'edit.php?post_type=sptp_generator',
};
/** Let the success toast register before the page navigates away. */
const IMPORT_REDIRECT_DELAY = 1500;

/**
 * One radio row.
 *
 * @param {Object}   props
 * @param {string}   props.name     Radio group name.
 * @param {Object}   props.option   `{ value, label }`.
 * @param {string}   props.checked  Currently selected value.
 * @param {Function} props.onChange Called with the new value.
 */
const Radio = ({ name, option, checked, onChange }) => {
	const id = `sptp-${name}-${option.value}`;

	return (
		<label className="sptp-tools__radio" htmlFor={id}>
			<input
				id={id}
				type="radio"
				name={name}
				value={option.value}
				checked={checked === option.value}
				onChange={() => onChange(option.value)}
			/>
			<span>{option.label}</span>
		</label>
	);
};

/** Core admin's own spinner — @wordpress/components would add ~1 MB of script. */
const ButtonSpinner = () => <span className="spinner is-active sptp-tools__spinner" />;

const ToolsPanel = () => {
	const { adminUrl } = useSelect((select) => select(STORE_NAME).getDashboardInfo(), []);
	const generators = useSelect((select) => select(STORE_NAME).getGenerators(), []);

	const teamOptions = useMemo(
		() => generators.map((item) => ({ value: item.value, label: item.label })),
		[generators]
	);

	const [exportType, setExportType] = useState('all_members');
	const [selectedTeams, setSelectedTeams] = useState([]);
	const [importFile, setImportFile] = useState(null);
	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);

	const ajaxUrl = window.sptpDashboard?.ajaxUrl;
	const nonce = window.sptpDashboard?.toolsNonce;

	const isSelected = 'selected_shortcodes' === exportType;

	const download = (body) => {
		const blob = new Blob([body], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `wp-team-export-${Date.now()}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const onExport = async () => {
		if (isSelected && 0 === selectedTeams.length) {
			toast.error(__('Choose at least one team.', 'team-free'));
			return;
		}

		setIsExporting(true);
		try {
			const form = new FormData();
			form.append('action', 'SPT_export_shortcodes');
			form.append('nonce', nonce);

			if (isSelected) {
				selectedTeams.forEach((id) => form.append('sptp_ids[]', id));
			} else {
				form.append('sptp_ids', exportType);
			}

			const response = await fetch(ajaxUrl, { method: 'POST', body: form });
			const data = await response.json();

			// An error answer is `{ success: false, data: { message | error } }`;
			// without this the file would download with that error as its contents.
			if (false === data?.success) {
				toast.error(
					data?.data?.message || data?.data?.error || __('Could not export.', 'team-free')
				);
				setIsExporting(false);
				return;
			}

			// An empty library answers `[]`, which would download as a useless file.
			if (!Array.isArray(data?.shortcode) || 0 === data.shortcode.length) {
				toast.error(__('No data to export.', 'team-free'));
				setIsExporting(false);
				return;
			}

			download(JSON.stringify(data));

			if (isSelected) {
				setSelectedTeams([]);
			}
			toast.success(__('Export downloaded.', 'team-free'));
		} catch (error) {
			toast.error(__('Could not export.', 'team-free'));
		}
		setIsExporting(false);
	};

	const onImport = async () => {
		if (!importFile) {
			return;
		}

		setIsImporting(true);
		try {
			const text = await importFile.text();

			const form = new FormData();
			form.append('action', 'SPT_import_shortcodes');
			form.append('nonce', nonce);
			// The file already holds JSON; the handler decodes twice.
			form.append('shortcode', JSON.stringify(text));

			const response = await fetch(ajaxUrl, { method: 'POST', body: form });
			const data = await response.json();

			if (data?.success) {
				toast.success(__('Import completed.', 'team-free'));
				setImportFile(null);
				const target = IMPORT_REDIRECT[data?.data] || IMPORT_REDIRECT.sptp_member;
				setTimeout(() => {
					window.location.replace(`${adminUrl || ''}${target}`);
				}, IMPORT_REDIRECT_DELAY);
				// Keep the spinner: the page is about to navigate away.
				return;
			}

			toast.error(
				data?.data?.message || data?.data?.error || __('Import failed.', 'team-free')
			);
		} catch (error) {
			toast.error(__('Import failed.', 'team-free'));
		}
		setIsImporting(false);
	};

	return (
		<div className="sptp-settings-panel sptp-tools">
			<div className="sptp-tools__row">
				<p className="sptp-tools__label">{__('Export', 'team-free')}</p>

				<div className="sptp-tools__control">
					<div className="sptp-tools__group">
						<p className="sptp-tools__sublabel">
							{__('Choose What To Export', 'team-free')}
						</p>
						<div className="sptp-tools__radios">
							{EXPORT_TYPES.map((option) => (
								<Radio
									key={option.value}
									name="export-type"
									option={option}
									checked={exportType}
									onChange={setExportType}
								/>
							))}
						</div>
					</div>

					{isSelected && (
						<div className="sptp-tools__group sptp-tools__teams">
							{0 === teamOptions.length ? (
								<p className="sptp-tools__empty">
									{__('No teams found.', 'team-free')}
								</p>
							) : (
								<MultipleSelect
									label={__('Choose Team(s)', 'team-free')}
									items={teamOptions}
									attributes={selectedTeams}
									onChange={(data) =>
										setSelectedTeams(
											(data || []).map((option) => String(option.value))
										)
									}
								/>
							)}
						</div>
					)}

					<button
						type="button"
						className="sptp-tools__button"
						onClick={onExport}
						disabled={isExporting}
					>
						{isExporting ? <ButtonSpinner /> : __('Export File', 'team-free')}
					</button>
				</div>
			</div>

			<div className="sptp-tools__divider" />

			<div className="sptp-tools__row">
				<p className="sptp-tools__label">{__('Import', 'team-free')}</p>

				<div className="sptp-tools__control">
					<div className="sptp-tools__group">
						<p className="sptp-tools__sublabel">
							{__('Import JSON File To Upload', 'team-free')}
						</p>
						<div className="sptp-tools__file">
							<label className="sptp-tools__file-button" htmlFor="sptp-import-file">
								{__('Choose File', 'team-free')}
							</label>
							<input
								id="sptp-import-file"
								type="file"
								accept=".json"
								onChange={(event) => setImportFile(event.target.files?.[0] || null)}
							/>
							<span className="sptp-tools__file-name">
								{importFile?.name || __('No File Chosen', 'team-free')}
							</span>
						</div>
					</div>

					<button
						type="button"
						className="sptp-tools__button"
						onClick={onImport}
						disabled={!importFile || isImporting}
					>
						{isImporting ? <ButtonSpinner /> : __('Apply Import', 'team-free')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ToolsPanel;
