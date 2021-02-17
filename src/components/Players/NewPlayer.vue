<template>
  <div class="add-player">
    <h1>Add Player</h1>
      <div class="form">
        <div>
          <input
              id="import-image"
              type="text"
              v-model="player.imageUrl"
              placeholder="Player Image Url"
              v-if="!player.imageUrl" />
          <div class="player-img-container" v-if="player.imageUrl">
            <img  :src="player.imageUrl" class="player-img"/>
            <v-btn @click="player.imageUrl=''">X</v-btn>
          </div>
          <input type="text" name="name" placeholder="Player Name" v-model="player.name">
          <input type="text" name="region" placeholder="Region" v-model="player.region">
          <game-search 
            v-model="player.games" 
            :taggable="true"
            @update:game="setGame($event)" />
          <ul class="list-of-games">
            <li v-for = "game in player.games" class="player-games" :key="game._id">
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
import moment from 'moment'


export default {
  components: {

  },
  name: 'NewPlayer',
  data () {
    return {
      player: {
        name: '',
        region: '',
        games: '',
        imageUrl: ''
      }
    }
  },
  methods: {
    async addPlayer () {
      await PlayersService.addPlayer({
        PlayerName: this.player.name,
        PlayerRegion: this.player.region,
        GamesPlayed: this.player.games,
        PlayerImg: this.player.imageUrl
      })
      this.$emit('closeModal');
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
  max-width: 100px;
  height: auto;
  border-radius: 50%;
  margin: 0 auto;
}
</style>
