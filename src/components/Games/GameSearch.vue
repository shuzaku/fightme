<template>
  <div class="games-search">
      <multiselect 
        v-model="selectedGame" 
        :options="games" 
        :multiple="false" 
        :close-on-select="true" 
        :clear-on-select="false" 
        :preserve-search="true" 
        :taggable="true" 
        @tag="addGame"
        @input="setGame"
        placeholder="Search or add a Game"
        label="GameTitle" 
        track-by="GameTitle">
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
import GamesService from '@/services/GamesService'

export default {
  name: 'games-search',
  data () {
    return {
      games: [],
      selectedGame: null
    }
  }, 
  mounted () {
    this.getGames()
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
      this.games = response.data.games
    },

    setGame() {
      this.$emit('update:game' , this.selectedGame);
    }
  }
}
</script>
<style type="text/css">
</style>