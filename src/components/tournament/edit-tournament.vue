<template>
  <div class="edit-tournaments">
    <h1>Edit Tournament</h1>
    <v-text-field 
        id="import-image"
        type="text"
        v-model="tournament.tournamentImg"
        placeholder="image Url"
        v-if="!tournament.tournamentImg" />
    <div class="tournament-img-container" v-if="tournament.tournamentImg">
      <img  :src="tournament.tournamentImg" class="tournament-img"/>
      <v-btn @click="tournament.tournamentImg=''">X</v-btn>
    </div>
    <div class="form">
      <div>
        <input type="text" name="name" placeholder="Tournament Name" v-model="tournament.name">
      </div>
      <div>
        <input type="text" name="region" placeholder="Region" v-model="tournament.region">
      </div>
      <!--- game --->
      <game-search 
        v-model="game" 
        :taggable="true"
        @update:game="setGame($event)" />
      <ul class="list-of-games">
        <li v-for = "game in tournament.selectedGames" class="tournament-games" :key="game._id">
            {{game.GameTitle}}
        </li>
      </ul>
      <div>
        <button class="app_post_btn" @click="updateTournament">Update</button>
      </div>
    </div>
  </div>
</template>

<script>
import TournamentsService from '@/services/TournamentsService';
import moment from 'moment';
import GameSearch from '@/components/games/game-search';

export default {
  name: 'EditTournament',

  components:{
      'game-search': GameSearch,
  },

  data () {
    return {
      tournament: {
        name: null,
        region: null,
        updatedDate: null,
        selectedGames: [],
        tournamentImg: null
      },
      games: '',
      game: null
    }
  },
  methods: {
    async getTournament () {
        const response = await TournamentsService.getTournament({
          id: this.$route.params.id
        });
        this.tournament.name = response.data.TournamentName
        this.tournament.region = response.data.Region
        this.tournament.createdDate = response.data.CreatedDate
        this.tournament.selectedGames= response.data.GamesPlayed 
        this.tournament.tournamentImg = response.data.TournamentImg
    },

    async updateTournament () {
      await TournamentsService.updateTournament({
        id: this.$route.params.id,
        TournamentName: this.tournament.name,
        Region: this.tournament.region,
        GamesPlayed: this.tournament.selectedGames,
        UpdatedDate: this.tournament.timestamp,
        TournamentImg: this.tournament.tournamentImg
      })
      this.$router.push({ name: 'Tournaments' })
    },

    setGame(game) {
      this.tournament.selectedGames = game;
    }
  },
  
  computed: {
    timestamp: function() {
      return moment().format()
    }
  },

  created() {
    this.getTournament()
  }
}
</script>
<style type="text/css">
.edit-tournaments {
    max-width: 600px;
    text-align: left;
    margin: 0 auto;
    background: #fff;
    width: 400px;
    border-radius: 10px;
    padding: 20px 60px;
}

.edit-tournaments  .form input, 
.edit-tournaments  .form textarea, 
.edit-tournaments  .multiselect-container .multiselect {
  width: 100%; 
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none; 
  font-size: 12px;
  margin: 0 auto;
}

.edit-tournaments .games-search {
  margin: 0;
}

.edit-tournaments .app_post_btn {
  width: 100%;
}
.edit-tournaments .form div {
  margin: 20px 0;
}

.edit-tournaments .form .multiselect__select {
  margin: 0
}

.edit-tournaments .multiselect--active .multiselect__tags-wrap {
  display: none
}

.edit-tournaments .multiselect__tags,
.edit-tournaments .multiselect__select {
  margin: 0;
}

.edit-tournaments .tournament-games {
  list-style: none;
  padding: 5px;
  border-radius: 5px;
  margin: 5px;
  background: green; 
  color: #fff;
  display: block;
}

.edit-tournaments .list-of-games {
  display: flex;
  flex-direction: row;
  width: 500px;
  margin: 0 auto;
}

.edit-tournaments .tournament-img-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.edit-tournaments .tournament-img-container .tournament-img {
  max-width: 175px;
  border-radius: 50%;
  margin: 0 auto;
  border: 5px solid #000;
}
</style>