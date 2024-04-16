<template>
        <div class="wrapper">
                <transition name="modal">
                    <modal v-if="showModal" @close="showModal = false" key="new-regex-pattern">
                        <template v-slot:header>
                            <h3>Export Tags and Datalayers to Excel</h3>
                        </template>
                        <template v-slot:body>
                            <div class="add-regex-fields">
                                <label for="fileName">Choose the filename (without the extension)</label>
                                <input type="text" id="fileName" name="fileName" v-model="fileName" placeholder="file_name">
                                <p v-if="exportModalErrors.length">
                                    <b>Please correct the following error(s):</b>
                                    <ul>
                                    <li v-for="error in exportModalErrors">{{ error }}</li>
                                    </ul>
                                </p>
                            </div>
                        </template>
                        <template v-slot:footer>
                            <button class="simple-button" @click="exportData">Export</button>
                            <button class="simple-button red" @click="showModal = false">Cancel</button>
                        </template>
                    </modal>
                </transition>
                <tabs>
                    <tab title="Tags View"><tag-view :occurences="regexOccurances" :isInspecting="isInspecting" :data="data" @editEventTitle="editEventTitle" @toggleInspection="toggleInspection" @exportData="exportDataConfirm" @resetData="resetData"/></tab>
                    <tab title="Data Layer View"><data-layer-view :isInspecting="isInspecting" :data="data" @editEventTitle="editEventTitle" @toggleInspection="toggleInspection" @exportData="exportDataConfirm" @resetData="resetData"/></tab>
                    <tab title="Scenarios"><scenarios @startInspection="startInspection" @stopInspection="stopInspection"/></tab>
                    <tab title="Crawls"><crawls ref="crawls" @startInspection="startInspection" @stopInspection="stopInspection"/></tab>
                </tabs>
                <div class="footer">
                    <p class="footer-text">Made with <span class="heart"></span> by TAGLAB</p>
                </div>
                <notification ref="notification" :notificationData="notificationData"/>
        </div>
</template>

<script>
import Tab from './Tab.vue'
import Tabs from './Tabs.vue'
import TagView from './panels/TagView.vue'
import Crawls from './panels/Crawls.vue'
import DataLayerView from './panels/DataLayerView.vue'
import Scenarios from './panels/Scenarios.vue'
import {chromeHelper, isDevTools} from '../lib/chromeHelpers.js'
import Modal from './Modal.vue'
import Notification from './Notification.vue'
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import {findIndex as _findIndex, isMatch as _isMatch} from 'lodash'

