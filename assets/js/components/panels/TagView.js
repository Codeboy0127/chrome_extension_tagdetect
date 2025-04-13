// tag-view.js - Complete Vanilla JS Implementation
class TagViewManager {
    constructor() {
      this.state = {
        tags: [],
        newTitle: "",
        isEventEditEnabled: { toggle: false, urlIndex: 0, eventIndex: 0 },
        searchFilter: "",
        searchResultCount: 0,
        searchFilterIndex: -1,
        searchHits: [],
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
        },
        data: [],
        occurences: [],
        isInspecting: false,
        listOrder: "ASC"
      };
  
      this.init();
    }
  
    // Initialization
    async init() {
      this.renderUI();
      this.setupEventListeners();
    }
  
    // DOM Rendering
    renderUI() {
      const appContainer = document.createElement('div');
      appContainer.className = 'panel';
      appContainer.innerHTML = `
        <div class="panel-top">
          <div class="search-box" id="search-box-container"></div>
          <span id="search-result-counter"></span>
          <div id="control-bar-container"></div>
        </div>
        <div class="tag-settings" id="tag-settings-container"></div>
        <div class="tag-panel ${this.state.listOrder.toLowerCase()}" id="tags-container"></div>
      `;
      document.body.appendChild(appContainer);
  
      this.renderSearchBox();
      this.renderControlBar();
      this.renderTags();
    }
  
    renderSearchBox() {
      const container = document.getElementById('search-box-container');
      container.innerHTML = `
        <button class="sec-btn search-nav-btn" id="search-prev-btn">Previous</button>
        <button class="sec-btn search-nav-btn" id="search-next-btn">Next</button>
      `;
    }
  
    renderControlBar() {
      const container = document.getElementById('control-bar-container');
      container.innerHTML = `
        <div class="control-bar">
          <button class="control-btn" id="inspect-btn">${this.state.isInspecting ? 'Stop Inspection' : 'Inspect'}</button>
          <button class="control-btn" id="reset-btn">Reset</button>
          <button class="control-btn" id="collapse-btn">Collapse All</button>
          <button class="control-btn" id="expand-btn">Expand All</button>
          <button class="control-btn" id="export-btn">Export</button>
          <button class="control-btn" id="settings-btn">Settings</button>
        </div>
      `;
    }
  
    renderTags() {
      const container = document.getElementById('tags-container');
      container.innerHTML = '';
  
      this.state.data.forEach((url, urlIndex) => {
        const urlAccordion = this.createUrlAccordion(url, urlIndex);
        container.appendChild(urlAccordion);
      });
    }
  
    createUrlAccordion(url, urlIndex) {
      const accordion = document.createElement('div');
      accordion.className = 'accordion';
      accordion.innerHTML = `
        <h3 class="accordion-header">${url.pageUrl}</h3>
        <div class="accordion-content">
          ${url.events ? this.renderEvents(url.events, urlIndex) : '<p>No recorded events</p>'}
        </div>
      `;
      return accordion;
    }
  
    renderEvents(events, urlIndex) {
      return events.slice().reverse().map((event, eventIndex) => {
        return `
          <div class="accordion event-accordion">
            <h3 class="accordion-header">
              ${event.name}
              ${this.getEventEditControls(urlIndex, eventIndex, event.name)}
            </h3>
            <div class="accordion-content">
              ${event.tags ? this.renderTagsList(event.tags, urlIndex, eventIndex) : '<p>No recorded tags</p>'}
            </div>
          </div>
        `;
      }).join('');
    }
  
    getEventEditControls(urlIndex, eventIndex, currentTitle) {
      return `
        <div class="event-edit-controls">
          ${this.state.isEventEditEnabled.toggle && 
            this.state.isEventEditEnabled.urlIndex === urlIndex && 
            this.state.isEventEditEnabled.eventIndex === eventIndex ?
            `<input type="text" class="event-title-input" value="${currentTitle}" 
                   data-url-index="${urlIndex}" data-event-index="${eventIndex}">` : ''}
          <svg class="edit-icon" data-url-index="${urlIndex}" data-event-index="${eventIndex}" 
               data-current-title="${currentTitle}" viewBox="0 0 512 512">
            <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/>
          </svg>
        </div>
      `;
    }
  
    renderTagsList(tags, urlIndex, eventIndex) {
      return tags.map((tag, tagIndex) => {
        const tagTitle = `${tag.name}${tag.content.tid ? ' - ' + tag.content.tid : ''}${tag.content.en ? ' - ' + tag.content.en : ''}`;
        const timeDiff = `(${tag.timeStamp - tags[0].timeStamp})ms`;
        
        return `
          <div class="accordion tag-accordion">
            <h3 class="accordion-header">
              ${tagTitle}
              <span class="time-diff">${timeDiff}</span>
              ${tag.icon ? `<img class="tag-icon" src="../../../images/regex_icons/${tag.icon}" alt="">` : ''}
            </h3>
            <div class="accordion-content">
              ${this.renderTagContent(tag.content, urlIndex, eventIndex, tagIndex)}
              ${this.renderTagPayload(tag.payload, urlIndex, eventIndex, tagIndex)}
            </div>
          </div>
        `;
      }).join('');
    }
  
    renderTagContent(content, urlIndex, eventIndex, tagIndex) {
      const contentItems = Object.entries(content).map(([key, value]) => {
        const highlightedKey = this.highlightSearchTerm(key);
        const highlightedValue = this.highlightSearchTerm(value.toString());
        
        return `
          <li class="tag-param">
            <span class="param-key">${highlightedKey}</span>
            <span class="param-value">${highlightedValue}</span>
          </li>
        `;
      }).join('');
      
      return `<ul class="tag-params">${contentItems}</ul>`;
    }
  
    renderTagPayload(payloads, urlIndex, eventIndex, tagIndex) {
      if (!payloads || payloads.length === 0) return '';
      
      return payloads.map((payload, payloadIndex) => {
        const payloadItems = Object.entries(payload).map(([key, value]) => {
          const highlightedKey = this.highlightSearchTerm(key);
          const formattedValue = this.formatJsonValue(value);
          const highlightedValue = this.highlightSearchTerm(formattedValue);
          
          return `
            <li class="tag-param">
              <span class="param-key">${highlightedKey}</span>
              <span class="param-value">${highlightedValue}</span>
            </li>
          `;
        }).join('');
        
        return `
          <div class="payload-section">
            <h4 class="payload-title">Payload analytics events ${payloadIndex + 1}</h4>
            <ul class="tag-params">${payloadItems}</ul>
          </div>
        `;
      }).join('');
    }
  
    // Helper Methods
    highlightSearchTerm(text) {
      if (!this.state.searchFilter) return text;
      
      const regex = new RegExp(this.state.searchFilter, 'gi');
      return text.replace(regex, match => 
        `<span class="search-hit">${match}</span>`
      );
    }
  
    formatJsonValue(value) {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return value;
      }
    }
  
    // Event Handlers
    setupEventListeners() {
      // Search navigation
      document.getElementById('search-prev-btn').addEventListener('click', () => this.searchPrev());
      document.getElementById('search-next-btn').addEventListener('click', () => this.searchNext());
      
      // Control bar
      document.getElementById('inspect-btn').addEventListener('click', () => this.toggleInspection());
      document.getElementById('reset-btn').addEventListener('click', () => this.resetData());
      document.getElementById('collapse-btn').addEventListener('click', () => this.collapseAll());
      document.getElementById('expand-btn').addEventListener('click', () => this.expandAll());
      document.getElementById('export-btn').addEventListener('click', () => this.exportData());
      document.getElementById('settings-btn').addEventListener('click', () => this.toggleSettingsPanel());
      
      // Event title editing
      document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-icon')) {
          const icon = e.target.closest('.edit-icon');
          const urlIndex = parseInt(icon.dataset.urlIndex);
          const eventIndex = parseInt(icon.dataset.eventIndex);
          const currentTitle = icon.dataset.currentTitle;
          this.enableEventTitleEdit(currentTitle, urlIndex, eventIndex);
        }
      });
      
      document.addEventListener('change', (e) => {
        if (e.target.classList.contains('event-title-input')) {
          const input = e.target;
          const urlIndex = parseInt(input.dataset.urlIndex);
          const eventIndex = parseInt(input.dataset.eventIndex);
          this.editEventTitle(input.value, urlIndex, eventIndex);
        }
      });
      
      // Search filter
      document.addEventListener('input', (e) => {
        if (e.target.id === 'search-filter-input') {
          this.state.searchFilter = e.target.value;
          this.updateSearch();
        }
      });
    }
  
    // Core Functionality
    updateSearch() {
      const searchHits = document.querySelectorAll('.search-hit');
      this.state.searchResultCount = searchHits.length;
      
      document.getElementById('search-result-counter').textContent = 
        this.state.searchResultCount > 0 ? 
        `(${this.state.searchFilterIndex + 1}/${this.state.searchResultCount})` : '';
      
      if (this.state.searchResultCount > 0) {
        document.getElementById('search-box-container').classList.add('active');
      } else {
        document.getElementById('search-box-container').classList.remove('active');
      }
      
      // Update tags list based on search
      const filteredTags = this.state.data
        .flatMap(url => url.events || [])
        .flatMap(event => event.tags || [])
        .filter(tag => 
          Object.values(tag.content).some(value => 
            value.toString().toLowerCase().includes(this.state.searchFilter.toLowerCase())
          )
        )
        .map(tag => tag.name);
      
      this.state.tags = [...new Set(filteredTags)]; // Unique tags
      this.renderTags();
    }
  
    searchNext() {
      if (this.state.searchResultCount > 0) {
        this.expandAll();
        this.state.searchFilterIndex = 
          (this.state.searchFilterIndex + 1) % this.state.searchResultCount;
        this.scrollToSearchHit();
      }
    }
  
    searchPrev() {
      if (this.state.searchResultCount > 0) {
        this.expandAll();
        this.state.searchFilterIndex = 
          this.state.searchFilterIndex - 1 < 0 ? 
          this.state.searchResultCount - 1 : 
          this.state.searchFilterIndex - 1;
        this.scrollToSearchHit();
      }
    }
  
    scrollToSearchHit() {
      const hits = document.querySelectorAll('.search-hit');
      if (hits.length > 0 && this.state.searchFilterIndex >= 0) {
        const currentHit = hits[this.state.searchFilterIndex];
        
        // Remove highlight from all hits
        hits.forEach(hit => hit.classList.remove('current-hit'));
        
        // Highlight current hit
        currentHit.classList.add('current-hit');
        
        // Scroll to hit
        currentHit.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  
    enableEventTitleEdit(title, urlIndex, eventIndex) {
      this.state.newTitle = title;
      this.state.isEventEditEnabled = {
        toggle: true,
        urlIndex,
        eventIndex
      };
      this.renderTags();
      
      // Focus the input field
      setTimeout(() => {
        const input = document.querySelector('.event-title-input');
        if (input) input.focus();
      }, 0);
    }
  
    disableEventTitleEdit() {
      this.state.isEventEditEnabled.toggle = false;
      this.renderTags();
    }
  
    editEventTitle(newTitle, urlIndex, eventIndex) {
      // Emit event to parent or update state
      console.log('Event title changed:', newTitle, urlIndex, eventIndex);
      this.disableEventTitleEdit();
    }
  
    collapseAll() {
      document.querySelectorAll('.accordion-content').forEach(content => {
        content.style.display = 'none';
      });
    }
  
    expandAll() {
      document.querySelectorAll('.accordion-content').forEach(content => {
        content.style.display = 'block';
      });
    }
  
    toggleSettingsPanel() {
      const panel = document.getElementById('tag-settings-container');
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  
    exportData() {
      // Implement export functionality
      console.log('Exporting data...');
    }
  
    toggleInspection() {
      this.state.isInspecting = !this.state.isInspecting;
      this.renderControlBar();
      // Emit event to parent
      console.log('Inspection toggled:', this.state.isInspecting);
    }
  
    resetData() {
      if (!this.state.isInspecting) {
        // Emit event to parent
        console.log('Resetting data...');
      } else {
        this.showNotification(
          'Cannot Clear Data While Inspection Mode is on',
          'Please turn off inspection mode before clearing the data.',
          'warning'
        );
      }
    }
  
    showNotification(title, message, type) {
      // Implement notification system
      console.warn(`${type}: ${title} - ${message}`);
    }
  }
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    new TagViewManager();
  });