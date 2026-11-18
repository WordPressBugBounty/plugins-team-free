import { __ } from '@wordpress/i18n';
import { Button, GradientPicker } from '@wordpress/components';
import './editor.scss';
import SpColorPicker from '../color/color';
import SPRangeControl from '../rangeControl/rangeControl';
import MediaPicker from '../mediaUpload/image';

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

const Background = ({
	attributes,
	attributesKey,
	setAttributes,
	label,
	items,
	transition,
	colorLabel = 'Background Color',
	defaultColor,
	colorType,
	imageObj = { imageKey: '', backgroundImage: '' } || {},
	videoObj = { imageKey: '', backgroundImage: '' } || {},
	onStateUpdate = false,
	// Hover-sync (opt-in, port of styble-pro's Background sync): edits to the
	// NORMAL state (style/solidColor/gradient) mirror onto the hover state so
	// hover tracks normal until customized; hover edits never touch normal.
	syncHover = false,
}) => {
	const defaultGradients = DEFAULT_GRADIENTS;
	const customGradients = [];

	// Commit a patch to the active state (color|hover), applying any opted-in
	// hover mirroring. Single write path for the type/color/gradient controls.
	const writeState = (patch) => {
		const next = {
			...attributes,
			[colorType]: { ...attributes[colorType], ...patch },
		};
		if (syncHover && 'color' === colorType) {
			next.hover = { ...attributes.hover, ...patch };
		}
		if (onStateUpdate) {
			onStateUpdate(attributesKey, next);
		} else {
			setAttributes({ [attributesKey]: next });
		}
	};

	// Set background type
	const setBgType = (newValue) => writeState({ style: newValue });

	const gradientValue =
		attributes[colorType]?.gradient ||
		'linear-gradient(90deg, rgba(0, 0, 0, 0.68) 0.09%, rgba(0, 0, 0, 0.07) 99.95%)';

	return (
		<>
			<div className="sp-smart-team-background sp-smart-team-component-mb">
				{/* Background type */}
				<div
					className={`sp-smart-team-background-control sp-smart-team-d-flex sp-smart-team-component-mb`}
				>
					<span className="sp-smart-team-component-title">{label}</span>
					<div className={`sp-smart-team-background-left`}>
						{items?.map((item, i) => (
							<Button
								className={
									attributes[colorType]?.style === item.value ? 'active' : ''
								}
								key={i}
								value={item.value}
								onClick={(e) => setBgType(e.target.closest('button').value)}
							>
								<span>{item.label}</span>
								{<p>{item.tooltip}</p>}
							</Button>
						))}
					</div>
				</div>
				<>
					{'bgColor' === attributes[colorType]?.style && (
						<>
							<SpColorPicker
								label={colorLabel}
								value={attributes[colorType].solidColor}
								onChange={(newColor) => writeState({ solidColor: newColor })}
								defaultColor={defaultColor}
							/>
							{'hover' === colorType && transition && (
								<SPRangeControl
									label={__('Transition', 'team-free')}
									setAttributes={setAttributes}
									attributes={transition.value}
									units={false}
									step={0.1}
									min={0}
									max={30}
									defaultValue={{ unit: 'px', value: 0.3 }}
									attributesKey={transition.key}
								/>
							)}
						</>
					)}
					{'gradient' === attributes[colorType]?.style && (
						<GradientPicker
							value={gradientValue}
							gradients={[...defaultGradients, ...customGradients]}
							onChange={(newValue) => writeState({ gradient: newValue })}
						/>
					)}
					{'image' === attributes[colorType]?.style && (
						<MediaPicker
							label={__('Image', 'team-free')}
							imageKey={imageObj?.imageKey}
							enableImageSize={false}
							setAttributes={setAttributes}
							backgroundImage={imageObj?.backgroundImage}
						/>
					)}
					{'video' === attributes[colorType]?.style && (
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
				</>
			</div>
		</>
	);
};

export default Background;
