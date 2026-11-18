import { __ } from '@wordpress/i18n';

/**
 * Modules shown on the Modules page, in display order. Each entry:
 * - key:   stable id used in settings.modules[key] (Pro's keys, so a choice
 *          carries across both plugins)
 * - title, desc
 * - docLink: optional external link
 * - hasSettings: a Free-switchable module whose card shows a gear for its drawer
 *
 * Whether a module is Free or Pro is not stored here: the server sends the
 * switchable keys as `dashboardInfo.freeModules` (DashboardHelper::FREE_MODULES)
 * and everything else renders as Pro. The icon is
 * `dist/images/modules/{key}.svg`, a Figma export carrying its own gradient tile.
 */
const modulesInfo = [
	{
		key: 'member_social',
		title: __('Member Social Profiles', 'team-free'),
		desc: __(
			'This lets you enable or disable the social profile field to add social media links for each team member.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#member-social-profiles',
	},
	{
		key: 'ai_team_builder',
		title: __('Built Team with AI', 'team-free'),
		desc: __(
			'This lets you describe the team section you want and have the AI builder assemble it for you, then refine it in place. Uses your own AI provider key.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#create-team-with-ai',
	},
	{
		key: 'ready_patterns',
		title: __('Ready Patterns Library', 'team-free'),
		desc: __(
			'This enables you to access pre-designed layout patterns to quickly build team sections without starting from scratch.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#ready-patterns-library',
	},
	{
		key: 'preloader',
		hasSettings: true,
		title: __('Preloader', 'team-free'),
		desc: __(
			'It allows you to display a loading animation before team content appears, improving perceived performance and feedback.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#preloader',
	},
	{
		key: 'member_resume',
		title: __('Member Resume', 'team-free'),
		desc: __(
			'This lets you enable or disable the resume field to add detailed profile information for each team member.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#member-resume',
	},
	{
		key: 'member_video',
		title: __('Member Video', 'team-free'),
		desc: __(
			'This allows you to enable or disable the video field to add video content for each team member.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#member-video',
	},
	{
		key: 'member_skills',
		title: __('Member Skills', 'team-free'),
		desc: __(
			'This lets you enable or disable the skills field to add skills and expertise for each team member.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#member-skills',
	},
	{
		key: 'member_gallery',
		title: __('Member Photo Gallery', 'team-free'),
		desc: __(
			'This lets you enable or disable the photo gallery field to add multiple images for each team member.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#member-photo-gallery',
	},
	{
		key: 'custom_fields',
		title: __('Custom Fields', 'team-free'),
		desc: __(
			'This allows you to enable or disable custom fields to add additional structured data for each team member.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#custom-fields',
	},
	{
		key: 'motion_effects',
		title: __('Motion Effects', 'team-free'),
		desc: __(
			'This enables you to add animations and motion effects to team layouts for a more dynamic visual experience.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#motion-effects',
	},
	{
		key: 'white_label',
		title: __('White Label Branding', 'team-free'),
		desc: __(
			'This allows you to replace Smart Team branding with your own brand name and logo for a fully customized client experience.',
			'team-free'
		),
		// The card's gear opens the settings drawer (Free: the custom labels).
		hasSettings: true,
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#white-label-branding',
	},
	{
		key: 'seo_schema',
		title: __('SEO Schema Markup', 'team-free'),
		desc: __(
			'It enables structured data for your team members to improve search engine visibility and enhance how they appear in search results.',
			'team-free'
		),
		docLink: 'https://docs.getwpteam.com/guide/dashboard/modules#seo-schema-markup',
	},
];

export default modulesInfo;
