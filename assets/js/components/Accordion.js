// accordion.js - Vanilla JS implementation of Accordion component

export function createAccordion(config) {
  // Create container
  const accordion = document.createElement('div');
  accordion.className = `${config.styling || ''} accordion`;

  // Create header
  const header = document.createElement('h3');
  if (config.id) header.id = config.id;
  
  // Create title span
  const titleSpan = document.createElement('span');
  titleSpan.className = 'title';
  
  const abbr = document.createElement('abbr');
  abbr.title = config.title || '';
  abbr.textContent = config.title || '';
  
  titleSpan.appendChild(abbr);
  
  // Add time if provided
  if (config.time) {
    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = config.time;
    titleSpan.appendChild(timeSpan);
  }

  // Add edit title slot if provided
  if (config.editTitleSlot) {
    const editContainer = document.createElement('span');
    editContainer.addEventListener('click', (e) => e.stopPropagation());
    editContainer.appendChild(config.editTitleSlot);
    titleSpan.appendChild(editContainer);
  }

  header.appendChild(titleSpan);

  // Add icon slot if provided
  if (config.iconSlot) {
    header.insertBefore(config.iconSlot, header.firstChild);
  }

  // Create buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'accordion-buttons';
  buttonsContainer.addEventListener('click', (e) => e.stopPropagation());
  
  // Add buttons slot if provided
  if (config.buttonsSlot) {
    buttonsContainer.appendChild(config.buttonsSlot);
  }
  
  // Add extra slot if provided
  if (config.extraSlot) {
    buttonsContainer.appendChild(config.extraSlot);
  }

  header.appendChild(buttonsContainer);

  // Create horizontal line if needed
  let horizontalLine = null;
  if (config.hasHorizontalLine) {
    horizontalLine = document.createElement('hr');
    horizontalLine.className = 'horizontal';
  }

  // Create content container
  const content = document.createElement('div');
  content.className = 'content custom-scrollbar square';
  
  // Add content slot if provided
  if (config.content) {
    if (typeof config.content === 'string') {
      content.textContent = config.content;
    } else {
      content.appendChild(config.content);
    }
  }

  // Set initial state
  let isOpen = config.isOpen !== false;
  if (!isOpen) {
    content.style.display = 'none';
  } else {
    header.classList.add('selected');
  }

  // Toggle function
  function toggleAccordion() {
    if (content.style.display === 'none') {
      content.style.display = 'block';
      header.classList.add('selected');
      isOpen = true;
    } else {
      content.style.display = 'none';
      header.classList.remove('selected');
      isOpen = false;
    }
  }

  // Add click handler
  header.addEventListener('click', toggleAccordion);

  // Assemble accordion
  accordion.appendChild(header);
  if (horizontalLine) accordion.appendChild(horizontalLine);
  accordion.appendChild(content);

  // Public API
  return {
    element: accordion,
    toggle: toggleAccordion,
    isOpen: () => isOpen,
    open: () => {
      content.style.display = 'block';
      header.classList.add('selected');
      isOpen = true;
    },
    close: () => {
      content.style.display = 'none';
      header.classList.remove('selected');
      isOpen = false;
    }
  };
}

// CSS (same as original, include in your stylesheet)
/*
.accordion {
  margin-top: 0.5em;
  cursor: pointer;
  border-radius: 10px;
}

.accordion-shadow {
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

... (rest of the CSS from the original component)
*/