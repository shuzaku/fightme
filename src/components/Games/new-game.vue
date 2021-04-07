<template>
  <div class="games">
    <div class="add-game-container" v-if="step==='new-game'">
      <h1>Add Game</h1>
        <div class="form">
          <div class="logo-img-container" v-if="game.logoUrl">
            <img  :src="game.logoUrl" class="logo"/>
            <v-btn class="remove-image-btn" @click="game.logoUrl=''">X</v-btn>
          </div>
          <input type="text" name="title" placeholder="Title" v-model="game.title">
          <input type="text"  
              v-if="!game.logoUrl"
              id="import-image"
              v-model="game.logoUrl"
              placeholder="Logo Url"/>
          <div class="bulk-add-characters">
            <textarea name="character" v-model="unfilteredCharacters" placeholder="Character Names (separated by commas)"/> 
          </div>
          <div>
            <v-btn class="submit-btn" rounded @click="nextStep()">next</v-btn>
          </div>
        </div>
      </div>
      <div class="character-detail-container" v-else>          
        <div class="game-characters-lists-container" v-if="characterList">
            <label>Character Count: ({{characterList.length}})</label>
            <ul class="character-list">
              <li v-for="(character, index) in characterList" :key="character.name">
                <div class="player-img-container" v-if="character.imageUrl">
                  <img  :src="character.imageUrl" class="player-img"/>
                  <v-btn class="remove-image-btn" @click="character.imageUrl=''">X</v-btn>
                </div>
                <p class="character-name">{{character.name}}</p>
                <v-text-field 
                    id="import-image"
                    type="text"
                    v-model="character.imageUrl"
                    placeholder="image Url"
                    v-if="!character.imageUrl" />
                <v-btn class="remove-character-btn" @click="removeCharacter(index)">X</v-btn>
              </li>
            </ul>
        </div>
        <v-btn class="submit-btn" rounded @click="addGame()">Save Game</v-btn>
      </div>
  </div>
</template>

<script>
import { eventbus } from '@/main';
import GamesService from '@/services/games-service';
import CharactersService from '@/services/characters-service';
import moment from 'moment'

export default {
  name: 'NewGame',
  data () {
    return {
      game: {
        title: '',
        id: '',
        logoUrl: ''
      },
      unfilteredCharacters: '',
      characterList: [],
      step: 'new-game'
    }
  },
  methods: {
    nextStep() {
      this.characterList = this.characters;
      this.step = 'character-list'
    },

    async addGame () {
      await GamesService.addGame({
        Title: this.game.title,
        LogoUrl: this.game.logoUrl
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

      eventbus.$emit('updateSearch');
      this.$emit('closeModal');
    },

    removeCharacter(index) {
      this.characterList.splice(index, 1);
    },

    removeLogo(){
      this.game.logoUrl = '';
    }
  },
  computed: {
    characters: function() {
      var characters = this.unfilteredCharacters
        .split(',')
        .map(character => {
          return {
            name: character.trim(),
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
.games input{
  margin-bottom: 10px;
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
  justify-content: flex-start;
  padding: 10px;
}

.games .character-list  .character-name {
  width: 250px;
}

.games .character-list .v-input {
  max-width: 300px;
  margin-left: 30px;
  float: right;
}

.games .character-list li:nth-child(even){
  background: #eee;
}

.games .player-img-container {
  position: relative;
  margin-right: 20px;
}

.games .player-img-container img{
  width: 50px;
  height: auto;
  border-radius: 50%;
}

.games .character-list .player-img-container .remove-image-btn {
  width: 10px;
  height: 10px;
  min-width: 10px;
  background-color: transparent!important;
  color: red;
  padding: 5px;
  position: absolute;
  top: 0;
  font-size: 8px;
  right: 0;
}

.games .submit-btn {
  margin-top: 20px;
}

.games .logo-img-container img{
  width: 200px;
  height: auto;
  margin: 0 auto;
  display: flex;
  overflow: hidden;
  margin-bottom: 20px;
  justify-content: space-around;
}
</style>
