// Dropdown component for filtering search results

function loadDropdownStyles() {
  if (!document.getElementById('Dropdown-styles')) {
    const link = document.createElement('link');
    link.id = 'Dropdown-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/Dropdown.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

export function createDropdown(onChangeCallback) {
  // Ensure the CSS is loaded
  loadDropdownStyles();
    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'custom-dropdown';

    // Create dropdown button
    const dropdownButton = document.createElement('button');
    dropdownButton.className = 'dropdown-button';
    dropdownButton.textContent = 'Select Filters';
    dropdownButton.addEventListener('click', () => {
    dropdownList.style.display = dropdownList.style.display === 'block' ? 'none' : 'block';
    });
    dropdownContainer.appendChild(dropdownButton);

    // Create dropdown list
    const dropdownList = document.createElement('div');
    dropdownList.className = 'dropdown-list';
    dropdownList.style.display = 'none';

    // Add filter options with checkboxes
    let filterOptions = [];
    (async () => {
    const result = await chrome.storage.local.get(["regExPatterns"]);
    result.regExPatterns.forEach((pattern) => {
        filterOptions.push(pattern.name);
    });

    // Now iterate over filterOptions after it has been populated
    filterOptions.forEach(optionText => {
        const optionItem = document.createElement('div');
        optionItem.className = 'dropdown-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = optionText.toLowerCase().replace(/\s+/g, '-');
        checkbox.id = `filter-${checkbox.value}`;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = optionText;

        checkbox.addEventListener('change', () => {
            const selectedFilters = Array.from(dropdownList.querySelectorAll('input[type="checkbox"]:checked'))
              .map(checkbox => checkbox.value);
      
            if (onChangeCallback) {
              onChangeCallback(selectedFilters);
            }
          });

        optionItem.appendChild(checkbox);
        optionItem.appendChild(label);
        dropdownList.appendChild(optionItem);
    });
    })();

    // Append dropdown list to dropdown container
    dropdownContainer.appendChild(dropdownList);

  // Public API
  return {
    element: dropdownContainer,
  };
}