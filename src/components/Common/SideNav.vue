<template>
  <div class="side-nav">
    <h2>Menu</h2>
    <div class="menu-item">
      <div class="menu-heading">Feed</div>
    </div>
    <div class="menu-item">
      <div class="menu-heading">Combos</div>
    </div>
    <div class="menu-item">
      <div class="menu-heading">Matches</div>
      <div class="sub-menu">
        <div class="sub-menu-item">Tournament Matches</div>
        <div class="sub-menu-item">Online Matches</div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'SideNav',

  props: {

  },

};
</script>

<style type="text/css">
  .side-nav {
    width: 270px;
    padding: 80px 30px;
  }

  .side-nav h2{
    color: #808191;
    margin-bottom: 20px;
  }

  .side-nav .menu-item {
    font-size: 15px;
    color: #808191;
    margin-bottom: 20px;
  }

  .side-nav .menu-item:hover {
    color: #fff;
    cursor: pointer;
  }

  .side-nav .sub-menu-item {
    padding-left: 20px;
    margin-top: 20px;
  }
</style>
