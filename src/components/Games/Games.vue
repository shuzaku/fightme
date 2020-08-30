<template>
  <div class="games-list">
    <div v-if="games" class="table-wrap">
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="game in games" :key="game._id">
              <td>{{ game.GameTitle }}</td>
              <td align="center">
                <router-link v-bind:to="{ name: 'EditGame', params: { id: game._id } }">Edit</router-link> |
                <a href="#" @click="deleteGame(game._id)">Delete</a>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
    <div v-else>
      There are no games.. Lets add one now <br /><br />
      <router-link v-bind:to="{ name: 'NewGame' }" class="add_post_link">Add Game</router-link>
    </div>
  </div>
</template>

<script>
import GamesService from '@/services/GamesService'

export default {
  name: 'games',
  data () {
    return {
      games: []
    }
  }, 
  mounted () {
    this.getGames()
  },
  methods: {
    async getGames () {
      const response = await GamesService.fetchGames()
      this.games = response.data.games
    },
    async deleteGame (id) {
      await GamesService.deleteGame(id) 
      this.getGames()
    }
  }
}
</script>
<style type="text/css">

.games-list .table-wrap {
  max-width: 450px;
  margin: 50px auto 0;
}

.games-list table th, .games-list table tr {
  text-align: left;
}

.games-list table thead {
  background: #f2f2f2;
}

.games-list table tr td {
  padding: 10px 20px;
}

.games-list table tr:nth-child(odd) {
  background: #f2f2f2;
}

.games-list a.add_post_link {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
}
</style>