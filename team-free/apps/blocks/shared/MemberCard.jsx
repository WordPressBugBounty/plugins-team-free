/**
 * Shared member card — the editor renderer every layout block (grid,
 * carousel, future list/table/…) uses for a single `sptp_member`.
 *
 * Markup twin of MemberLayoutBlock::render_card()/render_element() (PHP) —
 * keep both in lock-step so the shared card dynamic CSS resolves in editor
 * and frontend alike. The card root carries the `.sp-smart-team-card` BEM
 * block with the design + image-position modifiers; layout blocks wrap it in
 * their own cell (grid `__cell`, carousel swiper-slide).
 */

import { __ } from '@wordpress/i18n';
import { cloneElement } from '@wordpress/element';

import { usePanelBodyContext } from '../../hooks/togglePanelBodyContext';

// Twin of MemberQuery::icon_class() — twitter renders the X glyph, not FA 4's bird.
const iconClass = (group = '') => {
	const slug = group === 'twitter' ? 'sp-team-icon-x-twitter' : group;
	return slug.indexOf('icon') !== -1 ? `icon-fontello ${slug}` : `fa fa-${slug}`;
};

// Built-in additional-information field → classic fontello icon base name. To
// match the classic shortcode exactly, these render the `sp-team-icon-{name}-{set}`
// glyphs (loaded via the sp_team_fontello handle), same as the legacy templates
// in src/Frontend/templates/member/*.php.
// Exported so the standalone Additional Information field block renders the
// same glyphs without copying the map.
export const META_ICON_BASE = {
	email: 'mail',
	phone: 'telephone',
	mobile: 'mobile',
	location: 'location',
	website: 'website',
	experience: 'experience',
};

