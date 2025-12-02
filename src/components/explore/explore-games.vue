<!-- @format -->
<template>
    <div class="explore-games">
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

.explore-games .games {
    display: flex;
    margin: -12px;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 0;
}

.explore-games .game {
    flex: 0 0 calc((100% - 144px) / 6);
    min-width: 180px;
    max-width: 220px;
}

.explore-games h3 {
    color: #fff;
    margin-bottom: 24px;
}

/* Responsive adjustments */
@media (max-width: 1400px) {
    .explore-games .game {
        flex: 0 0 calc((100% - 120px) / 5);
    }
}

@media (max-width: 1200px) {
    .explore-games .game {
        flex: 0 0 calc((100% - 96px) / 4);
    }
}

@media (max-width: 768px) {
    .explore-games .game {
        flex: 0 0 calc((100% - 72px) / 3);
    }
}

@media (max-width: 480px) {
    .explore-games .game {
        flex: 0 0 calc((100% - 48px) / 2);
    }
}

/* Mobile Responsive */
.mobile .explore-games .games {
    justify-content: center;
}

.mobile .explore-games .game {
    max-width: none;
}
</style>
