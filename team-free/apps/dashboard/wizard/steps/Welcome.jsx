import { __, sprintf } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../../store';
import VideoEmbed from '../../components/VideoEmbed';
import { INTRO_VIDEO_ID, introVideoPoster } from '../../constants/media';
import { FeatureCheckIcon } from '../Icons';

const greeting = () => {
	const hour = new Date().getHours();

	if (hour >= 5 && hour < 12) {
		return __('Good morning', 'team-free');
	}
	if (hour >= 12 && hour < 17) {
		return __('Good afternoon', 'team-free');
	}
	if (hour >= 17 && hour < 21) {
		return __('Good evening', 'team-free');
	}
	return __('Good night', 'team-free');
};

/* Two columns, each filled top-to-bottom, as the design lays them out. Free
   features only — the counts follow the Lite vs Pro table (pages/LiteVsPro.jsx). */
const FEATURE_COLUMNS = [
	[
		__('Add Members in Seconds', 'team-free'),
		__('12 Modern Gutenberg Blocks', 'team-free'),
		__('Grid & Carousel Layouts', 'team-free'),
		__('Classic or Gutenberg Member Editor', 'team-free'),
	],
	[
		__('Member Single Page Details', 'team-free'),
		__('Ajax Pagination', 'team-free'),
		__('Saved Templates as Shortcodes', 'team-free'),
		__('Elementor, Divi, Beaver & More.', 'team-free'),
	],
];

/**
 * Wizard step 1 — greeting, the free feature list and the intro video.
 */
const Welcome = () => {
	const { userName, pluginUrl } = useSelect(
		(select) => select(STORE_NAME).getDashboardInfo(),
		[]
	);

	return (
		<div className="sptp-wizard-welcome">
			<div className="sptp-wizard-welcome__text">
				<div className="sptp-wizard-welcome__title">
					<div className="sptp-wizard-welcome__headings">
						<p className="sptp-wizard-welcome__greeting">
							{userName
								? sprintf(
										/* translators: 1: time-of-day greeting, 2: user display name. */
										__('%1$s, %2$s', 'team-free'),
										greeting(),
										userName
									)
								: greeting()}
						</p>
						<h1 className="sptp-wizard-welcome__heading">
							{createInterpolateElement(
								__('Welcome to <brand>Smart Team!</brand>', 'team-free'),
								{
									brand: <span className="sptp-wizard-welcome__brand" />,
								}
							)}
						</h1>
					</div>
					<p className="sptp-wizard-welcome__lead">
						{__(
							'Thanks for installing Smart Team — This plugin gives you everything you need to create clean and interactive team sections, without touching a line of code.',
							'team-free'
						)}
					</p>
				</div>

				<div className="sptp-wizard-welcome__features">
					<p className="sptp-wizard-welcome__lead">
						{createInterpolateElement(
							__(
								'Get set up in minutes and start showcasing your team members using <strong>flexible blocks and ready-made patterns</strong>. Packed with features, including:',
								'team-free'
							),
							{ strong: <strong /> }
						)}
					</p>
					<div className="sptp-wizard-welcome__feature-row">
						{FEATURE_COLUMNS.map((column, index) => (
							<ul key={index} className="sptp-wizard-welcome__feature-list">
								{column.map((feature) => (
									<li key={feature} className="sptp-wizard-feature">
										<FeatureCheckIcon />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						))}
					</div>
				</div>
			</div>

			<div className="sptp-wizard-welcome__video">
				<VideoEmbed poster={introVideoPoster(pluginUrl)} videoId={INTRO_VIDEO_ID} />
			</div>
		</div>
	);
};

export default Welcome;
