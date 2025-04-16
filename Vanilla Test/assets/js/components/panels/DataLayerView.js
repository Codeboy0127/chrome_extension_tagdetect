// data-layer-view.js - Updated Vanilla JS implementation with proper integration
import { createDataLayerSettings } from '../settings/DataLayerSettings.js';
import { createAccordion } from '../Accordion.js';
import { createControlBar } from '../ControlBar.js';
import { pageInteractionEvent } from '../../google-analytics.js';

// Function to dynamically load the CSS file
function loadDataLayerViewStyles() {
  if (!document.getElementById('DataLayerView-styles')) {
    const link = document.createElement('link');
    link.id = 'DataLayerView-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/panels/DataLayerView.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}
export function createDataLayerView(options = {}) {
  loadDataLayerViewStyles(); // Load CSS styles
  // Create main container
  const panel = document.createElement('div');
  panel.className = 'panel';

  // State
  let state = {
    data: options.data || [],
    listOrder: options.listOrder || 'ASC',
    isInspecting: options.isInspecting || false,
    tags: [],
    tagNames: {
      google_tag_manager: "Google Tag Manager",
      google_tag_manager_push: "Google Tag Manager Push",
      tealium: "Tealium",
      tag_commander: "TagCommander",
      adobe_dtm: "Adobe DTM",
      var: "Other Layers",
      launchdataelements: "Launch Elements",
      adobetags: "Adobe Tags"
    },
    controlBar: {
      record: true,
      clear: true,
      collapse: true,
      expand: true,
      save: true,
      settings: true,
      tabIndex: 1
    },
    searchFilter: "",
    isEventEditEnabled: { toggle: false, urlIndex: 0, eventIndex: 0 },
    newTitle: ""
  };

  // Create DOM elements
  const panelTop = document.createElement('div');
  panelTop.className = 'panel-top';

  const dlPanel = document.createElement('div');
  dlPanel.className = `dl-panel ${state.listOrder.toLowerCase()}`;

  // Create data layer settings panel
  const dataLayerSettings = createDataLayerSettings({
    tags: state.tags,
    query: state.searchFilter
  });

  // Add settings panel to DOM
  const dlSettings = document.createElement('div');
  dlSettings.className = 'dl-settings';
  dlSettings.appendChild(dataLayerSettings.element);

  // Initialize Control Bar
  const controlBar = createControlBar({
    controlBar: state.controlBar,
    isInspecting: state.isInspecting,
    panel: 'Data Layer View',
    onToggleInspection: () => {
      if (options.onToggleInspection) options.onToggleInspection();
    },
    onResetData: resetData,
    onExportData: () => {
      if (options.onExportData) options.onExportData();
    },
    onCollapseAll: collapseAll,
    onExpandAll: expandAll,
    
    onToggleSettingsPanel: toggleSettingsPanel
  });

  panelTop.appendChild(controlBar.element);

  // Assemble panel
  panel.append(panelTop, dlSettings, dlPanel);

  // Helper function to extract tags from data
  function extractTagsFromData(data) {
    const result = data
      .flatMap(d => d.events || [])
      .flatMap(e => e.dataLayers || [])
      .filter(obj => obj.data)
      .map(item => item.dLN);
    return [...new Set(result)]; // Remove duplicates
  }

  // Render data layers
  function renderDataLayers() {
    dlPanel.innerHTML = '';
    
    state.data.forEach((datalayer, urlIndex) => {
      const accordion = createAccordion({
        title: datalayer.pageUrl,
        styling: 'rounded gray-header accordion-shadow',
        isOpen: state.data.length - urlIndex - 1 === 0,
        content: renderEvents(datalayer.events, urlIndex)
      });
      
      dlPanel.appendChild(accordion.element);
    });
  }

  function renderEvents(events, urlIndex) {
    const container = document.createElement('div');
    
    if (!events || events.length === 0) {
      const noEvents = document.createElement('p');
      noEvents.textContent = 'No recorded events';
      container.appendChild(noEvents);
      return container;
    }
    
    // Reverse events based on listOrder
    const eventsToRender = state.listOrder === 'ASC' ? [...events] : [...events].reverse();
    eventsToRender.forEach((event, eventIndex) => {
      if (event.name == "Load") {
        const originalIndex = state.listOrder === 'ASC' ? eventIndex : events.length - eventIndex - 1;
        const eventAccordion = createAccordion({
          title: event.name,
          styling: 'rounded green-header accordion-shadow',
          editTitleSlot: renderEditTitle(event.name, urlIndex, originalIndex),
          buttonsSlot: event.dataLayers ? renderButtons() : null,
          content: renderDataLayerContent(event, urlIndex, originalIndex)
        });
        
        container.appendChild(eventAccordion.element);
      }
    });
    
    return container;
  }

  function renderEditTitle(title, urlIndex, eventIndex) {
    const container = document.createElement('div');
    
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.style.display = state.isEventEditEnabled.toggle && 
      state.isEventEditEnabled.urlIndex === urlIndex && 
      state.isEventEditEnabled.eventIndex === eventIndex ? '' : 'none';
    editInput.value = title;
    editInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        editEventTitle(e, urlIndex, eventIndex);
      }
    });
    editInput.addEventListener('blur', disableEventTitleEdit);
    
    const editIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    editIcon.setAttribute('fill', 'rgb(120,120,120)');
    editIcon.setAttribute('height', '1em');
    editIcon.setAttribute('viewBox', '0 0 512 512');
    editIcon.style.filter = 'invert(1)';
    editIcon.style.display = state.isEventEditEnabled.toggle && 
      state.isEventEditEnabled.urlIndex === urlIndex && 
      state.isEventEditEnabled.eventIndex === eventIndex ? 'none' : '';
    editIcon.innerHTML = `<path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/>`;
    editIcon.addEventListener('click', () => enableEventTitleEdit(title, urlIndex, eventIndex));
    
    container.append(editInput, editIcon);
    return container;
  }

  function renderButtons() {
    const container = document.createElement('div');
    container.className = 'dl-buttons';
    
    const collapseImg = document.createElement('img');
    collapseImg.id = 'expand-all';
    collapseImg.src = chrome.runtime.getURL('/assets/images/collapse.svg');
    collapseImg.style.height = '15px';
    collapseImg.addEventListener('click', collapseTree);
    
    const expandImg = document.createElement('img');
    expandImg.id = 'collapse-all';
    expandImg.src = chrome.runtime.getURL('/assets/images/expand.svg');
    expandImg.style.height = '15px';
    expandImg.addEventListener('click', expandTree);
    
    container.append(collapseImg, expandImg);
    return container;
  }

  function renderDataLayerContent(event, urlIndex, eventIndex) {
    const container = document.createElement('div');
    
    if (!event.dataLayers || event.dataLayers.length === 0) {
      const noDataLayers = document.createElement('p');
      noDataLayers.textContent = 'No recorded datalayers';
      container.appendChild(noDataLayers);
      return container;
    }
    
    const dataLayersContainer = document.createElement('div');
    dataLayersContainer.className = 'data-layers';
    
    event.dataLayers.forEach((dl, index) => {
      const dlContainer = document.createElement('div');
      dlContainer.style.width = '90%';
      
      if (dl.data) {
        // Initialize JSONView component here
        const jsonView = createJSONView({
          data: filterObj(dl.data, state.searchFilter, 'loose'),
          maxDepth: 0,
          rootKey: dl.type === 'var' ? dl.dLN : getDLName(dl.type)
        });
        dlContainer.appendChild(jsonView.element);
      }
      
      dataLayersContainer.appendChild(dlContainer);
    });
    
    container.appendChild(dataLayersContainer);
    return container;
  }

  // Methods
  function enableEventTitleEdit(title, urlIndex, eventIndex) {
    state.newTitle = title;
    state.isEventEditEnabled = {
      toggle: true,
      urlIndex,
      eventIndex
    };
    renderDataLayers();
    
    // Focus the input (need to wait for DOM update)
    setTimeout(() => {
      const input = panel.querySelector(`input[type="text"]`);
      if (input) input.focus();
    }, 0);
  }

  function disableEventTitleEdit() {
    state.isEventEditEnabled.toggle = false;
    renderDataLayers();
  }

  function editEventTitle(event, urlIndex, eventIndex) {
    if (options.onEditEventTitle) {
      options.onEditEventTitle(event.target.value, urlIndex, eventIndex);
    }
    disableEventTitleEdit();
  }

  function filterObjStrict(object, filter) {
    let result = {};
    Object.keys(object).forEach((key) => {
      if (
        key.toLowerCase().includes(filter.toLowerCase()) ||
        object[key].toString().toLowerCase().includes(filter.toLowerCase())
      ) {
        result[key] = object[key];
      } else if (typeof object[key] === 'object') {
        const filtered = filterObj(object[key], filter);
        if (Object.keys(filtered).length > 0) {
          result[key] = filtered;
        }
      }
    });
    return result;
  }

  function filterObj(object, filter, rule = "loose") {
    let result = {};
    Object.keys(object).forEach((key) => {
      if (
        key.toLowerCase().includes(filter.toLowerCase()) ||
        object[key].toString().toLowerCase().includes(filter.toLowerCase())
      ) {
        if (rule === "loose") result = object;
        else result[key] = object[key];
      } else if (typeof object[key] === 'object') {
        const filtered = filterObj(object[key], filter, rule);
        if (Object.keys(filtered).length > 0) {
          result[key] = filtered;
        }
      }
    });
    return result;
  }

  function updateSearch() {
    if (state.searchFilter !== "") {
      panel.querySelector('.search-box')?.classList.add('active');
    } else {
      panel.querySelector('.search-box')?.classList.remove('active');
    }

    const result = state.data
      .flatMap(d => d.events || [])
      .flatMap(e => e.dataLayers || []);
    
    const res1 = result.filter(obj => {
      if (obj.data) {
        return Object.values(obj.data).some(value => {
          if (typeof value === 'object') {
            return Object.values(value).some(v => 
              String(v).includes(state.searchFilter)
            );
          }
          return String(value).includes(state.searchFilter);
        });
      }
      return false;
    }).map(item => item.dLN);
    
    state.tags = [...new Set(res1)]; // Remove duplicates
    dataLayerSettings.updateTags(state.tags);
    renderDataLayers();
  }

  function searchFocus() {
    pageInteractionEvent("Tags View", "search_focus");
  }

  function collapseAll() {
    const accordions = panel.querySelectorAll('.dl-panel .accordion');
    accordions.forEach(acc => {
      const content = acc.querySelector('div.content.custom-scrollbar.square');
      if (content) {
        content.style.display = 'none';
      }
      const header = acc.querySelector('h3');
      if (header) {
        header.classList.remove('selected');
      }
    });

    const jsonItems = panel.querySelectorAll('div.content.square .json-view-item:not(.root-item)');
    jsonItems.forEach(item => {
      item.style.display = 'none';
    });

    const arrows = panel.querySelectorAll('div.content.square .chevron-arrow');
    arrows.forEach(arrow => {
      arrow.classList.remove('opened');
    });

    const dataKeys = panel.querySelectorAll('div.content.square .data-key');
    dataKeys.forEach(key => {
      key.setAttribute('aria-expanded', 'false');
    });
  }

  function expandAll() {
    const accordions = panel.querySelectorAll('.dl-panel .accordion');
    accordions.forEach(acc => {
      const content = acc.querySelector('div.content.custom-scrollbar.square');
      if (content) {
        content.style.display = 'block';
      }
      const header = acc.querySelector('h3');
      if (header) {
        header.classList.add('selected');
      }
    });

    const jsonItems = panel.querySelectorAll('div.content.square .json-view-item:not(.root-item)');
    jsonItems.forEach(item => {
      item.style.display = '';
    });

    const arrows = panel.querySelectorAll('div.content.square .chevron-arrow');
    arrows.forEach(arrow => {
      arrow.classList.add('opened');
    });

    const dataKeys = panel.querySelectorAll('div.content.square .data-key');
    dataKeys.forEach(key => {
      key.setAttribute('aria-expanded', 'true');
    });
  }

  function expandTree(event) {
    const parent = event.currentTarget.closest('.accordion');
    const content = parent.querySelector('div.content');
    if (content) {
      const items = content.querySelectorAll('.json-view-item:not(.root-item)');
      items.forEach(item => {
        item.style.display = '';
      });
      
      const arrows = content.querySelectorAll('.chevron-arrow');
      arrows.forEach(arrow => {
        arrow.classList.add('opened');
      });
    }
  }

  function collapseTree(event) {
    const parent = event.currentTarget.closest('.accordion');
    const content = parent.querySelector('div.content');
    if (content) {
      const items = content.querySelectorAll('.json-view-item:not(.root-item)');
      items.forEach(item => {
        item.style.display = 'none';
      });
      
      const arrows = content.querySelectorAll('.chevron-arrow');
      arrows.forEach(arrow => {
        arrow.classList.remove('opened');
      });
    }
  }

  function toggleSettingsPanel() {
    dataLayerSettings.element.style.display = 
      dataLayerSettings.element.style.display === 'none' ? 'block' : 'none';
    pageInteractionEvent("Data Layer View", "toggle_settings_panel");
  }

  function getDLName(type) {
    return state.tagNames[type] ?? "Unknown Layer";
  }

  function resetData() {
    if (!state.isInspecting) {
      if (options.onResetData) options.onResetData();
    } else {
      if (options.onNotification) {
        options.onNotification({
          type: "warning",
          title: "Cannot Clear Data While Inspection Mode is on",
          message: "Please turn off inspection mode before clearing the data."
        });
      }
    }
  }

  // Initialize
  renderDataLayers();

  // Public API
  return {
    element: panel,
    updateData(newData) {
      state.data = newData;
      state.tags = extractTagsFromData(newData);
      dataLayerSettings.updateTags(state.tags);
      renderDataLayers();
    },
    setIsInspecting(inspecting) {
      state.isInspecting = inspecting;
      controlBar.setIsInspecting(inspecting);
    },
    updateSearchFilter(filter) {
      state.searchFilter = filter;
      updateSearch();
    }
  };

  function createJSONView(config) {
    const container = document.createElement('div');
    container.className = 'json-viewer';
    
    // State
    let state = {
        data: config.data || {},
        maxDepth: config.maxDepth || 0,
        rootKey: config.rootKey || 'root',
        currentDepth: 0,
        colorScheme: config.colorScheme || 'default'
    };
  
    // Create root item
    const rootItem = document.createElement('div');
    rootItem.className = 'json-view-item root-item';
    
    // Create root key
    const rootKey = document.createElement('div');
    rootKey.className = 'data-key';
    rootKey.setAttribute('aria-expanded', 'true');
    
    // Add chevron arrow for expandable items
    if (isExpandable(state.data)) {
        const chevron = document.createElement('div');
        chevron.className = 'chevron-arrow opened';
        chevron.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleExpand(rootKey);
        });
        rootKey.appendChild(chevron);
    }
    
    // Add root key name
    const keyName = document.createElement('span');
    keyName.className = 'key-name';
    keyName.textContent = state.rootKey;
    rootKey.appendChild(keyName);
    
    // Add colon
    const colon = document.createElement('span');
    colon.className = 'colon';
    colon.textContent = ':';
    rootKey.appendChild(colon);
    
    rootItem.appendChild(rootKey);
    
    // Add value
    const valueContainer = document.createElement('div');
    valueContainer.className = 'value-container';
    
    if (isExpandable(state.data)) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'json-children';
        renderChildren(state.data, childrenContainer, state.currentDepth + 1);
        valueContainer.appendChild(childrenContainer);
    } else {
        const valueElement = createValueElement(state.data);
        valueContainer.appendChild(valueElement);
    }
    
    rootItem.appendChild(valueContainer);
    container.appendChild(rootItem);
    
    // Helper functions
    function isExpandable(value) {
        return (typeof value === 'object' && value !== null && 
               !(value instanceof Date) && Object.keys(value).length > 0);
    }
    
    function toggleExpand(keyElement) {
        const isExpanded = keyElement.getAttribute('aria-expanded') === 'true';
        const chevron = keyElement.querySelector('.chevron-arrow');
        const childrenContainer = keyElement.parentElement.querySelector('.json-children');
        
        if (isExpanded) {
            keyElement.setAttribute('aria-expanded', 'false');
            chevron.classList.remove('opened');
            childrenContainer.style.display = 'none';
        } else {
            keyElement.setAttribute('aria-expanded', 'true');
            chevron.classList.add('opened');
            childrenContainer.style.display = '';
        }
    }
    
    function createValueElement(value) {
        const valueElement = document.createElement('span');
        valueElement.className = 'value-key';
        
        if (value === null) {
            valueElement.textContent = 'null';
            valueElement.classList.add('null-value');
        } else if (typeof value === 'string') {
            valueElement.textContent = `"${value}"`;
            valueElement.classList.add('string-value');
        } else if (typeof value === 'number') {
            valueElement.textContent = value;
            valueElement.classList.add('number-value');
        } else if (typeof value === 'boolean') {
            valueElement.textContent = value ? 'true' : 'false';
            valueElement.classList.add('boolean-value');
        } else if (Array.isArray(value)) {
            valueElement.textContent = `[${value.length}]`;
            valueElement.classList.add('array-value');
        } else if (value instanceof Date) {
            valueElement.textContent = value.toString();
            valueElement.classList.add('date-value');
        } else if (typeof value === 'object') {
            valueElement.textContent = '{...}';
            valueElement.classList.add('object-value');
        }
        
        return valueElement;
    }
    
    function renderChildren(data, container, depth) {
        container.innerHTML = '';
        
        if (state.maxDepth > 0 && depth > state.maxDepth) {
            const ellipsis = document.createElement('div');
            ellipsis.textContent = '...';
            ellipsis.className = 'ellipsis';
            container.appendChild(ellipsis);
            return;
        }
        
        Object.entries(data).forEach(([key, value]) => {
     
            const item = document.createElement('div');
            item.className = 'json-view-item';
            
            const keyElement = document.createElement('div');
            keyElement.className = 'data-key';
            keyElement.setAttribute('aria-expanded', 'true');
            
            if (isExpandable(value)) {
                const chevron = document.createElement('div');
                chevron.className = 'chevron-arrow opened';
                chevron.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleExpand(keyElement);
                });
                keyElement.appendChild(chevron);
            }
            
            const keyName = document.createElement('span');
            keyName.className = 'key-name';
            keyName.textContent = key;
            keyElement.appendChild(keyName);
            
            const colon = document.createElement('span');
            colon.className = 'colon';
            colon.textContent = ':';
            keyElement.appendChild(colon);
                // Add event
            const event = document.createElement('span');
            
              Object.entries(value).forEach(([key2, value2]) => {
                if (key2 == 'event') {
                    event.textContent = value2;
                    event.className = 'event-name';
                }
            })
            keyElement.appendChild(event);
            item.appendChild(keyElement);
            
            const valueContainer = document.createElement('div');
            valueContainer.className = 'value-container';
            var flag=true;
            if (isExpandable(value)) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'json-children';
                renderChildren(value, childrenContainer, depth + 1);
                valueContainer.appendChild(childrenContainer);
            } else {
                const valueElement = createValueElement(value);
                valueContainer.appendChild(valueElement);
                flag=false
                
            }
            
            item.appendChild(valueContainer);
            if(flag==false){
              item.classList.add('last-item')
            }
            container.appendChild(item);
        });
    }
    
    // Add click handler for root key
    rootKey.addEventListener('click', (e) => {
        if (e.target === rootKey || e.target === keyName || e.target === colon) {
            toggleExpand(rootKey);
        }
    });
    
    // Public API
    return {
        element: container,
        updateData(newData) {
            state.data = newData;
            container.innerHTML = '';
            container.appendChild(createJSONView(config).element);
        }
    };
  }
}

// Helper function to create JSONView component
