// tabs.js - Vanilla JS implementation of Tabs component

import { createModal } from './Modal.js';
import { pageSelectEvent } from '../google-analytics.js';

export function createTabs() {
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
  logoImg.src = chrome.runtime.getURL('images/logo.png');
  logoImg.style.height = '36px';
  logoLink.appendChild(logoImg);
  logoContainer.appendChild(logoLink);

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
  
  const whyButton = document.createElement('button');
  whyButton.className = 'sec-btn';
  whyButton.textContent = 'Why?';
  promoSection.appendChild(whyButton);
  
  // Create modal
  const modal = createModal({
    header: '<h3>Benefits of Taglab Web</h3>',
    body: `
      <div class="img-container">
        <img src="${chrome.runtime.getURL('images/why-taglab-web.png')}" style="height: 100px;" />
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
      <button class="btn">Go Back</button>
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
    tabHeader.addEventListener('click', () => selectTab(tabs.length - 1, title));
    
    if (tabs.length === 1) {
      tabHeader.classList.add('tabs-selected');
    }
    
    tabsHeader.appendChild(tabHeader);
    tabsContainer.appendChild(tabInstance.element);
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
