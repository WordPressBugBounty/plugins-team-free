import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';
import {
	VersionBadgeIcon,
	SupportIcon,
	HelpArrowIcon,
	HelpDocumentationIcon,
	HelpSupportTicketIcon,
	HelpFeatureRequestIcon,
	HelpVideoIcon,
	HelpBlogIcon,
	HelpCommunityIcon,
	HelpAboutUsIcon,
} from './icons';
import { HelpSetupWizardIcon } from './SavedTemplateIcons';
import ChangelogDrawer from './ChangelogDrawer';
import useChangelog from '../hooks/useChangelog';
import { VIDEO_TUTORIALS_URL } from '../constants/media';

/**
 * The dashboard top bar: logo + version pill, page nav, and a hover "Get Help"
 * menu. Ported from Smart Team Pro's header, minus the white-label branding
 * Free does not ship. Get Help → Setup Wizard opens `#setup-wizard`, Get Help →
 * About Us opens `#about-us` (neither is a nav tab).
 *
 * @param {Object}   props
 * @param {Object[]} props.menuItems   `{ value, label, badge?, icon?, separator? }` per page.
 * @param {string}   props.currentPage Active page value.
 * @param {Function} props.onNavigate  Called with the page value to open.
 */
const Header = ({ menuItems = [], currentPage, onNavigate }) => {
	const { pluginUrl, pluginVersion } = useSelect(
		(select) => select(STORE_NAME).getDashboardInfo(),
		[]
	);

	const [showChangelog, setShowChangelog] = useState(false);
	const { status, changelog, retry } = useChangelog(showChangelog);

	const navRef = useRef();
	const itemsRef = useRef({});
	const [indicator, setIndicator] = useState({ left: 0, width: 0 });

	// The underline slides to whichever item is active, so it has to be measured
	// — the labels are translated and the bar reflows with the window.
	useEffect(() => {
		const item = itemsRef.current[currentPage];
		const nav = navRef.current;
		if (!item || !nav) {
			setIndicator({ left: 0, width: 0 });
			return undefined;
		}

		const update = () => {
			const navRect = nav.getBoundingClientRect();
			const itemRect = item.getBoundingClientRect();
			setIndicator({
				left: itemRect.left - navRect.left + nav.scrollLeft,
				width: itemRect.width,
			});
		};
		update();

		if ('undefined' === typeof ResizeObserver) {
			return undefined;
		}
		const observer = new ResizeObserver(update);
		observer.observe(nav);
		return () => observer.disconnect();
	}, [currentPage, menuItems]);

	const helpItems = [
		{
			title: __('Documentation', 'team-free'),
			Icon: HelpDocumentationIcon,
			link: 'https://docs.getwpteam.com/guide/introduction',
		},
		{
			title: __('Technical Support', 'team-free'),
			Icon: HelpSupportTicketIcon,
			link: 'https://shapedplugin.com/create-new-ticket/',
		},
		{
			title: __('Setup Wizard', 'team-free'),
			Icon: HelpSetupWizardIcon,
			page: 'setup-wizard',
		},
		{
			title: __('Request a Feature', 'team-free'),
			Icon: HelpFeatureRequestIcon,
			link: 'https://shapedplugin.com/contact-us/',
		},
		{
			title: __('Video Tutorials', 'team-free'),
			Icon: HelpVideoIcon,
			link: VIDEO_TUTORIALS_URL,
		},
		{
			title: __('Blog: Latest News', 'team-free'),
			Icon: HelpBlogIcon,
			link: 'https://shapedplugin.com/blog/',
		},
		{
			title: __('Join Community', 'team-free'),
			Icon: HelpCommunityIcon,
			link: 'https://community.shapedplugin.com/',
		},
		{
			title: __('About Us', 'team-free'),
			Icon: HelpAboutUsIcon,
			page: 'about-us',
		},
	];

	return (
		<div className="sptp-topbar">
			<div className="sptp-topbar__inner">
				<div className="sptp-topbar__brand">
					{/* No <img> until the URL is known: before the REST data arrives a
					    relative src would request /wp-admin/dist/images/logo.svg (a 404). */}
					{pluginUrl && (
						<img
							className="sptp-topbar__logo"
							src={`${pluginUrl}dist/images/logo.svg`}
							width="112"
							height="24"
							alt={__('Smart Team', 'team-free')}
						/>
					)}
					{pluginVersion && (
						<button
							type="button"
							className="sptp-topbar__version"
							onClick={() => setShowChangelog(true)}
							aria-haspopup="dialog"
							aria-expanded={showChangelog}
							title={__('View changelog', 'team-free')}
						>
							<VersionBadgeIcon className="sptp-topbar__version-icon" />
							{pluginVersion}
						</button>
					)}
				</div>

				<nav className="sptp-topbar__nav" ref={navRef}>
					<ul>
						{menuItems.map((item) => (
							<li
								key={item.value}
								className={
									item.separator ? 'sptp-topbar__nav-item--separated' : undefined
								}
							>
								<button
									type="button"
									ref={(el) => {
										itemsRef.current[item.value] = el;
									}}
									className={currentPage === item.value ? 'is-active' : ''}
									aria-current={currentPage === item.value ? 'page' : undefined}
									onClick={() => onNavigate(item.value)}
								>
									{item.icon && (
										<span className="sptp-topbar__nav-icon">{item.icon}</span>
									)}
									{item.label}
									{item.badge && (
										<span className="sptp-topbar__badge">
											{__('NEW!', 'team-free')}
										</span>
									)}
								</button>
							</li>
						))}
					</ul>
					<span
						className="sptp-topbar__indicator"
						style={{
							left: `${indicator.left}px`,
							width: `${indicator.width}px`,
						}}
					/>
				</nav>

				{/* The trigger only opens the menu (hover / focus) — it never navigates. */}
				<div className="sptp-topbar__support">
					<button type="button" className="sptp-topbar__help" aria-haspopup="true">
						<SupportIcon className="sptp-topbar__help-icon" />
						{__('Get Help', 'team-free')}
					</button>

					<div className="sptp-topbar__help-menu">
						{helpItems.map(({ title, link, Icon, page }) => (
							<a
								key={title}
								className="sptp-topbar__help-item"
								href={page ? `#${page}` : link}
								{...(page
									? {
											onClick: (event) => {
												event.preventDefault();
												onNavigate(page);
											},
										}
									: { target: '_blank', rel: 'noopener noreferrer' })}
							>
								<Icon />
								<span>{title}</span>
								<span className="sptp-topbar__help-arrow">
									<HelpArrowIcon />
								</span>
							</a>
						))}
					</div>
				</div>
			</div>

			<ChangelogDrawer
				open={showChangelog}
				onClose={() => setShowChangelog(false)}
				status={status}
				changelog={changelog}
				retry={retry}
			/>
		</div>
	);
};

export default Header;
