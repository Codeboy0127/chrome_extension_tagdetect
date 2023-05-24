
var recorder = {
	helperListener: function(event) {
		if (event.type === 'recorder_message') {
		  try {
			  chrome.runtime.sendMessage(event.detail);
		  } catch (e) {
            console.log(e)
		  }
		}
	}
  };


  document.addEventListener('recorder_message', recorder.helperListener);

if (document.getElementById('recorder_script') === null) {
    var recorder_inject = document.createElement('script');
    recorder_inject.id = 'recorder_script';
    recorder_inject.src = chrome.runtime.getURL('content/recorder_inject.js');
    recorder_inject.type = 'text/javascript';
    document.head.appendChild(recorder_inject);
}