// Language/gender have no fontello glyph — they render inline SVGs from the
// Figma design (node 1842-63021), one path per icon set so they follow the
// Select Icon Style control like the fontello fields. Twin of the
// $svg_paths map in Grid::render_meta_icon(); sized/colored via the same
// `__meta-icon :is(i, svg)` dynamic-CSS rules (width/height ride on 1em).
export const META_ICON_PATHS = {
	language: {
		fill: 'M7.11 2.2C7.8 2.2 8.34 2.73 8.34 3.42V4.65H13.23C13.92 4.65 14.45 5.18 14.45 5.87C14.45 6.56 13.92 7.09 13.23 7.09H12.85L12.54 7.97C11.93 9.69 10.97 11.29 9.79 12.63C10.32 12.98 10.9 13.28 11.47 13.55L13.42 14.39L15.79 9.04C15.98 8.58 16.4 8.31 16.9 8.31C17.39 8.31 17.81 8.58 18.01 9.04L22.9 20.05C23.16 20.66 22.9 21.38 22.29 21.65C21.67 21.92 20.95 21.65 20.68 21.04L19.92 19.32H13.88L13.11 21.04C12.85 21.65 12.12 21.92 11.51 21.65C10.9 21.38 10.63 20.66 10.9 20.05L12.43 16.64L10.48 15.77C9.6 15.38 8.76 14.93 7.99 14.39C7.15 15.04 6.27 15.61 5.32 16.07L3.98 16.76C3.41 17.07 2.64 16.8 2.34 16.19C2.07 15.61 2.3 14.85 2.91 14.54L4.21 13.89C4.86 13.59 5.43 13.21 6.01 12.82C5.47 12.33 4.97 11.79 4.52 11.26L4.13 10.8C3.67 10.26 3.75 9.5 4.29 9.08C4.78 8.62 5.59 8.7 6.01 9.23L6.39 9.69C6.85 10.22 7.31 10.72 7.8 11.18C8.87 10 9.71 8.66 10.25 7.13V7.09H2.22C1.53 7.09 1 6.56 1 5.87C1 5.18 1.53 4.65 2.22 4.65H5.89V3.42C5.89 2.73 6.43 2.2 7.11 2.2ZM16.9 12.56L14.99 16.87H18.81L16.9 12.56Z',
		'bold-line':
			'M7.42 2.2C7.91 2.2 8.33 2.62 8.33 3.12V5.26H13.53C14.03 5.26 14.45 5.68 14.45 6.17C14.45 6.67 14.03 7.09 13.53 7.09H12.92L12.27 8.54C11.58 10.22 10.55 11.71 9.29 12.97C9.82 13.35 10.4 13.66 10.97 13.93L13.3 15L16.05 8.85C16.2 8.54 16.55 8.31 16.89 8.31C17.27 8.31 17.58 8.54 17.73 8.85L22.93 20.46C23.12 20.92 22.93 21.49 22.47 21.68C22.01 21.87 21.47 21.68 21.25 21.22L20.14 18.7H13.64L12.54 21.22C12.35 21.68 11.77 21.87 11.31 21.68C10.86 21.49 10.66 20.92 10.86 20.46L12.57 16.68L10.24 15.57C9.4 15.23 8.64 14.77 7.91 14.23C7.23 14.77 6.5 15.23 5.74 15.61L3.56 16.75C3.1 17.02 2.57 16.83 2.34 16.37C2.11 15.95 2.26 15.38 2.72 15.15L4.9 14C5.43 13.74 5.93 13.39 6.42 13.05C5.39 12.05 4.48 10.95 3.75 9.69C3.52 9.27 3.64 8.69 4.09 8.43C4.51 8.2 5.09 8.35 5.35 8.77C6 9.92 6.84 10.99 7.84 11.86C9.02 10.72 9.94 9.34 10.59 7.81L10.93 7.09H1.92C1.42 7.09 1 6.67 1 6.17C1 5.68 1.42 5.26 1.92 5.26H6.5V3.12C6.5 2.62 6.92 2.2 7.42 2.2ZM19.3 16.87L16.89 11.48L14.48 16.87H19.3Z',
		'thin-line':
			'M6.5 2.2C6.84 2.2 7.11 2.47 7.11 2.81V5.86H13.83C14.17 5.86 14.44 6.13 14.44 6.48C14.44 6.82 14.17 7.09 13.83 7.09H13.03L12.42 8.5C11.58 10.45 10.32 12.17 8.71 13.54C9.25 13.92 9.82 14.23 10.39 14.53H10.43L13.1 15.83L16.31 8.69C16.43 8.46 16.66 8.31 16.89 8.31C17.11 8.31 17.34 8.46 17.46 8.69L22.96 20.91C23.07 21.22 22.96 21.56 22.65 21.71C22.35 21.83 21.96 21.71 21.81 21.41L20.32 18.08H13.45L11.96 21.41C11.81 21.71 11.42 21.83 11.12 21.71C10.81 21.56 10.7 21.22 10.81 20.91L12.61 16.94L9.86 15.64C9.13 15.26 8.41 14.84 7.72 14.34C7.03 14.84 6.31 15.26 5.54 15.64L3.1 16.79C2.79 16.94 2.41 16.82 2.3 16.52C2.15 16.21 2.26 15.83 2.57 15.72L5.05 14.53C5.62 14.23 6.19 13.92 6.73 13.54C5.51 12.51 4.47 11.25 3.71 9.84C3.52 9.53 3.63 9.15 3.94 9C4.21 8.84 4.59 8.92 4.74 9.23C5.51 10.6 6.54 11.78 7.72 12.78C9.25 11.52 10.51 9.87 11.31 8L11.69 7.09H1.61C1.27 7.09 1 6.82 1 6.48C1 6.13 1.27 5.86 1.61 5.86H5.89V2.81C5.89 2.47 6.15 2.2 6.5 2.2ZM19.79 16.86L16.89 10.41L13.98 16.86H19.79Z',
	},
	gender: {
		fill: 'M12 11.48C9.12 11.48 6.76 9.12 6.76 6.24C6.76 3.36 9.12 1 12 1C14.88 1 17.24 3.36 17.24 6.24C17.24 9.12 14.88 11.48 12 11.48ZM10.69 13.92H13.31C17.59 13.92 21.08 17.41 21.08 21.69C21.08 22.43 20.51 23 19.77 23H4.23C3.49 23 2.92 22.43 2.92 21.69C2.92 17.41 6.41 13.92 10.69 13.92Z',
		'bold-line':
			'M8.56 6.5C8.56 8.39 10.11 9.94 12 9.94C13.89 9.94 15.44 8.39 15.44 6.5C15.44 4.61 13.89 3.06 12 3.06C10.11 3.06 8.56 4.61 8.56 6.5ZM17.5 6.5C17.5 9.55 15.05 12 12 12C8.95 12 6.5 9.55 6.5 6.5C6.5 3.45 8.95 1 12 1C15.05 1 17.5 3.45 17.5 6.5ZM4.44 21.63V21.97C4.44 22.53 3.96 23 3.41 23C2.85 23 2.38 22.53 2.38 21.97V21.63C2.38 17.46 5.77 14.06 9.94 14.06H14.06C18.23 14.06 21.63 17.46 21.63 21.63V21.97C21.63 22.53 21.15 23 20.59 23C20.04 23 19.56 22.53 19.56 21.97V21.63C19.56 18.57 17.11 16.13 14.06 16.13H9.94C6.89 16.13 4.44 18.57 4.44 21.63Z',
		'thin-line':
			'M7.88 6.5C7.88 8.78 9.72 10.63 12 10.63C14.28 10.63 16.13 8.78 16.13 6.5C16.13 4.22 14.28 2.38 12 2.38C9.72 2.38 7.88 4.22 7.88 6.5ZM17.5 6.5C17.5 9.55 15.05 12 12 12C8.95 12 6.5 9.55 6.5 6.5C6.5 3.45 8.95 1 12 1C15.05 1 17.5 3.45 17.5 6.5ZM3.75 21.63V22.31C3.75 22.7 3.45 23 3.06 23C2.68 23 2.38 22.7 2.38 22.31V21.63C2.38 17.46 5.77 14.06 9.94 14.06H14.06C18.23 14.06 21.63 17.46 21.63 21.63V22.31C21.63 22.7 21.32 23 20.94 23C20.55 23 20.25 22.7 20.25 22.31V21.63C20.25 18.23 17.5 15.44 14.06 15.44H9.94C6.54 15.44 3.75 18.23 3.75 21.63Z',
	},
};

