<template>
  <div class="players-list">
    <div v-if="players" class="table-wrap">
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in players" :key="player._id">
              <td>{{ player.PlayerName }}</td>
              <td align="center">
                <router-link v-bind:to="{ name: 'EditPlayer', params: { id: player._id } }">Edit</router-link> |
                <a href="#" @click="deletePlayer(player._id)">Delete</a>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
    <div v-else>
      There are no players.. Lets add one now <br /><br />
      <router-link v-bind:to="{ name: 'NewPlayer' }" class="add_post_link">Add Player</router-link>
    </div>
  </div>
</template>

<script>
import PlayersService from '@/services/PlayersService'
export default {
  name: 'players',
  data () {
    return {
      players: []
    }
  }, 
  mounted () {
    this.getPlayers()
  },
  methods: {
    async getPlayers () {
      const response = await PlayersService.fetchPlayers()
      this.players = response.data.players
    },
    
    async deletePlayer (id) {
      await PlayersService.deletePlayer(id) 
      this.getPlayers()
    }
  },
  created() {
  }
}
</script>
<style type="text/css">


.players-list .table-wrap {
  max-width: 450px;
  margin: 50px auto 0;
}

.players-list table th, .players-list table tr {
  text-align: left;
}

.players-list table thead {
  background: #f2f2f2;
}

.players-list table tr td {
  padding: 10px 20px;
}

.players-list table tr:nth-child(odd) {
  background: #f2f2f2;
}

.players-list a {
  color: #4d7ef7;
  text-decoration: none;
}

.players-list a.add_post_link {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
}
</style>