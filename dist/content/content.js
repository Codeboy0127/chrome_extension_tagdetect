document.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "content_click_event"
  })
})
var allowedLayers = [ 'google_tag_manager_push', 'google_tag_manager', 'tealium', 'tag_commander', 'adobe_dtm', 'var', 'launchdataelements', 'adobetags' ]
chrome.storage.local.get(null, function(items) {
  if (items.hasOwnProperty('allowedLayers')) {
    var newAllowedLayers = []
    for (const [key, value] of Object.entries(items.allowedLayers)) {
        if(value) newAllowedLayers.push(key)
    }
    allowedLayers = newAllowedLayers
  }
})

if (!/addthis\.com|facebook\.com|twitter\.com/.test(document.location.host)) {
  var dataslayer = {
	helperListener: function(event) {
		if (event.data.type && allowedLayers.includes(event.data.type)) {
		  try {
			if (event.source == window) {
			  chrome.runtime.sendMessage(event.data);
			} else {
			  event.data.iframed = true;
			  chrome.runtime.sendMessage(event.data);
			}
		  } catch (_) {
		  }
		}
	}
  };

  window.addEventListener('message', dataslayer.helperListener);

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.ask == 'refresh') {
      const refreshTag = document.createElement('script');
      refreshTag.type = 'text/javascript';
      refreshTag.innerHTML = 'dataslayer.refresh();';
      document.head.appendChild(refreshTag);
    } else if (request.ask == 'refreshLaunchDataElements') {
      const refreshTag = document.createElement('script');
      refreshTag.type = 'text/javascript';
      refreshTag.innerHTML = 'dataslayer.loadLaunchDataElements();';
      document.head.appendChild(refreshTag);
    }
  });
  if (document.getElementById('dataslayer_script') === null) {
    var dataslayers = document.createElement('script');
    dataslayers.id = 'dataslayer_script';
    dataslayers.src = chrome.runtime.getURL('content/inject.js');
    dataslayers.type = 'text/javascript';
    document.head.appendChild(dataslayers);
    chrome.storage.local.get(null, function(items) {
      if (items.hasOwnProperty('dataLayers')) {
        dataslayers.setAttribute('data-layers', items.dataLayers.join(';'));
      }

      if (items.hasOwnProperty('updateInterval')) {
        dataslayers.setAttribute('data-interval', items.updateInterval);
      }

      document.head.appendChild(dataslayers);
    });
  }
}

