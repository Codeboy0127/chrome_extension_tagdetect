// tag-view.js - Vanilla JS implementation of TagView component
import { createControlBar } from '../ControlBar.js';
import { createDropdown } from '../Dropdown.js';
import { createAccordion } from '../Accordion.js';
import { createReadMore } from '../ReadMore.js';
import { createTagSettings } from '../settings/TagSettings.js';
import { pageInteractionEvent } from '../../google-analytics.js';

function loadTagViewStyles() {
  if (!document.getElementById('TagView-styles')) {
    const link = document.createElement('link');
    link.id = 'TagView-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/panels/TagView.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

export function createTagView(options = {}) {
  loadTagViewStyles();

  // Create main container
  const panel = document.createElement('div');
  panel.className = 'panel';
  // State
  let state = {
    isInspecting: options.isInspecting || false,
    data: options.data || [],
    listOrder: options.listOrder || 'ASC',
    occurrences: options.occurrences || [],
    tags: [],
    newTitle: "",
    isEventEditEnabled: { toggle: false, urlIndex: 0, eventIndex: 0 },
    searchFilter: "",
    searchResultCount: 0,
    searchFilterIndex: -1,
    searchHits: [],
    selectedFilters: [],
    count: 0,
    controlBar: {
      record: true,
      clear: true,
      collapse: true,
      expand: true,
      save: true,
      import: false,
      settings: true,
      tabIndex: 0
    }
  };

  // Create DOM elements
  const panelTop = document.createElement('div');
  panelTop.className = 'panel-top';

  // Create search box
  const searchBox = document.createElement('div');
  searchBox.className = 'search-box';

  // const prevButton = document.createElement('button');
  // prevButton.className = 'sec-btn';
  // prevButton.style.padding = '0 1rem';
  // prevButton.textContent = 'Previous';
  // prevButton.addEventListener('click', searchPrev);

  // const nextButton = document.createElement('button');
  // nextButton.className = 'sec-btn';
  // nextButton.style.padding = '0 1rem';
  // nextButton.textContent = 'Next';
  // nextButton.addEventListener('click', searchNext);

  // searchBox.append(prevButton, nextButton);

  const filterBox = createDropdown((selectedFilters) => {
    console.log('Selected filters:', selectedFilters);
    // Update state and rerender data based on selected filters
    state.selectedFilters = selectedFilters;
    renderData();
  }).element;

  const searchCount = document.createElement('span');
  searchCount.style.display = 'none';

  // Initialize Control Bar
  const controlBar = createControlBar({
    controlBar: state.controlBar,
    isInspecting: state.isInspecting,
    panel: 'Tags View',
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

  panelTop.append(searchBox, searchCount,filterBox, controlBar.element);

  // Create tag settings
  const tagSettings = createTagSettings().element;
  // Create tag panel
  const tagPanel = document.createElement('div');
  tagPanel.className = `tag-panel ${state.listOrder.toLowerCase()}`;

  // Assemble panel
  panel.append(panelTop, tagSettings, tagPanel);

  // Render data
  function renderData() {
    tagPanel.innerHTML = '';
    
    state.data.forEach((url, urlIndex) => {
      const urlAccordion = createAccordion({
        id: `tech-${urlIndex}`,
        styling: 'rounded gray-header accordion-shadow',
        title: url.pageUrl,
        content: renderEvents(url.events, urlIndex),
        date: url.events[0].timeStamp
      });
      
      tagPanel.appendChild(urlAccordion.element);
    });
    
    updateSearchCountDisplay();
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
      const originalIndex = state.listOrder === 'ASC' ? eventIndex : events.length - eventIndex - 1;
      const eventAccordion = createAccordion({
        id: `tech-${urlIndex}-${eventIndex}`,
        styling: 'rounded green-header accordion-shadow',
        title: event.name,
        editTitleSlot: renderEditTitle(event.name, urlIndex, originalIndex),
        content: renderTags(event.tags, urlIndex, originalIndex)
      });
      
      container.appendChild(eventAccordion.element);
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

  function renderTags(tags, urlIndex, eventIndex) {
    const container = document.createElement('div');
    
    if (!tags || tags.length === 0) {
      const noTags = document.createElement('p');
      noTags.textContent = 'No recorded tags';
      container.appendChild(noTags);
      return container;
    }
    // tags.filter(tag => FileSystemWritableFileStream.indexof(tag.name));
    // Filter tags based on selected filters
    const filteredTags = state.selectedFilters && state.selectedFilters.length > 0
      ? tags.filter(tag => state.selectedFilters.includes(tag.name.toLowerCase().replace(/\s+/g, '-')))
      : tags;

    if (filteredTags.length === 0) {
      const noTags = document.createElement('p');
      noTags.textContent = 'No tags match the selected filters';
      container.appendChild(noTags);
      return container;
    }
    filteredTags.forEach((tag, index) => {

      const title = `${tag.name}${tag.content.tid ? ' - ' + tag.content.tid : ''}${tag.content.en ? ' - ' + tag.content.en : ''}`;
      const time = `(${tag.timeStamp - tags[eventIndex].timeStamp})ms`;
      
      const tagAccordion = createAccordion({
        id: `tech-${urlIndex}-${eventIndex}-${index}`,
        styling: 'flat rounded accordion-border',
        title: title,
        time: time,
        hasHorizontalLine: true,
        iconSlot: tag.icon ? renderTagIcon(tag.icon) : null,
        extraSlot: state.occurrences ? renderOccurrences(tag.name) : null,
        content: renderTagContent(tag, urlIndex, eventIndex, index)
      });
      
      container.appendChild(tagAccordion.element);
    });
    
    return container;
  }

  function renderTagIcon(icon) {
    const img = document.createElement('img');
    img.className = 'tag-icon';
    img.src = chrome.runtime.getURL(`/assets/images/regex_icons/${icon}`);
    img.alt = '';
    return img;
  }

  function renderOccurrences(tagName) {
    const container = document.createElement('h4');
    container.style.color = '#414141';
    
    const label = document.createElement('span');
    label.style.fontSize = 'xx-small';
    label.style.fontWeight = '300';
    label.textContent = 'Found on';
    
    const br = document.createElement('br');
    
    const count = document.createElement('span');
    count.style.fontSize = 'small';
    count.style.fontWeight = '400';
    count.textContent = `${state.occurrences[tagName].occurrences?state.occurrences[tagName].occurrences:state.data.length}/${state.data.length} pages`;
    
    container.append(label, br, count);
    return container;
  }

  function renderTagContent(tag, urlIndex, eventIndex, tagIndex) {
    const container = document.createElement('div');
    
    // Render tag params
    const paramsList = document.createElement('ul');
    paramsList.className = 'tag-params';
    
    Object.entries(tag.content).forEach(([key, value], contentIndex) => {
      const li = document.createElement('li');
      
      if (state.searchFilter.length === 0) {
        const keySpan = document.createElement('span');
        keySpan.id = `tech-${urlIndex}-${eventIndex}-${tagIndex}-${contentIndex}-key`;
        keySpan.textContent = key;
        
        const readMore = createReadMore(value.toString());
        readMore.element.id = `tech-${urlIndex}-${eventIndex}-${tagIndex}-${contentIndex}-value`;
        
        li.append(keySpan, readMore.element);
      } else {
        const keyContainer = document.createElement('span');
        key.split(state.searchFilter).forEach((part, i, parts) => {
          keyContainer.appendChild(document.createTextNode(part));
          if (i < parts.length - 1) {
            const hit = document.createElement('span');
            hit.className = 'search-hit';
            hit.textContent = state.searchFilter;
            hit.style.whiteSpace = 'nowrap';
            keyContainer.appendChild(hit);
          }
        });
        keyContainer.appendChild(document.createTextNode(': '));
        
        const valueContainer = document.createElement('span');
        value.toString().split(state.searchFilter).forEach((part, i, parts) => {
          valueContainer.appendChild(document.createTextNode(part));
          if (i < parts.length - 1) {
            const hit = document.createElement('span');
            hit.className = 'search-hit';
            hit.textContent = state.searchFilter;
            valueContainer.appendChild(hit);
          }
        });
        
        li.append(keyContainer, valueContainer);
      }
      
      paramsList.appendChild(li);
    });
    
    container.appendChild(paramsList);
    
    // Render payload if exists
    if (tag.payload && tag.payload.length > 0) {
      const payloadDiv = document.createElement('div');
      if (state.searchFilter.length === 0) payloadDiv.style.display = 'none';
      
      tag.payload.forEach((payload, payloadIndex) => {
        const payloadList = document.createElement('ul');
        payloadList.className = 'tag-params';
        
        const title = document.createElement('h4');
        title.className = 'payload-title';
        title.textContent = `Payload analytics events ${payloadIndex + 1}`;
        
        payloadList.appendChild(title);
        
        Object.entries(payload).forEach(([key, value], contentIndex) => {
          const li = document.createElement('li');
          
          if (state.searchFilter.length === 0) {
            const keySpan = document.createElement('span');
            keySpan.id = `tech-${urlIndex}-${eventIndex}-${tagIndex}-${contentIndex}-key`;
            keySpan.textContent = `${key}:`;
            
            const valueSpan = document.createElement('span');
            valueSpan.id = `tech-${urlIndex}-${eventIndex}-${tagIndex}-${contentIndex}-value`;
            valueSpan.style.whiteSpace = 'pre';
            valueSpan.style.textWrap = 'wrap';
            valueSpan.textContent = jsonSyntax(value);
            
            li.append(keySpan, valueSpan);
          } else {
            const keyContainer = document.createElement('span');
            key.split(state.searchFilter).forEach((part, i, parts) => {
              keyContainer.appendChild(document.createTextNode(part));
              if (i < parts.length - 1) {
                const hit = document.createElement('span');
                hit.className = 'search-hit';
                hit.textContent = state.searchFilter;
                hit.style.whiteSpace = 'nowrap';
                keyContainer.appendChild(hit);
              }
            });
            keyContainer.appendChild(document.createTextNode(': '));
            
            const valueContainer = document.createElement('span');
            const valueStr = typeof value === 'object' ? JSON.stringify(value) : value.toString();
            valueStr.split(state.searchFilter).forEach((part, i, parts) => {
              valueContainer.appendChild(document.createTextNode(part));
              if (i < parts.length - 1) {
                const hit = document.createElement('span');
                hit.className = 'search-hit';
                hit.textContent = state.searchFilter;
                valueContainer.appendChild(hit);
              }
            });
            
            li.append(keyContainer, valueContainer);
          }
          
          payloadList.appendChild(li);
        });
        
        payloadDiv.appendChild(payloadList);
      });
      
      container.appendChild(payloadDiv);
    }
    
    return container;
  }

  // Helper functions
  function jsonSyntax(str) {
    try {
      const data = JSON.parse(str);
      return `${JSON.stringify(data, undefined, 4)}`;
    } catch (e) {
      return str;
    }
  }

  function updateSearchCountDisplay() {
    const hits = panel.querySelectorAll('.search-hit');
    state.searchResultCount = hits.length;
    
    if (state.searchResultCount > 0) {
      searchCount.style.display = '';
      searchCount.textContent = `(${state.searchFilterIndex + 1}/${state.searchResultCount})`;
      searchBox.classList.add('active');
    } else {
      searchCount.style.display = 'none';
      searchBox.classList.remove('active');
    }
  }

  // Main methods
  function splitString(str, delimiter) {
    let result = [];
    let temp = "";
    for (let i = 0; i < str.length; i++) {
      if (str[i] === delimiter) {
        result.push(temp);
        result.push(delimiter);
        temp = "";
      } else {
        temp += str[i];
      }
    }
    result.push(temp);
    return result;
  }

  function updateSearch() {
    const hits = panel.querySelectorAll('.search-hit');
    state.searchResultCount = hits.length;
    updateSearchCountDisplay();
    
    // Filter tags based on search
    const result = state.data
      .flatMap(url => url.events || [])
      .flatMap(event => event.tags || [])
      .filter(tag => 
        Object.values(tag.content).some(value => 
          value.toString().toLowerCase().includes(state.searchFilter.toLowerCase())
        )
      )
      .map(tag => tag.name);
    
    state.tags = result;
    renderData();
  }

  function searchPrev() {
    pageInteractionEvent("Tags View", "search_previous");
    const hits = panel.querySelectorAll('.search-hit');
    if (hits.length > 0) {
      expandAll();
      state.searchFilterIndex = state.searchFilterIndex - 1 < 0 ? 
        state.searchResultCount - 1 : state.searchFilterIndex - 1;
      scrollToHit(hits[state.searchFilterIndex]);
      updateCurrentHit(hits);
    }
  }

  function searchNext() {
    pageInteractionEvent("Tags View", "search_next");
    const hits = panel.querySelectorAll('.search-hit');
    if (hits.length > 0) {
      expandAll();
      state.searchFilterIndex = (state.searchFilterIndex + 1) % state.searchResultCount;
      scrollToHit(hits[state.searchFilterIndex]);
      updateCurrentHit(hits);
    }
  }

  function scrollToHit(element) {
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = absoluteElementTop - (window.innerHeight / 2);
      window.scrollTo({
        top: middle,
        behavior: 'smooth'
      });
    }
  }

  function updateCurrentHit(hits) {
    panel.querySelectorAll('.current-hit').forEach(el => {
      el.classList.remove('current-hit');
    });
    if (hits[state.searchFilterIndex]) {
      hits[state.searchFilterIndex].classList.add('current-hit');
    }
    updateSearchCountDisplay();
  }

  function searchFocus() {
    pageInteractionEvent("Tags View", "search_focus");
  }

  function search() {
    const hits = panel.querySelectorAll('.search-hit');
    if (hits.length > 0) {
      expandAll();
      state.searchFilterIndex = 0;
      scrollToHit(hits[0]);
      updateCurrentHit(hits);
    }
  }

  function enableEventTitleEdit(title, urlIndex, eventIndex) {
    state.newTitle = title;
    state.isEventEditEnabled = {
      toggle: true,
      urlIndex,
      eventIndex
    };
    renderData();
    
    setTimeout(() => {
      const input = panel.querySelector(`input[type="text"]`);
      if (input) input.focus();
    }, 0);
  }

  function disableEventTitleEdit() {
    state.isEventEditEnabled.toggle = false;
    renderData();
  }

  function editEventTitle(event, urlIndex, eventIndex) {
    if (options.onEditEventTitle) {
      options.onEditEventTitle(event.target.value, urlIndex, eventIndex);
    }
    disableEventTitleEdit();
  }

  function collapseAll() {
    const accordions = panel.querySelectorAll('.tag-panel .accordion');
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
  }

  function expandAll() {
    const accordions = panel.querySelectorAll('.tag-panel .accordion');
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
  }

  function toggleSettingsPanel() {
    const settingsPanel = panel.querySelector('.tag-settings-panel');
    console.log(settingsPanel, panel)
    if (settingsPanel) {
      settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    }
  }

  function resetData() {
    if (!state.isInspecting) {
      if (options.onResetData) options.onResetData();
    } else if (options.onNotification) {
      options.onNotification({
        type: "warning",
        title: "Cannot Clear Data While Inspection Mode is on",
        message: "Please turn off inspection mode before clearing the data."
      });
    }
  }

  // Initialize
  renderData();

  // Public API
  return {
    element: panel,
    updateData(newData) {
      state.data = newData;
      renderData();
    },
    setOccurrences(occurrences) {
      state.occurrences = occurrences;
      renderData();
    },
    setIsInspecting(inspecting) {
      state.isInspecting = inspecting;
      controlBar.setIsInspecting(inspecting);
    },
    setSearchFilter(filter) {
      state.searchFilter = filter;
      updateSearch();
    }
  };
}

