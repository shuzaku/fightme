<template>
  <div class="video-edit" ref="videoList"  >
<div class="game-container" >
        <game-search 
          v-model="video.game" />
    </div>
    <!--- players --->
    <div class="players-container" v-if=" video.contentType == 'Match'">
        <div class="player1 player">
          <player-search 
            v-model="video.players.player1" />
          <character-search 
            v-model="video.players.player1.character"
            v-if="video.game.title"
            :gameCharacters="video.game.characters"  />
        </div>
        <strong> VS. </strong>
        <div class="player2 player">
          <player-search 
            v-model="video.players.player2" />
          <character-search 
            v-if="video.game.title"
            v-model="video.players.player2.character"
            :game="video.game"
            :characters="video.game.characters" />
          </div>
    </div>
    <div class="character-container" v-if="video.contentType == 'Combo' && video.game.title">
        <character-search 
          v-if="video.game.title"
          v-model="video.combo.comboCharacter"
          :characters="video.game.characters" />
    </div>
    <div class="inputs-container" v-if="video.contentType == 'Combo' && video.combo.comboCharacter">
        <v-textarea v-model="video.combo.comboInput" placeholder="Combo Inputs"/>
    </div>
    <!--- tags --->
    <div class="tag-containers">
      <tag-search
        v-model="video.tags"
        :taggable = true />
    </div>
    <v-btn class="submit-btn" rounded @click="updateVideo()">Update</v-btn>
  </div>
</template>

<script>
import PlayerSearch from '@/components/Players/PlayerSearch'
import CharacterSearch from '@/components/Games/CharacterSearch'
import GameSearch from '@/components/Games/GameSearch'
import TagSearch from '@/components/Tags/TagSearch'

export default {
  components:{
      'player-search' : PlayerSearch,
      'game-search': GameSearch,
      'tag-search': TagSearch,
      'character-search': CharacterSearch
  },

  name: 'video-edit',

  props: {
    video: {
      type: Object,
    },
    value: {
      type: Boolean
    }
  },

  data () {
    return {
    }
  },

  methods: {
    ready (event) {
      this.player = event.target
    },
    updateVideo() {
      this.$emit('update', this.video);
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
</style>