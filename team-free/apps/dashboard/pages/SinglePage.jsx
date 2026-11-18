import { __, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { STORE_NAME } from '../store';
import useSettingsDraft from '../hooks/useSettingsDraft';
import SaveAndReset from '../components/SaveAndReset';
import { ArrowUpRightIcon } from '../components/SettingsIcons';

/**
 * Dashboard → Single Page.
 *
 * Template Type is Pro's `_sptp_settings → single_page_template_source`
 * (`plugin` = Classic, `block`), which MemberTemplate::use_block_template()
 * follows. Block links straight to the "Single Item: Member" template in the
 * Site Editor. Classic shows the classic Settings → Single Page fields under
 * the select, in the classic screen's own design: the layout
 * (`single_page_view`, Template One / Two free, Three to Six locked) and the
 * Member Detail switches (`member_fields` groups) with the Pro ones locked.
 */

const TEMPLATE_SOURCES = [
	{ value: 'plugin', label: __('Classic', 'team-free') },
	{ value: 'block', label: __('Block', 'team-free') },
];

/*
 * Member Detail groups, in the order the Classic templates lay them out. `rows`
 * are the free switches (stored under `member_fields[group][id]`); `proRows`
 * are Pro's, shown locked. A group with no `rows` is Pro's in its entirety.
 */
const FIELD_GROUPS = [
	{
		id: 'member_image_fields',
		title: __('Image', 'team-free'),
		rows: [{ id: 'image_switch', label: __('Photo/Image', 'team-free') }],
	},
	{
		id: 'member_basic_fields',
		title: __('Basic Fields', 'team-free'),
		rows: [
			{ id: 'name_switch', label: __('Member Name', 'team-free') },
			{ id: 'job_position_switch', label: __('Position/Job Title', 'team-free') },
		],
		proRows: [__('Hire Me Button', 'team-free'), __('Special Tag', 'team-free')],
	},
	{
		id: 'member_info_fields',
		title: __('Member Information Fields', 'team-free'),
		proRows: [
			__('Section Title', 'team-free'),
			__('Email', 'team-free'),
			__('Mobile (Personal)', 'team-free'),
			__('Phone (Business)', 'team-free'),
			__('Location', 'team-free'),
			__('Website', 'team-free'),
			__('Experience', 'team-free'),
		],
	},
	{
		id: 'member_skill_bar_fields',
		title: __('Skill Bar Fields', 'team-free'),
		rows: [
			{ id: 'section_title', label: __('Section Title', 'team-free') },
			{ id: 'skill_bar_switch', label: __('Skill Bar', 'team-free') },
		],
	},
	{
		id: 'member_social_profile_fields',
		title: __('Social Profile Fields', 'team-free'),
		rows: [
			{ id: 'section_title', label: __('Section Title', 'team-free') },
			{ id: 'social_switch', label: __('Social Profile', 'team-free') },
		],
	},
	{
		id: 'member_biography_fields',
		title: __('Biography Fields', 'team-free'),
		rows: [
			{ id: 'section_title', label: __('Section Title', 'team-free') },
			{ id: 'biography_switch', label: __('Biography', 'team-free') },
		],
	},
	{
		id: 'member_extra_fields',
		title: __('Extra Fields', 'team-free'),
		proRows: [__('Section Title', 'team-free'), __('Extra Field', 'team-free')],
	},
	{
		id: 'member_author_post_fields',
		title: __('Author Post Fields', 'team-free'),
		proRows: [__('Section Title', 'team-free'), __('Author Post Field', 'team-free')],
	},
];

/* The classic switcher (`Framework/fields/switcher`), Show/Hide at 80px. */
const Switcher = ({ value, onChange, label, isPro = false }) => (
	<button
		type="button"
		className={`sptp-classic-switcher${value ? ' is-active' : ''}${isPro ? ' is-pro' : ''}`}
		role="switch"
		aria-checked={!!value}
		aria-label={label}
		disabled={isPro}
		onClick={() => onChange && onChange(!value)}
	>
		<span className="sptp-classic-switcher__on">{__('Show', 'team-free')}</span>
		<span className="sptp-classic-switcher__off">{__('Hide', 'team-free')}</span>
		<span className="sptp-classic-switcher__ball" />
	</button>
);

const ClassicField = ({ title, subtitle, children }) => (
	<div className="sptp-classic-field">
		<div className="sptp-classic-field__title">
			<h4>{title}</h4>
			{subtitle && <div className="sptp-classic-field__subtitle">{subtitle}</div>}
		</div>
		<div className="sptp-classic-field__fieldset">{children}</div>
	</div>
);

const DetailRow = ({ label, dragIcon, isPro, children }) => (
	<div className={`sptp-classic-detail${isPro ? ' is-pro' : ''}`}>
		<span className="sptp-classic-detail__helper">
			<img src={dragIcon} alt="" />
		</span>
		<h4 className="sptp-classic-detail__label">{label}</h4>
		{children}
	</div>
);

const ClassicSettings = ({ draft, update, meta, upgradeUrl }) => {
	const fields = draft.member_fields || {};
	const view = draft.single_page_view || 'one';

	return (
		<div className="sptp-classic-fields">
			<ClassicField
				title={__('Layout For Member Single Page', 'team-free')}
				subtitle={__('Choose a layout for member single page.', 'team-free')}
			>
				<div className="sptp-classic-images">
					{(meta.layouts || []).map((layout) => (
						<button
							key={layout.value}
							type="button"
							className={`sptp-classic-image${view === layout.value ? ' is-active' : ''}${
								layout.isPro ? ' is-pro' : ''
							}`}
							aria-pressed={view === layout.value}
							disabled={layout.isPro}
							onClick={() => update('single_page_view', layout.value)}
						>
							<figure>
								<img src={layout.image} alt="" />
							</figure>
							<p>{layout.label}</p>
						</button>
					))}
				</div>
			</ClassicField>

			<ClassicField
				title={__('Member Detail Fields', 'team-free')}
				subtitle={__('Show/Hide member detail or single page meta fields.', 'team-free')}
			>
				<div className="sptp-classic-details">
					{FIELD_GROUPS.map((group) => (
						<div key={group.id} className="sptp-classic-group">
							<h4 className="sptp-classic-group__title">{group.title}</h4>
							{(group.rows || []).map((row) => (
								<DetailRow key={row.id} label={row.label} dragIcon={meta.dragIcon}>
									<Switcher
										value={false !== fields[group.id]?.[row.id]}
										label={`${group.title}: ${row.label}`}
										onChange={(next) =>
											update('member_fields', {
												...fields,
												[group.id]: { ...fields[group.id], [row.id]: next },
											})
										}
									/>
								</DetailRow>
							))}
							{(group.proRows || []).map((label) => (
								<DetailRow key={label} label={label} dragIcon={meta.dragIcon} isPro>
									<Switcher
										value={false}
										label={`${group.title}: ${label}`}
										isPro
									/>
								</DetailRow>
							))}
						</div>
					))}
				</div>
				<p className="sptp-classic-field__desc">
					{createInterpolateElement(
						__(
							'To unlock the additional information fields and drag & drop sorting options, <a>Upgrade To Pro!</a>',
							'team-free'
						),
						{
							a: (
								// eslint-disable-next-line jsx-a11y/anchor-has-content -- text comes from the translation.
								<a href={upgradeUrl} target="_blank" rel="noopener noreferrer" />
							),
						}
					)}
				</p>
			</ClassicField>
		</div>
	);
};

const SinglePage = () => {
	const { meta, upgradeUrl } = useSelect((select) => {
		const store = select(STORE_NAME);
		return {
			meta: store.getSinglePageMeta(),
			upgradeUrl: store.getDashboardInfo().upgradeUrl,
		};
	}, []);

	const { draft, isSaving, update, save, reset } = useSettingsDraft({
		selector: 'getSinglePageSettings',
		action: 'saveSinglePage',
		defaultsKey: 'singlePageDefaults',
		// Only Save reports back — Reset restores in place, quietly.
		silentReset: true,
	});

	const isBlockTemplate = 'block' === draft.single_page_template_source;
	const isThemeMismatch = isBlockTemplate && !meta.isBlockTheme;
	let themeNotice = __(
		'The Classic template is rendered by the plugin and works with both classic and block themes.',
		'team-free'
	);
	if (isThemeMismatch) {
		themeNotice = __(
			'On a classic theme the Block template shows your last Site Editor design inside your theme (or the default member blocks if none was saved). To change that design, switch to a block theme (e.g. Twenty Twenty-Five) and edit it in the Site Editor.',
			'team-free'
		);
	} else if (isBlockTemplate) {
		themeNotice = __('The Block template is built in the Site Editor.', 'team-free');
	}
	const activeThemeNotice = meta.isBlockTheme
		? /* translators: %s: active theme name. */
			__('Your active theme, %s, is a block theme.', 'team-free')
		: /* translators: %s: active theme name. */
			__('Your active theme, %s, is a classic theme.', 'team-free');

	return (
		<div className="sptp-single-page">
			<div className="sptp-single-page__head">
				<div className="sptp-single-page__text">
					<h2>{__('Template Type', 'team-free')}</h2>
					<p>{__('Select your preferred template type to customize', 'team-free')}</p>
				</div>

				<div className="sptp-single-page__source">
					<select
						id="sptp-single-page-source"
						className="sptp-single-page__select"
						value={draft.single_page_template_source || 'plugin'}
						aria-label={__('Template Type', 'team-free')}
						onChange={(event) =>
							update('single_page_template_source', event.target.value)
						}
					>
						{TEMPLATE_SOURCES.map((source) => (
							<option key={source.value} value={source.value}>
								{source.label}
							</option>
						))}
					</select>

					{isBlockTemplate && meta.editorUrl && (
						<a className="sptp-single-page__link" href={meta.editorUrl}>
							{__('Edit single page template', 'team-free')}
							<span className="sptp-single-page__link-icon">
								<ArrowUpRightIcon />
							</span>
						</a>
					)}
					{isBlockTemplate && !meta.editorUrl && meta.isBlockTheme && (
						<p className="sptp-single-page__note">
							{__(
								'You need permission to edit theme templates to open the single page template.',
								'team-free'
							)}
						</p>
					)}
				</div>

				<SaveAndReset isSaving={isSaving} onSave={save} onReset={reset} />
			</div>

			<div
				className={`sptp-single-page__notice${isThemeMismatch ? ' is-warning' : ''}`}
				role="note"
			>
				{themeNotice} {sprintf(activeThemeNotice, meta.themeName || '')}
			</div>

			{/* The Site Editor template is laid out with blocks, so these fields —
			    which configure the plugin template — have nothing to act on. */}
			{!isBlockTemplate && (
				<ClassicSettings
					draft={draft}
					update={update}
					meta={meta}
					upgradeUrl={upgradeUrl}
				/>
			)}
		</div>
	);
};

export default SinglePage;
