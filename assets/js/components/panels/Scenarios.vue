<template>
    <div class="scenario-panel">
        <div class="panel-top">
            <control-bar :isInspecting="false" :controlBar="controlBar" @toggleInspection="openCreateScenarioModal" @resetData="resetData" @collapseAll="collapseAll" @expandAll="expandAll" :panel="'Scenarios'"/>
        </div>
        <transition name="modal">
            <modal v-if="showModal" @close="showModal = false" key="new-scenario-modal">
                <template v-slot:header>
                    <h3 style="color: #2ca148;">Create New Scenario</h3>
                    <p style="font-weight: 500; font-size: medium; color: #0f0f0f; text-align: center; margin: 1rem 0;">Build your test cases flow by creating a scenario and performing your steps on your webpage</p>
                    <p style="font-weight: 500; font-size: small; color: #5f5f5f; text-align: center; margin: 1rem 0;">Interactions will be captured as commands that can be automated for repetitive execution</p>
                </template>
                <template v-slot:body>
                    <div class="new-scenario-fields">
                        <div>
                            <input type="text" id="newScenarioName" name="newScenarioName" v-model="newScenarioName" placeholder="Scenario name">
                        </div>
                        <div>
                            <input type="text" id="startingUrl" name="startingUrl" v-model="startingUrl"  placeholder="URL">
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
                    <div class="scenario-add-footer">
                    <button class="primary-btn" @click="createScenario">Create</button>
                    <button class="btn" @click="showModal = false">Cancel</button>
                    </div>
                </template>
            </modal>
        </transition>
        <div class="scenarios-wrapper">
            <div class="scenarios">
                <accordion styling="rounded green-header accordion-shadow" :title="scenario.name" v-for="(scenario, index) in recordedEvents" :key="'scenario-'+index" :isOpen="(recordedEvents.length - index - 1) === 0">
                    <template v-slot:buttons>
                        <button style="color: white;background-color: #2ca148; padding: 2px 4px;" @click="initRecording(index)" v-if="!isRecording && index == recordedEvents.length - 1 && !scenario.events.length">Record</button>
                        <button style="background-color: orange; color: white; padding: 2px 4px;"  @click="stopRecording" v-if="isRecording && index == recordedEvents.length - 1">Stop Recording</button>
                        <button style="background-color: red; color: white; padding: 2px 4px;" @click="deleteScenario(index)">Delete</button>
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
                            <tr  v-for="(event, _index) in scenario.events" :key="'event-'+_index" :class="event.state">
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
                    
                    <div style="background-color: #E6E9E6; border-radius: 10px; padding: 2rem; margin-top: 2rem; display: flex; flex-direction: column;justify-content: center; align-items: center; width: -webkit-fit-available;">
                        <h4 style="font-weight: 200;">Save you scenario JSON Mapping and upload it to Taglab Web</h4>

                        <div style="display: flex; gap:2rem; width: -webkit-fit-available; margin-top: 2rem; flex-wrap: wrap;">
                            <button @click="exportScenario(index)" class="primary-btn" style="padding: 0.5rem 2rem;font-size: 14px;">Save to File</button>
                            <a  href="https://taglab.net/?utm_source=extension&utm_medium=owned-media&utm_campaign=scenario" target="_blank" class="primary-btn" style="padding: 0.5rem 2rem; font-size: 14px;">Go to Taglab Web</a>
                        </div> 
                    </div>

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
        exportScenario(index) {
            const scenario = this.recordedEvents[index];
            const data = []

            const getUrl = scenario.startingUrl
            const start = {
                action: 'getUrl',
                    items: {
                        url: getUrl,
                        step_name: "Start",
                        sensitiveCheckBox: false,
                        mandatoryCheckBox: true,
                        screenShotCheckBox: true
                    }
            }
            data.push(start)

            scenario.events.forEach((e, i) => {
                let d;
                switch (e.command) {
                    case 'click':
                        d = {
                            action: e.command,
                                items: {
                                    click_attr_name: "XPATH",
                                    click_attr_value: e.target,
                                    step_name: `${e.command}_${i+1}`,
                                    sensitiveCheckBox: false,
                                    mandatoryCheckBox: true,
                                    screenShotCheckBox: true
                                }
                        }
                        break
                    case "input":
                        d = {
                            action: e.command,
                                items: {
                                    input_attr_name: "XPATH",
                                    input_attr_value: e.target,
                                    input_text:e.value,
                                    step_name: `${e.command}_${i+1}`,
                                    sensitiveCheckBox: false,
                                    mandatoryCheckBox: true,
                                    screenShotCheckBox: true
                                }
                        }
                        break
                }
                if (d) {
                    data.push(d)
                }
                
            })

            const blob = new Blob([JSON.stringify(data)], {type: 'text/plain'})
            const e = document.createEvent('MouseEvents'),
            a = document.createElement('a');
            a.download = `${scenario.name}.json`;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
            
        },

        deleteScenario(index) {
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
.scenario-add-footer{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
}

.scenario-add-footer button {
    width: 100%;
    font-size: small;
    padding: 1rem 2rem;
}

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

.scenarios table {
  border-collapse: separate;
  text-align: left;
  width: 100%;

}

.scenarios table th,.scenarios table td{
    padding: 10px;
    min-width: 75px;
    font-size: small;
}

.scenarios table th{ 
  background-color: rgb(216, 216, 216);
  text-align: center;
  font-weight: 400;
}

.scenarios table td {
  background-color: rgb(239, 239, 239);
  font-weight: 300;
  font-size: x-small;
}

.new-scenario-fields{
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
}

.new-scenario-fields input {
    width: -webkit-fill-available;
    padding: 1rem;
    border: 1px solid #2ca148;
    border-radius: 45px;
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