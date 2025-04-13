// accordion.js
export class Accordion {
    constructor(options) {
      this.id = options.id || '';
      this.title = options.title || '';
      this.styling = options.styling || '';
      this.time = options.time || '';
      this.hasHorizontalLine = options.hasHorizontalLine || false;
      this.isOpen = options.isOpen !== false; // default true
      
      this.element = this.createAccordion();
      this.setupEvents();
    }
  
    createAccordion() {
      const accordion = document.createElement('div');
      accordion.className = `${this.styling} accordion`;
      
      const header = document.createElement('h3');
      header.id = this.id;
      if (this.isOpen) header.classList.add('selected');
      
      // Title with abbreviation
      const titleSpan = document.createElement('span');
      titleSpan.className = 'title';
      
      const abbr = document.createElement('abbr');
      abbr.title = this.title;
      abbr.textContent = this.title;
      titleSpan.appendChild(abbr);
      
      if (this.time) {
        const timeSpan = document.createElement('span');
        timeSpan.className = 'time';
        timeSpan.textContent = this.time;
        titleSpan.appendChild(timeSpan);
      }
      
      header.appendChild(titleSpan);
      
      // Buttons container
      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'accordion-buttons';
      header.appendChild(buttonsDiv);
      
      accordion.appendChild(header);
      
      // Horizontal line
      if (this.hasHorizontalLine) {
        const hr = document.createElement('hr');
        hr.className = 'horizontal';
        accordion.appendChild(hr);
      }
      
      // Content area
      const content = document.createElement('div');
      content.className = 'content custom-scrollbar square';
      if (!this.isOpen) content.style.display = 'none';
      accordion.appendChild(content);
      
      return accordion;
    }
  
    setupEvents() {
      const header = this.element.querySelector('h3');
      const content = this.element.querySelector('.content');
      
      header.addEventListener('click', (e) => {
        if (e.target.closest('.accordion-buttons')) return;
        
        this.toggle();
      });
    }
  
    toggle() {
      const header = this.element.querySelector('h3');
      const content = this.element.querySelector('.content');
      
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        content.style.display = '';
        header.classList.add('selected');
      } else {
        content.style.display = 'none';
        header.classList.remove('selected');
      }
      
      // Optional: Add smooth animation here
    }
  
    // Public methods to manage content
    setContent(contentElement) {
      const contentArea = this.element.querySelector('.content');
      contentArea.innerHTML = '';
      contentArea.appendChild(contentElement);
    }
  
    addButton(buttonElement) {
      const buttonsArea = this.element.querySelector('.accordion-buttons');
      buttonsArea.appendChild(buttonElement);
    }
  }