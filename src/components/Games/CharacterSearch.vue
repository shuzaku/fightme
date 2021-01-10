<template>
  <div class="character-search">
      <multiselect 
        v-if="characters"
        v-model="selectedCharacter" 
        :options="characters" 
        :multiple= taggable 
        :close-on-select="true"
        :clear-on-select="true" 
        :preserve-search="true" 
        :taggable= taggable 
        label="name"
        @tag="addCharacter"
        @input="setCharacter"
        placeholder="Search or add a Character">
        <template slot="selection" 
          slot-scope="{ values, search, isOpen }">
          <span class="multiselect__single" 
            v-if="values.length &amp;&amp; !isOpen">
            Select Character
          </span>
        </template>
      </multiselect>
  </div>
</template>

<script>

import GamesService from '@/services/GamesService'

export default {
  name: 'character-search',
  inject: ['video'],
  props: {
    taggable: {
      type: Boolean,
      default: false
    },
    gameCharacters: {
      type: Array,
      default: null
    },
    value: {
      type: Object
    },
    game: {
      type: Object
    },
    player: {
      type: Number
    }
  },

  data () {
    return {
      selectedCharacter: null,
      games: [],
      characterList: [],
      characters: []
    }
  }, 

  watch: {
    selectedCharacter: function() {
      if(this.player === 1) {
        this.video.players.player1.character = this.selectedCharacter
      } 
      else if(this.player ===2) {
        this.video.players.player2.character = this.selectedCharacter
      }
    }
  },
  
  methods: {
    async addCharacter (newCharacter) {
        await GamesService.updateGame({
            id: this.gameId,
            Characters: this.characterList.push(newCharacter),
            UpdatedDate: this.timestamp
        })      
    },

    setCharacter() {
      this.$emit('update:character' , this.selectedCharacter);
    },

    async getGames () {
      const response = await GamesService.fetchGames()
      this.games = response.data.games;
      this.games.forEach(game => {
        game.Characters.forEach(character => {
          this.characters.push({'name': character.Name});
        })
      });
    },

    async getGameCharacters() {
      const response = await GamesService.queryGames([{
        queryName : 'GameTitle',
        queryValue : this.game.title
      }]);

      this.characters = response.data.games[0].Characters.map(character => {
        return {
          name: character.Name,
          imageUrl: character.ImageUrl
        }
      });
    }
  },

  mounted() {
    if(this.video){
      if(this.player === 1) {
        this.selectedCharacter = this.video.players.player1.character
      } 
      else if(this.player ===2) {
        this.selectedCharacter = this.video.players.player2.character
      }
    }


    if(this.gameCharacters) {
      this.characters = this.gameCharacters;
    } 
    else if(this.game) {
      this.getGameCharacters();
    }
    else {
      this.getGames();
    }
    
  }
}
</script>
<style type="text/css">
</style>