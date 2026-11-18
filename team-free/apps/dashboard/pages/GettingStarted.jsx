import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';
import VideoEmbed from '../components/VideoEmbed';
import { INTRO_VIDEO_ID, introVideoPoster } from '../constants/media';
import { DEEP_LINK } from '../../blocks/shared/ready-patterns/constants';
import { buildAIBuilderEditorUrl } from '../../blocks/shared/aiBuilderDeepLink';
import Placements from './GettingStarted/Placements';
import { greeting } from './GettingStarted/usageHelpers';

const ReadyPatternsIcon = () => (
	<svg
		className="sptp-gs__buttons-icon"
		width={18}
		height={18}
		viewBox="0 0 18 18"
		fill="currentColor"
		aria-hidden="true"
	>
		<path d="M7.16323 0C7.569 0 7.89776 0.328761 7.89776 0.734529V7.16323C7.89776 7.569 7.569 7.89776 7.16323 7.89776H0.734529C0.328761 7.89776 0 7.569 0 7.16323V0.734529C0 0.328761 0.328761 0 0.734529 0H7.16323ZM1.46906 6.4287H6.4287V1.46906H1.46906V6.4287Z" />
		<path d="M17.2655 0C17.6712 0 18 0.328761 18 0.734529V7.16323C18 7.569 17.6712 7.89776 17.2655 7.89776H10.8368C10.431 7.89776 10.1022 7.569 10.1022 7.16323V0.734529C10.1022 0.328761 10.431 0 10.8368 0H17.2655ZM11.5713 6.4287H16.5309V1.46906H11.5713V6.4287Z" />
		<path d="M17.2655 10.1022C17.6712 10.1022 18 10.431 18 10.8368V17.2655C18 17.6712 17.6712 18 17.2655 18H10.8368C10.431 18 10.1022 17.6712 10.1022 17.2655V10.8368C10.1022 10.431 10.431 10.1022 10.8368 10.1022H17.2655ZM11.5713 16.5309H16.5309V11.5713H11.5713V16.5309Z" />
		<path d="M7.16323 10.1022C7.569 10.1022 7.89776 10.431 7.89776 10.8368V17.2655C7.89776 17.6712 7.569 18 7.16323 18H0.734529C0.328761 18 0 17.6712 0 17.2655V10.8368C0 10.431 0.328761 10.1022 0.734529 10.1022H7.16323ZM1.46906 16.5309H6.4287V11.5713H1.46906V16.5309Z" />
	</svg>
);

const SparkleIcon = () => (
	<svg
		className="sptp-gs__buttons-icon"
		width={20}
		height={20}
		viewBox="0 0 20 20"
		fill="currentColor"
		aria-hidden="true"
	>
		<path d="M10 20C4.45602 20 0 15.4745 0 10C0 4.52546 4.45602 0 10 0C15.544 0 20 4.52546 20 10C19.9421 15.544 15.4745 20 10 20ZM10 1.01852C5.08102 1.01852 1.06481 5.09259 1.06481 10C1.06481 14.9074 5.08102 18.9352 10 18.9352C14.919 18.9352 18.9352 14.919 18.9352 10C18.9352 5.08102 14.919 1.01852 10 1.01852Z" />
		<path d="M9.87797 4.73316C9.92207 4.62383 10.0779 4.62383 10.122 4.73316L10.6594 6.06515C11.2666 7.57031 12.4755 8.75794 13.9977 9.34488L15.3812 9.87832C15.4931 9.92144 15.4931 10.0786 15.3812 10.1217L13.9977 10.6551C12.4755 11.2421 11.2666 12.4297 10.6594 13.9348L10.122 15.2668C10.0779 15.3762 9.92207 15.3762 9.87797 15.2668L9.34061 13.9348C8.7334 12.4297 7.52455 11.2421 6.00229 10.6551L4.61877 10.1217C4.50693 10.0786 4.50693 9.92144 4.61877 9.87832L6.00229 9.34488C7.52456 8.75794 8.7334 7.57031 9.34061 6.06515L9.87797 4.73316Z" />
	</svg>
);

