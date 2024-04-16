<template>
  <div
    class="dl-settings-panel settings-panel custom-scrollbar"
    style="display: none"
  >
    <div v-if="false">
      <h3>Predefined tags:</h3>
      <div class="default-object-layers-container">
        <div class="default-object-layers-column">
          <label for="google_tag_manager_push"
            ><input
              type="checkbox"
              id="google_tag_manager_push"
              v-model="allowedDataLayers.google_tag_manager_push"
            /><span>Google Tag Manager Push</span></label
          >
          <label for="google_tag_manager"
            ><input
              type="checkbox"
              id="google_tag_manager"
              v-model="allowedDataLayers.google_tag_manager"
            /><span>Google Tag Manager</span></label
          >
          <label for="tealium"
            ><input
              type="checkbox"
              id="tealium"
              v-model="allowedDataLayers.tealium"
            /><span>Tealium</span></label
          >
          <label for="tag_commander"
            ><input
              type="checkbox"
              id="tag_commander"
              v-model="allowedDataLayers.tag_commander"
            /><span>TagCommander</span></label
          >
        </div>
        <div class="default-object-layers-column">
          <label for="adobe_dtm"
            ><input
              type="checkbox"
              id="adobe_dtm"
              v-model="allowedDataLayers.adobe_dtm"
            /><span>Adobe DTM</span></label
          >
          <label for="launchdataelements"
            ><input
              type="checkbox"
              id="launchdataelements"
              v-model="allowedDataLayers.launchdataelements"
            /><span>Launch Elements</span></label
          >
          <label for="adobetags"
            ><input
              type="checkbox"
              id="adobetags"
              v-model="allowedDataLayers.adobetags"
            /><span>Adobe Tags</span></label
          >
        </div>
      </div>
    </div>
    <div>
      <p style="padding-bottom: 0.5rem;">Custom JS objects:</p>
      <div class="custom-object-layers-container">
        <div class="new-custom-object-field">
          <label for="newDLObject" style="font-size: x-small;"
            >New JS Object Layer</label
          >
          <div>
            <input
              type="text"
              id="newDLObject"
              name="newDLObject"
              v-model="newDLObject"
              placeholder="e.g. digitalLayer"
            />
            <button
              style="padding: 0.5rem 1rem;"
              class="primary-btn"
              @click="addNewDLObject"
            >
              Add
            </button>
          </div>
        </div>
        <div class="custom-object-layers">
          <div
            class="sec-btn"
            style="padding: 0.5rem 1rem; font-size: small;"
            v-for="(dlObject, index) in customObjectDataLayers"
          >
            {{ dlObject }}
            <img
              height="15px"
              src="../../../images/cross_icon.svg"
              @click="deleteCustomDLObject(index)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
//import Modal from './../Modal.vue'
import { nextTick } from "vue";
import chromeHelper from "../../lib/chromeHelpers.js";

export default {
  mounted() {
    this.init();
  },
  watch: {
    allowedDataLayers: {
      handler(newAllowed, oldAllowed) {
        this.updateAllowedLayers();
      },
      deep: true,
    },
  },
  methods: {
    async init() {
      this.customObjectDataLayers = await this.getStorageCustomDLObject();
      this.allowedDataLayers = await this.getStorageAllowedDataLayers();
    },
    addNewDLObject() {
      if (
        this.customObjectDataLayers.findIndex(
          (DLobject) => DLobject === this.newDLObject
        ) > -1
      ) {
      } else if (!/^(?!\d)[\w$]+$/.test(this.newDLObject)) {
      } else {
        this.customObjectDataLayers.push(this.newDLObject);
        this.setStorageCustomDLObject();
        this.newDLObject = "";
      }
    },
    deleteCustomDLObject(index) {
      this.customObjectDataLayers.splice(index, 1);
      this.setStorageCustomDLObject();
    },
    async setStorageCustomDLObject() {
      return await chromeHelper.localStorageSet({
        dataLayers: this.customObjectDataLayers,
      });
    },
    async getStorageCustomDLObject() {
      const storage = await chromeHelper.localStorageGet(["dataLayers"]);
      if (storage.hasOwnProperty("dataLayers")) {
        return storage.dataLayers;
      }
      return [];
    },
    async getStorageAllowedDataLayers() {
      const storage = await chromeHelper.localStorageGet(["allowedLayers"]);
      if (storage.hasOwnProperty("allowedLayers")) {
        return storage.allowedLayers;
      }
      return this.allowedDataLayers;
    },
    async updateAllowedLayers() {
      chromeHelper.localStorageSet({ allowedLayers: this.allowedDataLayers });
    },
  },
  computed: {},
  data() {
    return {
      allowedDataLayers: {
        google_tag_manager_push: false,
        google_tag_manager: false,
        tealium: false,
        tag_commander: false,
        adobe_dtm: false,
        var: true,
        launchdataelements: true,
        adobetags: false,
      },
      customObjectDataLayers: [],
      newDLObject: "",
    };
  },
};
</script>

<style lang="css" scoped>
.default-object-layers-container {
  display: flex;
  flex-direction: row;
  row-gap: 10px;
  column-gap: 12px;
  padding-left: 8px;
  display: flex;
  column-gap: 16px;
  flex-wrap: wrap;
}
.default-object-layers-column {
  display: flex;
  flex-direction: column;
  row-gap: 12px;
  column-gap: 12px;
}
.default-object-layers-container label {
  display: flex;
  flex-direction: row;
  column-gap: 8px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}
.custom-object-layers {
  display: flex;
  flex-wrap: wrap;
  row-gap: 12px;
  column-gap: 12px;
  margin-top: 8px;
}

.custom-object-layer {
  background: #12b922;
  padding: 8px 16px;
  border-radius: 16px;
  font-family: "Poppins";
  font-size: 16px;
  font-weight: bold;
  color: white;
  padding-right: 26px;
  position: relative;
}

.custom-object-layer img {
  width: 13px;
  position: absolute;
  right: 6px;
  cursor: pointer;
}
.dl-settings h3 {
  margin-top: 24px;
  margin-bottom: 16px;
}

input#newDLObject {
  font-size: small;
  padding: 8px 12px;
  border-radius: 1rem;
  border: 1px solid #bbbbbb;
  margin-bottom: 12px;
  margin-right: 8px;
  min-width: 200px;
}

label {
  font-size: 14px;
}
</style>
