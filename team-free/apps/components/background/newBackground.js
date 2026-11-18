import { __ } from '@wordpress/i18n';
import { Button, GradientPicker } from '@wordpress/components';
import './editor.scss';
import SpColorPicker from '../color/color';
import SPRangeControl from '../rangeControl/rangeControl';
import MediaPicker from '../mediaUpload/image';
import { BgIcon, GradientIcon, Image, TransparentIcon, Video } from './svgIcon';

// Default gradients - no global settings needed
const DEFAULT_GRADIENTS = [
	{
		name: 'Ocean Breeze',
		gradient: 'linear-gradient(46deg,rgb(0,97,255) 4%,rgb(96,239,255) 93%)',
		slug: 'ocean_breeze',
	},
	{
		name: 'Cosmic Fusion',
		gradient: 'linear-gradient(46deg,rgb(232,28,255) 4%,rgb(64,201,255) 93%)',
		slug: 'cosmic_fusion',
	},
	{
		name: 'Sunset Blaze',
		gradient: 'linear-gradient(46deg,rgb(255,15,123) 4%,rgb(248,155,41) 93%)',
		slug: 'sunset_blaze',
	},
	{
		name: 'Dreamy Violet',
		gradient: 'linear-gradient(46deg,rgb(211,151,250) 4%,rgb(131,100,232) 93%)',
		slug: 'dreamy_violet',
	},
	{
		name: 'Peach Bloom',
		gradient: 'linear-gradient(46deg,rgb(246,213,247) 4%,rgb(251,233,215) 93%)',
		slug: 'peach_bloom',
	},
	{
		name: 'Aqua Depths',
		gradient: 'linear-gradient(46deg,rgb(0,173,181) 4%,rgb(9,95,92) 93%)',
		slug: 'aqua_depths',
	},
	{
		name: 'Midnight Steel',
		gradient: 'linear-gradient(46deg,rgb(36,55,72) 4%,rgb(75,116,159) 93%)',
		slug: 'midnight_steel',
	},
];

const BGTypeIcons = {
	transparent: <TransparentIcon />,
	solid: <BgIcon />,
	gradient: <GradientIcon />,
	image: <Image />,
	video: <Video />,
};

const NewBackground = ({
	attributes,
	attributesKey,
	parentKey, // ✅ NEW
	parentAttributes, // ✅ NEW
	setAttributes,
	label = __('Background Type', 'team-free'),
	items,
	transition,
	colorLabel = __('Background Color', 'team-free'),
	defaultColor,
	imageKey,
	image,
	videoObj = { imageKey: '', backgroundImage: '' },
}) => {
	const defaultGradients = DEFAULT_GRADIENTS;
	const customGradients = [];

	/**
	 * Extract values
	 */
	const bgType = attributes?.style || (attributes?.solid ? 'solid' : '');
	const solidValue = attributes?.solid;
	const gradientValue = attributes?.gradient;

	//Generic updater (NO nested logic needed)
	const updateBackground = (newData) => {
		const updated = {
			...attributes,
			...newData,
		};

		// ✅ Nested (Normal / Hover)
		if (parentKey && parentAttributes) {
			setAttributes({
				[parentKey]: {
					...parentAttributes,
					[attributesKey]: updated,
				},
			});
		}
		// ✅ Flat fallback
		else {
			setAttributes({
				[attributesKey]: updated,
			});
		}
	};

	// Handle background type change
	const setBgType = (newValue) => {
		updateBackground({ style: newValue });
	};

	// Handle transition change (example of nested attribute)
	const onChangeColorValue = (newColor) => {
		const type = bgType || (items?.includes('solid') ? 'solid' : 'gradient');
		if ('gradient' === type) {
			updateBackground({
				style: 'gradient',
				gradient: newColor,
			});
			return;
		}
		updateBackground({
			style: 'solid',
			solid: newColor,
		});
	};

	return (
		<div className="sp-smart-team-background sp-smart-team-component-mb">
			{/* Background type */}
			<div className="sp-smart-team-background-control sp-smart-team-d-flex sp-smart-team-component-mb">
				<span className="sp-smart-team-component-title">{label}</span>

				<div className="sp-smart-team-background-left">
					{items?.map((item, i) => (
						<Button
							className={bgType === item ? 'active' : ''}
							key={i}
							onClick={() => setBgType(item)}
						>
							<span>{BGTypeIcons[item]}</span>
							<p>{item}</p>
						</Button>
					))}
				</div>
			</div>

			{/* SOLID */}
			{bgType === 'solid' && (
				<>
					<SpColorPicker
						label={colorLabel}
						value={solidValue}
						onChange={onChangeColorValue}
						defaultColor={defaultColor}
					/>

					{transition && (
						<SPRangeControl
							label={__('Transition', 'team-free')}
							attributes={transition.value}
							attributesKey={transition.key}
							parentKey={parentKey} // ✅ pass down
							parentAttributes={parentAttributes} // ✅ pass down
							setAttributes={setAttributes}
							units={false}
							step={0.1}
							min={0}
							max={30}
							defaultValue={{ unit: 'px', value: 0.3 }}
						/>
					)}
				</>
			)}

			{/* GRADIENT */}
			{bgType === 'gradient' && (
				<GradientPicker
					value={
						gradientValue ||
						'linear-gradient(90deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.07) 100%)'
					}
					gradients={[...defaultGradients, ...customGradients]}
					onChange={onChangeColorValue}
				/>
			)}

			{/* IMAGE */}
			{bgType === 'image' && (
				<MediaPicker
					label={__('Background Image', 'team-free')}
					enableImageSize={false}
					backgroundImage={image}
					imageKey={imageKey}
					setAttributes={setAttributes}
				/>
			)}

			{/* VIDEO */}
			{bgType === 'video' && (
				<MediaPicker
					label={__('Video', 'team-free')}
					imageKey={videoObj.imageKey}
					mediaType="video"
					slug="video"
					enableImageSize={false}
					setAttributes={setAttributes}
					backgroundImage={videoObj.backgroundImage}
				/>
			)}
		</div>
	);
};

export default NewBackground;
