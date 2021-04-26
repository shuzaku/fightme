<<<<<<< HEAD
<template>
  <div class="games">
      <li v-for="game in games" :key="game.id">
          <img :src="game.logoUrl" class="logo-img"/>
          {{game.title}}
      </li>
  </div>
=======
<!-- @format -->
<template>
    <div class="games">
        <li v-for="game in games" :key="game.id">
            <img :src="game.logoUrl" class="logo-img" />
            {{ game.title }}
        </li>
    </div>
>>>>>>> e60d4b570a6f2e2278e800370f4053bc60efd7f3
</template>

<script>
import GamesService from '@/services/games-service';

export default {
<<<<<<< HEAD
  name: 'games',
  props: {
  },

  data () {
    return {
      games: [],
    }
  },

  methods: {
    async getGames () {
      const response = await GamesService.fetchGames()
      this.games = response.data.games.map(game => {
        return {
            id: game._id,
            title: game.Title,
            logoUrl: game.LogoUrl
        }
      })
    },
  },

  mounted () {    
      this.getGames();
  },
}
</script>
<style type="text/css">
.games .logo-img{
  width: 50px;
  height: auto;
  border-radius: 50%;
}
</style>
=======
    name: 'games',
    props: {},

    data() {
        return {
            games: []
        };
    },

    methods: {
        async getGames() {
            const response = await GamesService.fetchGames();
            this.games = response.data.games.map(game => {
                return {
                    id: game._id,
                    title: game.Title,
                    logoUrl: game.LogoUrl
                };
            });
        }
    },

    mounted() {
        this.getGames();
    }
};
</script>
<style type="text/css">
.games .logo-img {
    width: 50px;
    height: auto;
    border-radius: 50%;
}
</style>
>>>>>>> e60d4b570a6f2e2278e800370f4053bc60efd7f3
