// tab.js - Vanilla JS implementation of Tab component
// Function to dynamically load the CSS file

export function createTab(title = 'Tab', initialActive = true) {
    // Create tab element
    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.style.display = initialActive ? '' : 'none';
    
    // State management
    let isActive = initialActive;
    
    // Public API
    return {
      element: tabElement,
      title: title,
      
      setActive(active) {
        isActive = active;
        tabElement.style.display = active ? '' : 'none';
      },
      
      appendContent(content) {
        if (typeof content === 'string') {
          tabElement.innerHTML = content;
        } else if (content instanceof Node) {
          tabElement.appendChild(content);
        }
      },
      
      isActive() {
        return isActive;
      }
    };
  }