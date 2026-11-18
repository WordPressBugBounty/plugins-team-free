import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';
import { ProCrownIcon } from '../../components/icons';
import Testimonials from './LiteVsPro/Testimonials';

const PRICING_URL = 'https://getwpteam.com/pricing/?utm_source=free-plugin&utm_medium=lite-vs-pro';
const FEATURES_URL = 'https://getwpteam.com/?utm_source=free-plugin&utm_medium=lite-vs-pro';

const CheckIcon = () => (
	<svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true">
		<path
			d="M3.5 9.5 7 13l7.5-8"
			stroke="#00ba37"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const CloseIcon = () => (
	<svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true">
		<path
			d="M4.5 4.5l9 9M13.5 4.5l-9 9"
			stroke="#f2545b"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/* Row shape: `free` / `pro` is 'yes', 'no', a number (bold) or any other string
   passed through verbatim, with independent `new` / `hot` flags. Every count is
   the number of options the block inspector really offers — Free's side is the
   matching `Pro_Gate::FREE_*` list, Pro's side the full picker. Free-only
   behaviour belongs here too (a Pro "no"), never a claim Free cannot keep. */
const FEATURES = [
	{ title: __('All Free Version Features', 'team-free'), free: 'yes', pro: 'yes' },
	{
		title: __(
			'Gutenberg Blocks (Grid, Carousel, 3D Carousel, Member Details, etc.)',
			'team-free'
		),
		free: 12,
		pro: 25,
		hot: true,
	},
	{
		title: __('Member Card Designs (incl. 5 Overlay Designs)', 'team-free'),
		free: 3,
		pro: 15,
	},
	{
		title: __('Grid Styles (Grid, Polaroid, Staggered)', 'team-free'),
		free: 1,
		pro: 3,
	},
	{
		title: __('Carousel Styles (Default, Center, Ticker, Multi-Row)', 'team-free'),
		free: 1,
		pro: 4,
	},
	{
		title: __('Carousel Slide Effects (Fade, Spring) & Vertical Display', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Carousel Navigation Arrow Styles', 'team-free'),
		free: 12,
		pro: 12,
	},
	{
		title: __(
			'Carousel Pagination Styles (Dots, Number, Dynamic, Strokes, Scrollbar, etc.)',
			'team-free'
		),
		free: 2,
		pro: 7,
	},
	{
		title: __('Navigation Arrow Show on Hover & Custom Offsets', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('3D Carousel Block (3D & Panorama Styles)', 'team-free'),
		free: 'no',
		pro: 'yes',
		new: true,
	},
	{
		title: __('Filter Members by Groups & Specific Members', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Exclude Members', 'team-free'),
		free: 'yes',
		pro: 'yes',
	},
	{
		title: __('Ajax Pagination', 'team-free'),
		free: 'yes',
		pro: 'yes',
	},
	{
		title: __('Ajax Member Search & Live Frontend Filter', 'team-free'),
		free: 'no',
		pro: 'yes',
		new: true,
		hot: true,
	},
	{
		title: __('Member Details Open as (Single Page, Modal)', 'team-free'),
		free: 1,
		pro: 2,
	},
	{
		title: __('Make Clickable (Image, Name, Image and Name, Full Card)', 'team-free'),
		free: 1,
		pro: 4,
	},
	{
		title: __('Card Content Hover Effects & Hover Content', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Member Image Hover Effects', 'team-free'),
		free: 3,
		pro: 11,
	},
	{
		title: __('Member Image Masking Shapes', 'team-free'),
		free: 1,
		pro: __('All', 'team-free'),
	},
	{
		title: __('Image Flip, Lazy Loading, Special Tag & Image Filters', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Member Bio Auto Fallback, Character Limit & Ellipsis', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Member Social Profiles', 'team-free'),
		free: 'yes',
		pro: 'yes',
	},
	{
		title: __(
			'Social Profiles Custom Styling (Color, Background, Border, Shadow)',
			'team-free'
		),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Additional Information in the Member Card', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Drag & Drop Sorting of Card Content Elements', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Unlimited Custom Fields for Members', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Motion Effects', 'team-free'),
		free: 'no',
		pro: 'yes',
		new: true,
	},
	{
		title: __('SEO Schema Markup', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Ready Patterns Library', 'team-free'),
		free: __('Free Patterns', 'team-free'),
		pro: __('All Patterns', 'team-free'),
		hot: true,
	},
	{
		title: __('Saved Templates (Convert Blocks to Shortcodes)', 'team-free'),
		free: 'yes',
		pro: 'yes',
	},
	{
		title: __('Single Page Template for Members (Site Editor)', 'team-free'),
		free: 'yes',
		pro: 'yes',
	},
	{
		title: __(
			'Page Builder Integrations (Elementor, Divi, WPBakery, Oxygen, Beaver, Bricks)',
			'team-free'
		),
		free: 'yes',
		pro: 'yes',
	},
	{
		title: __('White Label', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('All Premium Features', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
	{
		title: __('Priority Top-notch Support', 'team-free'),
		free: 'no',
		pro: 'yes',
	},
];

/**
 * One Free/Pro cell: 'yes' and 'no' become the tick and cross, a number or any
 * other string is printed bold as written.
 *
 * @param {Object}        props
 * @param {string|number} props.value Cell value from the FEATURES row.
 */
const Cell = ({ value }) => {
	if ('yes' === value) {
		return <CheckIcon />;
	}
	if ('no' === value) {
		return <CloseIcon />;
	}
	return <b>{value}</b>;
};

/**
 * The Lite vs Pro page: a Free / Pro comparison table with an upgrade button,
 * a closing call to action and real user reviews. Ported from wp-carousel-free's page.
 */
const LiteVsPro = () => {
	const { upgradeUrl } = useSelect((select) => select(STORE_NAME).getDashboardInfo(), []);
	const pricingUrl = upgradeUrl || PRICING_URL;

	return (
		<div className="sptp-lite-vs-pro">
			<div className="sptp-lite-vs-pro__card">
				<div className="sptp-lite-vs-pro__title">
					<div>
						<h2>{__('Lite vs Pro Comparison', 'team-free')}</h2>
						<p>
							{__(
								'Get Smart Team Pro today and unlock all the powerful features',
								'team-free'
							)}
						</p>
					</div>
					<a
						className="sptp-btn-upgrade"
						href={pricingUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						<ProCrownIcon color="currentColor" fill="none" size={18} />
						{__('Upgrade to Pro Now!', 'team-free')}
					</a>
				</div>

				<div className="sptp-lite-vs-pro__table" role="table">
					<div className="sptp-lite-vs-pro__row sptp-lite-vs-pro__row--head" role="row">
						<span className="sptp-lite-vs-pro__feature" role="columnheader">
							{__('Features', 'team-free')}
						</span>
						<span className="sptp-lite-vs-pro__col" role="columnheader">
							{__('Lite', 'team-free')}
						</span>
						<span className="sptp-lite-vs-pro__col" role="columnheader">
							<ProCrownIcon color="currentColor" fill="none" size={18} />
							{__('Pro', 'team-free')}
						</span>
					</div>
					{FEATURES.map((row) => (
						<div key={row.title} className="sptp-lite-vs-pro__row" role="row">
							<span className="sptp-lite-vs-pro__feature" role="cell">
								{row.title}
								{row.new && (
									<span className="sptp-lite-vs-pro__badge sptp-lite-vs-pro__badge--new">
										{__('New', 'team-free')}
									</span>
								)}
								{row.hot && (
									<span className="sptp-lite-vs-pro__badge sptp-lite-vs-pro__badge--hot">
										{__('Hot', 'team-free')}
									</span>
								)}
							</span>
							<span className="sptp-lite-vs-pro__col" role="cell">
								<Cell value={row.free} />
							</span>
							<span className="sptp-lite-vs-pro__col" role="cell">
								<Cell value={row.pro} />
							</span>
						</div>
					))}
				</div>
			</div>

			<div className="sptp-lite-vs-pro__cta">
				<h2>{__('Upgrade To PRO & Enjoy Advanced Features!', 'team-free')}</h2>
				<p>
					{__(
						'Unlock every block option, Ajax search and filtering, modal details and the full Ready Patterns library.',
						'team-free'
					)}
				</p>
				<div className="sptp-lite-vs-pro__cta-buttons">
					<a
						className="sptp-btn-upgrade"
						href={pricingUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('Upgrade to Pro Now!', 'team-free')}
					</a>
					<a
						className="sptp-btn sptp-btn--outline"
						href={FEATURES_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('See Full Features', 'team-free')}
					</a>
				</div>
			</div>

			<Testimonials />
		</div>
	);
};

export default LiteVsPro;
