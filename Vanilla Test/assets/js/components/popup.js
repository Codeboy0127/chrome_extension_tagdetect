// popup.js - Vanilla JS implementation of Popup component

import { createTab } from './Tab.js';
import { createTabs } from './Tabs.js';
import { createTagView } from './panels/TagView.js';
import { createDataLayerView } from './panels/DataLayerView.js';
import { createModal } from './Modal.js';
import { createNotificationManager } from './Notification.js';
import { chromeHelper, isDevTools } from '../lib/chromeHelpers.js';
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
    tabId: null
  };

  // Initialize components
  const notificationManager = createNotificationManager();
  const modal = createModal();
  modal.element.style.display = 'none';
  
  // Create tabs system
  const tabs = createTabs();

  // Create TagView tab
  const tagView = createTagView({
    isInspecting: state.isInspecting,
    data: state.data,
    occurrences: state.regexOccurances,
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

  // Create footer
  const footer = document.createElement('div');
  footer.className = 'footer';

  // Assemble the popup
  wrapper.append(modal.element, tabs.element, footer, notificationManager.element);

  // Initialize
  if (isDevTools()) {
    state.tabId = chrome.devtools.inspectedWindow.tabId;
    init();
  }
  toggleInspection();

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
    state.regexList = await getRegexList();
    dispatchListeners();
    // Initialize the badge
    updateBadge();
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
    let initiatiorData = {};
    if (initiator.type === 'script') {
      initiatiorData = {
        type: 'script',
        origin: initiator.stack.callFrames[0]?.url || initiator.stack.parent.callFrames[0]?.url
      };
    } else if (initiator.type === 'parser') {
      initiatiorData = {
        type: 'parser',
        origin: initiator.url
      };
    } else {
      console.log({ Else: 'Else', initiator });
    }
    
    return initiatiorData;
  }

  function devtoolsNetworkRequest(request) {

    const details = request.request;
    state.regexList.forEach((element, index) => {
      if (RegExp(element.pattern).test(details.url) && !element.ignore && details.hasOwnProperty('url') && state.isInspecting) {
        var initiatorChain = [];
        var initiator = request.initiator;
        while (initiator) {
          initiatorChain.push(initiator);
          initiator = initiator.stack.callFrames[0].url;
        }

        const urlParams = details.url;
        const postData = parsePostData(details.postData?.text);
        const initiatior = parseInitiator(request._initiator);
        const domain = new URL(details.url).hostname; // Extract the domain name
        
        const content = { ...{ request: details.url }, ...initiatior, ...getUrlParams(urlParams), domain };
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
          initiatior: initiatior 
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
    chromeHelper.removeLocalStorageChangeListener(listenOnRegexChange);
    chromeHelper.removeRuntimeMessagesListener(captureDataLayer);
    chromeHelper.removeTabUpdatedListener(listenToUrlChanges);
    chromeHelper.removeTabClosedListener(handleTabclosed);
    chrome.devtools.network.onRequestFinished.removeListener(devtoolsNetworkRequest);
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
    chromeHelper.injectScript({ 
      target: { tabId: state.tabId }, 
      files: ['content/content.js'] 
    }, errorHandler);
  }

  function pushUrl(url) {
    if (!state.isInspecting) return;
    resetOccurancesCounter();
    const newUrlData = {
      pageUrl: url,
      events: [{ name: 'Load', timeStamp: Date.now() }]
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
    if (message.type === "content_click_event" && sender.tab.id === state.tabId && state.isInspecting) {
      pushEvent();
    }
    else if (state.allowedLayers.includes(message.type) && sender.tab.id === state.tabId && state.isInspecting && state.allowedDataLayers[message.type]) {
      var data = message;
      try {
        data.data = JSON.parse(message.data);
      } catch (e) {
        // Ignore parse error
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
      if (!state.data[urlListLength].hasOwnProperty('events')) return;
      const eventListLength = state.data[urlListLength].events.length - 1;
      
      // Add domain and impression count to the data
      data.domain = new URL(state.data[urlListLength].pageUrl).hostname; // Add domain name
      data.impressions = state.regexOccurances[identifier]?.occurences || 0; // Add impression count

      queueData(data, name, urlListLength, eventListLength, icon);
      
      // Update the badge with the total number of tags
      updateBadge();
    } catch (error) {
      console.error(error);
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
  }

  function queueData(data, name, urlListLength, eventListLength, icon) {
    if (state.data[urlListLength].events[eventListLength][name] === undefined) {
      state.data[urlListLength].events[eventListLength][name] = [];
    }
    
    const isDuplicate = state.data[urlListLength].events[eventListLength][name].some(o => 
      JSON.stringify(o) === JSON.stringify(data)
    );
    
    if (isDuplicate) return;
    
    var index = state.data[urlListLength].events[eventListLength][name].length;
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
      chrome.runtime.reload();
    }
  }

  async function toggleInspection() {
    if (state.lockToggling) return;

    state.isInspecting = !state.isInspecting;
    tagView.setIsInspecting(state.isInspecting);
    dataLayerView.setIsInspecting(state.isInspecting);
    
    if (state.isInspecting) {
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
  const app = document.getElementById('app');
  if (app) {
    const popup = createPopup();
    app.appendChild(popup);
  } else {
    console.error("No element with id 'app' found.");
  }
});

// CSS (same as original, include in your stylesheet)
/*
* {
  margin: 0;
  padding: 0;
}

.wrapper {
  max-width: 100%;
  margin: 0;
  padding-bottom: 0;
  position: relative;
}

.footer {
  position: absolute;
  bottom: 0;
  right: 50%;
  translate: 50%;
  margin-bottom: 10px;
}

.footer-text {
  font-size: xx-small;
  font-family: 'Poppins';
  font-weight: 400;
}

.heart {
  background-image: url("data:image/svg+xml,%3Csvg xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' version='1.0' width='645' height='585' id='svg2'%3E%3Cdefs id='defs4' /%3E%3Cg id='layer1'%3E%3Cpath d='M 297.29747,550.86823 C 283.52243,535.43191 249.1268,505.33855 220.86277,483.99412 C 137.11867,420.75228 125.72108,411.5999 91.719238,380.29088 C 29.03471,322.57071 2.413622,264.58086 2.5048478,185.95124 C 2.5493594,147.56739 5.1656152,132.77929 15.914734,110.15398 C 34.151433,71.768267 61.014996,43.244667 95.360052,25.799457 C 119.68545,13.443675 131.6827,7.9542046 172.30448,7.7296236 C 214.79777,7.4947896 223.74311,12.449347 248.73919,26.181459 C 279.1637,42.895777 310.47909,78.617167 316.95242,103.99205 L 320.95052,119.66445 L 330.81015,98.079942 C 386.52632,-23.892986 564.40851,-22.06811 626.31244,101.11153 C 645.95011,140.18758 648.10608,223.6247 630.69256,270.6244 C 607.97729,331.93377 565.31255,378.67493 466.68622,450.30098 C 402.0054,497.27462 328.80148,568.34684 323.70555,578.32901 C 317.79007,589.91654 323.42339,580.14491 297.29747,550.86823 z' id='path2417' style='fill:%23ff0000' /%3E%3Cg transform='translate(129.28571,-64.285714)' id='g2221' /%3E%3C/g%3E%3C/svg%3E%0A");
  height: 12px;
  display: inline-block;
  width: 12px;
  background-repeat: no-repeat;
  background-size: contain;
}
*/