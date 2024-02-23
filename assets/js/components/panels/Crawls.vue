<template>
  <div class="panel">
    <div class="panel-top">
      <control-bar
        :controlBar="controlBar"
        @resetData="resetData"
        :panel="'Crawls'"
      />
    </div>
    <div class="crawl-fields">
      <div class="crawl-field">
        <label for="url-field">Url to Crawl*</label>
        <input
          type="text"
          id="url-field"
          name="url-field"
          v-model="url"
          placeholder="Enter Url"
          required
        />
      </div>
      <div class="crawl-field">
        <label for="uriRegex">Uri Regex</label>
        <input
          type="text"
          id="uriRegex"
          name="uriRegex"
          v-model="uriRegex"
          placeholder="Enter an optional regex to limit page urls within rules"
        />
      </div>
      <div class="crawl-options">
        <label for="includeParams"
          ><input
            type="checkbox"
            id="includeParams"
            v-model="includeAnchors"
          /><span>Include anchors...</span></label
        >
        <label for="includeParams"
          ><input
            type="checkbox"
            id="includeParams"
            v-model="includeParams"
          /><span>Include params...</span></label
        >
        <label for="includeSubdomain"
          ><input
            type="checkbox"
            id="includeSubdomain"
            v-model="includeSubdomain"
          /><span>Include Subdomain...</span></label
        >
      </div>
      <div class="crawl-timeout crawl-timeout-min">
        <label for="minWaitTime">Minimum time spent on each url (s):</label>
        <input
          type="number"
          id="minWaitTime"
          v-model="minimumTimeout"
          name="minWaitTime"
          min="1"
          :max="maximumTimeout"
        />
      </div>
      <div class="crawl-timeout crawl-timeout-max">
        <label for="maxWaitTime">Maximum wait time for url (s):</label>
        <input
          type="number"
          id="maxWaitTime"
          v-model="maximumTimeout"
          name="maxWaitTime"
          :min="minimumTimeout"
          max="15"
        />
      </div>
    </div>
    <button
      class="simple-button"
      v-if="
        (isCrawlingPaused && isCrawling) || (!isCrawling && !isCrawlingPaused)
      "
      @click="initiateCrawl()"
    >
      Start Crawl
    </button>
    <button
      class="simple-button red"
      v-if="isCrawling && !isCrawlingPaused"
      @click="pauseCrawling()"
    >
      Pause Crawl
    </button>
    <p style="font-size: 14px; padding: 16px 8px;">
      URL Count: {{ urlQueue.length }}
    </p>
    <div class="url-queue" v-if="urlQueue.length > 0">
      <p
        class="url"
        v-for="(url, index) in urlQueue"
        :key="'url-queue-single-' + index"
      >
        <span
          :class="{
            'check url-state': url.state === 'completed',
            'url-state lds-ripple': url.state === 'processing',
            'url-state cross': url.state === 'failed',
          }"
          ><div></div>
          <div></div
        ></span>

        <span>{{ url.url }}</span>
      </p>
    </div>
  </div>
</template>
<script>
import chromeHelper from "../../lib/chromeHelpers.js";
import ControlBar from "../ControlBar.vue";

