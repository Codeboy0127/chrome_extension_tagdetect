<template>
    <div>
        <div class='notification-wrapper custom-scrollbar' v-if="notificationData.length">
            <div class='notification' v-for='(notification, index) in notificationData' :class='notification.type'>
            <i @click='closeNotification(index)' class='fa fa-times close'>Close</i>
            <h2>{{ notification.title }}</h2>
            <p>{{ notification.message }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { nextTick } from 'vue'

export default {
    ready: function() {
        //this.makeNotification(this.testSuccess);
    },
    props: ["notificationData"],
    methods: {
    createNewNotification: function() {
      if(this.newNotification.type === "disabled") {
        return;
        die;
      }

      for (var i in this.newNotification) {
        if(this.newNotification[i] == "" || this.newNotification[i] == "undefined") {
          return;
          die;
        }
      }
      var newMessage = JSON.parse(JSON.stringify(this.newNotification));

      this.makeNotification(newMessage);

      for (var i in this.newNotification) {
        this.newNotification[i] = ""
      }
    },

    async makeNotification(sentData) {
        this.$set(this.notificationData, this.notificationData.length, sentData)
        await nextTick()
        //document.getElementById('newNotificationType').selectedIndex = "0";
        $('.notification-wrapper > div:last-child').get(0).scrollIntoView({behavior: 'smooth'});
      //this.scrollToEnd();
    },
    scrollToEnd: function() {    	
      var container = this.$el.querySelector("#notification-wrapper > notification");
      container.scrollBottom = container.scrollHeight;
    },
    closeNotification(sentNotificationIndex) {
      this.notificationData.splice(sentNotificationIndex, 1);
    }    
  },

  data() {
    return {
      notificationTypes: [
        "warning",
        "error",
        "success"
      ],

      selectedNotificationType: 'success',

      testSuccess: {
        type: "success",
        title: "great success",
        message: "success message"
      },

      testError: {
        type: "error",
        title: "Aw, darn.",
        message: "This is an error message. Assumingly, something went wrong. Sadface."
      },

      testWarning: {
        type: "warning",
        title: "Hey, guess what?",
        message: "This is a warning message. Some info comin' at ya. Meh."
      },

      newNotification: {
        type: "",
        title: "",
        message: ""
      }
    }
  }
}
</script>

<style scoped>
* {
	 box-sizing: border-box;
}
 p {
	 margin-bottom: 0;
}
 @keyframes openUp {
	 0% {
		 transform: translateY(-50%) scale(0);
		 opacity: 0;
	}
	 100% {
		 transform: translateY(0%) scale(1);
		 opacity: 1;
	}
}
 .controls {
	 margin: 0 auto;
	 text-align: center;
}
 .controls input, .controls select {
	 font-size: 16px;
	 margin: 0.4em;
	 padding: 0.6em 1em;
	 appearance: none;
	 border: 4px solid black;
	 border-radius: 5px;
}
 .controls .select {
	 position: relative;
	 display: inline-block;
}
 .controls .select select {
	 padding-right: 2em;
	 cursor: pointer;
}
 .controls .select:after {
	 content: '';
	 width: 0;
	 height: 0;
	 position: absolute;
	 top: 55%;
	 right: 1em;
	 border-left: 0.4em solid transparent;
	 border-right: 0.4em solid transparent;
	 border-bottom: 0.4em solid transparent;
	 border-top: 0.4em solid black;
	 transform: translateY(-50%);
	 user-select: none;
	 pointer-events: none;
}
 .controls button {
	 position: relative;
	 display: inline-block;
	 margin: 0.4em;
	 padding: 0.6em 1em;
	 background: #fefefe;
	 cursor: pointer;
	 user-select: none;
	 appearance: none;
	 overflow: hidden;
	 z-index: 1;
	 transition: all 0.1s;
	 font-size: 16px;
	 font-weight: bold;
	 border: 4px solid black;
	 border-radius: 0.4em;
	 box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .15);
}
 .controls button:hover:after {
	 background: black;
	 color: white;
}
 .controls button:after {
	 content: "";
	 position: absolute;
	 top: 0;
	 left: 0;
	 width: 100%;
	 height: 100%;
	 transform: translateX(-100%);
	 transition: all 0.1s;
	 z-index: -1;
}
 .controls button:hover {
	 color: white;
	 box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .5);
}
 .controls button:hover:after {
	 transform: translate(0%);
}
 .controls button.error {
	 border: 4px solid #ea0000;
}
 .controls button.error:after {
	 background: #ea0000;
}
 .controls button.success {
	 border: 4px solid #7ad03a;
}
 .controls button.success:after {
	 background: #7ad03a;
}
 .controls button.warning {
	 border: 4px solid #ffba00;
}
 .controls button.warning:after {
	 background: #ffba00;
}
 .notification-wrapper {
	 max-width: 1200px;
	 margin: 0 auto;
	 margin-top: 1em;
}
 .notification-wrapper .notification {
	 position: relative;
	 margin: 0.5em;
	 padding: 0.5em 2em 0.5em 0.5em;
	 box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.25);
	 border-left: 4px solid #fff;
	 background: #fff;
	 animation: openUp 0.1s;
}
 .notification-wrapper .notification h2, .notification-wrapper .notification p {
	 margin: 0;
}
 .notification-wrapper .notification h2 {
	 margin-bottom: 0.25em;
}
 .notification-wrapper .notification .close {
	 position: absolute;
	 top: 0.5em;
	 right: 0.5em;
	 cursor: pointer;
}
 .notification-wrapper .notification.error {
	 border-left: 4px solid #ea0000;
}
 .notification-wrapper .notification.success {
	 border-left: 4px solid #7ad03a;
}
 .notification-wrapper .notification.warning {
	 border-left: 4px solid #ffba00;
}

.notification-wrapper {
    position: fixed;
    min-width: 97%;
    bottom: 0;
    height: 75px;
    overflow-y: scroll;
    border-radius: 10px 0px 0px 10px;
    border: 1px solid #dbd4d4;
    color: black;
    margin: 5px;
    z-index: 10;
    background: white;
    display: flex;
    flex-direction: column-reverse;
}
* {
	-webkit-box-sizing: border-box;
	-moz-box-sizing: border-box;
	box-sizing: border-box;
}
 
</style>