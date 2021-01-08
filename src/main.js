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

Object.defineProperty(Vue.prototype, '$_', { value: _ });

Vue.config.productionTip = false;

Vue.use(VueWaypoint)
Vue.use(VueRouter);
Vue.use(moment);
Vue.component('multiselect', Multiselect)
Vue.use(VueYouTubeEmbed, { global: true, componentId: "youtube-media" })

const router = new VueRouter({
  mode: 'history',
  routes
});

export const eventbus = new Vue();

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app');