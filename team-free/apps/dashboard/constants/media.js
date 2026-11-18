// The intro video shown on Getting Started and on the wizard's Welcome step —
// both render the same poster, so the id and poster path live in one place.
// "Smart Team - Getting Started" (ShapedPlugin YouTube). The poster is shipped
// locally so nothing is requested from YouTube until the visitor clicks play.
export const INTRO_VIDEO_ID = 'E1PwdV-czeU';

// The Smart Team tutorials playlist, opened by Get Help → Video Tutorials.
export const VIDEO_TUTORIALS_URL =
	'https://www.youtube.com/watch?v=83dNkEYjqgI&list=PLoUb-7uG-5jPD1kYP1fEB3gXFCspg5C8r';

export const introVideoPoster = (pluginUrl) =>
	pluginUrl ? `${pluginUrl}dist/images/getting-started-thumb.webp` : '';
