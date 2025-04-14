// data-layer-settings.js - Vanilla JS implementation of DataLayerSettings component
import { pageInteractionEvent } from '../google-analytics.js';


export function createDataLayerSettings(options = {}) {
    // Create main container
    const panel = document.createElement('div');
    panel.className = 'dl-settings-panel settings-panel custom-scrollbar';
    panel.style.display = 'none';
  
    // State
    let state = {
      allowedDataLayers: {
        google_tag_manager_push: false,
        google_tag_manager: false,
        tealium: false,
        tag_commander: false,
        adobe_dtm: false,
        var: true,
        launchdataelements: true,
        adobetags: false
      },
      customObjectDataLayers: [],
      newDLObject: "",
      tags: options.tags || [],
      query: options.query || ''
    };
  
    // Create settings content
    const settingsContent = document.createElement('div');
    
    // Create predefined tags section (hidden by default)
    const predefinedSection = document.createElement('div');
    predefinedSection.style.display = 'none';
    
    const predefinedHeading = document.createElement('h3');
    predefinedHeading.textContent = 'Predefined tags:';
    
    const defaultLayersContainer = document.createElement('div');
    defaultLayersContainer.className = 'default-object-layers-container';
    
    // First column
    const column1 = document.createElement('div');
    column1.className = 'default-object-layers-column';
    
    const layers1 = [
      { id: 'google_tag_manager_push', label: 'Google Tag Manager Push' },
      { id: 'google_tag_manager', label: 'Google Tag Manager' },
      { id: 'tealium', label: 'Tealium' },
      { id: 'tag_commander', label: 'TagCommander' }
    ];
    
    layers1.forEach(layer => {
      const label = createCheckboxLabel(layer.id, layer.label, (checked) => {
        state.allowedDataLayers[layer.id] = checked;
        updateAllowedLayers();
      });
      column1.appendChild(label);
    });
    
    // Second column
    const column2 = document.createElement('div');
    column2.className = 'default-object-layers-column';
    
    const layers2 = [
      { id: 'adobe_dtm', label: 'Adobe DTM' },
      { id: 'launchdataelements', label: 'Launch Elements' },
      { id: 'adobetags', label: 'Adobe Tags' }
    ];
    
    layers2.forEach(layer => {
      const label = createCheckboxLabel(layer.id, layer.label, (checked) => {
        state.allowedDataLayers[layer.id] = checked;
        updateAllowedLayers();
      });
      column2.appendChild(label);
    });
    
    defaultLayersContainer.append(column1, column2);
    predefinedSection.append(predefinedHeading, defaultLayersContainer);
    
    // Create custom objects section
    const customSection = document.createElement('div');
    
    const customHeading = document.createElement('p');
    customHeading.style.paddingBottom = '0.5rem';
    customHeading.textContent = 'Custom JS objects:';
    
    const customLayersContainer = document.createElement('div');
    customLayersContainer.className = 'custom-object-layers-container';
    
    const customLayers = document.createElement('div');
    customLayers.className = 'custom-object-layers';
    
    customLayersContainer.appendChild(customLayers);
    customSection.append(customHeading, customLayersContainer);
    
    // Assemble panel
    settingsContent.append(predefinedSection, customSection);
    panel.appendChild(settingsContent);
  
    // Helper functions
    function createCheckboxLabel(id, text, onChange) {
      const label = document.createElement('label');
      label.htmlFor = id;
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = id;
      checkbox.checked = state.allowedDataLayers[id];
      checkbox.addEventListener('change', (e) => onChange(e.target.checked));
      
      const span = document.createElement('span');
      span.textContent = text;
      
      label.append(checkbox, span);
      return label;
    }
  
    function renderCustomLayers() {
      customLayers.innerHTML = '';
      
      getFilteredDataLayers().forEach((dlObject, index) => {
        const layer = document.createElement('div');
        layer.className = 'sec-btn';
        layer.style.cssText = 'padding: 0.5rem 1rem; font-size: small;';
        layer.textContent = dlObject;
        
        customLayers.appendChild(layer);
      });
    }
  
    function getFilteredDataLayers() {
      if (!state.query.length) return state.customObjectDataLayers;
      return state.tags;
    }
  
    async function init() {
      state.customObjectDataLayers = await getStorageCustomDLObject();
      const allowedLayers = await getStorageAllowedDataLayers();
      if (allowedLayers) {
        state.allowedDataLayers = { ...state.allowedDataLayers, ...allowedLayers };
      }
      renderCustomLayers();
    }
  
    function addNewDLObject() {
      pageInteractionEvent("Data Layer View", "settings_add_new_js_object");
      
      if (state.customObjectDataLayers.includes(state.newDLObject)) {
        // Already exists
        return;
      }
      
      if (!/^(?!\d)[\w$]+$/.test(state.newDLObject)) {
        // Invalid format
        return;
      }
      
      state.customObjectDataLayers.push(state.newDLObject);
      setStorageCustomDLObject();
      state.newDLObject = "";
      renderCustomLayers();
    }
  
    function deleteCustomDLObject(index) {
      state.customObjectDataLayers.splice(index, 1);
      setStorageCustomDLObject();
      renderCustomLayers();
    }
  
    async function setStorageCustomDLObject() {
      return await chrome.storage.local.set({
        dataLayers: state.customObjectDataLayers
      });
    }
  
    async function getStorageCustomDLObject() {
      const storage = await chrome.storage.local.get(["dataLayers"]);
      return storage.dataLayers || [];
    }
  
    async function getStorageAllowedDataLayers() {
      const storage = await chrome.storage.local.get(["allowedLayers"]);
      return storage.allowedLayers || null;
    }
  
    async function updateAllowedLayers() {
      await chrome.storage.local.set({ 
        allowedLayers: state.allowedDataLayers 
      });
    }
  
    // Public methods
    function show() {
      panel.style.display = 'block';
    }
  
    function hide() {
      panel.style.display = 'none';
    }
  
    function updateTags(newTags) {
      state.tags = newTags;
      renderCustomLayers();
    }
  
    function updateQuery(newQuery) {
      state.query = newQuery;
      renderCustomLayers();
    }
  
    // Initialize
    init();
  
    // Public API
    return {
      element: panel,
      show,
      hide,
      updateTags,
      updateQuery,
      getAllowedLayers: () => ({ ...state.allowedDataLayers }),
      getCustomLayers: () => [...state.customObjectDataLayers]
    };
  }