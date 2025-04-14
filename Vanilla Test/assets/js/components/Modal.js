// modal.js - Vanilla JS implementation of Modal component
function loadModalStyles() {
  if (!document.getElementById('Modal-styles')) {
    const link = document.createElement('link');
    link.id = 'Modal-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/Modal.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

export function createModal({ header = 'default header', body = 'default body', footer = 'default footer' } = {}) {
     // Ensure the CSS is loaded
    loadModalStyles();
  // Create modal elements
    const modalMask = document.createElement('div');
    modalMask.className = 'modal-mask';
    modalMask.style.display = 'none';
  
    const modalWrapper = document.createElement('div');
    modalWrapper.className = 'modal-wrapper';
  
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
  
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = header;
  
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.innerHTML = body;
  
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.innerHTML = footer;
  
    // Assemble modal structure
    modalContainer.appendChild(modalHeader);
    modalContainer.appendChild(modalBody);
    modalContainer.appendChild(modalFooter);
    modalWrapper.appendChild(modalContainer);
    modalMask.appendChild(modalWrapper);
  
    // Add close handler to buttons with modal-default-button class
    function setupCloseButtons() {
      const closeButtons = modalContainer.querySelectorAll('.modal-default-button');
      closeButtons.forEach(button => {
        button.addEventListener('click', close);
      });
    }
  
    // Public methods
    function open() {
      modalMask.style.display = 'table';
      document.body.style.overflow = 'hidden';
      setupCloseButtons();
    }
  
    function close() {
      modalMask.style.display = 'none';
      document.body.style.overflow = '';
    }
  
    // Initialize
    setupCloseButtons();
  
    // Public API
    return {
      element: modalMask,
      open,
      close,
      updateContent({ header, body, footer }) {
        if (header) modalHeader.innerHTML = header;
        if (body) modalBody.innerHTML = body;
        if (footer) modalFooter.innerHTML = footer;
        setupCloseButtons();
      }
    };
  }