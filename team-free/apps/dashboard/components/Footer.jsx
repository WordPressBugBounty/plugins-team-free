import { __ } from '@wordpress/i18n';

const SOCIAL = [
	{
		label: __('LinkedIn', 'team-free'),
		icon: 'dashicons-linkedin',
		url: 'https://www.linkedin.com/company/shapedplugin/',
	},
	{
		label: __('X (Twitter)', 'team-free'),
		icon: 'x',
		// Dashicons has no X logo — WP Carousel Pro's footer SVG.
		svg: (
			<svg
				width="18"
				height="18"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<circle cx="8" cy="8" r="8" fill="currentColor" />
				<path
					d="M8.762 7.462 11.74 4h-.706L8.45 7.006 6.383 4H4.001l3.123 4.545-3.123 3.63h.706l2.73-3.174 2.182 3.175H12zm-.967 1.124-.316-.453L4.961 4.53h1.084l2.032 2.907.317.453 2.64 3.778H9.952z"
					fill="#fff"
				/>
			</svg>
		),
		url: 'https://x.com/shapedplugin',
	},
	{
		label: __('WordPress', 'team-free'),
		icon: 'dashicons-wordpress',
		url: 'https://wordpress.org/plugins/team-free/',
	},
	{
		label: __('Facebook', 'team-free'),
		icon: 'dashicons-facebook',
		url: 'https://www.facebook.com/shapedplugin',
	},
	{
		label: __('YouTube', 'team-free'),
		icon: 'dashicons-video-alt3',
		url: 'https://www.youtube.com/@ShapedPlugin',
	},
];

const Footer = () => (
	<div className="sptp-footer">
		<div className="sptp-footer__made">
			{__('Made with', 'team-free')}
			<span className="dashicons dashicons-heart sptp-footer__heart" />
			{__('by the', 'team-free')}
			<a href="https://shapedplugin.com/about-us/" target="_blank" rel="noopener noreferrer">
				{__('ShapedPlugin LLC Team', 'team-free')}
			</a>
		</div>

		<div className="sptp-footer__social">
			<span>{__('Get Connected with', 'team-free')}</span>
			{SOCIAL.map((item) => (
				<a
					key={item.icon}
					href={item.url}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={item.label}
				>
					{item.svg || <span className={`dashicons ${item.icon}`} />}
				</a>
			))}
		</div>

		<div className="sptp-footer__rate">
			{__('Enjoyed Smart Team?', 'team-free')}
			<a
				href="https://wordpress.org/support/plugin/team-free/reviews/"
				target="_blank"
				rel="noopener noreferrer"
			>
				{__('Rate us!', 'team-free')}
			</a>
			<span className="sptp-footer__stars">
				{[1, 2, 3, 4, 5].map((n) => (
					<span key={n} className="dashicons dashicons-star-filled" />
				))}
			</span>
		</div>
	</div>
);

export default Footer;
