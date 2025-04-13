// data-layer-view.js - Vanilla JS implementation of DataLayerView component

export function createDataLayerView(options = {}) {
    // Create main container
    const panel = document.createElement('div');
    panel.className = 'panel';
  
    // State
    let state = {
      data: options.data || [],
      listOrder: options.listOrder || 'DESC',
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
      isEventEditEnabled: { toggle: false, urlIndex: 0, eventIndex: 0 }
    };
  
    // Create DOM elements
    const panelTop = document.createElement('div');
    panelTop.className = 'panel-top';
  
    const dlSettings = document.createElement('div');
    dlSettings.className = 'dl-settings';
  
    const dlPanel = document.createElement('div');
    dlPanel.className = `dl-panel ${state.listOrder.toLowerCase()}`;
  
    // Create control bar
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
  
    // Create data layer settings (simplified)
    const dataLayerSettings = document.createElement('div');
    dataLayerSettings.className = 'dl-settings-panel';
    dlSettings.appendChild(dataLayerSettings);
  
    // Assemble panel
    panel.append(panelTop, dlSettings, dlPanel);
  
    // Helper functions
    function renderDataLayers() {
      dlPanel.innerHTML = '';
      
      state.data.forEach((datalayer, urlIndex) => {
        const accordion = createAccordion({
          title: datalayer.pageUrl,
          styling: 'rounded gray-header accordion-shadow',
          isOpen: state.data.length - urlIndex - 1 === 0
        });
        
        if (!datalayer.events || datalayer.events.length === 0) {
          const noEvents = document.createElement('p');
          noEvents.textContent = 'No recorded events';
          accordion.appendContent(noEvents);
        } else {
          [...datalayer.events].reverse().forEach((event, eventIndex) => {
            const eventAccordion = createAccordion({
              title: event.name,
              styling: 'rounded green-header accordion-shadow',
              showEditButton: true,
              onEditClick: () => enableEventTitleEdit(event.name, urlIndex, eventIndex)
            });
            
            if (!event.dataLayers || event.dataLayers.length === 0) {
              const noDataLayers = document.createElement('p');
              noDataLayers.textContent = 'No recorded datalayers';
              eventAccordion.appendContent(noDataLayers);
            } else {
              const buttonsContainer = document.createElement('div');
              buttonsContainer.className = 'dl-buttons';
              
              const collapseBtn = document.createElement('img');
              collapseBtn.id = 'collapse-all';
              collapseBtn.src = chrome.runtime.getURL('images/collapse.svg');
              collapseBtn.style.height = '15px';
              collapseBtn.addEventListener('click', (e) => collapseTree(e));
              
              const expandBtn = document.createElement('img');
              expandBtn.id = 'expand-all';
              expandBtn.src = chrome.runtime.getURL('images/expand.svg');
              expandBtn.style.height = '15px';
              expandBtn.addEventListener('click', (e) => expandTree(e));
              
              buttonsContainer.append(collapseBtn, expandBtn);
              eventAccordion.appendButtons(buttonsContainer);
              
              const dataLayersContainer = document.createElement('div');
              dataLayersContainer.className = 'data-layers';
              
              event.dataLayers.forEach((dl, dlIndex) => {
                if (dl.data) {
                  const jsonView = createJsonView({
                    data: filterObj(dl.data, state.searchFilter, 'loose'),
                    rootKey: dl.type === 'var' ? dl.dLN : getDLName(dl.type),
                    maxDepth: 0
                  });
                  dataLayersContainer.appendChild(jsonView.element);
                }
              });
              
              eventAccordion.appendContent(dataLayersContainer);
            }
            
            accordion.appendContent(eventAccordion.element);
          });
        }
        
        dlPanel.appendChild(accordion.element);
      });
    }
  
    function getDLName(type) {
      return state.tagNames[type] ?? "Unknown Layer";
    }
  
    function filterObj(object, filter, rule = "loose") {
      if (!filter) return object;
      
      let result = {};
      Object.keys(object).forEach((key) => {
        if (
          key.toLowerCase().includes(filter.toLowerCase()) ||
          String(object[key]).toLowerCase().includes(filter.toLowerCase())
        ) {
          if (rule === "loose") return object;
          result[key] = object[key];
        } else if (typeof object[key] === "object") {
          const filtered = filterObj(object[key], filter, rule);
          if (Object.keys(filtered).length > 0) {
            result[key] = filtered;
          }
        }
      });
      return rule === "loose" ? object : result;
    }
  
    function enableEventTitleEdit(title, urlIndex, eventIndex) {
      state.isEventEditEnabled = {
        toggle: true,
        urlIndex,
        eventIndex
      };
      
      // In a real implementation, you'd need to find the specific input element
      // and focus it. This is simplified for the example.
      setTimeout(() => {
        const input = document.querySelector(`input[data-url="${urlIndex}"][data-event="${eventIndex}"]`);
        if (input) input.focus();
      }, 0);
    }
  
    function disableEventTitleEdit() {
      state.isEventEditEnabled.toggle = false;
    }
  
    function editEventTitle(newTitle, urlIndex, eventIndex) {
      if (options.onEditEventTitle) {
        options.onEditEventTitle(newTitle, urlIndex, eventIndex);
      }
      disableEventTitleEdit();
    }
  
    function collapseAll() {
      // Simplified - in a real implementation, you'd need to:
      // 1. Collapse all accordions
      // 2. Hide all JSON view items except root items
      // 3. Update arrow icons
      console.log('Collapse all functionality');
    }
  
    function expandAll() {
      // Simplified - opposite of collapseAll
      console.log('Expand all functionality');
    }
  
    function expandTree(event) {
      // Simplified - expand a specific tree
      console.log('Expand tree functionality');
    }
  
    function collapseTree(event) {
      // Simplified - collapse a specific tree
      console.log('Collapse tree functionality');
    }
  
    function toggleSettingsPanel() {
      dlSettings.style.display = dlSettings.style.display === 'none' ? 'block' : 'none';
    }
  
    function resetData() {
      if (!state.isInspecting) {
        if (options.onResetData) options.onResetData();
      } else if (options.onNotification) {
        options.onNotification({
          type: 'warning',
          title: 'Cannot Clear Data While Inspection Mode is on',
          message: 'Please turn off inspection mode before clearing the data.'
        });
      }
    }
  
    // Initialize
    renderDataLayers();
  
    // Public API
    return {
      element: panel,
      updateData(newData) {
        state.data = newData;
        renderDataLayers();
      },
      setIsInspecting(inspecting) {
        state.isInspecting = inspecting;
        controlBar.setIsInspecting(inspecting);
      },
      setSearchFilter(filter) {
        state.searchFilter = filter;
        renderDataLayers();
      }
    };
  }