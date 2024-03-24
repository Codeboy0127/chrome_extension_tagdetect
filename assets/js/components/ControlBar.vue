<template>
  <div class="control-bar">
    <button
      class="action-btn"
      v-if="!isInspecting && controlBar.record"
      @click="toggleInspection"
    >
      <img src="../../images/record.svg" />
      Record
    </button>
    <button
      class="action-btn"
      v-if="isInspecting && controlBar.record"
      @click="toggleInspection"
    >
      <img src="../../images/pause.svg" /> Pause
    </button>
    <button class="action-btn" v-if="controlBar.clear" @click="resetData">
      <img src="../../images/clear.svg" /> Clear
    </button>
    <button class="action-btn" v-if="controlBar.collapse" @click="collapseAll">
      <img src="../../images/collapse.svg" /> Collapse All
    </button>
    <button class="action-btn" v-if="controlBar.expand" @click="expandAll">
      <img src="../../images/expand.svg" /> Expand All
    </button>
    <!-- <button class="action-btn" v-if="controlBar.save" @click="exportData">
      <img src="../../images/import.svg" /> Export
    </button> -->
    <button
      class="action-btn"
      v-if="controlBar.settings"
      @click="toggleSettingsPanel"
    >
      <img src="../../images/settings.png" /> Settings
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

<style lang="css">
.action-btn {
  display: flex;
  gap: 5px;
  padding: 4px 3px;
  align-items: center;
  justify-content: center;
}

.action-btn > img {
  width: 14px;
  object-fit: contain;
}

.control-bar {
  margin-left: auto;
  display: flex;
  column-gap: 8px;
}
.control-bar img {
  height: 24px;
  cursor: pointer;
}
</style>
