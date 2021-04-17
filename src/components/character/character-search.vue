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
        placeholder="Search or add a Character"
        @input="setCharacter">
        <template slot="selection" 
          slot-scope="{ values, search, isOpen }">
          <span v-if="values.length &amp;&amp; !isOpen" 
            class="multiselect__single">
            Select Character
          </span>
        </template>
      </multiselect>
  </div>
</template>

<script>

import CharactersService from '@/services/characters-service'

export default {
  name: 'CharacterSearch',
  props: {
    taggable: {
      type: Boolean,
      default: false
    },
    gameId: {
      type: String,
      default: null
    },
    value: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      selectedCharacter: null,
      games: [],
      characterList: [],
      characters: [],
    }
  }, 

  watch: {
  },

  mounted() {
    this.getCharacters();
  },
  
  methods: {
    setCharacter() {
      this.$emit('update:character' , this.selectedCharacter.id);
    },

    async getCharacters() {
      const response = await CharactersService.queryCharacters([{
        queryName : 'GameId',
        queryValue : this.gameId
      }]);

      this.characters = response.data.characters.map(character => {
        return {
          id: character._id,
          name: character.Name,
          imageUrl: character.ImageUrl
        }
      });

      if (this.value) {
          this.selectedCharacter = this.characters.filter(character => character.id === this.value);
      }

    }
  }
}
</script>
<style type="text/css">
</style>