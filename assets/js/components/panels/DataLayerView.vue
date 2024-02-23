<template>
  <div class="panel">
    <div class="search-box">
      <svg
        fill="#12b922"
        xmlns="http://www.w3.org/2000/svg"
        height="1em"
        viewBox="0 0 512 512"
      >
        <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path
          d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
        />
      </svg>
      <input type="text" v-model="searchFilter" @keyup="updateSearch" />
    </div>
    <div class="panel-top">
      <control-bar
        :controlBar="controlBar"
        @toggleInspection="toggleInspection"
        @resetData="resetData"
        :isInspecting="isInspecting"
        @exportData="exportData"
        @collapseAll="collapseAll"
        @expandAll="expandAll"
        @toggleSettingsPanel="toggleSettingsPanel"
        :panel="'Data Layer View'"
      />
    </div>
    <div class="dl-settings">
      <data-layer-settings />
    </div>
    <div
      :class="{
        'asc dl-panel': listOrder === 'ASC',
        'desc dl-panel': listOrder === 'DESC',
      }"
    >
      <accordion
        styling="rounded gray-header"
        :title="datalayer.pageUrl"
        v-for="(datalayer, urlIndex) in data"
        :key="'dl-url-' + urlIndex"
        :isOpen="data.length - urlIndex - 1 === 0"
      >
        <p v-if="!datalayer.events">No recorded events</p>
        <accordion
          styling="rounded green-header"
          :title="event.name"
          v-for="(event, eventIndex) in datalayer.events"
          :key="'dl-event-' + eventIndex + '-' + urlIndex"
          :isOpen="datalayer.events.length - eventIndex - 1 === 0"
        >
          <template v-slot:editTitle>
            <input
              :ref="`editButton-${urlIndex}-${eventIndex}`"
              v-show="
                isEventEditEnabled.toggle &&
                  isEventEditEnabled.urlIndex === urlIndex &&
                  isEventEditEnabled.eventIndex === eventIndex
              "
              type="text"
              @keyup.enter="
                (e) =>
                  editEventTitle(
                    e,
                    urlIndex,
                    datalayer.events.length - eventIndex - 1
                  )
              "
              @blur="disableEventTitleEdit"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              @click="
                (e) => EnableEventTitleEdit(event.name, urlIndex, eventIndex)
              "
              style="filter: invert(1);"
              height="1em"
              viewBox="0 0 512 512"
            >
              <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path
                d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
              />
            </svg>
          </template>
          <p v-if="!event.dataLayers">No recorded datalayers</p>
          <template v-slot:buttons>
            <div class="dl-buttons" v-if="event.dataLayers">
              <img
                src="../../../images/collapse.svg"
                @click="collapseTree($event)"
                style="filter: brightness(10)"
              />
              <img
                src="../../../images/expand.svg"
                @click="expandTree($event)"
                style="filter: brightness(10)"
              />
            </div>
          </template>
          <div class="data-layers" v-if="event.dataLayers">
            <div v-for="(dl, index) in event.dataLayers">
              <!-- <json-view v-if="dl.data" :data="dl.data" :maxDepth="0" :rootKey="dl.type === 'var' ? dl.dLN : getDLName(dl.type)" :key="'dl-data-'+eventIndex+'-'+urlIndex+'-'+index"/> -->
              <json-view
                v-if="dl.data"
                :data="filterObj(dl.data, searchFilter, 'loose')"
                :maxDepth="0"
                :rootKey="dl.type === 'var' ? dl.dLN : getDLName(dl.type)"
                :key="'dl-data-' + eventIndex + '-' + urlIndex + '-' + index"
              />
            </div>
            <div></div>
          </div>
        </accordion>
      </accordion>
    </div>
  </div>
</template>
<script>
import Accordion from "../Accordion.vue";
import { JSONView } from "vue-json-component";
import ControlBar from "../ControlBar.vue";
import DataLayerSettings from "../settings/DataLayerSettings.vue";

