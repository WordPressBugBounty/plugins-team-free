/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/shortcode/blockIcon.js":
/*!************************************!*\
  !*** ./src/shortcode/blockIcon.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/escape-html */ "@wordpress/escape-html");
/* harmony import */ var _wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);


const el = _wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement;
const icons = {};
icons.teamFree = el('img', {
  src: (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__.escapeAttribute)(TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block.svg')
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (icons);

/***/ }),

/***/ "./src/shortcode/dynamicShortcode.js":
/*!*******************************************!*\
  !*** ./src/shortcode/dynamicShortcode.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/escape-html */ "@wordpress/escape-html");
/* harmony import */ var _wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/**
* Shortcode select component.
*/



const el = _wordpress_element__WEBPACK_IMPORTED_MODULE_2__.createElement;
const DynamicShortcodeInput = ({
  attributes: {
    shortcode
  },
  shortCodeList,
  shortcodeUpdate
}) => (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.Fragment, null, el('div', {
  className: 'sptp-gutenberg-shortcode editor-styles-wrapper'
}, el('select', {
  className: 'sptp-shortcode-selector',
  onChange: e => shortcodeUpdate(e),
  value: (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__.escapeAttribute)(shortcode)
}, el('option', {
  value: (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__.escapeAttribute)('0')
}, (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__.escapeHTML)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('-- Select a Team --', 'wp-team'))), shortCodeList.map(shortcode => {
  var title = shortcode.title.length > 30 ? shortcode.title.substring(0, 25) + '.... #(' + shortcode.id + ')' : shortcode.title + ' #(' + shortcode.id + ')';
  return el('option', {
    value: (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__.escapeAttribute)(shortcode.id.toString()),
    key: (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__.escapeAttribute)(shortcode.id.toString())
  }, (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_0__.escapeHTML)(title));
}))));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DynamicShortcodeInput);

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/escape-html":
/*!************************************!*\
  !*** external ["wp","escapeHtml"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["escapeHtml"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shortcode_blockIcon__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shortcode/blockIcon */ "./src/shortcode/blockIcon.js");
/* harmony import */ var _wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/escape-html */ "@wordpress/escape-html");
/* harmony import */ var _wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _shortcode_dynamicShortcode__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shortcode/dynamicShortcode */ "./src/shortcode/dynamicShortcode.js");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_7__);








const {
  serverSideRender: ServerSideRender
} = wp;
const el = _wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement;

/**
 * Register: SmartTeam Free Gutenberg Block.
 */
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_5__.registerBlockType)('sp-team-pro/shortcode', {
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('SmartTeam', 'team-free'),
  description: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('Use SmartTeam to insert a team in your page', 'team-free'),
  icon: _shortcode_blockIcon__WEBPACK_IMPORTED_MODULE_0__["default"].teamFree,
  category: 'common',
  supports: {
    html: false
  },
  edit: props => {
    const {
      attributes,
      setAttributes
    } = props;
    var shortCodeList = TeamFreeGbScript.shortCodeList;
    let scriptLoad = shortcodeId => {
      let spspBlockLoaded = false;
      let spspBlockLoadedInterval = setInterval(function () {
        let uniqId = jQuery("#sptp-" + shortcodeId).parents().attr('id');
        if (document.getElementById(uniqId)) {
          //Actual functions goes here
          jQuery.getScript(TeamFreeGbScript.loodScript);
          spspBlockLoaded = true;
          uniqId = '';
        }
        if (spspBlockLoaded) {
          clearInterval(spspBlockLoadedInterval);
        }
        if (0 == shortcodeId) {
          clearInterval(spspBlockLoadedInterval);
        }
      }, 100);
    };
    let updateShortcode = updateShortcode => {
      setAttributes({
        shortcode: updateShortcode.target.value
      });
    };
    let shortcodeUpdate = e => {
      updateShortcode(e);
      let shortcodeId = e.target.value;
      scriptLoad(shortcodeId);
    };
    if (jQuery('.sptp-section:not(.sptp-carousel-loaded)').length > 0) {
      let shortcodeId = (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__.escapeAttribute)(attributes.shortcode);
      scriptLoad(shortcodeId);
    }
    if (attributes.preview) {
      return el('div', {}, el('img', {
        src: (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__.escapeAttribute)(TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block-preview.svg')
      }));
    }
    if (shortCodeList.length === 0) {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.Fragment, null, el('div', {
        className: 'components-placeholder components-placeholder is-large'
      }, el('div', {
        className: 'components-placeholder__label'
      }, el('img', {
        className: 'block-editor-block-icon',
        src: (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__.escapeAttribute)(TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block.svg')
      }), (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__.escapeHTML)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)('SmartTeam', 'team-free'))), el('div', {
        className: 'components-placeholder__instructions'
      }, (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__.escapeHTML)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)("No team found. ", "team-free")), el('a', {
        href: (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__.escapeAttribute)(TeamFreeGbScript.url)
      }, (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__.escapeHTML)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)("Create a team now!", "team-free"))))));
    }
    if (!attributes.shortcode || attributes.shortcode == 0) {
      return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.PanelBody, {
        title: "Select a Team"
      }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_shortcode_dynamicShortcode__WEBPACK_IMPORTED_MODULE_2__["default"], {
        attributes: attributes,
        shortCodeList: shortCodeList,
        shortcodeUpdate: shortcodeUpdate
      })))), el('div', {
        className: 'components-placeholder components-placeholder is-large'
      }, el('div', {
        className: 'components-placeholder__label'
      }, el('img', {
        className: 'block-editor-block-icon',
        src: (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__.escapeAttribute)(TeamFreeGbScript.path + 'src/Admin/GutenbergBlock/assets/wp-team-block.svg')
      }), (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__.escapeHTML)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)("SmartTeam", "team-free"))), el('div', {
        className: 'components-placeholder__instructions'
      }, (0,_wordpress_escape_html__WEBPACK_IMPORTED_MODULE_1__.escapeHTML)((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_4__.__)("Select a Team", "team-free"))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_shortcode_dynamicShortcode__WEBPACK_IMPORTED_MODULE_2__["default"], {
        attributes: attributes,
        shortCodeList: shortCodeList,
        shortcodeUpdate: shortcodeUpdate
      })));
    }
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.Fragment, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.PanelBody, {
      title: "Select a Team"
    }, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_6__.PanelRow, null, (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(_shortcode_dynamicShortcode__WEBPACK_IMPORTED_MODULE_2__["default"], {
      attributes: attributes,
      shortCodeList: shortCodeList,
      shortcodeUpdate: shortcodeUpdate
    })))), (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.createElement)(ServerSideRender, {
      block: "sp-team-pro/shortcode",
      attributes: attributes
    }));
  },
  save() {
    // Rendering in PHP
    return null;
  }
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map