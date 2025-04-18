function loadBlockButtonStyles() {
    if (!document.getElementById('BlockButton-styles')) {
      const link = document.createElement('link');
      link.id = 'BlockButton-styles';
      link.rel = 'stylesheet';
      link.href = '/assets/js/components/BlockButton.css'; // Adjust the path to your CSS file
      document.head.appendChild(link);
    }
  }

export function createBlockButton() {
    loadBlockButtonStyles();
const preventLoadButton = document.createElement('button');
  preventLoadButton.className = 'prevent-btn';
  preventLoadButton.textContent = '🚦 Block Navigation';
  preventLoadButton.style.marginLeft = '10px';
  preventLoadButton.style.display = 'block';

  // State to track prevention status
  let isBlocking = false;

  preventLoadButton.addEventListener('click', () => {
    if (!isBlocking) {
      chrome.devtools.inspectedWindow.eval(`
        if (!window.__NAVIGATION_BLOCKER_ACTIVE__) {
          window.__NAVIGATION_BLOCKER_ACTIVE__ = true;

          window.__removeNavBlockListeners__ = () => {};

          const clickHandler = (e) => {
            const target = e.target.closest('a');
            if (target && target.href) {
              e.preventDefault();
              console.log('Navigation blocked:', target.href);
            }
          };

          const submitHandler = (e) => {
            e.preventDefault();
            console.log('Form submission blocked');
          };

          const popHandler = () => {
            console.log('Back/forward blocked');
            history.pushState(null, '', window.location.href);
          };

          const unloadHandler = (e) => {
            e.preventDefault();
            e.returnValue = '';
          };

          document.addEventListener('click', clickHandler, true);
          document.addEventListener('submit', submitHandler, true);
          window.addEventListener('popstate', popHandler);
          window.addEventListener('beforeunload', unloadHandler);

          const blockPush = new Proxy(history.pushState, {
            apply(target, thisArg, args) {
              console.log('pushState blocked');
              return null;
            }
          });

          const blockReplace = new Proxy(history.replaceState, {
            apply(target, thisArg, args) {
              console.log('replaceState blocked');
              return null;
            }
          });

          history.pushState = blockPush;
          history.replaceState = blockReplace;
          history.pushState(null, '', window.location.href);

          window.__removeNavBlockListeners__ = () => {
            document.removeEventListener('click', clickHandler, true);
            document.removeEventListener('submit', submitHandler, true);
            window.removeEventListener('popstate', popHandler);
            window.removeEventListener('beforeunload', unloadHandler);
            console.log('%cNavigation blocking disabled ❎', 'color: gray; font-weight: bold');
          };

          console.log('%cNavigation blocking enabled 🚫', 'color: red; font-weight: bold');
        }
      `);
      preventLoadButton.textContent = '🛑 Stop Blocking';
    } else {
      chrome.devtools.inspectedWindow.eval(`
        if (window.__NAVIGATION_BLOCKER_ACTIVE__) {
          window.__NAVIGATION_BLOCKER_ACTIVE__ = false;
          window.__removeNavBlockListeners__?.();
        }
      `);
      preventLoadButton.textContent = '🚦 Block Navigation';
    }

    isBlocking = !isBlocking;
  });
  return preventLoadButton;
}