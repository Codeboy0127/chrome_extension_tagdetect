<template lang="html">
  <div class="tabs">
    <div class="header-nav">
      <a target="_blank" href="https://console.taglab.net" class="logo-wrapper">
        <img src="../../images/icon-128x128.png" style="width: 56px" />
        <img src="../../images/logo.png" style="height: 48px;" />
      </a>
      <ul class="tabs-header">
        <li
          v-for="(tab, index) in tabs"
          :key="tab.title"
          @click="selectTab(index, tab.title)"
          :class="{ 'tabs-selected': index == selectedIndex }"
        >
          {{ tab.title }}
        </li>
      </ul>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import { pageSelectEvent } from "../google-analytics";

export default {
  data() {
    return {
      selectedIndex: 0, // the index of the selected tab,
      tabs: [], // all of the tabs
    };
  },
  created() {
    this.tabs = this.$children;
  },
  mounted() {
    this.selectTab(0);
  },
  methods: {
    selectTab(i, tabName) {
      this.selectedIndex = i;
      // loop over all the tabs
      this.tabs.forEach((tab, index) => {
        tab.isActive = index === i;
      });

      pageSelectEvent(tabName);
    },
  },
};
</script>

<style lang="css">
.header-nav {
  display: flex;
  padding-left: 18px;
  margin-bottom: 8px;
  justify-content: space-between;
  -moz-column-gap: 8px;
  column-gap: 8px;
  padding-right: 14px;
  flex-wrap: wrap;
  row-gap: 24px;
}
ul.tabs-header {
  display: flex;
  list-style: none;
  padding: 0;
  flex-wrap: wrap;
  align-items: baseline;
  row-gap: 4px;
  margin-left: auto;
}
ul.tabs-header > li {
  padding: 15px 30px;
  border-radius: 10px;
  margin: 0;
  display: inline-block;
  margin-right: 5px;
  cursor: pointer;
}
.tab {
  box-sizing: border-box;
  color: black;
  width: 100%;
  border-radius: 10px;
  min-height: 81vh;
  background-color: #f4f6fa;
  padding: 16px 40px;
  /* padding-bottom: 50vh; */
}
.tabs-light li {
  background-color: #ddd;
  color: #aaa;
}
.tabs-light li.tabs-selected {
  background-color: #fff;
  color: #83ffb3;
}
.tabs li {
  background-color: #ddd;
  color: #aaa;
}
li.tabs-selected {
  background-color: #12b922;
  color: white;
}
@media only screen and (max-width: 550px) {
  ul.tabs-header > li {
    flex: 1 0 21%;
  }
}
@media only screen and (max-width: 440px) {
  ul.tabs-header > li {
    flex: 1 0 40%;
  }
}
</style>
