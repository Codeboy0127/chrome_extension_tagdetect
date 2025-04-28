// Function to dynamically load the CSS file
function loadLogSettingsStyles() {
  if (!document.getElementById('LogSettings-styles')) {
    const link = document.createElement('link');
    link.id = 'LogSettings-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/settings/LogSettings.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

export function createLogSettings() {
  // Ensure the CSS is loaded
  loadLogSettingsStyles();

  // Create a container for the settings
  const container = document.createElement('div');
  container.className = 'log-settings';
  const settingsTitle = document.createElement('h3');
  settingsTitle.textContent = 'Log Settings';
  settingsTitle.className = 'settings-title';
  container.appendChild(settingsTitle);
  const state = {
    historyMode: false,
    history: [],
  };

  // Load the initial state from Chrome storage
  chrome.storage.local.get(['historyMode'], (result) => {
    state.historyMode = result.historyMode || false;
    toggleHistoryModeButton.textContent = state.historyMode
      ? '🛑History Off'
      : '🚦History On';
  });

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';

  // Create Toggle History Mode button
  const toggleHistoryModeButton = document.createElement('button');
  toggleHistoryModeButton.textContent = state.historyMode
  ? '🛑History Off'
  : '🚦History On';
  toggleHistoryModeButton.className = 'preserve-button';
  toggleHistoryModeButton.addEventListener('click', () => {
    // Toggle the historyMode state
    state.historyMode = !state.historyMode;

    // Update the button text
    toggleHistoryModeButton.textContent = state.historyMode
    ? '🛑History Off'
    : '🚦History On';
    // Save the updated historyMode state to Chrome storage
    chrome.storage.local.set({ historyMode: state.historyMode }, () => {
      console.log('History mode updated in Chrome storage:', state.historyMode);
    });
  });
  buttonContainer.appendChild(toggleHistoryModeButton);

  // Create Clear History button
  const clearHistoryButton = document.createElement('button');
  clearHistoryButton.textContent = 'Clear log';
  clearHistoryButton.className = 'clear-button';
  clearHistoryButton.addEventListener('click', () => {
    // Clear saved data in Chrome storage
    chrome.storage.local.remove('savedData', () => {
      alert('Saved data cleared from Chrome storage.');
    });
  });
  buttonContainer.appendChild(clearHistoryButton);
  container.appendChild(buttonContainer);
  return {
    element: container,
  };
}