// read-more.js - Vanilla JS implementation of ReadMore component

export function createReadMore(text, id = '') {
    // Create container
    const container = document.createElement('span');
    container.className = 'show-more';
    if (id) container.id = id;
  
    // State
    let isFullTextVisible = false;
    const maxLength = 45;
    const shouldTruncate = text.length > maxLength;
  
    // Create elements
    const textSpan = document.createElement('span');
    const toggleLink = document.createElement('a');
    toggleLink.href = '#';
    toggleLink.style.float = 'right';
  
    // Update displayed content
    function updateContent() {
      if (isFullTextVisible || !shouldTruncate) {
        textSpan.textContent = text;
      } else {
        textSpan.textContent = text.substring(0, maxLength) + '...';
      }
      toggleLink.textContent = isFullTextVisible ? 'Show less' : 'Show more';
    }
  
    // Toggle handler
    function handleToggle(e) {
      e.preventDefault();
      isFullTextVisible = !isFullTextVisible;
      updateContent();
    }
  
    // Initialize
    if (shouldTruncate) {
      toggleLink.addEventListener('click', handleToggle);
      container.appendChild(toggleLink);
    }
    container.insertBefore(textSpan, container.firstChild);
    updateContent();
  
    // Public API
    return {
      element: container,
      setText(newText) {
        text = newText;
        shouldTruncate = text.length > maxLength;
        
        if (shouldTruncate && !toggleLink.parentNode) {
          container.appendChild(toggleLink);
        } else if (!shouldTruncate && toggleLink.parentNode) {
          container.removeChild(toggleLink);
        }
        
        updateContent();
      },
      toggle() {
        if (shouldTruncate) {
          isFullTextVisible = !isFullTextVisible;
          updateContent();
        }
      }
    };
  }