export default {
    components: {
        Tab,
        Tabs,
        TagView,
        Crawls,
        DataLayerView,
        Scenarios,
        Modal,
        Notification
    },
    mounted() {
        if (isDevTools()) {
            this.tabId = chrome.devtools.inspectedWindow.tabId
            this.init();
        }
        this.toggleInspection()
    },
    methods: {
        primeExport() {
            let exportData = { tags: [], dLs: [] }
            console.log({ dataExport: this.data })
            this.data.map((url, index) => {
                console.log(url.pageUrl)
                url.events.map((event, index) => {
                    console.log({ event })

                    let exportTags = {
                        Url: url.pageUrl,
                        Event: event.name,
                    }
                    let exportDls = {
                        Url: url.pageUrl,
                        Event: event.name,
                    }
                    //Tags
                    if (event.tags !== undefined && event.tags.length > 0) {
                        event.tags.map((tag, index) => {
                            if (tag.content !== undefined) {
                                exportTags = {
                                    ...exportTags,
                                    Technology: tag.name,
                                    ...tag.content
                                }
                            }
                            exportData.tags.push(exportTags)
                        })
                    } else {
                        exportData.tags.push(exportTags)
                    }
                    //DLs
                    if (event.dataLayers !== undefined && event.dataLayers.length > 0) {
                        console.log({ dataLayers: event.dataLayers });
                        event.dataLayers.map((dL, index) => {

                            if (dL.data !== undefined) {
                                Object.keys(dL.data).forEach((key) => {
                                    exportData.dLs.push({
                                        ...exportDls,
                                        name: dL.dLN,
                                        "Push Event": key,
                                        ...this.flattenJsonObject(dL.data[key])
                                    })
                                })
                            }
                        })
                    } else {
                        exportData.dLs.push(exportDls)
                    }

                    console.log({ exportData })

                })
            })

            return exportData
        },

        editEventTitle(title, urlIndex, eventIndex) {
            console.log({ data: this.data });

            this.data[urlIndex].events[eventIndex].name = title
        },
        async init() {
            this.regexList = await this.getRegexList()
            this.dispatchListeners()
        },
        parsePostData(postData) {
            if (postData !== undefined) {
                console.log({ postData })
                const KeywordRegex = /[a-z]+=/;
                var keyword = postData.match(KeywordRegex)[0];
                console.log('keyword: ', keyword);

                //const regex = new RegExp( `${keyword}.*?(?=${keyword} | &${keyword}|$)` , 'gm');
                //const substrings = url.match(regex);
                const substrings = postData.replaceAll(/\n|\r/g, '').replaceAll(keyword, ';' + keyword).replace(';', '').split(';')
                let parsedData = []
                substrings.map((ele) => {
                    parsedData.push(this.getUrlParams('https://www.bienspasser.com?' + ele))
                })
                console.log('splits: ', parsedData);
                return parsedData || [];
            } else {
                return []
            }
        },
        parseInitiator(initiator) {
            let initiatiorData = {}
            if (initiator.type === 'script') {

                initiatiorData = {
                    type: 'script',
                    origin: initiator.stack.callFrames[0]?.url || initiator.stack.parent.callFrames[0]?.url
                }
                //console.log({initiatiorData});
            } else if (initiator.type === 'parser') {
                initiatiorData = {
                    type: 'parser',
                    origin: initiator.url
                }

                console.log({ initiatiorData, initiator });
            } else {
                console.log({ Else: 'Else', initiator });
            }

            return initiatiorData
        },
        devtoolsNetworkRequest(request) {


            const details = request.request
            this.regexList.forEach((element, index) => {
                if (RegExp(element.pattern).test(details.url) && element.ignore && details.hasOwnProperty('url') && this.isInspecting) {
                    var initiatorChain = [];
                    var initiator = request.initiator;
                    while (initiator) {
                        initiatorChain.push(initiator);
                        initiator = initiator.stack.callFrames[0].url;
                    }
                    console.log({ initiatorChain });

                    console.log({ request });
                    const urlParams = details.url
                    const postData = this.parsePostData(details.postData?.text)
                    const initiatior = this.parseInitiator(request._initiator)
                    const content = { ...{ request: details.url }, ...initiatior, ...this.getUrlParams(urlParams) }
                    if (!this.regexOccurances[element.name].passed) {
                        this.regexOccurances[element.name].passed = true
                        const occurences = this.regexOccurances[element.name].occurences + 1
                        this.$set(this.regexOccurances[element.name], 'occurences', occurences)
                    }
                    const data = { name: element.name, occurences: 0, content: content, timeStamp: Date.now(), payload: postData, initiatior: initiatior }
                    this.pushData(data, 'tags', element.name, element.iconPath)
                }
            })
        },
        dispatchListeners() {
            this.removeListeners();
            this.addEventListeners()
        },
        async getRegexList() {
            var regexList = await chromeHelper.localStorageGet(["regExPatterns"])
            const regexWarnMessage = {
                type: "warning",
                title: "Empty Regex Patterns List",
                message: "Regex patterns must be provided for recording tags"
            }
            if (!regexList.regExPatterns) {
                regexList.regExPatterns = []
                this.$refs.notification.makeNotification(regexWarnMessage)
            } else if (!regexList.regExPatterns.length) {
                this.$refs.notification.makeNotification(regexWarnMessage)
            }
            this.initRegexOccurances(regexList.regExPatterns)
            return regexList.regExPatterns
        },
        // TODO something fishy here ...
        initRegexOccurances(regexList) {
            if (regexList.length) {
                regexList.forEach((element) => {
                    this.regexOccurances[element.name] = { passed: false, occurences: 0 }
                })
            }
        },
        resetOccurancesCounter() {
            Object.keys(this.regexOccurances).forEach(key => {
                this.regexOccurances[key].passed = false;
            });
        },
        addEventListeners() {
            chromeHelper.listenOnLocalStorageChange(this.listenOnRegexChange)
            chromeHelper.listenOnTabUpdated(this.listenToUrlChanges)
            chromeHelper.listenOnTabClosed(this.handleTabclosed)
            chrome.devtools.network.onRequestFinished.addListener(this.devtoolsNetworkRequest)
            chromeHelper.listenToRuntimeMessages(this.captureDataLayer)
        },
        removeListeners() {
            chromeHelper.removeLocalStorageChangeListener(this.listenOnRegexChange)
            chromeHelper.removeRuntimeMessagesListener(this.captureDataLayer)
            chromeHelper.removeTabUpdatedListener(this.listenToUrlChanges)
            chromeHelper.removeTabClosedListener(this.handleTabclosed)
            chrome.devtools.network.onRequestFinished.removeListener(this.devtoolsNetworkRequest)
        },
        listenOnRegexChange(changes, areaName) {
            if (areaName === "local" && changes.regExPatterns) {
                this.regexList = changes.regExPatterns.newValue
            }
        },
        listenToUrlChanges(details) {
            //console.log('tab details', chrome.devtools);
            if (this.isValidHttpUrl(details)) {
                this.pushUrl(details)
                this.removeListeners()
                this.addEventListeners()
                this.injectMainContentScript()
            }
        },
        injectMainContentScript() {
            chromeHelper.injectScript({ target: { tabId: this.tabId }, files: ['content/content.js'] }, this.errorHandler)
        },
        pushUrl(url) {
            if (!this.isInspecting) return
            this.resetOccurancesCounter()
            const newUrlData = {
                pageUrl: url,
                events: [{ name: 'Load', timeStamp: Date.now() }]
            }
            this.$set(this.data, this.data.length, newUrlData)
        },
        isValidHttpUrl(string) {
            let url;
            try {
                url = new URL(string);
            } catch (_) {
                return false;
            }
            return url.protocol === "http:" || url.protocol === "https:";
        },
        getUrlParams(url) {
            if (!url.includes("?")) return {}
            try {
                const urlObject = new URL(url)
                var pairs = urlObject.search.slice(1).split('&');

                var result = {};
                pairs.forEach(function (pair) {
                    pair = pair.split('=');
                    result[pair[0]] = decodeURIComponent(pair[1] || '');
                });
                return result
                //return JSON.parse('{"' + url.split('?',2)[1].replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) })
            } catch (error) {
                return {}
            }
        },
        captureDataLayer(message, sender, sendResponse) {
            if (message.type === "content_click_event" && sender.tab.id === this.tabId && this.isInspecting) {
                this.pushEvent()
            }
            else if (this.allowedLayers.includes(message.type) && sender.tab.id === this.tabId && this.isInspecting && this.allowedDataLayers[message.type]) {
                var data = message
                try {
                    data.data = JSON.parse(message.data)
                } catch (e) {

                }
                this.pushData(data, 'dataLayers', data.type === 'var' ? data.dLN : data.type)
            }
        },
        pushEvent() {
            const urlListLength = this.data.length - 1
            const eventListLength = this.data[urlListLength]?.events.length
            this.$set(this.data[urlListLength].events, eventListLength, { name: "Click " + eventListLength, timeStamp: Date.now() })
        },
        pushData(data, name, identifier, icon) {
            try {
                const urlListLength = this.data.length - 1
                if (!this.data[urlListLength].hasOwnProperty('events')) return
                const eventListLength = this.data[urlListLength].events.length - 1
                this.queueData(data, name, urlListLength, eventListLength, icon)
                //this.pushExportData(data, name, urlListLength, eventListLength, identifier)
            } catch (error) {

            }

        },
        queueData(data, name, urlListLength, eventListLength, icon) {
            if (this.data[urlListLength].events[eventListLength][name] === undefined) {
                this.$set(this.data[urlListLength].events[eventListLength], name, [])
            }
            const isDuplicate = _findIndex(this.data[urlListLength].events[eventListLength][name], (o) => {
                return _isMatch(o, data)
            })
            if (isDuplicate > -1) return
            var index = this.data[urlListLength].events[eventListLength][name].length
            if (icon) data.icon = icon
            console.log({ name });
            this.$set(
                this.data[urlListLength].events[eventListLength][name],
                index,
                data
            )
        },
        flattenJsonObject(obj) {
            const flattened = {};
            Object.keys(obj).forEach((key) => {
                if (typeof obj[key] === "object" && obj[key] !== null) {
                    Object.assign(flattened, this.flattenJsonObject(obj[key]));
                } else {
                    flattened[key] = obj[key];
                }
            });
            return flattened;
        },
        async pushExportData(data, name, urlListLength, eventListLength, identifier) {
            if (name === 'tags') {
                this.tagExport.push({
                    ...{
                        Url: this.data[urlListLength].pageUrl,
                        'Analytics Type': identifier,
                        Event: this.data[urlListLength].events[eventListLength].name,
                    },
                    ...data.content
                })
            } else if (name === 'dataLayers' && data.data !== undefined) {
                console.log('inside dalayer export', data);
                console.log({ DLEXPORTMAIN: data.data[0] });
                Object.keys(data.data).forEach((key) => {
                    this.dlExport.push({
                        Url: this.data[urlListLength].pageUrl,
                        'Data Layer': identifier,
                        "Page Event": this.data[urlListLength].events[eventListLength].name,
                        "Push Event": key,
                        ...this.flattenJsonObject(data.data[key])
                    })
                })
                console.log({ theDLEXPORT: this.dlExport })
                /*data.data.map((element) => {
                    console.log('Inside element', element);
                    this.dlExport.push({
                        Url: this.data[urlListLength].pageUrl,
                        'Data Layer': identifier,
                        Event: this.data[urlListLength].events[eventListLength].name,
                        ...this.flattenObject(element)
                    })
                })*/
                /*this.dlExport.push({
                    ...{
                        Url: this.data[urlListLength].pageUrl,
                        'Data Layer': identifier,
                        Event: this.data[urlListLength].events[eventListLength].name,
                    },
                    ...data.data
                })*/
            }
        },

        pivot(arr) {
            console.log('this is pivot');
            var mp = new Map();

            function setValue(a, path, val) {
                if (Object(val) !== val) { // primitive value
                    var pathStr = path.join('.');
                    var i = (mp.has(pathStr) ? mp : mp.set(pathStr, mp.size)).get(pathStr);
                    a[i] = val;
                } else {
                    for (var key in val) {
                        setValue(a, key == '0' ? path : path.concat(key), val[key]);
                    }
                }
                return a;
            }

            var result = arr.map(obj => setValue([], [], obj));
            return [[...mp.keys()], ...result];
        },
        toCsv(arr) {
            return arr.map(row =>
                row.map(val => isNaN(val) ? JSON.stringify(val) : +val).join(',')
            ).join('\n');
        },
        generateTable(data) {
            if (data === undefined) return
            const table = data

            let columnsShalow = []
            let columns = []
            //console.log({table});
            table.instanceData.forEach((element, index) => {
                // console.log({element});
                if (Object.values(element).length === 0) {
                    table.instanceData.pop(index)
                }

                const _columns = Object.keys(element)
                Object.keys(element).forEach(element => {
                    if (!columnsShalow.includes(element)) {
                        columnsShalow.push(element)
                        columns.push(
                            {
                                title: element,
                                dataIndex: element,
                                field: element,
                                key: element + Math.random(),
                            })
                    }
                });
            });
        },
        resetData() {
            this.tagExport = []
            this.dlExport = []
            this.data = []
            this.initRegexOccurances(this.regexList)
            if (this.isInspecting) {
                this.toggleInspection()
                this.toggleInspection()
            }
        },
        errorHandler(errorAt) {
            if (chrome.runtime.lastError) {
                console.log("error: ", chrome.runtime.lastError);
            } else {
                //
            }
        },
        exportDataConfirm() {
            //this.getTechForExport()
            /*if(this.data.length<1 && this.dlExport.length<1) {
                const exportWarnMessage = {
                    type: "warning",
                    title: "No Data to Export",
                    message: "Start the inspection mode by clicking the record button"
                }
                this.$refs.notification.makeNotification(exportWarnMessage)
                return
            }*/
            this.showModal = true
        },
        exportData() {
            this.exportModalErrors = []
            if (!this.fileName) {
                this.exportModalErrors.push('File Name required.');
                return
            }
            var wb = XLSX.utils.book_new();
            const exportData = this.primeExport()
            console.log({ 'BEFORE EXPORERTT': exportData });
            var wsTags = XLSX.utils.json_to_sheet(exportData.tags);
            XLSX.utils.book_append_sheet(wb, wsTags, "Tags");

            var wsDLs = XLSX.utils.json_to_sheet(exportData.dLs);
            XLSX.utils.book_append_sheet(wb, wsDLs, "Data-Layer");

            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, this.fileName + ".xlsx");
            this.showModal = false


            /*return
            if(this.tagExport.length > 0) {
                ///this.export2CSV(this.tagExport, 'tags_')
                var wsBooks = XLSX.utils.json_to_sheet(this.tagExport);
                XLSX.utils.book_append_sheet(wb, wsBooks, "Tags");
            }
            console.log({dlExport: this.dlExport});
            if(this.dlExport.length > 0) {
                //this.export2CSV(this.dlExport, 'datalayers_')
                var wsPersonDetails = XLSX.utils.json_to_sheet(this.dlExport);
                XLSX.utils.book_append_sheet(wb, wsPersonDetails, "Data-Layer");
            }
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, this.fileName+".xlsx");    
            this.showModal= false*/
        },
        getTechForExport() {
            let tagExport = []
            let dlExport = []
            console.log({ data: this.data });
            const data = this.data
            data.map((url) => {
                const urlName = url.pageUrl
                url.events.map((event) => {
                    const eventName = event.name
                    console.log({ eventData: event });
                    if (event.tags !== undefined && event.tags.length > 0) {
                        event.tags.map((eventData) => {

                            tagExport.push({
                                url: urlName,
                                eventName: eventName,
                                Technology: eventData.name,
                                occurences: eventData.occurences,
                                ...eventData.content
                            })
                        })
                    } else {
                        tagExport.push({
                            url: urlName,
                            eventName: eventName,
                        })
                    }
                    if (event.dataLayers !== undefined && event.dataLayers.length > 0) {
                        event.dataLayers.map((eventData) => {
                            console.log({ dataEvent: eventData.data });
                            dlExport.push({
                                url: urlName,
                                eventName: eventName,
                                name: eventData.dLN,
                                data: eventData.data !== undefined ? this.pivot(eventData.data) : []
                            })
                        })
                    } else {
                        tagExport.push({
                            url: urlName,
                            eventName: eventName,
                        })
                    }
                    /*tagExport.push({
                        url: urlName,
                        event: event.name,
                    })*/
                })
            })
            console.log({ dlExport });
        },
        export2CSV(data, prefix) {
            console.log({ data })
            return
            const dataCSV = this.toCsv(this.pivot(data))
            var vLink = document.createElement('a')
            //var dataBlob = new Blob([JSON.stringify(this.data)], {type: "octet/stream"})
            //var fileName = this.fileName+".json"
            var dataBlob = new Blob([dataCSV], { type: "octet/stream" })
            var fileName = prefix + this.fileName + ".csv"
            var fileUrl = window.URL.createObjectURL(dataBlob);
            vLink.setAttribute('href', fileUrl)
            vLink.setAttribute('download', fileName)
            vLink.click()
            vLink.remove
            this.showModal = false
        },
        handleTabclosed(tabId) {
            if (tabId === this.tabId) {
                chrome.runtime.reload()
            }
        },
        async toggleInspection() {
            if (this.lockToggling) return

            this.isInspecting = !this.isInspecting
            if (this.isInspecting) {
                chromeHelper.reloadTab(this.tabId)
                this.dispatchListeners()
            }
        },
        startInspection() {
            this.lockToggling = true
            this.isInspecting = true
            this.dispatchListeners()
        },
        stopInspection() {
            this.removeListeners()
            this.lockToggling = false
            this.isInspecting = false
        }
    },

    data(){
        return{
            openNewTab : false,
            lockToggling: false,
            fileName: '',
            exportModalErrors: [],
            showModal: false,
            isInspecting: false,
            readyForInjection: true,
            regexList: [],
            regexOccurances: [],
            data: [],
            notificationData: [],
            tagExport: [],
            dlExport: [],
            allowedLayers: [ 
                'google_tag_manager_push', 
                'google_tag_manager', 
                'tealium', 
                'tag_commander', 
                'adobe_dtm', 
                'var', 
                'launchdataelements', 
                'adobetags' 
            ],
            allowedDataLayers:{
                'google_tag_manager_push': false, 
                'google_tag_manager': false, 
                'tealium': false, 
                'tag_commander': false, 
                'adobe_dtm': false, 
                'var': true, 
                'launchdataelements': true, 
                'adobetags': false 
            }
        }
    }
}
</script>

