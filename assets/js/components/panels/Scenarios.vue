<template>
    <div class="scenario-panel">
        <div class="panel-top">
            <control-bar :isInspecting="false" :controlBar="controlBar" @toggleInspection="openCreateScenarioModal" @resetData="resetData" @collapseAll="collapseAll" @expandAll="expandAll" :panel="'Scenarios'"/>
        </div>
        <transition name="modal">
            <modal v-if="showModal" @close="showModal = false" key="new-scenario-modal">
                <template v-slot:header>
                    <h3>Create New Scenario</h3>
                </template>
                <template v-slot:body>
                    <div class="new-scenario-fields">
                        <div>
                            <label for="newScenarioName">New Scenario Name</label>
                            <input type="text" id="newScenarioName" name="newScenarioName" v-model="newScenarioName" placeholder="Scenario name">
                        </div>
                        <div>
                            <label for="startingUrl">Starting Url</label>
                            <input type="text" id="startingUrl" name="startingUrl" v-model="startingUrl"  placeholder="www.google.com">
                        </div>
                        <div>
                            <p v-if="errors.length">
                                <b>Please correct the following error(s):</b>
                                <ul>
                                <li v-for="error in errors">{{ error }}</li>
                                </ul>
                            </p>
                        </div>
                    </div>
                </template>
                <template v-slot:footer>
                    <button class="simple-button" @click="createScenario">Create</button>
                    <button class="simple-button red" @click="showModal = false">Cancel</button>
                </template>
            </modal>
        </transition>
        <div class="scenarios-wrapper">
            <div class="scenarios">
                <accordion styling="rounded green-header" :title="scenario.name" v-for="(scenario, index) in recordedEvents" :key="'scenario-'+index" :isOpen="(recordedEvents.length - index - 1) === 0">
                    <template v-slot:buttons>
                        <button @click="initRecording(index)" v-if="!isRecording && index == recordedEvents.length - 1 && !scenario.events.length">Record</button>
                        <button @click="stopRecording" v-if="isRecording && index == recordedEvents.length - 1">Stop Recording</button>
                        <button @click="deleteScenario(index)">Delete</button>
                    </template>
                    <table>
                        <thead>
                            <tr>
                                <th>Command</th>
                                <th>Target</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr  v-for="(event, index) in scenario.events" :key="'event-'+index" :class="event.state">
                                <td>
                                    {{ event.command }}
                                </td>
                                <td class="xpath">
                                    {{ event.target }}
                                </td>
                                <td>
                                    {{ event.value }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </accordion>
            </div>
        </div>
    </div>
</template>
<script>
import Modal from '../Modal.vue'
import Accordion from '../Accordion.vue'
import {chromeHelper, isDevTools} from '../../lib/chromeHelpers.js'
import ControlBar from '../ControlBar.vue';

  export default {
    components: {
        Modal,
        Accordion,
        ControlBar
    },
    methods: {
        openCreateScenarioModal(){
            if(!this.isRecording&&!this.playBackStarted){
                this.showModal = true
            }else{
                
            const scenarioClearErrorMessage = {
                    type: "warning",
                    title: "Cannot create new scenario now",
                    message: "Recording/Playback has first to be stoped before creating a new scenarios."
                }
            this.$parent.$parent.$parent.$refs.notification.makeNotification(scenarioClearErrorMessage)
            }
        },
        createScenario(){
            this.errors = [];
            if(!this.newScenarioName){
                this.newScenarioName = 'Untitled Scenario '+this.untitledIncrement++
            }
            if(!this.startingUrl){
                this.errors.push('Starting url required.');
                return
            }else if(this.startingUrl){
                const url = this.startingUrl.includes('https://') || this.startingUrl.includes('http://') ? this.startingUrl : 'https://'+this.startingUrl
                if(!this.isValidHttpUrl(url)){
                    this.errors.push('Invalid Url.');
                    return
                }
            }
            if(this.newScenarioName && this.startingUrl){
                const url = this.startingUrl.includes('https://') || this.startingUrl.includes('http://') ? this.startingUrl : 'https://'+this.startingUrl
                this.recordedEvents.push({
                name: this.newScenarioName,
                startingUrl: url,
                events: []
                })
                this.newScenarioName = ""
                this.startingUrl = "https://stackoverflow.com/"
                this.showModal = false
            }
            
        },
        resetData(){
            if(!this.isRecording&&!this.playBackStarted){
                this.recordedEvents= []
            }else{
                
            const scenarioClearErrorMessage = {
                    type: "warning",
                    title: "Cannot Delete all Scenarios now",
                    message: "Recording/Playback has first to be stoped before clearing the scenarios."
                }
            this.$parent.$parent.$parent.$refs.notification.makeNotification(scenarioClearErrorMessage)
            }
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
        deleteScenario(index){
            this.recordedEvents.splice(index, 1);
        },
        //Recording
        async createWindow(index){
            chromeHelper.updateTab(chrome.devtools.inspectedWindow.tabId, {url: this.recordedEvents[index].startingUrl}, this.errorHandler)
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
        listenToUrlChanges(details){
            if(this.isValidHttpUrl(details)){ 
                console.log('injecting recorder script on recording')               
                this.injectRecorderContentScript()
            }
        },
        injectRecorderContentScript(){
            chromeHelper.injectScript({ target: {tabId: this.tabId}, files: ['content/recorder_content.js'] }, this.errorHandler)
        },
        async initRecording(index){
            if(!this.isRecording){
                chromeHelper.listenOnTabUpdated(this.listenToUrlChanges)
                this.createWindow(index)
                this.$emit("startInspection")
            }
            this.isRecording = !this.isRecording
        },
        stopRecording(){
            chromeHelper.removeTabUpdatedListener(this.listenToUrlChanges)
            this.$emit("stopInspection")
            this.isRecording = false
        },
        initEventCapture(message, sender, sendResponse){
            if (message.type === "recorder_message" && this.isRecording === true){
                this.$set(
                    this.recordedEvents[this.recordedEvents.length-1].events,
                    this.recordedEvents[this.recordedEvents.length-1].events.length,
                    message
                )
            }
        },
        //Playback
        //TODO - Refactor this
        
        stopPlayback(){
            this.resetState()
            chromeHelper.removeTabUpdatedListener(this.listenOnPlaybackUrlChanges)
            this.$emit("stopInspection")
            this.playBackStarted = false
        },
        async initPlayback(scenarioIndex){
            this.scenarioIndex = scenarioIndex
            this.playBackStarted = false
            this.createWindow(scenarioIndex)
            this.$emit("startInspection")

            //this.injectPlaybackScript()
            chromeHelper.listenOnTabUpdated(this.listenOnPlaybackUrlChanges)
            this.startPlayback()
        },

        listenOnPlaybackUrlChanges(details){
            if(details.frameId === 0 && details.tabId === this.tabId && this.isValidHttpUrl(details.url)){
                this.injectPlaybackContentScript()
            }
        },
        injectPlaybackContentScript(){
            chromeHelper.injectScript({ target: {tabId: this.tabId}, files: ['content/playback_content.js'] }, this.errorHandler)
        },
        injectPlaybackScript(){
            chrome.tabs.onUpdated.addListener(this.executePlayBackScript)
        },
        executePlayBackScript(changeInfo){
            if(changeInfo){
                    chrome.scripting.executeScript({
                        target: {tabId: this.tabId},
                        files: ['content/playback_content.js']
                    }, this.errorHandler );
                }
        },
        startPlayback(){
            chrome.runtime.onMessage.addListener(
                (message, sender, sendResponse) => {
                    if (message.type === "playback_listen"){
                        if(!this.playBackStarted){
                            this.playBackStarted = true;
                            this.executeEvent(0)
                        }
                    }
                }
            )
        },
        executeEvent(eventIndex){
            if(eventIndex < this.recordedEvents[this.scenarioIndex].events.length && this.playBackStarted){
                this.$set(this.recordedEvents[this.scenarioIndex].events[eventIndex], "state", "processing")
                if(eventIndex !== 0){
                    setTimeout(() => {
                        this.sendEvent( eventIndex)
                    }, this.recordedEvents[this.scenarioIndex].events[eventIndex].time - this.recordedEvents[this.scenarioIndex].events[eventIndex - 1].time);
                }else{
                    this.sendEvent( eventIndex)
                }
            }
        },
        sendEvent(eventIndex){
            chrome.tabs.sendMessage(this.tabId, {type: "playback_events", events: this.recordedEvents[this.scenarioIndex].events[eventIndex]}, (response)=>{
                if(response === undefined){
                    this.$set(this.recordedEvents[this.scenarioIndex].events[eventIndex], "state", "failed")
                    console.log("error: ", chrome.runtime.lastError);
                }
                else if(response.state === "success"){
                    this.$set(this.recordedEvents[this.scenarioIndex].events[eventIndex], "state", "success")
                    this.executeEvent( eventIndex + 1)
                }
            });
        },      
        errorHandler(errorAt){
            if(chrome.runtime.lastError){
                console.log("error at: ", errorAt, chrome.runtime.lastError);
            }else{
                //
            }
        },
        collapseAll(){
            $('.scenario-panel .accordion').find('h3').each(function (index, element) {
                $(this).next('.content').slideUp(500);    
                $(this).removeClass('selected');
            });
        },
        expandAll(){
            $('.scenario-panel .accordion').find('h3').each(function (index, element) {
                $(this).next('.content').slideDown(300);    
                $(this).addClass('selected');
            });
        },
        resetState(){
            this.recordedEvents.forEach((scenario) => {
                scenario.events.forEach((event) => {
                    event.state = ''
                })
            })
        }
    },
    mounted(){
        this.tabId = chrome.devtools.inspectedWindow.tabId
        chromeHelper.listenToRuntimeMessages(this.initEventCapture)
    },
    data(){
        return {
            untitledIncrement: 1,
            errors: [],
            tabId: null,
            recordedEvents: [],
            playBackStarted: false,
            showModal: false,
            newScenarioName: "",
            testArray: [1,2,3,4,5,6],
            isRecording: false,
            scenarioIndex: -1,
            startingUrl: "",
            controlBar: {
                record: true,
                clear: true,
                collapse: true,
                expand: true,
                save: false,
                import: false,
                settings: false,
            }
        }
    }
  }
</script>

<style lang="css">
.scenarios {
  overflow-x: auto;
}

.scenarios::-webkit-scrollbar {
  height: 8px;
}

.scenarios::-webkit-scrollbar-thumb {
  background: var(--darkblue);
  border-radius: 40px;
}
/*
.scenarios::::-webkit-scrollbar-track {
  background: var(--white);
  border-radius: 40px;
}
*/
.scenarios table {
  border-collapse: collapse;
  text-align: left;
  width: 100%;
}

.scenarios table th,
.scenarios table td {
  padding: 10px;
  min-width: 75px;
}

.scenarios table th {
  color: var(--white);
  background: var(--darkblue);
}

.scenarios table tbody tr:nth-of-type(even) > * {
  background: var(--lightblue);
}
.new-scenario-fields{
    display: flex;
    flex-direction: column;
    row-gap: 12px;
}
.scenarios table tr.success{
    background-color: #b2e8b2;
}
.scenarios table tr.processing{
    background-color: #ffffaf;
}
.scenarios table tr.failed{
    background-color: #ff9f9f;
}

.scenarios table td.xpath{
  width: 73%;
  word-wrap: break-word;
  word-break: break-all;
}

</style>