const PlusIcon = () => (
	<svg
		className="sptp-gs__buttons-icon"
		width={14}
		height={14}
		viewBox="0 0 14 14"
		fill="none"
		aria-hidden="true"
	>
		<path d="M6 8H0V6H6V0H8V6H14V8H8V14H6V8Z" fill="currentColor" />
	</svg>
);

const GettingStarted = () => {
	const { homeUrl, adminUrl, pluginUrl, userName, siteAllowsAI, hasShowcases } = useSelect(
		(select) => select(STORE_NAME).getDashboardInfo(),
		[]
	);
	const isAIModuleOn = useSelect(
		(select) => !!select(STORE_NAME).getSettings().modules?.ai_team_builder,
		[]
	);

	// Seeded from the stored report so the copy doesn't flip on load; a first scan or a Sync corrects it.
	const [isReturning, setIsReturning] = useState(!!hasShowcases);
	const handleReport = useCallback(
		(report) => setIsReturning(Array.isArray(report?.rows) && report.rows.length > 0),
		[]
	);
	// The copy names only the entry points actually on screen (WP Carousel Free's rule).
	const showAIButton = isAIModuleOn && siteAllowsAI;

	const resolvedAdminUrl = adminUrl || `${homeUrl || ''}wp-admin/`;
	// A new page in the block editor with the inserter open on the Smart Team category (Real Testimonials' flow).
	const createUrl = `${resolvedAdminUrl}post-new.php?post_type=page&sptpblock_inserter=true`;
	// A new page with the AI Team Builder already open.
	const aiBuilderUrl = buildAIBuilderEditorUrl(resolvedAdminUrl);
	// A new page that opens the Ready Patterns library on "All Patterns".
	const patternsUrl = `${resolvedAdminUrl}post-new.php?post_type=page&${DEEP_LINK.QUERY_ARG}=true`;
	const newPageUrl = `${resolvedAdminUrl}post-new.php?post_type=page`;

	return (
		<div className="sptp-gs">
			<div className="sptp-gs__hero">
				<div className="sptp-gs__intro">
					<p className="sptp-gs__greeting">
						{userName
							? sprintf(
									/* translators: 1: "Good morning" / "Good afternoon" / "Good evening", 2: user display name. */
									__('%1$s, %2$s!', 'team-free'),
									greeting(),
									userName
								)
							: sprintf(
									/* translators: %s: "Good morning" / "Good afternoon" / "Good evening". */
									__('%s!', 'team-free'),
									greeting()
								)}
					</p>
					<h2 className="sptp-gs__title">
						{isReturning
							? __('Ready to create your next team showcase?', 'team-free')
							: __('Welcome to Smart Team 👋', 'team-free')}
					</h2>
					<p className="sptp-gs__subtitle">
						{isReturning && showAIButton
							? __(
									'Start from a ready pattern, let AI build it for you, or start blank.',
									'team-free'
								)
							: isReturning
								? __('Start from a ready pattern or start blank.', 'team-free')
								: __(
										"Introduce your people with a beautiful team showcase in minutes. Choose how you'd like to start.",
										'team-free'
									)}
					</p>

					<div className="sptp-gs__buttons">
						<a className="sptp-btn sptp-btn--primary sptp-btn--icon" href={patternsUrl}>
							<ReadyPatternsIcon />
							{__('Use a Pattern', 'team-free')}
						</a>
						{showAIButton && (
							<a
								className="sptp-btn sptp-btn--secondary sptp-btn--tinted sptp-btn--icon"
								href={aiBuilderUrl}
							>
								<SparkleIcon />
								{__('Build with AI', 'team-free')}
							</a>
						)}
						<a className="sptp-btn sptp-btn--secondary sptp-btn--icon" href={createUrl}>
							<PlusIcon />
							{__('Start Blank', 'team-free')}
						</a>
					</div>
				</div>

				<div className="sptp-gs__media">
					<VideoEmbed poster={introVideoPoster(pluginUrl)} videoId={INTRO_VIDEO_ID} />
				</div>
			</div>

			<Placements createUrl={newPageUrl} onReport={handleReport} />
		</div>
	);
};

export default GettingStarted;
