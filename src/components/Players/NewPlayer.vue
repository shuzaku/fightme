<template>
  <div class="players">
    <h1>Add Player</h1>
      <div class="form">
        <div>
          <input type="text" name="name" placeholder="PLAYER NAME" v-model="name">
          <input type="text" name="region" placeholder="REGION" v-model="region">
          <div class="multiselect-container">
            <multiselect 
              v-model="selectedGames" 
              :options="games" 
              :multiple="true" 
              :close-on-select="false" 
              :clear-on-select="false" 
              :preserve-search="true" 
              placeholder="Select Games" 
              label="GameTitle" 
              track-by="GameTitle" 
              :preselect-first="true">
              <template slot="selection" 
                slot-scope="{ values, search, isOpen }">
                <span class="multiselect__single" 
                  v-if="values.length &amp;&amp; !isOpen">
                  Select Games
                </span></template>
            </multiselect>
            <ul class="list-of-games">
              <li v-for = "game in selectedGames" class="player-games" :key="game._id">
                  {{game.GameTitle}}
              </li>
            </ul>
            </div>
        </div>
        <div>
          <button class="app_player_btn" @click="addPlayer">Add</button>
        </div>
      </div>
  </div>
</template>

<script>
import PlayersService from '@/services/PlayersService'
import GamesService from '@/services/GamesService'
import moment from 'moment'

export default {
  name: 'NewPlayer',
  data () {
    return {
      games: [],
      name: '',
      region: '',
      selectedGames: []
    }
  },
  methods: {
    async addPlayer () {
      await PlayersService.addPlayer({
        PlayerName: this.name,
        CreatedDate: this.timestamp,
        UpdatedDate: null,
        PlayerRegion: this.region,
        GamesPlayed: this.selectedGames._id
      })
      this.$router.push({ name: 'Players' })
    },
    async getGames () {
      const response = await GamesService.fetchGames()
      this.games = response.data.games
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
.players .form input, 
.players .form textarea, 
.players .multiselect-container .multiselect {
  width: 500px;
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none;
  font-size: 12px;
  margin: 0 auto;
}

.players .app_post_btn {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
  width: 520px;
  border: none;
  cursor: pointer;
}

.players .multiselect--active .multiselect__tags-wrap {
  display: none
}

.players .multiselect__tags,
.players .multiselect__select {
  margin: 0;
}

.players .player-games {
  list-style: none;
  padding: 5px;
  border-radius: 5px;
  margin: 5px;
  background: green;
  color: #fff;
  display: block;
}

.players .list-of-games {
  display: flex;
  flex-direction: row;
  width: 500px;
  margin: 0 auto;
}
</style>
