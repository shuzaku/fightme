<template>
  <div class="games">
    <h1>Add Game</h1>
      <div class="form">
        <div class="game-title-container">
          <input type="text" name="title" placeholder="TITLE" v-model="title">
        </div>
        <div class="game-characters-lists-container">
          <label>Character Count: ({{characters.length}})</label>
          <ul>
            <li v-for="character in characters" :key="character.Name">
              {{character.Name}}
            </li>
          </ul>
        </div>
        <div class="new-characters-container">
          <input type="text" name="character" v-model="newCharacter.name" placeholder="Character Name"/> 
          <input type="text" name="characterImage" v-model="newCharacter.imageUrl" placeholder="Image URL"/>
          <v-btn class="submit-btn" rounded @click="addCharacter()">Add Character</v-btn>
        </div>
        <div>
          <v-btn class="submit-btn" rounded @click="addGame()">Submit</v-btn>
        </div>
      </div>
  </div>
</template>

<script>
import GamesService from '@/services/GamesService'
import moment from 'moment'

export default {
  name: 'NewGame',
  data () {
    return {
      title: '',
      characters: [],
      newCharacter: {
        name: '',
        imageUrl: ''
      }

    }
  },
  methods: {
    async addGame () {
      await GamesService.addGame({
        GameTitle: this.title,
        Characters: this.characters,
        CreatedDate: this.timestamp,
        UpdatedDate: null
      })
      this.$router.push({ name: 'Games' })
    },

    addCharacter() {
      if(this.newCharacter)
      this.characters.push({
        Name: this.newCharacter.name,
        ImageUrl: this.newCharacter.imageUrl
      })

      this.newCharacter.name = '',
      this.newCharacter.imageUrl =  ''
    }
  },
  computed: {
    timestamp: function() {
      return moment().format()
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
