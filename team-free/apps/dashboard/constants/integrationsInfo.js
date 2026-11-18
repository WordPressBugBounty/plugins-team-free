import { __ } from '@wordpress/i18n';

/**
 * Page-builder integrations shown on Settings > Integrations, each a Module Card
 * with a working switch (`PageBuilders\Manager` loads the builder module while it
 * is on). Keys match `DashboardHelper::INTEGRATIONS`. The icon is
 * `dist/images/modules/{key}.svg`.
 */
const integrationsInfo = [
	{
		key: 'elementor',
		title: __('Elementor', 'team-free'),
		desc: __(
			'Insert your Smart Team saved templates into pages built with Elementor.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/page-builders/elementor',
	},
	{
		key: 'divi',
		title: __('Divi', 'team-free'),
		desc: __('Embed your saved team templates anywhere inside the Divi builder.', 'team-free'),
		docLink: 'https://docs.getwpteam.com/guide/page-builders/divi',
	},
	{
		key: 'wpbakery',
		title: __('WPBakery', 'team-free'),
		desc: __(
			'Drop Smart Team templates into pages built with WPBakery Page Builder.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/page-builders/wpbakery',
	},
	{
		key: 'beaver',
		title: __('Beaver Builder', 'team-free'),
		desc: __('Insert your team templates inside the Beaver Builder editor.', 'team-free'),
		docLink: 'https://docs.getwpteam.com/guide/page-builders/beaver-builder',
	},
	{
		key: 'oxygen',
		title: __('Oxygen', 'team-free'),
		desc: __('Use Smart Team saved templates within the Oxygen visual builder.', 'team-free'),
		docLink: 'https://docs.getwpteam.com/guide/page-builders/oxygen',
	},
	{
		key: 'bricks',
		title: __('Bricks', 'team-free'),
		desc: __('Add your team templates to designs built with the Bricks builder.', 'team-free'),
		docLink: 'https://docs.getwpteam.com/guide/page-builders/bricks',
	},
];

export default integrationsInfo;
