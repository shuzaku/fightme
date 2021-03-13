<template>
  <div class="games-search">
      <multiselect 
        v-model="selectedGame" 
        :options="games" 
        :multiple= taggable 
        :close-on-select="true"
        :clear-on-select="false" 
        :preserve-search="true" 
        :taggable= taggable 
        @tag="addGame"
        @input="setGame"
        placeholder="Search or add a Game"
        label="title" >
        <template slot="selection" 
          slot-scope="{ values, search, isOpen }">
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

export default {
  name: 'games-search',
  props: {
    taggable: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      games: [],
      selectedGame: null
    }
  },

  methods: {
    async addGame (newGame) {
      await GamesService.addGame({
        GameTitle: newGame,
        CreatedDate: this.timestamp,
        UpdatedDate: null
      })
    },

    async getGames () {
      const response = await GamesService.fetchGames()
      this.games = response.data.games.map(game => {
        return {
            id: game._id,
            title: game.Title,
            logoUrl: game.LogoUrl
        }
      })
    },

    setGame() {
      this.$emit('update:game' , this.selectedGame);
    }
  },

  mounted () {    
    if(this.video){
      this.selectedGame = this.video.game
    }
    this.getGames();
  },
}
</script>
<style type="text/css">
</style>