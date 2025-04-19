

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

export function createLogSettings(state, clearHistory, toggleHistoryMode) {
    // Ensure the CSS is loaded
    loadLogSettingsStyles();

    // Create a container for the settings
  const container = document.createElement('div');
  container.className = 'log-settings';

  // Create Clear History button
  const clearHistoryButton = document.createElement('button');
  clearHistoryButton.textContent = 'Clear History';
  clearHistoryButton.className = 'simple-button';
  clearHistoryButton.addEventListener('click', clearHistory);
  container.appendChild(clearHistoryButton);

  // Create Toggle History Mode button
  const toggleHistoryModeButton = document.createElement('button');
  toggleHistoryModeButton.textContent = state.historyMode
    ? 'Switch to Normal Mode'
    : 'Switch to History Mode';
  toggleHistoryModeButton.className = 'simple-button';
  toggleHistoryModeButton.addEventListener('click', () => {
    toggleHistoryMode();
    toggleHistoryModeButton.textContent = state.historyMode
      ? 'Switch to Normal Mode'
      : 'Switch to History Mode';
  });
  container.appendChild(toggleHistoryModeButton);

  return {
    element: container
  }
}