export default {
  components: {
    ControlBar,
  },
  mounted() {
    this.tabId = chrome.devtools.inspectedWindow.tabId;
  },
  computed: {
    minimumTimeout: {
      get() {
        return this.minWaitTime / 1000;
      },
      set(newValue) {
        this.minWaitTime = newValue * 1000;
      },
    },
    maximumTimeout: {
      get() {
        return this.maxWaitTime / 1000;
      },
      set(newValue) {
        this.maxWaitTime = newValue * 1000;
      },
    },
  },
  methods: {
    async initiateCrawl() {
      if (!this.url) return;
      this.initUrlQueue();
      this.tabId = await this.createCrawlWindow();
      this.$emit("startInspection");
      chromeHelper.listenOnTabUpdated(this.listenToUrlChanges);
      chromeHelper.listenToRuntimeMessages(this.listenToPageCrawler);
    },
    async createCrawlWindow() {
      this.waitTimeCounter = setTimeout(
        this.handleFailedUrlCrawl,
        this.maxWaitTime + 500
      );
      //const window = await chromeHelper.createWindow({url: this.urlQueue[this.urlQueueNumber].url, state : 'minimized'})
      chromeHelper.updateTab(
        this.tabId,
        { url: this.urlQueue[this.urlQueueNumber].url },
        this.errorHandler
      );
      return this.tabId;
    },
    initUrlQueue() {
      if (this.isCrawlingPaused) {
        this.isCrawlingPaused = false;
        return;
      }
      this.url =
        this.url.includes("https://") || this.url.includes("http://")
          ? this.url
          : "https://" + this.url;
      this.updateUrlQueue([{ url: this.url }]);
      this.urlQueue[this.urlQueueNumber].state = "processing";
    },
    listenToUrlChanges(details) {
      if (details) {
        this.injectCrawlerContentScript();
      }
    },

    injectCrawlerContentScript() {
      chromeHelper.injectScript(
        {
          target: { tabId: this.tabId },
          files: ["content/crawler_content.js"],
        },
        this.errorHandler("SCRIPT_INJECTION")
      );
    },
    listenToPageCrawler(message, sender, sendResponse) {
      if (message.type === "crawler_ready") {
        if (!this.isCrawling) {
          this.isCrawling = true;
        }
        clearTimeout(this.waitTimeCounter);
        this.startPageCrawler();
      }
    },
    async startPageCrawler() {
      if (this.urlQueueNumber < this.urlQueue.length) {
        const response = await chromeHelper.sendMessageToTab(this.tabId, {
          type: "crawler_start",
          params: {
            includeAnchors: this.includeAnchors,
            includeParams: this.includeParams,
            regexRule: this.uriRegex,
            includeSubdomain: this.includeSubdomain,
          },
        });
        this.updateUrlQueue(response);
        this.urlQueue[this.urlQueueNumber].state = "completed";
        setTimeout(() => {
          this.stepIntoNextUrl();
        }, this.minWaitTime);
      } else if (this.urlQueueNumber === this.urlQueue.length) {
        this.$emit("stopInspection");
        this.isCrawling = false;
        this.isCrawlingPaused = false;
        const CrawlSuccessMessage = {
          type: "success",
          title: "Crawl Complete",
          message: "",
        };
        this.$parent.$parent.$parent.$refs.notification.makeNotification(
          CrawlSuccessMessage
        );
        this.urlQueueNumber = 0;
      }
    },
    handleFailedUrlCrawl() {
      this.urlQueue[this.urlQueueNumber].state = "failed";
      this.stepIntoNextUrl();
    },
    stepIntoNextUrl() {
      this.urlQueueNumber++;
      if (
        this.urlQueueNumber < this.urlQueue.length &&
        !this.isCrawlingPaused
      ) {
        this.urlQueue[this.urlQueueNumber].state = "processing";
        chromeHelper.updateTab(
          this.tabId,
          { url: this.urlQueue[this.urlQueueNumber].url },
          this.errorHandler
        );
        clearTimeout(this.waitTimeCounter);
        this.waitTimeCounter = setTimeout(
          this.handleFailedUrlCrawl,
          this.maxWaitTime + 500
        );
      } else if (
        this.urlQueueNumber < this.urlQueue.length &&
        this.isCrawlingPaused
      ) {
        this.$emit("stopInspection");
        clearTimeout(this.waitTimeCounter);
      } else if (this.urlQueueNumber === this.urlQueue.length) {
        clearTimeout(this.waitTimeCounter);
        this.$emit("stopInspection");
        this.urlQueueNumber = 0;
        this.isCrawling = false;
        this.isCrawlingPaused = false;
        const CrawlSuccessMessage = {
          type: "success",
          title: "Crawl Complete",
          message: "",
        };
        this.$parent.$parent.$parent.$refs.notification.makeNotification(
          CrawlSuccessMessage
        );
      }
    },
    pauseCrawling() {
      this.isCrawlingPaused = true;
    },
    updateUrlQueue(newQueue) {
      //TODO - Add Exception here
      if (!newQueue.length) {
        return;
      }
      newQueue.forEach((url) => {
        if (!this.urlQueue.some((e) => e.url === url.url)) {
          this.urlQueue.push({ url: url.url, state: "" });
        }
      });
    },
    resetData() {
      if (
        (this.isCrawlingPaused && this.isCrawling) ||
        (!this.isCrawling && !this.isCrawlingPaused)
      ) {
        this.urlQueue = [];
        this.isCrawling = false;
        this.isCrawlingPaused = false;
        this.urlQueueNumber = 0;
        this.waitTimeCounter = null;
        this.url = "";
      } else {
        const scenarioClearErrorMessage = {
          type: "warning",
          title: "Cannot empty the URL queue at the moment",
          message: "Crawler must be stoped before clearing the url queue.",
        };
        this.$parent.$parent.$parent.$refs.notification.makeNotification(
          scenarioClearErrorMessage
        );
      }
    },
    errorHandler(errorAt) {
      if (chrome.runtime.lastError) {
        console.log("error: ", chrome.runtime.lastError);
      } else {
        //
      }
    },
  },
  data() {
    return {
      maxWaitTime: 8000,
      minWaitTime: 7000,
      waitTimeCounter: null,
      includeSubdomain: false,
      notificationData: [],
      uriRegex: "",
      tabId: null,
      waitFor: 500,
      url: "",
      isCrawling: false,
      isCrawlingPaused: false,
      includeAnchors: false,
      includeParams: false,
      urlQueue: [],
      urlQueueNumber: 0,
      controlBar: {
        record: false,
        clear: true,
        collapse: false,
        expand: false,
        save: false,
        import: false,
        settings: false,
      },
    };
  },
};
</script>

