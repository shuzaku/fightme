import Vue from 'vue';

import App from './App.vue';
import VueRouter from 'vue-router';

import routes from './routes.js';
import moment from 'moment';
import VueWaypoint from 'vue-waypoint'
import Multiselect from 'vue-multiselect'
import VueYouTubeEmbed from 'vue-youtube-embed'
import vuetify from '@/plugins/vuetify' // path to vuetify export

import _ from 'lodash';    
import firebase from 'firebase/app'

Vue.config.productionTip = false;

Object.defineProperty(Vue.prototype, '$_', { value: _ });

Vue.config.productionTip = false;

Vue.use(VueWaypoint)
Vue.use(VueRouter);
Vue.use(moment);
Vue.component('multiselect', Multiselect)
Vue.use(VueYouTubeEmbed, { global: true, componentId: "youtube-media" })

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
  render: h => h(App)
}).$mount('#app');