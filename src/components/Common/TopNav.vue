<template>
    <div class="top-nav">
      <div class="search-container" placeholder="Search Category">
        <select name="queryName" v-model="queryName" class="search-category">
          <option disabled selected>Search Category</option>
          <option v-for="name in queryNames" :key="name" :value="name">{{name}}</option>
        </select>
        <game-search
          v-if="queryName === 'Game'"
          @update:game="setQueryInput($event)" />
        <player-search
          v-if="queryName === 'Player'"
          @update:player="setQueryInput($event)" />
        <tag-search
          v-if="queryName === 'Tag'"
          @update:tag="setQueryInput($event)" />
        <character-search
          v-if="queryName === 'Character'"
          @update:character="setQueryInput($event)" />
        <video-type-search
          v-if="queryName === 'Video Type'"
          @update:type="setQueryInput($event)" />
        <v-btn
          class="search-btn"
          dark color="cyan"
          v-if="queryName && queryValue"
          @click="submitQuery">
          Search
        </v-btn>
      </div>
      <div class="account-btns">
        <v-btn class="register-btn" @click="openRegisterModal()">Register</v-btn>
        <register 
        v-if="isRegisterModalOpen"
        @register:success="closeRegisterModal()" />

        <v-btn class="login-btn" @click="openLoginModal()">Login</v-btn>
        <login 
        v-if="isLoginModalOpen"
        @register:success="closeLoginModal()" />
      </div>
      <v-btn class="mx-2 add-btn" fab dark color="cyan" @click="toggleDropDown()" >
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
// import SearchAll from '@/components/Common/SearchAll'
import { eventbus } from '@/main'
import GameSearch from '@/components/Games/GameSearch'
import PlayerSearch from '@/components/Players/PlayerSearch'
import TagSearch from '@/components/Tags/TagSearch'
import CharacterSearch from '@/components/Games/CharacterSearch'
import VideoTypeSearch from '@/components/Videos/VideoTypeSearch'
import Register from '@/components/Account/Register'
import Login from '@/components/Account/Login'

export default {
  name: 'TopNav',

  components: {
    // 'search-all': SearchAll,
    'game-search': GameSearch,
    'player-search': PlayerSearch,
    'tag-search': TagSearch,
    'character-search': CharacterSearch,
    'video-type-search': VideoTypeSearch,
    'register': Register,
    'login': Login
  },
  provide() {
    return {
        'video': this.video,
    };
  },
  data: () => ({
    search: null,
    isDropDownOpen: false,
    queryName: '',
    queryNames:['Player', 'Game' , 'Character' , 'Video Type' , 'Tag'],
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
    },
    {
      name: 'Creator',
      value: 'creator'
    },
    {
      name: 'Tournament',
      value: 'tournament'
    }],
    queryValue: null,
    video: null,
    isRegisterModalOpen: false,
    isLoginModalOpen: false
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
    },

    submitQuery() {
      eventbus.$emit('query:update' , {'queryName' : this.queryName, 'queryValue' : this.queryValue})
    },

    setQueryInput(input) {
      this.queryValue = input;
    },

    openRegisterModal() {
      this.isRegisterModalOpen = true;
      this.closeLoginModal();
    },

    closeRegisterModal() {
      this.isRegisterModalOpen = false;
    },

    openLoginModal() {
      this.isLoginModalOpen = true;
      this.closeRegisterModal();
    },

    closeLoginModal() {
      this.isLoginModalOpen = false;
    }
  }
};
</script>

<style type="text/css">
  .top-nav .search-container {
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    background: transparent;
    display: flex;
    justify-content: center;
    padding: 0 56px 0 56px;
    position: relative;
  }

  .top-nav .add-btn {
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

  .top-nav .search-container fieldset {
    background: #fff;
  }

  .top-nav .search-category,
  .top-nav .search-input {
    background: #fff;
    color: #000;
    padding: 7px;
    border-radius: 8px;
    width: 200px;
    margin: 0 10px;
  }

  .top-nav .search-btn {
    margin-left: 10px;
  }

  .top-nav .account-btns .v-btn {
    color: #000;
    margin: 0 10px;
    height: 33px;
  }

  .top-nav .account-btns {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
