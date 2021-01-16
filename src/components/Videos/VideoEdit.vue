<template>
  <div class="video-edit" ref="videoList"  >
<div class="game-container" >
        <label>Game</label>
        <game-search 
          v-model="video.game" />
    </div>
    <!--- players --->
    <div class="players-container" v-if=" video.contentType == 'Match'">
        <div class="player1 player">
          <label>Player 1</label>
          <player-search 
            v-model="video.players.player1"
            :player=1 />
          <label>Character</label>
          <character-search 
            v-model="video.players.player1.character"
            v-if="video.game.title"
            :game="video.game"
            :player=1  />
        </div>
        <strong> VS. </strong>
        <div class="player2 player">
          <label>Player 2</label>
          <player-search 
            v-model="video.players.player2"
            :player=2 />
          <label>Character</label>
          <character-search 
            v-if="video.game.title"
            v-model="video.players.player2.character"
            :game="video.game"
            :player=2 />
        </div>
    </div>
    <div class="winner-section">
      <label>Match Winner</label>
      <select v-model="winner" v-if="players.length === 2">
        <option value="" disabled selected>Winner</option>
        <option v-for="player in players" :key="player.id">
          {{player.name}}
        </option>
      </select>
    </div>
    <div class="character-container" v-if="video.contentType == 'Combo' && video.game.title">
        <label>Character</label>
        <character-search 
          v-if="video.game.title"
          v-model="video.combo.character"
          :characters="video.game.characters"
          :game="video.game" />
    </div>
    <div class="inputs-container" v-if="video.contentType == 'Combo' && video.combo.character">
        <label>Combo Inputs</label>
        <v-textarea v-model="video.combo.comboInput" placeholder="Combo Inputs"/>
        <div class="combo-details">
          <div class="hits">
            <label>Combo Hits</label>
            <input v-model.number="video.combo.comboHits" placeholder="Combo Hits" type="number">
          </div>
          <div class="damage">
            <label>Combo Damage</label>
            <input v-model.number="video.combo.comboDamage" placeholder="Combo Damage" type="number">
          </div>
        </div>
    </div>
    <!--- tags --->
    <div class="tag-containers">
      <label>Tags</label>
      <tag-search
        v-model="video.tags"
        :taggable = true />
    </div>
    <div class="button-container">
      <v-btn class="submit-btn" rounded @click="updateVideo()">Update</v-btn>
      <v-btn class="delete-btn" rounded @click="deleteVideo()">Delete</v-btn>
      <v-btn class="delete-btn" rounded @click="cancel()">Cancel</v-btn>
    </div>
  </div>
</template>

<script>
import PlayerSearch from '@/components/Players/PlayerSearch'
import CharacterSearch from '@/components/Games/CharacterSearch'
import GameSearch from '@/components/Games/GameSearch'
import TagSearch from '@/components/Tags/TagSearch'

export default {
  inject: ['video'],

  components:{
      'player-search' : PlayerSearch,
      'game-search': GameSearch,
      'tag-search': TagSearch,
      'character-search': CharacterSearch
  },

  name: 'video-edit',

  props: {
    value: {
      type: Boolean
    }
  },

  data () {
    return {
      winner: null
    }
  },
  computed: {
    players: function() {
      var players = [];
      if(this.video.contentType === 'Match') {
        players.push(this.video.players.player1, this.video.players.player2);
      }
      return players
    }
  },
  watch: {
    winner: function() {
      if(this.winner === this.video.players.player1.name) {
        this.video.players.player1.isWinner = true;
        this.video.players.player2.isWinner = false;
      }
      else if(this.winner === this.video.players.player2.name) {
        this.video.players.player1.isWinner = false;
        this.video.players.player2.isWinner = true;       
      }
    }
  },

  methods: {
    ready (event) {
      this.player = event.target
    },
    updateVideo() {
      this.$emit('update');
    },
    deleteVideo() {
      this.$emit('delete');
    },
    cancel() {
      this.video.isEditing = false;
    }
  }
}
</script>

<style>
.video-edit {
    padding: 20px 10px;
}

.video-edit .players-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;

}

.video-edit .player {
  min-width: 250px;
}

.video-edit .winner-section {
  width: 100%;
}

.video-edit .winner-section select {
  max-width: 300px;
  margin: 10px auto;
  width: 100%;
  height: 40px;
  border: 1px solid #eee;
  display: block;
  color: #000;
  padding: 10px;
}

.video-edit .combo-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.video-edit input {
  max-width: 265px;
  margin: 10px auto;
  width: 100%;
  height: 40px;
  color: #000;
  padding: 10px;  
  border-radius: 3px;
}

.video-card label {
  font-size: 11px;
  font-weight: 600
}

.video-card .button-container {
  display: flex;
}
</style>