<template>
  <div class="add-player">
    <h1>Add Player</h1>
      <div class="form">
        <div>
          <v-text-field 
              id="import-image"
              type="text"
              v-model="playerImgUrl"
              placeholder="image Url"
              v-if="!playerImgUrl" />
          <div class="player-img-container" v-if="playerImgUrl">
            <img  :src="playerImgUrl" class="player-img"/>
            <v-btn @click="playerImgUrl=''">X</v-btn>
          </div>
          <input type="text" name="name" placeholder="PLAYER NAME" v-model="name">
          <input type="text" name="region" placeholder="REGION" v-model="region">
          <game-search 
            v-model="game" 
            :taggable="true"
            @update:game="setGame($event)" />
          <ul class="list-of-games">
            <li v-for = "game in player.selectedGames" class="player-games" :key="game._id">
                {{game.GameTitle}}
            </li>
          </ul>
        </div> 
        <div>
          <v-btn class="submit-btn" rounded @click="addPlayer()">Add</v-btn>
          
        </div>
      </div>
  </div>
</template>

<script>
import PlayersService from '@/services/PlayersService'
import GamesService from '@/services/GamesService'
import moment from 'moment'


export default {
  components: {

  },
  name: 'NewPlayer',
  data () {
    return {
      games: [],
      name: '',
      region: '',
      selectedGames: [],
      gameIds: '',
      playerImgUrl: null
    }
  },
  methods: {
    async addPlayer () {
      this.collectGameIds()
      await PlayersService.addPlayer({
        PlayerName: this.name,
        CreatedDate: this.timestamp,
        UpdatedDate: null,
        PlayerRegion: this.region,
        GamesPlayed: this.gameIds,
        PlayerImg: this.playerImgUrl
      })
      this.$router.push({ name: 'Players' })
    },

    async getGames () {
      const response = await GamesService.fetchGames()
      this.games = response.data.games
    },

    collectGameIds () {
      this.gameIds = this.selectedGames.map( x => x._id )
    }
  },
  computed: {
    timestamp: function() {
      return moment().format()
    }
  },
  mounted () {
    this.getGames()
  }
}
</script>
<style type="text/css">
.add-player {
    max-width: 600px;
    text-align: left;
    margin: 0 auto;
    background: #fff;
    width: 400px;
    border-radius: 10px;
    padding: 20px 60px;
}

.add-player button,
.add-player input {
    display: block;
    margin-bottom: 20px;
}

.add-player .submit-btn {
  margin-top: 20px;
}

.add-player .player-img-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.add-player .player-img-container .player-img {
  max-width: 175px;
  border-radius: 50%;
  margin: 0 auto;
  border: 5px solid #000;
}
</style>