<style lang="css">
.url-queue {
  background: #d9d9d9;
  padding: 18px 24px;
  border-radius: 16px;
  font-size: 14px;
}
.crawl-fields {
  margin-bottom: 24px;
  max-width: 475px;
}
.crawl-field input {
  display: block;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 16px;
  width: 100%;
  border: 1px solid #bbbbbb;
  margin-bottom: 24px;
}
.crawl-field label {
  margin-bottom: 4px;
  margin-top: 12px;
  padding-left: 8px;
}
.crawl-options {
  padding-left: 8px;
  display: flex;
  column-gap: 16px;
  flex-wrap: wrap;
  row-gap: 16px;
  margin: 30px 0px;
}
.crawl-options label {
  display: flex;
  flex-direction: row;
  column-gap: 8px;
}
.crawl-options label {
  font-size: 14px;
}
.crawl-timeout {
  margin-bottom: 16px;
  max-width: 400px;
  display: flex;
  justify-content: space-between;
}
.crawl-timeout input {
  width: 40px;
}
.url {
  display: flex;
}
.url-queue {
  background: #d9d9d9;
  padding: 18px 24px;
  border-radius: 16px;
  font-size: 14px;
  overflow-x: auto;
}
.url-queue p {
  width: max-content;
}
.cross {
  width: 16px;
  height: 16px;
  position: relative;
  position: absolute;
  transform: translate(-25px, 2px);
}
.cross:after {
  content: "";
  height: 16px;
  border-left: 4px solid red;
  position: absolute;
  transform: rotate(45deg);
  left: 12px;
}

.cross:before {
  content: "";
  height: 16px;
  border-left: 4px solid red;
  position: absolute;
  transform: rotate(-45deg);
  left: 12px;
}
.check {
  --borderWidth: 3px;
  --height: 10px;
  --width: 4px;
  --borderColor: #78b13f;
  display: inline-block;
  transform: rotate(45deg);
  height: var(--height);
  width: var(--width);
  border-bottom: var(--borderWidth) solid var(--borderColor);
  border-right: var(--borderWidth) solid var(--borderColor);
  margin-left: 10px;
  position: absolute;
  transform: translateX(-24px) rotate(45deg);
}

.lds-ripple {
  display: inline-block;
  position: relative;
  width: 0px;
  height: 20px;
  margin-top: -12px;
  scale: 0.3;
  transform: translateX(-84px);
}
.lds-ripple div {
  position: absolute;
  border: 10px solid #12b922;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes lds-ripple {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 0;
  }
  4.9% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 0;
  }
  5% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}

@media only screen and (max-width: 600px) {
  .crawl-field input {
    width: 90%;
  }
}
</style>
