// scenarios.js - Vanilla JS implementation of Scenarios component
import { createAccordion } from './Accordion.js';
import { createControlBar } from './ControlBar.js';
import { createModal } from '../Modal.js';

export function createScenariosPanel(options = {}) {
    // Create main container
    const panel = document.createElement('div');
    panel.className = 'scenario-panel';
  
    // State
    let state = {
      untitledIncrement: 1,
      errors: [],
      tabId: null,
      recordedEvents: [],
      playBackStarted: false,
      showModal: false,
      newScenarioName: "",
      isRecording: false,
      scenarioIndex: -1,
      startingUrl: "https://stackoverflow.com/",
      controlBar: {
        record: true,
        clear: true,
        collapse: true,
        expand: true,
        save: false,
        import: false,
        settings: false
      }
    };
  
    // Create DOM elements
    const panelTop = document.createElement('div');
    panelTop.className = 'panel-top';
  
    const scenariosWrapper = document.createElement('div');
    scenariosWrapper.className = 'scenarios-wrapper';
  
    const scenariosContainer = document.createElement('div');
    scenariosContainer.className = 'scenarios';
  
    scenariosWrapper.appendChild(scenariosContainer);
  
    // Create control bar
    const controlBar = createControlBar({
      controlBar: state.controlBar,
      isInspecting: false,
      panel: 'Scenarios',
      onToggleInspection: openCreateScenarioModal,
      onResetData: resetData,
      onCollapseAll: collapseAll,
      onExpandAll: expandAll
    });
  
    panelTop.appendChild(controlBar.element);
  
    // Create modal (simplified)
    const modal = createModal();
    modal.element.style.display = 'none';
  
    // Assemble panel
    panel.append(panelTop, modal.element, scenariosWrapper);
  
    // Helper functions
    function renderScenarios() {
      scenariosContainer.innerHTML = '';
      
      state.recordedEvents.forEach((scenario, index) => {
        const isLastScenario = index === state.recordedEvents.length - 1;
        const isOpen = (state.recordedEvents.length - index - 1) === 0;
        
        const accordion = createAccordion({
          title: scenario.name,
          styling: 'rounded green-header accordion-shadow',
          isOpen: isOpen
        });
        
        // Add action buttons
        const buttonsContainer = document.createElement('div');
        
        if (!state.isRecording && isLastScenario && scenario.events.length === 0) {
          const recordBtn = document.createElement('button');
          recordBtn.textContent = 'Record';
          recordBtn.style.cssText = 'color: white; background-color: #2ca148; padding: 2px 4px;';
          recordBtn.addEventListener('click', () => initRecording(index));
          buttonsContainer.appendChild(recordBtn);
        }
        
        if (state.isRecording && isLastScenario) {
          const stopBtn = document.createElement('button');
          stopBtn.textContent = 'Stop Recording';
          stopBtn.style.cssText = 'background-color: orange; color: white; padding: 2px 4px;';
          stopBtn.addEventListener('click', stopRecording);
          buttonsContainer.appendChild(stopBtn);
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.cssText = 'background-color: red; color: white; padding: 2px 4px;';
        deleteBtn.addEventListener('click', () => deleteScenario(index));
        buttonsContainer.appendChild(deleteBtn);
        
        accordion.appendButtons(buttonsContainer);
        
        // Create events table
        if (scenario.events.length > 0) {
          const table = document.createElement('table');
          
          const thead = document.createElement('thead');
          const headerRow = document.createElement('tr');
          ['Command', 'Target', 'Value'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
          });
          thead.appendChild(headerRow);
          table.appendChild(thead);
          
          const tbody = document.createElement('tbody');
          scenario.events.forEach((event, eventIndex) => {
            const row = document.createElement('tr');
            if (event.state) row.classList.add(event.state);
            
            ['command', 'target', 'value'].forEach(key => {
              const td = document.createElement('td');
              if (key === 'target') td.className = 'xpath';
              td.textContent = event[key];
              row.appendChild(td);
            });
            
            tbody.appendChild(row);
          });
          table.appendChild(tbody);
          
          accordion.appendContent(table);
        }
        
        // Add export section
        const exportSection = document.createElement('div');
        exportSection.style.cssText = 'background-color: #E6E9E6; border-radius: 10px; padding: 2rem; margin-top: 2rem; display: flex; flex-direction: column; justify-content: center; align-items: center; width: -webkit-fit-available;';
        
        const heading = document.createElement('h4');
        heading.style.fontWeight = '200';
        heading.textContent = 'Save your scenario JSON Mapping and upload it to Taglab Web';
        exportSection.appendChild(heading);
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.cssText = 'display: flex; gap:2rem; width: -webkit-fit-available; margin-top: 2rem; flex-wrap: wrap;';
        
        const exportBtn = document.createElement('button');
        exportBtn.className = 'primary-btn';
        exportBtn.style.cssText = 'padding: 0.5rem 2rem; font-size: 14px;';
        exportBtn.textContent = 'Save to File';
        exportBtn.addEventListener('click', () => exportScenario(index));
        
        const taglabLink = document.createElement('a');
        taglabLink.href = 'https://taglab.net/?utm_source=extension&utm_medium=owned-media&utm_campaign=scenario';
        taglabLink.target = '_blank';
        taglabLink.className = 'primary-btn';
        taglabLink.style.cssText = 'padding: 0.5rem 2rem; font-size: 14px;';
        taglabLink.textContent = 'Go to Taglab Web';
        
        buttonsDiv.append(exportBtn, taglabLink);
        exportSection.appendChild(buttonsDiv);
        
        accordion.appendContent(exportSection);
        
        scenariosContainer.appendChild(accordion.element);
      });
    }
  
    function openCreateScenarioModal() {
      if (!state.isRecording && !state.playBackStarted) {
        state.showModal = true;
        modal.open();
      } else if (options.onNotification) {
        options.onNotification({
          type: "warning",
          title: "Cannot create new scenario now",
          message: "Recording/Playback has first to be stopped before creating a new scenarios."
        });
      }
    }
  
    function createScenario() {
      state.errors = [];
      
      // Validate inputs
      if (!state.startingUrl) {
        state.errors.push('Starting url required.');
      } else {
        const url = state.startingUrl.includes('https://') || state.startingUrl.includes('http://') 
          ? state.startingUrl 
          : 'https://' + state.startingUrl;
        
        if (!isValidHttpUrl(url)) {
          state.errors.push('Invalid Url.');
        }
      }
      
      // If no name provided, use default
      if (!state.newScenarioName) {
        state.newScenarioName = 'Untitled Scenario ' + state.untitledIncrement++;
      }
      
      // If valid, create scenario
      if (state.errors.length === 0) {
        const url = state.startingUrl.includes('https://') || state.startingUrl.includes('http://') 
          ? state.startingUrl 
          : 'https://' + state.startingUrl;
        
        state.recordedEvents.push({
          name: state.newScenarioName,
          startingUrl: url,
          events: []
        });
        
        state.newScenarioName = "";
        state.startingUrl = "https://stackoverflow.com/";
        state.showModal = false;
        modal.close();
        renderScenarios();
      }
    }
  
    function isValidHttpUrl(string) {
      try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch (_) {
        return false;    
      }
    }
  
    function exportScenario(index) {
      pageInteractionEvent("Scenarios", "export_to_file");
      const scenario = state.recordedEvents[index];
      const data = [];
  
      // Add starting URL as first action
      data.push({
        action: 'getUrl',
        items: {
          url: scenario.startingUrl,
          step_name: "Start",
          sensitiveCheckBox: false,
          mandatoryCheckBox: true,
          screenShotCheckBox: true
        }
      });
  
      // Add each event
      scenario.events.forEach((e, i) => {
        let d;
        switch (e.command) {
          case 'click':
            d = {
              action: e.command,
              items: {
                click_attr_name: "XPATH",
                click_attr_value: e.target,
                step_name: `${e.command}_${i+1}`,
                sensitiveCheckBox: false,
                mandatoryCheckBox: true,
                screenShotCheckBox: true
              }
            };
            break;
          case "input":
            d = {
              action: e.command,
              items: {
                input_attr_name: "XPATH",
                input_attr_value: e.target,
                input_text: e.value,
                step_name: `${e.command}_${i+1}`,
                sensitiveCheckBox: false,
                mandatoryCheckBox: true,
                screenShotCheckBox: true
              }
            };
            break;
        }
        if (d) data.push(d);
      });
  
      // Create download
      const blob = new Blob([JSON.stringify(data)], {type: 'text/plain'});
      const a = document.createElement('a');
      a.download = `${scenario.name}.json`;
      a.href = URL.createObjectURL(blob);
      a.click();
    }
  
    function deleteScenario(index) {
      state.recordedEvents.splice(index, 1);
      renderScenarios();
    }
  
    function resetData() {
      if (!state.isRecording && !state.playBackStarted) {
        state.recordedEvents = [];
        renderScenarios();
      } else if (options.onNotification) {
        options.onNotification({
          type: "warning",
          title: "Cannot Delete all Scenarios now",
          message: "Recording/Playback has first to be stopped before clearing the scenarios."
        });
      }
    }
  
    // Recording functions
    async function createWindow(index) {
      chromeHelper.updateTab(
        chrome.devtools.inspectedWindow.tabId, 
        {url: state.recordedEvents[index].startingUrl}, 
        errorHandler
      );
    }
  
    function listenToUrlChanges(details) {
      if (isValidHttpUrl(details)) {
        injectRecorderContentScript();
      }
    }
  
    function injectRecorderContentScript() {
      chromeHelper.injectScript(
        { target: {tabId: state.tabId}, files: ['content/recorder_content.js'] }, 
        errorHandler
      );
    }
  
    async function initRecording(index) {
      if (!state.isRecording) {
        chromeHelper.listenOnTabUpdated(listenToUrlChanges);
        createWindow(index);
        if (options.onStartInspection) options.onStartInspection();
      }
      state.isRecording = !state.isRecording;
      renderScenarios();
    }
  
    function stopRecording() {
      chromeHelper.removeTabUpdatedListener(listenToUrlChanges);
      if (options.onStopInspection) options.onStopInspection();
      state.isRecording = false;
      renderScenarios();
    }
  
    function initEventCapture(message, sender, sendResponse) {
      if (message.type === "recorder_message" && state.isRecording === true) {
        const lastScenario = state.recordedEvents[state.recordedEvents.length - 1];
        lastScenario.events.push(message);
        renderScenarios();
      }
    }
  
    function collapseAll() {
      // Simplified - would need to implement accordion collapse logic
      console.log('Collapse all scenarios');
    }
  
    function expandAll() {
      // Simplified - would need to implement accordion expand logic
      console.log('Expand all scenarios');
    }
  
    function errorHandler(errorAt) {
      if (chrome.runtime.lastError) {
        console.log("error at: ", errorAt, chrome.runtime.lastError);
      }
    }
  
    // Initialize
    state.tabId = chrome.devtools.inspectedWindow.tabId;
    chromeHelper.listenToRuntimeMessages(initEventCapture);
    renderScenarios();
  
    // Set up modal content
    modal.updateContent({
      header: `
        <h3 style="color: #2ca148;">Create New Scenario</h3>
        <p style="font-weight: 500; font-size: medium; color: #0f0f0f; text-align: center; margin: 1rem 0;">
          Build your test cases flow by creating a scenario and performing your steps on your webpage
        </p>
        <p style="font-weight: 500; font-size: small; color: #5f5f5f; text-align: center; margin: 1rem 0;">
          Interactions will be captured as commands that can be automated for repetitive execution
        </p>
      `,
      body: `
        <div class="new-scenario-fields">
          <div>
            <input type="text" id="newScenarioName" name="newScenarioName" placeholder="Scenario name" value="${state.newScenarioName}">
          </div>
          <div>
            <input type="text" id="startingUrl" name="startingUrl" placeholder="URL" value="${state.startingUrl}">
          </div>
          <div id="error-messages"></div>
        </div>
      `,
      footer: `
        <button class="primary-btn">Create</button>
        <button class="btn">Cancel</button>
      `
    });
  
    // Add modal event listeners
    modal.element.querySelector('.primary-btn').addEventListener('click', createScenario);
    modal.element.querySelector('.btn').addEventListener('click', () => {
      state.showModal = false;
      modal.close();
    });
  
    // Input handlers for modal
    modal.element.querySelector('#newScenarioName').addEventListener('input', (e) => {
      state.newScenarioName = e.target.value;
    });
  
    modal.element.querySelector('#startingUrl').addEventListener('input', (e) => {
      state.startingUrl = e.target.value;
    });
  
    // Public API
    return {
      element: panel,
      addRecordedEvent: (event) => {
        if (state.recordedEvents.length > 0) {
          state.recordedEvents[state.recordedEvents.length - 1].events.push(event);
          renderScenarios();
        }
      },
      getScenarios: () => [...state.recordedEvents],
      clearScenarios: () => {
        state.recordedEvents = [];
        renderScenarios();
      }
    };
  }