<!-- @format -->
<template>
    <div v-if="game" class="game-bubble" :style="trendingStyle" @click="navigateToGame()"></div>
</template>

<script>
import GamesService from '@/services/games-service';

export default {
    name: 'GameBubble',
    components: {},

    props: {
        gameId: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            game: null
        };
    },
    computed: {
        trendingStyle() {
            return {
                'background-image': `url(${this.game.logoUrl})`,
                'background-size': 'contain',
                'background-repeat': 'no-repeat',
                'background-position': '50%'
            };
        }
    },
    mounted() {
        this.getGame();
    },

    methods: {
        async getGame() {
            const response = await GamesService.getGame({
                id: this.gameId
            });
            this.game = {
                title: response.data.Title,
                logoUrl: response.data.LogoUrl
            };
        },

        navigateToGame() {
            this.$router.push(`/game/${this.gameId}`);
        }
    }
};
</script>

<style>
.game-bubble {
    height: 60px;
    background: #fff;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
    border-radius: 25px;
    margin-top: 20px;
    cursor: pointer;
}
</style>
