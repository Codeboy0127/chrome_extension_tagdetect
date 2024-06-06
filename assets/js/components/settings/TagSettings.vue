<template>
    <div class="tag-settings-panel settings-panel custom-scrollbar" style="display: none">
        <div class="regex-manager">
            <!-- <div class="add-regex-container">
                <span>Regex patterns:</span>
                <button class="sec-btn" style="padding: 0.5rem 1rem;" @click='showModal = true'>Add new pattern</button>
            </div> -->
            <div class="regex-table-container">
                <div class="regex-table-wrapper">
                    <div class="regex-acc" v-for="(regEx, index) in filteredRegExPatterns" :key="'regex-pattern-' + index"
                        v-on:click="toggleAccordion">
                        <div class="regex-acc-header">
                            <div>
                                <input type="checkbox" :checked="!regEx.ignore ? 'checked' : null"
                                    @click="toggleRegex($event, index)" />
                                <img class="regex-icon" v-if="regEx.iconPath" :src="getIconPath(index)" />
                                <p>{{ regEx.name }}</p>
                            </div>
                            <div>
                                <div style="display: flex; gap:1.5rem;" v-if="regEx.canBeDeleted">
                                    <div class="regex-action" @click="editRegex(index)">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">

                                            <path
                                                d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z" />
                                        </svg>
                                    </div>
                                    <div class="regex-action" @click="deleteRegex(index)">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                            <path
                                                d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
                                        </svg>
                                    </div>
                                </div>
                                <span class="acc-btn"></span>
                            </div>
                        </div>
                        <div class="regex-acc-content">
                            <p style="padding: 1rem 0;">{{ regEx.pattern }}</p>
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
                                <input type="text" id="regexName" name="regexName" v-model="regexName"
                                    placeholder="Pattern Name">
                            </div>
                            <div>
                                <input type="text" id="regexPattern" name="regexPattern" v-model="regexPattern"
                                    placeholder="Regex Pattern">
                            </div>
                            <div>
                                <p v-if="errors.length" style="font-size: small;">
                                    <span style="font-weight: 300;">Please correct the following error(s):</span>
                                <ul>
                                    <li style="font-weight: 200; color: brown;" v-for="error in errors" :key="error">{{
                                        error }}</li>
                                </ul>
                                </p>
                            </div>
                        </div>
                    </template>
                    <template v-slot:footer>
                        <div class="regex-add-footer">
                            <button @click="addRegexPattern" class="primary-btn">{{ RegExIdToEdit >= 0 ? 'Edit' : 'Add'
                                }}</button>
                            <button @click="closeModal" class="btn">Cancel</button>
                        </div>
                    </template>
                </modal>
            </transition>
        </div>
    </div>
</template>
<script>
import Modal from './../Modal.vue'
import chromeHelper from '../../lib/chromeHelpers.js'
import { pageInteractionEvent } from "../../google-analytics";
// import { store } from '../../store.js'

