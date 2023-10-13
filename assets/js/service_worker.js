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
]

const presetJSObjects = ['digitalLayer', 'dataLayer', 'utag', 'utag_data'];
chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
    chrome.storage.local.set({ regExPatterns: default_regex });
    chrome.storage.local.set({ dataLayers: presetJSObjects });
  }
});

