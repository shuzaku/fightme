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
import PlayersService from '@/services/PlayersService'

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
    selectedPlayer: function() {
      if(this.player === 1) {
        this.video.players.player1.id = this.selectedPlayer.id;
        this.video.players.player1.name = this.selectedPlayer.name;
      } 
      else if(this.player === 2) {
        this.video.players.player2.id = this.selectedPlayer.id;
        this.video.players.player2.name = this.selectedPlayer.name;      }
    }
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
      this.players = response.data.players.map(player => {
        return {
          id: player._id,
          name: player.PlayerName         
        }
      });
    },

    setPlayer() {
      this.$emit('update:player' , this.selectedPlayer.id);
    }
  },

  mounted () {
    if(this.video.match.player1.id || this.video.match.player2.id){
      if(this.player === 1) {
        this.selectedPlayer = this.video.n.player1;
      } 
      else if(this.player === 2) {
        this.selectedPlayer = this.video.players.player2;
      }
    }

    this.getPlayers();
  },
}
</script>
<style type="text/css">
</style>