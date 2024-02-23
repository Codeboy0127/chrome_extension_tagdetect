// recorder entry

class Recorder {

    constructor(window) {
        this.window = window;
        this.attached = false;
        this.frameLocation = this.getFrameLocation();
    }

    
    parseEventKey(eventKey) {
        if (eventKey.match(/^C_/)) {
            return { eventName: eventKey.substring(2), capture: true };
        } else {
            return { eventName: eventKey, capture: false };
        }
    }

    
    attach() {
        
        if (this.attached) {
            return;
        }
        this.attached = true;
        this.eventListeners = {};
        var self = this;
        for (let eventKey in Recorder.eventHandlers) {
            var eventInfo = this.parseEventKey(eventKey);
            var eventName = eventInfo.eventName;
            var capture = eventInfo.capture;
            // create new function so that the variables have new scope.
            function register() {
                var handlers = Recorder.eventHandlers[eventKey];
                var listener = function(event) {
                    for (var i = 0; i < handlers.length; i++) {
                        handlers[i].call(self, event);
                    }
                }
                this.window.document.addEventListener(eventName, listener, capture);
                this.eventListeners[eventKey] = listener;
            }
            register.call(this);
        }
    }

    
    detach() {
        if (!this.attached) {
            return;
        }
        this.attached = false;
        for (let eventKey in this.eventListeners) {
            var eventInfo = this.parseEventKey(eventKey);
            var eventName = eventInfo.eventName;
            var capture = eventInfo.capture;
            this.window.document.removeEventListener(eventName, this.eventListeners[eventKey], capture);
        }
        delete this.eventListeners;
    }

    getFrameLocation() {
        let currentWindow = window;
        let currentParentWindow;
        let frameLocation = ""
        while (currentWindow !== window.top) {
            currentParentWindow = currentWindow.parent;
            for (let idx = 0; idx < currentParentWindow.frames.length; idx++)
                if (currentParentWindow.frames[idx] === currentWindow) {
                    frameLocation = ":" + idx + frameLocation;
                    currentWindow = currentParentWindow;
                    break;
                }
        }
        return frameLocation = "root" + frameLocation;
    }

    record(command, target, value, insertBeforeLastCommand, actualFrameLocation) {
        let self = this;
        let message = {
            command: command,
            target: target,
            value: value,
            insertBeforeLastCommand: insertBeforeLastCommand,
            frameLocation: (actualFrameLocation != undefined ) ? actualFrameLocation : this.frameLocation,
        }
        //let event = new CustomEvent("recorder_message", {data : message})
        const event = new CustomEvent("recorder_message", {
            bubbles: true,
            detail: {
                type: 'recorder_message',
                command: command,
                value: value,
                target: target,
                insertBeforeLastCommand: insertBeforeLastCommand,
                frameLocation: (actualFrameLocation != undefined ) ? actualFrameLocation : this.frameLocation,
                time: Date.now()
            }
          });
        document.dispatchEvent(event);
    }
}

Recorder.eventHandlers = {};
Recorder.addEventHandler = function(handlerName, eventName, handler, options) {
    handler.handlerName = handlerName;
    if (!options) options = false;
    let key = options ? ('C_' + eventName) : eventName;
    if (!this.eventHandlers[key]) {
        this.eventHandlers[key] = [];
    }
    this.eventHandlers[key].push(handler);
}


// TODO: new by another object
var recorder = new Recorder(window);

// TODO: move to appropriate file
// show element
function startShowElement(message, sender, sendResponse){
    if (message.showElement) {
        result = selenium["doShowElement"](message.targetValue);
        return Promise.resolve({result: result});
    }
}
//browser.runtime.onMessage.addListener(startShowElement);


// capture interactions

