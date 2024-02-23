<template>
  <div class="panel">
    <div class="search-box">
      <svg
        fill="#12b922"
        @click="search"
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
      <span v-show="0 !== searchResultCount"
        >({{ searchFilterIndex + 1 }}/{{ searchResultCount }})</span
      >
      <!-- <button @click="search">search</button> -->
      <button @click="searchPrev" v-show="0 !== searchResultCount">
        previous
      </button>
      <button @click="searchNext" v-show="0 !== searchResultCount">next</button>
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
        :panel="'Tags View'"
      />
    </div>
    <div class="tag-settings">
      <tag-settings />
    </div>
    <div
      :class="{
        'asc tag-panel': listOrder === 'ASC',
        'desc tag-panel': listOrder === 'DESC',
      }"
    >
      <accordion
        :id="`tech-${urlIndex}`"
        styling="rounded gray-header"
        :title="url.pageUrl"
        v-for="(url, urlIndex) in data"
        :key="'tag-url-' + urlIndex"
        :isOpen="data.length - urlIndex - 1 === 0"
      >
        <p v-if="!url.events">No recorded events</p>
        <accordion
          :id="`tech-${urlIndex}-${eventIndex}`"
          styling="rounded green-header"
          :title="event.name"
          v-for="(event, eventIndex) in url.events.slice().reverse()"
          :key="'tag-event-' + eventIndex"
          :isOpen="url.events.length - eventIndex - 1 === 0"
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
                    url.events.length - eventIndex - 1
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

          <p v-if="!event.tags">No recorded tags</p>

          <accordion
            :id="`tech-${urlIndex}-${eventIndex}-${index}`"
            styling="flat"
            :title="
              tag.name +
                (tag.content.tid ? ' - ' + tag.content.tid : '') +
                (tag.content.en ? ' - ' + tag.content.en : '') +
                ' (' +
                (tag.timeStamp - event.timeStamp) +
                'ms)'
            "
            v-for="(tag, index) in event.tags"
            :key="'tag-tag-' + index"
            :isOpen="false"
          >
            <template v-slot:icon>
              <img
                v-if="tag.icon"
                class="tag-icon"
                :src="'../../../images/regex_icons/' + tag.icon"
                alt=""
              />
            </template>
            <template v-if="occurences" v-slot:extra
              ><h4>
                Found on {{ occurences[tag.name].occurences }}/{{ data.length }}
                pages
              </h4></template
            >
            <ul class="tag-params" v-show="searchFilter.length === 0">
              <li v-for="(value, key, contentIndex) in tag.content">
                <span
                  :id="
                    `tech-${urlIndex}-${eventIndex}-${index}-${contentIndex}-key`
                  "
                  style="font-weight: bold; word-break: keep-all;"
                >
                  {{ key }}:
                </span>
                <span
                  :id="
                    `tech-${urlIndex}-${eventIndex}-${index}-${contentIndex}-value`
                  "
                >
                  {{ value }}
                </span>
              </li>
            </ul>
            <ul class="tag-params" v-if="searchFilter.length > 0">
              <li v-for="(value, key, contentIndex) in tag.content">
                <span style="font-weight: bold; ">
                  <!-- <span v-for="(val, index) in splitString(key, searchFilter)" :class="val === searchFilter ? 'search-hit' : ''"> -->
                  <span
                    v-for="(val, keyIndex) in key
                      .replaceAll(searchFilter, ',' + searchFilter + ',')
                      .split(',')"
                    :class="val === searchFilter ? `search-hit` : ''"
                    style=" white-space: nowrap;"
                  >
                    {{ val }} </span
                  >:
                </span>
                <span>
                  <span
                    v-for="(val, valIndex) in value
                      .replaceAll(searchFilter, ',' + searchFilter + ',')
                      .split(',')"
                    :class="val === searchFilter ? `search-hit` : ''"
                    style=""
                  >
                    {{ val }}
                  </span>
                </span>
              </li>
            </ul>
            <div v-show="searchFilter.length === 0">
              <ul class="tag-params" v-for="(payload, index) in tag.payload">
                <H4 class="payload-title"
                  >Payload analytic events {{ index }}</H4
                >
                <li v-for="(value, key, contentIndex) in payload">
                  <span
                    :id="
                      `tech-${urlIndex}-${eventIndex}-${index}-${contentIndex}-key`
                    "
                    style="font-weight: bold; "
                  >
                    {{ key }}:
                  </span>
                  <span
                    :id="
                      `tech-${urlIndex}-${eventIndex}-${index}-${contentIndex}-value`
                    "
                  >
                    {{ value }}
                  </span>
                </li>
              </ul>
            </div>
            <div v-if="searchFilter.length > 0 && tag.payload.length > 0">
              <ul class="tag-params" v-for="(payload, index) in tag.payload">
                <H4 class="payload-title"
                  >Payload analytic events {{ index }}</H4
                >
                <li v-for="(value, key, contentIndex) in payload">
                  <span style="font-weight: bold; ">
                    <!-- <span v-for="(val, index) in splitString(key, searchFilter)" :class="val === searchFilter ? 'search-hit' : ''"> -->
                    <span
                      v-for="(val, keyIndex) in key
                        .replaceAll(searchFilter, ',' + searchFilter + ',')
                        .split(',')"
                      :class="val === searchFilter ? `search-hit` : ''"
                      style=" white-space: nowrap;"
                    >
                      {{ val }} </span
                    >:
                  </span>
                  <span>
                    <span
                      v-for="(val, valIndex) in value
                        .replaceAll(searchFilter, ',' + searchFilter + ',')
                        .split(',')"
                      :class="val === searchFilter ? `search-hit` : ''"
                      style=""
                    >
                      {{ val }}
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </accordion>
        </accordion>
      </accordion>
    </div>
  </div>
