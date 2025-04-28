// control-bar.js - Vanilla JS implementation of ControlBar component

import { pageInteractionEvent } from '../google-analytics.js';

function loadControlBarStyles() {
  if (!document.getElementById('ControlBar-styles')) {
    const link = document.createElement('link');
    link.id = 'ControlBar-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/ControlBar.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

export function createControlBar(options = {}) {
  // Ensure the CSS is loaded
  loadControlBarStyles();
  // Create container
  const controlBar = document.createElement('div');
  controlBar.className = 'control-bar';
  let historyMode = false;
  // State
  let isInspecting = options.isInspecting || false;
  const controlBarConfig = options.controlBar || {
    record: true,
    clear: true,
    collapse: true,
    expand: true,
    settings: true,
    tabIndex: 0
  };
  const panel = options.panel || '';

  // Create buttons based on config
async function renderButtons() {
  try {
    controlBar.innerHTML = '';
    historyMode = await chrome.storage.local.get("historyMode");
  // Record/Pause toggle button
  if (controlBarConfig.record) {
  const inspectBtn = document.createElement('button');
  inspectBtn.className = 'action-btn';

  // Set button text based on mode and inspection state
  inspectBtn.textContent = isInspecting ? 'Pause' : 'Record';

  // Add click event listener
  inspectBtn.addEventListener('click', () => {
    if (historyMode) {
      // Toggle inspection state in history mode
      isInspecting = !isInspecting;
      historyMode = !historyMode; // Switch to normal mode when recording starts
      // if (options.onToggleInspection) options.onToggleInspection();
      if(document.getElementsByClassName("spinner")[0]){
        for(let i = 0; i < document.getElementsByClassName("spinner").length; i++){
        document.getElementsByClassName("spinner")[i].style.display = isInspecting ? 'block' : 'none';; // Hide spinner in history mode
        }
      }
    } else {
      // Toggle inspection state in normal mode
      isInspecting = !isInspecting;
    }

    // Update button text and re-render buttons
    // renderButtons();

    // Trigger the inspection toggle callback
    if (options.onToggleInspection) options.onToggleInspection();
  });

  controlBar.appendChild(inspectBtn);
  }

    // Clear button
    if (controlBarConfig.clear) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'action-btn';
      clearBtn.textContent = 'Clear';
      clearBtn.addEventListener('click', handleResetData);
      controlBar.appendChild(clearBtn);
    }

    // Collapse All button
    if (controlBarConfig.collapse) {
      const collapseBtn = document.createElement('button');
      collapseBtn.className = 'action-btn';
      collapseBtn.textContent = 'Collapse All';
      collapseBtn.addEventListener('click', handleCollapseAll);
      controlBar.appendChild(collapseBtn);
    }

    // Expand All button
    if (controlBarConfig.expand) {
      const expandBtn = document.createElement('button');
      expandBtn.className = 'action-btn';
      expandBtn.textContent = 'Expand All';
      expandBtn.addEventListener('click', handleExpandAll);
      controlBar.appendChild(expandBtn);
    }

    // Settings/Toggle button
  //   if (controlBarConfig.settings) {
  //     const settingsBtn = document.createElement('button');
  //     settingsBtn.className = 'action-btn';
  //     settingsBtn.textContent = controlBarConfig.tabIndex === 0 ? 'Tags' : 'Data Layers';
  //     settingsBtn.addEventListener('click', handleToggleSettings);
  //     controlBar.appendChild(settingsBtn);
  //   }
    } catch (error) {
      if (error.message.includes("Extension context invalidated")) {
        console.warn("Extension context invalidated. Skipping renderButtons.");
      } else {
        console.error("Error in renderButtons:", error);
      }
    }
  }

  // Event handlers
  function handleCollapseAll() {
    if (options.onCollapseAll) options.onCollapseAll();
    pageInteractionEvent(panel, 'collapse_all');
  }

  function handleExpandAll() {
    if (options.onExpandAll) options.onExpandAll();
    pageInteractionEvent(panel, 'expand_all');
  }

  function handleToggleSettings() {
    
    if (options.onToggleSettingsPanel) options.onToggleSettingsPanel();
    pageInteractionEvent(panel, 'toggle_settings_panel');
  }

  function handleToggleInspection() {
    isInspecting = !isInspecting;
    renderButtons();
    
    if (options.onToggleInspection) options.onToggleInspection();
    
    const interaction = isInspecting ? 'start_inspection' : 'pause_inspection';
    pageInteractionEvent(panel, interaction);
  }

  function handleResetData() {
    if (options.onResetData) options.onResetData();
    pageInteractionEvent(panel, 'clear_data');
  }

  // Public methods
  function updateConfig(newConfig) {
    Object.assign(controlBarConfig, newConfig);
    renderButtons();
  }

  function setIsInspecting(inspecting) {
    isInspecting = inspecting;
    renderButtons();
  }

  // Initialize
  renderButtons();

  // Public API
  return {
    element: controlBar,
    updateConfig,
    setIsInspecting
  };
}