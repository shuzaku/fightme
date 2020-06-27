import Vue from 'vue';

import App from './App.vue';
import VueRouter from 'vue-router';

import routes from './routes.js';
import moment from 'moment';

import Multiselect from 'vue-multiselect'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(moment);
Vue.component('multiselect', Multiselect)

const router = new VueRouter({
  mode: 'history',
  routes
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app');