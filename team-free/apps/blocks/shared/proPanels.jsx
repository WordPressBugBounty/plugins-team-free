/**
 * Pro-only Inspector panels — Additional Information and Motion
 * Effects (Figma: Smart Team / Carousel sidebar, node 678:280711; notes
 * 728:185004, 728:185022, 728:185945).
 *
 * Real Testimonials Free pattern: the panel stays in the sidebar with a crown
 * in its title (ProPanelTitle) and its body is nothing but a Pro Features
 * teaser. Free ships no controls and no render code for these features
 * (CLAUDE.md Rule 8); their attributes stay registered so a block Pro saved
 * keeps its values byte for byte (Rule 2).
 */

import { ProNotice } from '../../components';
import { PRO_NOTICE_ADDITIONAL_INFO, PRO_NOTICE_MOTION_EFFECTS } from './proNotices';

export const AdditionalInformationPro = () => <ProNotice {...PRO_NOTICE_ADDITIONAL_INFO} isPanel />;

export const MotionEffectsPro = () => <ProNotice {...PRO_NOTICE_MOTION_EFFECTS} isPanel />;
