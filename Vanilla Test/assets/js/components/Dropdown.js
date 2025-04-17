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

export function createDropdown(filterOptions, onChangeCallback) {
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
    const dropdownList = createDropdownList(filterOptions); // Create dropdown list
    // Create dropdown list

  // Append dropdown list to dropdown container
  dropdownContainer.appendChild(dropdownList);

  function createDropdownList(filter) {
    const dropdownList = document.createElement('div');
    dropdownList.className = 'dropdown-list';
    dropdownList.style.display = 'none';

    // Now iterate over filterOptions after it has been populated
    filter.forEach(option => {

        const optionItem = document.createElement('div');
        optionItem.className = 'dropdown-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = option.tagname.toLowerCase().replace(/\s+/g, '-');
        checkbox.id = `filter-${checkbox.value}`;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = option.tagname;

        // Create badge
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = option.count; // Display the count from the option data

        checkbox.addEventListener('change', () => {
            const selectedFilters = Array.from(dropdownList.querySelectorAll('input[type="checkbox"]:checked'))
              .map(checkbox => checkbox.value);
      
            if (onChangeCallback) {
              onChangeCallback(selectedFilters);
            }
          });

        optionItem.appendChild(checkbox);
        optionItem.appendChild(label);
        optionItem.appendChild(badge);
        dropdownList.appendChild(optionItem);
    })

    return dropdownList
  }
   // Method to update dropdown options dynamically
   function updateOptions(newFilterOptions) {
    // Clear existing options
    dropdownContainer.innerHTML = '';
    console.log("filt-----", newFilterOptions);
    // Create dropdown button
    const dropdownButton = document.createElement('button');
    dropdownButton.className = 'dropdown-button';
    dropdownButton.textContent = 'Select Filters';
    dropdownButton.addEventListener('click', () => {
    dropdownList.style.display = dropdownList.style.display === 'block' ? 'none' : 'block';
    });
    dropdownContainer.appendChild(dropdownButton);
    // Recreate the dropdown list with new options
    const dropdownList = createDropdownList(newFilterOptions);
    dropdownContainer.appendChild(dropdownList);
  }
  // Public API
  return {
    element: dropdownContainer,
    updateOptions
  };
}