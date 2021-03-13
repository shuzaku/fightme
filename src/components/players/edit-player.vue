<template>
  <div class="edit-players">
    <h1>Edit Player</h1>
    <v-text-field 
        id="import-image"
        type="text"
        v-model="player.playerImg"
        placeholder="image Url"
        v-if="!player.playerImg" />
    <div class="player-img-container" v-if="player.playerImg">
      <img  :src="player.playerImg" class="player-img"/>
      <v-btn @click="player.playerImg=''">X</v-btn>
    </div>
    <div class="form">
      <div>
        <input type="text" name="name" placeholder="Player Name" v-model="player.name">
      </div>
      <div>
        <input type="text" name="region" placeholder="Region" v-model="player.region">
      </div>
      <!--- game --->
      <game-search 
        v-model="game" 
        :taggable="true"
        @update:game="setGame($event)" />
      <ul class="list-of-games">
        <li v-for = "game in player.selectedGames" class="player-games" :key="game._id">
            {{game.GameTitle}}
        </li>
      </ul>
      <div>
        <button class="app_post_btn" @click="updatePlayer">Update</button>
      </div>
    </div>
  </div>
</template>

<script>
import PlayersService from '@/services/players-service';
import moment from 'moment';
import GameSearch from '@/components/games/game-search';

export default {
  name: 'EditPlayer',

  components:{
      'game-search': GameSearch,
  },

  data () {
    return {
      player: {
        name: null,
        region: null,
        updatedDate: null,
        selectedGames: [],
        playerImg: null
      },
      games: '',
      game: null
    }
  },
  methods: {
    async getPlayer () {
        const response = await PlayersService.getPlayer({
          id: this.$route.params.id
        });
        this.player.name = response.data.PlayerName
        this.player.region = response.data.Region
        this.player.createdDate = response.data.CreatedDate
        this.player.selectedGames= response.data.GamesPlayed 
        this.player.playerImg = response.data.PlayerImg
    },

    async updatePlayer () {
      await PlayersService.updatePlayer({
        id: this.$route.params.id,
        PlayerName: this.player.name,
        Region: this.player.region,
        GamesPlayed: this.player.selectedGames,
        UpdatedDate: this.player.timestamp,
        PlayerImg: this.player.playerImg
      })
      this.$router.push({ name: 'Players' })
    },

    setGame(game) {
      this.player.selectedGames = game;
    }
  },
  
  computed: {
    timestamp: function() {
      return moment().format()
    }
  },

  created() {
    this.getPlayer()
  }
}
</script>
<style type="text/css">
.edit-players {
    max-width: 600px;
    text-align: left;
    margin: 0 auto;
    background: #fff;
    width: 400px;
    border-radius: 10px;
    padding: 20px 60px;
}

.edit-players  .form input, 
.edit-players  .form textarea, 
.edit-players  .multiselect-container .multiselect {
  width: 100%; 
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none; 
  font-size: 12px;
  margin: 0 auto;
}

.edit-players .games-search {
  margin: 0;
}

.edit-players .app_post_btn {
  width: 100%;
}
.edit-players .form div {
  margin: 20px 0;
}

.edit-players .form .multiselect__select {
  margin: 0
}

.edit-players .multiselect--active .multiselect__tags-wrap {
  display: none
}

.edit-players .multiselect__tags,
.edit-players .multiselect__select {
  margin: 0;
}

.edit-players .player-games {
  list-style: none;
  padding: 5px;
  border-radius: 5px;
  margin: 5px;
  background: green; 
  color: #fff;
  display: block;
}

.edit-players .list-of-games {
  display: flex;
  flex-direction: row;
  width: 500px;
  margin: 0 auto;
}

.edit-players .player-img-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.edit-players .player-img-container .player-img {
  max-width: 175px;
  border-radius: 50%;
  margin: 0 auto;
  border: 5px solid #000;
}
</style>