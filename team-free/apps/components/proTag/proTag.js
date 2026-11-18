/**
 * ProTag — the green "(Pro)" label next to a locked control's own label
 * (Toggle, Popover, MultipleSelect, SPToggleGroupControl, select rows). As in
 * wp-carousel-free (`.wpcp-toggle-pro-tag`) it is a plain marker and never
 * links anywhere: only a Pro notice's "Upgrade to Pro" button opens pricing.
 *
 * `UPGRADE_URL` is that button's link (ProNotice).
 */

import { __ } from '@wordpress/i18n';
import './editor.scss';

export const UPGRADE_URL =
	'https://getwpteam.com/pricing/?utm_source=free-plugin&utm_medium=pro-control';

const ProTag = () => <span className="sp-smart-team-pro-tag">({__('Pro', 'team-free')})</span>;

export default ProTag;
