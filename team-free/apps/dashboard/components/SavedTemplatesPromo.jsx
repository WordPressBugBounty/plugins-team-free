import { __ } from '@wordpress/i18n';
import { PlusIcon } from './SavedTemplateIcons';

/**
 * First-run banner introducing saved templates — shown only while the library
 * is empty, and retired once the first template exists.
 *
 * @param {Object} props
 * @param {string} props.createUrl Add New Template URL.
 * @param {string} props.pluginUrl Plugin root URL (for the banner artwork).
 */
const SavedTemplatesPromo = ({ createUrl, pluginUrl }) => (
	<div className="sptp-saved-template-promo">
		<div className="sptp-saved-template-promo__text">
			<h2 className="sptp-saved-template-promo__title">
				{__('Create Reusable Templates', 'team-free')}
			</h2>
			<p className="sptp-saved-template-promo__desc">
				{__(
					'Create a team member showcase once and reuse it anywhere with a shortcode — pages, posts, widgets, or page builders like Elementor and Divi.',
					'team-free'
				)}
			</p>
			<a href={createUrl} className="sptp-saved-template-promo__cta">
				<PlusIcon />
				{__('Create a Saved Template', 'team-free')}
			</a>
		</div>
		{pluginUrl && (
			<div className="sptp-saved-template-promo__media">
				<img
					src={`${pluginUrl}dist/images/saved-templates-banner.webp`}
					alt=""
					width="870"
					height="488"
					loading="lazy"
				/>
			</div>
		)}
	</div>
);

export default SavedTemplatesPromo;
