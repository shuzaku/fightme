<!-- @format -->
<template>
    <div class="explore-view">
        <h1>Explore Content</h1>
        <div v-if="games" class="game-list">
            <div v-for="game in games" :key="game.id">
                <explore-row :game="game" />
            </div>
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';
import ExploreRow from '@/components/explore/explore-row';

export default {
    name: 'explore',

    components: {
        'explore-row': ExploreRow,
    },

    data() {
        return {
            games: null,
            gameFilter: ['Character', 'Player', 'Tournament'],
        };
    },

    computed: {},

    mounted() {
        this.getGames();
    },

    methods: {
        async getGames() {
            const response = await GamesService.fetchGames();
            this.games = response.data.games.map((game) => {
                return {
                    id: game._id,
                    title: game.Title,
                    logoUrl: game.LogoUrl,
                    coverArt: game.CoverArt,
                    featuredCharacter: game.FeaturedCharacter,
                    newCharacter: game.NewCharacter,
                    featuredPlayer: game.FeaturedPlayer,
                };
            });
        },
    },
};
</script>

<style>
.explore-view {
    padding-top: 30px 30px 0;
    min-width: calc(71vw - 140px);
}

.explore-view .cover-art {
    width: 200px;
    height: 267px;
    background: cover;
    background-repeat: no-repeat;
}

.explore-view .cover-art img {
    width: 100%;
}
</style>
