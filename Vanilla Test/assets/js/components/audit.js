import chromeHelper from '../lib/chromeHelpers.js';
import { createReadMore } from './readmore.js';

function loadauditStyles() {
  if (!document.getElementById('audit-styles')) {
    const link = document.createElement('link');
    link.id = 'audit-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/audit.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

let state = {
  reports: [],
  selectedReportIndex: null,
  hasUnsavedChanges: false, // Track unsaved changes
};
const container = document.createElement('div');
container.className = 'audit-view';
const reportList = document.createElement('ul');
reportList.className = 'report-list';
container.appendChild(reportList);
const reportDetails = document.createElement('div');
reportDetails.className = 'report-details';
container.appendChild(reportDetails);

// Create buttons once
const saveButton = document.createElement('button');
saveButton.textContent = 'Save';
saveButton.addEventListener('click', () => {
  chrome.storage.local.set({
    savedReport: state.reports.map((report) => ({
      ...report,
      instances: report.instances instanceof HTMLElement ? report.instances.outerHTML : report.instances,
      comments: report.comments, // Save comments
    })),
  }, () => {
    alert('Report saved to Chrome storage.');
    state.hasUnsavedChanges = false;
  });
});

const exportButton = document.createElement('button');
exportButton.textContent = 'Export as Word';
exportButton.className = 'export-button';
exportButton.addEventListener('click', () => {
  const report = state.reports[state.selectedReportIndex];
  if (!report) {
    alert('Please select a report to export.');
    return;
  }

  // Create the content as HTML
  const content = `
    <h1>${report.name}</h1>
    <div>${report.instances instanceof HTMLElement ? report.instances.outerHTML : report.instances || 'No instances available.'}</div>
  `;

  // Convert the HTML to a Word document
  const converted = window.htmlDocx.asBlob(content);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(converted);
  link.download = `${report.name}.docx`;
  link.click();
});

export function addReport(tagInfo, title) {
  // Create a modal for entering the report name
  const modal = document.createElement('div');
  modal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  const label = document.createElement('label');
  label.textContent = 'Enter report name:';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter a new report name...';

  // Create a dropdown for existing report names
  const dropdown = document.createElement('select');
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select an existing report name...';
  dropdown.appendChild(defaultOption);

  state.reports.forEach((report) => {
    const option = document.createElement('option');
    option.value = report.name;
    option.textContent = report.name;
    dropdown.appendChild(option);
  });

  // Update the input field when a dropdown option is selected
  dropdown.addEventListener('change', (e) => {
    input.value = e.target.value;
  });

  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.addEventListener('click', () => {
    const reportName = input.value.trim();
    if (!reportName) {
      alert('Please enter a report name.');
      return;
    }

    // Check if the report name already exists
    let flag = true;
    state.reports.forEach((report) => {
      if (report.name === reportName) {
        console.log('Report name already exists.', report.instances);
        const instance = document.createElement('div');
        instance.className = 'instance-content';

        // Append the tagInfo content as an HTML element
        const titleElement = document.createElement('h4');
        titleElement.textContent = title;
        instance.appendChild(titleElement);

        console.log('TagInfo:', isPlainObject(tagInfo));
        if (isPlainObject(tagInfo)) {
          const paramsList = document.createElement('ul');
          paramsList.className = 'tag-params';
          Object.entries(tagInfo).forEach(([key, value], contentIndex) => {
            const li = document.createElement('li');

            const keySpan = document.createElement('span');
            keySpan.id = `tech-${contentIndex}-key`;
            keySpan.textContent = key;

            const readMore = createReadMore(value.toString());
            readMore.element.id = `tech-${contentIndex}-value`;

            li.append(keySpan, readMore.element);
            paramsList.appendChild(li);
          });

          if (paramsList instanceof HTMLElement) {
            instance.appendChild(paramsList); // Append the HTMLElement directly
          } else {
            instance.innerHTML += paramsList; // Fallback for string content
          }
        } else {
          instance.appendChild(tagInfo); // Append the HTMLElement directly
        }
        // Add comment and screenshot functionality
        report.instances.append(instance);
        console.log('Report:', report.instances);
        console.log('Report child:', report.instances.children);
        addCommentAndScreenshot(instance, state.reports.length - 1, report.instances.children.length - 1);
        flag = false;
        return;
      }
    });

    if (flag) {
      const instances = document.createElement('div');
      instances.className = 'instance';
      const instance = document.createElement('div');
      instance.className = 'instance-content';

      // Append the paramsList content as an HTML element
      const titleElement = document.createElement('h4');
      titleElement.textContent = title;
      instance.appendChild(titleElement);
      console.log('TagInfo:', isPlainObject(tagInfo));
      if (isPlainObject(tagInfo)) {
        const paramsList = document.createElement('ul');
        paramsList.className = 'tag-params';
        Object.entries(tagInfo).forEach(([key, value], contentIndex) => {
          const li = document.createElement('li');
          const keySpan = document.createElement('span');
          keySpan.id = `tech-${contentIndex}-key`;
          keySpan.textContent = key;

          const readMore = createReadMore(value.toString());
          readMore.element.id = `tech-${contentIndex}-value`;

          li.append(keySpan, readMore.element);
          paramsList.appendChild(li);
        });

        if (paramsList instanceof HTMLElement) {
          instance.appendChild(paramsList); // Append the HTMLElement directly
        } else {
          instance.innerHTML += paramsList; // Fallback for string content
        }
      } else {
        instance.appendChild(tagInfo); // Append the HTMLElement directly
      }
      // Add comment and screenshot functionality
      state.reports.push({ name: reportName, instances: instances, comments: [], screenshots: [] });
      addCommentAndScreenshot(instance, state.reports.length - 1, 0);

      instances.append(instance);
      renderReports();
    }

    // Close the modal
    document.body.removeChild(modal);
  });

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modalContent.appendChild(label);
  modalContent.appendChild(input);
  modalContent.appendChild(dropdown);
  modalContent.appendChild(saveButton);
  modalContent.appendChild(cancelButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function addCommentAndScreenshot(instance, reportIndex, instanceIndex) {
  // Add comment input
  const uploadcontainer = document.createElement('div');
  uploadcontainer.className = 'upload-container';
  instance.appendChild(uploadcontainer);

  const commentInput = document.createElement('textarea');
  commentInput.placeholder = 'Add a comment...';
  commentInput.className = 'comment-input';
  commentInput.addEventListener('input', (e) => {
    instance.comment = e.target.value; // Save the comment to the instance
    if (!state.reports[reportIndex].comments[instanceIndex]) {
      state.reports[reportIndex].comments[instanceIndex] = ''; // Initialize if not already set
    }
    state.reports[reportIndex].comments[instanceIndex] = e.target.value;
    state.hasUnsavedChanges = true; // Mark as unsaved
  });
  uploadcontainer.appendChild(commentInput);

  // Add screenshot upload button
  const screenshotButton = document.createElement('button');
  screenshotButton.textContent = 'Add Screenshot';
  screenshotButton.className = 'screenshot-button';
  screenshotButton.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target.result; // Base64 image data
          const screenshot = document.createElement('img');
          screenshot.src = imageData;
          uploadcontainer.appendChild(screenshot); // Append the screenshot to the instance
        };
        reader.readAsDataURL(file);
      }
    });
    fileInput.click();
  });
  uploadcontainer.appendChild(screenshotButton);
}

