export const chromeHelper = {
    /*
    localStorageGet: (param, callback) =>{
        chrome.storage.local.get(param).then(callback(response));
    }
    */
    //Storage
    localStorageSet:async (param) => {
        return await chrome.storage.local.set(param).then(() => {return param})
    },
    localStorageGet:async (param) =>{
        return await chrome.storage.local.get(param).then((response) => {return response});
    },

    //Listeners
    listenOnTabUpdated:async (callback) => {await chrome.devtools.network.onNavigated.addListener(callback)},
    removeTabUpdatedListener:async (callback) => {await chrome.devtools.network.onNavigated.removeListener(callback)},

    listenOnTabClosed: (callback) => {chrome.tabs.onRemoved.addListener(callback)},
    removeTabClosedListener: (callback) => {chrome.tabs.onRemoved.removeListener(callback)},

    listenOnLocalStorageChange: (callback) => {chrome.storage.onChanged.addListener(callback)},
    removeLocalStorageChangeListener: (callback) => {chrome.storage.onChanged.removeListener(callback)},

    listenToRuntimeMessages : (callback) => {chrome.runtime.onMessage.addListener(callback)},
    removeRuntimeMessagesListener : (callback) => {chrome.runtime.onMessage.removeListener(callback)},


    //Tabs
    sendMessageToTab:async (param, message) => {
        return await chrome.tabs.sendMessage(param, message).then((response) => {return response})
    },
    updateTab: (id, param, callback) => {chrome.tabs.update(id, param, callback)},
    closeTab: (id, callback) => {chrome.tabs.remove(id, callback)},
    reloadTab: (id, param, callback) => {chrome.tabs.reload(id, param, callback)},
    getTab:async (id) => {
        return await chrome.tabs.get(id).then(()=> {return true}, ()=> {return false})
    },

    //Navigation
    onCommitted: (callback) => {chrome.webNavigation.onCommitted.addListener(callback)},
    removeOnCommitted: (callback) => {chrome.webNavigation.onCommitted.removeListener(callback)},

    //Script Injection
    injectScript:async (params, callback) => {await chrome.scripting.executeScript(params, callback)},

    //Window manipulation
    createWindow:async (param) => {
        return await chrome.windows.create(param).then((response) => {return response})
    },
}

export default chromeHelper

export const isDevTools = () => {
    return typeof chrome !== 'undefined' &&
      typeof chrome.devtools !== 'undefined';
  }