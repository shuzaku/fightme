<template>
    <div class="top-nav">
      <div class="search-container" placeholder="Search Category">
        <multiselect 
          v-model="searchValue" 
          :options="searchValues" 
          :close-on-select="true"
          :clear-on-select="true" 
          :preserve-search="true" 
          @input="setSearch()"
          placeholder="Search..."
          group-label="category"
          group-values="values"
          label="value" 
          track-by="value" 
          v-if="!isLoading">
          <template slot="selection" 
            slot-scope="{ values, isOpen }">
            <span class="multiselect__single" 
              v-if="values.length &amp;&amp; !isOpen">
              Select Game
            </span>
          </template>
        </multiselect>
      </div>
      <!-- <div class="account-btns">
        <v-btn class="register-btn" @click="openRegisterModal()">Register</v-btn>
        <register 
        v-if="isRegisterModalOpen"
        @register:success="closeRegisterModal()" />

        <v-btn class="login-btn" @click="openLoginModal()">Login</v-btn>
        <login 
        v-if="isLoginModalOpen"
        @register:success="closeLoginModal()" />
      </div> -->
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
import { eventbus } from '@/main';
// import Register from '@/components/account/register';
// import Login from '@/components/account/login';
import GeneralService from '@/services/general-service';

export default {
  name: 'TopNav',

  components: {
    // 'register': Register,
    // 'login': Login
  },
  provide() {
    return {
        'video': this.video,
    };
  },
  data () {
    return {
      isLoading: true,
      search: null,
      isDropDownOpen: false,
      isRegisterModalOpen: false,
      isLoginModalOpen: false,
      searchValue: null,
      searchValues: [],
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
        name: 'Character',
        value: 'character'
      },
      {
        name: 'Tournament',
        value: 'tournament'
      }],
    }
  },

  methods: {
    async getSearch() {
      const response = await GeneralService.fetchForSearch();
      var searchValues = response.data.searchValues.map(value => {
        var searchValue = {
          id: value._id,
          value: '',
          valueType: '',
        }
        if(value.GamesPlayed){
            searchValue.value = value.Name,
            searchValue.valueType = 'Player'
        }
        else if(value.GameId){
            searchValue.value = value.Name,
            searchValue.valueType = 'Character'
        }
        else if(value.YoutubeUrl){
            searchValue.value = value.Name,
            searchValue.valueType = 'ContentCreator'
        }
        else if(value.Title){
            searchValue.value = value.Title,
            searchValue.valueType = 'Game'
        }

        return searchValue;
      });

      this.searchValues = [
        {
          category: 'Player',
          values: searchValues.filter(value => value.valueType === 'Player')
        },
        {
          category: 'Character',
          values: searchValues.filter(value => value.valueType === 'Character')
        },
        {
          category: 'Content Creator',
          values: searchValues.filter(value => value.valueType === 'ContentCreator')
        },
        {
          category: 'Game',
          values: searchValues.filter(value => value.valueType === 'Game')
        }
      ]
      
      this.isLoading = false;
    },

    setSearch() {
      var query = {
        queryName: this.searchValue.valueType,
        queryValue: this.searchValue.id
      }
      
      eventbus.$emit('search' , query);
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
    },


  },

  mounted () {    
    this.getSearch();
  },

  created() {
      eventbus.$on('updateSearch', this.getSearch);
  },

  beforeDestroy() {
      eventbus.$off('updateSearch', this.getSearch);
  },
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
