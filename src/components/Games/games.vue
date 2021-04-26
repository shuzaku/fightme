<!-- @format -->
<template>
    <div class="games">
        <li v-for="game in games" :key="game.id">
            <img :src="game.logoUrl" class="logo-img" />
            {{ game.title }}
        </li>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';

export default {
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