<style lang="css">
* {
    margin: 0;
    padding: 0;
}

.wrapper {
    max-width: 100%;
    margin: 0;
    /* padding: 0px 0px; */
    padding-bottom: 0;
    position: relative;
}
.footer{
    position: absolute;
    bottom: 0;
    right: 50%;
    translate: 50%;
    margin-bottom: 10px;

}
.footer-text{
    font-size: xx-small;
    font-family: 'Poppins';
    font-weight: 400;
}
.heart{
    background-image: url("data:image/svg+xml,%3Csvg xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' version='1.0' width='645' height='585' id='svg2'%3E%3Cdefs id='defs4' /%3E%3Cg id='layer1'%3E%3Cpath d='M 297.29747,550.86823 C 283.52243,535.43191 249.1268,505.33855 220.86277,483.99412 C 137.11867,420.75228 125.72108,411.5999 91.719238,380.29088 C 29.03471,322.57071 2.413622,264.58086 2.5048478,185.95124 C 2.5493594,147.56739 5.1656152,132.77929 15.914734,110.15398 C 34.151433,71.768267 61.014996,43.244667 95.360052,25.799457 C 119.68545,13.443675 131.6827,7.9542046 172.30448,7.7296236 C 214.79777,7.4947896 223.74311,12.449347 248.73919,26.181459 C 279.1637,42.895777 310.47909,78.617167 316.95242,103.99205 L 320.95052,119.66445 L 330.81015,98.079942 C 386.52632,-23.892986 564.40851,-22.06811 626.31244,101.11153 C 645.95011,140.18758 648.10608,223.6247 630.69256,270.6244 C 607.97729,331.93377 565.31255,378.67493 466.68622,450.30098 C 402.0054,497.27462 328.80148,568.34684 323.70555,578.32901 C 317.79007,589.91654 323.42339,580.14491 297.29747,550.86823 z' id='path2417' style='fill:%23ff0000' /%3E%3Cg transform='translate(129.28571,-64.285714)' id='g2221' /%3E%3C/g%3E%3C/svg%3E%0A");
    height: 12px;
    display: inline-block;
    width: 12px;
    background-repeat: no-repeat;
    background-size: contain;
}

</style>