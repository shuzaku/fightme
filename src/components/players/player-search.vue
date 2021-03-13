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
        label="name" >
        <template slot="selection" 
          slot-scope="{ values, isOpen }">
          <span class="multiselect__single" 
            v-if="values.length &amp;&amp; !isOpen">
            Select Player
          </span>
        </template>
      </multiselect>
  </div>
</template>

<script>
import PlayersService from '@/services/players-service'

export default {
  inject: ['video'],
  name: 'players-search',
  props: {
    player: {
      type: Number
    }
  },  
  data () {
    return {
      players: [],
      selectedPlayer: null
    }
  }, 

  watch: {
  },

  methods: {
    async addPlayer (newPlayer) {
      await PlayersService.addPlayer({
        Name: newPlayer
      })
      this.getPlayers();
    },

    async getPlayers () {
      const response = await PlayersService.fetchPlayers()
      this.players = response.data.players.map(player => {
        return {
          id: player._id,
          name: player.Name         
        }
      });
    },

    setPlayer() {
      this.$emit('update:player' , this.selectedPlayer);
    }
  },

  mounted () {
    this.getPlayers();
  },
}
</script>
<style type="text/css">
</style>