// Select Icon Style value → classic meta icon set suffix (see sptp_get_meta_icon_set()).
export const META_ICON_SET = {
	'style-1': 'fill',
	'style-2': 'bold-line',
	'style-3': 'thin-line',
};

// Full icon class for a built-in fontello field.
const metaIconClass = (key, iconSet) =>
	META_ICON_BASE[key] ? `sp-team-icon-${META_ICON_BASE[key]}-${iconSet}` : '';

// The icon shown before an additional-information value. Gated by the "Display
// Meta Icon" toggle; size/color come from dynamicCss.
const metaIcon = (iconCls, showIcon) =>
	showIcon && iconCls ? (
		<span className="sp-smart-team-card__meta-icon">
			<i className={iconCls} />
		</span>
	) : null;

// SVG variant for the fields without a fontello glyph (language/gender). The
// path data lives ONCE per grid in the MetaIconSprite <symbol>s — every card
// references it with a tiny <use>, so the DOM never repeats the geometry.
const metaSvgIcon = (key, iconSet, showIcon) => {
	const paths = META_ICON_PATHS[key];
	const set = paths?.[iconSet] ? iconSet : 'fill';
	return showIcon && paths ? (
		<span className="sp-smart-team-card__meta-icon">
			<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<use href={`#sptp-meta-icon-${key}-${set}`} />
			</svg>
		</span>
	) : null;
};

// Hidden per-grid symbol definitions the metaSvgIcon <use> references resolve
// against (twin of Grid::meta_icon_sprite()). Zero-sized so it never affects
// layout; duplicate ids across grid instances are harmless — <use> resolves
// to the first match and every instance defines identical geometry.
export function MetaIconSprite({ iconSet }) {
	const set = ['fill', 'bold-line', 'thin-line'].includes(iconSet) ? iconSet : 'fill';
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
			aria-hidden="true"
		>
			{Object.entries(META_ICON_PATHS).map(([key, sets]) => (
				<symbol key={key} id={`sptp-meta-icon-${key}-${set}`} viewBox="0 0 24 24">
					<path d={sets[set] || sets.fill} />
				</symbol>
			))}
		</svg>
	);
}