export default {
    components: {
        Modal
    },
    props: {
        tags: {
            type: Array,
            defaultValue: []
        },
        query: {
            type: String,
            defaultValue: ''
        }
    },
    watch: {
        regExPatterns: {
            handler(newAllowed, oldAllowed) {
                this.updateRegex()
            },
            deep: true
        }
    },
    mounted() {
        this.fetchRegExPatterns()
    },
    methods: {
        toggleAccordion({ target }) {
            const container = target.closest('.regex-acc');
            const content = container.lastElementChild;
            container.classList.toggle("active");
            if (content.style.maxHeight) {
                content.style.maxHeight = null
            } else {
                content.style.maxHeight = '100px'
            };
        },
        closeModal() {
            this.RegExIdToEdit = -1
            this.regexName = ''
            this.regexPattern = ''
            this.showModal = false
        },
        editRegex(id) {
            this.RegExIdToEdit = id
            this.showModal = true
            this.regexName = this.regExPatterns[id].name
            this.regexPattern = this.regExPatterns[id].pattern
        },
        fetchRegExPatterns() {
            chrome.storage.local.get(["regExPatterns"]).then((result) => {
                this.regExPatterns = result.regExPatterns ?? []
                // store.activeRegExPatterns = this.regExPatterns;
                console.log(this.regExPatterns);
            });
        },
        isRegExValid() {
            try {
                RegExp(this.regexPattern)
                return true
            } catch (e) {
                return false
            }
        },
        async addRegexPattern() {
            pageInteractionEvent("Tags View", "settings_add_new_regex_pattern")
            this.errors = [];
            if (this.regexName && this.regexPattern && this.isRegExValid()) {
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
            else if (!this.regexName) {
                this.errors.push('Regex Name required.');
            } else if (!this.regexPattern) {
                this.errors.push('Regex Pattern required.');
            } else {
                this.errors.push('Regex Pattern invalid.');
            }

            this.regexName = ''
            this.regexPattern = ''
        },
        deleteRegex(id) {
            this.regExPatterns.splice(id, 1);
            //chromeHelper.localStorageSet({ regExPatterns: this.regExPatterns })
        },
        updateRegex() {
            chromeHelper.localStorageSet({ regExPatterns: this.regExPatterns })
        },
        getIconPath(index) {
            if (this.regExPatterns[index].hasOwnProperty('iconPath'))
                return '../../images/regex_icons/' + this.regExPatterns[index].iconPath
        },
        toggleRegex($event, index) {
            const ignore = $event.target.checked
            const regex = this.regExPatterns[index]
            regex.ignore = !ignore
            this.regExPatterns[index] = regex;
            console.log(this.regExPatterns);
        }
    },
    computed: {
        getRegExPatterns() {
            return this.regExPatterns
        },
        filteredRegExPatterns() {
            if (!this.query.length) return this.regExPatterns;
            return _.filter(this.regExPatterns, item => _.includes(this.tags, item.name))
        }
    },
    data() {
        return {
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
.regex-add-footer {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
}

.regex-add-footer button {
    width: 100%;
    font-size: small;
    padding: 1rem 2rem;
}

.regex-acc {
    background-color: #fff;
    width: auto;
    min-width: 200px;
    border-radius: 0.5rem;
    border: 1px solid #e8e8e8;
}

.regex-acc-header {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    font-weight: 200;
    border-bottom: 1px solid #e8e8e8;
}

.regex-acc-header div {
    display: flex;
    align-items: center;
    font-size: small;
    gap: 0.5rem
}

.regex-acc-header div:first-child {
    justify-content: flex-start;
    font-weight: 200;
}

.regex-acc-header div:last-child {
    gap: 1.5rem;
    justify-content: flex-end;
}

.regex-acc-header .acc-btn:after {
    content: '\02795';
    font-size: small;
    color: #5a5a5a;
    font-weight: 200;
}

.regex-acc-content {
    padding: 0 1rem;
    font-size: small;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.2s ease-out;
}

.regex-acc.active .acc-btn:after {
    content: "\2796";
}

.regex-action {
    padding: 0.5rem;
    border-radius: 0.5rem;
}

.regex-action:hover {
    background-color: #e8e8e8;
}

.regex-table-container {
    max-width: 1000px;
    margin: 0 auto;
}

.regex-manager {
    /* margin-top: 18px; */
}

/* TABLE STYLES
–––––––––––––––––––––––––––––––––––––––––––––––––– */
.regex-wrapper {
    /* width: 200px; */
    min-width: 200px;
    border-radius: 9px;
    border: 1px solid #e8e8e8;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    direction: ltr;

}

.regex-table-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 20px 0px;
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

.regex-table-wrapper .actions {
    display: flex;
    column-gap: 8px;
    font-weight: bold;
    text-transform: uppercase;
    justify-content: flex-end;
}

.regex-table-wrapper .actions span {
    cursor: pointer;
}

.add-regex-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 400;
    font-size: small;
}

.add-regex-fields {
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
}

.add-regex-fields input {
    width: -webkit-fill-available;
    padding: 1rem;
    border-radius: 45px;
}

img.regex-icon {
    max-width: 30px;
}

.regex-info p {
    display: flex;
    column-gap: 4px;
}

.regex-info {
    column-gap: 16px;
}

.regex-pattern {
    margin-bottom: auto;
}

.regex-info {
    column-gap: 16px;
}

@media screen and (max-width: 600px) {}
</style>