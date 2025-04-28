// popup.js - Vanilla JS implementation of Popup component

import { createTab } from './Tab.js';
import { createTabs } from './Tabs.js';
import { createTagView } from './panels/TagView.js';
import { createDataLayerView } from './panels/DataLayerView.js';
import { createModal } from './Modal.js';
import { createNotificationManager } from './Notification.js';
import { chromeHelper, isDevTools } from '../lib/chromeHelpers.js';
import { createAudit } from './audit.js';
import {trackTagImpressionEvent} from '../google-analytics.js';
// import FileSaver from '../lib/FileSaver.min.js';
// import XLSX from '../lib/xlsx.full.min.js';

function loadpopupStyles() {
  if (!document.getElementById('popup-styles')) {
    const link = document.createElement('link');
    link.id = 'popup-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/popup.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

export function createPopup() {
  // Ensure the CSS is loaded
  loadpopupStyles();
  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';

  // State
  let state = {
    openNewTab: false,
    lockToggling: false,
    fileName: '',
    exportModalErrors: [],
    showModal: false,
    isInspecting: false,
    readyForInjection: true,
    regexList: [],
    regexOccurances: [],
    data: [],
    notificationData: [],
    tagExport: [],
    tagCounts: [],
    dlExport: [],
    allowedLayers: [
      'google_tag_manager_push',
      'google_tag_manager',
      'tealium',
      'tag_commander',
      'adobe_dtm',
      'var',
      'launchdataelements',
      'adobetags'
    ],
    allowedDataLayers: {
      'google_tag_manager_push': false,
      'google_tag_manager': false,
      'tealium': false,
      'tag_commander': false,
      'adobe_dtm': false,
      'var': true,
      'launchdataelements': true,
      'adobetags': false
    },
    tabId: null,
    historyMode: false,
    trackedTags: {}, 
  };

  // Initialize components
  const notificationManager = createNotificationManager();
  const modal = createModal();
  modal.element.style.display = 'none';

  // Create tabs system
  const tabs = createTabs(toggleInspection);

  // Create TagView tab
  const tagView = createTagView({
    isInspecting: state.isInspecting,
    data: state.data,
    occurrences: state.regexOccurances,
    filterOptions: state.tagCounts,
    onEditEventTitle: editEventTitle,
    onToggleInspection: toggleInspection,
    onExportData: exportDataConfirm,
    onResetData: resetData,
    onNotification: (notification) => {
      notificationManager.addNotification(notification);
    }
  });

  const tagViewTab = createTab('Tags View');
  tagViewTab.appendContent(tagView.element);
  tabs.addTab(tagViewTab, 'Tags View');

  // Create DataLayerView tab
  const dataLayerView = createDataLayerView({
    isInspecting: state.isInspecting,
    data: state.data,
    onEditEventTitle: editEventTitle,
    onToggleInspection: toggleInspection,
    onExportData: exportDataConfirm,
    onResetData: resetData,
    onNotification: (notification) => {
      notificationManager.addNotification(notification);
    }
  });

  const dataLayerViewTab = createTab('Data Layer View', false);
  dataLayerViewTab.appendContent(dataLayerView.element);
  tabs.addTab(dataLayerViewTab, 'Data Layer View');

  // Create NewView tab
  const newView = createAudit({
    someOption: true, // Pass any required options for the new view
    onSomeAction: () => {
      console.log('Action triggered from Audit');
    },
  });

  const newViewTab = createTab('Audit', false); // Create the Audit
  newViewTab.appendContent(newView.element); // Append the content of the new view
  tabs.addTab(newViewTab, 'Audit'); // Add the Audit to the tabs system

  // Create footer
  const footer = document.createElement('div');
  footer.className = 'footer';

  // Assemble the popup
  wrapper.append(modal.element, tabs.element, footer, notificationManager.element);

  // Initialize
  if (isDevTools()) {
    state.tabId = chrome.devtools.inspectedWindow.tabId;
    if (!state.tabId) {
      console.log("No valid tabId found.");
      return;
    }
    init();
  }
  // toggleInspection();

  // Methods
  function primeExport() {
    let exportData = { tags: [], dLs: [] };
    state.data.map((url, index) => {
      url.events.map((event, index) => {
        let exportTags = {
          Url: url.pageUrl,
          Event: event.name,
        };
        let exportDls = {
          Url: url.pageUrl,
          Event: event.name,
        };

        // Tags
        if (event.tags !== undefined && event.tags.length > 0) {
          event.tags.map((tag, index) => {
            if (tag.content !== undefined) {
              exportTags = {
                ...exportTags,
                Technology: tag.name,
                ...tag.content
              };
            }
            exportData.tags.push(exportTags);
          });
        } else {
          exportData.tags.push(exportTags);
        }

        // Data Layers
        if (event.dataLayers !== undefined && event.dataLayers.length > 0) {
          event.dataLayers.map((dL, index) => {
            if (dL.data !== undefined) {
              Object.keys(dL.data).forEach((key) => {
                exportData.dLs.push({
                  ...exportDls,
                  name: dL.dLN,
                  "Push Event": key,
                  ...flattenJsonObject(dL.data[key])
                });
              });
            }
          });
        } else {
          exportData.dLs.push(exportDls);
        }
      });
    });

    return exportData;
  }

  function editEventTitle(title, urlIndex, eventIndex) {
    state.data[urlIndex].events[eventIndex].name = title;
  }

  async function init() {

    // Check the historyMode value from Chrome storage
    chrome.storage.local.get(['historyMode', 'savedData'], (result) => {
      const historyMode = result.historyMode || false;

      if (historyMode) {
        console.log('History mode is enabled.');

        // Render saved data from Chrome storage
        if (result.savedData) {
          state.data = result.savedData;
          console.log('Restored saved data:', state.data);
          tagView.updateData(state.data);
          dataLayerView.updateData(state.data);
        }
        getRegexList().then((regexList) => {
          state.regexList = regexList;
        });
        // Disable new tag detection
        state.isInspecting = false;
        removeListeners(); // Ensure no listeners are active
      } else {
        console.log('Normal mode is enabled.');

        // Normal mode: Initialize regex list and start detection
        initializeNormalMode();
      }
    });
  }

  function initializeNormalMode() {
    // Load regex patterns and initialize listeners
    getRegexList().then((regexList) => {
      state.regexList = regexList;
      dispatchListeners();
      updateBadge();
    });
    toggleInspection(); // Start inspection
    // Enable inspection
    state.isInspecting = true;
  }

  // // Start button click handler
  // document.getElementById('start-button').addEventListener('click', () => {
  //   console.log('Start button clicked.');

  //   // Clear history and start new detection
  //   chrome.storage.local.remove(['savedData', 'historyMode'], () => {
  //     console.log('History cleared and historyMode set to false.');

  //     // Set historyMode to false and start new detection
  //     state.isInspecting = true;
  //     toggleInspection(); // Start new detection
  //   });
  // });
  function simulateOnSuspend() {
    alert('Simulating onSuspend...');
    chrome.storage.local.set({ savedData: state.data }, (save) => {
      chrome.storage.local.get("savedData", (result) => {
        ;
        console.log('Data saved to Chrome storage (simulation).', result);
      });
    }
    )
  }

  // Call this function manually to test
  // simulateOnSuspend();
  // Save data to Chrome storage when DevTools or Chrome is closed
  chrome.runtime.onSuspend.addListener(() => {
    alert('Saving data to Chrome storage before suspension.');
    chrome.storage.local.set({ savedData: state.data }, () => {
      console.log('Data saved to Chrome storage.');
    });
    stopInspection(); // Stop inspection and remove listeners
  });

  chrome.runtime.onSuspendCanceled.addListener(() => {
    console.log('onSuspendCanceled triggered: Suspension was canceled.');
    alert('onSuspendCanceled triggered: Suspension was canceled.');
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === state.tabId) {
      console.log('Saving data to Chrome storage before tab is closed.');
      chrome.storage.local.set({ savedData: state.data }, () => {
        console.log('Data saved to Chrome storage.');
      });
      stopInspection(); // Stop inspection and remove listeners
      state.data = []; // Clear state data
    }
  });
  // chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  //   if (tabId === state.tabId && changeInfo.status === 'loading') {
  //     console.log('Tab reloaded. Resetting inspection.');
  //     stopInspection(); // Stop inspection and remove listeners
  //     state.data = []; // Clear state data
  //   }
  // });
  chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed or reloaded.');
  });
  function clearHistory() {
    chrome.storage.local.remove('savedData', () => {
      console.log('History cleared.');
      state.data = [];
      tagView.updateData(state.data);
      dataLayerView.updateData(state.data);
      updateBadge();
    });
  }

  function toggleHistoryMode() {
    state.historyMode = !state.historyMode;
    init(); // Reinitialize based on the selected mode
  }
  function parsePostData(postData) {
    if (postData !== undefined) {
      const KeywordRegex = /[a-z]+=/;
      let keyword = '';
      let parsedData = [];
      try {
        keyword = postData.match(KeywordRegex)[0];
        const substrings = postData.replaceAll(/\n|\r/g, '').replaceAll(keyword, ';' + keyword).replace(';', '').split(';');
        substrings.map((ele) => {
          parsedData.push(getUrlParams('https://www.bienspasser.com?' + ele));
        });
      } catch (err) {
        try {
          const _data = JSON.parse(postData);
          parsedData.push(_data);
        } catch (_err) {
          parsedData.push({ 'postData': postData });
        }
      }
      return parsedData || [];
    } else {
      return [];
    }
  }

  function parseInitiator(initiator) {
    let initiatorData = {};

    if (initiator.type === 'script') {
      // Check if stack and callFrames exist
      const callFrames = initiator.stack?.callFrames || initiator.stack?.parent?.callFrames;
      if (callFrames && callFrames[0]) {
        initiatorData = {
          type: 'script',
          origin: callFrames[0].url || 'Unknown origin',
        };
      } else {
        initiatorData = {
          type: 'script',
          origin: 'Unknown origin',
        };
      }
    } else if (initiator.type === 'parser') {
      initiatorData = {
        type: 'parser',
        origin: initiator.url || 'Unknown origin',
      };
    } else {
      console.log({ Else: 'Unhandled initiator type', initiator });
      initiatorData = {
        type: initiator.type || 'unknown',
        origin: 'Unknown origin',
      };
    }

    return initiatorData;
  }

  function devtoolsNetworkRequest(request) {
    const details = request.request;
    state.regexList.forEach((element, index) => {
      if (RegExp(element.pattern).test(details.url) && !element.ignore && details.hasOwnProperty('url') && state.isInspecting) {

        const urlParams = details.url;
        const postData = parsePostData(details.postData?.text);
        const initiator = parseInitiator(request._initiator);
        const domain = new URL(details.url).hostname; // Extract the domain name

        const content = { ...{ request: details.url }, ...initiator, ...getUrlParams(urlParams), domain };
        if (!state.regexOccurances[element.name].passed) {
          state.regexOccurances[element.name].passed = true;
          const occurences = state.regexOccurances[element.name].occurences + 1;
          state.regexOccurances[element.name].occurences = occurences;
        }
        const data = {
          name: element.name,
          occurences: state.regexOccurances[element.name].occurences, // Include the impression count
          content: content,
          timeStamp: Date.now(),
          payload: postData,
          initiatior: initiator
        };
        pushData(data, 'tags', element.name, element.iconPath);
      }
    });
  }

  function dispatchListeners() {
    
    removeListeners();
    addEventListeners();
  }

  async function getRegexList() {
    var regexList = await chromeHelper.localStorageGet(["regExPatterns"]);
    const regexWarnMessage = {
      type: "warning",
      title: "Empty Regex Patterns List",
      message: "Regex patterns must be provided for recording tags"
    };

    if (!regexList.regExPatterns) {
      regexList.regExPatterns = [];
      notificationManager.addNotification(regexWarnMessage);
    } else if (!regexList.regExPatterns.length) {
      notificationManager.addNotification(regexWarnMessage);
    }

    initRegexOccurances(regexList.regExPatterns);
    return regexList.regExPatterns;
  }

  function initRegexOccurances(regexList) {
    if (regexList.length) {
      regexList.forEach((element) => {
        state.regexOccurances[element.name] = { passed: false, occurences: 0 };
      });
    }
  }

  function resetOccurancesCounter() {
    Object.keys(state.regexOccurances).forEach(key => {
      state.regexOccurances[key].passed = false;
    });
  }

  function addEventListeners() {
    chromeHelper.listenOnLocalStorageChange(listenOnRegexChange);
    chromeHelper.listenOnTabUpdated(listenToUrlChanges);
    chromeHelper.listenOnTabClosed(handleTabclosed);
    chrome.devtools.network.onRequestFinished.addListener(devtoolsNetworkRequest);
    chromeHelper.listenToRuntimeMessages(captureDataLayer);
  }

  function removeListeners() {
    try {
      chromeHelper.removeLocalStorageChangeListener(listenOnRegexChange);
      chromeHelper.removeRuntimeMessagesListener(captureDataLayer);
      chromeHelper.removeTabUpdatedListener(listenToUrlChanges);
      chromeHelper.removeTabClosedListener(handleTabclosed);
      chrome.devtools.network.onRequestFinished.removeListener(devtoolsNetworkRequest);
    } catch (error) {
      console.log("Error removing listeners:", error);
    }
  }

  function listenOnRegexChange(changes, areaName) {
    if (areaName === "local" && changes.regExPatterns) {
      state.regexList = changes.regExPatterns.newValue;
    }
  }

  function listenToUrlChanges(details) {
    if (isValidHttpUrl(details)) {
      pushUrl(details);
      removeListeners();
      addEventListeners();
      injectMainContentScript();
    }
  }

