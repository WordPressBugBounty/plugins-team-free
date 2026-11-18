import { TabPanel } from '@wordpress/components';
import { GeneralIcon, StyleIcon, AdvancedIcon, SliderIcon } from './icon';
import './editor.scss';
import { useState } from '@wordpress/element';

const TabControls = ({
	attributes,
	setAttributes,
	Settings = null,
	StyleTab = null,
	AdvancedTab = null,
	VisibilityTab = null,
	SliderTab = null,
	displayIcon = true,
	props = '',
	verticalPosition = true,
	Preset = null,
	LayoutTab = null,
	CarouselTab = null,
	initialTab = 'settings',
	settingsTabTitle = null,
	styleTabTitle = null,
	advancedTabTitle = null,
	Text = null,
	BackgroundTab = null,
	Marks = null,
}) => {
	const Tabs = [];
	const [tabName, setTabName] = useState(initialTab);

	if (LayoutTab) {
		Tabs.push({
			name: `layout`,
			title: (
				<span className="sp-smart-team-tab-panel-title">
					{displayIcon && <GeneralIcon />} Layouts
				</span>
			),
			className: 'sp-smart-team-general-tab',
		});
	}

	if (Settings) {
		Tabs.push({
			name: `settings`,
			title: (
				<span className="sp-smart-team-tab-panel-title">
					{displayIcon && <GeneralIcon />} {settingsTabTitle || 'Settings'}
				</span>
			),
			className: 'sp-smart-team-general-tab',
		});
	}

	// After Settings — the carousel's Display Settings pairs [Settings | Carousel]
	// in the Figma order.
	if (CarouselTab) {
		Tabs.push({
			name: `carousel`,
			title: (
				<span className="sp-smart-team-tab-panel-title">
					{displayIcon && <StyleIcon />} Carousel
				</span>
			),
			className: 'sp-smart-team-general-tab',
		});
	}
	if (Preset) {
		Tabs.push({
			name: 'preset',
			title: (
				<span className="sp-smart-team-tab-panel-title">
					{displayIcon && <GeneralIcon />} Preset
				</span>
			),
			className: 'sp-smart-team-preset-tab',
		});
	}
	if (StyleTab) {
		Tabs.push({
			name: `style`,
			title: (
				<span className="sp-smart-team-tab-panel-title">
					{displayIcon && <StyleIcon />} {styleTabTitle || 'Style'}
				</span>
			),
			className: 'sp-smart-team-style-tab',
		});
	}

	if (VisibilityTab) {
		Tabs.push({
			name: 'visibility',
			title: <span className="sp-smart-team-tab-panel-title">Visibility</span>,
			className: 'sp-smart-team-visibility-tab',
		});
	}

	if (Text) {
		Tabs.push({
			name: 'text',
			title: <span className="sp-smart-team-tab-panel-title">Text</span>,
			className: 'sp-smart-team-text-tab',
		});
	}

	if (BackgroundTab) {
		Tabs.push({
			name: 'background',
			title: <span className="sp-smart-team-tab-panel-title">Background</span>,
			className: 'sp-smart-team-background-tab',
		});
	}
	if (Marks) {
		Tabs.push({
			name: 'marks',
			title: <span className="sp-smart-team-tab-panel-title">Marks</span>,
			className: 'sp-smart-team-marks-tab',
		});
	}

	if (AdvancedTab) {
		Tabs.push({
			name: 'advanced',
			title: (
				<span className="sp-smart-team-tab-panel-title">
					{displayIcon && <AdvancedIcon />} {advancedTabTitle || 'Advanced'}
				</span>
			),
			className: 'sp-smart-team-advanced-tab',
		});
	}

	if (SliderTab) {
		Tabs.push({
			name: 'slider',
			title: (
				<span className="sp-smart-team-tab-panel-title">
					{displayIcon && <SliderIcon />} Slider
				</span>
			),
			className: 'sp-smart-team-advanced-tab',
		});
	}

	return (
		<TabPanel
			className="sp-smart-team-tab-panel panel-tab"
			activeClass="active-tab"
			initialTabName={tabName}
			onSelect={(newVal) => setTabName(newVal)}
			tabs={Tabs}
		>
			{(tab) => {
				return (
					<>
						{tab.name === 'layout' && LayoutTab && (
							<LayoutTab
								attributes={attributes}
								verticalPosition={verticalPosition}
								setAttributes={setAttributes}
								props={props}
							/>
						)}
						{tab.name === 'carousel' && CarouselTab && (
							<CarouselTab
								attributes={attributes}
								verticalPosition={verticalPosition}
								setAttributes={setAttributes}
								props={props}
							/>
						)}
						{tab.name === 'settings' && Settings && (
							<Settings
								attributes={attributes}
								verticalPosition={verticalPosition}
								setAttributes={setAttributes}
								props={props}
							/>
						)}
						{tab.name === 'style' && StyleTab && (
							<StyleTab
								attributes={attributes}
								setAttributes={setAttributes}
								props={props}
							/>
						)}
						{tab.name === 'visibility' && VisibilityTab && (
							<VisibilityTab
								attributes={attributes}
								setAttributes={setAttributes}
								props={props}
							/>
						)}

						{tab.name === 'preset' && Preset && (
							<Preset
								attributes={attributes}
								setAttributes={setAttributes}
								props={props}
							/>
						)}
						{tab.name === 'advanced' && AdvancedTab && (
							<AdvancedTab
								attributes={attributes}
								setAttributes={setAttributes}
								props={props}
							/>
						)}
						{tab.name === 'slider' && SliderTab && (
							<SliderTab
								attributes={attributes}
								setAttributes={setAttributes}
								props={props}
							/>
						)}

						{tab.name === 'text' && Text && (
							<Text
								attributes={attributes}
								setAttributes={setAttributes}
								props={props}
							/>
						)}
						{tab.name === 'background' && BackgroundTab && (
							<BackgroundTab
								attributes={attributes}
								setAttributes={setAttributes}
								props={props}
							/>
						)}
						{tab.name === 'marks' && Marks && (
							<Marks
								attributes={attributes}
								setAttributes={setAttributes}
								props={props}
							/>
						)}
					</>
				);
			}}
		</TabPanel>
	);
};

export default TabControls;
