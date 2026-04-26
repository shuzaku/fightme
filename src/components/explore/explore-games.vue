<!-- @format -->
<template>
    <div class="explore-games">
        <div class="games games--grid">
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
            var queryParameter = {
                searchQuery: [
                    {
                        queryName: 'IsFeatured',
                        queryValue: true,
                    },
                ],
            };

            const response = await GamesService.queryGames(queryParameter);
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
.explore-games {
    width: 100%;
}

.explore-games .games--grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
    gap: clamp(12px, 2.5vw, 18px);
    width: 100%;
    min-width: 0;
    margin: 0;
    align-items: start;
}

.explore-games .game {
    display: flex;
    min-width: 0;
    max-width: 100%;
    width: 100%;
}

.explore-games h3 {
    color: #fff;
    margin-bottom: 24px;
}

@media (max-width: 600px) {
    .explore-games .games--grid {
        grid-template-columns: 1fr;
    }
}
</style>
