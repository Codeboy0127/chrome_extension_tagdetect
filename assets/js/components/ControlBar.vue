<template>
  <div class="control-bar">
    <button class="action-btn" v-if="!isInspecting && controlBar.record" @click="toggleInspection">
      <!-- <img src="../../images/record.svg" /> -->
      Record
    </button>
    <button class="action-btn" v-if="isInspecting && controlBar.record" @click="toggleInspection">
      <!-- <img src="../../images/pause.svg" />  -->
      Pause
    </button>
    <button class="action-btn" v-if="controlBar.clear" @click="resetData">
      <!-- <img src="../../images/clear.svg" />  -->
      Clear
    </button>
    <button class="action-btn" v-if="controlBar.collapse" @click="collapseAll">
      <!-- <img src="../../images/collapse.svg" />  -->
      Collapse All
    </button>
    <button class="action-btn" v-if="controlBar.expand" @click="expandAll">
      <!-- <img src="../../images/expand.svg" />  -->
      Expand All
    </button>
    <!-- <button class="action-btn" v-if="controlBar.save" @click="exportData">
      <img src="../../images/import.svg" /> Export
    </button> -->
    <button class="action-btn" v-if="controlBar.settings" @click="toggleSettingsPanel">
      <!-- <img src="../../images/settings.png" />  -->
      {{ controlBar.tabIndex === 0 ? 'Tags' : 'Data Layers' }}
    </button>
  </div>
</template>

<script>
import { pageInteractionEvent } from "../google-analytics";

export default {
  props: {
    isInspecting: {
      type: Boolean,
    },
    controlBar: {
      type: Object,
    },
    panel: String,
  },
  methods: {
    //TODO - It should only collapse the accordion of the current tab
    collapseAll() {
      this.$emit("collapseAll");
      pageInteractionEvent(this.panel, "collapse_all");
    },
    //TODO - It should only expand the accordion of the current tab
    expandAll() {
      this.$emit("expandAll");
      pageInteractionEvent(this.panel, "expand_all");
    },
    toggleSettingsPanel() {
      this.$emit("toggleSettingsPanel");
      pageInteractionEvent(this.panel, "toggle_settings_panel");
    },
    exportData() {
      this.$emit("exportData");
      pageInteractionEvent(this.panel, "export_data");
    },
    importData() {
      this.$emit("importData");
      pageInteractionEvent(this.panel, "import_data");
    },
    toggleInspection() {
      this.$emit("toggleInspection");
      let interaction = "";
      if (!this.isInspecting && this.controlBar.record) {
        interaction = "start_inspection";
      }
      if (this.isInspecting && this.controlBar.record) {
        interaction = "pause_inspection";
      }
      pageInteractionEvent(this.panel, interaction);
    },
    resetData() {
      this.$emit("resetData");
      pageInteractionEvent(this.panel, "clear_data");
    },
  },
};
</script>

<style lang="scss">
button.action-btn {
  gap: 5px;
  padding: 12px 10px;
  background-color: #fff;
  color: #5c5c5c;
  border-radius: 12px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

button.action-btn:hover {
  box-shadow: 0px 0px 8px 1px #00000066;
  transition: box-shadow 0.3s ease-in-out;
}

.action-btn>img {
  width: 14px;
  object-fit: contain;
}

.control-bar {
  display: flex;
  column-gap: 8px;

  @media screen and (min-width: 620px) {
    margin-left: auto;
    margin-right: auto;
  }
}

.control-bar img {
  height: 24px;
  cursor: pointer;
}
</style>
