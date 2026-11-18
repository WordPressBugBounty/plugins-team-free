import { __ } from '@wordpress/i18n';
import { BaseControl, FocalPointPicker, SelectControl } from '@wordpress/components';
import { SPToggleGroupControl, Popover, VideoPlayer } from '../../components';
import { MediaUpload } from '@wordpress/block-editor';
import { PopOverImgToggleIcon } from '../popover/icons';
import { resolveLightboxIconImageUrl } from '../../common/lightbox/lightboxIconNormalize';
import './editor.scss';

const MediaPicker = ({
	backgroundImage,
	imageKey,
	setAttributes,
	imageSizeValue,
	imageSizeKey,
	slug = 'image',
	label = __('Image', 'team-free'),
	disableLabel = false,
	disableRemove = false,
	mediaType = 'image',
	enableImageSize = true,
	onSelect = false,
	removeImage = false,
	imgFocalPoint = false,
	customClass = '',
}) => {
	// Read from attributes if passed
	const focalPoint = backgroundImage?.focalPoint || { x: 0.5, y: 0.5 };
	const toggleStateScale = backgroundImage?.scale || 'cover';

	const updateFocalPoint = (newPoint) => {
		setAttributes({
			[imageKey]: {
				...(backgroundImage || {}),
				focalPoint: newPoint,
			},
		});
	};

	const updateScale = (newScale) => {
		setAttributes({
			[imageKey]: {
				...(backgroundImage || {}),
				scale: newScale,
			},
		});
	};
	/*
	 * Event to set Image as while adding.
	 */
	const onSelectImage = (media) => {
		const url = resolveLightboxIconImageUrl(media);
		if (!url) {
			setAttributes({ [imageKey]: null });
			return;
		}

		setAttributes({
			[imageKey]: {
				...backgroundImage,
				...media,
				url,
				focalPoint: backgroundImage?.focalPoint || { x: 0.5, y: 0.5 },
				scale: backgroundImage?.scale || 'cover',
			},
		});
	};

	const previewUrl = resolveLightboxIconImageUrl(backgroundImage);
	const style = {
		backgroundImage: previewUrl ? `url(${previewUrl})` : undefined,
		backgroundPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
		backgroundSize: backgroundImage?.scale || 'cover',
	};

	const imagesSizeOptions = (image) => {
		const sizeArr = [];
		for (const size in image.sizes) {
			if (image.sizes.hasOwnProperty(size)) {
				const p = {
					value: size,
					label: size.charAt(0).toUpperCase() + size.slice(1),
				};
				sizeArr.push(p);
			}
		}
		return sizeArr;
	};

	/*
	 * Event to set Image as null while removing.
	 */
	const onRemoveImage = () => {
		if (onSelect) {
			onSelect({});
		} else {
			setAttributes({ [imageKey]: '' });
		}
	};

	// These are the localized texts that will show on the Select / Change Button and Popup.
	const labels = {
		video: {
			selectMediaLabel: __('Select Video', 'team-free'),
			replaceMediaLabel: __('Change Video', 'team-free'),
		},
		lottie: {
			selectMediaLabel: __('Select Lottie Animation', 'team-free'),
			replaceMediaLabel: __('Change Lottie Animation', 'team-free'),
		},
	}[slug] || {
		selectMediaLabel: __('Select Image', 'team-free'),
		replaceMediaLabel: __('Change Image', 'team-free'),
	};
	const { selectMediaLabel, replaceMediaLabel } = labels;

	const renderMediaUploader = (open) => {
		const uploadType = previewUrl ? 'replace' : 'add';
		return (
			<button
				className={`sp-smart-team-media-control__clickable sp-smart-team-media-control__clickable--${uploadType}`}
				onClick={open}
			>
				{'add' === uploadType ? (
					renderButton(uploadType)
				) : (
					<div className="sp-smart-team-control-label">{replaceMediaLabel}</div>
				)}
			</button>
		);
	};

	const renderButton = (buttonType) => (
		<div
			className={`sp-smart-team-media-control__button sp-smart-team-media-control__button--${buttonType}`}
		>
			<span>{'close' === buttonType ? '×' : '+'}</span>
		</div>
	);

	return (
		<>
			<BaseControl
				className="sp-smart-team-media-control sp-smart-team-component-mb"
				id={`sp-smart-team-option-selector-${slug}`}
				label={label}
				hideLabelFromVision={disableLabel}
				__nextHasNoMarginBottom
			>
				<div
					className={`sp-smart-team-media-control__wrapper ${customClass}`}
					style={{
						...('image' === mediaType &&
							previewUrl && {
								background: `url(${previewUrl})`,
							}),
						position: 'relative',
					}}
				>
					{'video' === mediaType && backgroundImage?.url && (
						<VideoPlayer
							bgVideo={backgroundImage}
							videoType={'html5'}
							youtubeVideo={''}
						/>
					)}
					<MediaUpload
						title={selectMediaLabel}
						onSelect={onSelect ? onSelect : onSelectImage}
						allowedTypes={mediaType}
						value={backgroundImage}
						render={({ open }) => renderMediaUploader(open)}
					/>
					{!disableRemove && previewUrl && (
						<button
							className="sp-smart-team-media-control__clickable sp-smart-team-media-control__clickable--close"
							onClick={removeImage ? removeImage : onRemoveImage}
						>
							{renderButton('close')}
						</button>
					)}
					{imgFocalPoint && previewUrl && (
						<Popover toggleIcon={<PopOverImgToggleIcon />}>
							<FocalPointPicker
								label={__('Focal Point Picker', 'team-free')}
								url={previewUrl}
								value={focalPoint}
								onChange={updateFocalPoint}
								onDragStart={updateFocalPoint}
								onDrag={updateFocalPoint}
								__nextHasNoMarginBottom
							/>
							<SPToggleGroupControl
								label={__('Image Scale', 'team-free')}
								items={[
									{ label: 'Cover', value: 'cover' },
									{ label: 'Contain', value: 'contain' },
									{ label: 'Fill', value: 'fill' },
								]}
								attributes={toggleStateScale}
								onClick={(value) => updateScale(value)}
							/>
							<div style={style} />
						</Popover>
					)}
				</div>
			</BaseControl>

			{backgroundImage && enableImageSize && previewUrl && previewUrl !== 'null' && (
				<>
					<SelectControl
						label={__('Image Size', 'team-free')}
						value={imageSizeValue}
						options={imagesSizeOptions(backgroundImage)}
						onChange={(newSize) => setAttributes({ [imageSizeKey]: newSize })}
						__nextHasNoMarginBottom
					/>
				</>
			)}
		</>
	);
};

export default MediaPicker;
