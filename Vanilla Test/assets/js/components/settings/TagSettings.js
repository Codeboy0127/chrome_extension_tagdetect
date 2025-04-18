// tag-settings.js - Vanilla JS implementation of TagSettings component
import { createModal } from "../Modal.js";
import { pageInteractionEvent } from "../../google-analytics.js";

// Function to dynamically load the CSS file
function loadTagSettingsStyles() {
  if (!document.getElementById('TagSettings-styles')) {
    const link = document.createElement('link');
    link.id = 'TagSettings-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/settings/TagSettings.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

export function createTagSettings(options = {}) {
    // Ensure the CSS is loaded
    loadTagSettingsStyles();

    // Create main container
    const panel = document.createElement('div');
    panel.className = 'tag-settings-panel settings-panel custom-scrollbar';

    // State
    let state = {
        RegExIdToEdit: -1,
        showModal: false,
        errors: [],
        regExPatterns: [],
        regexName: '',
        regexPattern: '',
        tags: options.tags || [],
        query: options.query || ''
    };

    // Create "Add" and "Delete" buttons container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    // Create "Add" button
    const addButton = document.createElement('button');
    addButton.className = 'add-button';
    addButton.textContent = 'Add';
    addButton.addEventListener('click', () => {
        // Open the modal for adding a new regex
        editRegex(-1); // Pass -1 to indicate a new regex
    });

    // Create "Delete" button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        // Delete all selected regex patterns
        const selectedPatterns = state.regExPatterns.filter((regEx) => !regEx.ignore);
        if (selectedPatterns.length === 0) {
            alert('No regex patterns selected for deletion.');
            return;
        }

        if (confirm('Are you sure you want to delete the selected regex patterns?')) {
            state.regExPatterns = state.regExPatterns.filter((regEx) => regEx.ignore);
            updateRegex();
        }
    });

    // Append buttons to the container
    buttonContainer.appendChild(addButton);
    buttonContainer.appendChild(deleteButton);

    // Create "Select All" checkbox
    const selectAllContainer = document.createElement('div');
    selectAllContainer.className = 'select-all-container';

    const selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.id = 'select-all-checkbox';

    const selectAllLabel = document.createElement('label');
    selectAllLabel.htmlFor = 'select-all-checkbox';
    selectAllLabel.textContent = 'Select All';

    selectAllContainer.appendChild(selectAllCheckbox);
    selectAllContainer.appendChild(selectAllLabel);

    // Add event listener for "Select All" functionality
    selectAllCheckbox.addEventListener('change', (event) => {
      const isChecked = event.target.checked;
      // Update all tag checkboxes
      state.regExPatterns.forEach((regEx, index) => {
        regEx.ignore = !isChecked; // Set ignore to false if checked, true if unchecked
      });

      // Re-render the regex patterns to reflect the changes
      renderRegexPatterns();
      updateRegex();
    });
    buttonContainer.prepend(selectAllContainer); // Append "Select All" checkbox to the button container
      // Append button container to the panel
      panel.prepend(buttonContainer);

    // Create regex manager container
    const regexManager = document.createElement('div');
    regexManager.className = 'regex-manager';

    // Create regex table container
    const regexTableContainer = document.createElement('div');
    regexTableContainer.className = 'regex-table-container';

    const regexTableWrapper = document.createElement('div');
    regexTableWrapper.className = 'regex-table-wrapper';

    regexTableContainer.appendChild(regexTableWrapper);
    regexManager.appendChild(regexTableContainer);

    // Create modal
    const modal = createModal();
    modal.element.style.display = 'none';

    // Assemble panel
    panel.append(regexManager, modal.element);

    // Helper functions
    function renderRegexPatterns() {
      regexTableWrapper.innerHTML = '';

      // Check if all tags are selected
      const allSelected = state.regExPatterns.every((regEx) => !regEx.ignore);
      selectAllCheckbox.checked = allSelected;

      getFilteredRegExPatterns().forEach((regEx, index) => {
        const regexAcc = document.createElement('div');
        regexAcc.className = 'regex-acc';

        // Create header
        const header = document.createElement('div');
        header.className = 'regex-acc-header';

        const leftDiv = document.createElement('div');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !regEx.ignore; // Checked if not ignored
        checkbox.addEventListener('click', (e) => toggleRegex(e, index));

        leftDiv.appendChild(checkbox);

        if (regEx.iconPath) {
          const icon = document.createElement('img');
          icon.className = 'regex-icon';
          icon.src = getIconPath(index);
          leftDiv.appendChild(icon);
        }

        const name = document.createElement('p');
        name.textContent = regEx.name;
        leftDiv.appendChild(name);

        const rightDiv = document.createElement('div');

        if (regEx.canBeDeleted) {
          const actionsDiv = document.createElement('div');
          actionsDiv.style.display = 'flex';
          actionsDiv.style.gap = '1.5rem';

          const editBtn = document.createElement('div');
          editBtn.className = 'regex-action';
          editBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
              <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"/>
            </svg>
          `;
          editBtn.addEventListener('click', () => editRegex(index));

          const deleteBtn = document.createElement('div');
          deleteBtn.className = 'regex-action';
          deleteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
              <path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/>
            </svg>
          `;
          deleteBtn.addEventListener('click', () => deleteRegex(index));

          actionsDiv.append(editBtn, deleteBtn);
          rightDiv.appendChild(actionsDiv);
        }

        const accBtn = document.createElement('span');
        accBtn.className = 'acc-btn';
        accBtn.addEventListener('click', toggleAccordion);
        rightDiv.appendChild(accBtn);

        header.append(leftDiv, rightDiv);
        regexAcc.appendChild(header);

        // Create content
        const content = document.createElement('div');
        content.className = 'regex-acc-content';

        const pattern = document.createElement('p');
        pattern.style.padding = '1rem 0';
        pattern.textContent = regEx.pattern;
        content.appendChild(pattern);

        regexAcc.appendChild(content);
        regexTableWrapper.appendChild(regexAcc);
      });
    }

    function getFilteredRegExPatterns() {
      if (!state.query.length) return state.regExPatterns;
      return state.regExPatterns.filter(item => 
        state.tags.includes(item.name)
      );
    }

    function toggleAccordion(event) {
      const container = event.target.closest('.regex-acc');
      const content = container.querySelector('.regex-acc-content');
      container.classList.toggle("active");

      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = '100px';
      }
    }

    function closeModal() {
      state.RegExIdToEdit = -1;
      state.regexName = '';
      state.regexPattern = '';
      state.showModal = false;
      modal.close();
    }

    function editRegex(id) {
      state.RegExIdToEdit = id;
      state.regexName = state.regExPatterns[id]?.name || '';
      state.regexPattern = state.regExPatterns[id]?.pattern || '';
      state.showModal = true;

      modal.updateContent({
        header: '<h3>Add new Regex Pattern</h3>',
        body: `
          <div class="add-regex-fields">
            <div>
              <input type="text" id="regexName" name="regexName" placeholder="Pattern Name" value="${state.regexName}">
            </div>
            <div>
              <input type="text" id="regexPattern" name="regexPattern" placeholder="Regex Pattern" value="${state.regexPattern}">
            </div>
            <div id="error-messages"></div>
          </div>
        `,
        footer: `
          <button class="primary-btn">${state.RegExIdToEdit >= 0 ? 'Edit' : 'Add'}</button>
          <button class="btn">Cancel</button>
        `
      });

      modal.element.querySelector('.primary-btn').addEventListener('click', addRegexPattern);
      modal.element.querySelector('.btn').addEventListener('click', closeModal);

      modal.element.querySelector('#regexName').addEventListener('input', (e) => {
        state.regexName = e.target.value;
      });

      modal.element.querySelector('#regexPattern').addEventListener('input', (e) => {
        state.regexPattern = e.target.value;
      });

      modal.open();
    }

    function fetchRegExPatterns() {
      chrome.storage.local.get(["regExPatterns"]).then((result) => {
        state.regExPatterns = result.regExPatterns || [];
        renderRegexPatterns();
      });
    }

    function isRegExValid() {
      try {
        new RegExp(state.regexPattern);
        return true;
      } catch (e) {
        return false;
      }
    }

    function addRegexPattern() {
      pageInteractionEvent("Tags View", "settings_add_new_regex_pattern");
      state.errors = [];

      // Validate inputs
      if (!state.regexName) {
        state.errors.push('Regex Name required.');
      }
      if (!state.regexPattern) {
        state.errors.push('Regex Pattern required.');
      }
      if (!isRegExValid()) {
        state.errors.push('Regex Pattern invalid.');
      }

      // Show errors or proceed
      const errorContainer = modal.element.querySelector('#error-messages');
      if (state.errors.length > 0) {
        errorContainer.innerHTML = `
          <p style="font-size: small;">
            <span style="font-weight: 300;">Please correct the following error(s):</span>
            <ul>
              ${state.errors.map(error => `<li style="font-weight: 200; color: brown;">${error}</li>`).join('')}
            </ul>
          </p>
        `;
        return;
      }

      // Add or edit pattern
      const id = state.RegExIdToEdit >= 0 ? state.RegExIdToEdit : state.regExPatterns.length;
      const newPattern = {
        id: id,
        name: state.regexName,
        pattern: state.regexPattern,
        ignore: false,
        canBeDeleted: true
      };

      if (state.RegExIdToEdit >= 0) {
        state.regExPatterns[id] = newPattern;
      } else {
        state.regExPatterns.push(newPattern);
      }

      updateRegex();
      closeModal();
    }

    function deleteRegex(id) {
      state.regExPatterns.splice(id, 1);
      updateRegex();
    }

    function updateRegex() {
      chrome.storage.local.set({ regExPatterns: state.regExPatterns });
      renderRegexPatterns();
    }

    function getIconPath(index) {
      if (state.regExPatterns[index]?.iconPath) {
        return chrome.runtime.getURL('assets/images/regex_icons/' + state.regExPatterns[index].iconPath);
      }
      return '';
    }

    function toggleRegex(event, index) {
      const ignore = !event.target.checked;
      state.regExPatterns[index].ignore = ignore;
      updateRegex();
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
      renderRegexPatterns();
    }

    function updateQuery(newQuery) {
      state.query = newQuery;
      renderRegexPatterns();
    }

    // Initialize
    fetchRegExPatterns();

    // Public API
    return {
      element: panel,
      tags: state.tags,
      query: state.query,
      show,
      hide,
      updateTags,
      updateQuery,
      getRegexPatterns: () => [...state.regExPatterns]
    };
}