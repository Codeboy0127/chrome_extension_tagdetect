// notification.js - Vanilla JS implementation of Notification component
function loadNotificationStyles() {
  if (!document.getElementById('Notification-styles')) {
    const link = document.createElement('link');
    link.id = 'Notification-styles';
    link.rel = 'stylesheet';
    link.href = '/assets/js/components/Notification.css'; // Adjust the path to your CSS file
    document.head.appendChild(link);
  }
}

export function createNotificationManager() {
    // Ensure the CSS is loaded
    loadNotificationStyles();
    // Create container
    // const container = document.createElement('div');
    const notificationWrapper = document.createElement('div');
    notificationWrapper.className = 'notification-wrapper custom-scrollbar';
    notificationWrapper.style.display="none";
    // container.appendChild(notificationWrapper);
  
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
      console.log("Notifications: ", notifications);
      notificationWrapper.style.display = notifications.length > 0 ? "flex" : "none";
      
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
      element: notificationWrapper,
      addNotification,
      removeNotification,
      clearAll,
      success: (title, message) => addNotification({ type: 'success', title, message }),
      error: (title, message) => addNotification({ type: 'error', title, message }),
      warning: (title, message) => addNotification({ type: 'warning', title, message })
    };
  }