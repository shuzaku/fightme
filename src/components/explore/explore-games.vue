<!-- @format -->
<template>
    <div class="explore-games">
        <h3>Explore Games</h3>
        <div class="games">
            <div v-for="game in games" :key="game.id" class="game">
                <game-card :game="game" />
            </div>
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';
import GameCard from '@/components/games/game-card';

export default {
    name: 'explore-games',
    components: {
        'game-card': GameCard,
    },

    props: {},

    data() {
        return {
            games: [],
        };
    },
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
            this.games = this.games.reverse();
        },

        navigate(id) {
            this.$router.push(`/game/${id}`);
        },
    },
};
</script>

<style>
.explore-games .cover-art {
    width: 200px;
    height: 266px;
    background: cover;
    background-repeat: no-repeat;
}

.explore-games .cover-art img {
    width: 100%;
}

.explore-games .games {
    display: flex;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
}

.explore-games .game {
    margin: 3px;
}

.explore-games h3 {
    color: #fff;
    margin-bottom: 24px;
}
</style>
