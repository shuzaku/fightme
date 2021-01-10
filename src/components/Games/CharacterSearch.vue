<template>
  <div class="character-search">
      <multiselect 
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
        placeholder="Search or add a Character"
        track-by="Character">
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
  
  props: {
    taggable: {
      type: Boolean,
      default: false
    },
    gameCharacters: {
      type: Array,
    },
    value: {
      type: Object
    },
    game: {
      type: Object
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

  },

  mounted() {
    this.selectedCharacter = {'name': this.value.name};
    if(this.gameCharacters){
      this.characters = this.gameCharacters;
    } else {
      this.getGames();
    }
    
  }
}
</script>
<style type="text/css">
</style>