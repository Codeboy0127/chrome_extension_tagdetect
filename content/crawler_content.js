var crawlerReady = false
if (document.readyState === "interactive" || document.readyState === "complete" ) {
    chrome.runtime.sendMessage({type: "crawler_ready"})
    crawlerReady = true
}
if(!crawlerReady){
    document.addEventListener("DOMContentLoaded", function() {
        chrome.runtime.sendMessage({type: "crawler_ready"})
    });
}
chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type === "crawler_start"){
            sendResponse(getUrlsInPage(message.params))
        }
    }
)

function getUrlsInPage(params){
    const results = [];
    var urls = document.getElementsByTagName('a');
    for (urlIndex in urls) {
        const url = urls[urlIndex]
        if(!url.href){
            continue
        }
        const externalLink = url.host !== window.location.host
        const ignoreSelf = url.href !== window.location.href
        const includesAnchor = url.href.includes('#')
        const includesParam = url.href.includes('?')
        const includesSubdomaine = subDomain(url.href)
        const ignoreUrlWithAnchor = params.includeAnchors ? true : !includesAnchor
        const ignoreUrlWithParams = params.includeParams ? true : !includesParam
        const ignoresSubdomaine = params.includeSubdomain ? true : !includesSubdomaine
        var regexRule = params.regexRule ? isRegExValid(params.regexRule) : false
        regexRule = regexRule ? regexRule.test(url.href) : true
        if(url.href && url.href.indexOf('://')!==-1 && !externalLink && ignoreSelf && ignoreUrlWithAnchor && ignoreUrlWithParams && regexRule && ignoresSubdomaine) 
            results.push({
                url: url.href
            }) // url.rel
    }

    return results
}

function isRegExValid(regexRule){
    try{
        return RegExp(regexRule)
    } catch(e){
        return false
    }
}

function subDomain(url) {
 
    // IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
    url = url.replace(new RegExp(/^\s+/),""); // START
    url = url.replace(new RegExp(/\s+$/),""); // END
     
    // IF FOUND, CONVERT BACK SLASHES TO FORWARD SLASHES
    url = url.replace(new RegExp(/\\/g),"/");
     
    // IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
    url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i),"");
     
    // IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
    url = url.replace(new RegExp(/^www\./i),"");
     
    // REMOVE COMPLETE STRING FROM FIRST FORWARD SLASH ON
    url = url.replace(new RegExp(/\/(.*)/),"");
     
    // REMOVES '.??.??' OR '.???.??' FROM END - e.g. '.CO.UK', '.COM.AU'
    if (url.match(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i))) {
          url = url.replace(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i),"");
     
    // REMOVES '.??' or '.???' or '.????' FROM END - e.g. '.US', '.COM', '.INFO'
    } else if (url.match(new RegExp(/\.[a-z]{2,4}$/i))) {
          url = url.replace(new RegExp(/\.[a-z]{2,4}$/i),"");
    }
     
    // CHECK TO SEE IF THERE IS A DOT '.' LEFT IN THE STRING
    var subDomain = (url.match(new RegExp(/\./g))) ? true : false;
     
    return(subDomain);
     
    }