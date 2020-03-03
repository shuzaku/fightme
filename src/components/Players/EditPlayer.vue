<template>
  <div class="edit-players">
    <h1>Edit Player</h1>
      <div class="form">
        <div>
          <input type="text" name="name" placeholder="Player Name" v-model="name">
        </div>
        <div>
          <input type="text" name="region" placeholder="Region" v-model="region">
        </div>
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
        <div>
          <button class="app_post_btn" @click="updatePlayer">Update</button>
        </div>
      </div>
  </div>
</template>

<script>
import PlayersService from '@/services/PlayersService'
import moment from 'moment'
import GamesService from '@/services/GamesService'

export default {
  name: 'EditPlayer', 
  data () {
    return {
      name: '',
      region: '',
      description: '',
      createdDate: '',
      updatedDate: '',
      selectedGames: '',
      gameIds: '',
      games: ''
    }
  },
  mounted () {
    this.getGames()
    console.log('getting players...')
    this.getPlayer()

  },
  methods: {
    async getPlayer () {

      return new Promise((resolve, reject) => {
        const response = PlayersService.getPlayer({
          id: this.$route.params.id
        })
          .then(response => {
            this.name = response.data.PlayerName
            this.region = response.data.Region
            this.createdDate = response.data.CreatedDate
            this.selectedGames = response.data.GamesPlayed
            console.log(this.selectedGames)
            let theGames = this.selectedGames.map(function(x) {
              for(let i = 0; i < this.games.length; i++){
                if(this.games[i]._id === x) { 
                  return this.games[i];
                }
              }
            }); 
            resolve();
          })
      })
    },
    async updatePlayer () {
      await PlayersService.updatePlayer({
        id: this.$route.params.id,
        PlayerName: this.name,
        CreatedDate: this.createdDate,
        UpdatedDate: this.timestamp
      })
      this.$router.push({ name: 'Players' })
    },
    async getGames () {
      return new Promise((resolve, reject) => {
        GamesService.fetchGames()
          .then(response => {
            this.games = response.data.games
            resolve();
          })
      })
    },
  },
  computed: {
    timestamp: function() {
      return moment().format()
    }
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
</style>