// A phone number as a tappable link — twin of MemberLayoutBlock::tel_href().
// Whitespace comes out of the href only; the number is displayed as entered.
// The canvas click is swallowed so it never tries to dial while designing.
const telLink = (value) =>
	value ? (
		<a href={`tel:${String(value).replace(/\s+/g, '')}`} onClick={(e) => e.preventDefault()}>
			{value}
		</a>
	) : null;

// A single additional-information row: optional icon + value. `content` is the
// rendered value (text or link); the row is omitted when it is empty.
const detailRow = (key, content, showIcon, iconSet) =>
	content ? (
		<div key={key} className={`sp-smart-team-card__detail sp-smart-team-card__detail--${key}`}>
			{META_ICON_PATHS[key]
				? metaSvgIcon(key, iconSet, showIcon)
				: metaIcon(metaIconClass(key, iconSet), showIcon)}
			<span className="sp-smart-team-card__detail-text">{content}</span>
		</div>
	) : null;

// A single skill. The markup is identical for every progress-bar style (mirrors
// the classic [wpteam] shortcode and render_skill() in Grid.php) — name label,
// then track › fill › percentage. The three styles differ purely in CSS:
//   • style-1 — % as a tooltip bubble (with caret) above the end of the fill
//   • style-2 — % as plain text at the top-right above the bar
//   • style-3 — % inside a tall striped bar; the name sits as a block over it
//   • button  — render each skill as a chip instead of a bar (no track)
function SkillItem({ skill, displayStyle }) {
	const pct = skill.percentage;
	const width = pct === '' ? 0 : pct;
	const percent =
		pct !== '' ? (
			<span className="sp-smart-team-card__skill-percentage">{`${pct}%`}</span>
		) : null;

	if (displayStyle !== 'progress') {
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
				{/* Target width rides a CUSTOM PROPERTY, like render_skill() — the
				    frontend's `--animate` gate holds `width` at 0 until the bar
				    scrolls into view, which an inline `width` would outrank. The
				    canvas has no runtime, so no gate class and the bar shows full. */}
				<div
					className="sp-smart-team-card__skill-fill"
					style={{ '--sptp-skill-width': `${width}%` }}
				>
					{percent}
				</div>
			</div>
		</div>
	);
}

// Card element key → inspector PanelBody key (the PANELS list in inspect.js).
// Clicking an element in the canvas opens the panel that styles it — port of
// styble-pro's `.sp-panel-data` / `data-component` convention, which
// togglePanelBody() reads off the clicked element's closest stamped ancestor.
const ELEMENT_PANELS = {
	image: 'image',
	name: 'basic',
	role: 'basic',
	bio: 'basic',
	email: 'additional',
	website: 'additional',
	mobile: 'additional',
	phone: 'additional',
	location: 'additional',
	experience: 'additional',
	language: 'additional',
	gender: 'additional',
	custom: 'additional',
	skills: 'skills',
	social: 'social',
};

// Resolve the bio text per Basic Information → Bio Source (short bio or full
// description; Auto Fallback and the Limited display style are Pro).
const resolveBio = (member, basic) =>
	(basic.bioSource === 'full' ? member.description : member.bio) || null;

