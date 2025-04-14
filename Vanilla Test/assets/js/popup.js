import Vue from 'vue';

global.jQuery = require('jquery');
var $ = global.jQuery;
window.$ = $;

import Popup from './components/Popup.vue';

const app = new Vue({
    el: '#app',
    render: createElement => createElement(Popup)
});

Vue.config.devtools = false;
