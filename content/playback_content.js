chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type === "playback_events"){
            if(startPlayback(message.events)){
                sendResponse({state : "success"})
            }
            else{
                sendResponse({state : "failure"})
            }
        }else{
            //sendResponse(true)
        }
    }
)
chrome.runtime.sendMessage({type: "playback_listen"});
function fireEvent(node, eventName, value) {
    // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
    var doc;

    if (node.ownerDocument) {
        doc = node.ownerDocument;
    } else if (node.nodeType == 9) {
        // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
        doc = node;
    } else {
        return false
        //throw new Error("Invalid node passed to fireEvent: " + node.id);
    }

    if (node.dispatchEvent) {
        // Gecko-style approach (now the standard) takes more work
        var eventClass = "";

        // Different events have different event classes.
        // If this switch statement can't map an eventName to an eventClass,
        // the event firing is going to fail.
        switch (eventName) {
        case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
        case "mousedown":
        case "mouseup":
            eventClass = "MouseEvents";
            break;
        case "type":
            node.value = value
            eventName  = "change"
        case "focus":
        case "change":
        case "blur":
        case "select":
            eventClass = "HTMLEvents";
            break;
        default:
            throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
            break;
        }

        var event = doc.createEvent(eventClass);

        var bubbles = eventName == "change" ? false : true;
        event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

        event.synthetic = true; // allow detection of synthetic events
        // The second parameter says go ahead with the default action
        node.dispatchEvent(event, true);
        
        return true

    } else if (node.fireEvent) {
        // IE-old school style
        var event = doc.createEventObject();
        event.synthetic = true; // allow detection of synthetic events
        node.fireEvent("on" + eventName, event);
        return true
    }
};

function getElementByXPath(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function startPlayback(event){
    //init command params
    let element = getElementByXPath(event.target)
    let command = event.command

    return fireEvent(element, command, event.value)

    /*const length = events.length
    const initialTime = events[0].time
    for (let index = 0; index < length; index++) {
        let element = getElementByXPath(events[index].target)
        let time = events[index].time - initialTime
        let command = events[index].command
        setTimeout(() => {
            fireEvent(element, command)
        }, time);
        
    }*/
}
function eventExecutedResponse(){
    return "event executed"
}