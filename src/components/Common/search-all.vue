<template>
  <div class="overall-search">
      <multiselect 
        v-model="searchInput" 
        :options="searchResults" 
        :multiple= taggable 
        :close-on-select="true"
        :clear-on-select="false" 
        :preserve-search="true" 
        :taggable= taggable 
        @input="setSearch"
        placeholder="Search..."
        label="name" 
        track-by="name" 
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
</template>

<script>
import GamesService from '@/services/games-service';
import PlayersService from '@/services/players-service';

export default {
  name: 'overall-search',

  props: {
    taggable: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      names: [],
      searchResults: [],
      searchInput: null,
      isLoading: true
    }
  }, 

  mounted () {
    this.isLoading = true;
    this.names = [];
    this.getGames();
    this.getPlayers();
    this.isLoading = false;
  },

  methods: {
    async getGames () {
      const response = await GamesService.fetchGames()
      var games = response.data.games;

      games.forEach(game => {
        
        game.Characters.forEach( character => {
          this.searchResults.push({name: character.Name, type: 'character'});
        })
        this.searchResults.push({name: game.GameTitle, type: 'game'});
      })

    },

    async getPlayers () {
      const response = await PlayersService.fetchPlayers()
      var players = response.data.players

      players.forEach(player => {
        this.searchResults.push({name: player.PlayerName, type: 'player'});
      })
    },

    setSearch() {
      this.$emit('update:search' , this.searchInput);
    }
  }
}
</script>
<style type="text/css">
  .overall-search {
    max-width: 400px;
    margin: 0 auto;
  }
</style>