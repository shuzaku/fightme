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

import CharactersService from '@/services/characters-service'

export default {
  name: 'character-search',
  inject: ['video'],
  props: {
    taggable: {
      type: Boolean,
      default: false
    },
    gameId: {
      type: String
    },
    player: {
      type: Number
    },
    value: {
      type: String
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
    }
  },

  mounted() {
    this.getCharacters();
  }
}
</script>
<style type="text/css">
</style>