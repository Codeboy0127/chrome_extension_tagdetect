// crawls.js - Vanilla JS implementation of Crawls panel
import { createControlBar } from '../ControlBar'

export function createCrawlsPanel(options = {}) {
    // Create main container
    const panel = document.createElement('div');
    panel.className = 'panel';
  
    // State
    let state = {
      maxWaitTime: 8000,
      minWaitTime: 7000,
      waitTimeCounter: null,
      includeSubdomain: false,
      uriRegex: '',
      tabId: null,
      url: '',
      isCrawling: false,
      isCrawlingPaused: false,
      includeAnchors: false,
      includeParams: false,
      urlQueue: [],
      urlQueueNumber: 0,
      maxUrlCrawl: 10
    };
  
    // Create DOM elements
    const panelTop = document.createElement('div');
    panelTop.className = 'panel-top';
  
    const crawlForm = document.createElement('div');
    crawlForm.className = 'crawl-form';
  
    const crawlFields = document.createElement('div');
    crawlFields.className = 'crawl-fields';
  
    // URL Input
    const urlField = document.createElement('div');
    urlField.className = 'crawl-field';
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.id = 'url-field';
    urlInput.placeholder = 'Enter Url';
    urlInput.addEventListener('input', (e) => {
      state.url = e.target.value;
    });
    urlField.appendChild(urlInput);
  
    // URI Regex Input
    const uriRegexField = document.createElement('div');
    uriRegexField.className = 'crawl-field';
    const uriRegexInput = document.createElement('input');
    uriRegexInput.type = 'text';
    uriRegexInput.id = 'uriRegex';
    uriRegexInput.placeholder = 'Enter an optional regex to limit page urls within rules';
    uriRegexInput.addEventListener('input', (e) => {
      state.uriRegex = e.target.value;
    });
    uriRegexField.appendChild(uriRegexInput);
  
    // Checkbox Options
    const crawlOptions = document.createElement('div');
    crawlOptions.className = 'crawl-options';
  
    const includeAnchorsLabel = createCheckboxOption(
      'includeAnchors', 
      'Include anchors', 
      (checked) => { state.includeAnchors = checked; }
    );
  
    const includeParamsLabel = createCheckboxOption(
      'includeParams', 
      'Include params', 
      (checked) => { state.includeParams = checked; }
    );
  
    const includeSubdomainLabel = createCheckboxOption(
      'includeSubdomain', 
      'Include Subdomain', 
      (checked) => { state.includeSubdomain = checked; }
    );
  
    crawlOptions.append(includeAnchorsLabel, includeParamsLabel, includeSubdomainLabel);
  
    // Timeout Inputs
    const timeoutContainer = document.createElement('div');
    timeoutContainer.style.cssText = 'display: flex; justify-content: space-between; gap: 2rem';
  
    const minTimeoutDiv = document.createElement('div');
    minTimeoutDiv.className = 'crawl-timeout crawl-timeout-min';
    const minTimeoutLabel = document.createElement('label');
    minTimeoutLabel.htmlFor = 'minWaitTime';
    minTimeoutLabel.textContent = 'Minimum time spent on each url (s):';
    const minTimeoutInput = document.createElement('input');
    minTimeoutInput.type = 'number';
    minTimeoutInput.id = 'minWaitTime';
    minTimeoutInput.min = '1';
    minTimeoutInput.value = state.minWaitTime / 1000;
    minTimeoutInput.addEventListener('input', (e) => {
      state.minWaitTime = e.target.value * 1000;
    });
    minTimeoutDiv.append(minTimeoutLabel, minTimeoutInput);
  
    const maxTimeoutDiv = document.createElement('div');
    maxTimeoutDiv.className = 'crawl-timeout crawl-timeout-max';
    const maxTimeoutLabel = document.createElement('label');
    maxTimeoutLabel.htmlFor = 'maxWaitTime';
    maxTimeoutLabel.textContent = 'Maximum wait time for url (s):';
    const maxTimeoutInput = document.createElement('input');
    maxTimeoutInput.type = 'number';
    maxTimeoutInput.id = 'maxWaitTime';
    maxTimeoutInput.max = '15';
    maxTimeoutInput.value = state.maxWaitTime / 1000;
    maxTimeoutInput.addEventListener('input', (e) => {
      state.maxWaitTime = e.target.value * 1000;
    });
    maxTimeoutDiv.append(maxTimeoutLabel, maxTimeoutInput);
  
    timeoutContainer.append(minTimeoutDiv, maxTimeoutDiv);
  
    // Start/Pause Button
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; justify-content: center; padding: 2rem 0;';
  
    const startButton = document.createElement('button');
    startButton.className = 'primary-btn';
    startButton.style.cssText = 'padding: 0.75rem 2rem; font-size: smaller; width: 66%;';
    startButton.textContent = 'Start Crawl';
    startButton.addEventListener('click', initiateCrawl);
  
    buttonContainer.appendChild(startButton);
  
    // Assemble form
    crawlFields.append(urlField, uriRegexField, crawlOptions, timeoutContainer);
    crawlForm.append(crawlFields, buttonContainer);
  
    // URL Queue Display
    const crawlUrls = document.createElement('div');
    crawlUrls.className = 'crawl-urls';
    crawlUrls.style.display = 'none';
  
    const queueHeader = document.createElement('div');
    queueHeader.style.cssText = 'display: flex; justify-content: space-between; font-weight: 300; font-size: small; padding: 2rem 1rem;';
    
    const queueTitle = document.createElement('p');
    queueTitle.textContent = 'Crawled URLs';
    
    const queueCount = document.createElement('p');
    queueCount.innerHTML = 'URL Count: <span style="color: #2CA148;">0</span>';
    
    queueHeader.append(queueTitle, queueCount);
  
    const queueList = document.createElement('div');
    queueList.style.cssText = 'background-color: #fff; border: 1px solid #afafaf; max-height: 300px; overflow-y: auto; border-radius: 1rem;';
  
    crawlUrls.append(queueHeader, queueList);
  
    // Assemble panel
    panelTop.appendChild(createControlBar({
      controlBar: {
        record: false,
        clear: true,
        collapse: false,
        expand: false,
        save: false,
        import: false,
        settings: false
      },
      onResetData: resetCrawlData,
      panel: 'Crawls'
    }));
  
    panel.append(panelTop, crawlForm, crawlUrls);
  
    // Helper functions
    function createCheckboxOption(id, labelText, onChange) {
      const label = document.createElement('label');
      label.htmlFor = id;
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = id;
      checkbox.addEventListener('change', (e) => onChange(e.target.checked));
      
      const span = document.createElement('span');
      span.textContent = labelText;
      
      label.append(checkbox, span);
      return label;
    }
  
    function updateButtonState() {
      if ((state.isCrawlingPaused && state.isCrawling) || (!state.isCrawling && !state.isCrawlingPaused)) {
        startButton.textContent = 'Start Crawl';
        startButton.className = 'primary-btn';
        startButton.onclick = initiateCrawl;
      } else if (state.isCrawling && !state.isCrawlingPaused) {
        startButton.textContent = 'Pause Crawl';
        startButton.className = 'simple-button red';
        startButton.onclick = pauseCrawling;
      }
    }
  
    function updateUrlQueueDisplay() {
      queueList.innerHTML = '';
      queueCount.querySelector('span').textContent = state.urlQueue.length;
      
      state.urlQueue.forEach((url, index) => {
        const urlItem = document.createElement('div');
        urlItem.style.cssText = 'padding: 1rem; display: flex; gap: 2rem; width: -webkit-fit-available; border-bottom: 1px solid #afafaf;';
        
        const statusIcon = document.createElement('div');
        statusIcon.style.cssText = 'display: flex; align-items: center; justify-content: center;';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'url-state';
        if (url.state === 'completed') iconSpan.classList.add('check');
        if (url.state === 'processing') iconSpan.classList.add('lds-ripple');
        if (url.state === 'failed') iconSpan.classList.add('cross');
        
        statusIcon.appendChild(iconSpan);
        
        const urlText = document.createElement('p');
        urlText.textContent = url.url;
        
        urlItem.append(statusIcon, urlText);
        queueList.appendChild(urlItem);
      });
      
      crawlUrls.style.display = state.urlQueue.length > 0 ? 'block' : 'none';
    }
  
    // Main methods
    async function initiateCrawl() {
      if (!state.url) return;
      
      initUrlQueue();
      state.tabId = await createCrawlWindow();
      if (options.onStartInspection) options.onStartInspection();
      
      chromeHelper.listenOnTabUpdated(listenToUrlChanges);
      chromeHelper.listenToRuntimeMessages(listenToPageCrawler);
    }
  
    async function createCrawlWindow() {
      state.waitTimeCounter = setTimeout(
        handleFailedUrlCrawl,
        state.maxWaitTime + 500
      );
      
      chromeHelper.updateTab(
        state.tabId,
        { url: state.urlQueue[state.urlQueueNumber].url },
        errorHandler
      );
      
      return state.tabId;
    }
  
    function initUrlQueue() {
      if (state.isCrawlingPaused) {
        state.isCrawlingPaused = false;
        return;
      }
      
      state.url = state.url.includes('https://') || state.url.includes('http://') 
        ? state.url 
        : 'https://' + state.url;
      
      updateUrlQueue([{ url: state.url }]);
      state.urlQueue[state.urlQueueNumber].state = 'processing';
      updateUrlQueueDisplay();
    }
  
    function listenToUrlChanges(details) {
      if (details) {
        injectCrawlerContentScript();
      }
    }
  
    function injectCrawlerContentScript() {
      chromeHelper.injectScript(
        {
          target: { tabId: state.tabId },
          files: ['content/crawler_content.js'],
        },
        errorHandler('SCRIPT_INJECTION')
      );
    }
  
    function listenToPageCrawler(message, sender, sendResponse) {
      if (message.type === 'crawler_ready') {
        if (!state.isCrawling) {
          state.isCrawling = true;
          updateButtonState();
        }
        clearTimeout(state.waitTimeCounter);
        startPageCrawler();
      }
    }
  
    async function startPageCrawler() {
      pageInteractionEvent('Crawls', 'launch_crawl');
      
      if (state.urlQueueNumber < state.urlQueue.length) {
        const response = await chromeHelper.sendMessageToTab(state.tabId, {
          type: 'crawler_start',
          params: {
            includeAnchors: state.includeAnchors,
            includeParams: state.includeParams,
            regexRule: state.uriRegex,
            includeSubdomain: state.includeSubdomain,
          },
        });
        
        updateUrlQueue(response);
        state.urlQueue[state.urlQueueNumber].state = 'completed';
        updateUrlQueueDisplay();
        
        setTimeout(() => {
          stepIntoNextUrl();
        }, state.minWaitTime);
      } else if (
        state.urlQueueNumber === state.urlQueue.length ||
        state.urlQueueNumber >= state.maxUrlCrawl
      ) {
        finishCrawl();
      }
    }
  
    function handleFailedUrlCrawl() {
      state.urlQueue[state.urlQueueNumber].state = 'failed';
      updateUrlQueueDisplay();
      stepIntoNextUrl();
    }
  
    function stepIntoNextUrl() {
      state.urlQueueNumber++;
  
      if (state.urlQueueNumber >= state.maxUrlCrawl) {
        pauseCrawling();
        clearTimeout(state.waitTimeCounter);
        if (options.onStopInspection) options.onStopInspection();
        state.urlQueueNumber = 0;
        state.isCrawling = false;
        state.isCrawlingPaused = false;
        updateButtonState();
        
        if (options.onNotification) {
          options.onNotification({
            type: 'success',
            title: 'Crawl Complete',
            message: ''
          });
        }
        return;
      }
  
      if (state.urlQueueNumber < state.urlQueue.length && !state.isCrawlingPaused) {
        state.urlQueue[state.urlQueueNumber].state = 'processing';
        updateUrlQueueDisplay();
        
        chromeHelper.updateTab(
          state.tabId,
          { url: state.urlQueue[state.urlQueueNumber].url },
          errorHandler
        );
        
        clearTimeout(state.waitTimeCounter);
        state.waitTimeCounter = setTimeout(
          handleFailedUrlCrawl,
          state.maxWaitTime + 500
        );
      } else if (
        state.urlQueueNumber < state.urlQueue.length &&
        state.isCrawlingPaused
      ) {
        if (options.onStopInspection) options.onStopInspection();
        clearTimeout(state.waitTimeCounter);
      } else if (state.urlQueueNumber === state.urlQueue.length) {
        finishCrawl();
      }
    }
  
    function finishCrawl() {
      clearTimeout(state.waitTimeCounter);
      if (options.onStopInspection) options.onStopInspection();
      state.urlQueueNumber = 0;
      state.isCrawling = false;
      state.isCrawlingPaused = false;
      updateButtonState();
      
      if (options.onNotification) {
        options.onNotification({
          type: 'success',
          title: 'Crawl Complete',
          message: ''
        });
      }
    }
  
    function pauseCrawling() {
      state.isCrawlingPaused = true;
      updateButtonState();
    }
  
    function updateUrlQueue(newQueue) {
      if (!newQueue.length) return;
      
      newQueue.forEach((url) => {
        if (!state.urlQueue.some(e => e.url === url.url)) {
          state.urlQueue.push({ url: url.url, state: '' });
        }
      });
      
      updateUrlQueueDisplay();
    }
  
    function resetCrawlData() {
      if (
        (state.isCrawlingPaused && state.isCrawling) ||
        (!state.isCrawling && !state.isCrawlingPaused)
      ) {
        state.urlQueue = [];
        state.isCrawling = false;
        state.isCrawlingPaused = false;
        state.urlQueueNumber = 0;
        state.waitTimeCounter = null;
        state.url = '';
        urlInput.value = '';
        updateUrlQueueDisplay();
        updateButtonState();
      } else if (options.onNotification) {
        options.onNotification({
          type: 'warning',
          title: 'Cannot empty the URL queue at the moment',
          message: 'Crawler must be stopped before clearing the url queue.'
        });
      }
    }
  
    function errorHandler(errorAt) {
      if (chrome.runtime.lastError) {
        console.log('error: ', chrome.runtime.lastError);
      }
    }
  
    // Initialize
    updateButtonState();
  
    // Public API
    return {
      element: panel,
      getState: () => ({ ...state }),
      setState: (newState) => {
        state = { ...state, ...newState };
        // Update DOM to reflect new state if needed
      }
    };
  }