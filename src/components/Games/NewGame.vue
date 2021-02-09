<template>
  <div class="games">
    <h1>Add Character</h1>
      <div class="form">
        <div class="game-title-container">
          <input type="text" name="title" placeholder="TITLE" v-model="game.title">
        </div>
        <div class="bulk-add-characters">
          <textarea name="character" v-model="unfilteredCharacters" placeholder="Character Names (separated by commas)"/> 
        </div>
        <div class="game-characters-lists-container" v-if="unfilteredCharacters">
          <label>Character Count: ({{characters.length}})</label>
          <ul class="character-list">
            <li v-for="character in characters" :key="character.name">
              {{character.name}}
              <v-btn>Add Image</v-btn>
            </li>
          </ul>
        </div>
        <!-- <div class="new-characters-container">
          <input type="text" name="character" v-model="newCharacter.name" placeholder="Character Name"/> 
          <input type="text" name="characterImage" v-model="newCharacter.imageUrl" placeholder="Image URL"/>
          <v-btn class="submit-btn" rounded @click="addCharacter()">Add Character</v-btn>
        </div> -->
        <div>
          <v-btn class="submit-btn" rounded @click="addGame()">Submit</v-btn>
        </div>
      </div>
  </div>
</template>

<script>
import GamesService from '@/services/GamesService'
import CharactersService from '@/services/CharactersService'
import moment from 'moment'

export default {
  name: 'NewGame',
  data () {
    return {
      game: {
        title: '',
        id: ''
      },
      unfilteredCharacters: ''
    }
  },
  methods: {
    async addGame () {
      await GamesService.addGame({
        Title: this.game.title
      });
      this.getGameId();
    },

    async getGameId() {
      const response = await GamesService.queryGames([{
        queryName : 'Title',
        queryValue : this.game.title
      }]);

      this.game.id = response.data.games[0]._id;
      this.addCharacters();
    },

    async addCharacters() {
      await CharactersService.addBulkCharacters(this.characters.map(character => {
        return {
          Name: character.name,
          ImageUrl: character.imageUrl,
          GameId: this.game.id
        }
      }));
    }
  },
  computed: {
    characters: function() {
      var characters = this.unfilteredCharacters
        .split(',')
        .map(character => {
          return {
            name: character,
            imageUrl: '' 
          } 
        });
      return characters
    },

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

.games .character-list li{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.games .character-list li:nth-child(even){
  background: #eee;
}
</style>
