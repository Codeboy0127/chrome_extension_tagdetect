<template lang="html">
  <div class="tabs">
    <div class="h-logo">
      <a target="_blank" href="https://taglab.net/?utm_source=extension&utm_medium=owned-media&utm_campaign=logo"
        style="margin: 0; padding: 0; display: contents;">
        <img src="../../images/logo.png" style="height: 36px;" />
      </a>
    </div>
    <div class="header-nav">
      <div class="c-tabs-header">
        <ul class="tabs-header">
          <li v-for="(tab, index) in tabs" :key="tab.title" @click="selectTab(index, tab.title)"
            :class="{ 'tabs-selected': index == selectedIndex }">
            {{ tab.title }}
          </li>
        </ul>
        <div>
          Tag View is better with Taglab Web
          <button @click="showModal = true" class="sec-btn">Why?</button>
        </div>
      </div>
    </div>

    <transition name="modal">
      <modal v-if="showModal" @close="showModal = false" key="taglab-web">
        <template v-slot:header>
          <h3>Benefits of Taglab Web</h3>
        </template>
        <template v-slot:body>
          <div>
            <div class="img-container">
              <img src="../../images/why-taglab-web.png" style="height: 100px;" />
            </div>
            <div>
              <ul class="benefits">
                <ul>
                  <li v-for="(b, index) in benefits" :key="index">{{ b }}</li>
                </ul>
              </ul>
            </div>
          </div>
        </template>
        <template v-slot:footer>
          <div class="_footer">
            <a
              target="_blank"
              href="https://taglab.net/?utm_source=extension&utm_medium=owned-media&utm_campaign=why-taglab-web"
              class="primary-btn"
            >
              Discover
            </a>
            <button @click="showModal = false" class="btn">Go Back</button>
          </div>
        </template>
      </modal>
    </transition>
    <slot></slot>
  </div>
</template>

<script>
import { pageSelectEvent } from "../google-analytics";
import Modal from "./Modal.vue";

export default {
  components: { Modal },
  data() {
    return {
      selectedIndex: 0, // the index of the selected tab,
      tabs: [], // all of the tabs
      showModal: false,
      benefits: [
        "Detailed audit history reports with versioning.",
        "Reports with comprehensive tags and data layers data, including cookies and page performance metrics.",
        "Automated remote scenario and crawl runs for effortless testing.",
        "Cloud-based robust digital marketing testing suite.",
        "Limitless page inspection and crawling capabilities for unparalleled insights",
      ],
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
.benefits {
  font-weight: 300;
}

.benefits li {
  margin: 0.5rem 0;
}

.img-container {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}

._footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

._footer button,
._footer a {
  width: 100%;
  font-size: small;
  padding: 1rem 2rem;
}

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

.c-tabs-header>div {
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

ul.tabs-header>li {
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
  padding: 16px 20px;
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
  ul.tabs-header>li {
    flex: 1 0 21%;
  }
}

@media only screen and (max-width: 440px) {
  ul.tabs-header>li {
    flex: 1 0 40%;
  }
}
</style>
