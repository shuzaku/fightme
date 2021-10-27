<!-- @format -->
<template>
    <div :class="[{ opened: isOpen }, 'followed-games']">
        <div class="menu-item" @click="toggleOpen">
            Followed Games
            <v-icon>
                mdi-chevron-down
            </v-icon>
        </div>

        <div v-if="isOpen" class="games">
            <div v-for="game in games" :key="game.id">
                {{ game.title }}
            </div>
        </div>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';

export default {
    name: 'followed-games',
    props: {
        initialOpen: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            games: [],
            isOpen: false,
            isLoading: false
        };
    },

    computed: {
        componentStyle() {
            return '[{opened: }]';
        }
    },

    mounted() {
        this.getGames();
        this.isOpen = this.initialOpen;
    },

    methods: {
        async getGames() {
            this.isLoading = true;
            const response = await GamesService.fetchGames();
            this.games = response.data.games.map(game => {
                return {
                    id: game._id,
                    title: game.Title
                };
            });
            this.isLoading = false;
        },

        toggleOpen() {
            this.isOpen = !this.isOpen;
        },

        collapse() {
            this.isOpen = false;
        }
    }
};
</script>
<style type="text/css">
.followed-games .mdi-chevron-down {
    transform: rotate(0deg);
    transition: all 0.3s linear;
}

.followed-games.opened .mdi-chevron-down {
    transform: rotate(-90deg);
    transition: all 0.3s linear;
}
</style>
