/**
 * "More WordPress Free plugins" — wp-admin style plugin cards (Figma 839:70839).
 *
 * Install / Activate are plain links to core's own handlers (nonce + capability checked there), so a click
 * leaves the dashboard the same way Plugins → Add New does.
 */
import { __, sprintf } from '@wordpress/i18n';
import useOurPlugins from '../hooks/useOurPlugins';

const STAR_COUNT = 5;

const Stars = ({ rating }) => {
	const value = rating / 20;

	return (
		<span className="sptp-plugin-stars" aria-hidden="true">
			{Array.from({ length: STAR_COUNT }, (_, index) => {
				let icon = 'dashicons-star-empty';
				if (value >= index + 1) {
					icon = 'dashicons-star-filled';
				} else if (value >= index + 0.5) {
					icon = 'dashicons-star-half';
				}
				return <span key={index} className={`dashicons ${icon}`} />;
			})}
		</span>
	);
};

const Action = ({ plugin }) => {
	if ('active' === plugin.status) {
		return (
			<span className="sptp-plugin-action sptp-plugin-action--active">
				{__('Active', 'team-free')}
			</span>
		);
	}
	if ('installed' === plugin.status && plugin.activateUrl) {
		return (
			<a className="sptp-plugin-action sptp-plugin-action--primary" href={plugin.activateUrl}>
				{__('Activate', 'team-free')}
			</a>
		);
	}
	if ('not_installed' === plugin.status && plugin.installUrl) {
		return (
			<a className="sptp-plugin-action" href={plugin.installUrl}>
				{__('Install Now', 'team-free')}
			</a>
		);
	}
	return null;
};

const OurPluginCards = () => {
	const { status, plugins } = useOurPlugins();

	// The cards are the whole Our Plugins page, so loading and failure need a visible state.
	if ('loading' === status) {
		return (
			<div className="sptp-loading">
				<span className="spinner is-active" style={{ float: 'none', margin: 0 }} />
			</div>
		);
	}
	if (!plugins.length) {
		return (
			<div className="notice notice-info inline">
				<p>
					{__('The plugin list could not be loaded right now.', 'team-free')}{' '}
					<a
						href="https://profiles.wordpress.org/shapedplugin/#content-plugins"
						target="_blank"
						rel="noopener noreferrer"
					>
						{__('Browse our plugins on WordPress.org', 'team-free')}
					</a>
				</p>
			</div>
		);
	}

	return (
		<div className="sptp-our-plugins">
			<h3 className="sptp-our-plugins__title">
				{__(
					'Supercharge Your Website with Our Free Plugins — Trusted by 400,200+ Users',
					'team-free'
				)}
			</h3>
			<div className="sptp-our-plugins__grid">
				{plugins.map((plugin) => (
					<div key={plugin.slug} className="sptp-plugin-card sptp-plugin-card--install">
						<div className="sptp-plugin-card__top">
							{plugin.icon && (
								<img
									className="sptp-plugin-card__icon"
									src={plugin.icon}
									alt=""
									width="128"
									height="128"
								/>
							)}
							<div className="sptp-plugin-card__body">
								<h4 className="sptp-plugin-card__name">
									<a
										href={plugin.detailsUrl}
										target="_blank"
										rel="noopener noreferrer"
									>
										{plugin.name}
									</a>
								</h4>
								<p className="sptp-plugin-card__desc">{plugin.description}</p>
							</div>
							<ul className="sptp-plugin-card__actions">
								<li>
									<Action plugin={plugin} />
								</li>
								<li>
									<a
										className="sptp-plugin-card__details"
										href={plugin.detailsUrl}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={sprintf(
											/* translators: %s: plugin name */
											__('More information about %s', 'team-free'),
											plugin.name
										)}
									>
										{__('More Details', 'team-free')}
									</a>
								</li>
							</ul>
						</div>
						<div className="sptp-plugin-card__bottom">
							<div className="sptp-plugin-card__rating">
								<Stars rating={plugin.rating} />
								<span className="sptp-plugin-card__count">
									({plugin.numRatings})
								</span>
							</div>
							{plugin.version && (
								<div className="sptp-plugin-card__meta sptp-plugin-card__meta--end">
									<strong>{__('Version:', 'team-free')}</strong> {plugin.version}
								</div>
							)}
							{plugin.activeInstallsLabel && (
								<div className="sptp-plugin-card__meta">
									{plugin.activeInstallsLabel}
								</div>
							)}
							{plugin.lastUpdatedLabel && (
								<div className="sptp-plugin-card__meta sptp-plugin-card__meta--end">
									<strong>{__('Last Updated:', 'team-free')}</strong>{' '}
									{plugin.lastUpdatedLabel}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default OurPluginCards;
