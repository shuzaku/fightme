import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';

import routes from './routes.js';
import moment from 'moment';
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
import { faFontAwesome } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faRss } from '@fortawesome/free-solid-svg-icons'
import { faGamepad } from '@fortawesome/free-solid-svg-icons'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { faMeteor } from '@fortawesome/free-solid-svg-icons'
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons'
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import { faYinYang } from '@fortawesome/free-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { faHandRock } from '@fortawesome/free-solid-svg-icons'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'

library.add(faRss)
library.add(faFontAwesome)
library.add(faGamepad)
library.add(faUsers)
library.add(faMeteor)
library.add(faNetworkWired)
library.add(faVideo)
library.add(faYinYang)
library.add(faPlusCircle)
library.add(faHandRock)
library.add(faDiscord)
library.add(faHeart)

Object.defineProperty(Vue.prototype, '$_', { value: _ });

Vue.use(VueWaypoint)
Vue.use(VueRouter);
Vue.use(moment);
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

new Vue({
  router,
  vuetify,
  components: { App },
  render: h => h(App)
}).$mount('#app');