<template lang="html">
  <div class="tabs">
    <div class="h-logo">
      <a
        target="_blank"
        href="https://console.taglab.net"
        style="margin: 0; padding: 0; display: contents;;"
      >
        <img src="../../images/logo.png" style="height: 36px;" />
      </a>
    </div>
    <div class="header-nav">
      <div class="c-tabs-header">
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
        <div>
          Tag View is better with Taglab Web
          <a class="sec-btn"> Why? </a>
        </div>
      </div>
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
.h-logo {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 8px 0;
}

.header-nav {
  display: flex;
  justify-content: center;
  padding: 8px 0px;
}

.c-tabs-header {
  border-radius: 45px 45px 15px 15px;
  background-color: #2ca14813;
}
.c-tabs-header > div {
  padding: 10px;
  display: flex;
  align-items: center;
  column-gap: 2px;
  font-size: small;
  font-weight: 300;
}

.c-tabs-header .sec-btn {
  padding: 4px 10px;
  font-size: x-small;
}

ul.tabs-header {
  display: flex;
  list-style: none;
  padding: 10px;
  border: 2px solid rgb(208, 208, 208);
  border-radius: 45px;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 8px;
  row-gap: 4px;
  background-color: #fff;
}
ul.tabs-header > li {
  padding: 8px 30px;
  border-radius: 45px;
  margin: 0;
  display: inline-block;
  margin-right: 5px;
  cursor: pointer;
  font-size: small;
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
/* .tabs li {
  background-color: #ddd;
  color: #aaa;
} */
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