export default function MemberCard({
	member,
	elements,
	readMore,
	skills,
	basic,
	meta,
	social,
	image,
	details = {},
	cardDesign,
	imagePosition = 'left',
	imageAreaPosition = 'left',
}) {
	const NameTag = basic.nameTag;
	const { openPanel, togglePanelBody } = usePanelBodyContext();

	// Member Details — whether a details link applies to the given target (twin
	// of MemberLayoutBlock::details_links()). Every Open As mode links; on the
	// frontend Modal intercepts the click instead of navigating. The editor
	// renders the name/image anchors for visual parity but never navigates
	// (preventDefault); the full-card stretched overlay is frontend-only — it
	// is invisible and would only get between canvas clicks and the
	// click-to-open-panel targeting.
	const linksTo = (target) => {
		if (!details.linkEnabled) {
			return false;
		}
		if (target === 'image') {
			return ['image', 'image-name'].includes(details.clickable);
		}
		if (target === 'name') {
			return ['name', 'image-name'].includes(details.clickable);
		}
		return details.clickable === 'full';
	};
	const detailsLinkProps = {
		href: member.link || '#',
		// The editor never navigates on click — clicking a card element selects it
		// / opens its inspector panel, so always block the link here. The new-tab
		// behavior (target=_blank) is a frontend-only concern.
		onClick: (e) => e.preventDefault(),
		...(details.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
	};
	// Render a single card element. Returns null when the member has no data for
	// it, so empty rows never appear. The element order is driven by `elements`
	// (the sortable Member Information list), so drag-and-drop reordering in the
	// inspector is reflected here 1:1.
	const renderElementRaw = (key) => {
		switch (key) {
			case 'image': {
				if (!member.avatar) {
					return null;
				}
				// Mirror Grid::render_image() — pick the resolution URL, apply the
				// aspect-ratio / hover-effect modifier classes, and 2x srcset.
				const resolution = image.resolution || 'full';
				const src = member.thumbnails?.[resolution] || member.avatar;
				const retinaMap = {
					thumbnail: 'medium',
					medium: 'large',
					medium_large: 'large',
					large: 'full',
					full: 'full',
				};
				const retinaSrc = image.retina
					? member.thumbnails?.[retinaMap[resolution] || 'full']
					: '';
				const srcSet = retinaSrc ? `${src} 1x, ${retinaSrc} 2x` : undefined;
				const alt = member.alt || member.name;
				// Member Details → Make Clickable: Only Image / Image and Name.
				// The anchor wraps __image-wrap (a 100%×100% block, see
				// __image-link in style.scss) so the avatar geometry is
				// unchanged and the on-photo social flyout stays outside it.
				const imageWrap = (
					<div className="sp-smart-team-card__image-wrap">
						<img
							className="sp-smart-team-card__image"
							src={src}
							srcSet={srcSet}
							alt={alt}
							loading="eager"
						/>
					</div>
				);
				const avatarClass = [
					'sp-smart-team-card__avatar',
					image.aspect && image.aspect !== 'original'
						? `sp-smart-team-card__avatar--ratio-${image.aspect}`
						: '',
					image.hoverEffect && image.hoverEffect !== 'none'
						? `sp-smart-team-card__avatar--effect-${image.hoverEffect}`
						: '',
				]
					.filter(Boolean)
					.join(' ');
				return (
					<div key="image" className={avatarClass}>
						{linksTo('image') ? (
							<a className="sp-smart-team-card__image-link" {...detailsLinkProps}>
								{imageWrap}
							</a>
						) : (
							imageWrap
						)}
						{/* card-6/card-8 — the social icons live on the photo in the
						    __social-flyout. card-6 adds the "+" toggle that flips to "×"
						    while the icon stack rises on card hover; card-8 shows a
						    static horizontal row (style.scss). Rendered only when the
						    member has socials. */}
						{socialInImage &&
						elements.includes('social') &&
						Array.isArray(member.socials) &&
						member.socials.length > 0 ? (
							<div
								className={`sp-smart-team-card__social-flyout sp-smart-team-card__social-flyout--${
									social.position || 'bottom-right'
								}`}
							>
								{renderElement('social')}
								{cardDesign === 'card-6' ? (
									<span
										className="sp-smart-team-card__social-toggle"
										aria-hidden="true"
									/>
								) : null}
							</div>
						) : null}
						{/* card-8 — the name/role caption straddles the photo's
						    bottom-left (white name box + tinted role chip). */}
						{captionInImage && (member.name || member.role) ? (
							<div className="sp-smart-team-card__image-caption">
								{['name', 'role'].map((key) =>
									elements.includes(key) ? renderElement(key) : null
								)}
							</div>
						) : null}
					</div>
				);
			}
			case 'name':
				return member.name ? (
					<NameTag key="name" className="sp-smart-team-card__name">
						{linksTo('name') ? (
							<a className="sp-smart-team-card__name-link" {...detailsLinkProps}>
								{member.name}
							</a>
						) : (
							member.name
						)}
					</NameTag>
				) : null;
			case 'role':
				return member.role ? (
					<div key="role" className="sp-smart-team-card__role">
						{member.role}
					</div>
				) : null;
			case 'bio': {
				const bio = resolveBio(member, basic);
				if (!bio) {
					return null;
				}
				return (
					<div key="bio" className="sp-smart-team-card__bio">
						{String(bio).trim()}
					</div>
				);
			}
			case 'email':
				return detailRow(
					'email',
					member.email ? (
						<a href={`mailto:${member.email}`} onClick={(e) => e.preventDefault()}>
							{member.email}
						</a>
					) : null,
					meta.showIcon,
					meta.iconSet
				);
			case 'website':
				return detailRow(
					'website',
					member.website ? (
						<a
							href={member.website}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.preventDefault()}
						>
							{member.website}
						</a>
					) : null,
					meta.showIcon,
					meta.iconSet
				);
			// Tappable like the frontend (MemberLayoutBlock::tel_href) — the href
			// drops whitespace, the displayed number keeps the author's format.
			case 'mobile':
				return detailRow('mobile', telLink(member.mobile), meta.showIcon, meta.iconSet);
			case 'phone':
				return detailRow('phone', telLink(member.phone), meta.showIcon, meta.iconSet);
			case 'location':
				return detailRow('location', member.location, meta.showIcon, meta.iconSet);
			case 'experience':
				return detailRow('experience', member.experience, meta.showIcon, meta.iconSet);
			case 'language':
				return detailRow('language', member.language, meta.showIcon, meta.iconSet);
			case 'gender':
				return detailRow('gender', member.gender, meta.showIcon, meta.iconSet);
			case 'skills':
				return Array.isArray(member.skills) && member.skills.length > 0 ? (
					<div
						key="skills"
						className={[
							'sp-smart-team-card__skills',
							`sp-smart-team-card__skills--${skills.displayStyle}`,
							// The bar-style variant only applies to progress bars.
							skills.displayStyle === 'progress'
								? `sp-smart-team-card__skills--${skills.barStyle}`
								: '',
							`sp-smart-team-card__skills--percent-${skills.percentVisibility}`,
						]
							.filter(Boolean)
							.join(' ')}
					>
						{member.skills.map((skill, i) => (
							<SkillItem key={i} skill={skill} displayStyle={skills.displayStyle} />
						))}
					</div>
				) : null;
			case 'custom':
				return Array.isArray(member.custom) && member.custom.length > 0 ? (
					<ul key="custom" className="sp-smart-team-card__custom">
						{member.custom.map((field, i) => (
							<li
								key={i}
								className="sp-smart-team-card__custom-item sp-smart-team-card__detail"
							>
								{metaIcon(field.icon, meta.showIcon)}
								<span className="sp-smart-team-card__detail-text">
									{field.value}
								</span>
							</li>
						))}
					</ul>
				) : null;
			case 'social':
				return Array.isArray(member.socials) && member.socials.length > 0 ? (
					<ul
						key="social"
						className={`sp-smart-team-card__social sp-smart-team-card__social--${social.iconStyle}`}
					>
						{member.socials.map((social, i) => (
							<li key={i}>
								<a
									className={`sptp-${social.group}`}
									href={social.link || '#'}
									onClick={(e) => e.preventDefault()}
								>
									<i className={iconClass(social.group)} />
								</a>
							</li>
						))}
					</ul>
				) : null;
			default:
				return null;
		}
	};

	// Stamp every rendered element with the inspector panel key that styles it,
	// so a click anywhere inside it (handleCardClick) opens that panel. Nested
	// renders (the card-6/8 social flyout, card-8 caption) stamp their own key —
	// closest() resolves to the innermost element under the cursor.
	const renderElement = (key) => {
		const el = renderElementRaw(key);
		const panel = ELEMENT_PANELS[key];
		if (!el || !panel) {
			return el;
		}
		return cloneElement(el, {
			className: [el.props.className, 'sp-panel-data'].filter(Boolean).join(' '),
			'data-component': panel,
		});
	};

	// Delegated on the card root: a click on a stamped element opens its panel;
	// a click on the card outside any element falls back to the Card Content
	// panel (styble-pro's ContentArea behavior).
	const handleCardClick = (event) => {
		if (event.target.closest('.sp-panel-data')) {
			togglePanelBody(event);
		} else if (openPanel !== 'elements') {
			togglePanelBody('elements');
		}
	};

	// Card Hover Effect and Hover Content are Pro — Free adds no
	// --hover-{effect} / --hover-reveal modifier and no reveal wrappers.
	const itemClass = [
		'sp-smart-team-card',
		`sp-smart-team-card--${cardDesign}`,
		// Image Position — the split designs' photo side: card-2 flips via
		// --image-left, card-5 (photo left by default) via --image-right;
		// card-9's __side column flips via --image-right.
		cardDesign === 'card-2' && imagePosition === 'left' ? 'sp-smart-team-card--image-left' : '',
		cardDesign === 'card-5' && imagePosition === 'right'
			? 'sp-smart-team-card--image-right'
			: '',
		cardDesign === 'card-9' && imageAreaPosition === 'right'
			? 'sp-smart-team-card--image-right'
			: '',
	]
		.filter(Boolean)
		.join(' ');

	// card-2 (Figma Card_02, horizontal), card-3 (Figma Card_03, overlap),
	// card-4 (Figma Card_04, photo-over-panel), card-5 (Figma Card_05,
	// horizontal photo-over-panel) render the photo as a sibling of
	// __content, so it leaves the
	// sortable flow: it is always visible.
	// Pro's overlay presets (overlay-1…overlay-5) do the same: the photo
	// fills the card and __content is a scrim layer over it — the photo must sit
	// OUTSIDE __content so it stays visible when the scrim fades (overlay-1/4
	// reveal on hover via __content opacity, which would otherwise hide the
	// photo too).
	const isOverlay = typeof cardDesign === 'string' && cardDesign.indexOf('overlay-') === 0;
	const imageFirst = ['card-3', 'card-4', 'card-5'].includes(cardDesign) || isOverlay;
	const splitImage = cardDesign === 'card-2' || imageFirst;
	// card-6 (Figma Card_06) and card-8 (Figma Card_08) keep the photo in the
	// sortable flow but move the social icons ONTO it (the __social-flyout
	// rendered in the image case), so the social element leaves the content
	// flow instead. card-8 additionally overlays the name/role caption on the
	// photo's bottom-left.
	// overlay-2 also moves the social icons onto the photo (dark chips, top-left);
	// its photo is image-first (above), so the flyout rides along with it.
	const socialInImage =
		cardDesign === 'card-6' || cardDesign === 'card-8' || cardDesign === 'overlay-2';
	const captionInImage = cardDesign === 'card-8';
	// card-9 (Figma Card_09, profile split) and card-10 (Figma Card_10,
	// bordered header card) group the photo, name and role in a __side wrapper
	// — a left column for card-9, a photo+text header row for card-10 (CSS
	// only) — while the remaining elements stay in __content. Side elements
	// are always visible.
	const SIDE_KEYS = ['image', 'name', 'role'];
	const sideColumn = cardDesign === 'card-9' || cardDesign === 'card-10';
	const contentElements = elements.filter(
		(key) =>
			!(splitImage && key === 'image') &&
			!(socialInImage && key === 'social') &&
			!(captionInImage && (key === 'name' || key === 'role')) &&
			!(sideColumn && SIDE_KEYS.includes(key))
	);
	const splitAvatar = splitImage && elements.includes('image') ? renderElement('image') : null;

	return (
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
		<div className={itemClass} onClick={handleCardClick}>
			{imageFirst ? splitAvatar : null}
			{sideColumn ? (
				<div className="sp-smart-team-card__side">
					{elements.filter((key) => SIDE_KEYS.includes(key)).map(renderElement)}
				</div>
			) : null}
			<div className="sp-smart-team-card__content">
				{contentElements.map(renderElement)}

				{readMore.show && (
					<div
						className="sp-smart-team-card__read-more sp-panel-data"
						data-component="readmore"
					>
						<a
							className="sp-smart-team-card__read-more-btn"
							href={member.link || '#'}
							onClick={(e) => e.preventDefault()}
						>
							<span>{readMore.label || __('Read More', 'team-free')}</span>
						</a>
					</div>
				)}
			</div>
			{cardDesign === 'card-2' ? splitAvatar : null}
		</div>
	);
}

// Ordered list of element keys to render, taken from the sortable Member
// Information list. Falls back to the core elements for legacy content saved
// before the list existed.
export const orderedElements = (cardElements) => {
	if (!Array.isArray(cardElements) || cardElements.length === 0) {
		return ['image', 'name', 'role', 'bio', 'social'];
	}
	return cardElements.filter((c) => c && c.show).map((c) => c.value);
};
