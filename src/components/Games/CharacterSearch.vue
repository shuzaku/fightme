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
        label="Name"
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
    characters: {
        type: Array 
    }
  },

  data () {
    return {
      selectedCharacter: null
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
    }
  }
}
</script>
<style type="text/css">
</style>