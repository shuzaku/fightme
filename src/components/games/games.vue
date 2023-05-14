<!-- @format -->
<template>
    <div class="games">
        <div v-for="game in games" :key="game.id">
            <img :src="game.logoUrl" class="logo-img" />
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';

export default {
    name: 'games',
    props: {},

    data() {
        return {
            games: [],
        };
    },

    methods: {
        async getGames() {
            const response = await GamesService.fetchGames();
            this.games = response.data.games.map((game) => {
                return {
                    id: game._id,
                    title: game.Title,
                    logoUrl: game.LogoUrl,
                };
            });
        },
    },

    mounted() {
        this.getGames();
    },
};
</script>
<style type="text/css">
.games {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}
.games .logo-img {
    width: 100px;
    height: auto;
    border-radius: 50%;
}
</style>
