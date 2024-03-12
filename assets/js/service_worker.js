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

const default_regex = [
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
    pattern:
      "[a-z]\\.*google-analytics\\.com\\/[a-z]*\\/collect\\?v=2|[a-z]*analytics.google\\.com\\/[a-z]*\\/collect\\?v=2",
    iconPath: "GA4_KS5yZoV.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "GA3",
    pattern:
      "[a-z]*\\.google-analytics\\.com\\/[a-z]*\\/collect\\?v=1|[a-z]*\\.google-analytics\\.com\\/collect\\?v=1",
    iconPath: "google_analytics_UA.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Adobe Analytics",
    pattern: "b/ss",
    iconPath: "Adobe_Analytics_1epQelI.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Facebook Connect",
    pattern: "connect\\.facebook\\.net\\/signals\\/config",
    iconPath: "facebook.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Facebook Event",
    pattern: "facebook\\.com\\/tr",
    iconPath: "facebook_7r6aCSk.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Bing Ads",
    pattern: "bat\\.bing\\.com\\/(bat|action)",
    iconPath: "bing.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Double Click Remarketing",
    pattern:
      "googleads\\.g\\.doubleclick\\.net\\/pagead\\/viewthroughconversion",
    iconPath: "154.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "LinkedIn Conversion",
    pattern: "(dc|px).ads.linkedin.com/collect",
    iconPath: "linkedin.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Inspectlet",
    pattern: "cdn\\.inspectlet\\.com\\/inspectlet.js",
    iconPath: "inspectlet-icon.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Hotjar",
    pattern: "static\\.hotjar\\.com\\/c",
    iconPath: "hotjar.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Google Ads Conversion",
    pattern: "(google|googleadservices)\\.com\\/(ads|pagead)\\/conversion",
    iconPath: "google_ads.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "TikTok Pixel",
    pattern: "analytics\\.tiktok\\.com\\/api\\/v2\\/pixel",
    iconPath: "tiktok.webp",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Google Tag Manager",
    pattern: "googletagmanager",
    iconPath: "GTM.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Adobe Launch",
    pattern: "/launch-.+\\.js",
    iconPath: "Adobe_Launch.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "MS Clarity",
    pattern: "clarity\\.ms",
    iconPath: "clarity.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Piwik",
    pattern: "ppms\\.php",
    iconPath: "Piwik_vPynUfs.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Tealium Bootstrap",
    pattern: '"tags(?:-eu)?\\.tiqcdn\\.c(?:om|n) utag.js"',
    iconPath: "Tealium_ptQ7pYl.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Tealium Collect",
    pattern: "collect.*\\.tealiumiq\\.com",
    iconPath: "Tealium_1qu2F0v.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Tealium Cookie Sync",
    pattern: "datacloud.tealiumiq.com",
    iconPath: "Tealium_EcWNvAl.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Tealium Data Layer Enrichment",
    pattern: "visitor-service.*\\.tealiumiq\\.com",
    iconPath: "Tealium_DShQxXC.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Tealium Tag Load",
    pattern: '"tags(?:-eu)?\\.tiqcdn\\.c(?:om|n) utag\\..+\\.js"',
    iconPath: "Tealium.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Yahoo Ads Exchange",
    pattern: "ads.yahoo.com",
    iconPath: "yahoo_zlelQfh.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Yahoo Analytics",
    pattern: "sp.analytics.yahoo.com",
    iconPath: "yahoo.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "YouTube Stats",
    pattern: "s.youtube.com",
    iconPath: "youtube.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Wordpress Site Stats",
    pattern: "pixel.wp.com",
    iconPath: "wordpress.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Twitter Widget",
    pattern: "platform\\.twitter\\.com",
    iconPath: "twitter.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Quantcast",
    pattern: "pixel\\.quantserve\\.com",
    iconPath: "Quantcast-Logo.jpg",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Qubit Open Tag",
    pattern: "d3c3cq33003psk\\.cloudfront\\.net",
    iconPath: "11.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Mixpanel",
    pattern: "api\\-js\\.mixpanel\\.com",
    iconPath: "mixpanel.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Salesforce DMP Control Tag",
    pattern: "cdn\\.krxd\\.net.*\\/controltag",
    iconPath: "salesforce_zNae3ar.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Salesforce DMP Pixel",
    pattern: "beacon\\.krxd\\.net.*\\/pixel\\.gif",
    iconPath: "salesforce_Cv5RT9e.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Salesforce DMP Usermatch",
    pattern: "beacon\\.krxd\\.net\\/usermatch\\.gif",
    iconPath: "salesforce_oBENcdj.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Salesforce Live Agent",
    pattern: "\\.salesforceliveagent\\.com.*chat\\/rest",
    iconPath: "salesforce_mjLo2MG.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Salesforce Marketing Cloud Analytics",
    pattern: "nova\\.collect\\.igodigital\\.com.*/c2/\\d+/track_",
    iconPath: "salesforce.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Adobe Audience Manager",
    pattern: "demdex.net.*\\/(demconf|ibs|dest5)",
    iconPath: "Adobe_Audience_Manager_U003ytE.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Adobe Audience Manager Event",
    pattern: "demdex.net.*\\/Event",
    iconPath: "Adobe_Audience_Manager_IfpvyPf.png",
    ignore: true,
    canBeDeleted: false,
  },
  {
    name: "Adobe Audience Manager ID",
    pattern: "dpm\\.demdex\\.net.*id",
    iconPath: "Adobe_Audience_Manager.png",
    ignore: true,
    canBeDeleted: false,
  },
];

const presetJSObjects = ["digitalLayer", "dataLayer", "utag", "utag_data"];
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == "install") {
    chrome.storage.local.set({ regExPatterns: default_regex });
    chrome.storage.local.set({ dataLayers: presetJSObjects });
  }
});