export function attachScreenshot(imageData) {
  if (state.selectedReportIndex === null) {
    alert('Please select a report first.');
    return;
  }
  state.reports[state.selectedReportIndex].screenshots.push(imageData);
  renderReportDetails();
}

  // Render Reports
function renderReports() {
  // Clear the existing report list
  reportList.innerHTML = '';

  // Iterate through the reports and render each one
  state.reports.forEach((report, index) => {
    const listItem = document.createElement('li');
    listItem.className = 'report-item';
    listItem.addEventListener('click', () => {
      state.selectedReportIndex = index;
      renderReportDetails();
    });

    // Add the report name
    const reportName = document.createElement('span');
    reportName.textContent = report.name;

    // Add the delete icon
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'delete-icon';
    deleteIcon.textContent = '🗑️'; // Use a trash can emoji or replace with an icon
    deleteIcon.style.cursor = 'pointer';
    deleteIcon.style.marginLeft = '10px';
    deleteIcon.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent triggering the report selection
      if (confirm(`Are you sure you want to delete the report "${report.name}"?`)) {
        state.reports.splice(index, 1); // Remove the report from the state
        renderReports(); // Re-render the report list
        if (state.selectedReportIndex === index) {
          state.selectedReportIndex = null; // Reset the selected report index if the deleted report was selected
          renderReportDetails(); // Clear the report details
        }
      }

      chrome.storage.local.set({
        savedReport: state.reports
      })
    });

    // Append the report name and delete icon to the list item
    listItem.appendChild(reportName);
    listItem.appendChild(deleteIcon);

    // Append the list item to the report list
    reportList.appendChild(listItem);
  });
}

