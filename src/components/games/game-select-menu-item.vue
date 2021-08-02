<!-- @format -->
<template>
    <div :class="[{ opened: isOpen }, 'game-selct-menu-item']">
        <ul v-if="isOpen" class="games">
            <li
                v-for="game in games"
                :key="game.id"
                :class="[{ selected: game.selected }]"
                @click="selectGame(game)"
            >
                {{ game.title }}
            </li>
        </ul>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';

export default {
    name: 'game-select',
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
            selectedItem: null
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
            const response = await GamesService.fetchGames();
            this.games = response.data.games.map(game => {
                return {
                    id: game._id,
                    title: game.Title,
                    logoUrl: game.LogoUrl,
                    selected: false
                };
            });
        },

        selectGame(game) {
            this.games.forEach(game => {
                game.selected = false;
            });
            game.selected = true;
            this.$emit('game-selected', game);
        },

        open() {
            this.isOpen = !this.isOpen;
        }
    }
};
</script>
<style type="text/css">
.game-selct-menu-item .logo-img {
    width: 50px;
    height: auto;
    border-radius: 50%;
}

.game-selct-menu-item li {
    list-style: none;
    font-weight: 400;
    cursor: pointer;
    padding: 10px 10px;
}

.game-selct-menu-item li:hover,
.game-selct-menu-item li.selected {
    background: #565656;
}

.game-selct-menu-item li:last-child {
    margin-bottom: 0px;
}

.game-selct-menu-item .games {
    background: #404040;
}

.game-selct-menu-item .mdi-chevron-down {
    transform: rotate(0deg);
    transition: all 0.3s linear;
}

.game-selct-menu-item.opened .mdi-chevron-down {
    transform: rotate(180deg);
    transition: all 0.3s linear;
}
</style>