function injectMainContentScript() {
  chrome.scripting.executeScript(
    {
      target: { tabId: state.tabId },
      files: ['content/content.js'], // Path to your content script
    },
    (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error injecting content script:', chrome.runtime.lastError.message);
      } else {
        console.log('Content script injected successfully.');
      }
    }
  );
}

  async function pushUrl(url) {
    if (!state.isInspecting) return;
    resetOccurancesCounter();
    let allowedDataLayers = {};
    await chrome.storage.local.get("allowedLayers").then((result) => {
      allowedDataLayers = result.allowedLayers || {
        adobe_dtm: false,
        adobetags: false,
        dataLayer: true,
        digitalLayer: true,
        google_tag_manager: false,
        google_tag_manager_push: false,
        launchdataelements: false,
        tag_commander: false,
        tealium: false,
        utag: true,
        utag_data: true,
        var: false
      };
    });
    const newUrlData = {
      pageUrl: url,
      events: [{ name: 'Load', timeStamp: Date.now() ,settings: {dl: allowedDataLayers}}],
    };
    state.data.push(newUrlData);
    tagView.updateData(state.data);
    dataLayerView.updateData(state.data);
  }

  function isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  function getUrlParams(url) {
    if (!url.includes("?")) return {};
    try {
      const urlObject = new URL(url);
      var pairs = urlObject.search.slice(1).split('&');

      var result = {};
      pairs.forEach(function (pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
      });
      return result;
    } catch (error) {
      return {};
    }
  }

  function captureDataLayer(message, sender, sendResponse) {
    if (!state.isInspecting || sender.tab.id !== state.tabId) return;
    if (message.type === "content_click_event" && sender.tab.id === state.tabId && state.isInspecting) {
      console.log("Content click event detected.");
      pushEvent();
    }
    else if (state.allowedLayers.includes(message.type) && sender.tab.id === state.tabId && state.isInspecting && state.allowedDataLayers[message.type]) {
      const data = { ...message };
      try {
        if (typeof message.data === "string") {
          data.data = JSON.parse(message.data); // Parse data if it's a string
        }
      } catch (error) {
        console.error("Error parsing data layer message:", error);
      }
      pushData(data, 'dataLayers', data.type === 'var' ? data.dLN : data.type);
    }
  }

  function pushEvent() {
    const urlListLength = state.data.length - 1;
    const eventListLength = state.data[urlListLength]?.events.length;
    state.data[urlListLength].events.push({ name: "Click " + eventListLength, timeStamp: Date.now() });
    tagView.updateData(state.data);
    dataLayerView.updateData(state.data);
  }

  function pushData(data, name, identifier, icon) {
    try {
      const urlListLength = state.data.length - 1;
      // Ensure state.data[urlListLength] exists
      if (!state.data[urlListLength]) {
        console.log("state.data is undefined");
        return;
      }

          // Ensure state.data[urlListLength].events exists
    if (!state.data[urlListLength].hasOwnProperty('events')) {
      console.log("state.data[urlListLength].events is undefined");
      return;
    }
      const eventListLength = state.data[urlListLength].events.length - 1;

      // Ensure state.data[urlListLength].events[eventListLength] exists
    if (!state.data[urlListLength].events[eventListLength]) {
      console.log("state.data[urlListLength].events[eventListLength] is undefined");
      return;
    }

    // Ensure state.data[urlListLength].events[eventListLength][name] is initialized as an array
    if (!state.data[urlListLength].events[eventListLength][name]) {
      state.data[urlListLength].events[eventListLength][name] = [];
    }
    if(state.data[urlListLength].events[eventListLength][name]==undefined){
      state.data[urlListLength].events[eventListLength][name] = [];
    }
    // Check for duplicates
    const isDuplicate = state.data[urlListLength].events[eventListLength][name].some(o =>
      JSON.stringify(o) === JSON.stringify(data)
    );

    if (isDuplicate) return;

      // Add domain and impression count to the data
      data.domain = new URL(state.data[urlListLength].pageUrl).hostname; // Add domain name
      data.impressions = state.regexOccurances[identifier]?.occurences || 0; // Add impression count

      // Check if the tag has already been tracked
      const trackingKey = `${identifier}-${data.domain}`;
      if (state.trackedTags[trackingKey]) {
        // console.log(`Tag "${identifier}" for domain "${data.domain}" has already been tracked.`);
      } else {
        // Track tag impression in Google Analytics
        try {
          const pageUrl = state.data[state.data.length - 1]?.pageUrl || 'unknown';
          trackTagImpressionEvent(identifier, pageUrl);
          state.trackedTags[trackingKey] = true; // Mark as tracked
          // console.log(`Tracked tag "${identifier}" for domain "${data.domain}".`);
        } catch (error) {
          console.log('Error tracking tag impression:', error);
        }
      }

      queueData(data, name, urlListLength, eventListLength, icon);

      chrome.storage.local.set({ savedData: state.data })
      // Update the badge with the total number of tags
      updateBadge();
    } catch (error) {
      console.log(error);
    }
  }

  function updateBadge() {
    // Calculate the total number of tags
    const totalTags = state.data.reduce((count, url) => {
      return count + url.events.reduce((eventCount, event) => {
        return eventCount + (event.tags ? event.tags.length : 0);
      }, 0);
    }, 0);

    // Set the badge text
    chrome.action.setBadgeText({ text: totalTags > 0 ? totalTags.toString() : '' });

    // Set the badge background color
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' }); // Red background

    //update filter options
    const tagCounts = getTagCounts();
    state.tagCounts = tagCounts;
    tagView.updateFilterOptions(tagCounts);
    // Update dropdown with new tagCounts
  }

  function getTagCounts() {
    const tagCounts = {};

    // Iterate through the data to count tags by name
    state.data.forEach((url) => {
      url.events.forEach((event) => {
        if (event.tags) {
          event.tags.forEach((tag) => {
            if (tag.name) {
              tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
            }
          });
        }
      });
    });

    // Convert the tagCounts object into an array of objects
    return Object.entries(tagCounts).map(([tagname, count]) => ({ tagname, count }));
  }

  function queueData(data, name, urlListLength, eventListLength, icon) {
    if (data.data !== undefined) {
      // Convert the object to an array
      const dataArray = Object.values(data.data);

      // Reverse the array
      const reversedArray = dataArray.reverse();

      // If needed, you can assign it back to data.data
      data.data = reversedArray;

   // Now this will be reversed
    }
    // Ensure state.data[urlListLength] exists
    if (!state.data[urlListLength]) {
      console.log("state.data[urlListLength] is undefined");
      return;
    }

    // Ensure state.data[urlListLength].events exists
    if (!state.data[urlListLength].events) {
      console.log("state.data[urlListLength].events is undefined");
      return;
    }

    // Ensure state.data[urlListLength].events[eventListLength] exists
    if (!state.data[urlListLength].events[eventListLength]) {
      console.log("state.data[urlListLength].events[eventListLength] is undefined");
      return;
    }

  // Ensure state.data[urlListLength].events[eventListLength][name] is initialized as an array
  if (!state.data[urlListLength].events[eventListLength][name]) {
    state.data[urlListLength].events[eventListLength][name] = [];
  }

    const isDuplicate = state.data[urlListLength].events[eventListLength][name].some(o =>
      JSON.stringify(o) === JSON.stringify(data)
    );
    if (isDuplicate) return;
    state.data[urlListLength].events[eventListLength][name] =
      state.data[urlListLength].events[eventListLength][name].filter(element => {

        if (element.data == undefined) return true;
        let res = !element.data.every(el => 
          data.data.some(item => JSON.stringify(item) === JSON.stringify(el))
        );
        if(res == false)
        {
          res = element.data.length == data.data.length;
        }
        return res;
      });
    const isDuplicate_2=state.data[urlListLength].events[eventListLength][name].some(element => {
      if (element.data == undefined) return false;
      return element.data.every(el => 
        data.data.some(item => JSON.stringify(item) === JSON.stringify(el))
      ) && element.data.length == data.data.length;
    });

    if (isDuplicate || isDuplicate_2) return;

    if (icon) data.icon = icon;
    state.data[urlListLength].events[eventListLength][name].push(data);
    tagView.updateData(state.data);
    dataLayerView.updateData(state.data);
  }

  function flattenJsonObject(obj) {
    const flattened = {};
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        Object.assign(flattened, flattenJsonObject(obj[key]));
      } else {
        flattened[key] = obj[key];
      }
    });
    return flattened;
  }

  function resetData() {
    state.tagExport = [];
    state.dlExport = [];
    state.data = [];
    initRegexOccurances(state.regexList);
    if (state.isInspecting) {
      toggleInspection();
    }
    tagView.updateData(state.data);
    dataLayerView.updateData(state.data);
    chrome.action.setBadgeText({ text: '' });
  }

  function errorHandler(errorAt) {
    if (chrome.runtime.lastError) {
      console.log("error: ", chrome.runtime.lastError);
    }
  }

  function exportDataConfirm() {
    state.showModal = true;
    modal.open();
  }

  function exportData() {
    state.exportModalErrors = [];
    if (!state.fileName) {
      state.exportModalErrors.push('File Name required.');
      return;
    }

    var wb = XLSX.utils.book_new();
    const exportData = primeExport();

    var wsTags = XLSX.utils.json_to_sheet(exportData.tags);
    XLSX.utils.book_append_sheet(wb, wsTags, "Tags");

    var wsDLs = XLSX.utils.json_to_sheet(exportData.dLs);
    XLSX.utils.book_append_sheet(wb, wsDLs, "Data-Layer");

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data1 = new Blob([excelBuffer], { type: fileType });
    saveAs(data1, state.fileName + ".xlsx");
    state.showModal = false;
    modal.close();
  }

  function handleTabclosed(tabId) {
    if (tabId === state.tabId) {

      chrome.storage.local.set({ savedData: state.data }, () => {
        console.log('Data saved to Chrome storage.');
      });

      console.log("Tab closed. Reloading extension.");
      chrome.runtime.reload();
    }


  }

  async function toggleInspection() {
    if (state.lockToggling) return;
    state.isInspecting = !state.isInspecting;
    state.trackedTags = {}; // Reset tracked tags
    tagView.setIsInspecting(state.isInspecting);
    dataLayerView.setIsInspecting(state.isInspecting);

    if (state.isInspecting) {
      console.log("Starting inspection...");
      chromeHelper.reloadTab(state.tabId);
      dispatchListeners();
    }

  }

  function startInspection() {
    state.lockToggling = true;
    state.isInspecting = true;
    dispatchListeners();
  }

  function stopInspection() {
    removeListeners();
    state.lockToggling = false;
    state.isInspecting = false;
  }

  // Initialize modal
  const exportModal = createModal({
    header: '<h3>Export Tags and Datalayers to Excel</h3>',
    body: `
      <div class="add-regex-fields">
        <label for="fileName">Choose the filename (without the extension)</label>
        <input type="text" id="fileName" name="fileName" placeholder="file_name">
        <p id="exportErrors" style="display:none">
          <b>Please correct the following error(s):</b>
          <ul id="errorsList"></ul>
        </p>
      </div>
    `,
    footer: `
      <button class="simple-button" id="exportBtn">Export</button>
      <button class="simple-button red" id="cancelBtn">Cancel</button>
    `
  });

  // Modal event listeners
  exportModal.element.querySelector('#exportBtn').addEventListener('click', exportData);
  exportModal.element.querySelector('#cancelBtn').addEventListener('click', () => {
    state.showModal = false;
    exportModal.close();
  });

  const fileNameInput = exportModal.element.querySelector('#fileName');
  fileNameInput.addEventListener('input', (e) => {
    state.fileName = e.target.value;
  });

  // Public API
  return wrapper;
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.dataset.theme = savedTheme;
  // Sync the toggle switch with the saved theme
  const themeCheckbox = document.getElementById('theme-checkbox');
  if (themeCheckbox) {
    themeCheckbox.checked = savedTheme === 'dark';
  }
  const app = document.getElementById('app');
  if (app) {
    const popup = createPopup();
    app.appendChild(popup);
  } else {
    console.log("No element with id 'app' found.");
  }
});
