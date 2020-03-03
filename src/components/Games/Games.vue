<template>
  <div class="games">
    <h1>Games</h1>
    <div v-if="games" class="table-wrap">
      <div>
        <router-link v-bind:to="{ name: 'NewGame' }" class="">Add Game</router-link>
      </div>
      <table>
        <tr>
          <td>Game Title</td>
          <td width="100" align="center">Action</td>
        </tr>
        <tr v-for="game in games" :key="game._id">
          <td>{{ game.GameTitle }}</td>
          <td align="center">
            <router-link v-bind:to="{ name: 'EditGame', params: { id: game._id } }">Edit</router-link> |
            <a href="#" @click="deleteGame(game._id)">Delete</a>
          </td>
        </tr>
      </table>
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
.table-wrap {
  width: 60%;
  margin: 0 auto;
  text-align: center;
}
table th, table tr {
  text-align: left;
}
table thead {
  background: #f2f2f2;
}
table tr td {
  padding: 10px;
}
table tr:nth-child(odd) {
  background: #f2f2f2;
}
table tr:nth-child(1) {
  background: #4d7ef7;
  color: #fff;
}
a {
  color: #4d7ef7;
  text-decoration: none;
}
a.add_post_link {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
}
</style>