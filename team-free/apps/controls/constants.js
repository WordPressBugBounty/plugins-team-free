import {
	BottomSpaceIcon,
	GapHorizontalIcon,
	GapVerticalIcon,
	HorizontalAxisSpaceIcon,
	LeftSpaceIcon,
	LinkedIcon,
	RadiusAllIcon,
	RadiusBottomLeftIcon,
	RadiusBottomRightIcon,
	RadiusTopLeftIcon,
	RadiusTopRightIcon,
	RightSpaceIcon,
	TopSpaceIcon,
	VerticalAxisSpaceIcon,
} from '../icons/icons';

export const sideAxisIcons = {
	horizontal: <HorizontalAxisSpaceIcon />,
	vertical: <VerticalAxisSpaceIcon />,
	top: <TopSpaceIcon />,
	right: <RightSpaceIcon />,
	bottom: <BottomSpaceIcon />,
	left: <LeftSpaceIcon />,
	all: <LinkedIcon />,
	'radius-top': <RadiusTopLeftIcon />,
	'radius-right': <RadiusTopRightIcon />,
	'radius-bottom': <RadiusBottomRightIcon />,
	'radius-left': <RadiusBottomLeftIcon />,
	'radius-all': <RadiusAllIcon />,
	'gap-horizontal': <GapHorizontalIcon />,
	'gap-vertical': <GapVerticalIcon />,
};

// Per-block documentation / preview links, keyed by short slug. Add an entry
// when a block surfaces these links through the shared inspectorControls.
export const blockDocLink = {};

export const blockPreviewPanelLink = {};
