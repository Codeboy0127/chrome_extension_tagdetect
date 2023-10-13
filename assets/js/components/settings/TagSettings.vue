<template>
    <div class="tag-settings-panel settings-panel custom-scrollbar" style="display: none">
        <h2>Settings</h2>
        <div class="regex-manager">
            <h3>
                
                <div class="add-regex-container">
                    <span>Regex patterns:</span>
                    <button class="simple-button" @click='showModal = true'>Add new pattern</button>
                </div>
            </h3>
            <div class="regex-table-container">
                <div class="regex-table-wrapper">
                    <div class="regex-wrapper" v-for="(regEx, index) in regExPatterns" :key="'regex-pattern-'+index">
                        <div class="regex-info">
                            <img class="regex-icon" v-if="regEx.iconPath" :src="getIconPath(index)"/>
                            <p><span>{{ regEx.name }}</span> <input type="checkbox" v-model="regEx.ignore"/></p>
                        </div>
                        <div class="regex-pattern">
                            <p>{{ regEx.pattern }}</p>
                        </div>
                        <div class="regex-actions actions" v-if="regEx.canBeDeleted">
                            <span class="simple-button small blue" @click="editRegex(index)">Edit</span>
                            <span class="simple-button small red" @click="deleteRegex(index)">Delete</span>
                        </div>
                    </div>
                </div>
            </div>
            <transition name="modal">
                <modal v-if="showModal" @close="showModal = false" key="new-regex-pattern">
                    <template v-slot:header>
                        <h3>Add new Regex Pattern</h3>
                    </template>
                    <template v-slot:body>
                        <div class="add-regex-fields">
                            <div>
                                <label for="regexName">Pattern Name</label>
                                <input type="text" id="regexName" name="regexName" v-model="regexName" placeholder="Ex: Google Analytics">
                            </div>
                            <div>
                                <label for="regexPattern">Regex Name</label>
                                <input type="text" id="regexPattern" name="regexPattern" v-model="regexPattern" placeholder=".*\.google-analytics\..*">
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
                        <button @click="addRegexPattern" class="simple-button small">{{ RegExIdToEdit >= 0 ? 'Edit' : 'Add' }}</button>
                        <button @click="closeModal" class="simple-button small red">Cancel</button>
                    </template>
                </modal>
            </transition>
        </div>
    </div>
</template>
<script>
import Modal from './../Modal.vue'
import chromeHelper from '../../lib/chromeHelpers.js'

export default {
    components: {
        Modal
    },
    watch: {
        regExPatterns: {
            handler(newAllowed, oldAllowed){
                this.updateRegex()
            },
            deep: true
        }
    },
    mounted(){
        this.fetchRegExPatterns()
    },
    methods:{
        closeModal(){
            this.RegExIdToEdit = -1
            this.regexName = ''
            this.regexPattern = ''
            this.showModal = false
        },
        editRegex(id){
            this.RegExIdToEdit = id
            this.showModal = true
            this.regexName = this.regExPatterns[id].name
            this.regexPattern = this.regExPatterns[id].pattern
        },
        fetchRegExPatterns(){
            chrome.storage.local.get(["regExPatterns"]).then((result) => {
                this.regExPatterns = result.regExPatterns ?? []
            });
        },
        isRegExValid(){
            try{
                RegExp(this.regexPattern)
                return true
            } catch(e){
                return false
            }
        },
        async addRegexPattern(){
            this.errors = [];
            if(this.regexName && this.regexPattern && this.isRegExValid()){
                const id = this.RegExIdToEdit >= 0 ? this.RegExIdToEdit : this.regExPatterns.length
                this.$set(this.regExPatterns, id,
                    {
                        id: id,
                        name: this.regexName,
                        pattern: this.regexPattern,
                        ignore: false,
                        canBeDeleted: true
                    }
                )
                this.RegExIdToEdit = -1
                //await chromeHelper.localStorageSet({ regExPatterns: this.regExPatterns })
                this.showModal = false
            }
            else if(!this.regexName){
                this.errors.push('Regex Name required.');
            }else if(!this.regexPattern){
                this.errors.push('Regex Pattern required.');
            }else{
                this.errors.push('Regex Pattern invalid.');
            }
            
            this.regexName = ''
            this.regexPattern = ''
        },
        deleteRegex(id){
            this.regExPatterns.splice(id, 1);
            //chromeHelper.localStorageSet({ regExPatterns: this.regExPatterns })
        },
        updateRegex(){
            chromeHelper.localStorageSet({ regExPatterns: this.regExPatterns })
        },
        getIconPath(index){
            if(this.regExPatterns[index].hasOwnProperty('iconPath'))
                return '../../images/regex_icons/'+this.regExPatterns[index].iconPath
        }
    },
    computed:{
        getRegExPatterns(){
            return this.regExPatterns
        },
    },
    data(){
        return{
            RegExIdToEdit: -1,
            showModal: false,
            errors: [],
            regExPatterns: [],
            regexName: '',
            regexPattern: ''
        }
    }
}
</script>

<style lang="css" scoped>
.regex-table-container {
  max-width: 1000px;
  margin: 0 auto;
}
.regex-manager{
    margin-top: 18px;
}
/* TABLE STYLES
–––––––––––––––––––––––––––––––––––––––––––––––––– */
.regex-wrapper {
    width: 200px;
    min-width: 200px;
    border-radius: 9px;
    border: 1px solid #cdcdcd;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    font-size: 14px;
    direction: ltr;
}

.regex-table-wrapper {
    display: flex;
    flex-flow: wrap-reverse;
    row-gap: 12px;
    column-gap: 12px;
    margin: 20px 0px;
    direction: rtl;
}

.regex-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #cdcdcd;
}

.regex-pattern {
    padding: 12px;
    word-break: break-all;
    position: relative;
}

.regex-actions.actions {
    padding: 6px;
    padding-top: 0;
}

.regex-table-wrapper .actions{
    display: flex;
    column-gap: 8px;
    font-weight: bold;
    text-transform: uppercase;
    justify-content: flex-end;
}
.regex-table-wrapper .actions span{
    cursor: pointer;
}

.add-regex-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-transform: uppercase;
    font-weight: bold;
}

.add-regex-fields {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
}
img.regex-icon {
    max-width: 30px;
}


.regex-info p {
    display: flex;
    column-gap: 4px;
}

.regex-info {column-gap: 16px;}

.regex-pattern {
    margin-bottom: auto;
}

.regex-info {column-gap: 16px;}

@media screen and (max-width: 600px) {
}
  
</style>