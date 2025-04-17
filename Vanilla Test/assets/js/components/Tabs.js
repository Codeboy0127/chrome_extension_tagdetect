// tabs.js - Vanilla JS implementation of Tabs component

import { createModal } from './Modal.js';
import { pageSelectEvent } from '../google-analytics.js';

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
    console.log('Why button clicked');
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