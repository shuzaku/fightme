<template>
  <div class="side-nav">
    <div class="logo">
      <font-awesome-icon icon="yin-yang" /> 
    </div>
    <div class="menu-item">
      <div class="menu-heading"><font-awesome-icon icon="rss" />Feed</div>
    </div>
    <div class="menu-item">
      <div class="menu-heading"><font-awesome-icon icon="gamepad" />Combos</div>
    </div>
    <div class="menu-item">
      <div class="menu-heading"><font-awesome-icon icon="users" />Players</div>
    </div>
    <div class="menu-item">
      <div class="menu-heading"><font-awesome-icon icon="meteor" />Matches</div>
    </div>
    <div class="menu-item">
      <div class="menu-heading"><font-awesome-icon icon="network-wired" />Tournaments</div>
    </div>
    <div class="menu-item">
      <div class="menu-heading"><font-awesome-icon icon="video" />Creators</div>
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
    width: 300px;
    padding: 80px 30px;
    -webkit-box-pack: justify;
    justify-content: space-between;
  }

  .side-nav h2{
    font-size: 30px;
    color: #3EB489;
    margin-bottom: 20px;
  }

  .side-nav .menu-item {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #3EB489;
    margin-bottom: 20px;
    line-height: 1.2em;
    font-weight: 300;
  }

  .side-nav .menu-item:hover {
    color: #fff;
    cursor: pointer;
  }

  .side-nav .sub-menu-item {
    padding-left: 20px;
    margin-top: 20px;
  }

  .side-nav .menu-heading svg {
    margin-right: 15px;
    width: 25px;
  }

  .side-nav .logo {
    display: flex;
    align-items: center;
    margin-bottom: 40px;
    color: #3EB489;
    text-transform: uppercase;
    font-size: 20px;
  }

  .side-nav .logo svg {
    font-size: 40px;
    margin-bottom: 50px;
    font-weight: 300;
    margin: 0;
    margin-right: 10px;
  }
  .side-nav .logo svg path {
    fill: #3EB489;
  }
</style>
