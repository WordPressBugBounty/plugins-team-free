import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../store';

const ArrowUpRight = ({ size = 20, className }) => (
	<svg
		className={className}
		width={size}
		height={size}
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		focusable="false"
	>
		<path
			d="M5.39024 5.38208L5.44721 6.98286L12.1552 6.73768L4.49121 14.4018L5.62279 15.5328L13.2886 7.86683L13.0432 14.5785L14.6434 14.6355L14.9931 5.03369L5.39024 5.38208Z"
			fill="currentColor"
		/>
	</svg>
);

/* ShapedPlugin's other products as plain links (WP Carousel's About Us list,
   with Smart Team swapped for WP Carousel). Icons ship in dist/images/plugins/
   — never hot-linked, so the page makes no outbound request. */
const MORE_PLUGINS = [
	{
		name: 'Easy Accordion',
		description: __(
			'Minimize customer support by offering comprehensive FAQs and increasing conversions.',
			'team-free'
		),
		url: 'https://easyaccordion.io/',
		icon: 'easy-accordion',
	},
	{
		name: 'Real Testimonials',
		description: __(
			'Simply collect, manage, and display testimonials on your website and boost conversions.',
			'team-free'
		),
		url: 'https://realtestimonials.io/',
		icon: 'real-testimonials',
	},
	{
		name: 'Smart Tabs',
		description: __(
			'Best WooCommerce custom product tabs and WordPress tabs builder plugin to create responsive tabs.',
			'team-free'
		),
		url: 'https://wptabs.com/',
		icon: 'smart-tabs',
	},
	{
		name: 'Smart Post',
		description: __(
			'Filter and display posts (any post type), pages, taxonomies, custom taxonomies and custom fields in beautiful layouts.',
			'team-free'
		),
		url: 'https://wpsmartpost.com/',
		icon: 'smart-post',
	},
	{
		name: 'WP Carousel',
		description: __(
			'Create beautiful image, post, product, video and content carousels, sliders and galleries.',
			'team-free'
		),
		url: 'https://wpcarousel.io/',
		icon: 'wp-carousel',
	},
	{
		name: 'Logo Carousel',
		description: __(
			'Showcase a group of logo images with title, description, tooltips, links and popup as a grid or in a carousel.',
			'team-free'
		),
		url: 'https://logocarousel.com/',
		icon: 'logo-carousel',
	},
	{
		name: 'Location Weather',
		description: __(
			'Display beautiful weather update widgets on your WordPress site in a minute without coding skills!',
			'team-free'
		),
		url: 'https://locationweather.io/',
		icon: 'location-weather',
	},
	{
		name: 'Reno Product Gallery',
		description: __(
			'Product gallery slider and additional variation images gallery for WooCommerce to boost your sales.',
			'team-free'
		),
		url: 'https://woogallery.io/',
		icon: 'woo-gallery',
	},
	{
		name: 'Product Slider for WooCommerce',
		description: __(
			'Boost sales with an interactive product slider, grid and table in your WooCommerce store.',
			'team-free'
		),
		url: 'https://wooproductslider.io/',
		icon: 'reno-product-slider',
	},
	{
		name: 'Reno Product Category',
		description: __(
			'Display a filtered list of categories aesthetically and boost sales.',
			'team-free'
		),
		url: 'https://shapedplugin.com/woocategory/',
		icon: 'reno-product-category',
	},
	{
		name: 'Smart Swatches',
		description: __(
			'The best product variation swatches for WooCommerce to boost your store sales.',
			'team-free'
		),
		url: 'https://shapedplugin.com/smart-swatches-for-woocommerce',
		icon: 'smart-swatches',
	},
	{
		name: 'Smart Brands',
		description: __(
			'Smart Brands for WooCommerce helps you display product brands attractively on your online store.',
			'team-free'
		),
		url: 'https://shapedplugin.com/smart-brands/',
		icon: 'smart-brands',
	},
];

const AboutUs = () => {
	const { pluginUrl, productHomeUrl } = useSelect(
		(select) => select(STORE_NAME).getDashboardInfo(),
		[]
	);

	const teamPhoto = pluginUrl ? `${pluginUrl}dist/images/about-team.webp` : '';

	return (
		<div className="sptp-about">
			<div className="sptp-about-hero">
				<div className="sptp-about-hero__text">
					<h2 className="sptp-about-hero__title">
						{__('The Most Versatile Team Showcase Plugin by Smart Team', 'team-free')}
					</h2>
					<div className="sptp-about-hero__desc">
						<p>
							{createInterpolateElement(
								__(
									'At <b>ShapedPlugin LLC</b>, Back in 2016, while building WordPress websites for clients and partners, we struggled to find a simple, flexible, and reliable way to introduce the people behind a business. Existing solutions lacked the design quality, usability, and customization we needed—so we decided to build our own.',
									'team-free'
								),
								{ b: <strong /> }
							)}
						</p>
						<p>
							{createInterpolateElement(
								__(
									'<b>Smart Team</b> was created to provide a powerful yet easy way to showcase team members, staff, and speakers using grids, carousels, hover overlays, filters, and detailed member profiles. It helps you present your people professionally, build trust, and keep every profile on brand effortlessly—we’re confident you’ll love the experience.',
									'team-free'
								),
								{ b: <strong /> }
							)}
						</p>
					</div>
					<div className="sptp-about-hero__buttons">
						<a
							className="sptp-btn sptp-btn--primary sptp-about-hero__btn"
							href={productHomeUrl || 'https://getwpteam.com/'}
							target="_blank"
							rel="noopener noreferrer"
						>
							{__('Explore Smart Team', 'team-free')}
						</a>
						<a
							className="sptp-btn sptp-btn--outline sptp-about-hero__btn"
							href="https://shapedplugin.com/about-us/"
							target="_blank"
							rel="noopener noreferrer"
						>
							{__('More About Us', 'team-free')}
							<ArrowUpRight className="sptp-about-hero__btn-icon" />
						</a>
					</div>
				</div>
				<div className="sptp-about-hero__media">
					{teamPhoto && (
						<img
							className="sptp-about-hero__image"
							src={teamPhoto}
							alt={__('The Smart Team plugin team', 'team-free')}
						/>
					)}
					<p className="sptp-about-hero__caption">
						{__('The Creative Minds Behind the Smart Team Plugin', 'team-free')}
					</p>
				</div>
			</div>

			<div className="sptp-about-plugins">
				<div className="sptp-about-plugins__header">
					<h2 className="sptp-about-plugins__title">
						{__('Enhance your Website with our Free Robust Plugins', 'team-free')}
					</h2>
					<p className="sptp-about-plugins__subtitle">
						{__(
							'Some of our powerful plugins are ready to make your website awesome.',
							'team-free'
						)}
					</p>
				</div>
				<div className="sptp-about-plugins__grid">
					{MORE_PLUGINS.map((plugin) => (
						<a
							key={plugin.name}
							className="sptp-about-plugin"
							href={plugin.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							{pluginUrl && (
								<img
									className="sptp-about-plugin__icon"
									src={`${pluginUrl}dist/images/plugins/${plugin.icon}.webp`}
									alt=""
									width="48"
									height="48"
									loading="lazy"
								/>
							)}
							<h3 className="sptp-about-plugin__name">{plugin.name}</h3>
							<p className="sptp-about-plugin__desc">{plugin.description}</p>
							<span className="sptp-about-plugin__arrow">
								<ArrowUpRight size={16} />
							</span>
						</a>
					))}
				</div>
			</div>
		</div>
	);
};

export default AboutUs;
