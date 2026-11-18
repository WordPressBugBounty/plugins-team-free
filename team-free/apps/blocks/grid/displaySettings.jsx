/**
 * Grid — Display Settings panel body.
 *
 * The card-design picker + per-design controls come from the shared
 * CardDesignControls; this file adds the Select Grid Style picker (Grid free,
 * Polaroid / Staggered Pro-locked), the grid-layout controls (columns, gaps,
 * align items) and the team-group addon toggles — Ajax Pagination (free), Live
 * Frontend Filter / Ajax Search (Pro-locked).
 */

import { __ } from '@wordpress/i18n';
import { Layouts, ProNotice, SPRangeControl, SPToggleGroupControl, Toggle } from '../../components';
import {
	VerticalAlignTopIcon,
	VerticalAlignCenterIcon,
	VerticalAlignBottomIcon,
	FullWithIcon,
} from '../../components/icons';
import { PRO_NOTICE_GRID_DISPLAY } from '../shared/proNotices';
import { CardDesignControls } from '../shared/panels';
import { GRID_STYLE_ITEMS } from './gridStyle';

export function DisplaySettings({ attributes, setAttributes }) {
	const { columns, horizontalGap, verticalGap, alignItems, ajaxPagination } = attributes;

	return (
		<>
			{/* Select Grid Style: only the normal grid is free. The picker always
			    reads 'normal' (a Pro-saved polaroid/staggered renders as the normal
			    grid) and the Pro tiles open the upgrade link, so nothing is ever
			    written to `gridStyle`. */}
			<div className="sp-smart-team-grid-style-picker">
				<Layouts
					label={__('Select Grid Style', 'team-free')}
					showActiveName
					attributes="normal"
					attributesKey="gridStyle"
					setAttributes={setAttributes}
					items={GRID_STYLE_ITEMS}
					grid={2}
					displayActive
				/>
			</div>

			<CardDesignControls attributes={attributes} setAttributes={setAttributes} />

			<SPRangeControl
				label={__('Columns', 'team-free')}
				attributes={columns}
				attributesKey="columns"
				setAttributes={setAttributes}
				min={1}
				max={6}
				step={1}
			/>
			<SPRangeControl
				label={__('Horizontal Gap', 'team-free')}
				attributes={horizontalGap}
				attributesKey="horizontalGap"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				min={0}
				max={100}
				step={1}
			/>
			<SPRangeControl
				label={__('Vertical Gap', 'team-free')}
				attributes={verticalGap}
				attributesKey="verticalGap"
				setAttributes={setAttributes}
				units={['px', 'em', 'rem']}
				min={0}
				max={100}
				step={1}
			/>

			<SPToggleGroupControl
				label={__('Align Items', 'team-free')}
				attributes={alignItems}
				attributesKey="alignItems"
				setAttributes={setAttributes}
				items={[
					{
						label: <VerticalAlignTopIcon />,
						value: 'start',
						tooltip: __('Top', 'team-free'),
					},
					{
						label: <VerticalAlignCenterIcon />,
						value: 'center',
						tooltip: __('Middle', 'team-free'),
					},
					{
						label: <VerticalAlignBottomIcon />,
						value: 'end',
						tooltip: __('Bottom', 'team-free'),
					},
					{
						label: <FullWithIcon />,
						value: 'stretch',
						tooltip: __('Stretch', 'team-free'),
					},
				]}
			/>

			<Toggle
				label={__('Ajax Pagination', 'team-free')}
				attributes={!!ajaxPagination}
				onChange={(current) => setAttributes({ ajaxPagination: !current })}
			/>
			{/* Live Frontend Filter and Ajax Search are Pro: locked off, never
			    written — a Pro-saved `true` (and its team-group child) is left as is. */}
			<Toggle label={__('Live Frontend Filter', 'team-free')} attributes={false} isPro />
			<Toggle label={__('Ajax Search', 'team-free')} attributes={false} isPro />

			<ProNotice {...PRO_NOTICE_GRID_DISPLAY} />
		</>
	);
}
