<template>
  <div class="add-tournament">
    <h1>Add Tournament</h1>
      <div class="form" v-if="step === 'tournament'">
        <div class="tournament-img-container" v-if="tournament.imageUrl">
          <img  :src="tournament.imageUrl" class="tournament-img"/>
          <v-btn @click="tournament.imageUrl=''">X</v-btn>
        </div>
        <input 
          id="import-image"
          type="text"
          v-model="tournament.imageUrl"
          placeholder="image Url"
          v-if="!tournament.imageUrl" />
        <input type="text" name="name" placeholder="Tournament Name" v-model="tournament.name">
        <input type="text" name="location" placeholder="Location" v-model="tournament.location">
        <input type="text" name="date" placeholder="Date" v-model="tournament.date">
        <input type="text" name="tournament series" placeholder="Tournament Series" v-model="tournament.date">
        <v-btn class="submit-btn" rounded @click="goToGameStep()">Set Games</v-btn>
      </div>
      <div class="form" v-if="step === 'games'">
        <game-search 
          v-model="games" 
          :taggable="true"
          @update:game="setGame($event)" />
        <ul class="list-of-games">
          <li v-for = "game in selectedGames" class="tournament-games" :key="game._id">
              {{game.title}}
          </li>
        </ul>
        <v-btn class="submit-btn" rounded @click="goToGameStep()">Set Players</v-btn>
      </div>
      <div class="form" v-if="step === 'players'">
      
        <v-btn class="submit-btn" rounded @click="addTournament()">Add Tournament</v-btn>
      </div>
  </div>
</template>

<script>
import TournamentsService from '@/services/TournamentsService'
import GameSearch from '@/components/Games/GameSearch'
import moment from 'moment'


export default {
  components: {
    'game-search': GameSearch,
  },
  name: 'NewTournament',
  data () {
    return {
      step: 'tournament',
      games: '',
      tournament: {
        name: '',
        location: '',
        games: [],
        date: '',
        series: '',
        logoUrl: '',
        players: [],
      }
    }
  },
  methods: {
    async addTournament () {
      this.collectGameIds()
      await TournamentsService.addTournament({
        Name: this.tournament.name,
        Location: this.tournament.location,
        Games: this.tournament.gameIds,
        Date: this.tournament.date,
        Series: this.tournament.series,
        LogoUrl: this.tournament.logoUrl,
        PlayerIds: this.tournament.players
      })
    },

    goToGameStep() {
      this.step = 'games';
    },

    setGame(games) {
      this.games = games
    }
  },
  computed: {
    timestamp: function() {
      return moment().format()
    }
  },

}
</script>
<style type="text/css">


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
