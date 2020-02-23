<template>
  <div class="players">
    <h1>Add Player</h1>
      <div class="form">
        <div>
          <input type="text" name="name" placeholder="PLAYER NAME" v-model="name">
          <input type="text" name="region" placeholder="REGION" v-model="region">
          <label class="typo__label">Simple select / dropdown</label>
            <multiselect 
              v-model="selectedGames" 
              :options="games" 
              :multiple="true" 
              :close-on-select="false" 
              :clear-on-select="false" 
              :preserve-search="true" 
              placeholder="Pick some" 
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
            <ul>
              <li v-for = "game in selectedGames" :key="game._id">
                  {{game.GameTitle}}
              </li>
            </ul>
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
        PlayerGames: this.games
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
.form input, .form textarea {
  width: 500px;
  padding: 10px;
  border: 1px solid #e0dede;
  outline: none;
  font-size: 12px;
}
.form div {
  margin: 20px;
}
.app_post_btn {
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
</style>
