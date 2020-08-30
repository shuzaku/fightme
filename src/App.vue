<template>
  <div id="app">
    <top-nav 
    @open:createWidget="openModal($event)"/>
    <modal v-if="isWidgetOpen"
    :createType = createType
    @closeModal = "closeModal()" />
    <navigation-drawer />
    <router-view ></router-view>
  </div>
</template>

<script>
import TopNav from '@/components/Common/TopNav'
import NavigationDrawer from '@/components/Common/NavigationDrawer';
import Modal from '@/components/Common/Modal'

export default {
  name: 'App',

  components: {
    'navigation-drawer' : NavigationDrawer,
    'top-nav' : TopNav,
    'modal': Modal
  },

  data: () => ({
    createType: null,
    isWidgetOpen: false,
  }),

  methods: {
    openModal(createType) {
      this.createType = createType;
      this.isWidgetOpen = true;
    },

    closeModal() {
      this.isWidgetOpen = false;
    }
  }
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
#app {
  font-family: "Roboto";
  min-height: 100vh;
  background: #171733
}

#app h1 {
  margin-bottom: 40px;
}

#app .v-navigation-drawer {
  position: fixed;
  z-index: 100;
}

#app .top-nav {
  z-index: 90;
}

#app .text-center {
  text-align: center;
}
</style>