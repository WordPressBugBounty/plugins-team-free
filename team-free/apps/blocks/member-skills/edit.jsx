/**
 * Member Skills — editor component.
 *
 * Renders DUMMY skills (progress bars or chips) inside the styled `#uniqueId`
 * div, using the same `.sp-smart-team-card__skill*` markup as the frontend so
 * the shared card SCSS + dynamic CSS resolve in both views. Like Member Name /
 * Member Designation / Additional Information it deliberately does NOT fetch a
 * member (no `useMembers`): the block is built on the Member Details Page
 * template where the member varies per request, and a member with no skills
 * would leave the canvas empty with nothing to style. The frontend renders the
 * CURRENT queried member's real skills (see Member_Skills::render_block()).
 */

import { useMemo } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';

import { BlockInspectorTabs } from '../../components';
import useUniqueId from '../../hooks/useUniqueId';
import dynamicCss from './dynamicCss';
import { extractGoogleFontImports } from '../../utils/googleFonts.js';
import Inspector from './inspect';
import ExtraIdWrapper from '../../shared/ExtraIdWrapper.jsx';
import { TogglePanelBodyProvider } from '../../hooks/togglePanelBodyContext';

// Placeholder skills for the editor preview — the shape MemberQuery's
// normalize_skills() returns (`{ name, percentage }`). Four rows with distinct
// percentages, so the bar styles read clearly AND the Style tab's Multi Color
// Skill Bar list (which colours the Nth bar via nth-child) has enough bars to
// show its per-row colours while designing.
const PREVIEW_SKILLS = [
	{ name: 'WordPress', percentage: 90 },
	{ name: 'JavaScript', percentage: 80 },
	{ name: 'PHP', percentage: 70 },
	{ name: 'UI/UX Design', percentage: 60 },
];

/* One skill — twin of MemberLayoutBlock::render_skill(). */
function SkillItem({ skill, isProgress }) {
	const hasPct =
		skill.percentage !== '' && skill.percentage !== undefined && skill.percentage !== null;
	const width = hasPct ? parseFloat(skill.percentage) || 0 : 0;

	if (!isProgress) {
		return (
			<div className="sp-smart-team-card__skill sp-smart-team-card__skill--chip">
				<span className="sp-smart-team-card__skill-name">{skill.name}</span>
			</div>
		);
	}

	return (
		<div className="sp-smart-team-card__skill">
			<div className="sp-smart-team-card__skill-name">{skill.name}</div>
			<div className="sp-smart-team-card__skill-track" data-title={`${width}%`}>
				{/* Custom property, like Member_Skills::render_skill() — see the note
				    in MemberCard.jsx. */}
				<div
					className="sp-smart-team-card__skill-fill"
					style={{ '--sptp-skill-width': `${width}%` }}
				>
					{hasPct && (
						<span className="sp-smart-team-card__skill-percentage">{`${skill.percentage}%`}</span>
					)}
				</div>
			</div>
		</div>
	);
}

export default function Edit({ clientId, attributes, setAttributes }) {
	const { uniqueId, skillsDisplayStyle, skillsProgressBarStyle, skillsPercentVisibility } =
		attributes;

	useUniqueId(clientId, uniqueId, setAttributes, 'sp-smart-team-member-skills-', 'sptp/');

	const blockStyling = useMemo(
		() => extractGoogleFontImports(attributes) + dynamicCss(attributes),
		[attributes]
	);

	const blockProps = useBlockProps({ className: 'sp-smart-team-wrapper' });

	const isProgress = skillsDisplayStyle !== 'button';
	const skillsClass = [
		'sp-smart-team-card__skills',
		`sp-smart-team-card__skills--${isProgress ? 'progress' : 'button'}`,
		`sp-smart-team-card__skills--percent-${skillsPercentVisibility || 'always'}`,
		isProgress ? `sp-smart-team-card__skills--${skillsProgressBarStyle || 'style-2'}` : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div {...blockProps}>
			<style dangerouslySetInnerHTML={{ __html: blockStyling }} />

			<TogglePanelBodyProvider>
				<BlockInspectorTabs
					attributes={{ ...attributes, blockName: 'member-skills' }}
					setAttributes={setAttributes}
					General={Inspector}
					documentLink="https://docs.getwpteam.com/guide/member-details/field-blocks#member-skills"
					readyPatternsLink="https://shapedplugin.com/plugin/wp-team-pro/#patterns"
					previewLink="https://shapedplugin.com/plugin/wp-team-pro/"
				/>

				<ExtraIdWrapper id={attributes.additionalId}>
					<div
						id={uniqueId}
						className={`sp-smart-team-member-skills ${attributes.additionalCssClass || ''}`.trim()}
					>
						<div className={skillsClass}>
							{PREVIEW_SKILLS.map((skill, index) => (
								<SkillItem key={index} skill={skill} isProgress={isProgress} />
							))}
						</div>
					</div>
				</ExtraIdWrapper>
			</TogglePanelBodyProvider>
		</div>
	);
}
