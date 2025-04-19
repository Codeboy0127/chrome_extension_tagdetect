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
};
const container = document.createElement('div');
container.className = 'audit-view';
const reportList = document.createElement('ul');
reportList.className = 'report-list';
container.appendChild(reportList);
const reportDetails = document.createElement('div');
reportDetails.className = 'report-details';
container.appendChild(reportDetails);


export function addReport(tagInfo) {
    console.log(tagInfo)
  const reportName = prompt('Enter report name:', `Report ${state.reports.length + 1}`);
  if (reportName) {
    state.reports.push({ name: reportName, comment: '', instances: tagInfo, screenshots: [] });
    renderReports();
  }
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

    reportList.innerHTML = '';
    state.reports.forEach((report, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = report.name;
      listItem.addEventListener('click', () => {
        state.selectedReportIndex = index;
        renderReportDetails();
      });
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
    reportDetails.innerHTML = `
      <h3 contenteditable="true">${report.name}</h3>
      <textarea placeholder="Add a comment...">${report.comment || ''}</textarea>
      <h4>Instances:</h4>
      <div id="instances-container"></div>
      <h4>Screenshots:</h4>
      <div class="screenshot-section">
        <button id="upload-screenshot-button">Upload Screenshot</button>
        <ul>${report.screenshots.map((screenshot, index) => `<li><img src="${screenshot}" alt="Screenshot ${index + 1}" style="max-width: 100px;"></li>`).join('')}</ul>
      </div>
    `;
  // Append the instances HTML element to the instances container
  const instancesContainer = document.getElementById('instances-container');
  if (report.instances instanceof HTMLElement) {
    instancesContainer.appendChild(report.instances);
  } else if (typeof report.instances === 'string') {
    instancesContainer.innerHTML = report.instances; // If it's a string, set it as innerHTML
  } else {
    instancesContainer.textContent = 'No instances available.';
  }
    // Add functionality to the upload screenshot button
  const uploadButton = document.getElementById('upload-screenshot-button');
  uploadButton.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target.result; // Base64 image data
          attachScreenshot(imageData); // Attach the screenshot to the report
        };
        reader.readAsDataURL(file);
      }
    });
    fileInput.click();
  });
  }
export function createAudit(options = {}) {
  loadauditStyles();

  // Export Reports
  const exportButton = document.createElement('button');
  exportButton.textContent = 'Export as PDF/Word';
  exportButton.addEventListener('click', () => {
    const report = state.reports[state.selectedReportIndex];
    if (!report) {
      alert('Please select a report to export.');
      return;
    }
  
    // Create the content as HTML
    const content = `
      <h1>${report.name}</h1>
      <p>${report.comment || 'No comment provided.'}</p>
      <h2>Instances</h2>
      <div>${report.instances instanceof HTMLElement ? report.instances.outerHTML : report.instances || 'No instances available.'}</div>
      <h2>Screenshots</h2>
      ${report.screenshots.map((screenshot, index) => `<p>Screenshot ${index + 1}:</p><img src="${screenshot}" style="max-width: 400px;">`).join('')}
    `;
  
    // Convert the HTML to a Word document
    const converted = window.htmlDocx.asBlob(content);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(converted);
    link.download = `${report.name}.docx`;
    link.click();
  });
  container.appendChild(exportButton);

  return {
    element: container,
  };
}