var typeTarget;
var typeLock = 0;
Recorder.inputTypes = ["text", "password", "file", "datetime", "datetime-local", "date", "month", "time", "week", "number", "range", "email", "url", "search", "tel", "color"];
Recorder.addEventHandler('type', 'change', function(event) {
    
    if (event.target.tagName && !preventType && typeLock == 0 && (typeLock = 1)) {
        
            var tagName = event.target.tagName.toLowerCase();
            var type = event.target.type;
            if ('input' == tagName && Recorder.inputTypes.indexOf(type) >= 0) {
                if (event.target.value.length > 0) {
                    this.record("type",  getXPath(event.target), event.target.value);
                    var enterTarget = event.target
                    if (enterTarget != null) {
                        var tempTarget = event.target.parentElement;
                        var formChk = tempTarget.tagName.toLowerCase();
                        while (formChk != 'form' && formChk != 'body') {
                            tempTarget = tempTarget.parentElement;
                            formChk = tempTarget.tagName.toLowerCase();
                        }
                        if (formChk == 'form' && (tempTarget.hasAttribute("id") || tempTarget.hasAttribute("name")) && (!tempTarget.hasAttribute("onsubmit"))) {
                            /*if (tempTarget.hasAttribute("id"))
                                this.record("submit", [
                                    ["id=" + tempTarget.id, "id"]
                                ], "");
                            else if (tempTarget.hasAttribute("name"))
                                this.record("submit", [
                                    ["name=" + tempTarget.name, "name"]
                                ], "");*/
                        } else
                            //this.record("sendKeys", getXPath(enterTarget), "${KEY_ENTER}");
                        enterTarget = null;
                    }
                    
                } else {
                    this.record("type", getXPath(event.target), event.target.value);
                }
            } else if ('textarea' == tagName) {
                this.record("type", getXPath(event.target), event.target.value);
            }
        }
        typeLock = 0;
});

Recorder.addEventHandler('type', 'input', function(event) {
    typeTarget = event.target;
});

// © Jie-Lin You, SideeX Team
var preventClickTwice = false;
Recorder.addEventHandler('clickAt', 'click', function(event) {


    if (event.button == 0 && !preventClick && event.isTrusted) {
        if (!preventClickTwice) {
            var top = event.pageY,
                left = event.pageX;
            var element = event.target;
            do {
                top -= element.offsetTop;
                left -= element.offsetLeft;
                element = element.offsetParent;
            } while (element);
            var target = event.target;

            this.record("click", getXPath(event.target), '');

            var arrayTest = getXPath(event.target);
            preventClickTwice = true;
        }
        setTimeout(function() { preventClickTwice = false; }, 30);
    }
}, true);


var focusTarget = null;
var focusValue = null;
var tempValue = null;
var preventType = false;
var inp = document.getElementsByTagName("input");
for (var i = 0; i < inp.length; i++) {
    if (Recorder.inputTypes.indexOf(inp[i].type) >= 0) {
        inp[i].addEventListener("focus", function(event) {
            focusTarget = event.target;
            focusValue = focusTarget.value;
            tempValue = focusValue;
            preventType = false;
        });
        inp[i].addEventListener("blur", function(event) {
            focusTarget = null;
            focusValue = null;
            tempValue = null;
        });
    }
}



var preventClick = false;
var enterTarget = null;
var enterValue = null;
var tabCheck = null;


var prevTimeOut = null;
Recorder.addEventHandler('runScript', 'scroll', function(event) {
    if (pageLoaded === true) {
        var self = this;
        this.scrollDetector = event.target;
        clearTimeout(prevTimeOut);
        prevTimeOut = setTimeout(function() {
            delete self.scrollDetector;
        }.bind(self), 500);
    }
}, true);

var readyTimeOut = null;
var pageLoaded = true;
Recorder.addEventHandler('checkPageLoaded', 'readystatechange', function(event) {
    var self = this;
    if (window.document.readyState === 'loading') {
        pageLoaded = false;
    } else {
        pageLoaded = false;
        clearTimeout(readyTimeOut);
        readyTimeOut = setTimeout(function() {
            pageLoaded = true;
        }.bind(self), 1500); //setReady after complete 1.5s
    }
}, true);


