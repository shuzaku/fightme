<template>
  <div id="app">
    <div class="content">
      <div class="side-panel">
        <side-nav />
      </div>
      <div class="main-panel">
        <modal v-if="isWidgetOpen"
          :createType = createType
          @closeModal = "closeModal()" />
        <div class="content-container">
          <div class="main-content-container">
            <top-nav 
              @open:createWidget="openModal($event)"/>
            <router-view />
          </div>
          <div class="trending-container">
            <h1>Trending</h1>
          </div>
        </div>
      </div>
    </div>
    <div class="svg-container">
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
  background: #333333;
  display: flex;
  overflow: auto;
  width: 100%;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 20px 50px rgb(0 0 0 / 30%);
  position: relative;
  align-content: center;
  overflow: hidden;
  flex-basis: auto;
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

#app .content-container {
  display: flex;
}

#app .side-panel {
  flex-grow: 1;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  position: relative;
  width: 50vw;
  min-width: 255px; 
  border-right: 1px dashed #3EB489; 
}

#app .main-panel {
  flex-grow: 1;
  display: flex;
}

#app .main-content-container {
  max-width: 700px;
  border-right: 1px dashed #3EB489; 
  margin-right: 50px;
  padding: 0 40px;
  position: relative;
}

#app .trending-container{
  max-width: 350px;
  padding-top: 100px;
  margin-left: 40px;
}

#app input,
#app textarea {
  display: block;
  border: 1px solid #eee;
  padding: 10px 15px;
  border-radius: 5px;
  width: 100%;
}

#app .multiselect input {
  border: none;
}
</style>