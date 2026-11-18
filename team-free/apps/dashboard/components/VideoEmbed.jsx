import { __ } from '@wordpress/i18n';
import { createPortal, useEffect, useState } from '@wordpress/element';

/**
 * Click-to-play video. Shows a poster thumbnail with a YouTube play button;
 * on click it opens the embedded YouTube iframe in a popup (Real Testimonials'
 * Getting Started modal). If no videoId is provided the poster links out to
 * the fallback URL instead.
 *
 * @param {Object} props
 * @param {string} props.poster   Thumbnail image URL.
 * @param {string} props.videoId  YouTube video id (optional).
 * @param {string} props.fallback URL opened when no videoId is set.
 */
const VideoEmbed = ({ poster, videoId = '', fallback = 'https://getwpteam.com/' }) => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) {
			return undefined;
		}
		const onKeyDown = (event) => {
			if (event.key === 'Escape') {
				setOpen(false);
			}
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [open]);

	const PlayButton = (
		<span className="sptp-video__play" aria-hidden="true">
			<svg width="112" height="112" viewBox="0 0 112 112" fill="none">
				<circle opacity="0.3" cx="56" cy="56" r="46" fill="#fff" />
				<circle cx="57" cy="56" r="36" fill="#fff" />
				<path
					d="M68.4558 53.8285C69.6582 54.6185 69.6582 56.3815 68.4558 57.1715L52.3482 67.754C51.0182 68.6277 49.25 67.6737 49.25 66.0824L49.25 44.9176C49.25 43.3263 51.0182 42.3723 52.3482 43.246L68.4558 53.8285Z"
					fill="#2B5F47"
				/>
			</svg>
		</span>
	);

	const posterStyle = poster ? { backgroundImage: `url(${poster})` } : undefined;

	if (videoId) {
		return (
			<>
				<button
					type="button"
					className="sptp-video"
					style={posterStyle}
					onClick={() => setOpen(true)}
					aria-label={__('Play video', 'team-free')}
				>
					<span className="sptp-video__overlay" />
					{PlayButton}
				</button>
				{open &&
					createPortal(
						<div
							className="sptp-video-modal"
							onClick={(event) => {
								if (event.target === event.currentTarget) {
									setOpen(false);
								}
							}}
						>
							<div
								className="sptp-video-modal__content"
								role="dialog"
								aria-modal="true"
							>
								<button
									type="button"
									className="sptp-video-modal__close"
									onClick={() => setOpen(false)}
									aria-label={__('Close', 'team-free')}
								>
									×
								</button>
								<div className="sptp-video-modal__video">
									<iframe
										title={__('Smart Team intro video', 'team-free')}
										src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
									/>
								</div>
							</div>
						</div>,
						document.body
					)}
			</>
		);
	}

	return (
		<a
			className="sptp-video"
			style={posterStyle}
			href={fallback}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={__('Watch video', 'team-free')}
		>
			<span className="sptp-video__overlay" />
			{PlayButton}
		</a>
	);
};

export default VideoEmbed;
