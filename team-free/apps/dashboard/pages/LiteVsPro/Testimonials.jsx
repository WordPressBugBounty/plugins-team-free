import { __, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { STORE_NAME } from '../../store';

/* Ported from wp-carousel-free's Lite vs Pro testimonials. Every review and
   rating is real and quoted verbatim, so only the chrome is translatable. When
   refreshing, copy from the source — never edit a quote or round a score up.
   - WordPress.org: plugin_information for `team-free` (rating 94/100 = 4.7, 92 ratings).
   - Trustpilot: ShapedPlugin's company page (trustpilot.com/review/shapedplugin.com,
     TrustScore 4.9, 182 reviews); the quoted review is Trace Thomas's, about Smart Team.
   Images are local (dist/images/testimonial/) — nothing is hot-linked. A reviewer
   without an `avatar` file shows initials; the three reviewer photos are cropped from
   screenshots the owner supplied. */
const RATINGS = [
	{ source: 'wordpress', logo: 'wordpress-mark.svg', logoWidth: 20, score: '4.7', count: '90+' },
	{
		source: 'trustpilot',
		logo: 'trustpilot-logo.svg',
		logoWidth: 21,
		score: '4.9',
		count: '180+',
	},
];

const REVIEWS = [
	{
		// https://wordpress.org/support/topic/top-plugin-496/ (May 29, 2025) — "Top Plugin"
		name: 'Careervisa',
		role: __('WordPress.org Review', 'team-free'),
		source: 'wordpress',
		avatar: 'avatar-careervisa.png',
		text: 'I screened several plugins when sourcing something for a particular function I had in mind and chose this one. I have the Pro version and it works really well and is easy to install and setup. I did need to raise a ticket, but only because I wasn’t sure how to proceed with one aspect of the tool and I got a response in minutes and my issue was sorted!',
	},
	{
		// ShapedPlugin's Trustpilot page — "Great Support and Great Product", Dec 20, 2025, 5 stars
		// (a screenshot the owner supplied). The "in to" typo is the reviewer's.
		name: 'Trace Thomas',
		role: __('Trustpilot Review', 'team-free'),
		source: 'trustpilot',
		avatar: 'avatar-tracethomas.png',
		text: 'Purchased the Smart Team plugin. Reached out to support about some questions and they helped me through the whole process and made sure the plugin worked just as we needed it. Would recommend this plugin in to anyone looking for search and filter options for their team/directory web page',
	},
	{
		// https://wordpress.org/support/topic/versatile-plugin-great-support-4/ (Mar 21, 2023)
		name: 'candyappledesign',
		role: __('WordPress.org Review', 'team-free'),
		source: 'wordpress',
		avatar: 'avatar-candyappledesign.png',
		text: 'This plugin is easy to set up, and even the free version offers plenty of customization options. I use the paid version for my client websites to access additional features and enhanced support. The support team is exceptionally knowledgeable and worked closely with me to find the right solution for my client’s needs.',
	},
];

/**
 * Five-star strip: one sprite for WordPress.org, five green tiles for Trustpilot.
 *
 * @param {Object}   props
 * @param {string}   props.source 'wordpress' or 'trustpilot'.
 * @param {Function} props.img    Image URL builder.
 * @param {boolean}  props.large  Header-size WordPress sprite.
 */
const Stars = ({ source, img, large = false }) => {
	if ('trustpilot' === source) {
		return (
			<span className="sptp-testimonials__stars sptp-testimonials__stars--trustpilot">
				{[1, 2, 3, 4, 5].map((star) => (
					<span key={star} className="sptp-testimonials__star">
						<img src={img('trustpilot-star.svg')} alt="" />
					</span>
				))}
			</span>
		);
	}

	return (
		<img
			className={`sptp-testimonials__stars sptp-testimonials__stars--wordpress${large ? ' is-large' : ''}`}
			src={img(large ? 'stars-wordpress.svg' : 'stars-wordpress-card.svg')}
			alt=""
		/>
	);
};

const initials = (name) =>
	name
		.split(/\s+/)
		.map((part) => part.charAt(0))
		.join('')
		.slice(0, 2)
		.toUpperCase();

const Testimonials = () => {
	const { pluginUrl } = useSelect((select) => select(STORE_NAME).getDashboardInfo(), []);
	if (!pluginUrl) {
		return null;
	}
	const img = (file) => `${pluginUrl}dist/images/testimonial/${file}`;

	return (
		<div className="sptp-testimonials">
			<div className="sptp-testimonials__header">
				<div className="sptp-testimonials__ratings">
					{RATINGS.map((rating) => (
						<div key={rating.source} className="sptp-testimonials__rating">
							<img
								src={img(rating.logo)}
								width={rating.logoWidth}
								height={20}
								alt=""
							/>
							<Stars source={rating.source} img={img} large />
							<strong>{rating.score}</strong>
							<span>
								{'trustpilot' === rating.source
									? sprintf(
											/* translators: %s: review count, e.g. 180+. */
											__('%s ShapedPlugin Reviews', 'team-free'),
											rating.count
										)
									: sprintf(
											/* translators: %s: review count, e.g. 90+. */
											__('%s Reviews', 'team-free'),
											rating.count
										)}
							</span>
						</div>
					))}
				</div>
				<h2>{__('Don’t Just Take Our Word for It — See What Users Say!', 'team-free')}</h2>
			</div>

			<div className="sptp-testimonials__row">
				{REVIEWS.map((review) => (
					<div key={review.name} className="sptp-testimonials__card">
						<div className="sptp-testimonials__reviewer">
							<span className="sptp-testimonials__avatar" aria-hidden="true">
								{review.avatar ? (
									<img
										className="sptp-testimonials__photo"
										src={img(review.avatar)}
										alt=""
									/>
								) : (
									initials(review.name)
								)}
								<span className="sptp-testimonials__source">
									<img
										src={img(
											'wordpress' === review.source
												? 'badge-wordpress.svg'
												: 'badge-trustpilot.svg'
										)}
										alt=""
									/>
								</span>
							</span>
							<span className="sptp-testimonials__reviewer-info">
								<strong>{review.name}</strong>
								<span>{review.role}</span>
							</span>
						</div>
						<Stars source={review.source} img={img} />
						<p>{review.text}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default Testimonials;
