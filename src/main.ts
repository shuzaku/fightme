import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';

import routes from './routes.js';
import VueWaypoint from 'vue-waypoint'
import Multiselect from 'vue-multiselect'
import VueYouTubeEmbed from 'vue-youtube-embed'
import vuetify from '@/plugins/vuetify' // path to vuetify export
import VueClipboard from 'vue-clipboard2'
import axios from 'axios'
import VueAxios from 'vue-axios'

import _ from 'lodash';    
import firebase from 'firebase/app'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import VTooltip from 'v-tooltip'
import VueQuillEditor from 'vue-quill-editor'
import VueGtag from "vue-gtag";

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


library.add(faDiscord)


Object.defineProperty(Vue.prototype, '$_', { value: _ });


Vue.use(VueQuillEditor, /* { default global options } */)
Vue.use(VueWaypoint)
Vue.use(VueRouter);
Vue.use(VTooltip)
Vue.component('multiselect', Multiselect)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(VueYouTubeEmbed, { global: true, componentId: "youtube-media" })
Vue.use(VueClipboard)
Vue.use(VueAxios, axios)

Vue.config.productionTip = false;
const configOptions = {
  apiKey: "AIzaSyCBxK55DQsogeGPMEr2TEWw5xsG6_HZtrg",
  authDomain: "fightmelogin.firebaseapp.com",
  projectId: "fightmelogin",
  storageBucket: "fightmelogin.appspot.com",
  messagingSenderId: "1047017532667",
  appId: "1:1047017532667:web:67f9ee065d0b56909a545e"
};

const router = new VueRouter({
  mode: 'history',
  routes
});

export const eventbus = new Vue();
firebase.initializeApp(configOptions);

// Configuration VueAnalytics
Vue.use(VueGtag, {
  config: { id: "GTM-WPH3J5K" }
});


new Vue({
  router,
  vuetify,
  components: { App },
  render: h => h(App)
}).$mount('#app');