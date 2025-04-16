import { escapeAttribute } from "@wordpress/escape-html";
import { createElement } from '@wordpress/element';
const el = createElement;
const icons = {};
icons.teamFree = el('img', {src: escapeAttribute( TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block.svg' )})
export default icons;