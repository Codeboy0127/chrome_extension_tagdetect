// popup.js
class TagLabPopup {
    constructor() {
      this.state = {
        isInspecting: false,
        data: [],
        regexList: [],
        regexOccurances: {},
        notificationData: [],
        showModal: false,
        fileName: '',
        exportModalErrors: [],
        tabId: null,
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
        }
      };
  
      this.init();
    }
  
    async init() {
      this.setupDOM();
      this.setupEventListeners();
      
      if (this.isDevTools()) {
        this.state.tabId = chrome.devtools.inspectedWindow.tabId;
        this.setupChromeListeners();
      }
      
      this.state.regexList = await this.getRegexList();
      this.initRegexOccurances(this.state.regexList);
      this.toggleInspection(); // Start inspecting by default
    }
  
    // DOM Setup
    setupDOM() {
      document.body.innerHTML = `
        <div class="wrapper">
          <div id="modal-container" style="display:none;"></div>
          <div class="tabs">
            <div class="h-logo">
              <a target="_blank" href="https://taglab.net/?utm_source=extension&utm_medium=owned-media&utm_campaign=logo">
                <img src="images/logo.png" style="height:36px;">
              </a>
            </div>
            <div class="header-nav">
              <div class="c-tabs-header">
                <ul class="tabs-header">
                  <li class="tabs-selected">Tags View</li>
                  <li>Data Layer View</li>
                </ul>
                <div>Tag View is better with Taglab Web <button class="sec-btn">Why?</button></div>
              </div>
            </div>
            <div id="tab-content">
              <div class="tab-pane active" id="tags-view">
                <div class="control-bar">
                  <button class="action-btn" id="toggle-inspect">Pause</button>
                  <button class="action-btn" id="reset-data">Clear</button>
                  <button class="action-btn" id="export-data">Export</button>
                </div>
                <div id="tags-container"></div>
              </div>
              <div class="tab-pane" id="datalayer-view" style="display:none;">
                <div id="datalayer-container"></div>
              </div>
            </div>
          </div>
          <div id="notification-area"></div>
        </div>
      `;
  
      // Apply styles
      this.injectStyles();
    }
  
    injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .wrapper { max-width: 100%; padding-bottom: 0; position: relative; }
        .tabs-header { display: flex; list-style: none; padding: 10px; border: 2px solid #d0d0d0; 
          border-radius: 45px; flex-wrap: wrap; gap: 8px; background: #fff; }
        .tabs-header li { padding: 8px 30px; border-radius: 45px; cursor: pointer; }
        .tabs-selected { background: #12b922; color: white; }
        .tab-pane { display: none; }
        .tab-pane.active { display: block; }
        .control-bar { display: flex; gap: 8px; padding: 10px; }
        .action-btn { padding: 12px 10px; background: #fff; border-radius: 12px; 
          box-shadow: 0 4px 8px rgba(0,0,0,0.2); cursor: pointer; }
        #tags-container, #datalayer-container { padding: 10px; }
        /* Add more styles from original component as needed */
      `;
      document.head.appendChild(style);
    }
  
    // Event Listeners
    setupEventListeners() {
      // Tab switching
      document.querySelectorAll('.tabs-header li').forEach((tab, index) => {
        tab.addEventListener('click', () => this.switchTab(index));
      });
  
      // Control buttons
      document.getElementById('toggle-inspect').addEventListener('click', () => this.toggleInspection());
      document.getElementById('reset-data').addEventListener('click', () => this.resetData());
      document.getElementById('export-data').addEventListener('click', () => this.exportDataConfirm());
    }
  
    // Chrome API Integration
    setupChromeListeners() {
      if (!this.isDevTools()) return;
  
      this.chromeListeners = {
        onRequestFinished: this.devtoolsNetworkRequest.bind(this),
        onMessage: this.captureDataLayer.bind(this),
        onTabUpdated: this.listenToUrlChanges.bind(this)
      };
  
      chrome.devtools.network.onRequestFinished.addListener(this.chromeListeners.onRequestFinished);
      chrome.runtime.onMessage.addListener(this.chromeListeners.onMessage);
      chrome.tabs.onUpdated.addListener(this.chromeListeners.onTabUpdated);
    }
  
    removeChromeListeners() {
      if (!this.isDevTools() || !this.chromeListeners) return;
  
      chrome.devtools.network.onRequestFinished.removeListener(this.chromeListeners.onRequestFinished);
      chrome.runtime.onMessage.removeListener(this.chromeListeners.onMessage);
      chrome.tabs.onUpdated.removeListener(this.chromeListeners.onTabUpdated);
    }
  
    // Core Functionality
    async getRegexList() {
      const result = await chrome.storage.local.get(['regExPatterns']);
      if (!result.regExPatterns || !result.regExPatterns.length) {
        this.showNotification({
          type: "warning",
          title: "Empty Regex Patterns List",
          message: "Regex patterns must be provided for recording tags"
        });
        return result.regExPatterns || [];
      }
      return result.regExPatterns;
    }
  
    initRegexOccurances(regexList) {
      this.state.regexOccurances = {};
      regexList.forEach(element => {
        this.state.regexOccurances[element.name] = { passed: false, occurences: 0 };
      });
    }
  
    devtoolsNetworkRequest(request) {
      if (!this.state.isInspecting) return;
  
      const details = request.request;
      this.state.regexList.forEach(element => {
        if (RegExp(element.pattern).test(details.url) && !element.ignore && details.url) {
          const content = { 
            request: details.url,
            ...this.getUrlParams(details.url),
            ...this.parseInitiator(request._initiator)
          };
  
          if (!this.state.regexOccurances[element.name].passed) {
            this.state.regexOccurances[element.name] = { 
              passed: true, 
              occurences: this.state.regexOccurances[element.name].occurences + 1 
            };
          }
  
          const data = { 
            name: element.name, 
            occurences: 0, 
            content: content, 
            timeStamp: Date.now(),
            payload: this.parsePostData(details.postData?.text)
          };
  
          this.pushData(data, 'tags', element.name, element.iconPath);
          this.updateTagDisplay();
        }
      });
    }
  
    captureDataLayer(message, sender, sendResponse) {
      if (sender.tab.id !== this.state.tabId || !this.state.isInspecting) return;
      
      if (message.type === "content_click_event") {
        this.pushEvent();
      } 
      else if (this.state.allowedLayers.includes(message.type) && this.state.allowedDataLayers[message.type]) {
        try {
          message.data = JSON.parse(message.data);
        } catch (e) {
          message.data = message.data;
        }
        this.pushData(message, 'dataLayers', message.type === 'var' ? message.dLN : message.type);
        this.updateDataLayerDisplay();
      }
    }
  
    // Data Management
    pushData(data, type, identifier, icon) {
      try {
        const urlIndex = this.state.data.length - 1;
        if (!this.state.data[urlIndex]?.events) return;
        
        const eventIndex = this.state.data[urlIndex].events.length - 1;
        this.queueData(data, type, urlIndex, eventIndex, icon);
      } catch (error) {
        console.error('Error pushing data:', error);
      }
    }
  
    queueData(data, type, urlIndex, eventIndex, icon) {
      if (!this.state.data[urlIndex].events[eventIndex][type]) {
        this.state.data[urlIndex].events[eventIndex][type] = [];
      }
  
      const isDuplicate = this.state.data[urlIndex].events[eventIndex][type].some(item => 
        JSON.stringify(item) === JSON.stringify(data)
      );
  
      if (!isDuplicate) {
        if (icon) data.icon = icon;
        this.state.data[urlIndex].events[eventIndex][type].push(data);
      }
    }
  
    // UI Updates
    updateTagDisplay() {
      const container = document.getElementById('tags-container');
      container.innerHTML = '';
      
      this.state.data.forEach(urlData => {
        urlData.events.forEach(event => {
          if (event.tags?.length) {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-group';
            
            const eventHeader = document.createElement('h3');
            eventHeader.textContent = event.name;
            eventDiv.appendChild(eventHeader);
            
            event.tags.forEach(tag => {
              const tagDiv = document.createElement('div');
              tagDiv.className = 'tag-item';
              tagDiv.innerHTML = `
                <strong>${tag.name}</strong>
                <div>${JSON.stringify(tag.content, null, 2)}</div>
              `;
              eventDiv.appendChild(tagDiv);
            });
            
            container.appendChild(eventDiv);
          }
        });
      });
    }
  
    updateDataLayerDisplay() {
            const container = document.getElementById('datalayer-container');
            container.innerHTML = '';
            
            this.state.data.forEach(urlData => {
              const urlDiv = document.createElement('div');
              urlDiv.className = 'url-group';
              
              const urlHeader = document.createElement('h2');
              urlHeader.textContent = urlData.pageUrl || 'Unknown URL';
              urlDiv.appendChild(urlHeader);
              
              urlData.events.forEach(event => {
                if (event.dataLayers?.length) {
                  const eventDiv = document.createElement('div');
                  eventDiv.className = 'event-group';
                  
                  const eventHeader = document.createElement('h3');
                  eventHeader.textContent = event.name || 'Untitled Event';
                  eventDiv.appendChild(eventHeader);
                  
                  event.dataLayers.forEach(layer => {
                    const layerDiv = document.createElement('div');
                    layerDiv.className = 'datalayer-item';
                    
                    const layerHeader = document.createElement('div');
                    layerHeader.className = 'datalayer-header';
                    layerHeader.innerHTML = `
                      <strong>${layer.dLN || layer.type}</strong>
                      <span class="time">${new Date(layer.timeStamp).toLocaleTimeString()}</span>
                    `;
                    layerDiv.appendChild(layerHeader);
                    
                    // Display the data layer content
                    const dataContent = document.createElement('pre');
                    try {
                      dataContent.textContent = JSON.stringify(layer.data, null, 2);
                    } catch (e) {
                      dataContent.textContent = layer.data || 'No data available';
                    }
                    layerDiv.appendChild(dataContent);
                    
                    // Add expand/collapse functionality for large data
                    if (JSON.stringify(layer.data).length > 200) {
                      const toggleBtn = document.createElement('button');
                      toggleBtn.className = 'toggle-data';
                      toggleBtn.textContent = 'Show More';
                      let isExpanded = false;
                      
                      dataContent.style.maxHeight = '100px';
                      dataContent.style.overflow = 'hidden';
                      
                      toggleBtn.addEventListener('click', () => {
                        isExpanded = !isExpanded;
                        dataContent.style.maxHeight = isExpanded ? 'none' : '100px';
                        toggleBtn.textContent = isExpanded ? 'Show Less' : 'Show More';
                      });
                      
                      layerDiv.appendChild(toggleBtn);
                    }
                    
                    eventDiv.appendChild(layerDiv);
                  });
                  
                  urlDiv.appendChild(eventDiv);
                }
              });
              
              container.appendChild(urlDiv);
            });
    }
  
    // Export Functionality
    exportDataConfirm() {
      this.state.showModal = true;
      this.renderExportModal();
    }
  
    renderExportModal() {
      const modal = document.getElementById('modal-container');
      modal.style.display = 'block';
      modal.innerHTML = `
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container">
              <div class="modal-header">
                <h3>Export Tags and Datalayers to Excel</h3>
              </div>
              <div class="modal-body">
                <div class="add-regex-fields">
                  <label for="fileName">Choose the filename (without the extension)</label>
                  <input type="text" id="fileName-input" placeholder="file_name" value="${this.state.fileName}">
                  ${this.state.exportModalErrors.length ? `
                    <p><b>Please correct the following error(s):</b></p>
                    <ul>
                      ${this.state.exportModalErrors.map(err => `<li>${err}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              </div>
              <div class="modal-footer">
                <button id="confirm-export" class="simple-button">Export</button>
                <button id="cancel-export" class="simple-button red">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      `;
  
      document.getElementById('fileName-input').addEventListener('input', (e) => {
        this.state.fileName = e.target.value;
      });
  
      document.getElementById('confirm-export').addEventListener('click', () => this.exportData());
      document.getElementById('cancel-export').addEventListener('click', () => {
        this.state.showModal = false;
        modal.style.display = 'none';
      });
    }
  
    async exportData() {
      this.state.exportModalErrors = [];
      if (!this.state.fileName) {
        this.state.exportModalErrors.push('File Name required.');
        this.renderExportModal();
        return;
      }
  
      const exportData = this.primeExport();
      const wb = XLSX.utils.book_new();
      const wsTags = XLSX.utils.json_to_sheet(exportData.tags);
      const wsDLs = XLSX.utils.json_to_sheet(exportData.dLs);
      
      XLSX.utils.book_append_sheet(wb, wsTags, "Tags");
      XLSX.utils.book_append_sheet(wb, wsDLs, "Data-Layer");
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.state.fileName}.xlsx`;
      a.click();
      
      this.state.showModal = false;
      document.getElementById('modal-container').style.display = 'none';
    }
  
    // Helper Methods
    isDevTools() {
      return chrome.devtools && chrome.devtools.inspectedWindow;
    }
  
    getUrlParams(url) {
      if (!url.includes("?")) return {};
      try {
        const urlObj = new URL(url);
        const result = {};
        urlObj.searchParams.forEach((value, key) => {
          result[key] = value;
        });
        return result;
      } catch (error) {
        return {};
      }
    }
  
    showNotification(notification) {
      const notifications = document.getElementById('notification-area');
      const note = document.createElement('div');
      note.className = `notification ${notification.type}`;
      note.innerHTML = `
        <i class="close">×</i>
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
      `;
      notifications.appendChild(note);
      
      note.querySelector('.close').addEventListener('click', () => {
        note.remove();
      });
    }
  
    // ... Additional helper methods from original component
  }
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    new TagLabPopup();
  });