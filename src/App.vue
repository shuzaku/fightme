<template>
  <div id="app">
    <top-nav 
    @open:createWidget="openModal($event)"/>
    <modal v-if="isWidgetOpen"
    :createType = createType
    @closeModal = "closeModal()" />
    <router-view />
  </div>
</template>

<script>
import TopNav from '@/components/Common/TopNav'
import Modal from '@/components/Common/Modal'

export default {
  name: 'App',

  components: {
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
    background: #171733;
    padding-top: 50px;
    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;
}

#app h1 {
  margin-bottom: 40px;
}

#app .v-navigation-drawer {
  position: fixed;
  z-index: 100;
  min-height: 100vh;
  margin-top: 0px;
}

#app .top-nav {
    z-index: 90;
    position: fixed;
    top: 0;
    left: 0;
}

#app .text-center {
  text-align: center;
}

#app .heavy-weight {
  font-weight: 600;
}
</style>