Recorder.prototype.getOptionLocator = function(option) {
    var label = option.text.replace(/^ *(.*?) *$/, "$1");
    if (label.match(/\xA0/)) { // if the text contains &nbsp;
        return "label=regexp:" + label.replace(/[\(\)\[\]\\\^\$\*\+\?\.\|\{\}]/g, function(str) {
                return '\\' + str
            })
            .replace(/\s+/g, function(str) {
                if (str.match(/\xA0/)) {
                    if (str.length > 1) {
                        return "\\s+";
                    } else {
                        return "\\s";
                    }
                } else {
                    return str;
                }
            });
    } else {
        return "label=" + label;
    }
};

Recorder.prototype.findClickableElement = function(e) {
    if (!e.tagName) return null;
    var tagName = e.tagName.toLowerCase();
    var type = e.type;
    if (e.hasAttribute("onclick") || e.hasAttribute("href") || tagName == "button" ||
        (tagName == "input" &&
            (type == "submit" || type == "button" || type == "image" || type == "radio" || type == "checkbox" || type == "reset"))) {
        return e;
    } else {
        if (e.parentNode != null) {
            return this.findClickableElement(e.parentNode);
        } else {
            return null;
        }
    }
};

//select / addSelect / removeSelect
Recorder.addEventHandler('select', 'focus', function(event) {
    if (event.target.nodeName) {
        var tagName = event.target.nodeName.toLowerCase();
        if ('select' == tagName && event.target.multiple) {
            var options = event.target.options;
            for (var i = 0; i < options.length; i++) {
                if (options[i]._wasSelected == null) {
                    // is the focus was gained by mousedown event, _wasSelected would be already set
                    options[i]._wasSelected = options[i].selected;
                }
            }
        }
    }
}, true);

Recorder.addEventHandler('select', 'change', function(event) {
    if (event.target.tagName) {
        var tagName = event.target.tagName.toLowerCase();
        if ('select' == tagName) {
            if (!event.target.multiple) {
                var option = event.target.options[event.target.selectedIndex];
                this.record("select", getXPath(event.target), this.getOptionLocator(option));
            } else {
                var options = event.target.options;
                for (var i = 0; i < options.length; i++) {
                    if (options[i]._wasSelected == null) {}
                    if (options[i]._wasSelected != options[i].selected) {
                        var value = this.getOptionLocator(options[i]);
                        if (options[i].selected) {
                            this.record("addSelection", getXPath(event.target), value);
                        } else {
                            this.record("removeSelection", getXPath(event.target), value);
                        }
                        options[i]._wasSelected = options[i].selected;
                    }
                }
            }
        }
    }
});

function getXPath(el){
    let nodeElem = el;
    if (nodeElem && nodeElem.id) {
        return "//*[@id=\"" + nodeElem.id + "\"]";
    }
    let parts= [];
    while (nodeElem && Node.ELEMENT_NODE === nodeElem.nodeType) {
        let nbOfPreviousSiblings = 0;
        let hasNextSiblings = false;
        let sibling = nodeElem.previousSibling;
        while (sibling) {
            if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE &&
                sibling.nodeName === nodeElem.nodeName) {
                nbOfPreviousSiblings++;
            }
            sibling = sibling.previousSibling;
        }
        sibling = nodeElem.nextSibling;
        while (sibling) {
            if (sibling.nodeName === nodeElem.nodeName) {
                hasNextSiblings = true;
                break;
            }
            sibling = sibling.nextSibling;
        }
        let prefix = nodeElem.prefix ? nodeElem.prefix + ":" : "";
        let nth = nbOfPreviousSiblings || hasNextSiblings
            ? "[" + (nbOfPreviousSiblings + 1) + "]"
            : "";
        parts.push(prefix + nodeElem.localName + nth);
        nodeElem = nodeElem.parentNode;
    }
    return parts.length ? "/" + parts.reverse().join("/") : "";
}


recorder.attach()