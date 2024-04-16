/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/js/service_worker.js":
/*!*************************************!*\
  !*** ./assets/js/service_worker.js ***!
  \*************************************/
/***/ (() => {

/*chrome.action.onClicked.addListener(function(tab) {
  chrome.storage.local.set({ tabId: tab.id }).then(() => {
    chrome.storage.local.set({ regExPatterns: default_regex });
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 850
    });
  });
});*/

var default_regex = [
/** 
{
  "name": "Bing Ads",
  "pattern": "bat\\.bing\\.com\\/(bat|action)",
  "iconPath": "bing_ads.svg",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "Double Click Remarketing",
  "pattern": "googleads\\.g\\.doubleclick\\.net\\/pagead\\/viewthroughconversion",
  "iconPath": "doubleclick.png",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "LinkedIn Conversion",
  "pattern": "(dc|px)\\.ads\\.linkedin\\.com\\/collect",
  "iconPath": "linkedin.png",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "Inspectlet",
  "pattern": "cdn\\.inspectlet\\.com\\/inspectlet\\.js",
  "iconPath": "inspectlet.svg",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "Hotjar",
  "pattern": "static\\.hotjar\\.com\\/c",
  "iconPath": "hotjar.svg",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "Google Ads Conversion",
  "pattern": "(google|googleadservices)\\.com\\/(ads|pagead)\\/conversion",
  "iconPath": "google_ads.svg",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "TikTok Pixel",
  "pattern": "analytics\\.tiktok\\.com\\/api\\/v2\\/pixel",
  "iconPath": "tiktok.svg",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "Facebook Event",
  "pattern": "facebook.com\\/tr",
  "iconPath": "facebook.svg",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "Facebook Connect",
  "pattern": "connect\\.facebook\\.net\\/signals\\/config",
  "iconPath": "facebook.svg",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "Adobe Analytics",
  "pattern": "b/ss",
  "iconPath": "adobe_analytics.svg",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "Google Analytics 3",
  "pattern": "[a-z]*\\.google-analytics\\.com\\/[a-z]*\\/collect\\?v=1|[a-z]*.google-analytics.com\\/collect\\?v=1",
  "iconPath": "google_analytics.svg",
  "ignore": true,
  "canBeDeleted": false
},
{
  "name": "Google Analytics 4",
  "pattern": "[a-z]*\\.google-analytics.com\\/[a-z]*\\/collect\\?v=2|[a-z]*.analytics\\.google\\.com\\/[a-z]*\\/collect\\?v=2",
  "iconPath": "google_analytics.svg",
  "ignore": true,
  "canBeDeleted": false
},
*/
{
  name: "GA4",
  pattern: "[a-z]\\.*google-analytics\\.com\\/[a-z]*\\/collect\\?v=2|[a-z]*analytics.google\\.com\\/[a-z]*\\/collect\\?v=2",
  iconPath: "GA4_KS5yZoV.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "GA3",
  pattern: "[a-z]*\\.google-analytics\\.com\\/[a-z]*\\/collect\\?v=1|[a-z]*\\.google-analytics\\.com\\/collect\\?v=1",
  iconPath: "google_analytics_UA.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Adobe Analytics",
  pattern: "b/ss",
  iconPath: "Adobe_Analytics_1epQelI.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Facebook Connect",
  pattern: "connect\\.facebook\\.net\\/signals\\/config",
  iconPath: "facebook.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Facebook Event",
  pattern: "facebook\\.com\\/tr",
  iconPath: "facebook_7r6aCSk.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Bing Ads",
  pattern: "bat\\.bing\\.com\\/(bat|action)",
  iconPath: "bing.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Double Click Remarketing",
  pattern: "googleads\\.g\\.doubleclick\\.net\\/pagead\\/viewthroughconversion",
  iconPath: "154.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "LinkedIn Conversion",
  pattern: "(dc|px).ads.linkedin.com/collect",
  iconPath: "linkedin.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Inspectlet",
  pattern: "cdn\\.inspectlet\\.com\\/inspectlet.js",
  iconPath: "inspectlet.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Hotjar",
  pattern: "static\\.hotjar\\.com\\/c",
  iconPath: "hotjar.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Google Ads Conversion",
  pattern: "(google|googleadservices)\\.com\\/(ads|pagead)\\/conversion",
  iconPath: "google_ads.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "TikTok Pixel",
  pattern: "analytics\\.tiktok\\.com\\/api\\/v2\\/pixel",
  iconPath: "tiktok.webp",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Google Tag Manager",
  pattern: "googletagmanager",
  iconPath: "GTM.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Adobe Launch",
  pattern: "/launch-.+\\.js",
  iconPath: "Adobe_Launch.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "MS Clarity",
  pattern: "clarity\\.ms",
  iconPath: "clarity.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Piwik",
  pattern: "ppms\\.php",
  iconPath: "Piwik_vPynUfs.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Tealium Bootstrap",
  pattern: '"tags(?:-eu)?\\.tiqcdn\\.c(?:om|n) utag.js"',
  iconPath: "Tealium_ptQ7pYl.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Tealium Collect",
  pattern: "collect.*\\.tealiumiq\\.com",
  iconPath: "Tealium_1qu2F0v.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Tealium Cookie Sync",
  pattern: "datacloud.tealiumiq.com",
  iconPath: "Tealium_EcWNvAl.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Tealium Data Layer Enrichment",
  pattern: "visitor-service.*\\.tealiumiq\\.com",
  iconPath: "Tealium_DShQxXC.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Tealium Tag Load",
  pattern: '"tags(?:-eu)?\\.tiqcdn\\.c(?:om|n) utag\\..+\\.js"',
  iconPath: "Tealium_DShQxXC.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Yahoo Ads Exchange",
  pattern: "ads.yahoo.com",
  iconPath: "yahoo_zlelQfh.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Yahoo Analytics",
  pattern: "sp.analytics.yahoo.com",
  iconPath: "yahoo_zlelQfh.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "YouTube Stats",
  pattern: "s.youtube.com",
  iconPath: "youtube.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Wordpress Site Stats",
  pattern: "pixel.wp.com",
  iconPath: "wordpress.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Twitter Widget",
  pattern: "platform\\.twitter\\.com",
  iconPath: "twitter.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Quantcast",
  pattern: "pixel\\.quantserve\\.com",
  iconPath: "Quantcast-Logo.jpg",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Qubit Open Tag",
  pattern: "d3c3cq33003psk\\.cloudfront\\.net",
  iconPath: "qubitopentag.webp",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Mixpanel",
  pattern: ".mixpanel.com\\/\\.\\/track.*",
  iconPath: "mixpanel.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Salesforce DMP Control Tag",
  pattern: "cdn\\.krxd\\.net.*\\/controltag",
  iconPath: "salesforce_zNae3ar.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Salesforce DMP Pixel",
  pattern: "beacon\\.krxd\\.net.*\\/pixel\\.gif",
  iconPath: "salesforce_Cv5RT9e.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Salesforce DMP Usermatch",
  pattern: "beacon\\.krxd\\.net\\/usermatch\\.gif",
  iconPath: "salesforce_oBENcdj.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Salesforce Live Agent",
  pattern: "\\.salesforceliveagent\\.com.*chat\\/rest",
  iconPath: "salesforce_mjLo2MG.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Salesforce Marketing Cloud Analytics",
  pattern: "nova\\.collect\\.igodigital\\.com.*/c2/\\d+/track_",
  iconPath: "salesforce_mjLo2MG.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Adobe Audience Manager",
  pattern: "demdex.net.*\\/(demconf|ibs|dest5)",
  iconPath: "Adobe_Audience_Manager_U003ytE.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Adobe Audience Manager Event",
  pattern: "demdex.net.*\\/Event",
  iconPath: "Adobe_Audience_Manager_IfpvyPf.png",
  ignore: true,
  canBeDeleted: false
}, {
  name: "Adobe Audience Manager ID",
  pattern: "dpm\\.demdex\\.net.*id",
  iconPath: "Adobe_Audience_Manager.png",
  ignore: true,
  canBeDeleted: false
}];
var presetJSObjects = ["digitalLayer", "dataLayer", "utag", "utag_data"];
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    chrome.storage.local.set({
      regExPatterns: default_regex
    });
    chrome.storage.local.set({
      dataLayers: presetJSObjects
    });
  }
});

/***/ }),

/***/ "./assets/sass/popup.scss":
/*!********************************!*\
  !*** ./assets/sass/popup.scss ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
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
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"/dist/service_worker": 0,
/******/ 			"dist/css/popup": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, ["dist/css/popup"], () => (__webpack_require__("./assets/js/service_worker.js")))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["dist/css/popup"], () => (__webpack_require__("./assets/sass/popup.scss")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;