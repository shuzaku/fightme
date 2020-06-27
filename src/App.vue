<template>
  <div id="app">
    <router-view ></router-view>

  </div>
</template>

<script>


export default {
  name: 'App',

  components: {

  },

  data: () => ({
    //
  }),
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
#app {
  font-family: "Roboto";
  min-height: 100vh;
  /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#bac0f3+0,f0cef7+100 */
  background: #bac0f3; /* Old browsers */
  background: -moz-linear-gradient(45deg, #bac0f3 0%, #f0cef7 100%); /* FF3.6-15 */
  background: -webkit-linear-gradient(45deg, #bac0f3 0%,#f0cef7 100%); /* Chrome10-25,Safari5.1-6 */
  background: linear-gradient(45deg, #bac0f3 0%,#f0cef7 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#bac0f3', endColorstr='#f0cef7',GradientType=1 ); /* IE6-9 fallback on horizontal gradient */
}


</style>