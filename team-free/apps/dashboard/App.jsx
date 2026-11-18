import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { Toaster } from 'react-hot-toast';
import { STORE_NAME } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import { toastStyle } from './utils/toast';
import usePinAdminMenu from './hooks/usePinAdminMenu';
import useAdminMenuHeight from './hooks/useAdminMenuHeight';
import useSubmenuHighlight from './hooks/useSubmenuHighlight';
import GettingStarted from './pages/GettingStarted';
import Blocks from './pages/Blocks';
import Modules from './pages/Modules';
import SavedTemplates from './pages/SavedTemplates';
import SinglePage from './pages/SinglePage';
import Settings from './pages/Settings';
import LiteVsPro from './pages/LiteVsPro';
import AboutUs from './pages/AboutUs';
import OurPlugins from './pages/OurPlugins';
import { OurPluginsIcon } from './components/icons';
import SetupWizard from './wizard/SetupWizard';

const DEFAULT_PAGE = 'getting-start';

const MENU = [
	{ value: DEFAULT_PAGE, label: __('Dashboard', 'team-free') },
	{ value: 'blocks', label: __('Blocks', 'team-free'), badge: 'new' },
	{ value: 'saved_templates', label: __('Saved Templates', 'team-free') },
	{ value: 'templates', label: __('Single Page', 'team-free') },
	{ value: 'modules', label: __('Modules', 'team-free') },
	{ value: 'settings', label: __('Settings', 'team-free') },
	// `separator` draws a divider before the item, setting the upsell tabs apart.
	{ value: 'lite-vs-pro', label: __('Lite vs Pro', 'team-free'), separator: true },
	{ value: 'our-plugins', label: __('Our Plugins', 'team-free'), icon: <OurPluginsIcon /> },
];

/* Pages own the part after `=` (Settings keeps its sub-tab there as
   `#settings=performance`, Single Page as `#templates=basic`), so only the part before it selects the page.
   Anything that is not a known page — `#foo`, or the Help page's old
   `#get-start` — falls back to the default page. */
// Reached from Get Help → Setup Wizard; not a nav tab.
const WIZARD_PAGE = 'setup-wizard';
// Reached from Get Help → About Us; not a nav tab (as in testimonial-free).
const ABOUT_PAGE = 'about-us';

const readHash = () => {
	const hash = window.location?.hash?.replace('#', '').split('=')[0];
	if (WIZARD_PAGE === hash || ABOUT_PAGE === hash) {
		return hash;
	}
	return MENU.some((item) => item.value === hash) ? hash : DEFAULT_PAGE;
};

const App = () => {
	const [page, setPage] = useState(readHash());
	const rootRef = useRef();
	usePinAdminMenu(rootRef);
	useAdminMenuHeight();

	useSubmenuHighlight(page);

	const loading = useSelect((select) => select(STORE_NAME).isLoading(), []);
	const error = useSelect((select) => select(STORE_NAME).getError(), []);
	const hasData = useSelect((select) => !!select(STORE_NAME).getDashboardInfo().pluginUrl, []);
	const canInstallPlugins = useSelect(
		(select) => !!select(STORE_NAME).getDashboardInfo().canInstallPlugins,
		[]
	);
	// The Our Plugins cards come from a route that needs `install_plugins`, so
	// an admin without it (multisite sub-site, DISALLOW_FILE_MODS) gets no tab.
	const menuItems = canInstallPlugins
		? MENU
		: MENU.filter((item) => 'our-plugins' !== item.value);
	const { fetchApiData } = useDispatch(STORE_NAME);

	useEffect(() => {
		fetchApiData();
	}, [fetchApiData]);

	// Keep the page in sync with the browser hash (links, back/forward).
	useEffect(() => {
		const onHashChange = () => setPage(readHash());
		window.addEventListener('hashchange', onHashChange);
		return () => window.removeEventListener('hashchange', onHashChange);
	}, []);

	const goTo = (value) => {
		setPage(value);
		window.location.hash = value === DEFAULT_PAGE ? '' : value;
	};

	/* The wizard owns the whole screen rather than sitting inside the dashboard
	   shell, so it renders instead of the header/footer, once the payload is in. */
	if (WIZARD_PAGE === page && hasData) {
		return (
			<div className="sptp-dashboard sptp-dashboard--wizard" ref={rootRef}>
				<SetupWizard onExit={() => goTo(DEFAULT_PAGE)} />
			</div>
		);
	}

	return (
		<div className="sptp-dashboard" ref={rootRef}>
			<Header menuItems={menuItems} currentPage={page} onNavigate={goTo} />

			<div className="sptp-dashboard-body">
				{/* Core admin's own spinner and notice styles: pulling in
				    @wordpress/components for these two would load ~1 MB of script. */}
				{loading && !hasData && (
					<div className="sptp-loading">
						<span className="spinner is-active" style={{ float: 'none', margin: 0 }} />
					</div>
				)}
				{error && (
					<div className="notice notice-error inline">
						<p>{error}</p>
						<p>
							<button type="button" className="button" onClick={fetchApiData}>
								{__('Retry', 'team-free')}
							</button>
						</p>
					</div>
				)}
				{hasData && DEFAULT_PAGE === page && <GettingStarted />}
				{hasData && 'blocks' === page && <Blocks />}
				{hasData && 'modules' === page && <Modules />}
				{hasData && 'saved_templates' === page && <SavedTemplates />}
				{hasData && 'templates' === page && <SinglePage />}
				{hasData && 'settings' === page && <Settings />}
				{hasData && 'lite-vs-pro' === page && <LiteVsPro />}
				{hasData && 'our-plugins' === page && canInstallPlugins && <OurPlugins />}
				{hasData && ABOUT_PAGE === page && <AboutUs />}
			</div>

			<Footer />

			<Toaster
				position="top-right"
				toastOptions={{
					// One look for every toast (the block / module switches use the
					// same object), incl. a top margin that clears the wp-admin bar.
					style: {
						...toastStyle,
						borderRadius: '10px',
						maxWidth: '400px',
					},
				}}
			/>
		</div>
	);
};

export default App;
