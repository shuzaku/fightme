<template>
  <div class="add-tournament">
    <h1>Add Tournament</h1>
      <div class="form">
        <div>
          <v-text-field 
              id="import-image"
              type="text"
              v-model="tournamentImgUrl"
              placeholder="image Url"
              v-if="!tournamentImgUrl" />
          <div class="tournament-img-container" v-if="tournamentImgUrl">
            <img  :src="tournamentImgUrl" class="tournament-img"/>
            <v-btn @click="tournamentImgUrl=''">X</v-btn>
          </div>
          <input type="text" name="name" placeholder="PLAYER NAME" v-model="name">
          <input type="text" name="region" placeholder="REGION" v-model="region">
          <game-search 
            v-model="game" 
            :taggable="true"
            @update:game="setGame($event)" />
          <ul class="list-of-games">
            <li v-for = "game in tournament.selectedGames" class="tournament-games" :key="game._id">
                {{game.GameTitle}}
            </li>
          </ul>
        </div> 
        <div>
          <v-btn class="submit-btn" rounded @click="addTournament()">Add</v-btn>
          
        </div>
      </div>
  </div>
</template>

<script>
import TournamentsService from '@/services/TournamentsService'
import GamesService from '@/services/GamesService'
import moment from 'moment'


export default {
  components: {

  },
  name: 'NewTournament',
  data () {
    return {
      games: [],
      name: '',
      region: '',
      selectedGames: [],
      gameIds: '',
      tournamentImgUrl: null
    }
  },
  methods: {
    async addTournament () {
      this.collectGameIds()
      await TournamentsService.addTournament({
        TournamentName: this.name,
        CreatedDate: this.timestamp,
        UpdatedDate: null,
        GamesPlayed: this.gameIds,
        TournamentImg: this.tournamentImgUrl
      })
      this.$router.push({ name: 'Tournaments' })
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
.add-tournament {
    max-width: 600px;
    text-align: left;
    margin: 0 auto;
    background: #fff;
    width: 400px;
    border-radius: 10px;
    padding: 20px 60px;
}

.add-tournament button,
.add-tournament input {
    display: block;
    margin-bottom: 20px;
}

.add-tournament .submit-btn {
  margin-top: 20px;
}

.add-tournament .tournament-img-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.add-tournament .tournament-img-container .tournament-img {
  max-width: 175px;
  border-radius: 50%;
  margin: 0 auto;
  border: 5px solid #000;
}
</style>
