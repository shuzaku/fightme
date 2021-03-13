<template>
  <div id="app">
    <div class="content">
      <side-nav />
      <div class="main-panel">
        <top-nav 
          @open:createWidget="openModal($event)"/>
        <modal v-if="isWidgetOpen"
          :createType = createType
          @closeModal = "closeModal()" />
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import TopNav from '@/components/common/top-nav';
import SideNav from '@/components/common/side-nav';
import Modal from '@/components/common/modal';

export default {
  name: 'App',

  components: {
    'top-nav' : TopNav,
    'side-nav': SideNav,
    'modal': Modal,
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
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background: url('https://www.pdvg.it/wp-content/uploads/2018/02/EVO-2018.jpg');
}

#app h1 {
  margin-bottom: 40px;
}

#app .main-panel {
  position: relative;
  width: 100%;
  overflow: hidden;
}

#app .content {
  background: rgba(31,29,43,.95);
  display: flex;
  overflow: auto;
  width: 100%;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 20px 50px rgb(0 0 0 / 30%);
  position: relative;
  align-content: center;
  overflow: hidden;
}

#app .v-navigation-drawer {
  position: fixed;
  z-index: 100;
  min-height: 100vh;
  margin-top: 0px;
}

#app .top-nav {
    z-index: 90;
    position: absolute;
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