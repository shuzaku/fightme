<!-- @format -->
<template>
    <div ref="videoViewRef" class="games-view">
        <div v-for="game in games" :key="game.id">
            <game-bubble :gameId="game.id" />
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';
import GameBubble from '@/components/games/game-bubble';

export default {
    name: 'Games',

    components: {
        'game-bubble': GameBubble
    },

    data() {
        return {
            games: []
        };
    },

    computed: {},

    watch: {},

    mounted() {
        this.queryGames();
    },

    beforeDestroy() {},

    methods: {
        async queryGames() {
            const response = await GamesService.fetchGames();
            this.games = response.data.games.map(game => {
                return {
                    id: game._id,
                    title: game.Title,
                    logoUrl: game.LogoUrl
                };
            });
        }
    }
};
</script>

<style>
.games-view {
    position: relative;
    justify-content: space-around;
    padding-top: 80px;
    height: 100%;
    overflow: hidden;
}
</style>