export default {
  props: {
    data: Array,
    listOrder: {
      type: String,
      default: "ASC",
    },
    isInspecting: {
      type: Boolean,
    },
  },
  components: {
    "json-view": JSONView,
    Accordion,
    ControlBar,
    DataLayerSettings,
  },
  computed: {
    getFilteredDls(dl) {
      if (dl) return this.filterObj(dl, this.searchFilter);
    },
  },
  methods: {
    EnableEventTitleEdit(title, urlIndex, eventIndex) {
      this.newTitle = title;
      this.isEventEditEnabled = {
        toggle: true,
        urlIndex,
        eventIndex,
      };
      this.$nextTick(() => {
        const editInputRef = this.$refs[`editButton-${urlIndex}-${eventIndex}`];
        editInputRef[0].focus();
      });
    },
    disableEventTitleEdit() {
      this.isEventEditEnabled.toggle = false;
    },
    editEventTitle(event, urlIndex, eventIndex) {
      this.$emit("editEventTitle", event.target.value, urlIndex, eventIndex);
      this.disableEventTitleEdit();
    },
    filterObjStrict(object, filter) {
      let result = {};
      Object.keys(object).forEach((key) => {
        if (
          key.toLowerCase().includes(filter.toLowerCase()) ||
          object[key]
            .toString()
            .toLowerCase()
            .includes(filter.toLowerCase())
        ) {
          result[key] = object[key];
        } else if (typeof object[key] === "object") {
          const filtered = this.filterObj(object[key], filter);
          if (Object.keys(filtered).length > 0) {
            result[key] = filtered;
          }
        }
      });
      return result;
    },
    filterObj(object, filter, rule = "loose") {
      let result = {};
      Object.keys(object).forEach((key) => {
        if (
          key.toLowerCase().includes(filter.toLowerCase()) ||
          object[key]
            .toString()
            .toLowerCase()
            .includes(filter.toLowerCase())
        ) {
          if (rule === "loose") result = object;
          else result[key] = object[key];
        } else if (typeof object[key] === "object") {
          const filtered = this.filterObj(object[key], filter, rule);
          if (Object.keys(filtered).length > 0) {
            result[key] = filtered;
          }
        }
      });
      return result;
    },

    updateSearch() {
      //await nextTick()
      if (this.searchFilter !== "") {
        $(".search-box")
          .first()
          .addClass("active");
      } else {
        $(".search-box")
          .first()
          .removeClass("active");
      }
    },

    collapseAll() {
      $(".dl-panel .accordion")
        .find("h3")
        .each(function(index, element) {
          $(this)
            .next(".content")
            .slideUp(500);
          $(this).removeClass("selected");
        });
    },
    expandAll() {
      $(".dl-panel .accordion")
        .find("h3")
        .each(function(index, element) {
          $(this)
            .next(".content")
            .slideDown(300);
          $(this).addClass("selected");
        });
    },
    expandTree(event) {
      $(event.currentTarget)
        .parent()
        .parent()
        .parent()
        .next("div.content")
        .find(".json-view-item:not(.root-item)")
        .show();
      $(event.currentTarget)
        .parent()
        .parent()
        .parent()
        .next("div.content")
        .find(".chevron-arrow")
        .addClass("opened");
    },
    collapseTree(event) {
      $(event.currentTarget)
        .parent()
        .parent()
        .parent()
        .next("div.content")
        .find(".json-view-item:not(.root-item)")
        .hide();
      $(event.currentTarget)
        .parent()
        .parent()
        .parent()
        .next("div.content")
        .find(".chevron-arrow")
        .removeClass("opened");
    },
    toggleSettingsPanel() {
      $(".dl-settings-panel").slideToggle(500);
    },
    getDLName(type) {
      return this.tagNames[type] ?? "Unknown Layer";
    },
    exportData() {
      this.$emit("exportData");
    },
    importData() {
      this.$emit("importData");
    },
    toggleInspection() {
      this.$emit("toggleInspection");
    },
    resetData() {
      this.$emit("resetData");
      return;
      if (!this.isInspecting) {
        this.$emit("resetData");
      } else {
        const scenarioClearErrorMessage = {
          type: "warning",
          title: "Cannot Clear Data While Inspection Mode is on",
          message: "Please turn off inspection mode before clearing the data.",
        };
        this.$parent.$parent.$parent.$refs.notification.makeNotification(
          scenarioClearErrorMessage
        );
      }
    },
  },
  data() {
    return {
      tagNames: {
        google_tag_manager: "Google Tag Manager",
        google_tag_manager_push: "Google Tag Manager Push",
        tealium: "Tealium",
        tag_commander: "TagCommander",
        adobe_dtm: "Adobe DTM",
        var: "Other Layers",
        launchdataelements: "Launch Elements",
        adobetags: "Adobe Tags",
      },
      controlBar: {
        record: true,
        clear: true,
        collapse: true,
        expand: true,
        save: true,
        settings: true,
      },
      searchFilter: "",
      isEventEditEnabled: { toggle: false, urlIndex: 0, eventIndex: 0 },
    };
  },
};
</script>

<style lang="css">
.dl-buttons {
  display: flex;
  column-gap: 10px;
}
.value-key span {
  white-space: normal;
  word-break: break-all;
}
.data-layers {
  display: flex;
  flex-direction: column-reverse;
}
.value-key {
  margin-left: 0px !important;
  padding: 5px 5px 5px 0px !important;
}

.search-box {
  position: sticky;
  box-sizing: border-box;
  padding: 12px;
  background: white;
  border-radius: 10px;
  width: fit-content;
  margin-bottom: -41px;
}

.search-box.active {
  top: 0;
  /*position: fixed;*/
}

.search-box input {
  border: #12b922 solid 2px;
  border-radius: 3px;
  padding: 5px;
  padding-left: 30px;
}

.search-box svg {
  height: 18px;
  transform: translate(4px, 4px);
  margin-right: -25px;
}
</style>
