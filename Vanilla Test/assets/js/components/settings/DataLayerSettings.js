// data-layer-settings.js - Vanilla JS implementation of DataLayerSettings component
import { pageInteractionEvent } from '../../google-analytics.js';

// Function to dynamically load the CSS file
function loadDataLayerSettingsStyles() {
  if (!document.getElementById('DataLayerSettings-styles')) {
    const link = document.createElement('link');
    link.id = 'DataLayerSettings-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/settings/DataLayerSettings.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

export function createDataLayerSettings(options = {}) {
  // Ensure the CSS is loaded
  loadDataLayerSettingsStyles();

  // Create main container
  const panel = document.createElement('div');
  panel.className = 'dl-settings-panel settings-panel custom-scrollbar';
  const settingsTitle = document.createElement('h3');
  settingsTitle.textContent = 'Data Layer Settings';
  settingsTitle.className = 'settings-title';
  panel.appendChild(settingsTitle);
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
      adobetags: false,
      digitalLayer: true,
      dataLayer: true,
      utag: true,
      utag_data: true
    },
    customObjectDataLayers: [],
    newDLObject: "",
    customDLObject: ["digitalLayer", "dataLayer", "utag", "utag_data"],
    tags: options.tags || [],
    query: options.query || ''
  };

  // Create settings content
  const settingsContent = document.createElement('div');

  // Create predefined tags section
  const predefinedSection = document.createElement('div');
  predefinedSection.style.display = 'block'; // Ensure the section is visible

  const predefinedHeading = document.createElement('h3');
  predefinedHeading.textContent = 'Predefined Tags:';

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
  customHeading.textContent = 'Custom JS Objects:';

  const customLayersContainer = document.createElement('div');
  customLayersContainer.className = 'custom-object-layers-container';

  const customLayers = document.createElement('div');
  customLayers.className = 'custom-object-layers';

  customLayersContainer.appendChild(customLayers);
  customSection.append(customHeading, customLayersContainer);

  // Create input field for new custom object
const inputContainer = document.createElement('div');
inputContainer.style.cssText = 'display: flex; align-items: center; margin-bottom: 1rem;';

const inputField = document.createElement('input');
inputField.type = 'text';
inputField.placeholder = 'Enter custom JS object name';
inputField.style.cssText = 'flex-grow: 1; padding: 0.5rem; margin-right: 10px;';
inputField.addEventListener('input', (e) => {
  state.newDLObject = e.target.value.trim(); // Update the state with the input value
});

// Create "Add" button
const addButton = document.createElement('button');
addButton.textContent = 'Add';
addButton.style.cssText = 'padding: 0.5rem 1rem; background-color: #007bff; color: white; border: none; cursor: pointer;';
addButton.addEventListener('click', () => {
  if (state.newDLObject) {
    addNewDLObject(); // Call the function to add the new custom object
    inputField.value = ''; // Clear the input field
  } else {
    alert('Please enter a valid custom JS object name.');
  }
});

// Append input field and button to the container
inputContainer.appendChild(inputField);
inputContainer.appendChild(addButton);

// Add the input container to the custom section
customSection.prepend(inputContainer);
  // Assemble panel
  // settingsContent.append(predefinedSection, customSection);
  settingsContent.append(customSection);
  panel.appendChild(settingsContent);

  // Helper functions
  function createCheckboxLabel(id, text, onChange) {
    const label = document.createElement('label');
    label.htmlFor = id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = state.allowedDataLayers[id];
    checkbox.addEventListener('change', (e) => {
      state.allowedDataLayers[id] = e.target.checked; // Update the state
      console.log(`Checkbox ${id} changed to:`, e.target.checked);
      updateAllowedLayers(); 
      onChange(e.target.checked);
    })
    const span = document.createElement('span');
    span.textContent = text;

    label.append(checkbox, span);
    return label;
  }

  function renderCustomLayers() {
    customLayers.innerHTML = ''; // Clear the container

    state.customObjectDataLayers.forEach((dlObject, index) => {
      const layer = document.createElement('div');
      layer.className = 'custom-layer-item';
      layer.style.cssText = 'display: flex; align-items: center; padding: 0.5rem 1rem; font-size: small;';

      // Create the checkbox for activation/deactivation
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = state.allowedDataLayers[dlObject] || false; // Default to false if not set
      checkbox.style.marginRight = '10px';
      checkbox.addEventListener('change', (e) => {
        state.allowedDataLayers[dlObject] = e.target.checked; // Update the state
        updateAllowedLayers(); // Save the updated state to storage
      });

      // Create the label for the custom object
      const label = document.createElement('span');
      label.textContent = dlObject;
      label.style.flexGrow = '1';

      // Create the delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete-btn';
      deleteButton.style.marginLeft = '10px';
      deleteButton.addEventListener('click', () => {
        deleteCustomDLObject(index); // Delete the custom object
      });

      // Append the checkbox, label, and delete button to the layer
      layer.appendChild(checkbox);
      layer.appendChild(label);

      if(!state.customDLObject.includes(dlObject)) {
      layer.appendChild(deleteButton);
      }

      // Append the layer to the container
      customLayers.appendChild(layer);
    });
  }
  function getFilteredDataLayers() {
    if (!state.query.length) return state.customObjectDataLayers;
    return state.tags;
  }

  async function init() {
    try {
    state.customObjectDataLayers = await getStorageCustomDLObject();
    const allowedLayers = await getStorageAllowedDataLayers();
    if (allowedLayers) {
      state.allowedDataLayers = { ...state.allowedDataLayers, ...allowedLayers };
    }
    renderCustomLayers();
  } catch (error) {
    console.error('Error initializing DataLayerSettings:', error);
  }
  }

  function addNewDLObject() {
    pageInteractionEvent("Data Layer View", "settings_add_new_js_object");

    if (state.customObjectDataLayers.includes(state.newDLObject)) {
      alert("This custom object already exists.");
      return;
    }

    if (!/^(?!\d)[\w$]+$/.test(state.newDLObject)) {
      alert("Invalid format. Custom object names must start with a letter or underscore and contain only alphanumeric characters or underscores.");
      return;
    }

    state.customObjectDataLayers.push(state.newDLObject);
    state.allowedDataLayers[state.newDLObject] = false; // Default to inactive
    setStorageCustomDLObject();
    updateAllowedLayers();
    state.newDLObject = ""; // Clear the input
    renderCustomLayers();
  }

  function deleteCustomDLObject(index) {
    const dlObject = state.customObjectDataLayers[index];
    state.customObjectDataLayers.splice(index, 1); // Remove the object from the array
    delete state.allowedDataLayers[dlObject]; // Remove from allowed layers
    setStorageCustomDLObject();
    updateAllowedLayers();
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
    try {
      await chrome.storage.local.set({
        allowedLayers: state.allowedDataLayers
      });
      console.log('Allowed layers updated:', state.allowedDataLayers);
    } catch (error) {
      console.error('Error updating allowed layers:', error);
    }
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
    show: () => (panel.style.display = 'block'),
    hide: () => (panel.style.display = 'none'),
    updateTags: (newTags) => {
      state.tags = newTags;
      renderCustomLayers();
    },
    updateQuery: (newQuery) => {
      state.query = newQuery;
      renderCustomLayers();
    },
    getAllowedLayers: () => ({ ...state.allowedDataLayers }),
    getCustomLayers: () => [...state.customObjectDataLayers]
  };
}