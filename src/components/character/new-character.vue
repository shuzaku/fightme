<template>
  <div class="characters">
    <h1>Add Character </h1>
      <div class="form">
        <div class="character-container">
          <input
              id="import-image"
              type="text"
              v-model="imageUrl"
              placeholder="Character Image Url"/>
          <div class="character-img-container" v-if="imageUrl">
            <img  :src="imageUrl" class="character-img"/>
            <v-btn @click="imageUrl=''">X</v-btn>
          </div>
          <game-search 
            v-model="game" 
            @update:game="setGame($event)" />
          <input type="text" name="title" placeholder="Character Name" v-model="characterName">
        </div>
        <div>
          <v-btn class="submit-btn" rounded @click="addCharacter()">Submit</v-btn>
        </div>
      </div>
  </div>
</template>

<script>
import GameSearch from '@/components/games/game-search';
import CharactersService from '@/services/characters-service'

export default {
  name: 'NewGame',

  components:{
      'game-search': GameSearch,
  },

  data () {
    return {
      characterName: '',
      game: null,
      imageUrl: null
    }
  },
  methods: {
    async addCharacter () {
      await CharactersService.addCharacter({
        Name: this.characterName,
        GameId: this.game.id,
        ImageUrl: this.imageUrl
      })
      this.$emit('closeModal');
    },

    setGame (game) {
      this.game = game;
    }
  }
}
</script>
<style type="text/css">
.games .game-title-container {
  margin-bottom: 40px;
}

.games .game-characters-lists-container label {
  font-size: 11px;
  font-style: italic;
  margin-bottom: 5px;
  display: block;
}

.games .new-characters-container input {
  margin: 5px;
}

.games .new-characters-container {
  margin-bottom: 50px;
}
</style>
