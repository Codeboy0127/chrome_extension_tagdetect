// tabs.js - Vanilla JS implementation of Tabs component

import { createModal } from './Modal.js';
import { pageSelectEvent } from '../google-analytics.js';
import { createTagSettings } from './settings/TagSettings.js';
import { createDataLayerSettings } from './settings/DataLayerSettings.js';

// Function to dynamically load the CSS file
function loadTabsStyles() {
  if (!document.getElementById('Tabs-styles')) {
    const link = document.createElement('link');
    link.id = 'Tabs-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/Tabs.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

export function createTabs() {
    // Ensure the CSS is loaded
    loadTabsStyles();
  // Create main container
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'tabs';

  // Create logo section
  const logoContainer = document.createElement('div');
  logoContainer.className = 'h-logo';
  const logoLink = document.createElement('a');
  logoLink.href = 'https://taglab.net/?utm_source=extension&utm_medium=owned-media&utm_campaign=logo';
  logoLink.target = '_blank';
  logoLink.style.cssText = 'margin: 0; padding: 0; display: contents;';
  const logoImg = document.createElement('img');
  logoImg.src = chrome.runtime.getURL('/assets/images/logo.png');
  logoImg.style.height = '36px';
  logoLink.appendChild(logoImg);
  logoContainer.appendChild(logoLink);

  // Create settings button
  const settingsButton = document.createElement('button');
  settingsButton.className = 'settings-button';
  settingsButton.innerHTML = `
    <img src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="Settings" style="height: 24px; width: 24px;">
  `;

  // State to track whether we are in "settings mode"
  let isSettingsMode = false;

  // Declare settingsView.element and alternateView.element outside the block
  let settingsView = null;
  let alternateView = null;

  // Add event listener for settings button
  settingsButton.addEventListener('click', () => {
    const originalTabElements = tabs.map((tab) => tab.element);
    const originalSelectedIndex = selectedIndex;
    if (!isSettingsMode) {
      // Enter settings mode
      console.log('Entering settings mode');

      // Initialize settingsView.element and alternateView.element
      settingsView = createTagSettings();
      alternateView = createDataLayerSettings();

      // Preserve the original tab elements and state


      // Replace all tabInstance.element with the settings view
      tabs.forEach((tab) => {
        if (tabsContainer.contains(tab.element)) {
          tabsContainer.replaceChild(settingsView.element, tab.element);
        }
      });

      // Change button icon to "go back"
      settingsButton.innerHTML = `
        <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" alt="Close" style="height: 20px; width: 20px;">
      `;

      // Add functionality to toggle between settingsView.element and alternateView.element
      tabsHeader.addEventListener('click', (event) => {
        const clickedTab = event.target;
        if (clickedTab.tagName === 'LI') {
          const index = Array.from(tabsHeader.children).indexOf(clickedTab);

          // Show settingsView.element for the first tab, alternateView.element for the second tab
          if (index === 0) {
            if (!tabsContainer.contains(settingsView.element)) {
              if (tabsContainer.contains(alternateView.element)) {
                tabsContainer.replaceChild(settingsView.element, alternateView.element); // Swap alternateView.element with settingsView.element
              } else {
                if (tabsContainer.contains(alternateView.element)) {
                  tabsContainer.removeChild(alternateView.element); // Clear the container only if it exists
                }
                console.log("here???", isSettingsMode)
                if(isSettingsMode){
                tabsContainer.appendChild(settingsView.element);} // Show settingsView.element
              }
            }
          } else if (index === 1) {
            if (!tabsContainer.contains(alternateView.element)) {
              if (tabsContainer.contains(settingsView.element)) {
                tabsContainer.replaceChild(alternateView.element, settingsView.element); // Swap settingsView.element with alternateView.element
              } else {
                if (tabsContainer.contains(settingsView.element)) {
                  tabsContainer.removeChild(settingsView.element); // Clear the container only if it exists
                }
                if(isSettingsMode){
                tabsContainer.appendChild(alternateView.element);} // Show alternateView.element
              }
            }
          }
        }
      });

      // Update state
      isSettingsMode = true;
    } else {
      // Exit settings mode
      console.log('Exiting settings mode');

      // Restore the original tab elements and state
      // Remove settingsView.element or alternateView.element if present
      if (tabsContainer.contains(settingsView.element)) {
        tabsContainer.removeChild(settingsView.element);
      }
      if (tabsContainer.contains(alternateView.element)) {
        tabsContainer.removeChild(alternateView.element);
      }

      // Restore the original tab elements
      originalTabElements.forEach((element) => {
        if (!tabsContainer.contains(element)) {
          tabsContainer.appendChild(element);
        }
      });

      // Ensure logoContainer and headerNav remain intact
      if (!tabsContainer.contains(logoContainer)) {
        tabsContainer.insertBefore(logoContainer, tabsContainer.firstChild);
      }
      if (!tabsContainer.contains(headerNav)) {
        tabsContainer.insertBefore(headerNav, tabsContainer.children[1]);
      }

      // Restore the original tabHeaders functionality
      tabs.forEach((tab, index) => {
        tabsContainer.appendChild(tab.element); // Ensure all tab elements are reattached
      });

      selectTab(selectedIndex, tabs[selectedIndex]?.title || '');

      // Change button icon back to "settings"
      settingsButton.innerHTML = `
        <img src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="Settings" style="height: 24px; width: 24px;">
      `;

      // Update state
      isSettingsMode = false;
    }
  });

  // Append settings button to logoContainer
  logoContainer.appendChild(settingsButton);

  //Create toggle theme button
  const themeToggle = document.createElement('label');
  themeToggle.className = 'theme-toggle-switch';
  themeToggle.innerHTML = `
    <input type="checkbox" id="theme-checkbox">
    <span class="slider"></span>
  `;
  themeToggle.querySelector('#theme-checkbox').addEventListener('change', toggleTheme);
  logoContainer.appendChild(themeToggle);

  // Create header navigation
  const headerNav = document.createElement('div');
  headerNav.className = 'header-nav';
  const tabsHeaderContainer = document.createElement('div');
  tabsHeaderContainer.className = 'c-tabs-header';

  // Create tabs header
  const tabsHeader = document.createElement('ul');
  tabsHeader.className = 'tabs-header';

  // Create promo section
  const promoSection = document.createElement('div');
  promoSection.innerHTML = 'Tag View is better with Taglab Web ';
  const whyButton = document.createElement('button');
  whyButton.className = 'sec-btn';
  whyButton.textContent = 'Why?';
  promoSection.appendChild(whyButton);

  // State
  let tabs = [];
  let selectedIndex = 0;
  const benefits = [
    "Detailed audit history reports with versioning.",
    "Reports with comprehensive tags and data layers data, including cookies and page performance metrics.",
    "Automated remote scenario and crawl runs for effortless testing.",
    "Cloud-based robust digital marketing testing suite.",
    "Limitless page inspection and crawling capabilities for unparalleled insights",
  ];

  // Create modal
  const modal = createModal({
    header: '<h3>Benefits of Taglab Web</h3>',
    body: `
      <div class="img-container">
        <img src="${chrome.runtime.getURL('/assets/images/why-taglab-web.png')}" style="height: 100px;" />
      </div>
      <div>
        <ul class="benefits">
          ${benefits.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    `,
    footer: `
      <a target="_blank" href="https://taglab.net/?utm_source=extension&utm_medium=owned-media&utm_campaign=why-taglab-web" class="primary-btn">
        Discover
      </a>
      <button class="btn modal-default-button">Go Back</button>
    `
  });

  // Event listeners
  whyButton.addEventListener('click', () => {
    modal.open();
  });

  // Methods
  function selectTab(index, tabName) {
    
    selectedIndex = index;
    
    // Update tab visibility
    tabs.forEach((tab, i) => {
      tab.setActive(i === index);
    });

    // Update tab header styles
    const tabHeaders = tabsHeader.querySelectorAll('li');
    tabHeaders.forEach((header, i) => {
      header.classList.toggle('tabs-selected', i === index);
    });

    // Analytics
    if (tabName) pageSelectEvent(tabName);
  }

  function addTab(tabInstance, title) {
    tabs.push(tabInstance);
    // Create tab header
    const tabHeader = document.createElement('li');
    tabHeader.textContent = title;
    tabHeader.addEventListener('click', () => selectTab(title=="Tags View"?0:1, title));
    
    if (tabs.length === 1) {
      tabHeader.classList.add('tabs-selected');
    }
    
    tabsHeader.appendChild(tabHeader);
    tabsContainer.appendChild(tabInstance.element);
  }

  function toggleTheme() {
    const currentTheme = document.body.dataset.theme || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = newTheme;
  
    applyTheme(newTheme);
  }

  function applyTheme(theme) {
    document.body.dataset.theme = theme;
  
    // Save the theme preference to localStorage
    localStorage.setItem('theme', theme);
  }


  // Initial setup
  tabsHeaderContainer.appendChild(tabsHeader);
  tabsHeaderContainer.appendChild(promoSection);
  headerNav.appendChild(tabsHeaderContainer);
  tabsContainer.appendChild(logoContainer);
  tabsContainer.appendChild(headerNav);
  document.body.appendChild(modal.element);

  // Public API
  return {
    element: tabsContainer,
    addTab,
    selectTab
  };
}