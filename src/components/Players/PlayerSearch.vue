<template>
  <div class="players-search">
      <multiselect 
        v-model="selectedPlayer" 
        :options="players" 
        :multiple="false" 
        :close-on-select="true" 
        :clear-on-select="false" 
        :preserve-search="true" 
        :taggable="true" 
        @tag="addPlayer"
        @input="setPlayer"
        placeholder="Search or add a Player"
        label="PlayerName" 
        track-by="PlayerName">
        <template slot="selection" 
          slot-scope="{ values, search, isOpen }">
          <span class="multiselect__single" 
            v-if="values.length &amp;&amp; !isOpen">
            Select Player
          </span>
        </template>
      </multiselect>
  </div>
</template>

<script>
import PlayersService from '@/services/PlayersService'

export default {
  name: 'players-search',
  data () {
    return {
      players: [],
      selectedPlayer: null
    }
  }, 
  mounted () {
    this.getPlayers()
  },
  methods: {
    async addPlayer (newPlayer) {
      await PlayersService.addPlayer({
        PlayerName: newPlayer,
        CreatedDate: this.timestamp,
        UpdatedDate: null,
      })
      this.getPlayers();
    },

    async getPlayers () {
      const response = await PlayersService.fetchPlayers()
      this.players = response.data.players
    },

    setPlayer() {
      this.$emit('update:player' , this.selectedPlayer);
    }
  }
}
</script>
<style type="text/css">
</style>