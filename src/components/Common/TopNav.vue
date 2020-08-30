<template>
    <div class="top-nav">
      <div class="search-container">
        <search-all
          v-model="search"
          @update:search="setSearch($event)" />
      </div>
      <v-btn class="mx-2" fab dark color="cyan" @click="toggleDropDown()">
        <v-icon dark>mdi-plus</v-icon>
      </v-btn>
      <div class="add-content-dropdown" v-if="isDropDownOpen">
        <ul>
          <li v-for="create in createOptions" :key="create.value" @click="openCreateWidget(create.value)">
            {{create.name}}
          </li>
        </ul>
      </div>
    </div>
</template>

<script>
import SearchAll from '@/components/Common/SearchAll'
import { eventbus } from '@/main'

export default {
  name: 'TopNav',

  components: {
    'search-all': SearchAll,
  },

  data: () => ({
    search: null,
    isDropDownOpen: false,
    createOptions:[{
      name: 'Video',
      value: 'video'
    },
    {
      name: 'Game',
      value: 'game'
    },
    {
      name: 'Player',
      value: 'player'
    }]
  }),

  methods: {
    setSearch(searchInput) {
      eventbus.$emit('search:update', searchInput);
    },
    openCreateWidget(createType) {
      this.$emit('open:createWidget' , createType);
      this.toggleDropDown();
    },
    toggleDropDown() {
      this.isDropDownOpen = !this.isDropDownOpen;
    }
  }
};
</script>

<style type="text/css">
  .top-nav .search-container {
    padding: 5px;
  }

  .top-nav .search-container .multiselect {
    margin: 0 auto;
    width: 400px;
  }

  .top-nav {
    height: 50px;
    width: 100%;
    color: #fff;
    text-align: center;
    background: #0f102e;
    display: flex;
    justify-content: center;
    padding: 0 56px 0 56px;
    position: relative;
  }

  .top-nav .v-btn {
    position: absolute;
    top: 0;
    right: 56px;
    background: #1ab097 !important;
  }

  .top-nav .add-content-dropdown {
    position: absolute;
    top: 100%;
    margin-top: 20px;
    right: 35px;
  }

  .top-nav .add-content-dropdown li {
    list-style: none;
    font-size: 40px;
    margin-bottom: 20px;
    cursor: pointer;
  }

  .top-nav .add-content-dropdown li:hover {
    opacity: .7;
  }
</style>