// Render Report Details
function renderReportDetails() {
  if (state.selectedReportIndex === null) {
    reportDetails.innerHTML = '<p>Select a report to view details.</p>';
    return;
  }

  const report = state.reports[state.selectedReportIndex];

  // Render the report details
  reportDetails.innerHTML = `
    <h3 contenteditable="true">${report.name}</h3>
    <h4>Tags/Datalayers:</h4>
    <div id="instances-container"></div>
  `;

  // Append the instances HTML element to the instances container
  const instancesContainer = document.getElementById('instances-container');
  if (report.instances instanceof HTMLElement) {
    instancesContainer.appendChild(report.instances);
 // Reattach event listeners for each child instance
 Array.from(report.instances.children).forEach((child, index) => {
  const commentInput = child.querySelector('.comment-input');
  if (commentInput) {
    commentInput.value = report.comments[index] || ''; // Restore the comment value
    commentInput.addEventListener('input', (e) => {
      report.comments[index] = e.target.value; // Update the comment in the state
      state.hasUnsavedChanges = true; // Mark as unsaved
    });
  }

  const screenshotButton = child.querySelector('.screenshot-button');
  if (screenshotButton) {
    screenshotButton.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageData = e.target.result; // Base64 image data
            const screenshot = document.createElement('img');
            screenshot.src = imageData;
            child.appendChild(screenshot); // Append the screenshot to the instance
          };
          reader.readAsDataURL(file);
        }
      });
      fileInput.click();
    });
  }
});
  } else if (typeof report.instances === 'string') {
    instancesContainer.innerHTML = report.instances; // If it's a string, set it as innerHTML
  } else {
    instancesContainer.textContent = 'No instances available.';
  }

  // Add event listener to update the report name
  const reportNameElement = reportDetails.querySelector('h3');
  reportNameElement.addEventListener('blur', () => {
    const newName = reportNameElement.textContent.trim();
    if (newName) {
      report.name = newName; // Update the report name in the state
      renderReports(); // Re-render the report list to reflect the updated name
      state.hasUnsavedChanges = true; // Mark as unsaved
    }
  });
}

export function createAudit(options = {}) {
  console.log('Creating audit view...');
  loadauditStyles();
  chrome.storage.local.get("savedReport", (result) => {
    console.log('Loaded saved report from Chrome storage:', result);
    if (result.savedReport) {
      state.reports = result.savedReport.map((report) => ({
        ...report,
        instances: typeof report.instances === 'string' ? createElementFromHTML(report.instances) : report.instances,
        comments: report.comments || [], // Restore comments
      }));
      renderReports();
    } else {
      console.log('No saved reports found in Chrome storage.');
    }
  });

  // Append buttons only if they are not already in the container
  if (!container.contains(saveButton)) {
    container.append(saveButton);
  }
  if (!container.contains(exportButton)) {
    container.append(exportButton);
  }

  return {
    element: container,
  };
}

//Helper function to check if a value is a plain object
function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

// Helper function to create an HTML element from a string
function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

window.addEventListener('beforeunload', (event) => {
  if (state.hasUnsavedChanges) {
    event.preventDefault();
    event.returnValue = ''; // Required for modern browsers to show the confirmation dialog
  }
});
