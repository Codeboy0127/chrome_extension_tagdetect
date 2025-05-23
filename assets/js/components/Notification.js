// notification.js - Vanilla JS implementation of Notification component

export function createNotificationManager() {
    // Create container
    const container = document.createElement('div');
    const notificationWrapper = document.createElement('div');
    notificationWrapper.className = 'notification-wrapper custom-scrollbar';
    container.appendChild(notificationWrapper);
  
    // State
    let notifications = [];
  
    // Add new notification
    function addNotification(notification) {
      const id = Date.now();
      const notificationWithId = { ...notification, id };
      notifications = [...notifications, notificationWithId];
      renderNotifications();
      
      // Scroll to bottom
      setTimeout(() => {
        const lastNotification = notificationWrapper.lastElementChild;
        if (lastNotification) {
          lastNotification.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      
      return id;
    }
  
    // Remove notification
    function removeNotification(id) {
      notifications = notifications.filter(n => n.id !== id);
      renderNotifications();
    }
  
    // Clear all notifications
    function clearAll() {
      notifications = [];
      renderNotifications();
    }
  
    // Render notifications
    function renderNotifications() {
      notificationWrapper.innerHTML = '';
      
      notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${notification.type}`;
        
        const closeButton = document.createElement('i');
        closeButton.className = 'close';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => removeNotification(notification.id));
        
        const title = document.createElement('h2');
        title.textContent = notification.title;
        
        const message = document.createElement('p');
        message.textContent = notification.message;
        
        notificationElement.appendChild(closeButton);
        notificationElement.appendChild(title);
        notificationElement.appendChild(message);
        notificationWrapper.appendChild(notificationElement);
      });
    }
  
    // Public API
    return {
      element: container,
      addNotification,
      removeNotification,
      clearAll,
      success: (title, message) => addNotification({ type: 'success', title, message }),
      error: (title, message) => addNotification({ type: 'error', title, message }),
      warning: (title, message) => addNotification({ type: 'warning', title, message })
    };
  }