</template>
<script>
import Accordion from "../Accordion.vue";
import ControlBar from "../ControlBar.vue";
import TagSettings from "../settings/TagSettings.vue";

export default {
  props: {
    isInspecting: {
      type: Boolean,
    },
    data: Array,
    listOrder: {
      type: String,
      default: "ASC",
    },
    occurences: {
      type: Array,
    },
  },
  computed: {
    getNextNumber() {
      console.log({ count: this.count });
      return ++this.count;
    },
  },
  components: {
    Accordion,
    ControlBar,
    TagSettings,
  },
  methods: {
    //Filter methods: Look up and get array of indices, open accordions of every hit change style of every find finding and scroll to first hit.
    //cycle between hits with scroll to
    //reset styling
    splitString(str, delimiter) {
      let result = [];
      let temp = "";
      for (let i = 0; i < str.length; i++) {
        if (str[i] === delimiter) {
          result.push(temp);
          result.push(delimiter);
          temp = "";
        } else {
          temp += str[i];
        }
      }
      result.push(temp);
      return result;
    },
    updateSearch() {
      //await nextTick()
      this.searchResultCount = $(".search-hit").length || 0;
      if (this.searchResultCount > 0) {
        $(".search-box")
          .first()
          .addClass("active");
      } else {
        $(".search-box")
          .first()
          .removeClass("active");
      }
    },
    setSearch() {
      this.count = 0;
    },

    searchNext() {
      if (".search-hit".length > 0) {
        this.expandAll();
        this.searchFilterIndex =
          (this.searchFilterIndex + 1) % this.searchResultCount;
        //$('.search-hit').get(this.searchFilterIndex).scrollIntoView({behavior: 'smooth'});

        var element = $(".search-hit").eq(this.searchFilterIndex);
        var offset =
          element.offset().top - $(window).height() / 6 - $(window).scrollTop();
        element[0].scrollIntoView({ block: "center", behavior: "smooth" });
        window.scrollBy({ top: offset, left: 0, behavior: "smooth" });

        $(".currentHit")
          .first()
          .removeClass("currentHit");
        $(".search-hit")
          .eq(this.searchFilterIndex)
          .addClass("currentHit");
      }
    },
    searchPrev() {
      if (".search-hit".length > 0) {
        this.expandAll();
        this.searchFilterIndex =
          this.searchFilterIndex - 1 < 0
            ? this.searchResultCount - 1
            : this.searchFilterIndex - 1;
        //$('.search-hit').get(this.searchFilterIndex).scrollIntoView({behavior: 'smooth'});
        var element = $(".search-hit").eq(this.searchFilterIndex);
        var offset =
          element.offset().top - $(window).height() / 6 - $(window).scrollTop();
        element[0].scrollIntoView({ block: "center", behavior: "smooth" });
        window.scrollBy({ top: offset, left: 0, behavior: "smooth" });
        $(".currentHit")
          .first()
          .removeClass("currentHit");
        $(".search-hit")
          .eq(this.searchFilterIndex)
          .addClass("currentHit");
      }
    },

    search() {
      if (".search-hit".length > 0) {
        this.expandAll();
        this.searchFilterIndex = 0;
        //$('.search-hit').get(this.searchFilterIndex).scrollIntoView({behavior: 'smooth'});

        var element = $(".search-hit").eq(this.searchFilterIndex);
        var offset =
          element.offset().top - $(window).height() / 6 - $(window).scrollTop();
        element[0].scrollIntoView({ block: "center", behavior: "smooth" });
        window.scrollBy({ top: offset, left: 0, behavior: "smooth" });

        $(".currentHit")
          .first()
          .removeClass("currentHit");
        $(".search-hit")
          .eq(this.searchFilterIndex)
          .addClass("currentHit");
      }
    },

    EnableEventTitleEdit(title, urlIndex, eventIndex) {
      this.newTitle = title;
      this.isEventEditEnabled = {
        toggle: true,
        urlIndex,
        eventIndex,
      };
      this.$nextTick(() => {
        console.log(urlIndex, eventIndex);
        const editInputRef = this.$refs[`editButton-${urlIndex}-${eventIndex}`];
        editInputRef[0].focus();
      });
    },
    disableEventTitleEdit() {
      this.isEventEditEnabled.toggle = false;
    },
    editEventTitle(event, urlIndex, eventIndex) {
      console.log("event title: ", event.target.value, urlIndex, eventIndex);
      this.$emit("editEventTitle", event.target.value, urlIndex, eventIndex);
      this.disableEventTitleEdit();
    },
    collapseAll() {
      $(".tag-panel .accordion")
        .find("h3")
        .each(function(index, element) {
          $(this)
            .next(".content")
            .slideUp(500);
          $(this).removeClass("selected");
        });
    },
    expandAll() {
      $(".tag-panel .accordion")
        .find("h3")
        .each(function(index, element) {
          $(this)
            .next(".content")
            .slideDown(300);
          $(this).addClass("selected");
        });
    },
    getoccurences(name) {
      return this.occurences[name].occurences;
    },
    toggleSettingsPanel() {
      $(".tag-settings-panel").slideToggle(500);
    },
    exportData() {
      this.$emit("exportData");
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
      newTitle: "",
      isEventEditEnabled: { toggle: false, urlIndex: 0, eventIndex: 0 },
      searchFilter: "",
      searchResultCount: 0,
      searchFilterIndex: -1,
      searchHits: [],
      count: 0,
      controlBar: {
        record: true,
        clear: true,
        collapse: true,
        expand: true,
        save: true,
        import: false,
        settings: true,
      },
    };
  },
};
</script>

<style lang="css" scoped>
ul.tag-params {
  background: #f5f5f5;
  list-style: none;
  padding-left: 32px;
}

ul.tag-params li {
  background: none;
  color: black;
  font-size: 14px;
  margin-bottom: 4px;
  display: flex;
  column-gap: 8px;
}
img.tag-icon {
  max-height: 20px;
  margin-right: 12px;
  margin-bottom: 2px;
}
.search-hit {
  background: #ffed00;
}
span.search-hit.currentHit {
  background: #12b922;
  color: white;
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

.search-box span {
  right: 148px;
  margin-top: 7px;
  position: absolute;
}

.search-box button {
  font-size: 16px;
  padding: 6px;
  border: none;
  color: white;
  text-transform: capitalize;
  background: #12b922;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
}
.search-box svg {
  cursor: pointer;
  height: 18px;
  transform: translate(4px, 4px);
  margin-right: -25px;
}
.payload-title {
  font-size: 14px;
  text-decoration: underline;
  margin-top: 16px;
}
</style>
