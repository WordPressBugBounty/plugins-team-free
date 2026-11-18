/**
 * Grid — General inspector.
 *
 * The panel layout and shared card panels come from the shared
 * LayoutInspector; the grid contributes only its Display Settings body.
 */

import LayoutInspector from '../shared/inspector';
import { DisplaySettings } from './displaySettings';

const Inspector = (props) => <LayoutInspector {...props} DisplaySettings={DisplaySettings} />;

export default Inspector;
